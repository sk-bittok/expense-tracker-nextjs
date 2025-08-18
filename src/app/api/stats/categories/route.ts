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

	const stats = await getCategoriesStats(
		user.id,
		queryParams.data.from,
		queryParams.data.to,
	);

	return Response.json(stats);
}

async function getCategoriesStats(userId: string, from: Date, to: Date) {
	const stats = await prisma.transaction.groupBy({
		by: ["type", "category", "categoryIcon"],
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
		orderBy: {
			_sum: {
				amount: "desc",
			},
		},
	});

	return stats;
}

export type GetCategoriesStatsType = Awaited<
	ReturnType<typeof getCategoriesStats>
>;
