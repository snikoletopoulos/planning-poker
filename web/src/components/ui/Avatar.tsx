"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/styles/utils";

export const Avatar = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Root>) => (
	<AvatarPrimitive.Root
		className={cn(
			"relative flex size-10 shrink-0 overflow-hidden rounded-full",
			className,
		)}
		{...props}
	/>
);

Avatar.displayName = AvatarPrimitive.Root.displayName;

export const AvatarImage = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Image>) => (
	<AvatarPrimitive.Image
		className={cn("aspect-square size-full", className)}
		{...props}
	/>
);

AvatarImage.displayName = AvatarPrimitive.Image.displayName;

export const AvatarFallback = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Fallback>) => (
	<AvatarPrimitive.Fallback
		className={cn(
			"flex size-full items-center justify-center rounded-full bg-muted",
			className,
		)}
		{...props}
	/>
);

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
