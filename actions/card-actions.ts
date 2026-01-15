"use server";

import { connectToDatabase } from "@/lib/mongo";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Store from "@/models/Store";
import Usage from "@/models/Usage";
import { PlaceType } from "@/models/Place";
import { CategoryType } from "@/models/Category";

export async function getCardData(userId: string) {
  await connectToDatabase();
  try {
    const user = await User.findById(userId).lean();

    if (!user) {
      return {
        success: false,
        message: "المستخدم غير موجود",
        data: null,
      };
    }

    const subscription = await Subscription.findOne({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!subscription) {
      return {
        success: false,
        message: "لا يوجد اشتراك لهذا المستخدم",
        data: null,
      };
    }

    // Check if subscription is expired
    const isExpired =
      subscription.expiresAt && new Date(subscription.expiresAt) < new Date();

    return {
      success: true,
      message: "تم جلب بيانات البطاقة بنجاح",
      data: {
        user: JSON.parse(JSON.stringify(user)),
        subscription: JSON.parse(JSON.stringify(subscription)),
        isExpired,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في جلب بيانات البطاقة",
      data: null,
    };
  }
}

export async function getStoresGroupedByPlace() {
  await connectToDatabase();
  try {
    const stores = await Store.find({ isActive: true })
      .populate("place")
      .populate("category")
      .sort({ createdAt: -1 })
      .lean();

    // Group stores by place
    const groupedStores: Record<
      string,
      {
        place: PlaceType;
        stores: Array<{
          _id: string;
          name: string;
          discount: number;
          category: CategoryType;
        }>;
      }
    > = {};

    stores.forEach((store) => {
      if (!store.place || !store.category) return;
      const placeId = String((store.place as { _id: unknown })._id);

      if (!groupedStores[placeId]) {
        groupedStores[placeId] = {
          place: JSON.parse(JSON.stringify(store.place)),
          stores: [],
        };
      }

      groupedStores[placeId].stores.push({
        _id: String((store as { _id: unknown })._id),
        name: (store as { name: string }).name,
        discount: (store as { discount: number }).discount,
        category: JSON.parse(JSON.stringify(store.category)),
      });
    });

    return {
      success: true,
      message: "تم جلب المحلات بنجاح",
      data: Object.values(groupedStores),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في جلب المحلات",
      data: [],
    };
  }
}

export async function checkUsageAllowed(
  userId: string,
  subscriptionId: string,
  storeId: string
) {
  await connectToDatabase();
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const existingUsage = await Usage.findOne({
      user: userId,
      subscription: subscriptionId,
      store: storeId,
      usageDate: today,
    }).lean();

    return {
      success: true,
      allowed: !existingUsage,
      message: existingUsage
        ? "تم استخدام هذا المحل اليوم بالفعل"
        : "يمكن استخدام هذا المحل",
      usedAt: existingUsage ? (existingUsage as { usedAt: Date }).usedAt : null,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      allowed: false,
      message: "فشل في التحقق من إمكانية الاستخدام",
      usedAt: null,
    };
  }
}

export async function recordUsage(
  userId: string,
  subscriptionId: string,
  storeId: string
) {
  await connectToDatabase();
  try {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    // Check if already used today
    const existingUsage = await Usage.findOne({
      user: userId,
      subscription: subscriptionId,
      store: storeId,
      usageDate: today,
    });

    if (existingUsage) {
      return {
        success: false,
        message: "تم استخدام هذا المحل اليوم بالفعل",
      };
    }

    // Create new usage record
    const usage = await Usage.create({
      user: userId,
      subscription: subscriptionId,
      store: storeId,
      usedAt: new Date(),
      usageDate: today,
    });

    return {
      success: true,
      message: "تم تسجيل الاستخدام بنجاح",
      data: JSON.parse(JSON.stringify(usage)),
    };
  } catch (error) {
    console.error(error);
    // Handle duplicate key error (unique index)
    const mongoError = error as { code?: number };
    if (mongoError.code === 11000) {
      return {
        success: false,
        message: "تم استخدام هذا المحل اليوم بالفعل",
      };
    }
    return {
      success: false,
      message: "فشل في تسجيل الاستخدام",
    };
  }
}
