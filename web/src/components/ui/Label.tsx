"use client";

import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/styles/utils";

const labelVariants = cva(
	"text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
);

export const Label = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof LabelPrimitive.Root> &
	VariantProps<typeof labelVariants>) => (
	<LabelPrimitive.Root className={cn(labelVariants(), className)} {...props} />
);

Label.displayName = LabelPrimitive.Root.displayName;
