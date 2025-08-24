import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const selectAllBranchQuery: string = `
    SELECT *FROM branch
    ORDER BY branch.id
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
  async getBranches(page: number, pageSize: number, q?: string) {
    const offset = (page - 1) * pageSize;

    let query: string;
    let countQuery: string;
    let params: any[] = [];

    if (q) {
      const fullText = q;
      const ilikeText = `%${q}%`;

      query = `
        SELECT * FROM branch
        WHERE (
          to_tsvector('simple', name) @@ plainto_tsquery('simple', ?)
          OR name ILIKE ?
        )
        ORDER BY branch.id
        LIMIT ? OFFSET ?;
      `;

      countQuery = `
        SELECT COUNT(*) FROM branch
        WHERE (
          to_tsvector('simple', name) @@ plainto_tsquery('simple', ?)
          OR name ILIKE ?
        );
      `;

      params = [fullText, ilikeText, pageSize, offset];
    } else {
      query = `
        SELECT * FROM branch
        ORDER BY branch.id
        LIMIT ? OFFSET ?;
      `;

      countQuery = `SELECT COUNT(*) FROM branch;`;

      params = [pageSize, offset];
    }

    const totalCountResult = q
      ? await db.raw(countQuery, [q, `%${q}%`])
      : await db.raw(countQuery);

    const totalRecords = parseInt(totalCountResult.rows[0].count);

    const dataResult = await db.raw(query, params);
    const data = dataResult.rows;

    const totalPages = Math.ceil(totalRecords / pageSize);
    const nextPage = page < totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

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
