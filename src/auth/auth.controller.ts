import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Session as GetSession,
  Get,
  UnauthorizedException,
  UseGuards,
  Req,
  SetMetadata,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { ApiBasicAuth, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Session } from 'express-session';
import { LoginGuard, AuthenticatedGuard, RolesGuard } from './guard';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Role } from '@prisma/client';
import { Roles } from './decorator';

type UserSession = Session & Record<'user', any>;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: AuthDto, @GetSession() session: UserSession) {
    //console.log({ dto });
    return this.authService.signup(dto, session);
  }

  @UseGuards(LoginGuard)
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signin(@Body() dto: AuthDto, @GetSession() session: UserSession) {
    console.log('Inside auth.controller.signin');
    return this.authService.signin(dto, session);
  }

  @Post('logout')
  logout(@Req() req: Request) {
    req.logout();
    return 'User logged out successfully';
  }

  @Get('touch')
  touch(@GetSession() session: UserSession) {
    session.touch();
  }

  @Get('user-route')
  //@SetMetadata('roles', [Role.USER])
  @Roles(Role.USER)
  @UseGuards(RolesGuard)
  @UseGuards(AuthenticatedGuard)
  test_user() {
    return 'User has access here';
  }

  @Roles(Role.ADMIN)
  @UseGuards(RolesGuard)
  @UseGuards(AuthenticatedGuard)
  @Get('admin-route')
  admin_user() {
    return 'Admin has access here';
  }

  @UseGuards(AuthenticatedGuard)
  @Get('me')
  getMe(@Req() req: Request) {
    //console.log(session);
    //if (!session.user) throw new UnauthorizedException('Not authenticated');
    return req.user;
  }
}
