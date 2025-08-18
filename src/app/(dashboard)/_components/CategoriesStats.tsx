import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import type { GetCategoriesStatsType } from "@/app/api/stats/categories/route";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UserSettings } from "@/generated/prisma";
import { dateToUTCDate, getFormatterForCurrency } from "@/lib/helpers";
import type { TransactionType } from "@/lib/types";

type Props = {
	userSettings: UserSettings;
	from: Date;
	to: Date;
};

export default function CategoriesStats({ userSettings, from, to }: Props) {
	const query = useQuery<GetCategoriesStatsType>({
		queryKey: ["overview", "stats", "categories", from, to],
		queryFn: () =>
			fetch(
				`/api/stats/categories?from=${dateToUTCDate(from)}&to=${dateToUTCDate(to)}`,
			).then((res) => res.json()),
	});

	const formatter = useMemo(() => {
		return getFormatterForCurrency(userSettings.currency);
	}, [userSettings.currency]);

	return (
		<div className="flex flex-wrap w-full gap-2 md:flex-nowrap">
			<SkeletonWrapper isLoading={query.isFetching}>
				<CategoriesCard
					formatter={formatter}
					type="income"
					data={query.data || []}
				/>
			</SkeletonWrapper>

			<SkeletonWrapper isLoading={query.isFetching}>
				<CategoriesCard
					formatter={formatter}
					type="expense"
					data={query.data || []}
				/>
			</SkeletonWrapper>
		</div>
	);
}

function CategoriesCard({
	data,
	type,
	formatter,
}: {
	data: GetCategoriesStatsType;
	type: TransactionType;
	formatter: Intl.NumberFormat;
}) {
	const filteredData = data.filter((el) => el.type === type);
	const total = filteredData.reduce(
		(acc, el) => acc + (el._sum?.amount || 0),
		0,
	);

	return (
		<Card className="h-80 w-full col-span-6">
			<CardHeader>
				<CardTitle className="grid grid-flow-row justify-between gap-2 text-muted-foreground md:grid-flow-col">
					{type === "income" ? "Incomes" : "Expenses"} by Category
				</CardTitle>
			</CardHeader>

			<div className="flex items-center justify-between gap-2">
				{filteredData.length === 0 ? (
					<div className="flex h-60 w-full flex-col items-center justify-center">
						No data for the selected period
						<p className="text-sm text-muted-foreground">
							Try selecting a different period or adding a new {type}
						</p>
					</div>
				) : (
					<ScrollArea className="h-60 w-full px-4">
						<div className="flex w-full flex-col gap-4 p-4">
							{filteredData.map((item, index) => {
								const amount = item._sum.amount || 0;
								const percentage = (amount * 100) / (total || amount);

								return (
									<div
										key={`idx-${index}-${item.type}`}
										className="flex flex-col gap-2"
									>
										<div className="flex items-center justify-between">
											<span className="flex items-center text-gray-400">
												{item.categoryIcon} {item.category}
												<span className="ml-2 text-xs text-muted-foreground">
													({percentage.toFixed(0)}%)
												</span>
											</span>
											<span className="text-sm text-gray-400">
												{formatter.format(amount)}
											</span>
										</div>
										<Progress
											value={percentage}
											indicator={
												type === "income" ? "bg-emerald-500" : "bg-rose-500"
											}
										/>
									</div>
								);
							})}
						</div>
					</ScrollArea>
				)}
			</div>
		</Card>
	);
}
