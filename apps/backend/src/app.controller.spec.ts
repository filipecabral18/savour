import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';

describe('AppController', () => {
  let appController: AppController;
  let databaseService: { $queryRaw: jest.Mock };

  beforeEach(async () => {
    databaseService = { $queryRaw: jest.fn() };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: DatabaseService, useValue: databaseService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getStatus', () => {
    it('should report OK when the database responds', async () => {
      databaseService.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);

      await expect(appController.getStatus()).resolves.toEqual({
        status: 'OK',
        database: 'Connected',
      });
    });

    it('should report ERROR when the database query fails', async () => {
      databaseService.$queryRaw.mockRejectedValue(
        new Error('Connection refused'),
      );

      await expect(appController.getStatus()).resolves.toEqual({
        status: 'ERROR',
        database: 'Connection refused',
      });
    });
  });
});
