import { Injectable } from '@nestjs/common';
import knex from 'knex';
import knexConfig from '../../knexfile';
const db = knex(knexConfig);

//to'g'rilash kerak
const allAmountQuery: string = `
        SELECT 
        SUM(amount) AS all_amount
        FROM debt
        WHERE created_at != updated_at
        AND created_at >= date_trunc('month', CURRENT_DATE) 
        AND created_at < date_trunc('month', CURRENT_DATE + INTERVAL '1 month');
`;

const selectProductMainQUery: string = `
        SELECT 
        COUNT(*) AS total_products,
        COUNT(*) FILTER (WHERE created_at >= date_trunc('month', CURRENT_DATE)) AS new_products
        FROM product;

`;

const selectSixMothQuery: string = `
      SELECT 
    COALESCE(SUM(price) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '7 months'
          AND created_at <  date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
    ), 0) AS six_months_ago_sales,

    COALESCE(SUM(price) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '6 months'
          AND created_at <  date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
    ), 0) AS five_months_ago_sales,

    COALESCE(SUM(price) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '5 months'
          AND created_at <  date_trunc('month', CURRENT_DATE) - INTERVAL '4 months'
    ), 0) AS four_months_ago_sales,

    COALESCE(SUM(price) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '4 months'
          AND created_at <  date_trunc('month', CURRENT_DATE) - INTERVAL '3 months'
    ), 0) AS three_months_ago_sales,

    COALESCE(SUM(price) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '3 months'
          AND created_at <  date_trunc('month', CURRENT_DATE) - INTERVAL '2 months'
    ), 0) AS two_months_ago_sales,

    COALESCE(SUM(price) FILTER (
        WHERE created_at >= date_trunc('month', CURRENT_DATE) - INTERVAL '2 months'
          AND created_at <  date_trunc('month', CURRENT_DATE) - INTERVAL '1 months'
    ), 0) AS one_month_ago_sales

FROM sale;

`;

const selectDiagramQuery: string = `
        SELECT 
        product.name AS product_name,
        sale.item_barcode,
        SUM(sale.price)
        FROM sale
        JOIN product ON product.barcode = sale.item_barcode
        GROUP BY product_name, sale.price, sale.item_barcode;
`;

@Injectable()
export class MainRepo {
  async selectProductMain() {
    const res = await db.raw(selectProductMainQUery);
    return res.rows;
  }
  async selectSixMoth() {
    const res = await db.raw(selectSixMothQuery);
    return res.rows;
  }
  async selectDiagram() {
    const res = await db.raw(selectDiagramQuery);
    return res.rows;
  }
}
