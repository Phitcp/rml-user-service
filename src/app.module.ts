import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppLogger } from './shared-libs/logger';
import { ConfigService } from '@nestjs/config';
import { AppConfigModule } from './config/config.module';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';
import { CharacterModule } from './features/character/character.module';
import { ExpModule } from './features/exp/exp.module';
import { RedisModule } from './redis/redis.module';
@Module({
  imports: [
    CharacterModule,
    AppConfigModule,
    ExpModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    AppLogger,
    ConfigService,
    GrpcLogInterceptor,
  ],
  exports: [AppLogger],
})
export class AppModule {}
