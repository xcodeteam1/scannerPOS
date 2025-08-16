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
            description = COALESCE(?, description)
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
    name: string,
    description: string,
    imageUrls?: string[],
  ) {
    try {
      const imageArrayPg = `{${imageUrls.join(',')}}`;

      const safeDescription = description ?? '';

      const { rows } = await db.raw(updateCategoryQuery, [
        name,
        safeDescription,
        imageArrayPg || null,

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
