"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/styles/utils";

export const Avatar = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof AvatarPrimitive.Root>) => (
	<AvatarPrimitive.Root
		className={cn(
			"relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
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
		className={cn("aspect-square h-full w-full", className)}
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
			"bg-muted flex h-full w-full items-center justify-center rounded-full",
			className,
		)}
		{...props}
	/>
);

AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
