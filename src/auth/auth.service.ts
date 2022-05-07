import { ForbiddenException, Injectable, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Session } from 'express-session';
import { Session as GetSession } from '@nestjs/common';
import { Role } from '@prisma/client';
import passport from 'passport';
import { AuthGuard } from '@nestjs/passport';

type UserSession = Session & Record<'user', any>;

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private config: ConfigService) {}

  async signup(dto: AuthDto, @GetSession() session: UserSession) {
    console.log('Signup');

    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    // if user does exist throw exception
    if (user) throw new ForbiddenException('User exists already');

    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
          roles: [Role.USER],
        },
      });

      //return this.signToken(user.id, user.email);

      /*session.user = {
        email: dto.email,
        roles: [Role.USER],
      };*/
      return 'User signed up successfully';
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw e;
    }
  }

  async signin(dto: AuthDto, @GetSession() session: UserSession) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    // if user does not exist throw exception
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    // if password incorrect throw exception
    const pwMatches = await argon.verify(user.hash, dto.password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');

    //return this.signToken(user.id, user.email);
    // session.user = {
    //   email: dto.email,
    //   roles: user.roles,
    // };

    return 'User signed in successfully';
  }

  // async signToken(
  //   userId: number,
  //   email: string,
  // ): Promise<{ access_token: string }> {
  //   const payload = {
  //     sub: userId,
  //     email,
  //   };
  //
  //   const secret = this.config.get('JWT_SECRET');
  //   const token = await this.jwt.signAsync(payload, {
  //     expiresIn: '15m',
  //     secret: secret,
  //   });
  //
  //   return {
  //     access_token: token,
  //   };
  // }
}
