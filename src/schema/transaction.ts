import z from "zod";

export const CreateTransactionSchema = z.object({
	amount: z.coerce
		.number()
		.positive("Amount must be a positive number")
		.multipleOf(0.01, "Amount must be a multiple of 0.01"),
	description: z.string().optional(),
	date: z.coerce.date(),
	category: z.string(),
	type: z.union([z.literal("income"), z.literal("expense")]),
});

export type CreateTransactionType = z.infer<typeof CreateTransactionSchema>;
