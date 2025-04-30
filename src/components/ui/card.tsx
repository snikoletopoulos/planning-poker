import type { Ref } from "react";

import { cn } from "@/lib/styles/utils";

export const Card = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	ref?: Ref<HTMLDivElement>;
}) => (
	<div
		className={cn(
			"bg-card text-card-foreground rounded-lg border shadow-sm",
			className,
		)}
		{...props}
	/>
);

export const CardHeader = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	ref?: Ref<HTMLDivElement>;
}) => (
	<div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
);

export const CardTitle = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	ref?: Ref<HTMLDivElement>;
}) => (
	<div
		className={cn(
			"text-2xl leading-none font-semibold tracking-tight",
			className,
		)}
		{...props}
	/>
);

export const CardDescription = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	ref?: Ref<HTMLDivElement>;
}) => (
	<div className={cn("text-muted-foreground text-sm", className)} {...props} />
);

export const CardContent = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	ref?: Ref<HTMLDivElement>;
}) => <div className={cn("p-6 pt-0", className)} {...props} />;

export const CardFooter = ({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement> & {
	ref?: Ref<HTMLDivElement>;
}) => (
	<div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);
