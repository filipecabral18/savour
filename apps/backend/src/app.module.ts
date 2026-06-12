import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { EstablishmentsModule } from './establishments/establishments.module.js';

@Module({
  imports: [DatabaseModule, EstablishmentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
