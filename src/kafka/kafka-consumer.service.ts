import { Kafka } from 'kafkajs';
import Redis from 'ioredis';

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

import { PostsService } from 'src/posts/posts.service';
import { FollowService } from 'src/follow/follow.service';
import SearchService from 'src/search/search.service';
import { ErrorService } from 'src/error/error.service';
import { KafkaProducerService } from 'src/kafka/kafka-producer.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly kafka = new Kafka({
    brokers: ['localhost:9092'],
  });
  // probably ned ti create a redis module
  private readonly redis = new Redis({
    host: 'localhost',
    port: 6379,
  });

  private readonly consumer = this.kafka.consumer({ groupId: 'nestjs-group' });
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly postsService: PostsService,
    private readonly followService: FollowService,
    private searchService: SearchService,
    private kafkaProducerService: KafkaProducerService,
    private readonly errorService: ErrorService,
  ) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'post_created_es',
      fromBeginning: true,
    });

    await this.consumer.subscribe({
      topic: 'post_created_cache',
      fromBeginning: true,
    });

    await this.consumer.subscribe({
      topic: 'errors',
      fromBeginning: true,
    });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({ topic }, { partition }, { message });
        console.log(`Received message from topic: ${topic}`);

        if (topic === 'post_created_cache') {
          await this.handlePostCreatedCache(message, topic);
        } else if (topic === 'post_created_es') {
          await this.handlePostCreatedEs(message, topic);
        } else if (topic === 'error') {
          await this.handleDeadLetterQueue(message);
        } else if (topic === 'event_created_es') {
          await this.handleCreateEventEsEvent(message);
        }
      },
    });
  }

  // @EventPattern('post_created_cache')
  async handlePostCreatedCache(message: any, topic: string) {
    try {
      const postData = JSON.parse(message.value.toString());
      const profileId = message.key.toString();
      const followers = await this.followService.findAllFollowers(profileId);
      for (const followerId of followers) {
        console.log(`Caching post data of ${profileId} for ${followerId}`);
        const sortedSetKey = `newFeedsFor:${followerId}`;
        const score = new Date(postData.createdAt).getTime();
        await this.redis.zadd(sortedSetKey, score, JSON.stringify(postData));
      }

      // normal kay/valye set cache
      // const cacheKey = `newFeedsFor:${profileId}`;
      // const cachedData: any[] = await this.cacheManager.get(followerId);
      // if (!cachedData) {
      //   // Question: 이렇게되면, cache가 empty했던 유저들
      //   //(즉로그인을 오랫동안 안한 혹은 newsfeed를 업데이트하지않은 유저) 에
      //   //캐쉬가 지금 현재 포스트만있게되는데 다음번에 로그인햇을때 그유저는 포스트1개만 보일수있습니다.
      //   //그래서 이부분은 캐쉬를 전체를업데이트하든지 아니면
      //   //사실 로그인을오랫동안안햇다는 뜻이니까 그냥 no-op을해도됩니다.
      //   await this.cacheManager.set(cacheKey, [postData]);
      // } else {
      //   cachedData.unshift(postData);
      //   await this.cacheManager.set(profileId, cachedData);
      // }
    } catch (error) {
      this.logger.error(error);
      await this.kafkaProducerService.emitErrorEvent(message, topic);
    }
  }

  // @EventPattern('post_created_es')
  async handlePostCreatedEs(message: any, topic: string) {
    try {
      const postData = JSON.parse(message.value.toString());
      await this.searchService.indexPost(postData, 'posts');
    } catch (error) {
      this.logger.error(error);
      await this.kafkaProducerService.emitErrorEvent(message, topic);
    }
  }

  async handleCreateEventEsEvent(message: any) {
    const eventData = JSON.parse(message.value.toString());
    await this.searchService.indexEvent(eventData, 'events');
  }

  async handleDeadLetterQueue(message: any) {
    const messageInMessagee = JSON.parse(message.value);
    const topic = message.key.toString();
    const value = messageInMessagee.value.toString();
    const key = messageInMessagee.key.toString();
    this.errorService.saveMessageError({ topic, value, key });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
