// rbac.controller.ts
import { Controller, UseFilters, UseInterceptors } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CharacterService } from '../service/character.service';
import { GrpcLogInterceptor } from '@shared/middlewares/grpc-log.interceptor';
import { GRPCExceptionFilter } from '@shared/exception-filter/grpc-exception-filter';
import {
CreateCharacterProfileRequest,
CreateCharacterProfileResponse
} from '@root/interface/character.proto.interface';
import { getContext } from '@shared/decorator/context.decorator';
import { Metadata } from '@grpc/grpc-js';

@UseInterceptors(GrpcLogInterceptor)
@UseFilters(GRPCExceptionFilter)
@Controller()
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}
  @GrpcMethod('CharacterService', 'CreateCharacterProfile')
  createCharacterProfile(
    data: CreateCharacterProfileRequest,
    metadata: Metadata,
  ): Promise<CreateCharacterProfileResponse> {
    return this.characterService.createCharacterProfile(getContext(metadata), data);
  }
}
