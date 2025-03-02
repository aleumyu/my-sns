import { Injectable } from '@nestjs/common';
import { Kafka } from 'kafkajs';

@Injectable()
export class KafkaProducerService {
  private readonly kafka = new Kafka({
    brokers: ['localhost:9092'],
  });
  private readonly producer = this.kafka.producer();

  constructor() {
    this.producer.connect().catch(console.error);
  }
  async emitCreatePostCacheEvent(profileId: string, post: any) {
    await this.producer.send({
      topic: 'post_created_cache',
      // Is this  a good idea? using profileId as key?
      messages: [{ key: profileId, value: JSON.stringify(post) }],
    });
  }

  async emitCreatePostEsEvent(post: any) {
    await this.producer.send({
      topic: 'post_created_es',
      messages: [{ key: '', value: JSON.stringify(post) }],
    });
  }

  async emitErrorEvent(message, topic) {
    await this.producer.send({
      topic: 'errors',
      messages: [{ key: topic, value: message }],
    });
  }

  async emitCreateEventEsEvent(event: any) {
    await this.producer.send({
      topic: 'event_created_es',
      messages: [{ key: '', value: JSON.stringify(event) }],
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}
