"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Category } from "@/generated/prisma";
import { deleteCategory } from "../_actions/categories";
import { TransactionType } from "@/lib/types";

interface Props {
	trigger: ReactNode;
	category: Category;
}

export default function DeleteCategoryDialog({ trigger, category }: Props) {
	const categoryIdentifier = `${category.name}-${category.type}`;

	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: deleteCategory,
		onSuccess: async () => {
			toast.success("Category deleted successfully", {
				id: categoryIdentifier,
			});

			queryClient.invalidateQueries({
				queryKey: ["categories"],
			});
		},
		onError: () => {
			toast.error("Something went wrong. Try again later", {
				id: categoryIdentifier,
			});
		},
	});

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete {category.name}?</AlertDialogTitle>
					<AlertDialogDescription>
						This action is irreversible and will permanently delete the
						category!
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							toast.loading("Deleting category...", { id: categoryIdentifier });
							mutation.mutate({
								name: category.name,
								type: category.type as TransactionType,
							});
						}}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
