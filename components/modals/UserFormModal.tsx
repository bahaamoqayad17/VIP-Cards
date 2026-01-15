"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserType } from "@/models/User";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    mobile_number: string;
    id_number?: string;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
  isLoading?: boolean;
  editingUser?: UserType | null;
}

export default function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingUser,
}: UserFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{
    name: string;
    mobile_number: string;
    id_number?: string;
  }>({
    defaultValues: {
      name: "",
      mobile_number: "",
      id_number: "",
    },
  });

  useEffect(() => {
    if (editingUser) {
      setValue("name", editingUser.name);
      setValue("mobile_number", editingUser.mobile_number || "");
      setValue("id_number", editingUser.id_number || "");
    } else {
      reset({
        name: "",
        mobile_number: "",
        id_number: "",
      });
    }
  }, [editingUser, setValue, reset]);

  const onSubmitForm = async (data: {
    name: string;
    mobile_number: string;
    id_number?: string;
  }) => {
    const result = await onSubmit(data);
    if (result.success) {
      reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "تعديل العميل" : "إضافة عميل جديد"}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? "قم بتعديل معلومات العميل"
              : "أدخل معلومات العميل الجديد"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "الاسم مطلوب",
                  minLength: {
                    value: 2,
                    message: "يجب أن يكون الاسم على الأقل حرفين",
                  },
                  maxLength: {
                    value: 100,
                    message: "يجب أن يكون الاسم أقل من 100 حرف",
                  },
                })}
                placeholder="أدخل الاسم"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="mobile_number">رقم الهاتف</Label>
              <Input
                id="mobile_number"
                type="tel"
                {...register("mobile_number", {
                  required: "رقم الهاتف مطلوب",
                })}
                placeholder="أدخل رقم الهاتف"
                className={errors.mobile_number ? "border-destructive" : ""}
              />
              {errors.mobile_number && (
                <p className="text-sm text-destructive">
                  {errors.mobile_number.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="id_number">رقم الهوية (اختياري)</Label>
              <Input
                id="id_number"
                {...register("id_number")}
                placeholder="أدخل رقم الهوية (اختياري)"
                className={errors.id_number ? "border-destructive" : ""}
              />
              {errors.id_number && (
                <p className="text-sm text-destructive">
                  {errors.id_number.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "جاري الحفظ..."
                : editingUser
                ? "تحديث"
                : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

