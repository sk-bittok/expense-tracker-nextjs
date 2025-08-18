import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	const periods = await getHistoryPeriod(user.id);

	return Response.json(periods);
}

async function getHistoryPeriod(userId: string) {
	const records = await prisma.monthHistory.findMany({
		where: {
			userId: userId,
		},
		select: {
			year: true,
		},
		distinct: ["year"],
		orderBy: [
			{
				year: "asc",
			},
		],
	});

	const years = records.map((item) => item.year);

	if (years.length === 0) {
		return [new Date().getFullYear()];
	}

	return years;
}

export type GetHistoryPeriodType = Awaited<ReturnType<typeof getHistoryPeriod>>;
