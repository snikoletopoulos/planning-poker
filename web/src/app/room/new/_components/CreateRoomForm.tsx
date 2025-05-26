"use client";

import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	createFormControl,
	useFieldArray,
	useForm,
	useFormState,
} from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { CardContent, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import type { Room } from "@/lib/db/schema";
import { PasteFromClipboardButton } from "./PasteFromClipboardButton";

const CreateRoomSchema = z.object({
	roomName: z.string().min(1, "Room name is required"),
	name: z.string().min(1, "Name is required"),
	stories: z
		.array(
			z.object({
				title: z.string().min(1, "Story title is required"),
				description: z.string(),
			}),
		)
		.min(1, "At least one story is required"),
});

export type CreateRoomFormData = z.infer<typeof CreateRoomSchema>;

const { formControl, register, handleSubmit, control, setError } =
	createFormControl({
		resolver: zodResolver(CreateRoomSchema),
		defaultValues: {
			roomName: "",
			name: "",
			stories: [],
		},
	});

export const CreateRoomForm = ({
	onSubmitAction,
}: {
	onSubmitAction: (
		data: z.infer<typeof CreateRoomSchema>,
	) => Promise<Room["id"]>;
}) => {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const {
		formState: { isValid, isSubmitting, errors },
	} = useForm({ formControl });

	const {
		fields: stories,
		append,
		remove,
	} = useFieldArray({
		control,
		name: "stories",
	});

	const handleCreateRoom = handleSubmit(async data => {
		try {
			const roomId = await onSubmitAction(data);
			router.push(`/room/${roomId}`);
		} catch (error) {
			console.error("[CREATE_ROOM:SUBMIT]", error);
			setError("root", { message: "Internal server error" });
		}
	});

	return (
		<>
			<CardContent className="space-y-6">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div className="space-y-2">
						<Label htmlFor="room-name">Room Name</Label>
						<Input
							id="room-name"
							{...register("roomName")}
							placeholder="Sprint Planning"
						/>
						{errors.roomName && (
							<p className="text-sm text-red-500">{errors.roomName.message}</p>
						)}
					</div>

					<div className="space-y-2">
						<Label htmlFor="name">Your Name</Label>
						<Input
							id="name"
							{...register("name")}
							placeholder="Enter your name"
						/>
						{errors.name && (
							<p className="text-sm text-red-500">{errors.name.message}</p>
						)}
					</div>
				</div>

				<div>
					<Label>Stories to Estimate</Label>

					<div className="mt-2 space-y-4">
						{stories.map((story, index) => (
							<StoryInput
								key={story.id}
								index={index}
								showDeleteButton={stories.length > 1}
								onRemove={() => remove(index)}
							/>
						))}
						{errors.stories && (
							<p className="text-sm text-red-500">{errors.stories.message}</p>
						)}

						<div className="flex items-center justify-between gap-4">
							<PasteFromClipboardButton
								loading={isPending}
								addStory={title => {
									startTransition(() => {
										append({ title, description: "" });
									});
								}}
							/>

							<Button
								variant="secondary"
								onClick={() => append({ title: "", description: "" })}
								className="w-full"
							>
								<Plus />
								Add Another Story
							</Button>
						</div>
					</div>
				</div>
			</CardContent>

			<CardFooter>
				<Button
					onClick={handleCreateRoom}
					className="w-full"
					disabled={!isValid || isSubmitting}
				>
					Create Room
				</Button>
			</CardFooter>

			{errors.root && (
				<p className="mb-5 text-center text-sm text-red-500">
					{errors.root.message}
				</p>
			)}
		</>
	);
};

export const StoryInput = ({
	onRemove,
	index,
	showDeleteButton = false,
}: {
	onRemove: () => void;
	index: number;
	showDeleteButton: boolean;
}) => {
	const { errors } = useFormState({ control });

	return (
		<div className="bg-muted rounded-md border p-4">
			<div className="mb-2 flex items-center justify-between">
				<h4 className="font-medium">Story {index + 1}</h4>

				{showDeleteButton && (
					<Button
						variant="ghost"
						size="sm"
						onClick={onRemove}
						className="text-muted-foreground h-8 hover:text-red-500"
					>
						Remove
					</Button>
				)}
			</div>

			<div className="space-y-3">
				<div>
					<Label htmlFor={`story-title-${index}`}>Title</Label>
					<Input
						id={`story-title-${index}`}
						{...register(`stories.${index}.title`)}
						placeholder="User Authentication"
						className="mt-1"
					/>
					{errors.stories?.[index]?.title && (
						<p className="text-sm text-red-500">
							{errors.stories[index].title.message}
						</p>
					)}
				</div>

				<div>
					<Label htmlFor={`story-desc-${index}`}>Description</Label>
					<Textarea
						id={`story-desc-${index}`}
						{...register(`stories.${index}.description`)}
						placeholder="Implement user login and registration functionality"
						className="mt-1"
						rows={2}
					/>
				</div>
			</div>
		</div>
	);
};
