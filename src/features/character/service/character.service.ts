import { characterConfig } from './../../../config/character.config';
import {
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnModuleInit,
} from '@nestjs/common';
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
import { Metadata } from '@grpc/grpc-js';
import { RedisService } from '@root/redis/redis.service';
import { ReceivedExpFailed } from '@root/interface/error.response';
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
  constructor(
    private appLogger: AppLogger,
    private configService: ConfigService,
    private prisma: PrismaService,
    private readonly redis: RedisService,
  ) {
  }

  async onApplicationBootstrap() {
    await this.subscribeToExpEvents();
  }

  async createCharacterProfile(
    context: AppContext,
    payload: CreateCharacterProfileRequest,
  ): Promise<CreateCharacterProfileResponse> {
    this.appLogger.addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('createCharacterProfile')
      .log('Will create character profile');

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
    this.appLogger.log('Did create character profile');
    return newCharacter;
  }

  private async subscribeToExpEvents() {
    const subscriber = this.redis.client.duplicate();

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
  ): Promise<any> {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('receiveCharacterExp')
      .log('Will receiveCharacterExp');

    const metaData = new Metadata();
    metaData.add('traceId', context.traceId);
    const foundUser = await this.prisma.character.findUnique({
      where: { id: payload.userId },
    });

    if (!foundUser) {
      this.appLogger.log('User not found');
      throw new ReceivedExpFailed({ details: 'User not found' });
    }

    const { isLevelUp, redundantExp } = await this.checkLevelUp(
      foundUser.exp,
      payload.expAmount,
      foundUser.nextLevelExp,
    );
    if (isLevelUp) {
      const nextLevelExp = this.getNextLevelExp(foundUser.level + 1);
      await this.prisma.character.update({
        where: { id: payload.userId },
        data: {
          level: foundUser.level + 1,
          exp: redundantExp,
          nextLevelExp,
        },
      });
    }
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

  private getNextLevelExp = (level: number) => {
    const characterConfig =
      this.configService.get<CharacterConfigInterface>('character')!;
    const exponent = 1.1;
    const nextLevelExp = Math.floor(
      characterConfig.DEFAULT_EXP_REQUIRED * level ** exponent,
    );
    return nextLevelExp;
  };

  private async checkLevelUp(
    currentExp: number,
    receiveExp: number,
    nextLevelExp: number,
  ): Promise<{ isLevelUp: boolean; redundantExp: number }> {
    const isLevelUp = currentExp + receiveExp >= nextLevelExp;
    if (isLevelUp) {
      this.appLogger.log('User has leveled up');
    }
    const redundantExp = currentExp + receiveExp - nextLevelExp;
    return { isLevelUp, redundantExp };
  }
}
