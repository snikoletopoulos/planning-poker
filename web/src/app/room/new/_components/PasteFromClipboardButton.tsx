"use client";

import { Button } from "@/components/ui/Button";

export const PasteFromClipboardButton = ({
	addStory,
	loading,
}: {
	addStory: (storyTitle: string) => void;
	loading: boolean;
}) => {
	const handlePasteFromClipboard = async () => {
		const result = await navigator.clipboard.readText();
		result.split("\n").forEach(addStory);
	};

	return (
		<Button
		  variant="secondary"
			className="w-full"
			disabled={loading}
			onClick={handlePasteFromClipboard}
		>
			Paste from clipboard
		</Button>
	);
};
