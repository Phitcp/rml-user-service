import { ExpService } from './service/exp.service';
import { Module } from '@nestjs/common';
import { AppLogger } from '@shared/logger';
import { PrismaService } from '@root/prisma/prisma.service';
import { ExpController } from './controller/exp.controller';
import { ExpAdminService } from './service/exp-admin.service';
import { RedisService } from '@root/redis/redis.service';

@Module({
  controllers: [ExpController],
  providers: [
    AppLogger,
    ExpAdminService,
    PrismaService,
    ExpService,
    RedisService
  ],
})
export class ExpModule {}
