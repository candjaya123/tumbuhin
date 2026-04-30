import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ServiceUnavailableException, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class LoadSheddingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoadSheddingInterceptor.name);
  private readonly MAX_QUEUE_DEPTH = 500;

  constructor(@InjectQueue('event-processor-queue') private eventQueue: Queue) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const jobCounts = await this.eventQueue.getJobCounts('waiting', 'active', 'delayed');
    const totalWaiting = jobCounts.waiting + jobCounts.active;

    if (totalWaiting > this.MAX_QUEUE_DEPTH) {
      this.logger.warn(`Load shedding triggered: Queue depth ${totalWaiting} exceeds limit ${this.MAX_QUEUE_DEPTH}`);
      throw new ServiceUnavailableException('System is under heavy load. Please try again later.');
    }

    return next.handle();
  }
}
