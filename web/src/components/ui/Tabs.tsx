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
			"inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
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
			"inline-flex items-center justify-center rounded-sm px-3 py-1.5 text-sm font-medium whitespace-nowrap ring-offset-background transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
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
			"mt-2 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
			className,
		)}
		{...props}
	/>
);

TabsContent.displayName = TabsPrimitive.Content.displayName;
