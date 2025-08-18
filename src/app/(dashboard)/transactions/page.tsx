"use client";

import { differenceInDays, startOfMonth } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import TransactionTable from "./_components/TransactionTable";

export default function TransactionsPage() {
	const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
		from: startOfMonth(new Date()),
		to: new Date(),
	});

	return (
		<>
			<div className="border-b bg-card">
				<div className="container flex flex-wrap items-center justify-between gap-6 py-8 mx-auto">
					<div>
						<h2 className="text-3xl font-bold">Transaction History</h2>
						<p className="text-muted-foreground">
							View your account transactions by type and categories
						</p>
					</div>
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
			<TransactionTable from={dateRange.from} to={dateRange.to} />
		</>
	);
}
