"use client";

import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";

function DashboardLayout({ children }: { children: ReactNode }) {
	return (
		<div className="relative w-full flex-col h-screen">
			<Navbar />
			<div className="w-full">{children}</div>
		</div>
	);
}

export default DashboardLayout;
