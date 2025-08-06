import { ExpService } from './service/exp.service';
// app.module.ts (API Gateway)
import { Module } from '@nestjs/common';

import { AppLogger } from '@shared/logger';
import { PrismaService } from '@root/prisma/prisma.service';
import { ExpController } from './controller/exp.controller';
import { ExpAdminService } from './service/exp-admin.service';

@Module({
  controllers: [ExpController, ExpAdminService],
  providers: [AppLogger, ExpAdminService, PrismaService, ExpService],
})
export class ExpModule {}
