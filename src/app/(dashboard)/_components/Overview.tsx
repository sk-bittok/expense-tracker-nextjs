"use client";

import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { UserSettings } from "@/generated/prisma";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import CategoriesStats from "./CategoriesStats";
import StatsCard from "./StatCard";

type Props = {
	userSettings: UserSettings;
};

function Overview({ userSettings }: Props) {
	const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
		from: startOfMonth(new Date()),
		to: new Date(),
	});

	return (
		<>
			<div className="flex flex-wrap items-end justify-between mx-auto gap-2 py-6 px-8 container">
				<h2 className="text-3xl font-bold">Overview</h2>
				<div className="flex items-center gap-3">
					<DateRangePicker
						initialDateFrom={dateRange.from}
						initialCompareTo={dateRange.to}
						showCompare={false}
						onUpdate={(dates) => {
							const { from, to } = dates.range;
							if (!from || !to) return;
							if (differenceInDays(to, from) > MAX_DATE_RANGE_DAYS) {
								toast.error(
									`Selected date range is too big. Maximum date range allowed is ${MAX_DATE_RANGE_DAYS} days.`,
								);
								return;
							}

							setDateRange({ from, to });
						}}
					/>
				</div>
			</div>
			<div className="flex flex-col w-full mx-auto space-y-4 px-8 gap-2 container">
				<StatsCard
					userSettings={userSettings}
					from={dateRange.from}
					to={dateRange.to}
				/>
				<CategoriesStats
					userSettings={userSettings}
					from={dateRange.from}
					to={dateRange.to}
				/>
			</div>
		</>
	);
}

export default Overview;
