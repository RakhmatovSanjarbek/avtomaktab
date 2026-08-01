import pg from "pg";
import "dotenv/config";

const shadowUrl = process.env.SHADOW_DATABASE_URL;
if (!shadowUrl) {
  console.error("SHADOW_DATABASE_URL topilmadi. .env faylida borligini tekshiring.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: shadowUrl });
await client.connect();
await client.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
await client.end();
console.log("✅ Shadow database tozalandi.");
