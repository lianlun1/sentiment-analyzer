import { Test, TestingModule } from '@nestjs/testing';
import { AnalyzeController } from './analyze.controller';
import { AnalyzeService } from './analyze.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('AnalyzeController', () => {
  let controller: AnalyzeController;
  let service: AnalyzeService;

  const mockAnalyzeService = {
    analyzeSentiment: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyzeController],
      providers: [
        {
          provide: AnalyzeService,
          useValue: mockAnalyzeService,
        },
      ],
    }).compile();

    controller = module.get<AnalyzeController>(AnalyzeController);
    service = module.get<AnalyzeService>(AnalyzeService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should analyze sentiment and return result', async () => {
    const text = 'Тестовый текст';
    const sentiment = 'положительная';

    mockAnalyzeService.analyzeSentiment.mockResolvedValue(sentiment);

    const result = await controller.analyze(text);
    expect(result).toEqual({ sentiment });
    expect(mockAnalyzeService.analyzeSentiment).toHaveBeenCalledWith(text);
  });

  it('should handle errors from the service', async () => {
    const text = 'Тестовый текст';
    const errorMessage = 'Error from API';

    mockAnalyzeService.analyzeSentiment.mockRejectedValue(new HttpException(errorMessage, HttpStatus.BAD_REQUEST));

    await expect(controller.analyze(text)).rejects.toThrow(HttpException);
  });
});
