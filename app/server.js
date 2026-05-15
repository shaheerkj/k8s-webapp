const express = require("express");
const { Pool } = require("pg");

const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.PGHOST || "postgres",
  user: process.env.PGUSER || "appuser",
  password: process.env.PGPASSWORD || "apppassword",
  database: process.env.PGDATABASE || "appdb",
  port: Number(process.env.PGPORT || 5432),
});

async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS hits (
      id SERIAL PRIMARY KEY,
      count BIGINT NOT NULL
    );
  `);
  const { rows } = await pool.query(`SELECT count(*)::bigint AS n FROM hits;`);
  if (rows[0].n === 0n) {
    await pool.query(`INSERT INTO hits(count) VALUES (0);`);
  }
}

app.get("/healthz", async (_req, res) => {
  try {
    await pool.query("SELECT 1;");
    res.status(200).send("ok");
  } catch (e) {
    res.status(500).send("db not ready");
  }
});

app.get("/", async (_req, res) => {
  try {
    await init();
    await pool.query(`UPDATE hits SET count = count + 1 WHERE id = 1;`);
    const { rows } = await pool.query(`SELECT count FROM hits WHERE id = 1;`);
    res.json({ message: "Hello from Kubernetes", hits: rows[0].count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Endpoint to create memory pressure for HPA testing
// Example: /alloc?mb=100
const allocations = [];
app.get("/alloc", (req, res) => {
  const mb = Math.max(1, Math.min(500, Number(req.query.mb || 50)));
  const bytes = mb * 1024 * 1024;
  allocations.push(Buffer.alloc(bytes, 1));
  res.json({ allocated_mb_total: allocations.reduce((a, b) => a + b.length, 0) / 1024 / 1024 });
});

app.listen(port, () => console.log(`listening on ${port}`));
