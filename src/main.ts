import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';
import IoRedis from 'ioredis';
import * as passport from 'passport';

const RedisStore = connectRedis(session);
const redisClient = new IoRedis('redis://localhost:6479');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: 'super-secret',
      resave: true,
      saveUninitialized: false,
      rolling: true,
      cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 5, // expiration date = 5 min
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // const config = new DocumentBuilder()
  //   .setTitle('Bookmarks API')
  //   .setDescription('The bookmarks API description')
  //   .setVersion('1.0.0')
  //   .addTag('bookmarks')
  //   .addBearerAuth()
  //   .build();
  //
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  await app.listen(3000);
}

bootstrap();
