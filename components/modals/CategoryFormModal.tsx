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
import { CategoryType } from "@/models/Category";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; letter: string }) => Promise<{
    success: boolean;
    message: string;
  }>;
  isLoading?: boolean;
  editingCategory?: CategoryType | null;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingCategory,
}: CategoryFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{ name: string; letter: string }>({
    defaultValues: {
      name: "",
      letter: "",
    },
  });

  useEffect(() => {
    if (editingCategory) {
      setValue("name", editingCategory.name);
      setValue("letter", editingCategory.letter);
    } else {
      reset({
        name: "",
        letter: "",
      });
    }
  }, [editingCategory, setValue, reset]);

  const onSubmitForm = async (data: { name: string; letter: string }) => {
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
            {editingCategory ? "تعديل نوع مكان" : "إضافة نوع مكان جديد"}
          </DialogTitle>
          <DialogDescription>
            {editingCategory
              ? "قم بتعديل معلومات نوع المكان"
              : "أدخل معلومات نوع المكان الجديد"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم الفئة</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "اسم الفئة مطلوب",
                  minLength: {
                    value: 2,
                    message: "يجب أن يكون الاسم على الأقل حرفين",
                  },
                })}
                placeholder="أدخل اسم نوع المكان"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="letter">الحرف</Label>
              <Input
                id="letter"
                {...register("letter", {
                  required: "الحرف مطلوب",
                  maxLength: {
                    value: 1,
                    message: "يجب أن يكون الحرف حرفاً واحداً فقط",
                  },
                  pattern: {
                    value: /^[A-Za-z]$/,
                    message: "يجب أن يكون الحرف حرفاً إنجليزياً",
                  },
                })}
                placeholder="مثال: M أو R"
                className={errors.letter ? "border-destructive" : ""}
                maxLength={1}
              />
              {errors.letter && (
                <p className="text-sm text-destructive">
                  {errors.letter.message}
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
                : editingCategory
                ? "تحديث"
                : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
