import React, { type ReactNode } from "react";

function layout({ children }: { children: ReactNode }) {
	return (
		<div className="flex relative h-screen w-full flex-col items-center justify-center">
			{children}
		</div>
	);
}

export default layout;
