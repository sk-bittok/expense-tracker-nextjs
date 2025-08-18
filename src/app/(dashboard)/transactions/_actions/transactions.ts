"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function deleteTransaction(transactionId: string) {
	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	const transaction = await prisma.transaction.findUnique({
		where: {
			id: transactionId,
			userId: user.id,
		},
	});

	if (!transaction) {
		throw new Error("Bad request");
	}

	await prisma.$transaction([
		// Delete transaction from database
		prisma.transaction.delete({
			where: {
				id: transaction.id,
				userId: user.id,
			},
		}),
		// update month and anual histories
		prisma.monthHistory.update({
			where: {
				day_month_year_userId: {
					userId: user.id,
					month: transaction.date.getUTCMonth(),
					year: transaction.date.getUTCFullYear(),
					day: transaction.date.getUTCDate(),
				},
			},
			data: {
				...(transaction.type === "expense"
					? { expense: { decrement: transaction.amount } }
					: { income: { decrement: transaction.amount } }),
			},
		}),

		prisma.yearHistory.update({
			where: {
				month_year_userId: {
					userId: user.id,
					month: transaction.date.getUTCMonth(),
					year: transaction.date.getUTCFullYear(),
				},
			},
			data: {
				...(transaction.type === "expense"
					? { expense: { decrement: transaction.amount } }
					: { income: { decrement: transaction.amount } }),
			},
		}),
	]);

	return transaction;
}
