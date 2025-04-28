import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.raw(`
        CREATE TABLE IF NOT EXISTS customer(
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255),
        phone_number VARCHAR(50),
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
        );
        `);
}

export async function down(knex: Knex): Promise<void> {
  return knex.raw(`
        DROP TABLE IF EXISTS customer;
        `);
}
