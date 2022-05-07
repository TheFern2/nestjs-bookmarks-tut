import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CookieSerializer, LocalStrategy } from './strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, CookieSerializer],
})
export class AuthModule {}
