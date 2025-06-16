import { z } from "zod";

const EnvSchema = z.object({
	DB_FILE_NAME: z.string().min(1),
	AUTH_SECRET: z.string().min(1),
	UPDATER_INTERNAL_URL: z.string().url(),
	NEXT_PUBLIC_UPDATER_WS_URL: z.string().url(),
	NEXT_PUBLIC_UPDATER_HTTP_URL: z.string().url(),
});

if (!process.env.DOCKER_BUILD) {
	try {
		EnvSchema.parse({
			DB_FILE_NAME: process.env.DB_FILE_NAME,
			AUTH_SECRET: process.env.AUTH_SECRET,
			UPDATER_INTERNAL_URL: process.env.UPDATER_INTERNAL_URL,
			NEXT_PUBLIC_UPDATER_WS_URL: process.env.NEXT_PUBLIC_UPDATER_WS_URL,
			NEXT_PUBLIC_UPDATER_HTTP_URL: process.env.NEXT_PUBLIC_UPDATER_HTTP_URL,
		});
	} catch (error) {
		console.error("Error verifying environment variables:", error);
		process.exit(1);
	}
}

declare global {
	namespace NodeJS {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface ProcessEnv extends z.infer<typeof EnvSchema> {}
	}
}
