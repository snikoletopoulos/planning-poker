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
	const tokenData = verify(token, SECRET);
	if (!tokenData) return null;

	const data = TokenSchema.parse(tokenData);
	return data;
};

const TokenSchema = z.object({
	id: z.string(),
	name: z.string(),
	roomId: z.string(),
});
