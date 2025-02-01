import { Module } from '@nestjs/common';
import { AnalyzeController } from './analyze/analyze.controller';
import { AnalyzeService } from './analyze/analyze.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CustomConfigModule } from './config/config.module';
import { StatusController } from './status/status.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CustomConfigModule.register(),
    HttpModule,
  ],
  controllers: [AnalyzeController, StatusController],
  providers: [AnalyzeService],
})
export class AppModule {}
