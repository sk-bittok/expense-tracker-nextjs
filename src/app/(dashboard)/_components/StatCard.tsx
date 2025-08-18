import { useQuery } from "@tanstack/react-query";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { type ReactNode, useCallback, useMemo } from "react";
import Countup from "react-countup";
import type { GetBalanceStatsType } from "@/app/api/stats/balance/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card } from "@/components/ui/card";
import type { UserSettings } from "@/generated/prisma";
import { dateToUTCDate, getFormatterForCurrency } from "@/lib/helpers";

type Props = {
	userSettings: UserSettings;
	from: Date;
	to: Date;
};

export default function StatsCard({ userSettings, from, to }: Props) {
	const statsQuery = useQuery<GetBalanceStatsType>({
		queryKey: ["overview", "stats", from, to],
		queryFn: () =>
			fetch(
				`/api/stats/balance?from=${dateToUTCDate(from)}&to=${dateToUTCDate(to)}`,
			).then((res) => res.json()),
	});

	const formatter = useMemo(() => {
		return getFormatterForCurrency(userSettings.currency);
	}, [userSettings.currency]);

	const income = statsQuery.data?.income || 0;
	const expense = statsQuery.data?.expense || 0;

	const balance = income - expense;

	return (
		<div className="relative flex w-full flex-wrap gap-2 md:flex-nowrap">
			<SkeletonWrapper isLoading={statsQuery.isFetching}>
				<StatCard
					formatter={formatter}
					value={income}
					title="Income"
					icon={
						<TrendingUp className="h-12 w-12 rounded-lg p-2 bg-emerald-400/10 text-emerald-500" />
					}
				/>
			</SkeletonWrapper>

			<SkeletonWrapper isLoading={statsQuery.isFetching}>
				<StatCard
					formatter={formatter}
					value={expense}
					title="Expense"
					icon={
						<TrendingDown className="h-12 w-12 rounded-lg p-2 bg-rose-400/10 text-rose-500" />
					}
				/>
			</SkeletonWrapper>

			<SkeletonWrapper isLoading={statsQuery.isFetching}>
				<StatCard
					formatter={formatter}
					value={balance}
					title="Balance"
					icon={
						<Wallet className="h-12 w-12 rounded-lg p-2 bg-violet-400/10 text-violet-500" />
					}
				/>
			</SkeletonWrapper>
		</div>
	);
}

function StatCard({
	formatter,
	value,
	icon,
	title,
}: {
	formatter: Intl.NumberFormat;
	value: number;
	title: string;
	icon: ReactNode;
}) {
	const formatFn = useCallback(
		(value: number) => {
			return formatter.format(value);
		},
		[formatter],
	);

	return (
		<div className="flex w-full h-24 bg-card rounded-xl text-card-foreground shadow-sm py-6 border items-center gap-2 p-4">
			{icon}
			<div className="flex flex-col items-start gap-0">
				<p className="text-muted-foreground">{title}</p>
				<Countup
					preserveValue
					redraw={false}
					end={value}
					decimal="2"
					formattingFn={formatFn}
					className="text-2xl"
				/>
			</div>
		</div>
	);
}
