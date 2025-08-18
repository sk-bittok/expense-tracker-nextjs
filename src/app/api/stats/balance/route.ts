import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
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

	const stats = await getBalanceStats(
		user.id,
		queryParams.data.from,
		queryParams.data.to,
	);

	return Response.json(stats);
}

async function getBalanceStats(userId: string, from: Date, to: Date) {
	const totals = await prisma.transaction.groupBy({
		by: ["type"],
		where: {
			userId: userId,
			date: {
				gte: from,
				lte: to,
			},
		},
		_sum: {
			amount: true,
		},
	});

	return {
		expense: totals.find((t) => t.type === "expense")?._sum.amount || 0,
		income: totals.find((t) => t.type === "income")?._sum.amount || 0,
	};
}

export type GetBalanceStatsType = Awaited<ReturnType<typeof getBalanceStats>>;
