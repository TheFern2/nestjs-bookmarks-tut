import { PrismaService } from '../../prisma/prisma.service';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as argon from 'argon2';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    console.log('Inside LocalStrategy.validate');

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const pwMatches = await argon.verify(user.hash, password);
    if (!pwMatches) throw new ForbiddenException('Credentials incorrect');
    
    return user;
  }
}
