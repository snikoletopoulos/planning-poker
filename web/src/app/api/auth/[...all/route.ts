import { auth } from "@/lib/auth/auth.ts";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
