"use server";

import { connectToDatabase } from "@/lib/mongo";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function getCustomers() {
  await connectToDatabase();
  try {
    const customers = await User.find({ role: "user" })
      .sort({ createdAt: -1 })
      .lean();
    return {
      status: true,
      message: "Customers fetched successfully",
      data: JSON.parse(JSON.stringify(customers)),
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "Failed to get customers",
      error: error,
      data: [],
    };
  }
}

export async function getAdmins() {
  await connectToDatabase();
  try {
    const admins = await User.find({ role: "admin" })
      .sort({ createdAt: -1 })
      .lean();
    return {
      status: true,
      message: "Admins fetched successfully",
      data: JSON.parse(JSON.stringify(admins)),
    };
  } catch (error) {
    console.error(error);
    return {
      status: false,
      message: "Failed to get admins",
      error: error,
      data: [],
    };
  }
}

export async function createCustomer(data: {
  name: string;
  mobile_number: string;
  id_number?: string;
}) {
  await connectToDatabase();
  try {
    // Check if mobile number already exists
    const existingUser = await User.findOne({
      mobile_number: data.mobile_number,
    });
    if (existingUser) {
      return {
        success: false,
        message: "رقم الهاتف مستخدم بالفعل",
      };
    }

    // Use id_number for password if provided, otherwise use mobile_number
    const passwordSource = data.id_number || data.mobile_number;
    const customer = await User.create({
      name: data.name,
      mobile_number: data.mobile_number,
      id_number: data.id_number || "",
      email: "", // Empty email since it's not required anymore
      password: await bcrypt.hash(passwordSource, 12),
      role: "user",
    });
    return {
      success: true,
      message: "تم إضافة العميل بنجاح",
      data: JSON.parse(JSON.stringify(customer)),
    };
  } catch (error: unknown) {
    console.error(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 11000) {
      return {
        success: false,
        message: "رقم الهاتف مستخدم بالفعل",
      };
    }
    return {
      success: false,
      message: "فشل في إضافة العميل",
    };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name: string;
    mobile_number: string;
    id_number?: string;
  }
) {
  await connectToDatabase();
  try {
    // Check if mobile number already exists for another user
    const existingUser = await User.findOne({
      mobile_number: data.mobile_number,
    });
    if (existingUser && String(existingUser._id) !== id) {
      return {
        success: false,
        message: "رقم الهاتف مستخدم بالفعل",
      };
    }

    const customer = await User.findByIdAndUpdate(
      id,
      {
        name: data.name,
        mobile_number: data.mobile_number,
        id_number: data.id_number || "",
      },
      { new: true, lean: true }
    );
    if (!customer) {
      return {
        success: false,
        message: "العميل غير موجود",
      };
    }
    return {
      success: true,
      message: "تم تحديث العميل بنجاح",
      data: JSON.parse(JSON.stringify(customer)),
    };
  } catch (error: unknown) {
    console.error(error);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 11000) {
      return {
        success: false,
        message: "رقم الهاتف مستخدم بالفعل",
      };
    }
    return {
      success: false,
      message: "فشل في تحديث العميل",
    };
  }
}

export async function deleteUser(id: string) {
  await connectToDatabase();
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return {
        success: false,
        message: "المستخدم غير موجود",
      };
    }
    return {
      success: true,
      message: "تم حذف المستخدم بنجاح",
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: "فشل في حذف المستخدم",
    };
  }
}
