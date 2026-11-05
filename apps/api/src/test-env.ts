// Imported first by unit tests whose subject loads config/env.ts: lets them run without an apps/api/.env file.
process.env.DATABASE_URL ||= "postgresql://test:test@127.0.0.1:1/test";
