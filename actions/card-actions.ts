"use server";

import { connectToDatabase } from "@/lib/mongo";
import Subscription from "@/models/Subscription";
import User from "@/models/User";
import Store from "@/models/Store";
import Usage from "@/models/Usage";
import Favorite from "@/models/Favorite";
import { PlaceType } from "@/models/Place";
import { CategoryType } from "@/models/Category";

function getComputedSubscriptionStatus(subscription: {
  status?: string;
  expiresAt?: Date | string;
}) {
  if (subscription.status === "cancelled") {
    return "cancelled";
  }

  if (subscription.expiresAt && new Date(subscription.expiresAt) < new Date()) {
    return "expired";
  }

  return "active";
}

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

    const subscriptionStatus = getComputedSubscriptionStatus(subscription);
    const isExpired = subscriptionStatus !== "active";

    return {
      success: true,
      message: "تم جلب بيانات البطاقة بنجاح",
      data: {
        user: JSON.parse(JSON.stringify(user)),
        subscription: {
          ...JSON.parse(JSON.stringify(subscription)),
          status: subscriptionStatus,
        },
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
      .sort({ discount: -1 })
      .lean();

    const groupedStores: Record<
      string,
      {
        place: PlaceType;
        stores: Array<{
          _id: string;
          name: string;
          discount: number;
          address: string;
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
        address: (store as { address?: string }).address || "",
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

export async function getUsageStateMap(userId: string, subscriptionId: string) {
  await connectToDatabase();

  try {
    const today = new Date().toISOString().split("T")[0];

    const usages = await Usage.find({
      user: userId,
      subscription: subscriptionId,
      usageDate: today,
    })
      .select("store usedAt")
      .lean();

    const usageStateMap = usages.reduce<
      Record<string, { used: boolean; usedAt: string | null }>
    >((acc, usage) => {
      const usageData = usage as { store: unknown; usedAt?: Date | string };
      acc[String(usageData.store)] = {
        used: true,
        usedAt: usageData.usedAt ? new Date(usageData.usedAt).toISOString() : null,
      };
      return acc;
    }, {});

    return {
      success: true,
      message: "تم جلب حالات الاستخدام بنجاح",
      data: usageStateMap,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في جلب حالات الاستخدام",
      data: {},
    };
  }
}

export async function getUserUsages(userId: string) {
  await connectToDatabase();

  try {
    const usages = await Usage.find({ user: userId })
      .populate({
        path: "store",
        select: "name place",
        populate: {
          path: "place",
          select: "name",
        },
      })
      .sort({ usedAt: -1, createdAt: -1 })
      .lean();

    const normalizedUsages = usages.map((usage) => {
      const usageData = usage as {
        _id: unknown;
        store?: {
          name?: string;
          place?: {
            name?: string;
          };
        } | null;
        usedAt?: Date | string;
        usedDiscount?: boolean;
        usageDate?: string;
      };

      return {
        _id: String(usageData._id),
        storeName: usageData.store?.name || "-",
        placeName: usageData.store?.place?.name || "-",
        usedAt: usageData.usedAt
          ? new Date(usageData.usedAt).toISOString()
          : null,
        usedDiscount: Boolean(usageData.usedDiscount),
        usageDate: usageData.usageDate || "",
      };
    });

    return {
      success: true,
      message: "تم جلب استخدامات العميل بنجاح",
      data: normalizedUsages,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في جلب استخدامات العميل",
      data: [],
    };
  }
}

export async function getAllUsages() {
  await connectToDatabase();

  try {
    const usages = await Usage.find({})
      .populate({
        path: "user",
        select: "name mobile_number id_number",
      })
      .populate({
        path: "store",
        select: "name place",
        populate: {
          path: "place",
          select: "name",
        },
      })
      .sort({ usedAt: -1, createdAt: -1 })
      .lean();

    const normalizedUsages = usages.map((usage) => {
      const usageData = usage as {
        _id: unknown;
        user?: {
          name?: string;
          mobile_number?: string;
          id_number?: string;
        } | null;
        store?: {
          name?: string;
          place?: {
            name?: string;
          };
        } | null;
        usedAt?: Date | string;
        usedDiscount?: boolean;
        usageDate?: string;
      };

      return {
        _id: String(usageData._id),
        userName: usageData.user?.name || "-",
        mobileNumber: usageData.user?.mobile_number || "-",
        idNumber: usageData.user?.id_number || "-",
        storeName: usageData.store?.name || "-",
        placeName: usageData.store?.place?.name || "-",
        usedAt: usageData.usedAt
          ? new Date(usageData.usedAt).toISOString()
          : null,
        usedDiscount: Boolean(usageData.usedDiscount),
        usageDate: usageData.usageDate || "",
      };
    });

    return {
      success: true,
      message: "تم جلب جميع الاستخدامات بنجاح",
      data: normalizedUsages,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في جلب جميع الاستخدامات",
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
    const subscription = await Subscription.findById(subscriptionId).lean();
    const subscriptionStatus = subscription
      ? getComputedSubscriptionStatus(subscription)
      : "expired";

    if (!subscription || subscriptionStatus !== "active") {
      return {
        success: true,
        allowed: false,
        message: "الاشتراك منتهي أو موقوف",
        usedAt: null,
      };
    }

    const today = new Date().toISOString().split("T")[0];

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
  storeId: string,
  usedDiscount: boolean
) {
  await connectToDatabase();

  try {
    const subscription = await Subscription.findById(subscriptionId).lean();
    const subscriptionStatus = subscription
      ? getComputedSubscriptionStatus(subscription)
      : "expired";

    if (!subscription || subscriptionStatus !== "active") {
      return {
        success: false,
        message: "الاشتراك منتهي أو موقوف",
      };
    }

    const today = new Date().toISOString().split("T")[0];

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

    const usage = await Usage.create({
      user: userId,
      subscription: subscriptionId,
      store: storeId,
      usedAt: new Date(),
      usedDiscount,
      usageDate: today,
    });

    return {
      success: true,
      message: "تم تسجيل الاستخدام بنجاح",
      data: JSON.parse(JSON.stringify(usage)),
    };
  } catch (error) {
    console.error(error);
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

export async function getFavorites(userId: string) {
  await connectToDatabase();

  try {
    const favorites = await Favorite.find({ user: userId }).select("store").lean();

    const favoriteStoreIds = favorites.map(
      (fav) => String((fav as { store: unknown }).store)
    );

    return {
      success: true,
      message: "تم جلب المفضلة بنجاح",
      data: favoriteStoreIds,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في جلب المفضلة",
      data: [],
    };
  }
}

export async function toggleFavorite(userId: string, storeId: string) {
  await connectToDatabase();

  try {
    const existingFavorite = await Favorite.findOne({
      user: userId,
      store: storeId,
    }).lean();

    if (existingFavorite) {
      await Favorite.deleteOne({
        user: userId,
        store: storeId,
      });

      return {
        success: true,
        message: "تم إزالة المحل من المفضلة",
        isFavorite: false,
      };
    }

    await Favorite.create({
      user: userId,
      store: storeId,
    });

    return {
      success: true,
      message: "تم إضافة المحل إلى المفضلة",
      isFavorite: true,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في تحديث المفضلة",
      isFavorite: false,
    };
  }
}
