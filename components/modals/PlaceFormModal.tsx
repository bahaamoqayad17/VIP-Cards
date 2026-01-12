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
import { PlaceType } from "@/models/Place";

interface PlaceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<{
    success: boolean;
    message: string;
  }>;
  isLoading?: boolean;
  editingPlace?: PlaceType | null;
}

export default function PlaceFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingPlace,
}: PlaceFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (editingPlace) {
      setValue("name", editingPlace.name);
    } else {
      reset({
        name: "",
      });
    }
  }, [editingPlace, setValue, reset]);

  const onSubmitForm = async (data: { name: string }) => {
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
            {editingPlace ? "تعديل المكان" : "إضافة مكان جديد"}
          </DialogTitle>
          <DialogDescription>
            {editingPlace
              ? "قم بتعديل معلومات المكان"
              : "أدخل معلومات المكان الجديد"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم المكان</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "اسم المكان مطلوب",
                  minLength: {
                    value: 2,
                    message: "يجب أن يكون الاسم على الأقل حرفين",
                  },
                })}
                placeholder="أدخل اسم المكان"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
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
              {isLoading ? "جاري الحفظ..." : editingPlace ? "تحديث" : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
