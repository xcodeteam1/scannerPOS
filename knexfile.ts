import * as dotenv from 'dotenv';
dotenv.config();

const { DB_PASSWORD, DB_NAME, DB_HOST, DB_USERNAME } = process.env;

console.log(DB_HOST);

const config = {
  client: 'pg',
  connection: {
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
  },
  migrations: {
    directory: './migrations',
  },
};

export default config;
