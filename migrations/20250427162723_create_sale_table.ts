import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
        CREATE TABLE IF NOT EXISTS sale(
        id SERIAL PRIMARY KEY,
        item_barcode VARCHAR(50) REFERENCES product(barcode),
        price NUMERIC(15,2),
        quantity INTEGER DEFAULT 1,
        is_debt BOOLEAN DEFAULT FALSE,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE IF EXISTS sale;
        `);
}
