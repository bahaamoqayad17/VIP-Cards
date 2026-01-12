"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { PlaceType } from "@/models/Place";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash } from "lucide-react";
import { createPlace, deletePlace, updatePlace } from "@/actions/place-actions";
import PlaceFormModal from "@/components/modals/PlaceFormModal";
import { toast } from "sonner";

interface PlacesClientProps {
  places: {
    status: boolean;
    message: string;
    data: PlaceType[];
  };
}

export default function PlacesClient({
  places: initialPlaces,
}: PlacesClientProps) {
  const columnHelper = createColumnHelper<PlaceType>();
  const [places, setPlaces] = useState<PlaceType[]>(
    initialPlaces.status ? initialPlaces.data : []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<PlaceType | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitPlace = async (data: {
    name: string;
  }): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;
      if (editingPlace) {
        // Update existing place
        response = await updatePlace(String(editingPlace._id), data);
        if (response.success && response.data) {
          setPlaces(
            places.map((place) =>
              place._id === editingPlace._id ? response.data : place
            )
          );
          toast.success("تم تحديث المكان بنجاح!");
          setIsModalOpen(false);
          setEditingPlace(null);
          return { success: true, message: response.message };
        } else {
          toast.error(response.message || "فشل في تحديث المكان");
          return {
            success: false,
            message: response.message || "فشل في تحديث المكان",
          };
        }
      } else {
        // Create new place
        response = await createPlace(data);
        if (response.success && response.data) {
          setPlaces([...places, response.data]);
          toast.success("تم إضافة المكان بنجاح!");
          setIsModalOpen(false);
          return { success: true, message: response.message };
        } else {
          toast.error(response.message || "فشل في إضافة المكان");
          return {
            success: false,
            message: response.message || "فشل في إضافة المكان",
          };
        }
      }
    } catch (error) {
      console.error("Error submitting place:", error);
      toast.error("حدث خطأ أثناء العملية");
      return {
        success: false,
        message: "حدث خطأ أثناء العملية",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlace = (place: PlaceType) => {
    setEditingPlace(place);
    setIsModalOpen(true);
  };

  const handleDeletePlace = async (id: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا المكان؟");
    if (!confirmed) return;

    try {
      const response = await deletePlace(id);
      if (response.success) {
        setPlaces(places.filter((place) => place._id !== id));
        toast.success("تم حذف المكان بنجاح");
      } else {
        toast.error(response.message || "فشل في حذف المكان");
      }
    } catch (error) {
      console.error("Error deleting place:", error);
      toast.error("حدث خطأ أثناء حذف المكان");
    }
  };

  const handleAddPlace = () => {
    setEditingPlace(null);
    setIsModalOpen(true);
  };

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => (
        <span className="font-bold text-gray-900">{info.getValue()}</span>
      ),
      header: "اسم المكان",
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
              onClick={() => handleEditPlace(info.row.original)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeletePlace(String(info.row.original._id))}
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
        data={places}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns={columns as any}
        title="الأماكن"
        addButtonText="إضافة مكان"
        onAdd={handleAddPlace}
      />

      <PlaceFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlace(null);
        }}
        onSubmit={handleSubmitPlace}
        isLoading={loading}
        editingPlace={editingPlace}
      />
    </div>
  );
}
