"use server";

import { connectToDatabase } from "@/lib/mongo";
import Place from "@/models/Place";

export async function getPlaces() {
  await connectToDatabase();
  try {
    const places = await Place.find().sort({ createdAt: -1 }).lean();
    return {
      status: true,
      message: "Places fetched successfully",
      data: JSON.parse(JSON.stringify(places)),
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "Failed to get places",
      error: error,
      data: [],
    };
  }
}

export async function createPlace(data: { name: string }) {
  await connectToDatabase();
  try {
    const { name } = data;

    if (!name || name.trim().length === 0) {
      return {
        status: false,
        message: "اسم المكان مطلوب",
        data: {},
      };
    }

    const place = await Place.create({ name: name.trim() });
    return {
      success: true,
      status: true,
      message: "تم إضافة المكان بنجاح",
      data: JSON.parse(JSON.stringify(place)),
    };
  } catch (error: unknown) {
    console.error(error);
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return {
        success: false,
        status: false,
        message: "هذا المكان موجود بالفعل",
        error: String(error),
        data: {},
      };
    }
    return {
      success: false,
      status: false,
      message: "فشل في إضافة المكان",
      error: String(error),
      data: {},
    };
  }
}

export async function updatePlace(id: string, data: { name: string }) {
  await connectToDatabase();
  try {
    const { name } = data;

    if (!name || name.trim().length === 0) {
      return {
        status: false,
        message: "اسم المكان مطلوب",
        data: {},
      };
    }

    const place = await Place.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true, lean: true }
    );

    if (!place) {
      return {
        success: false,
        status: false,
        message: "المكان غير موجود",
        data: {},
      };
    }

    return {
      success: true,
      status: true,
      message: "تم تحديث المكان بنجاح",
      data: JSON.parse(JSON.stringify(place)),
    };
  } catch (error: unknown) {
    console.error(error);
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return {
        success: false,
        status: false,
        message: "هذا المكان موجود بالفعل",
        error: String(error),
        data: {},
      };
    }
    return {
      success: false,
      status: false,
      message: "فشل في تحديث المكان",
      error: String(error),
      data: {},
    };
  }
}

export async function deletePlace(id: string) {
  await connectToDatabase();
  try {
    const place = await Place.findByIdAndDelete(id);
    if (!place) {
      return {
        success: false,
        status: false,
        message: "المكان غير موجود",
        data: {},
      };
    }
    return {
      success: true,
      status: true,
      message: "تم حذف المكان بنجاح",
      data: place,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      status: false,
      message: "فشل في حذف المكان",
      error: error,
      data: {},
    };
  }
}
