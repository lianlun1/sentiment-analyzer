import { Module, DynamicModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEYS } from './config.constants';

@Module({})
export class CustomConfigModule {
  static register(): DynamicModule {
    const variables = Object.values(CONFIG_KEYS);

    const providers = variables.map(variable => ({
      provide: variable,
      useFactory: (configService: ConfigService) => configService.get<string>(variable),
      inject: [ConfigService],
    }));

    return {
      module: CustomConfigModule,
      providers: [
        ...providers,
      ],
      exports: variables,
    };
  }
}
