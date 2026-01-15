"use server";

import { connectToDatabase } from "@/lib/mongo";
import Subscription from "@/models/Subscription";

export async function getSubscriptions() {
  await connectToDatabase();
  try {
    const subscriptions = await Subscription.find()
      .populate("user", "name email mobile_number")
      .sort({ createdAt: -1 })
      .lean();
    return {
      status: true,
      message: "Subscriptions fetched successfully",
      data: JSON.parse(JSON.stringify(subscriptions)),
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "Failed to get subscriptions",
      error: error,
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
      data: JSON.parse(JSON.stringify(subscription)),
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
    const subscription = await Subscription.create({
      user: data.userId,
      startDate: new Date(),
      expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 2)),
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
