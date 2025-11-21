import { Test, TestingModule } from '@nestjs/testing';
import { BoardingController } from './boarding.controller';
import { BoardingService } from './boarding.service';

describe('BoardingController', () => {
  let controller: BoardingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardingController],
      providers: [BoardingService],
    }).compile();

    controller = module.get<BoardingController>(BoardingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
