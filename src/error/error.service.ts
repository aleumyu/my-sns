import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ErrorService {
  constructor(private readonly prisma: PrismaService) {}

  async saveMessageError(error) {
    const { topic, key, value } = error;

    return await this.prisma.error.create({
      data: {
        topic,
        key,
        value,
        origin: 'kafka',
      },
    });
  }
  @Cron(CronExpression.EVERY_10_MINUTES)
  private async handleKaftaErrors() {
    try {
      const kafkaErrors = this.prisma.error.findMany({
        where: { origin: 'kafka' },
      });
      Promise.all(
        (await kafkaErrors).map(async (error) => {
          if (error.topic === 'post_created_es') {
            // savee in elasticsearch
          } else if (error.topic === 'post_created_cache') {
            //  redis post cache
          }
        }),
      );
      return;
    } catch (error) {
      console.error(error);
    }
  }
}
