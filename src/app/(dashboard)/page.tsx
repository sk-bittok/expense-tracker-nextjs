import { currentUser } from "@clerk/nextjs/server";
import { Minus, Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import CreateTransactionDialogue from "./_components/CreateTransactionDialogue";
import History from "./_components/History";
import Overview from "./_components/Overview";

async function DashboardPage() {
	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	const userSettings = await prisma.userSettings.findUnique({
		where: {
			userId: user.id,
		},
	});

	if (!userSettings) {
		redirect("/wizard");
	}

	return (
		<div className="h-full bg-background">
			<div className="border-b bg-card mx-auto">
				<div className="flex flex-wrap items-center justify-between gap-6 py-8 mx-auto container">
					<p className="text-3xl font-bold">
						Hello, {user.firstName || user.username}!
					</p>
					<div className="flex items-center gap-4">
						<CreateTransactionDialogue
							type="income"
							trigger={
								<Button
									variant="default"
									className="group flex items-center gap-1 border-emerald-500 bg-emerald-900 text-white hover:bg-emerald-800 hover:text-white"
								>
									<Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
									New Income
								</Button>
							}
						/>
						<CreateTransactionDialogue
							type="expense"
							trigger={
								<Button
									variant="default"
									className="group flex items-center gap-1 border-rose-500 bg-rose-900 text-white hover:bg-rose-800 hover:text-white"
								>
									<Minus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
									New Expense
								</Button>
							}
						/>
					</div>
				</div>
			</div>
			<div className="h-full">
				<Overview userSettings={userSettings} />
				<History userSettings={userSettings} />
			</div>
		</div>
	);
}

export default DashboardPage;
