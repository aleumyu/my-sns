import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module';
import { FollowModule } from './follow/follow.module';
import { ProfilesModule } from './profiles/profiles.module';
import { PostsModule } from './posts/posts.module';
import { LikesModule } from './likes/likes.module';
import authConfig from './config/authConfig';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    // CacheModule.register({
    //   isGlobal: true,
    //   ttl: 5000,
    //   // max: 1000,
    // }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: 'localhost',
      port: 6379,
    }),
    UsersModule,
    PrismaModule,
    AuthModule,
    ConfigModule.forRoot({
      envFilePath: [`${__dirname}/.env`],
      load: [authConfig],
      isGlobal: true,
    }),
    FollowModule,
    ProfilesModule,
    PostsModule,
    LikesModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AppService,
    AuthService,
  ],
})
export class AppModule {}
