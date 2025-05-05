import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectAllBranchQuery: string = `
    SELECT *FROM branch
    LIMIT ? OFFSET ?;
`;

const selectByIDBranch: string = `
    SELECT *FROM branch 
        WHERE id = ?;
`;
const createBranchQuery: string = `
    INSERT INTO branch(
    name,
    address,
    contact
    )
    VALUES(?,?,?)
    RETURNING *;
    `;
const updateBranchQuery: string = `
    UPDATE branch
      SET
      name = ?,
      address = ?,
      contact = ?,
      updated_at = NOW()
    WHERE id = ?
    RETURNING *;
`;
const deleteBranchQuery: string = `
    DELETE FROM branch 
      WHERE id = ? 
      RETURNING *; 
`;

const searchBranchQUery: string = `
    SELECT * FROM branch
    WHERE (
        to_tsvector('simple', name) @@ plainto_tsquery('simple', ?)
        OR name ILIKE ?
    );
`;

@Injectable()
export class BranchRepo {
  async selectAllBranch(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;

    // 1. Jami yozuvlar soni
    const totalCountResult = await db.raw(`SELECT COUNT(*) FROM branch`);
    const totalRecords = parseInt(totalCountResult.rows[0].count);

    const dataResult = await db.raw(selectAllBranchQuery, [pageSize, offset]);
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
  async selectByIDBranch(id: number) {
    const res = await db.raw(selectByIDBranch, [id]);
    return res.rows[0];
  }
  async searchBranch(name: string) {
    const fullText = name; // plainto_tsquery uchun
    const ilikeText = `%${name}%`; // ILIKE uchun
    const res = await db.raw(searchBranchQUery, [fullText, ilikeText]);
    return res.rows;
  }
  async createBranch(data: { name: string; address: string; contact: string }) {
    const res = await db.raw(createBranchQuery, [
      data.name,
      data.address,
      data.contact,
    ]);
    return res.rows[0];
  }
  async updateBranch(
    id: number,
    data: { name: string; address: string; contact: string },
  ) {
    const res = await db.raw(updateBranchQuery, [
      data.name,
      data.address,
      data.contact,
      id,
    ]);
    return res.rows[0];
  }
  async deleteBranch(id: number) {
    const res = await db.raw(deleteBranchQuery, [id]);
    return res.rows;
  }
}
