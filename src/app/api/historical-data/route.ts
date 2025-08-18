import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { Period, Timeframe } from "@/lib/types";
import { historicalDataSchema } from "@/schema/history";

export async function GET(request: Request) {
	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	const { searchParams } = new URL(request.url);
	const timeframe = searchParams.get("timeframe");
	const year = searchParams.get("year");
	const month = searchParams.get("month");

	const queryParams = historicalDataSchema.safeParse({
		timeframe,
		month,
		year,
	});

	if (!queryParams.success) {
		return Response.json(queryParams.error, { status: 400 });
	}

	const queryParamsData = queryParams.data;

	const data = await getHistoricalData(user.id, queryParamsData.timeframe, {
		month: queryParamsData.month,
		year: queryParamsData.year,
	});

	return Response.json(data);
}

async function getHistoricalData(
	userId: string,
	timeframe: Timeframe,
	period: Period,
) {
	switch (timeframe) {
		case "month":
			return await getMonthHistoricalData(userId, period);
		case "year":
			return await getYearHistoricalData(userId, period.year);
	}
}

export type GetHistoricalDataType = Awaited<
	ReturnType<typeof getHistoricalData>
>;

async function getYearHistoricalData(userId: string, year: number) {
	const result = await prisma.yearHistory.groupBy({
		by: ["month"],
		where: {
			userId,
			year,
		},
		_sum: {
			expense: true,
			income: true,
		},
		orderBy: [
			{
				month: "asc",
			},
		],
	});

	if (!result || result.length === 0) {
		return [];
	}

	const historicalData: HistoricalDataType[] = [];

	for (let i = 0; i < 12; i++) {
		let expense = 0;
		let income = 0;

		const month = result.find((row) => row.month === i);

		if (month) {
			expense = month._sum.expense || 0;
			income = month._sum.income || 0;
		}

		historicalData.push({
			year,
			month: i,
			expense,
			income,
		});
	}

	return historicalData;
}

async function getMonthHistoricalData(userId: string, period: Period) {
	const { month, year } = period;
	const result = await prisma.monthHistory.groupBy({
		by: ["day"],
		where: {
			userId,
			year,
			month,
		},
		_sum: {
			expense: true,
			income: true,
		},
		orderBy: [
			{
				day: "asc",
			},
		],
	});

	if (!result || result.length === 0) {
		return [];
	}

	const historicalData: HistoricalDataType[] = [];

	const daysInMonth = getDaysInMonth(new Date(year, month));

	for (let i = 1; i <= daysInMonth; i++) {
		let expense = 0;
		let income = 0;

		const day = result.find((row) => row.day === i);

		if (day) {
			expense = day._sum.expense || 0;
			income = day._sum.income || 0;
		}

		historicalData.push({
			expense,
			income,
			month,
			year,
			day: i,
		});
	}

	return historicalData;
}

export type HistoricalDataType = {
	expense: number;
	income: number;
	year: number;
	month: number;
	day?: number;
};
