import { Controller, Body, HttpStatus, Get, UseGuards } from '@nestjs/common';
import { PlaceHolderService } from '@feature/place-holder/service/place-holder.service';
import { PlaceHolderRequestDto } from '@root/features/place-holder/dto/request.dto';
import { PlaceHolderResponseDto } from '@root/features/place-holder/dto/response.dto';
import { AppContext, Context } from '@shared/decorators/context.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '@shared/guard/role.guard';
import { Roles } from '@shared/decorators/roles.decorator';
import { JwtGuard } from '@shared/guard/jwt-auth.guard';

@ApiTags('Place Holder')
@Controller('test')
export class PlaceHolderController {
  constructor(private readonly PlaceHolderService: PlaceHolderService) {}
  @ApiOperation({ summary: 'Public route' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Place holder successfully',
    type: PlaceHolderResponseDto,
  })
  @ApiBody({
    description: 'Place holder description',
    type: PlaceHolderRequestDto,
    required: true,
  })
  @Get('/public-route')
  public(
    @Body() registerDto: PlaceHolderRequestDto,
    @Context() context: AppContext,
  ) {
    return this.PlaceHolderService.placeHolderMethod(context, registerDto);
  }

  @ApiOperation({ summary: 'Private route' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Place holder successfully',
    type: PlaceHolderResponseDto,
  })
  @ApiBody({
    description: 'Place holder description',
    type: PlaceHolderRequestDto,
    required: true,
  })
  @UseGuards(RolesGuard)
  @UseGuards(JwtGuard)
  @Roles('user', ['read:own', 'read:all'])
  @Get('/private-route')
  privateRoute(
    @Body() registerDto: PlaceHolderRequestDto,
    @Context() context: AppContext,
  ) {
    return this.PlaceHolderService.placeHolderMethod(context, registerDto);
  }
}
