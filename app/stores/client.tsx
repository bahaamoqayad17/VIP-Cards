"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { StoreType } from "@/models/Store";
import { PlaceType } from "@/models/Place";
import { CategoryType } from "@/models/Category";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import { createStore, deleteStore, updateStore } from "@/actions/store-action";
import StoreFormModal from "@/components/modals/StoreFormModal";
import { toast } from "sonner";

interface StoresClientProps {
  stores: {
    status: boolean;
    message: string;
    data: StoreType[];
  };
  places: {
    status: boolean;
    message: string;
    data: PlaceType[];
  };
  categories: {
    status: boolean;
    message: string;
    data: CategoryType[];
  };
}

export default function StoresClient({
  stores: initialStores,
  places: initialPlaces,
  categories: initialCategories,
}: StoresClientProps) {
  const columnHelper = createColumnHelper<StoreType>();
  const [stores, setStores] = useState<StoreType[]>(
    initialStores.status ? initialStores.data : []
  );
  const [places] = useState<PlaceType[]>(
    initialPlaces.status ? initialPlaces.data : []
  );
  const [categories] = useState<CategoryType[]>(
    initialCategories.status ? initialCategories.data : []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitStore = async (data: {
    name: string;
    place: string;
    category: string;
    discount: number;
  }): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;
      if (editingStore) {
        // Update existing store
        response = await updateStore(String(editingStore._id), data);
        if (response.success && response.data) {
          setStores(
            stores.map((store) =>
              store._id === editingStore._id ? response.data : store
            )
          );
          toast.success("تم تحديث المحل بنجاح!");
          setIsModalOpen(false);
          setEditingStore(null);
          return { success: true, message: response.message };
        } else {
          toast.error(response.message || "فشل في تحديث المحل");
          return {
            success: false,
            message: response.message || "فشل في تحديث المحل",
          };
        }
      } else {
        // Create new store
        response = await createStore(data);
        if (response.success && response.data) {
          setStores([...stores, response.data]);
          toast.success("تم إضافة المحل بنجاح!");
          setIsModalOpen(false);
          return { success: true, message: response.message };
        } else {
          toast.error(response.message || "فشل في إضافة المحل");
          return {
            success: false,
            message: response.message || "فشل في إضافة المحل",
          };
        }
      }
    } catch (error) {
      console.error("Error submitting store:", error);
      toast.error("حدث خطأ أثناء العملية");
      return {
        success: false,
        message: "حدث خطأ أثناء العملية",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleEditStore = (store: StoreType) => {
    setEditingStore(store);
    setIsModalOpen(true);
  };

  const handleDeleteStore = async (id: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المحل؟");
    if (!confirmed) return;

    try {
      const response = await deleteStore(id);
      if (response.success) {
        setStores(stores.filter((store) => store._id !== id));
        toast.success("تم حذف المحل بنجاح");
      } else {
        toast.error(response.message || "فشل في حذف المحل");
      }
    } catch (error) {
      console.error("Error deleting store:", error);
      toast.error("حدث خطأ أثناء حذف المحل");
    }
  };

  const handleAddStore = () => {
    setEditingStore(null);
    setIsModalOpen(true);
  };

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
      header: "اسم المحل",
    }),
    columnHelper.accessor("place", {
      cell: (info) => {
        const place = info.getValue();
        const placeName =
          typeof place === "object" && place !== null
            ? place.name
            : places.find((p) => String(p._id) === String(place))?.name || "-";
        return <span className="text-gray-700">{placeName}</span>;
      },
      header: "المكان",
    }),
    columnHelper.accessor("category", {
      cell: (info) => {
        const category = info.getValue();
        const categoryData =
          typeof category === "object" && category !== null
            ? category
            : categories.find((c) => String(c._id) === String(category));
        if (!categoryData) return <span>-</span>;
        return (
          <Badge variant="default" className="font-mono">
            {categoryData.name} ({categoryData.letter})
          </Badge>
        );
      },
      header: "نوع المحل",
    }),
    columnHelper.accessor("discount", {
      cell: (info) => {
        const discount = info.getValue();
        return <span className="font-semibold text-primary">{discount}%</span>;
      },
      header: "نسبة الخصم",
    }),
    columnHelper.accessor("isActive", {
      cell: (info) => {
        const isActive = info.getValue();
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "نشط" : "غير نشط"}
          </Badge>
        );
      },
      header: "الحالة",
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
              onClick={() => handleEditStore(info.row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteStore(String(info.row.original._id))}
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
        data={stores}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns={columns as any}
        title="المحلات"
        addButtonText="إضافة محل"
        onAdd={handleAddStore}
      />

      <StoreFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStore(null);
        }}
        onSubmit={handleSubmitStore}
        isLoading={loading}
        editingStore={editingStore}
        places={places}
        categories={categories}
      />
    </div>
  );
}
