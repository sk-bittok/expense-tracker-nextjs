"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
	CreateTransactionSchema,
	type CreateTransactionType,
} from "@/schema/transaction";

export async function CreateTransaction(form: CreateTransactionType) {
	const parsedBody = CreateTransactionSchema.safeParse(form);

	if (!parsedBody.success) {
		throw new Error(parsedBody.error.message);
	}

	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	const { description, date, amount, category, type } = parsedBody.data;

	const categoryRow = await prisma.category.findFirst({
		where: {
			userId: user.id,
			name: category,
		},
	});

	if (!categoryRow) {
		throw new Error(`Category ${category} not found!`);
	}

	// $transaction is not the table transaction - which stores incomes and expenses.

	await prisma.$transaction([
		// Create user transaction table
		prisma.transaction.create({
			data: {
				userId: user.id,
				amount,
				category: categoryRow.name,
				description: description || "",
				type,
				date,
				categoryIcon: categoryRow.icon,
			},
		}),

		// Update aggregate records
		// 1. monthly-aggregate
		prisma.monthHistory.upsert({
			where: {
				day_month_year_userId: {
					userId: user.id,
					day: date.getUTCDate(),
					month: date.getUTCMonth(),
					year: date.getUTCFullYear(),
				},
			},
			create: {
				userId: user.id,
				day: date.getUTCDate(),
				month: date.getUTCMonth(),
				year: date.getUTCFullYear(),
				expense: type === "expense" ? amount : 0,
				income: type === "income" ? amount : 0,
			},
			// Update monthly aggregate
			update: {
				expense: {
					increment: type === "expense" ? amount : 0,
				},
				income: {
					increment: type === "income" ? amount : 0,
				},
			},
		}),

		// 2. yearly-aggregate
		prisma.yearHistory.upsert({
			where: {
				month_year_userId: {
					userId: user.id,
					month: date.getUTCMonth(),
					year: date.getUTCFullYear(),
				},
			},
			create: {
				userId: user.id,
				month: date.getUTCMonth(),
				year: date.getUTCFullYear(),
				expense: type === "expense" ? amount : 0,
				income: type === "income" ? amount : 0,
			},
			// Update year aggregate
			update: {
				expense: {
					increment: type === "expense" ? amount : 0,
				},
				income: {
					increment: type === "income" ? amount : 0,
				},
			},
		}),
	]);
}
