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
        SELECT *FROM customer;
`;
const searchCustomerQuery: string = `
        SELECT *FROM customer 
         WHERE 
    (
      to_tsvector('simple', customer_name) @@ plainto_tsquery(?)
    )
    OR customer_name ILIKE ?;
`;

@Injectable()
export class CustomerRepo {
  async selectCustomer() {
    const res = await db.raw(selectCustomerQuery);
    return res.rows;
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
