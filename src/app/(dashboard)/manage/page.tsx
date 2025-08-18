"use client";

import { useQuery } from "@tanstack/react-query";
import { PlusSquare, Trash, TrendingDown, TrendingUp } from "lucide-react";
import { CurrencyComboBox } from "@/components/CurrencyComboBox";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Category } from "@/generated/prisma";
import type { TransactionType } from "@/lib/types";
import { cn } from "@/lib/utils";
import CreateCategoryDialog from "../_components/CreateCategoryDialog";
import DeleteCategoryDialog from "../_components/DeleteCategoryDialog";

export default function ManagePage() {
	return (
		<>
			<div className="border-b bg-card">
				<div className="container flex flex-wrap items-center justify-between gap-6 py-8 mx-auto">
					<div>
						<h2 className="text-3xl font-bold">Manage</h2>
						<p className="text-muted-foreground">
							Manage account settings and categories
						</p>
					</div>
				</div>
			</div>
			<div className="container flex flex-col gap-4 p-4 mx-auto">
				<Card>
					<CardHeader>
						<CardTitle>Currency</CardTitle>
						<CardDescription>
							Set your default currency for transactions
						</CardDescription>
					</CardHeader>
					<CardContent>
						<CurrencyComboBox />
					</CardContent>
				</Card>
				<CategoryList type="income" />
				<CategoryList type="expense" />
			</div>
		</>
	);
}

function CategoryList({ type }: { type: TransactionType }) {
	const query = useQuery({
		queryKey: ["categories", type],
		queryFn: () =>
			fetch(`/api/categories?type=${type}`).then((response) => response.json()),
	});

	const dataAvailable = query.data && query.data.length > 0;

	return (
		<SkeletonWrapper isLoading={query.isLoading}>
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center justify-between gap-2">
						<div className="flex items-center gap-2">
							{type === "expense" ? (
								<TrendingDown className="h-12 w-12 items-center rounded-lg bg-rose-400/10 text-rose-500 p-2" />
							) : (
								<TrendingUp className="h-12 w-12 rounded-lg bg-emerald-400/10 text-emerald-500 items-center p-2" />
							)}
							<div className="">
								<h3 className="capitalize">{`${type} categories`}</h3>
								<div className="text-sm text-muted-foreground">
									Sorted by name
								</div>
							</div>
						</div>
						<CreateCategoryDialog
							type={type}
							onSuccess={() => query.refetch()}
							trigger={
								<Button className="text-sm gap-2">
									<PlusSquare className="h-4 w-4" />
									Create Category
								</Button>
							}
						/>
					</CardTitle>
				</CardHeader>
				<Separator className="" />
				{dataAvailable ? (
					<div className="grid grid-flow-row gap-2 p-2 sm:grid-flow-row sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
						{query.data.map((category: Category) => (
							<CategoryCard category={category} key={category.name} />
						))}
					</div>
				) : (
					<div className="flex h-40 w-full items-center justify-center">
						<p>
							No&nbsp;
							<span
								className={cn(
									"m-1",
									type === "income" ? "text-emerald-500" : "text-rose-500",
								)}
							>
								{type}&nbsp;
							</span>
							categories yet.
						</p>
						<p className="text-sm text-muted-foreground">
							Add a category to get started.
						</p>
					</div>
				)}
			</Card>
		</SkeletonWrapper>
	);
}

function CategoryCard({ category }: { category: Category }) {
	return (
		<div className="flex border-separate rounded-md flex-col justify-between shadow-md border shadow-black/[0.1] dark:shadow-white/[0.1]">
			<div className="flex flex-col items-center gap-2 p-4">
				<span className="text-3xl" role="img">
					{category.icon}
				</span>
				<span>{category.name}</span>
			</div>
			<DeleteCategoryDialog
				category={category}
				trigger={
					<Button
						className="group flex w-full border-separate gap-2 items-center rounded-t-none text-muted-foreground hover:bg-red-500/20"
						variant={"secondary"}
					>
						<Trash className="h-4 w-4 shake-on-hover transition-transform duration-300" />
						Delete
					</Button>
				}
			/>
		</div>
	);
}
