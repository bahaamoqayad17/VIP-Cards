"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { UserType } from "@/models/User";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash } from "lucide-react";
import {
  createCustomer,
  deleteUser,
  updateCustomer,
} from "@/actions/user-actions";
import UserFormModal from "@/components/modals/UserFormModal";
import { toast } from "sonner";
import { createSubscription } from "@/actions/subscription-actions";
import VIPCardModal from "@/components/modals/VIPCardModal";
import { Eye } from "lucide-react";

interface CustomersClientProps {
  customers: {
    status: boolean;
    message: string;
    data: UserType[];
  };
}

export default function CustomersClient({
  customers: initialCustomers,
}: CustomersClientProps) {
  const columnHelper = createColumnHelper<UserType>();
  const [customers, setCustomers] = useState<UserType[]>(
    initialCustomers.status ? initialCustomers.data : []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<UserType | null>(null);

  const handleSubmitCustomer = async (data: {
    name: string;
    mobile_number: string;
    id_number?: string;
  }): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let response: any;
      if (editingUser) {
        // Update existing customer
        response = await updateCustomer(String(editingUser._id), data);
        if (response.success && response.data) {
          setCustomers(
            customers.map((customer) =>
              customer._id === editingUser._id ? response.data : customer
            )
          );
          toast.success("تم تحديث العميل بنجاح!");
          setIsModalOpen(false);
          setEditingUser(null);
          return { success: true, message: response.message };
        } else {
          toast.error(response.message || "فشل في تحديث العميل");
          return {
            success: false,
            message: response.message || "فشل في تحديث العميل",
          };
        }
      } else {
        // Create new customer
        response = await createCustomer(data);
        if (response.success && response.data) {
          try {
            const subscriptionResponse = await createSubscription({
              userId: String(response.data._id),
            });
            if (subscriptionResponse.success) {
              toast.success("تم إضافة العميل والاشتراك بنجاح!");
            } else {
              toast.warning("تم إضافة العميل ولكن فشل في إنشاء الاشتراك");
            }
          } catch (error) {
            console.error("Error creating subscription:", error);
            toast.warning("تم إضافة العميل ولكن فشل في إنشاء الاشتراك");
          }
          setCustomers([...customers, response.data]);
          setIsModalOpen(false);
          return { success: true, message: response.message };
        } else {
          toast.error(response.message || "فشل في إضافة العميل");
          return {
            success: false,
            message: response.message || "فشل في إضافة العميل",
          };
        }
      }
    } catch (error) {
      console.error("Error submitting customer:", error);
      toast.error("حدث خطأ أثناء العملية");
      return {
        success: false,
        message: "حدث خطأ أثناء العملية",
      };
    } finally {
      setLoading(false);
    }
  };

  const handleEditCustomer = (customer: UserType) => {
    setEditingUser(customer);
    setIsModalOpen(true);
  };

  const handleDeleteCustomer = async (id: string) => {
    const confirmed = window.confirm("هل أنت متأكد من حذف هذا العميل؟");
    if (!confirmed) return;

    try {
      const response = await deleteUser(id);
      if (response.success) {
        setCustomers(customers.filter((customer) => customer._id !== id));
        toast.success("تم حذف العميل بنجاح");
      } else {
        toast.error(response.message || "فشل في حذف العميل");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast.error("حدث خطأ أثناء حذف العميل");
    }
  };

  const handleAddCustomer = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleViewCard = (customer: UserType) => {
    setViewingUser(customer);
    setIsCardModalOpen(true);
  };

  const columns = [
    columnHelper.accessor("name", {
      cell: (info) => {
        const name = info.getValue();
        return (
          <span className="font-semibold text-gray-900">{name || "-"}</span>
        );
      },
      header: "الاسم",
    }),
    columnHelper.accessor("mobile_number", {
      cell: (info) => {
        const mobile = info.getValue();
        return <span className="text-sm text-gray-700">{mobile || "-"}</span>;
      },
      header: "رقم الهاتف",
    }),
    columnHelper.accessor("id_number", {
      cell: (info) => {
        const idNumber = info.getValue();
        return <span className="text-sm text-gray-700">{idNumber || "-"}</span>;
      },
      header: "رقم الهوية",
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
              onClick={() => handleViewCard(info.row.original)}
              title="عرض البطاقة"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditCustomer(info.row.original)}
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDeleteCustomer(String(info.row.original._id))
              }
              title="حذف"
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
        data={customers}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns={columns as any}
        title="العملاء"
        addButtonText="إضافة عميل"
        onAdd={handleAddCustomer}
      />

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSubmit={handleSubmitCustomer}
        isLoading={loading}
        editingUser={editingUser}
      />

      <VIPCardModal
        isOpen={isCardModalOpen}
        onClose={() => {
          setIsCardModalOpen(false);
          setViewingUser(null);
        }}
        user={viewingUser}
      />
    </div>
  );
}
