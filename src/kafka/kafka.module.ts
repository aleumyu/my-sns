import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from 'src/prisma/prisma.module';
import { KafkaProducerService } from './kafka-producer.service';
import { KafkaConsumerService } from './kafka-consumer.service';
import { PostsModule } from 'src/posts/posts.module';
import { FollowModule } from 'src/follow/follow.module';
import { SearchModule } from 'src/search/search.module';
// import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [KafkaProducerService, KafkaConsumerService],
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: 'nestjs-kafka',
            brokers: ['localhost:9092'],
            retry: {
              retries: 2, // Number of retries
              initialRetryTime: 300, // Initial retry time in ms
              maxRetryTime: 10000, // Maximum total retry time in ms
              factor: 0.2, // Exponential factor for backoff
            },
          },
          consumer: {
            groupId: 'nestjs-group',
          },
        },
      },
    ]),
    PrismaModule,
    PostsModule,
    FollowModule,
    SearchModule,
  ],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
