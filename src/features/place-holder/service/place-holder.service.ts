import { Injectable } from '@nestjs/common';
import { PlaceHolderRequestDto } from '../dto/request.dto';
import { AppContext } from '@shared/decorators/context.decorator';
import { AppLogger } from '@root/shared-libs/logger';
import { basename } from 'path';

@Injectable()
export class PlaceHolderService {
  constructor(private appLogger: AppLogger) {}
  placeHolderMethod(context: AppContext, data: PlaceHolderRequestDto): string {
    this.appLogger
      .addLogContext(context.traceId)
      .addMsgParam(basename(__filename))
      .addMsgParam('placeHolderMethod');
    console.log(data);
    this.appLogger.log('Will placeHolderMethod');
    return 'Hello';
  }
}
