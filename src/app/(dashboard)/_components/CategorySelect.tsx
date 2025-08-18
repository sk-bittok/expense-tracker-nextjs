"use client";

import { PopoverContent } from "@radix-ui/react-popover";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Popover, PopoverTrigger } from "@/components/ui/popover";
import type { Category } from "@/generated/prisma";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import CreateCategoryDialog from "./CreateCategoryDialog";

interface CategorySelectProps {
	type: TransactionType;
	onChange: (value: string) => void;
}

function CategorySelect({ type, onChange }: CategorySelectProps) {
	const [open, setOpen] = React.useState(false);
	const [value, setValue] = React.useState("");

	useEffect(() => {
		if (!value) {
			return;
		}
		onChange(value);
	}, [value, onChange]);

	const query = useQuery({
		queryKey: ["categories", type],
		queryFn: () =>
			fetch(`/api/categories?type=${type}`).then((res) => res.json()),
	});

	const selectedCategory = query.data?.find(
		(category: Category) => category.name === value,
	);

	const onCreateSuccess = useCallback((category: Category) => {
		setValue(category.name);
		setOpen((prev) => !prev);
	}, []);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant={"outline"}
					role="combobox"
					aria-expanded={open}
					className="w-[200px] justify-between"
				>
					{selectedCategory ? (
						<CategoryRow category={selectedCategory} />
					) : (
						"Select a category"
					)}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0 ">
				<Command
					onSubmit={(e) => {
						e.preventDefault();
					}}
				>
					<CommandInput placeholder="Search category..." />
					<CreateCategoryDialog type={type} onSuccess={onCreateSuccess} />
					<CommandEmpty>
						<p>Category not found</p>
						<p className="text-xs text-muted-foreground">
							Tip: Create a new category
						</p>
					</CommandEmpty>
					<CommandGroup>
						<CommandList>
							{query.data?.map((category: Category) => (
								<CommandItem
									key={category.name}
									onSelect={() => {
										setValue(category.name);
										setOpen((prev) => !prev);
									}}
								>
									<CategoryRow category={category} />
									<Check
										className={cn(
											"mr-2 w-4 h-4",
											value === category.name ? "opacity-100" : "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandList>
					</CommandGroup>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

function CategoryRow({ category }: { category: Category }) {
	return (
		<div className="flex items-center gap-2">
			<span role="img">{category.icon}</span>
			<span>{category.name}</span>
		</div>
	);
}

export default CategorySelect;
