"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { type ReactNode, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { dateToUTCDate } from "@/lib/helpers";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
	CreateTransactionSchema,
	type CreateTransactionType,
} from "@/schema/transaction";
import { CreateTransaction } from "../_actions/transactions";
import CategorySelect from "./CategorySelect";

interface Props {
	trigger: ReactNode;
	type: TransactionType;
}

function CreateTransactionDialogue({ trigger, type }: Props) {
	const [openDate, setOpenDate] = useState(false);
	const [open, setOpen] = useState(false);

	const form = useForm<CreateTransactionType>({
		resolver: zodResolver(CreateTransactionSchema),
		defaultValues: {
			type,
			date: new Date(),
			amount: 0.0,
			description: "",
		},
	});

	const queryClient = useQueryClient();

	const { mutate, isPending } = useMutation({
		mutationFn: CreateTransaction,
		onSuccess: () => {
			toast.success("Transaction added successfully", {
				id: "create-transaction",
			});

			form.reset({
				type,
				description: "",
				amount: 0,
				date: new Date(),
				category: undefined,
			});

			// Refetch the homepage to reflect new additions and aggregation (overview)
			queryClient.invalidateQueries({ queryKey: ["overview"] });

			setOpen((prev) => !prev);
		},
	});

	const handleCategoryChange = useCallback(
		(value: string) => {
			form.setValue("category", value);
		},
		[form.setValue],
	);

	const handleSubmit = useCallback(
		(data: CreateTransactionType) => {
			toast.loading("Creating transaction", {
				id: "create-transaction",
			});
			mutate({ ...data, date: dateToUTCDate(data.date) });
		},
		[mutate],
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>{trigger}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						Add a new
						<span
							className={cn(
								"m-1",
								type === "income" ? "text-emerald-500" : "text-rose-500",
							)}
						>
							{type}
						</span>
						transaction
					</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<div className="flex items-center justify-between gap-2">
							<FormField
								control={form.control}
								name="category"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Category</FormLabel>
										<FormControl>
											<CategorySelect
												type={type}
												onChange={handleCategoryChange}
											/>
										</FormControl>
										<FormDescription>
											Select a transaction category
										</FormDescription>
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="date"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Date</FormLabel>
										<Popover open={openDate} onOpenChange={setOpenDate}>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															"w-[200px] font-normal text-left pl-3",
															!field.value && "text-muted-foreground",
														)}
													>
														{field.value ? (
															format(field.value, "PPP")
														) : (
															<span>Select a date</span>
														)}
														<CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
													</Button>
												</FormControl>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0" align="start">
												<Calendar
													mode="single"
													selected={field.value}
													captionLayout="dropdown"
													onSelect={(date) => {
														field.onChange(date);
														if (!date) return;
														setOpenDate(false);
													}}
													autoFocus={true}
													disabled={(date) =>
														date > new Date() || date < new Date("1970-01-01")
													}
												/>
											</PopoverContent>
										</Popover>
										<FormDescription>
											Transaction date (required)
										</FormDescription>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<FormField
							control={form.control}
							name="amount"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Amount</FormLabel>
									<FormControl>
										<Input defaultValue={0.0} type="number" {...field} />
									</FormControl>
									<FormDescription>
										Transaction amount (required)
									</FormDescription>
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description</FormLabel>
									<FormControl>
										<Input defaultValue={""} {...field} />
									</FormControl>
									<FormDescription>
										Describe the transaction (optional)
									</FormDescription>
								</FormItem>
							)}
						/>
					</form>
				</Form>

				<DialogFooter>
					<DialogClose asChild>
						<Button
							type="button"
							variant={"secondary"}
							onClick={() => form.reset()}
						>
							Cancel
						</Button>
					</DialogClose>
					<Button
						onClick={form.handleSubmit(handleSubmit)}
						disabled={isPending}
					>
						{!isPending && "Create"}
						{isPending && <Loader2 className="animate-spin" />}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default CreateTransactionDialogue;
