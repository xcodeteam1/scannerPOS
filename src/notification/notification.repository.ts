import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
import { UpdateNotificationDto } from './dto/update-notification.dto';
const db = knex(knexConfig);

const selectAllQuery: string = `
        SELECT *FROM notification
            LIMIT ? OFFSET ?;
`;

const selectByIDQuery: string = `
        SELECT *FROM notification
        WHERE id = ?;
`;

const createQuery: string = `
        INSERT INTO notification(
        title,
        subtitle
        )
        VALUES(?,?)
        RETURNING *;
`;

const updateQuery: string = `
        UPDATE notification
            SET 
            title = ?,
            subtitle = ?,
            updated_at = NOW()
        WHERE id = ?
        RETURNING *;
`;

const deleteQuery: string = `
        DELETE FROM notification
        WHERE id = ?
        RETURNING *;
`;

@Injectable()
export class NotificationRepo {
  async selectAll(page?: number, pageSize?: number) {
    page = page ? page : 1;
    pageSize = pageSize ? pageSize : 10;
    const offset = (page - 1) * pageSize;

    // 1. Jami yozuvlar soni
    const totalCountResult = await db.raw(`SELECT COUNT(*) FROM notification`);
    const totalRecords = parseInt(totalCountResult.rows[0].count);

    const dataResult = await db.raw(selectAllQuery, [pageSize, offset]);
    const data = dataResult.rows;
    // 3. Paginatsiya hisoblash
    const totalPages = Math.ceil(totalRecords / pageSize);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    // 4. Yakuniy natija
    return {
      data,
      pagination: {
        total_records: totalRecords,
        current_page: page,
        total_pages: totalPages,
        next_page: nextPage,
        prev_page: prevPage,
      },
    };
  }

  async selectByID(id: number) {
    const res = await db.raw(selectByIDQuery, [id]);
    return res.rows[0];
  }

  async createNotification(data: { title: string; subtitle: string }) {
    const res = await db.raw(createQuery, [data.title, data.subtitle]);
    return res.rows[0];
  }

  async updateNotification(id: number, data: UpdateNotificationDto) {
    const res = await db.raw(updateQuery, [data.title, data.subtitle, id]);
    return res.rows[0];
  }

  async deleteNotification(id: number) {
    const res = await db.raw(deleteQuery, [id]);
    return res.rows[0];
  }
}
