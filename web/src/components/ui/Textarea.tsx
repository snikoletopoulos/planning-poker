import type { Ref } from "react";

import { cn } from "@/lib/styles/utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
	ref?: Ref<HTMLTextAreaElement>;
}

export const Textarea = ({ className, ...props }: TextareaProps) => (
	<textarea
		className={cn(
			"flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);

Textarea.displayName = "Textarea";
