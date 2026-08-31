import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Prisma needs a URL while generating locally. The real Azure URL must be
    // provided through the DATABASE_URL environment variable at runtime.
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@localhost:5432/meat_app?schema=public",
  },
});
