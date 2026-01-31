import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/lib/auth/auth.ts";

export const { POST, GET } = toNextJsHandler(auth);
