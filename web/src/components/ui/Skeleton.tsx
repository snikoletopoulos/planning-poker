import { cn } from "@/lib/styles/utils";

export const Skeleton = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
	<div
		className={cn("animate-pulse rounded-md bg-muted", className)}
		{...props}
	/>
);
