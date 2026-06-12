import { Module } from '@nestjs/common';
import { EstablishmentsService } from './establishments.service.js';
import { EstablishmentsController } from './establishments.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  controllers: [EstablishmentsController],
  providers: [EstablishmentsService],
})
export class EstablishmentsModule {}
