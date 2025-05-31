import { z } from "zod";

const EnvSchema = z.object({
	DB_FILE_NAME: z.string().min(1),
	AUTH_SECRET: z.string().min(1),
	NEXT_PUBLIC_UPDATER_WS_URL: z.string().url(),
	NEXT_PUBLIC_UPDATER_HTTP_URL: z.string().url(),
});

try {
	EnvSchema.parse(process.env);
} catch (error) {
	console.error("Error verifying environment variables:", error);
	process.exit(1);
}

declare global {
	namespace NodeJS {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface ProcessEnv extends z.infer<typeof EnvSchema> {}
	}
}
