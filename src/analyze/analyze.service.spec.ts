import { Test, TestingModule } from '@nestjs/testing';
import { AnalyzeService } from './analyze.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CONFIG_KEYS } from '../config/config.constants';
import { SentimentLabel, SentimentMap } from './sentiment.enum';

describe('AnalyzeService', () => {
  let service: AnalyzeService;
  let httpService: HttpService;

  const mockHttpService = {
    post: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case CONFIG_KEYS.HUGGING_FACE_API_URL:
          return 'http://mock-url.com';
        case CONFIG_KEYS.HUGGING_FACE_API_KEY:
          return 'mock-api-key';
        case CONFIG_KEYS.REQUEST_TIMEOUT:
          return '30000';
        default:
          return null;
      }
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyzeService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: 'HUGGING_FACE_API_URL',
          useValue: mockConfigService.get(CONFIG_KEYS.HUGGING_FACE_API_URL),
        },
        {
          provide: 'HUGGING_FACE_API_KEY',
          useValue: mockConfigService.get(CONFIG_KEYS.HUGGING_FACE_API_KEY),
        },
        {
          provide: 'REQUEST_TIMEOUT',
          useValue: Number(mockConfigService.get(CONFIG_KEYS.REQUEST_TIMEOUT)),
        },
      ],
    }).compile();

    service = module.get<AnalyzeService>(AnalyzeService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return positive sentiment', async () => {
    const mockResponse = {
      data: [
        [
          { score: 0.3, label: SentimentLabel.POSITIVE },
          { score: 0.2, label: SentimentLabel.NEUTRAL },
          { score: 0.1, label: SentimentLabel.NEGATIVE },
        ],
      ],
    };

    mockHttpService.post.mockReturnValue(of(mockResponse));

    const result = await service.analyzeSentiment('Тестовый текст');
    expect(result).toBe(SentimentMap[SentimentLabel.POSITIVE]);
  });

  it('should return negative sentiment', async () => {
    const mockResponse = {
      data: [
        [
          { score: 0.5, label: SentimentLabel.NEGATIVE },
          { score: 0.3, label: SentimentLabel.POSITIVE },
          { score: 0.2, label: SentimentLabel.NEUTRAL },
        ],
      ],
    };

    mockHttpService.post.mockReturnValue(of(mockResponse));

    const result = await service.analyzeSentiment('Тестовый текст');
    expect(result).toBe(SentimentMap[SentimentLabel.NEGATIVE]);
  });

  it('should return unknown sentiment for unknown label', async () => {
    const mockResponse = {
      data: [
        [
          { score: 0.5, label: 'UNKNOWN_LABEL' },
        ],
      ],
    };

    mockHttpService.post.mockReturnValue(of(mockResponse));

    const result = await service.analyzeSentiment('Тестовый текст');
    expect(result).toBe(SentimentMap[SentimentLabel.UNKNOWN]);
  });

  it('should throw an error when the API call fails', async () => {
    mockHttpService.post.mockReturnValue(throwError(() => new HttpException('Error from API', HttpStatus.BAD_REQUEST)));

    await expect(service.analyzeSentiment('Тестовый текст')).rejects.toThrow(HttpException);
  });
});