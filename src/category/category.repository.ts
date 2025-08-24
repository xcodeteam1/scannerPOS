import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

const createCategoryQuery: string = `
    INSERT INTO category(
        name,
        description,
        image       
    )
    VALUES(?,?,?)
    RETURNING *;
`;

const selectCategoryQuery: string = `
    SELECT * FROM category;
`;

const selectByIDCategoryQuery: string = `
    SELECT * FROM category WHERE id = ?;
`;

const baseSelectCategoryQuery = `
  SELECT * FROM category
`;

const searchCategoryQuery = `
  SELECT * FROM category
  WHERE id::text ILIKE ? OR name ILIKE ?
`;

const updateCategoryQuery: string = `
    UPDATE category
        SET
            name = ?,
            description = ?,
            image = ?
    WHERE id = ?
    RETURNING *;
`;
const patchCategoryQuery: string = `
    UPDATE category
        SET
            name = COALESCE(?, name),
            description = COALESCE(?, description),
            updated_at = NOW()
    WHERE id = ?
    RETURNING *;
`;

const deleteCategoryQuery: string = `
    DELETE FROM category 
    WHERE id = ?
    RETURNING *;
`;

@Injectable()
export class CategoryRepo {
  async selectCategory() {
    const { rows } = await db.raw(selectCategoryQuery);
    return rows;
  }

  async getCategories(page: number, pageSize: number, q?: string) {
    const offset = (page - 1) * pageSize;

    if (!q || !q.trim()) {
      const totalRes = await db.raw(`SELECT COUNT(*) FROM category`);
      const totalRecords = parseInt(totalRes.rows[0].count);

      const dataRes = await db.raw(
        `${baseSelectCategoryQuery} ORDER BY id LIMIT ? OFFSET ?`,
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
      const ilikeText = `%${q}%`;
      const res = await db.raw(searchCategoryQuery, [ilikeText, ilikeText]);

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

  async selectByIDCategory(id: number) {
    const { rows } = await db.raw(selectByIDCategoryQuery, [id]);
    return rows[0];
  }

  async createCategory(
    name: string,
    description: string,
    imageUrls?: string[],
  ) {
    try {
      const imageArrayPg = `{${imageUrls.join(',')}}`;

      const safeDescription = description ?? '';
      const { rows } = await db.raw(createCategoryQuery, [
        name,
        safeDescription,
        imageArrayPg || null,
      ]);
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }
  async updateCategory(
    id: number,
    data: { name?: string; description?: string; imageUrls?: string[] },
  ) {
    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.imageUrls !== undefined) updateData.image = data.imageUrls;

    if (Object.keys(updateData).length === 0) {
      throw new Error('Hech qanday field yuborilmadi!');
    }

    const [updated] = await db('category')
      .where({ id })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new Error(`Category with id ${id} not found`);
    }

    return updated;
  }

  async patchCategory(id: number, name?: string, description?: string) {
    try {
      const { rows } = await db.raw(patchCategoryQuery, [
        name ?? null,
        description ?? null,
        id,
      ]);
      if (rows.length === 0) {
        throw new Error(`Category with id ${id} not found`);
      }
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async deleteCategory(id: number) {
    try {
      const { rows } = await db.raw(deleteCategoryQuery, [id]);
      if (rows.length === 0) {
        throw new Error(`Category with id ${id} not found`);
      }
      return rows[0];
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
