import { HttpException, HttpStatus } from '@nestjs/common';

export class PlaceHolderError extends HttpException {
  constructor(msg = 'Failed', code = HttpStatus.BAD_REQUEST) {
    super(msg, code);
  }
}
