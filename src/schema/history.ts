import { z } from "zod";

export const historicalDataSchema = z.object({
	timeframe: z.enum(["month", "year"]),
	month: z.coerce.number().min(0).max(11).default(0),
	year: z.coerce.number().min(2000).max(2030),
});

export type HistoricalDataType = z.infer<typeof historicalDataSchema>;
