import { Ctx, MessagePattern, Payload, RedisContext } from '@nestjs/microservices';

export class Controller {
    @MessagePattern('notifications')
    getNotifications(@Payload() data: number[], @Ctx() context: RedisContext) {
      console.log(`Channel: ${context.getChannel()}`);
    }
}
