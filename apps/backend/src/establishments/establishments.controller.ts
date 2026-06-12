import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service.js';

@Controller('v1/establishments')
export class EstablishmentsController {
  constructor(private readonly establishmentsService: EstablishmentsService) {}

  @Get(':id/availability')
  async checkAvailability(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('guests', ParseIntPipe) guests: number,
  ) {
    return this.establishmentsService.checkAvailability(id, date, guests);
  }

  @Post(':id/reservations')
  async createReservation(
    @Param('id') id: string,
    @Body() body: { date: string; guests: number; name: string; contact: string },
  ) {
    return this.establishmentsService.createReservation(
      id,
      body.date,
      body.guests,
      body.name,
      body.contact,
    );
  }

  @Get(':id/reservations')
  async getReservations(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    return this.establishmentsService.getReservations(id, date);
  }

  @Patch(':id/reservations/:reservationId/status')
  async updateReservationStatus(
    @Param('id') id: string,
    @Param('reservationId') reservationId: string,
    @Body('status') status: string,
  ) {
    return this.establishmentsService.updateReservationStatus(id, reservationId, status);
  }

  @Get(':id/alternative-slots')
  async getAlternativeSlots(
    @Param('id') id: string,
    @Query('date') date: string,
    @Query('guests', ParseIntPipe) guests: number,
  ) {
    return this.establishmentsService.getAlternativeSlots(id, date, guests);
  }

  @Post(':id/waitlist')
  async addToWaitlist(
    @Param('id') id: string,
    @Body() body: { guests: number; name: string; contact: string },
  ) {
    return this.establishmentsService.addToWaitlist(
      id,
      body.guests,
      body.name,
      body.contact,
    );
  }

  @Get(':id/waitlist')
  async getWaitlist(
    @Param('id') id: string,
  ) {
    return this.establishmentsService.getWaitlist(id);
  }

  @Get(':id/waitlist/:entryId')
  async getWaitlistStatus(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
  ) {
    return this.establishmentsService.getWaitlistStatus(id, entryId);
  }

  @Delete(':id/waitlist/:entryId')
  async removeFromWaitlist(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
  ) {
    return this.establishmentsService.removeFromWaitlist(id, entryId);
  }

  @Post(':id/waitlist/:entryId/check-in')
  async checkInWaitlist(
    @Param('id') id: string,
    @Param('entryId') entryId: string,
  ) {
    return this.establishmentsService.checkInWaitlist(id, entryId);
  }

  @Post(':id/waitlist/call-next')
  async callNextInWaitlist(
    @Param('id') id: string,
  ) {
    return this.establishmentsService.callNextInWaitlist(id);
  }
}
