import { Module } from '@nestjs/common';
import { MainController } from './main.controller';
import { MainService } from './main.service';
import { MainRepo } from './main.repository';

@Module({
  controllers: [MainController],
  providers: [MainService, MainRepo],
})
export class MainModule {}
