import { Controller, Get } from '@nestjs/common';

@Controller('status')
export class StatusController {
  @Get()
  getStatus() {
    const cpuUsage = process.cpuUsage();
    const memoryUsage = process.memoryUsage();
    return {
      cpu: cpuUsage,
      memory: memoryUsage,
    };
  }
}
