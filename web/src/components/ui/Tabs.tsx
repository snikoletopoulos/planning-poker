"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/styles/utils";

export const Tabs = TabsPrimitive.Root;

export const TabsList = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof TabsPrimitive.List>) => (
	<TabsPrimitive.List
		className={cn(
			"bg-muted text-muted-foreground inline-flex h-10 items-center justify-center rounded-md p-1",
			className,
		)}
		{...props}
	/>
);

TabsList.displayName = TabsPrimitive.List.displayName;

export const TabsTrigger = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof TabsPrimitive.Trigger>) => (
	<TabsPrimitive.Trigger
		className={cn(
			"ring-offset-background focus-visible:ring-ring data-[state=active]:bg-background data-[state=active]:text-foreground inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm",
			className,
		)}
		{...props}
	/>
);

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

export const TabsContent = ({
	className,
	...props
}: React.ComponentPropsWithRef<typeof TabsPrimitive.Content>) => (
	<TabsPrimitive.Content
		className={cn(
			"ring-offset-background focus-visible:ring-ring mt-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
			className,
		)}
		{...props}
	/>
);

TabsContent.displayName = TabsPrimitive.Content.displayName;
