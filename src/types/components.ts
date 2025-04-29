import type { PropsWithChildren } from "react";
import type { Metadata, ResolvingMetadata } from "next";

export interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export interface LayoutProps<TParams extends object = Record<string, never>>
	extends PropsWithChildren {
	params: Promise<TParams>;
}

export interface PageProps<
	TParams extends object = Record<string, never>,
	TSearchParams extends object = Record<string, never>,
> {
	params: Promise<TParams>;
	searchParams: Promise<TSearchParams>;
}

export type GenerateMetadata<
	TParams extends object = Record<string, never>,
	TSearchParams extends object = Record<string, never>,
> = (
	props: {
		params: Promise<TParams>;
		searchParams: Promise<TSearchParams>;
	},
	parent: ResolvingMetadata,
) => Promise<Metadata>;
