import { cn } from "@/lib/styles/utils";

const Skeleton = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) => (
		<div
			className={cn("bg-muted animate-pulse rounded-md", className)}
			{...props}
		/>
	)

export { Skeleton };
