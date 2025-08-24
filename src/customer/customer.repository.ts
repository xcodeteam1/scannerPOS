import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const createCustomerQuery: string = `
        INSERT INTO customer(
        customer_name,
        phone_number,
        description
        )
        VALUES(?,?,?)
        RETURNING *;
`;
const selectCustomerQuery: string = `
        SELECT *FROM customer
        ORDER BY id;
`;
const searchCustomerQuery: string = `
        SELECT *FROM customer 
         WHERE 
    (
      to_tsvector('simple', customer_name) @@ plainto_tsquery(?)
    )
    OR customer_name ILIKE ?;
`;

const baseSelectCustomerQuery: string = `
  SELECT * FROM customer
`;
@Injectable()
export class CustomerRepo {
  async selectCustomer() {
    const res = await db.raw(selectCustomerQuery);
    return res.rows;
  }

  async getCustomers(page: number, pageSize: number, name?: string) {
    const offset = (page - 1) * pageSize;

    if (!name || !name.trim()) {
      // Agar qidiruv bo'lmasa → hammasini paginatsiya bilan olib kelamiz
      const totalRes = await db.raw(`SELECT COUNT(*) FROM customer`);
      const totalRecords = parseInt(totalRes.rows[0].count);

      const dataRes = await db.raw(
        `${baseSelectCustomerQuery} ORDER BY id LIMIT ? OFFSET ?`,
        [pageSize, offset],
      );
      const totalPages = Math.ceil(totalRecords / pageSize);

      return {
        data: dataRes.rows,
        pagination: {
          total_records: totalRecords,
          current_page: page,
          total_pages: totalPages,
          next_page: page < totalPages ? page + 1 : null,
          prev_page: page > 1 ? page - 1 : null,
        },
      };
    } else {
      // Agar qidiruv bo'lsa → barcha natijalarni olib kelamiz (pagination optional)
      const fullText = name;
      const ilikeText = `%${name}%`;
      const res = await db.raw(searchCustomerQuery, [fullText, ilikeText]);
      return {
        data: res.rows,
        pagination: {
          total_records: res.rows.length,
          current_page: 1,
          total_pages: 1,
          next_page: null,
          prev_page: null,
        },
      };
    }
  }
  async selectByIDCustomer(id: number) {
    const res = await db.raw('SELECT *FROM customer WHERE id = ?', [id]);
    return res.rows[0];
  }
  async searchCustomer(name: string) {
    if (!name.trim()) return [];

    const fullText = name; // plainto_tsquery uchun
    const ilikeText = `%${name}%`; // ILIKE uchun
    const res = await db.raw(searchCustomerQuery, [fullText, ilikeText]);
    return res.rows;
  }
  async createCustomer(data: {
    customer_name: string;
    phone_number: string;
    description: string;
  }) {
    const res = await db.raw(createCustomerQuery, [
      data.customer_name,
      data.phone_number,
      data.description,
    ]);
    return res.rows[0];
  }
}
