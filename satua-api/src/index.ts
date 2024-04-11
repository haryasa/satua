import { Hono } from "hono";
import packageJson from "../package.json";

const app = new Hono();

app.get("/", (c) =>
  c.json({ name: "Satua API", version: packageJson.version, status: "ok" }),
);

export default app;
