import type { db } from "@/lib/db";

export type Transaction = Omit<
	Parameters<Parameters<(typeof db)["transaction"]>[0]>[0],
	"rollback"
>;
