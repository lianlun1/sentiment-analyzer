import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, timeout, TimeoutError } from 'rxjs';
import { CONFIG_KEYS } from '../config/config.constants';
import { SentimentLabel, SentimentMap } from './sentiment.enum';

@Injectable()
export class AnalyzeService {
  private readonly requestTimeout: number;
  private readonly logger = new Logger(AnalyzeService.name);

  constructor(
    private readonly httpService: HttpService,
    @Inject(CONFIG_KEYS.HUGGING_FACE_API_URL) private readonly huggingFaceApiUrl: string,
    @Inject(CONFIG_KEYS.HUGGING_FACE_API_KEY) private readonly huggingFaceApiKey: string,
    @Inject(CONFIG_KEYS.REQUEST_TIMEOUT) requestTimeout: string,
  ) {
    this.requestTimeout = Number(requestTimeout);
  }

  async analyzeSentiment(text: string): Promise<string> {
    const headers = {
      Authorization: `Bearer ${this.huggingFaceApiKey}`,
    };

    this.logger.log(`Analyzing sentiment for text: "${text}"`);

    try {
      const response = await firstValueFrom(
        this.httpService.post(this.huggingFaceApiUrl, { inputs: text }, { headers }).pipe(
          timeout(this.requestTimeout)
        )
      );

      const results = response.data[0];

      const highestScoreLabel = results.reduce((prev: { score: number; }, current: { score: number; }) => {
        return (prev.score > current.score) ? prev : current;
      });

      const sentiment = SentimentMap[highestScoreLabel.label as SentimentLabel] || SentimentMap[SentimentLabel.UNKNOWN];
      this.logger.log(`Sentiment analysis result: ${sentiment}`);
      return sentiment;
    } catch (error) {
      this.logger.error(`Error analyzing sentiment: ${error.message}`, error.stack);

      if (error instanceof TimeoutError) {
        throw new HttpException('Request timed out', HttpStatus.REQUEST_TIMEOUT);
      } else if (error.response) {
        throw new HttpException(`Error from Hugging Face API: ${error.response.data}`, HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException(`An unexpected error occurred: ${error}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}
