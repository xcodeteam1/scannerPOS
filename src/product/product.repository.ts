import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';

const db = knex(knexConfig);

// SQL Queries
const selectAllProductQuery = `
  SELECT * FROM product
  ORDER BY updated_at DESC
  LIMIT ? OFFSET ?;
`;

const selectByIDProductQuery = `
  SELECT * FROM product
  WHERE barcode = ?;
`;

const searchProductQuery = `
  SELECT product.*, branch.name AS branch_name
  FROM product
  JOIN branch ON branch.id = product.branch_id
  WHERE (
    to_tsvector('simple', product.name) @@ plainto_tsquery(?)
    OR product.name ILIKE ?
    OR product.barcode ILIKE ?
  );
`;

const createProductQuery = `
  INSERT INTO product(
    barcode,
    name,
    branch_id,
    price,
    stock,
    real_price,
    category_id,
    description,
    tegs,
    image
  )
  VALUES(?,?,?,?,?,?,?,?,?,?)
  RETURNING *;
`;

const deleteProductQuery = `
  DELETE FROM product
  WHERE barcode = ?
  RETURNING *;
`;

@Injectable()
export class ProductRepo {
  // Get all products with pagination and optional search
  async getProducts(page: number, pageSize: number, q?: string) {
    const offset = (page - 1) * pageSize;
    let totalCountResult, dataResult;

    if (q && q.trim() !== '') {
      const fullText = q;
      const ilikeText = `%${q}%`;

      totalCountResult = await db.raw(
        `
        SELECT COUNT(*) 
        FROM product
        JOIN branch ON branch.id = product.branch_id
        WHERE (
          to_tsvector('simple', product.name) @@ plainto_tsquery(?)
          OR product.name ILIKE ?
          OR product.barcode ILIKE ?
        )
        `,
        [fullText, ilikeText, ilikeText],
      );

      dataResult = await db.raw(
        `
        SELECT product.*, branch.name AS branch_name
        FROM product
        JOIN branch ON branch.id = product.branch_id
        WHERE (
          to_tsvector('simple', product.name) @@ plainto_tsquery(?)
          OR product.name ILIKE ?
          OR product.barcode ILIKE ?
        )
        ORDER BY product.updated_at DESC
        LIMIT ? OFFSET ?
        `,
        [fullText, ilikeText, ilikeText, pageSize, offset],
      );
    } else {
      totalCountResult = await db.raw(`SELECT COUNT(*) FROM product`);

      dataResult = await db.raw(
        `
        SELECT product.*, branch.name AS branch_name
        FROM product
        JOIN branch ON branch.id = product.branch_id
        ORDER BY product.updated_at DESC
        LIMIT ? OFFSET ?
        `,
        [pageSize, offset],
      );
    }

    const totalRecords = parseInt(totalCountResult.rows[0].count);
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

  // Select all products with pagination
  async selectAllProduct(page: number, pageSize: number) {
    const offset = (page - 1) * pageSize;
    const totalCountResult = await db.raw(`SELECT COUNT(*) FROM product`);
    const totalRecords = parseInt(totalCountResult.rows[0].count);

    const dataResult = await db.raw(selectAllProductQuery, [pageSize, offset]);
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

  // Get product by barcode
  async selectByIDProduct(barcode: string) {
    const res = await db.raw(selectByIDProductQuery, [barcode]);
    return res.rows[0];
  }

  // Full text search
  async searchProduct(q: string) {
    const fullText = q;
    const ilikeText = `%${q}%`;
    const res = await db.raw(searchProductQuery, [
      fullText,
      ilikeText,
      ilikeText,
    ]);
    return res.rows;
  }

  // Create product
  async createProduct(data: {
    barcode: string;
    name: string;
    branch_id: number;
    price: number;
    stock: number;
    category_id: number;
    description?: string;
    real_price: number;
    tegs?: ('new' | 'hit' | 'sale')[];
    imageUrls?: string[];
  }) {
    const imageArrayPg =
      data.imageUrls && data.imageUrls.length
        ? `{${data.imageUrls.map((img) => `"${img}"`).join(',')}}`
        : null;

    const tegsArrayPg =
      data.tegs && data.tegs.length
        ? `{${data.tegs.map((t) => `"${t}"`).join(',')}}`
        : null;

    const res = await db.raw(
      `
      INSERT INTO product(
        barcode,
        name,
        branch_id,
        price,
        stock,
        real_price,
        category_id,
        description,
        tegs,
        image
      )
      VALUES(?,?,?,?,?,?,?,?,?,?)
      RETURNING *;
      `,
      [
        data.barcode,
        data.name,
        data.branch_id,
        data.price,
        data.stock,
        data.real_price,
        data.category_id,
        data.description || null,
        tegsArrayPg,
        imageArrayPg,
      ],
    );

    return res.rows[0];
  }

  // Update product
  async updateProduct(
    barcode: string,
    data: {
      name?: string;
      branch_id?: number;
      category_id?: number;
      price?: number;
      stock?: number;
      real_price?: number;
      description?: string;
      tegs?: any;
    },
  ) {
    const updateData: any = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    if (!Object.keys(updateData).length) {
      throw new BadRequestException('Hech qanday field yuborilmadi');
    }

    const [updated] = await db('product')
      .where({ barcode })
      .update(updateData)
      .returning('*');

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    return updated;
  }

  // product.repository.ts

  async updateProductImages(barcode: string, images: string[]) {
    const imagePgArray =
      images.length > 0
        ? `{${images.map((img) => `"${img}"`).join(',')}}`
        : null;

    const [updated] = await db('product')
      .where({ barcode })
      .update({
        image: imagePgArray,
        updated_at: db.fn.now(),
      })
      .returning('*');

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    return updated;
  }
  // product.service.ts

  // Delete product
  async deleteProduct(barcode: string) {
    const res = await db.raw(deleteProductQuery, [barcode]);
    return res.rows[0];
  }
}
