import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

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
import { SearchModule } from './search/search.module';
import { KafkaModule } from './kafka/kafka.module';
import { ErrorModule } from './error/error.module';
import { TicketsModule } from './tickets/tickets.module';
import { EventsModule } from './events/events.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    // is this actually needed? need to check
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          ttl: 60000,
          stores: [createKeyv('redis://localhost:6379')],
        };
      },
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
    SearchModule,
    KafkaModule,
    ErrorModule,
    TicketsModule,
    EventsModule,
    BookingModule,
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
