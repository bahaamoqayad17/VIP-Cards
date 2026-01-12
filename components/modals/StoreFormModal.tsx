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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoreType } from "@/models/Store";
import { PlaceType } from "@/models/Place";
import { CategoryType } from "@/models/Category";

interface StoreFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    place: string;
    category: string;
    discount: number;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
  isLoading?: boolean;
  editingStore?: StoreType | null;
  places: PlaceType[];
  categories: CategoryType[];
}

export default function StoreFormModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  editingStore,
  places,
  categories,
}: StoreFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<{
    name: string;
    place: string;
    category: string;
    discount: number;
  }>({
    defaultValues: {
      name: "",
      place: "",
      category: "",
      discount: 0,
    },
  });

  const placeValue = watch("place");
  const categoryValue = watch("category");

  useEffect(() => {
    if (editingStore) {
      setValue("name", editingStore.name);
      setValue(
        "place",
        typeof editingStore.place === "object"
          ? String(editingStore.place._id)
          : String(editingStore.place)
      );
      setValue(
        "category",
        typeof editingStore.category === "object"
          ? String(editingStore.category._id)
          : String(editingStore.category)
      );
      setValue("discount", editingStore.discount);
    } else {
      reset({
        name: "",
        place: "",
        category: "",
        discount: 0,
      });
    }
  }, [editingStore, setValue, reset]);

  const onSubmitForm = async (data: {
    name: string;
    place: string;
    category: string;
    discount: number;
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
            {editingStore ? "تعديل المحل" : "إضافة محل جديد"}
          </DialogTitle>
          <DialogDescription>
            {editingStore
              ? "قم بتعديل معلومات المحل"
              : "أدخل معلومات المحل الجديد"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitForm)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم المحل</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "اسم المحل مطلوب",
                  minLength: {
                    value: 2,
                    message: "يجب أن يكون الاسم على الأقل حرفين",
                  },
                })}
                placeholder="أدخل اسم المحل"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="place">المكان</Label>
              <Select
                value={placeValue}
                onValueChange={(value) => setValue("place", value, { shouldValidate: true })}
              >
                <SelectTrigger
                  className={errors.place ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="اختر المكان" />
                </SelectTrigger>
                <SelectContent>
                  {places.map((place) => (
                    <SelectItem key={String(place._id)} value={String(place._id)}>
                      {place.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register("place", {
                  required: "المكان مطلوب",
                })}
              />
              {errors.place && (
                <p className="text-sm text-destructive">{errors.place.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">نوع المحل</Label>
              <Select
                value={categoryValue}
                onValueChange={(value) => setValue("category", value, { shouldValidate: true })}
              >
                <SelectTrigger
                  className={errors.category ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="اختر نوع المحل" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem
                      key={String(category._id)}
                      value={String(category._id)}
                    >
                      {category.name} ({category.letter})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input
                type="hidden"
                {...register("category", {
                  required: "نوع المحل مطلوب",
                })}
              />
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount">نسبة الخصم (%)</Label>
              <Input
                id="discount"
                type="number"
                {...register("discount", {
                  required: "نسبة الخصم مطلوبة",
                  min: {
                    value: 0,
                    message: "يجب أن تكون النسبة أكبر من أو تساوي 0",
                  },
                  max: {
                    value: 100,
                    message: "يجب أن تكون النسبة أقل من أو تساوي 100",
                  },
                  valueAsNumber: true,
                })}
                placeholder="أدخل نسبة الخصم"
                className={errors.discount ? "border-destructive" : ""}
                min={0}
                max={100}
              />
              {errors.discount && (
                <p className="text-sm text-destructive">
                  {errors.discount.message}
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
                : editingStore
                ? "تحديث"
                : "إضافة"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

