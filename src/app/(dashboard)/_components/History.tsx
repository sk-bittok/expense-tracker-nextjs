"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import CountUp from "react-countup";
import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";
import type { GetHistoryPeriodType } from "@/app/api/stats/history/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserSettings } from "@/generated/prisma";
import { getFormatterForCurrency } from "@/lib/helpers";
import type { Period, Timeframe } from "@/lib/types";
import { cn } from "@/lib/utils";
import HistoryPeriodSelector from "./HistoryPeriodSelector";

interface Props {
	userSettings: UserSettings;
}

function History({ userSettings }: Props) {
	const [timeframe, setTimeframe] = useState<Timeframe>("month");
	const [period, setPeriod] = useState<Period>({
		year: new Date().getFullYear(),
		month: new Date().getMonth(),
	});

	const formatter = useMemo(() => {
		return getFormatterForCurrency(userSettings.currency);
	}, [userSettings.currency]);

	const query = useQuery<GetHistoryPeriodType>({
		queryKey: ["overview", "history", timeframe, period],
		queryFn: () =>
			fetch(
				`/api/historical-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`,
			).then((response) => response.json()),
	});

	const dataAvailable = query.data && query.data.length > 0;

	return (
		<div className="container px-8 w-full flex flex-col mx-auto">
			<h2 className="mt-12 text-3xl font-bold">History</h2>
			<Card className="col-span-12 mt-2 w-full">
				<CardHeader className="gap-2">
					<CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
						<HistoryPeriodSelector
							period={period}
							setPeriod={setPeriod}
							timeframe={timeframe}
							setTimeframe={setTimeframe}
						/>
						<div className="flex h-10 gap-2 ">
							<Badge
								variant={"outline"}
								className="flex items-center gap-2 text-sm"
							>
								<div className="h-4 w-4 rounded-full bg-emerald-500"></div>
								Income
							</Badge>

							<Badge
								variant={"outline"}
								className="flex items-center gap-2 text-sm"
							>
								<div className="h-4 w-4 rounded-full bg-rose-500"></div>
								Expense
							</Badge>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<SkeletonWrapper isLoading={query.isFetching}>
						{dataAvailable ? (
							<ResponsiveContainer width={"100%"} height={300} className="">
								<BarChart height={300} data={query.data} barCategoryGap={5}>
									<defs>
										<linearGradient
											id={"incomeBar"}
											x1="0"
											y1="0"
											x2="0"
											y2={1}
										>
											<stop
												offset={"0"}
												stopColor="#10B981"
												stopOpacity={"1"}
											/>
											<stop
												offset={"1"}
												stopColor="#10B981"
												stopOpacity={"0"}
											/>
										</linearGradient>

										<linearGradient
											id={"expenseBar"}
											x1="0"
											y1="0"
											x2="0"
											y2={1}
										>
											<stop
												offset={"0"}
												stopColor="#EF4444"
												stopOpacity={"1"}
											/>
											<stop
												offset={"1"}
												stopColor="#EF4444"
												stopOpacity={"0"}
											/>
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="5 5"
										stopOpacity={"0.2"}
										vertical={false}
									/>
									<XAxis
										stroke="#888888"
										fontSize={12}
										tickLine={false}
										axisLine={false}
										padding={{ left: 5, right: 5 }}
										dataKey={(data) => {
											const { year, month, day } = data;
											const date = new Date(year, month, day || 1);
											if (timeframe === "year") {
												return date.toLocaleDateString("default", {
													month: "long",
												});
											}

											return date.toLocaleDateString("default", {
												day: "2-digit",
											});
										}}
									/>
									<YAxis
										stroke="#888888"
										fontSize={12}
										tickLine={false}
										axisLine={false}
									/>
									<Bar
										dataKey={"income"}
										label="Income"
										fill="url(#incomeBar)"
										radius={4}
										className="cursor-pointer"
									/>

									<Bar
										dataKey={"expense"}
										label="Expense"
										fill="url(#expenseBar)"
										radius={4}
										className="cursor-pointer"
									/>
									<Tooltip
										cursor={{ opacity: 0.1 }}
										content={(props) => (
											<CustomTooltip formatter={formatter} {...props} />
										)}
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<Card className="flex flex-col items-center bg-background justify-center h-[300px]">
								No data for selected period
								<p className="text-sm text-muted-foreground">
									Try selecting a different period or adding a new transaction.
								</p>
							</Card>
						)}
					</SkeletonWrapper>
				</CardContent>
			</Card>
		</div>
	);
}

function CustomTooltip({
	formatter,
	payload,
	active,
}: {
	formatter: Intl.NumberFormat;
	payload: any;
	active: boolean;
}) {
	if (!active || !payload || payload.length === 0) {
		return null;
	}
	const data = payload[0].payload;
	const { expense, income } = data;
	return (
		<div className="min-w-[300px] rounded border bg-background p-4">
			<TooltipRow
				formatter={formatter}
				label="Income"
				value={income}
				bgColour="bg-emerald-500"
				textColour="text-emerald-500"
			/>

			<TooltipRow
				formatter={formatter}
				label="Expense"
				value={expense}
				bgColour="bg-rose-500"
				textColour="text-rose-500"
			/>

			<TooltipRow
				formatter={formatter}
				label="Balance"
				value={income - expense}
				bgColour="bg-gray-100"
				textColour="text-foreground"
			/>
		</div>
	);
}

function TooltipRow({
	formatter,
	label,
	value,
	bgColour,
	textColour,
}: {
	label: string;
	value: number;
	textColour: string;
	bgColour: string;
	formatter: Intl.NumberFormat;
}) {
	const formattingFn = useCallback(
		(value: number) => {
			return formatter.format(value);
		},
		[formatter],
	);

	return (
		<div
			className="flex items-center
			 gap-2"
		>
			<div className={cn("h-4 w-4 rounded-full", bgColour)} />
			<div className="flex w-full justify-between">
				<p className="text-sm text-muted-foreground">{label}</p>
				<div className={cn("text-sm font-bold", textColour)}>
					<CountUp
						duration={0.5}
						preserveValue
						end={value}
						decimals={0}
						formattingFn={formattingFn}
						className="text-sm"
					/>
				</div>
			</div>
		</div>
	);
}

export default History;
