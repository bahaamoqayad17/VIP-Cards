"use server";

import { connectToDatabase } from "@/lib/mongo";
import Category from "@/models/Category";

export async function getCategories() {
  await connectToDatabase();
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return {
      status: true,
      message: "Categories fetched successfully",
      data: categories,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "Failed to get categories",
      error: error,
      data: [],
    };
  }
}

export async function createCategory(data: { name: string; letter: string }) {
  await connectToDatabase();
  try {
    const { name, letter } = data;

    if (!name || name.trim().length === 0) {
      return {
        status: false,
        message: "اسم نوع المكان مطلوب",
        data: {},
      };
    }

    const category = await Category.create({
      name: name.trim(),
      letter: letter.trim(),
    });
    return {
      success: true,
      status: true,
      message: "تم إضافة نوع المكان بنجاح",
      data: category,
    };
  } catch (error: unknown) {
    console.error(error);
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return {
        success: false,
        status: false,
        message: "هذا نوع المكان موجود بالفعل",
        error: String(error),
        data: {},
      };
    }
    return {
      success: false,
      status: false,
      message: "فشل في إضافة نوع المكان",
      error: String(error),
      data: {},
    };
  }
}

export async function updateCategory(
  id: string,
  data: { name: string; letter: string }
) {
  await connectToDatabase();
  try {
    const { name, letter } = data;

    if (!name || name.trim().length === 0) {
      return {
        status: false,
        message: "اسم نوع المكان مطلوب",
        data: {},
      };
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name: name.trim(), letter: letter.trim() },
      { new: true }
    );

    if (!category) {
      return {
        success: false,
        status: false,
        message: "نوع المكان غير موجود",
        data: {},
      };
    }

    return {
      success: true,
      status: true,
      message: "تم تحديث نوع المكان بنجاح",
      data: category,
    };
  } catch (error: unknown) {
    console.error(error);
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return {
        success: false,
        status: false,
        message: "هذا نوع المكان موجود بالفعل",
        error: String(error),
        data: {},
      };
    }
    return {
      success: false,
      status: false,
      message: "فشل في تحديث نوع المكان",
      error: String(error),
      data: {},
    };
  }
}

export async function deleteCategory(id: string) {
  await connectToDatabase();
  try {
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return {
        success: false,
        status: false,
        message: "نوع المكان غير موجود",
        data: {},
      };
    }
    return {
      success: true,
      status: true,
      message: "تم حذف نوع المكان بنجاح",
      data: category,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      status: false,
      message: "فشل في حذف نوع المكان",
      error: error,
      data: {},
    };
  }
}
