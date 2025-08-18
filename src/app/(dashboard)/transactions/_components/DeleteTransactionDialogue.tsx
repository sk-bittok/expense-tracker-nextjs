"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
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
} from "@/components/ui/alert-dialog";
import { deleteTransaction } from "../_actions/transactions";

type Props = {
	transaction: string;
	open: boolean;
	setOpen: Dispatch<SetStateAction<boolean>>;
};

function DeleteTransactionDialogue({ transaction, open, setOpen }: Props) {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: deleteTransaction,
		onSuccess: async () => {
			toast.success("Transaction deleted successfully", {
				id: transaction,
			});

			queryClient.invalidateQueries({
				queryKey: ["transactions"],
			});
		},
		onError: () => {
			toast.error("Something went wrong. Try again later", {
				id: transaction,
			});
		},
	});

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete transaction?</AlertDialogTitle>
					<AlertDialogDescription>
						This action is irreversible and will permanently delete the
						transaction!
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => {
							toast.loading("Deleting category...", { id: transaction });
							mutation.mutate(transaction);
						}}
					>
						Delete
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

export default DeleteTransactionDialogue;
