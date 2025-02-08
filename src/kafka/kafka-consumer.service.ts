import { Kafka } from 'kafkajs';
import { Cache } from 'cache-manager';

import { Injectable, OnModuleInit, Logger, Inject } from '@nestjs/common';
// import { EventPattern } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { PostsService } from 'src/posts/posts.service';
import { FollowService } from 'src/follow/follow.service';
import SearchService from 'src/search/search.service';

// import { MailService } from 'src/mail/mail.service';

@Injectable()
export class KafkaConsumerService implements OnModuleInit {
  private readonly kafka = new Kafka({
    brokers: ['localhost:9092'],
  });

  private readonly consumer = this.kafka.consumer({ groupId: 'nestjs-group' });
  private readonly logger = new Logger(KafkaConsumerService.name);

  constructor(
    private readonly postsService: PostsService,
    private readonly followService: FollowService,
    private postsSearchService: SearchService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
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

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({ topic }, { partition }, { message });
        console.log(`Received message from topic: ${topic}`);

        if (topic === 'post_created_cache') {
          await this.handlePostCreatedCache(message);
        } else if (topic === 'post_created_es') {
          await this.handlePostCreatedEs(message);
        }
      },
    });
  }

  // @EventPattern('post_created_cache')
  async handlePostCreatedCache(message: any) {
    console.log('bonjour handlePostCreatedCache consumer');
    const postData = JSON.parse(message.value.toString());
    const profileId = message.key.toString();
    const followers = await this.followService.findAllFollowers(profileId);
    for (const followerId of followers) {
      const cacheKey = `newFeedsFor:${profileId}`;
      const cachedData: any[] = await this.cacheManager.get(followerId);
      if (!cachedData) {
        // Question: 이렇게되면, cache가 empty했던 유저들
        //(즉로그인을 오랫동안 안한 혹은 newsfeed를 업데이트하지않은 유저) 에
        //캐쉬가 지금 현재 포스트만있게되는데 다음번에 로그인햇을때 그유저는 포스트1개만 보일수있습니다.
        //그래서 이부분은 캐쉬를 전체를업데이트하든지 아니면
        //사실 로그인을오랫동안안햇다는 뜻이니까 그냥 no-op을해도됩니다.
        await this.cacheManager.set(cacheKey, [postData]);
      } else {
        cachedData.unshift(postData);
        await this.cacheManager.set(profileId, cachedData);
      }
    }
  }

  // @EventPattern('post_created_es')
  async handlePostCreatedEs(message: any) {
    console.log('bonjour handlePostCreatedEs consumer');
    const postData = JSON.parse(message.value.toString());
    await this.postsSearchService.indexPost(postData);
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
