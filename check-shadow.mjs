import pg from "pg";
import "dotenv/config";

const client = new pg.Client({ connectionString: process.env.SHADOW_DATABASE_URL });
await client.connect();
const res = await client.query(
  "SELECT typname FROM pg_type WHERE typname = 'Role';"
);
console.log("Topilgan turlar:", res.rows);
await client.end();
