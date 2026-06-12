import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Injectable()
export class AppService {
  constructor(private readonly databaseService: DatabaseService) {}

  async getStatus() {
    try {
      await this.databaseService.$queryRaw`SELECT 1`;
      return { status: 'OK', database: 'Connected' };
    } catch (error: any) {
      return { status: 'ERROR', database: error.message || 'Disconnected' };
    }
  }
}

