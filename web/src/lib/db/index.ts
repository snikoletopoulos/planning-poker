import { drizzle } from "drizzle-orm/node-mssql";

import { relations } from "./schemas/relations";

export const db = drizzle(process.env.DATABASE_URL, { relations });
