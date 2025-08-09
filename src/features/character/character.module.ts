// app.module.ts (API Gateway)
import { Module } from '@nestjs/common';
import { CharacterController } from './controller/character.controller';
import { CharacterService } from './service/character.service';

import { AppLogger } from '@shared/logger';
import { PrismaService } from '@root/prisma/prisma.service';
import { RedisService } from '@root/redis/redis.service';

@Module({
  controllers: [CharacterController],
  providers: [
    AppLogger,
    CharacterService,
    PrismaService,
    RedisService,
  ],
})
export class CharacterModule {}
