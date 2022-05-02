import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'fer@mail.com',
      password: 'secret',
    };
    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if body empty', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw if body empty', () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAuth', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get users/me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAuth}',
          })
          .expectStatus(200);
        //.inspect();
      });
    });
    describe('Edit users/', () => {
      it('should edit current user', () => {
        const dto: EditUserDto = {
          firstName: 'Fernando',
          email: 'fern1@mail.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAuth}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
        //.inspect();
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Get empty', () => {
      it('should get zero bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAuth}',
          })
          .expectStatus(200)
          .expectBody([]);
        // .expectHeader('content-length', '0');
        //.inspect();
      });
    });
    describe('Create', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://en.wikipedia.org/wiki/NAND_gate',
      };
      it('should create bookmark', () => {
        return (
          pactum
            .spec()
            .post('/bookmarks')
            .withHeaders({
              Authorization: 'Bearer $S{userAuth}',
            })
            .withBody(dto)
            .expectStatus(201)
            //.inspect()
            .stores('bookmarkId', 'id')
        );
        //.expectBody([]);
      });
    });
    describe('Get', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAuth}',
          })
          .expectStatus(200)
          .expectJsonLength(1);
        // .expectHeader('content-length', '0');
        //.inspect();
      });
    });
    describe('Get by id', () => {
      it('should get bookmark by id', () => {
        return (
          pactum
            .spec()
            .get('/bookmarks/{id}')
            .withPathParams('id', '$S{bookmarkId}')
            .withHeaders({
              Authorization: 'Bearer $S{userAuth}',
            })
            .expectStatus(200)
            //.inspect()
            .expectBodyContains('$S{bookmarkId}')
        );
        // .expectJsonLength(1);
        // .expectHeader('content-length', '0');
      });
    });
    describe('Edit by id', () => {
      const dto: EditBookmarkDto = {
        title: 'Some youtube video',
        description: 'this is an awesome video',
      };
      it('should edit bookmark by id', () => {
        return pactum
          .spec()
          .patch('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAuth}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
        // .expectJsonLength(1);
        // .expectHeader('content-length', '0');
      });
    });
    describe('Delete', () => {
      it('should delete bookmark by id', () => {
        return pactum
          .spec()
          .delete('/bookmarks/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAuth}',
          })
          .expectStatus(204);
        // .expectJsonLength(1);
        // .expectHeader('content-length', '0');
      });

      it('should get zero bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAuth}',
          })
          .expectStatus(200)
          .expectBody([]);
      });
    });
  });
});
