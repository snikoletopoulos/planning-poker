import { sign, verify } from "jsonwebtoken";
import { z } from "zod";

import type { Member, Room } from "../db/schema";

const SECRET = "secret";

export const createToken = (payload: {
	id: Member["id"];
	name: string;
	roomId: Room["id"];
}) => sign(payload, SECRET);

export const parseToken = (token: string) => {
	const result = verify(token, SECRET);
	if (!result) return null;

	return result as z.infer<typeof TokenSchema>;
};

// TODO: Add roomId to token
const TokenSchema = z.object({
	id: z.number(),
	name: z.string(),
	roomId: z.number(),
});
