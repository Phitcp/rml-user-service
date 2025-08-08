// app.module.ts (API Gateway)
import { Module } from '@nestjs/common';
import { CharacterController } from './controller/character.controller';
import { CharacterService } from './service/character.service';

import { AppLogger } from '@shared/logger';
import { PrismaService } from '@root/prisma/prisma.service';
import Redis from 'ioredis';

@Module({
  controllers: [CharacterController],
  providers: [
    AppLogger,
    CharacterService,
    PrismaService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        return new Redis({
          host: '127.0.0.1',
          port: 6379,
        });
      },
    },
  ],
})
export class CharacterModule {}
