import { Inject, Injectable, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '@shared/logger';
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
import Redis from 'ioredis';

export class ExpClaimedEvent {
  constructor(
    public readonly userId: string,
    public readonly expAmount: number,
    public readonly expResourceId: string,
    public readonly metadata?: any,
  ) {}
}
@Injectable()
export class CharacterService implements OnApplicationBootstrap {
  private expService: ExpServiceClient;
  constructor(
    private appLogger: AppLogger,
    private configService: ConfigService,
    private prisma: PrismaService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {
    const grpcClient = new GrpcClient<ExpServiceClient>({
      package: 'exp',
      protoPath: 'src/proto/exp.proto',
      url: '0.0.0.0:4004',
      serviceName: 'ExpService',
    });
    this.expService = grpcClient.getService();
  }

 async onApplicationBootstrap() {
    await this.subscribeToExpEvents();
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

  private async subscribeToExpEvents() {
    const subscriber = this.redis.duplicate();
    
    await subscriber.subscribe('exp.claimed');
    
    subscriber.on('message', async (channel, message) => {
      if (channel === 'exp.claimed') {
        const { context, payload } = JSON.parse(message);
        await this.receiveCharacterExp(context, payload);
      }
    });
  }

  async receiveCharacterExp(
    context: AppContext,
    payload: ExpClaimedEvent,
    // ): Promise<CreateCharacterProfileResponse> {
  ): Promise<any> {
    const metaData = new Metadata();
    metaData.add('traceId', context.traceId);
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('receiveCharacterExp')
      .log('Will receiveCharacterExp');

    const newCharacterValue = await this.prisma.character.update({
      where: { id: payload.userId },
      data: {
        exp: {
          increment: payload.expAmount,
        },
      },
    });
    return newCharacterValue;
  }
}
