import { Module } from '@nestjs/common';
import { Controller } from './app.controller';

@Module({
  imports: [],
  controllers: [Controller],
})
export class AppModule {}
