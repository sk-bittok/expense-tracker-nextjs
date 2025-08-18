import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getFormatterForCurrency } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { overviewQuerySchema } from "@/schema/overview";

export async function GET(request: Request) {
	const user = await currentUser();
	if (!user) {
		redirect("/sign-in");
	}

	const { searchParams } = new URL(request.url);
	const from = searchParams.get("from");
	const to = searchParams.get("to");

	const queryParams = overviewQuerySchema.safeParse({ from, to });
	if (!queryParams.success) {
		return Response.json(queryParams.error.message, { status: 400 });
	}

	const transactions = await getTransactionHistory(
		user.id,
		queryParams.data.from,
		queryParams.data.to,
	);

	return Response.json(transactions);
}

async function getTransactionHistory(userId: string, from: Date, to: Date) {
	const userSettings = await prisma.userSettings.findUnique({
		where: {
			userId,
		},
	});

	if (!userSettings) {
		throw new Error("user settings not found");
	}

	const formatter = getFormatterForCurrency(userSettings.currency);

	const transactions = await prisma.transaction.findMany({
		where: {
			userId: userId,
			date: {
				gte: from,
				lte: to,
			},
		},
		orderBy: {
			date: "desc",
		},
	});

	return transactions.map((transaction) => ({
		...transaction,
		// use the user's currency to format the amount
		formattedAmount: formatter.format(transaction.amount),
	}));
}

export type GetTransactionHistoryType = Awaited<
	ReturnType<typeof getTransactionHistory>
>;
