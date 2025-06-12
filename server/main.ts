// deno-lint-ignore-file no-explicit-any
import { Database } from "@db/sqlite";
import * as oak from "@oak/oak";
import * as path from "@std/path";
import { Port } from "../lib/utils/index.ts";
import listInsights from "./operations/list-insights.ts";
import lookupInsight from "./operations/lookup-insight.ts";
import createInsight from "./operations/create-insight.ts";
import deleteInsight from "./operations/delete-insight.ts";
import * as insightsTable from "$tables/insights.ts";

console.log("Loading configuration");

const env = {
  port: Port.parse(Deno.env.get("SERVER_PORT")),
};

const dbFilePath = path.resolve("tmp", "db.sqlite3");

console.log(`Opening SQLite database at ${dbFilePath}`);

await Deno.mkdir(path.dirname(dbFilePath), { recursive: true });
const db = new Database(dbFilePath);

// Initialize the database if it doesn't exist
try {
  db.exec("SELECT 1 FROM insights LIMIT 1");
} catch {
  console.log("Creating insights table");
  db.exec(insightsTable.createTable);
}

console.log("Initialising server");

const router = new oak.Router();

router.get("/_health", (ctx) => {
  ctx.response.body = "OK";
  ctx.response.status = 200;
});

router.get("/insights", (ctx) => {
  try {
    const result = listInsights({ db });
    ctx.response.body = result;
    ctx.response.status = 200;
  } catch (error) {
    console.error("Error fetching insights: ", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to fetch insights" };
    return;
  }
});

router.get("/insights/:id", (ctx) => {
  const params = ctx.params as Record<string, any>;
  const result = lookupInsight({ db, id: params.id });
  ctx.response.body = result;
  ctx.response.status = 200;
});

router.post("/insights", async (ctx) => {
  try {
    const body = await ctx.request.body.json();
    const result = createInsight({ db, data: body });
    ctx.response.body = result;
    ctx.response.status = 201;
  } catch (error) {
    console.error("Error creating insight: ", error);
    ctx.response.body = { error: "Failed to create insight" };
    ctx.response.status = 500;
  }
});

router.delete("/insights/:id", (ctx) => {
  const params = ctx.params as Record<string, any>;
  const result = deleteInsight({ db, id: params.id });
  ctx.response.body = result;
  ctx.response.status = 200;
});

const app = new oak.Application();

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(env);
console.log(`Started server on port ${env.port}`);
