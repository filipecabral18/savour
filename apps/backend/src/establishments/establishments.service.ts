import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { RedisService } from '../database/redis.service.js';
import { randomUUID } from 'crypto';

@Injectable()
export class EstablishmentsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  async checkAvailability(establishmentId: string, dateStr: string, guests: number) {
    if (!guests || guests <= 0) {
      throw new BadRequestException('Guests count must be greater than zero');
    }

    const requestedDate = new Date(dateStr);
    if (isNaN(requestedDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // 1. Fetch establishment
    const establishment = await this.databaseService.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    const { capacity, turnoverTime } = establishment;

    // 2. Calculate overlap dates
    const startLimit = new Date(requestedDate.getTime() - turnoverTime * 60 * 1000);
    const endLimit = new Date(requestedDate.getTime() + turnoverTime * 60 * 1000);

    // 3. Query overlapping reservations
    const overlappingReservations = await this.databaseService.reservation.findMany({
      where: {
        establishmentId,
        status: { not: 'CANCELLED' },
        date: {
          gt: startLimit,
          lt: endLimit,
        },
      },
    });

    // 4. Sum up reserved seats
    const reservedSeats = overlappingReservations.reduce((sum, res) => sum + res.guests, 0);

    // 5. Evaluate availability
    const remainingCapacity = capacity - reservedSeats;
    const available = remainingCapacity >= guests;

    return {
      available,
      maxCapacity: capacity,
      reservedSeats,
      remainingCapacity,
    };
  }

  async createReservation(
    establishmentId: string,
    dateStr: string,
    guests: number,
    name: string,
    contact: string,
  ) {
    if (!guests || guests <= 0) {
      throw new BadRequestException('Guests count must be greater than zero');
    }

    if (!name || name.trim() === '') {
      throw new BadRequestException('Customer name is required');
    }

    if (!contact || contact.trim() === '') {
      throw new BadRequestException('Customer contact is required');
    }

    const requestedDate = new Date(dateStr);
    if (isNaN(requestedDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // Run transaction with pessimistic locking (FOR UPDATE)
    return this.databaseService.$transaction(async (tx) => {
      // 1. Lock the establishment to prevent concurrent double-booking
      const establishments = await tx.$queryRaw<any[]>`
        SELECT id, capacity, "turnoverTime" FROM "Establishment" WHERE id = ${establishmentId} FOR UPDATE
      `;

      if (!establishments || establishments.length === 0) {
        throw new NotFoundException('Establishment not found');
      }

      const establishment = establishments[0];
      const { capacity, turnoverTime } = establishment;

      // 2. Query overlapping reservations
      const startLimit = new Date(requestedDate.getTime() - turnoverTime * 60 * 1000);
      const endLimit = new Date(requestedDate.getTime() + turnoverTime * 60 * 1000);

      const overlappingReservations = await tx.reservation.findMany({
        where: {
          establishmentId,
          status: { not: 'CANCELLED' },
          date: {
            gt: startLimit,
            lt: endLimit,
          },
        },
      });

      // 3. Sum up reserved seats
      const reservedSeats = overlappingReservations.reduce((sum, res) => sum + res.guests, 0);
      const remainingCapacity = capacity - reservedSeats;

      if (remainingCapacity < guests) {
        throw new BadRequestException('No availability for the requested group size at this time');
      }

      // 4. Persist reservation
      const reservation = await tx.reservation.create({
        data: {
          establishmentId,
          date: requestedDate,
          guests,
          name,
          contact,
          status: 'CONFIRMED',
        },
      });

      return reservation;
    });
  }

  async getAlternativeSlots(establishmentId: string, dateStr: string, guests: number) {
    if (!guests || guests <= 0) {
      throw new BadRequestException('Guests count must be greater than zero');
    }

    const requestedDate = new Date(dateStr);
    if (isNaN(requestedDate.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    // 1. Fetch establishment
    const establishment = await this.databaseService.establishment.findUnique({
      where: { id: establishmentId },
    });

    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    const { capacity, turnoverTime } = establishment;

    // Extract base date part (YYYY-MM-DD)
    const baseDate = dateStr.split('T')[0];

    // Define standard dinner slots for the B2C experience
    const timeOptions = [
      '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30'
    ];

    // Calculate overall time limits to query database once
    const earliestTimeStr = `${baseDate}T${timeOptions[0]}:00`;
    const latestTimeStr = `${baseDate}T${timeOptions[timeOptions.length - 1]}:00`;

    const earliestDate = new Date(earliestTimeStr);
    const latestDate = new Date(latestTimeStr);

    const queryStartLimit = new Date(earliestDate.getTime() - turnoverTime * 60 * 1000);
    const queryEndLimit = new Date(latestDate.getTime() + turnoverTime * 60 * 1000);

    // 2. Fetch all reservations that can overlap with any of these slots
    const reservations = await this.databaseService.reservation.findMany({
      where: {
        establishmentId,
        status: { not: 'CANCELLED' },
        date: {
          gt: queryStartLimit,
          lt: queryEndLimit,
        },
      },
    });

    const alternatives: Array<{ time: string; remainingCapacity: number }> = [];

    // 3. Evaluate each slot in memory
    for (const timeOption of timeOptions) {
      const slotDate = new Date(`${baseDate}T${timeOption}:00`);

      // Exclude the exact slot that the user originally requested
      if (slotDate.getTime() === requestedDate.getTime()) {
        continue;
      }

      const slotStart = new Date(slotDate.getTime() - turnoverTime * 60 * 1000);
      const slotEnd = new Date(slotDate.getTime() + turnoverTime * 60 * 1000);

      const overlapping = reservations.filter((res) => {
        const resTime = res.date.getTime();
        return resTime > slotStart.getTime() && resTime < slotEnd.getTime();
      });

      const reservedSeats = overlapping.reduce((sum, res) => sum + res.guests, 0);
      const remainingCapacity = capacity - reservedSeats;

      if (remainingCapacity >= guests) {
        alternatives.push({
          time: timeOption,
          remainingCapacity,
        });
      }
    }

    return alternatives;
  }

  async addToWaitlist(establishmentId: string, guests: number, name: string, contact: string) {
    if (!guests || guests <= 0) {
      throw new BadRequestException('Guests count must be greater than zero');
    }
    if (!name || name.trim() === '') {
      throw new BadRequestException('Customer name is required');
    }
    if (!contact || contact.trim() === '') {
      throw new BadRequestException('Customer contact is required');
    }

    // Verify establishment exists in PG
    const establishment = await this.databaseService.establishment.findUnique({
      where: { id: establishmentId },
    });
    if (!establishment) {
      throw new NotFoundException('Establishment not found');
    }

    const entryId = randomUUID();

    // Store details in Hash
    await this.redisService.client.hset(`waitlist-entry:${entryId}`, {
      id: entryId,
      establishmentId,
      name,
      contact,
      guests: guests.toString(),
      status: 'WAITING',
      createdAt: new Date().toISOString(),
    });

    // Add to Sorted Set
    await this.redisService.client.zadd(`waitlist:${establishmentId}`, Date.now(), entryId);

    // Get position
    const rank = await this.redisService.client.zrank(`waitlist:${establishmentId}`, entryId);
    const position = rank !== null ? rank + 1 : 1;

    return {
      id: entryId,
      position,
      status: 'WAITING',
    };
  }

  async getWaitlistStatus(establishmentId: string, entryId: string) {
    // Fetch details
    const entry = await this.redisService.client.hgetall(`waitlist-entry:${entryId}`);
    if (!entry || Object.keys(entry).length === 0) {
      throw new NotFoundException('Waitlist entry not found');
    }

    let position = 0;
    if (entry.status === 'WAITING') {
      const rank = await this.redisService.client.zrank(`waitlist:${establishmentId}`, entryId);
      position = rank !== null ? rank + 1 : 1;
    }

    // Fetch establishment turnoverTime
    const establishment = await this.databaseService.establishment.findUnique({
      where: { id: establishmentId },
      select: { turnoverTime: true },
    });
    const turnoverTime = establishment?.turnoverTime || 120;
    
    // Simple estimated wait time: position * 15 minutes (using turnoverTime / 8)
    const estimatedWaitTime = position * Math.round(turnoverTime / 8);

    return {
      id: entryId,
      status: entry.status,
      position,
      estimatedWaitTime,
      name: entry.name,
      contact: entry.contact,
      guests: parseInt(entry.guests, 10),
    };
  }

  async removeFromWaitlist(establishmentId: string, entryId: string) {
    const entry = await this.redisService.client.hgetall(`waitlist-entry:${entryId}`);
    if (!entry || Object.keys(entry).length === 0) {
      throw new NotFoundException('Waitlist entry not found');
    }

    // Remove from both sets
    await this.redisService.client.zrem(`waitlist:${establishmentId}`, entryId);
    await this.redisService.client.zrem(`waitlist-called:${establishmentId}`, entryId);
    
    // Delete entry hash
    await this.redisService.client.del(`waitlist-entry:${entryId}`);

    return { success: true };
  }

  async checkInWaitlist(establishmentId: string, entryId: string) {
    const entry = await this.redisService.client.hgetall(`waitlist-entry:${entryId}`);
    if (!entry || Object.keys(entry).length === 0) {
      throw new NotFoundException('Waitlist entry not found');
    }

    // Check-in simply clears the customer from the waitlist
    await this.redisService.client.zrem(`waitlist:${establishmentId}`, entryId);
    await this.redisService.client.zrem(`waitlist-called:${establishmentId}`, entryId);
    await this.redisService.client.del(`waitlist-entry:${entryId}`);

    return { success: true };
  }

  async callNextInWaitlist(establishmentId: string) {
    // Get first entry in Sorted Set (active waiting queue)
    const nextEntries = await this.redisService.client.zrange(`waitlist:${establishmentId}`, 0, 0);
    if (!nextEntries || nextEntries.length === 0) {
      return { message: 'Waitlist is empty' };
    }

    const entryId = nextEntries[0];

    // Update status to READY
    await this.redisService.client.hset(`waitlist-entry:${entryId}`, 'status', 'READY');

    // Remove from active Sorted Set so rest of the queue shifts up
    await this.redisService.client.zrem(`waitlist:${establishmentId}`, entryId);

    // Add to called Sorted Set
    await this.redisService.client.zadd(`waitlist-called:${establishmentId}`, Date.now(), entryId);

    // Fetch updated entry
    const entry = await this.redisService.client.hgetall(`waitlist-entry:${entryId}`);

    return {
      id: entryId,
      name: entry.name,
      contact: entry.contact,
      status: 'READY',
      guests: parseInt(entry.guests, 10),
    };
  }

  async getWaitlist(establishmentId: string) {
    // 1. Get called entries
    const calledIds = await this.redisService.client.zrange(`waitlist-called:${establishmentId}`, 0, -1);
    
    // 2. Get waiting entries
    const waitingIds = await this.redisService.client.zrange(`waitlist:${establishmentId}`, 0, -1);

    const waitlist: any[] = [];

    // Fetch and map called entries
    for (const entryId of calledIds) {
      const entry = await this.redisService.client.hgetall(`waitlist-entry:${entryId}`);
      if (entry && Object.keys(entry).length > 0) {
        waitlist.push({
          id: entryId,
          name: entry.name,
          contact: entry.contact,
          guests: parseInt(entry.guests, 10),
          status: entry.status,
          position: 0,
          createdAt: entry.createdAt,
        });
      }
    }

    // Fetch and map waiting entries
    let idx = 1;
    for (const entryId of waitingIds) {
      const entry = await this.redisService.client.hgetall(`waitlist-entry:${entryId}`);
      if (entry && Object.keys(entry).length > 0) {
        waitlist.push({
          id: entryId,
          name: entry.name,
          contact: entry.contact,
          guests: parseInt(entry.guests, 10),
          status: entry.status,
          position: idx++,
          createdAt: entry.createdAt,
        });
      }
    }

    return waitlist;
  }

  async getReservations(establishmentId: string, dateStr: string) {
    if (!dateStr) {
      throw new BadRequestException('Date is required');
    }

    const startOfDay = new Date(`${dateStr}T00:00:00`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999`);
    if (isNaN(startOfDay.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    return this.databaseService.reservation.findMany({
      where: {
        establishmentId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });
  }

  async updateReservationStatus(establishmentId: string, reservationId: string, status: string) {
    const validStatuses = ['CONFIRMED', 'CHECKED_IN', 'NO_SHOW', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
    }

    const reservation = await this.databaseService.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation || reservation.establishmentId !== establishmentId) {
      throw new NotFoundException('Reservation not found');
    }

    return this.databaseService.reservation.update({
      where: { id: reservationId },
      data: { status },
    });
  }
}
