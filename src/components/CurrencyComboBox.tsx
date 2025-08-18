"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import * as React from "react";
import { toast } from "sonner";
import { UpdateUserCurrency } from "@/app/wizard/_actions/userSettings";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import type { UserSettings } from "@/generated/prisma";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Currencies, type Currency } from "@/lib/currencies";
import SkeletonWrapper from "./SkeletonWrapper";

export function CurrencyComboBox() {
	const [open, setOpen] = React.useState(false);
	const isDesktop = useMediaQuery("(min-width: 768px)");
	const [selectedCurrency, setSelectedCurrency] =
		React.useState<Currency | null>(null);

	const userSettings = useQuery<UserSettings>({
		queryKey: ["userSettings"],
		queryFn: () => fetch("/api/user-settings").then((res) => res.json()),
	});

	React.useEffect(() => {
		if (!userSettings.data) {
			return;
		}

		const userCurrency = Currencies.find(
			(currency) => currency.value === userSettings.data.currency,
		);

		if (userCurrency) {
			setSelectedCurrency(userCurrency);
		}
	}, [userSettings.data]);

	const updateMutation = useMutation({
		mutationFn: UpdateUserCurrency,
		onSuccess: (data: UserSettings) => {
			toast.success("Currency updated successfully!", {
				id: "update-currency",
			});

			setSelectedCurrency(
				Currencies.find((currency) => currency.value === data.currency) || null,
			);
		},
		onError: (error: Error) => {
			console.error("An error occurred ", error);
			toast.error("Failed to update currency.", {
				id: "update-currency",
			});
		},
	});

	const currencyOption = React.useCallback(
		(currency: Currency | null) => {
			if (!currency) {
				return toast.error("Please select a currency.");
			}

			toast.loading("Updating currency...", {
				id: "update-currency",
			});

			updateMutation.mutate(currency.value);
		},
		[updateMutation],
	);

	if (isDesktop) {
		return (
			<SkeletonWrapper isLoading={userSettings.isFetching} fullWidth>
				<Popover open={open} onOpenChange={setOpen}>
					<PopoverTrigger asChild>
						<Button
							variant="outline"
							className="w-full justify-start"
							disabled={updateMutation.isPending}
						>
							{selectedCurrency ? (
								<>{selectedCurrency.label}</>
							) : (
								<>+ Set currency</>
							)}
						</Button>
					</PopoverTrigger>
					<PopoverContent className="w-[200px] p-0" align="start">
						<CurrencyList
							setOpen={setOpen}
							setSelectedCurrency={currencyOption}
						/>
					</PopoverContent>
				</Popover>
			</SkeletonWrapper>
		);
	}

	return (
		<SkeletonWrapper isLoading={userSettings.isFetching} fullWidth>
			<Drawer open={open} onOpenChange={setOpen}>
				<DrawerTrigger asChild>
					<Button
						variant="outline"
						className="w-full justify-start"
						disabled={updateMutation.isPending}
					>
						{selectedCurrency ? (
							<>{selectedCurrency.label}</>
						) : (
							<>+ Set currency</>
						)}
					</Button>
				</DrawerTrigger>
				<DrawerContent>
					<div className="mt-4 border-t">
						<CurrencyList
							setOpen={setOpen}
							setSelectedCurrency={currencyOption}
						/>
					</div>
				</DrawerContent>
			</Drawer>
		</SkeletonWrapper>
	);
}

function CurrencyList({
	setOpen,
	setSelectedCurrency,
}: {
	setOpen: (open: boolean) => void;
	setSelectedCurrency: (currency: Currency | null) => void;
}) {
	return (
		<Command className="w-full">
			<CommandInput placeholder="Filter currency..." />
			<CommandList>
				<CommandEmpty>No results found.</CommandEmpty>
				<CommandGroup>
					{Currencies.map((currency: Currency) => (
						<CommandItem
							key={currency.value}
							value={currency.value}
							onSelect={(value) => {
								setSelectedCurrency(
									Currencies.find((priority) => priority.value === value) ||
										null,
								);
								setOpen(false);
							}}
						>
							{currency.label}
						</CommandItem>
					))}
				</CommandGroup>
			</CommandList>
		</Command>
	);
}
