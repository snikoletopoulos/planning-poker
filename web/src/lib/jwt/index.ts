import { sign, verify } from "jsonwebtoken";
import { z } from "zod";

import type { Member, Room } from "../db/schema";

export const createToken = (payload: {
	id: Member["id"];
	name: string;
	roomId: Room["id"];
}) => sign(payload, process.env.AUTH_SECRET);

export const parseToken = (token: string) => {
	try {
		const tokenData = verify(token, process.env.AUTH_SECRET);
		if (!tokenData) return null;

		const data = TokenSchema.parse(tokenData);
		return data;
	} catch (error) {
		console.error("[PARSE_TOKEN:INVALID]", error);
		return null;
	}
};

const TokenSchema = z.object({
	id: z.string(),
	name: z.string(),
	roomId: z.string(),
});
