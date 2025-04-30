import type { Ref } from "react";

import { cn } from "@/lib/styles/utils";

export interface TextareaProps
	extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = ({
	className,
	...props
}: TextareaProps & { ref?: Ref<HTMLTextAreaElement> }) => (
	<textarea
		className={cn(
			"border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
			className,
		)}
		{...props}
	/>
);

Textarea.displayName = "Textarea";
