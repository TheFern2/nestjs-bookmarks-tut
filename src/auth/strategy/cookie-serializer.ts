import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class CookieSerializer extends PassportSerializer {
  constructor(private prisma: PrismaService) {
    super();
  }

  // (err: any, id?: any)
  serializeUser(user: User, done: (err: any, user: User) => void): void {
    console.log('Serialize');
    delete user.hash;
    done(null, user);
  }

  async deserializeUser(
    user: User,
    done: (err: any, user: User) => void,
  ): Promise<void> {
    console.log('DeSerialize');

    const userFound = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    delete userFound.hash;

    return userFound ? done(null, userFound) : done(null, null);
  }
}
