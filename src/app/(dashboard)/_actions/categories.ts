"use server";

import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
	CreateCategorySchema,
	deleteCategorySchema,
	DeleteCategoryType,
	type CreateCategoryType,
} from "@/schema/categories";

export async function CreateCategory(form: CreateCategoryType) {
	const parsedBody = CreateCategorySchema.safeParse(form);

	if (!parsedBody.success) {
		throw new Error("Bad Request");
	}

	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	const { name, icon, type } = parsedBody.data;

	const data = await prisma.category.create({
		data: {
			userId: user.id,
			name,
			icon,
			type,
		},
	});

	return data;
}

export async function deleteCategory(form: DeleteCategoryType) {
	const parsedBody = deleteCategorySchema.safeParse(form);

	if (!parsedBody.success) {
		throw new Error("Bad Request");
	}

	const user = await currentUser();

	if (!user) {
		redirect("/sign-in");
	}

	const { name, type } = parsedBody.data;

	const categories = await prisma.category.delete({
		where: {
			name_userId_type: {
				name,
				userId: user.id,
				type,
			},
		},
	});

	return categories;
}
