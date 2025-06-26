import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '@root/schemas/user.schema';
import { UserRepository } from '@root/repositories/user.repository';
import { AppLogger } from '@shared/logger';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '@app/config/config.module';
import { ConfigService } from '@nestjs/config';
import { JwtGuard } from '@shared/guard/jwt-auth.guard';
import { PlaceHolderController } from './controller/place-holder.controller';
import { PlaceHolderService } from './service/place-holder.service';
import { RbacClient } from '@shared/utilities/rbac-client';
@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwt = configService.get('jwt');
        return {
          secret: jwt.jwtSecret,
          signOptions: {
            expiresIn: jwt.expiresIn,
          },
        };
      },
    }),
  ],
  controllers: [PlaceHolderController],
  providers: [
    UserRepository,
    AppLogger,
    JwtGuard,
    PlaceHolderService,
    RbacClient,
  ],
})
export class PlaceHolderModule {}
