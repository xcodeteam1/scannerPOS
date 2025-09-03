import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { NotificationRepo } from './notification.repository';

@Injectable()
export class NotificationService {
  constructor(private readonly repo: NotificationRepo) {}

  async findAll(page?: number, pageSize?: number) {
    return await this.repo.selectAll(page, pageSize);
  }

  async findOne(id: number) {
    const result = await this.repo.selectByID(id);
    if (!result)
      throw new NotFoundException(`notification not found with id: ${id}`);
    return result;
  }

  async create(createNotificationDto: CreateNotificationDto) {
    const result = await this.repo.createNotification(createNotificationDto);
    return result;
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const result = await this.repo.updateNotification(
      id,
      updateNotificationDto,
    );
    return result;
  }

  async remove(id: number) {
    const result = await this.repo.deleteNotification(id);

    return !result ? 'not found' : { success: true, result };
  }
}
