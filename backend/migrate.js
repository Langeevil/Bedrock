import { ensureAppSchema } from "./src/dbInit.js";
import pool from "./src/db.js";

async function run() {
  try {
    console.log("Starting schema update...");
    await ensureAppSchema();
    console.log("Schema update completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Schema update failed:", err);
    process.exit(1);
  } finally {
    pool.end();
  }
}

run();
