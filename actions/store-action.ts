"use server";

import { connectToDatabase } from "@/lib/mongo";
import Store from "@/models/Store";

export async function getStores() {
  await connectToDatabase();
  try {
    const stores = await Store.find()
      .sort({ createdAt: -1 })
      .populate("place")
      .populate("category");
    return {
      status: true,
      message: "Stores fetched successfully",
      data: stores,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "Failed to get stores",
      error: error,
      data: [],
    };
  }
}

export async function createStore(data: {
  name: string;
  place: string;
  category: string;
  discount: number;
}) {
  await connectToDatabase();
  try {
    const { name, place, category, discount } = data;

    if (!name || name.trim().length === 0) {
      return {
        status: false,
        message: "اسم المحل مطلوب",
        data: {},
      };
    }

    const store = await Store.create({
      name: name.trim(),
      place: place.trim(),
      category: category.trim(),
      discount: discount,
    });
    return {
      success: true,
      status: true,
      message: "تم إضافة المحل بنجاح",
      data: store,
    };
  } catch (error: unknown) {
    console.error(error);
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return {
        success: false,
        status: false,
        message: "هذا المحل موجود بالفعل",
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

export async function updateStore(
  id: string,
  data: { name: string; place: string; category: string; discount: number }
) {
  await connectToDatabase();
  try {
    const { name, place, category, discount } = data;

    if (!name || name.trim().length === 0) {
      return {
        status: false,
        message: "اسم المحل مطلوب",
        data: {},
      };
    }
    const store = await Store.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        place: place.trim(),
        category: category.trim(),
        discount: discount,
      },
      { new: true }
    );
    if (!store) {
      return {
        success: false,
        status: false,
        message: "المحل غير موجود",
        data: {},
      };
    }

    return {
      success: true,
      status: true,
      message: "تم تحديث المحل بنجاح",
      data: store,
    };
  } catch (error: unknown) {
    console.error(error);
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return {
        success: false,
        status: false,
        message: "هذا المحل موجود بالفعل",
        error: String(error),
        data: {},
      };
    }
    return {
      success: false,
      status: false,
      message: "فشل في تحديث المحل",
      error: String(error),
      data: {},
    };
  }
}

export async function deleteStore(id: string) {
  await connectToDatabase();
  try {
    const store = await Store.findByIdAndDelete(id);
    if (!store) {
      return {
        success: false,
        status: false,
        message: "المحل غير موجود",
        data: {},
      };
    }
    return {
      success: true,
      message: "تم حذف المحل بنجاح",
      data: store,
      status: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      status: false,
      message: "فشل في حذف المحل",
      error: error,
      data: {},
    };
  }
}
