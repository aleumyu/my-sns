import { Module } from '@nestjs/common';
import { ErrorService } from './error.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [ErrorService],
  imports: [PrismaModule],
  exports: [ErrorService],
})
export class ErrorModule {}
