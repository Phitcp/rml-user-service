import { Inject, Injectable } from '@nestjs/common';
import { AppLogger } from '@shared/logger';
import {
  ReceivedExpFailed,
} from '@root/interface/error.response';
import {
  CreateCharacterProfileResponse,
  CreateCharacterProfileRequest,
} from '@root/interface/character.proto.interface';
import { AppContext } from '@shared/decorator/context.decorator';
import { basename } from 'path';
import { ConfigService } from '@nestjs/config';
import { CharacterConfigInterface } from '@app/config/interfaces/character.interface';
import { PrismaService } from '@root/prisma/prisma.service';
import { GrpcClient } from '@shared/utilities/grpc-client';
import { ExpServiceClient } from '@root/interface/exp.proto.interface';
import { Metadata } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CharacterService {
  private expService: ExpServiceClient;
  constructor(
    private appLogger: AppLogger,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    const grpcClient = new GrpcClient<ExpServiceClient>({
      package: 'exp',
      protoPath: 'src/proto/exp.proto',
      url: '0.0.0.0:4004',
      serviceName: 'ExpService',
    });
    this.expService = grpcClient.getService();
  }
  async createCharacterProfile(
    context: AppContext,
    payload: CreateCharacterProfileRequest,
  ): Promise<CreateCharacterProfileResponse> {
    const characterConfig =
      this.configService.get<CharacterConfigInterface>('character');
    const newCharacterData = {
      id: payload.id,
      characterName: payload.characterName,
      characterTitle: characterConfig?.DEFAULT_CHARACTER_TITLE || '',
    };
    const newCharacter = await this.prisma.character.create({
      data: newCharacterData,
    });
    return newCharacter;
  }

  async receiveExp(
    context: AppContext,
    payload: any,
    // ): Promise<CreateCharacterProfileResponse> {
  ): Promise<any> {
    const metaData = new Metadata();
    metaData.add('traceId', context.traceId);
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('receiveExp')
      .log('Will receiveExp');

    // validate exp resource
    const validResource = await firstValueFrom(
      this.expService.validateExpResource(payload, metaData),
    );
    if (!validResource) {
      this.appLogger.log('Exp Resource is invalid');
      throw new ReceivedExpFailed();
    }

    const newCharacterValue = await this.prisma.character.update({
      where: { id: payload.userId },
      data: {
        exp: {
          increment: validResource.expAmount,
        },
      },
    });
    return newCharacterValue;
  }
}
