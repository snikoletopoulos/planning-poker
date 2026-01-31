import * as z from "zod";

const EnvSchema = z.object({
	DATABASE_URL: z.string().min(1),
	AUTH_SECRET: z.string().min(1),
	UPDATER_INTERNAL_URL: z.url(),
	NEXT_PUBLIC_UPDATER_WS_URL: z.url(),
	NEXT_PUBLIC_UPDATER_HTTP_URL: z.url(),
});

if (!process.env.DOCKER_BUILD) {
	try {
		EnvSchema.parse(process.env);
	} catch (error) {
		console.error("Error verifying environment variables:", error);
		process.exit(1);
	}
}

declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace NodeJS {
		// eslint-disable-next-line @typescript-eslint/no-empty-object-type
		interface ProcessEnv extends z.infer<typeof EnvSchema> {}
	}
}
