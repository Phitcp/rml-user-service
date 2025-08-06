// config/config.module.ts
import { ConfigModule } from '@nestjs/config';
import { databaseConfig } from './database.config';
import { Module } from '@nestjs/common';
import { appConfig } from './app.config';
import { envValidationSchema } from './env.validation';
import { characterConfig } from './character.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: envValidationSchema,
      load: [databaseConfig, appConfig, characterConfig],
    }),
  ],
  exports: [ConfigModule],
})
export class AppConfigModule {}
