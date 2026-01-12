"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { CategoryType } from "@/models/Category";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/actions/category-actions";
import CategoryFormModal from "@/components/modals/CategoryFormModal";
import { toast } from "sonner";

interface CategoriesClientProps {
  categories: {
    status: boolean;
    message: string;
    data: CategoryType[];
  };
}

export default function CategoriesClient({
  categories: initialCategories,
}: CategoriesClientProps) {
  const columnHelper = createColumnHelper<CategoryType>();
  const [categories, setCategories] = useState<CategoryType[]>(
    initialCategories.status ? initialCategories.data : []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryType | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const handleSubmitCategory = async (data: {
    name: string;
    letter: string;
  }): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;
      if (editingCategory) {
        // Update existing category
        response = await updateCategory(String(editingCategory._id), data);
        if (response.success && response.data) {
          setCategories(
            categories.map((category) =>
              category._id === editingCategory._id ? response.data : category
            )
          );
          toast.success("تم تحديث الفئة بنجاح!");
          setIsModalOpen(false);
          setEditingCategory(null);
          return { success: true, message: response.message };
        } else {
          toast.error(response.message || "فشل في تحديث الفئة");
          return {
            success: false,
            message: response.message || "فشل في تحديث الفئة",
          };
        }
      } else {
        // Create new category
        response = await createCategory(data);
        if (response.success && response.data) {
          setCategories([...categories, response.data]);
          toast.success("تم إضافة الفئة بنجاح!");
          setIsModalOpen(false);
          return { success: true, message: response.message };
        } else {
          toast.error(response.message || "فشل في إضافة الفئة");
          return {
            success: false,
            message: response.message || "فشل في إضافة الفئة",
          };
        }
      }
    } catch (error) {
      console.error("Error submitting category:", error);
      toast.error("حدث خطأ أثناء العملية");
      return {
        success: false,
        message: "حدث خطأ أثناء العملية",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: CategoryType) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذه الفئة؟");
    if (!confirmed) return;

    try {
      const response = await deleteCategory(id);
      if (response.success) {
        setCategories(categories.filter((category) => category._id !== id));
        toast.success("تم حذف الفئة بنجاح");
      } else {
        toast.error(response.message || "فشل في حذف الفئة");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("حدث خطأ أثناء حذف الفئة");
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
      header: "اسم الفئة",
    }),
    columnHelper.accessor("letter", {
      cell: (info) => {
        const letter = info.getValue();
        return (
          <Badge variant="default" className="font-mono text-lg">
            {letter}
          </Badge>
        );
      },
      header: "الحرف",
    }),
    columnHelper.accessor("createdAt", {
      cell: (info) => {
        const date = info.getValue();
        return (
          <span className="text-sm text-gray-500">
            {date ? new Date(date).toLocaleDateString("ar-SA") : "-"}
          </span>
        );
      },
      header: "تاريخ الإنشاء",
    }),
    columnHelper.display({
      id: "actions",
      cell: (info) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditCategory(info.row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDeleteCategory(String(info.row.original._id))
              }
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        );
      },
      header: "الإجراءات",
    }),
  ];

  return (
    <div className="p-6">
      <DataTable
        data={categories}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns={columns as any}
        title="أنواع المحلات"
        addButtonText="إضافة نوع مكان"
        onAdd={handleAddCategory}
      />

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        onSubmit={handleSubmitCategory}
        isLoading={loading}
        editingCategory={editingCategory}
      />
    </div>
  );
}
