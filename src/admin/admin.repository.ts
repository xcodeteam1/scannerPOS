import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
import { hashPassword } from 'lib/bcrypt';
const db = knex(knexConfig);

const selectByLoginAdminQuery: string = `
    SELECT *FROM admin WHERE login = ?;
`;

const selectByLoginCashierQuery: string = `
    SELECT c.*,
    branch.name AS branch_name 
    FROM cashier AS c
    LEFT JOIN branch ON branch.id = c.branch_id
    WHERE c.name = ?;
`;
const selectAllCashierQuery: string = `
SELECT 
  c.id,
  c.name,
  b.name AS branch_name
FROM cashier AS c
LEFT JOIN branch AS b ON b.id = c.branch_id
LIMIT ? OFFSET ?;
`;

const createAdminQuery: string = `
 INSERT INTO admin (login, password)
  SELECT ?, ?
  WHERE NOT EXISTS (
    SELECT 1 FROM admin WHERE login = ?
  )
  RETURNING *;`;
const selectByIDCashierQuery: string = `
        SELECT 
            c.id,
            c.name,
            b.name AS branch_name
            FROM cashier AS c
            LEFT JOIN branch AS b ON b.id = c.id
            WHERE c.id = ?;
`;

const createCashierQuery: string = `
        INSERT INTO cashier (
        name,
        branch_id,
        password
        )
        VALUES(?,?,?)
        RETURNING *;
`;

const updateCashierQuery: string = `
        UPDATE cashier 
            SET 
            name = ?,
            branch_id = ?,
            password = ?,
            updated_at = NOW()
        WHERE id = ?
        RETURNING *;
`;
const deleteCashierQuery: string = `
        DELETE FROM cashier
            WHERE id = ?
            RETURNING *;
`;
const searchCashierQuery: string = `
      SELECT 
            c.id,
            c.name,
            b.name AS branch_name
            FROM cashier AS c
            LEFT JOIN branch AS b ON b.id = c.id
      WHERE (
      to_tsvector('simple', c.name) @@ plainto_tsquery('simple', ?)
      OR c.name ILIKE ?
      OR b.name ILIKE ?
      );
`;
@Injectable()
export class CashiersRepo {
  async selectByLoginAdmin(login: string) {
    const res = await db.raw(selectByLoginAdminQuery, [login]);
    return res.rows;
  }
  async selectByloginCashier(login: string) {
    const res = await db.raw(selectByLoginCashierQuery, [login]);
    return res.rows;
  }
  async searchCashier(name: string) {
    const fullText = name;
    const ilikeText = `%${name}%`;

    const res = await db.raw(searchCashierQuery, [
      fullText,
      ilikeText,
      ilikeText,
    ]);
    return res.rows;
  }

  async createAdminIfNotExists(login: string, password: string) {
    const hashed = await hashPassword(password);
    const res = await db.raw(createAdminQuery, [login, hashed, login]);
    console.log(res.rows);
  }
  async selectAllCashier(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    // 1. Jami yozuvlar soni
    const totalCountResult = await db.raw(`SELECT COUNT(*) FROM cashier`);
    const totalRecords = parseInt(totalCountResult.rows[0].count);

    // 2. Sahifalangan natijalar
    const dataResult = await db.raw(selectAllCashierQuery, [pageSize, offset]);
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

  async selectByIDCashier(id: number) {
    const res = await db.raw(selectByIDCashierQuery, [id]);
    return res.rows[0];
  }
  async createCashier(data: {
    name: string;
    branch_id: number;
    password: string;
  }) {
    const hashedPassword = await hashPassword(data.password);
    const res = await db.raw(createCashierQuery, [
      data.name,
      data.branch_id,
      hashedPassword,
    ]);
    return res.rows[0];
  }
  async updateCashier(
    id: number,
    data: {
      name: string;
      branch_id: number;
      password: string;
    },
  ) {
    const hashedPassword = await hashPassword(data.password);
    const res = await db.raw(updateCashierQuery, [
      data.name,
      data.branch_id,
      hashedPassword,
      id,
    ]);
    return res.rows[0];
  }
  async deleteCashier(id: number) {
    const res = await db.raw(deleteCashierQuery, [id]);
    return res.rows;
  }
}
