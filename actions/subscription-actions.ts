"use server";

import { connectToDatabase } from "@/lib/mongo";
import Subscription from "@/models/Subscription";

function addOneMonth(baseDate: Date) {
  const nextDate = new Date(baseDate);
  nextDate.setMonth(nextDate.getMonth() + 1);
  return nextDate;
}

function getComputedStatus(subscription: {
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

export async function getSubscriptions() {
  await connectToDatabase();

  try {
    const subscriptions = await Subscription.find()
      .populate("user", "name email mobile_number")
      .sort({ createdAt: -1 })
      .lean();

    const normalizedSubscriptions = subscriptions.map((subscription) => ({
      ...JSON.parse(JSON.stringify(subscription)),
      status: getComputedStatus(subscription),
    }));

    return {
      status: true,
      message: "Subscriptions fetched successfully",
      data: normalizedSubscriptions,
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "Failed to get subscriptions",
      error,
      data: [],
    };
  }
}

export async function getSubscriptionByUserId(userId: string) {
  await connectToDatabase();

  try {
    const subscription = await Subscription.findOne({ user: userId })
      .populate("user", "name mobile_number id_number")
      .sort({ createdAt: -1 })
      .lean();

    if (!subscription) {
      return {
        success: false,
        message: "لا يوجد اشتراك لهذا المستخدم",
        data: null,
      };
    }

    return {
      success: true,
      message: "تم جلب الاشتراك بنجاح",
      data: {
        ...JSON.parse(JSON.stringify(subscription)),
        status: getComputedStatus(subscription),
      },
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في جلب الاشتراك",
      data: null,
    };
  }
}

export async function createSubscription(data: { userId: string }) {
  await connectToDatabase();

  try {
    const startDate = new Date();
    const subscription = await Subscription.create({
      user: data.userId,
      startDate,
      expiresAt: addOneMonth(startDate),
      status: "active",
    });

    return {
      success: true,
      message: "تم إنشاء الاشتراك بنجاح",
      data: JSON.parse(JSON.stringify(subscription)),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في إنشاء الاشتراك",
    };
  }
}

export async function stopSubscription(userId: string) {
  await connectToDatabase();

  try {
    const subscription = await Subscription.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return {
        success: false,
        message: "لا يوجد اشتراك لهذا العميل",
      };
    }

    subscription.status = "cancelled";
    subscription.expiresAt = new Date();
    await subscription.save();

    return {
      success: true,
      message: "تم إيقاف الاشتراك بنجاح",
      data: JSON.parse(JSON.stringify(subscription)),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في إيقاف الاشتراك",
    };
  }
}

export async function renewSubscription(userId: string) {
  await connectToDatabase();

  try {
    const subscription = await Subscription.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (!subscription) {
      return createSubscription({ userId });
    }

    const now = new Date();
    const currentExpiry = subscription.expiresAt
      ? new Date(subscription.expiresAt)
      : now;
    const isCurrentlyActive =
      subscription.status === "active" && currentExpiry > now;
    const renewalBaseDate = isCurrentlyActive ? currentExpiry : now;

    subscription.status = "active";
    subscription.startDate = isCurrentlyActive
      ? subscription.startDate || now
      : now;
    subscription.expiresAt = addOneMonth(renewalBaseDate);

    await subscription.save();

    return {
      success: true,
      message: "تم تجديد الاشتراك بنجاح",
      data: JSON.parse(JSON.stringify(subscription)),
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في تجديد الاشتراك",
    };
  }
}
