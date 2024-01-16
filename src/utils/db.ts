import { Pool, createPool } from '@vercel/postgres';

const db = createPool({
  connectionString: process.env.NEXT_PUBLIC_POSTGRES_URL
});

export default db;