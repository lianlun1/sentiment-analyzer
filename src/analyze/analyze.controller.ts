import { Controller, Post, Body, Get, Logger } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';

@Controller('analyze')
export class AnalyzeController {
  private readonly logger = new Logger(AnalyzeController.name);

  constructor(private readonly analyzeService: AnalyzeService) { }

  @Post()
  async analyze(@Body('text') text: string) {
    const sentiment = await this.analyzeService.analyzeSentiment(text);
    this.logger.log(`Analyzed text: "${text}" - Sentiment: ${sentiment}`);
    return { sentiment };
  }
}
