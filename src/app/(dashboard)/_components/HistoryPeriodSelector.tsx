"use client";

import { useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import type { GetHistoryPeriodType } from "@/app/api/stats/history/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Period, Timeframe } from "@/lib/types";

interface Props {
	period: Period;
	setPeriod: Dispatch<SetStateAction<Period>>;
	timeframe: Timeframe;
	setTimeframe: Dispatch<SetStateAction<Timeframe>>;
}

function HistoryPeriodSelector({
	period,
	setPeriod,
	timeframe,
	setTimeframe,
}: Props) {
	const query = useQuery<GetHistoryPeriodType>({
		queryKey: ["overview", "history", "periods"],
		queryFn: () => fetch("/api/stats/history").then((res) => res.json()),
	});

	return (
		<div className="flex flex-wrap items-center gap-4">
			<SkeletonWrapper isLoading={query.isFetching} fullWidth={false}>
				<Tabs
					value={timeframe}
					onValueChange={(value) => setTimeframe(value as Timeframe)}
				>
					<TabsList>
						<TabsTrigger value="year">Year</TabsTrigger>
						<TabsTrigger value="month">Month</TabsTrigger>
					</TabsList>
				</Tabs>
			</SkeletonWrapper>
			<div className="flex flex-wrap items-center gap-2">
				<SkeletonWrapper isLoading={query.isFetching} fullWidth={false}>
					<YearSelector
						period={period}
						setPeriod={setPeriod}
						years={query.data || []}
					/>
				</SkeletonWrapper>
				{timeframe === "month" && (
					<SkeletonWrapper isLoading={query.isFetching} fullWidth={false}>
						<MonthSelector period={period} setPeriod={setPeriod} />
					</SkeletonWrapper>
				)}
			</div>
		</div>
	);
}

function YearSelector({
	period,
	setPeriod,
	years,
}: {
	period: Period;
	setPeriod: Dispatch<SetStateAction<Period>>;
	years: GetHistoryPeriodType;
}) {
	return (
		<Select
			value={period.year.toString()}
			onValueChange={(value) =>
				setPeriod({ month: period.month, year: Number.parseInt(value) })
			}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{years.map((year, index) => (
					<SelectItem key={`idx-${index}-${year}`} value={year.toString()}>
						{year}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function MonthSelector({
	period,
	setPeriod,
}: {
	period: Period;
	setPeriod: Dispatch<SetStateAction<Period>>;
}) {
	const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
	return (
		<Select
			value={period.month.toString()}
			onValueChange={(value) =>
				setPeriod({ month: Number.parseInt(value), year: period.year })
			}
		>
			<SelectTrigger className="w-[180px]">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{months.map((month, index) => {
					const monthStr = new Date(period.year, month, 1).toLocaleString(
						"default",
						{ month: "long" },
					);
					return (
						<SelectItem
							key={`idx-${index}-${month}-${monthStr}`}
							value={month.toString()}
						>
							{monthStr}
						</SelectItem>
					);
				})}
			</SelectContent>
		</Select>
	);
}

export default HistoryPeriodSelector;
