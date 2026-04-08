"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Ban,
  Edit,
  Eye,
  History,
  RefreshCcw,
  Trash,
} from "lucide-react";
import { toast } from "sonner";

import DataTable from "@/components/DataTable";
import { getUserUsages } from "@/actions/card-actions";
import {
  createSubscription,
  renewSubscription,
  stopSubscription,
} from "@/actions/subscription-actions";
import {
  createCustomer,
  deleteUser,
  updateCustomer,
} from "@/actions/user-actions";
import UserFormModal from "@/components/modals/UserFormModal";
import VIPCardModal from "@/components/modals/VIPCardModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserType } from "@/models/User";

interface CustomersClientProps {
  customers: {
    status: boolean;
    message: string;
    data: UserType[];
  };
}

interface UserUsageItem {
  _id: string;
  storeName: string;
  placeName: string;
  usedAt: string | null;
  usedDiscount: boolean;
  usageDate: string;
}

type SubscriptionConfirmAction =
  | {
      type: "stop" | "renew";
      customer: UserType;
    }
  | null;

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
  const [subscriptionActionKey, setSubscriptionActionKey] = useState<
    string | null
  >(null);
  const [subscriptionConfirmAction, setSubscriptionConfirmAction] =
    useState<SubscriptionConfirmAction>(null);
  const [isUsagesModalOpen, setIsUsagesModalOpen] = useState(false);
  const [usageLoadingKey, setUsageLoadingKey] = useState<string | null>(null);
  const [usageModalUser, setUsageModalUser] = useState<UserType | null>(null);
  const [userUsages, setUserUsages] = useState<UserUsageItem[]>([]);

  const handleSubmitCustomer = async (data: {
    name: string;
    mobile_number: string;
    id_number?: string;
  }): Promise<{ success: boolean; message: string }> => {
    setLoading(true);

    try {
      let response: {
        success: boolean;
        message?: string;
        data?: UserType;
      };

      if (editingUser) {
        response = await updateCustomer(String(editingUser._id), data);

        if (response.success && response.data) {
          setCustomers(
            customers.map((customer) =>
              customer._id === editingUser._id ? response.data! : customer
            )
          );
          toast.success("تم تحديث العميل بنجاح");
          setIsModalOpen(false);
          setEditingUser(null);
          return { success: true, message: response.message || "" };
        }

        toast.error(response.message || "فشل في تحديث العميل");
        return {
          success: false,
          message: response.message || "فشل في تحديث العميل",
        };
      }

      response = await createCustomer(data);

      if (response.success && response.data) {
        try {
          const subscriptionResponse = await createSubscription({
            userId: String(response.data._id),
          });

          if (subscriptionResponse.success) {
            toast.success("تم إضافة العميل والاشتراك بنجاح");
          } else {
            toast.warning("تمت إضافة العميل ولكن فشل إنشاء الاشتراك");
          }
        } catch (error) {
          console.error("Error creating subscription:", error);
          toast.warning("تمت إضافة العميل ولكن فشل إنشاء الاشتراك");
        }

        setCustomers([...customers, response.data]);
        setIsModalOpen(false);
        return { success: true, message: response.message || "" };
      }

      toast.error(response.message || "فشل في إضافة العميل");
      return {
        success: false,
        message: response.message || "فشل في إضافة العميل",
      };
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

  const handleStopSubscription = async (customer: UserType) => {
    const actionKey = `stop-${customer._id}`;
    setSubscriptionActionKey(actionKey);

    try {
      const response = await stopSubscription(String(customer._id));
      if (response.success) {
        toast.success(response.message || "تم إيقاف الاشتراك بنجاح");
      } else {
        toast.error(response.message || "فشل في إيقاف الاشتراك");
      }
    } catch (error) {
      console.error("Error stopping subscription:", error);
      toast.error("حدث خطأ أثناء إيقاف الاشتراك");
    } finally {
      setSubscriptionActionKey(null);
    }
  };

  const handleRenewSubscription = async (customer: UserType) => {
    const actionKey = `renew-${customer._id}`;
    setSubscriptionActionKey(actionKey);

    try {
      const response = await renewSubscription(String(customer._id));
      if (response.success) {
        toast.success(response.message || "تم تجديد الاشتراك بنجاح");
      } else {
        toast.error(response.message || "فشل في تجديد الاشتراك");
      }
    } catch (error) {
      console.error("Error renewing subscription:", error);
      toast.error("حدث خطأ أثناء تجديد الاشتراك");
    } finally {
      setSubscriptionActionKey(null);
    }
  };

  const handleOpenSubscriptionConfirm = (
    customer: UserType,
    type: "stop" | "renew"
  ) => {
    setSubscriptionConfirmAction({ customer, type });
  };

  const handleConfirmSubscriptionAction = async () => {
    if (!subscriptionConfirmAction) return;

    const { customer, type } = subscriptionConfirmAction;
    setSubscriptionConfirmAction(null);

    if (type === "stop") {
      await handleStopSubscription(customer);
      return;
    }

    await handleRenewSubscription(customer);
  };

  const handleViewUsages = async (customer: UserType) => {
    const loadingKey = `usage-${customer._id}`;
    setUsageLoadingKey(loadingKey);

    try {
      const response = await getUserUsages(String(customer._id));

      if (!response.success) {
        toast.error(response.message || "فشل في جلب الاستخدامات");
        return;
      }

      setUsageModalUser(customer);
      setUserUsages(response.data);
      setIsUsagesModalOpen(true);
    } catch (error) {
      console.error("Error fetching user usages:", error);
      toast.error("حدث خطأ أثناء جلب الاستخدامات");
    } finally {
      setUsageLoadingKey(null);
    }
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
        const customer = info.row.original;
        const isStopping =
          subscriptionActionKey === `stop-${String(customer._id)}`;
        const isRenewing =
          subscriptionActionKey === `renew-${String(customer._id)}`;
        const isLoadingUsages =
          usageLoadingKey === `usage-${String(customer._id)}`;

        return (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewCard(customer)}
              title="عرض البطاقة"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewUsages(customer)}
              title="عرض الاستخدامات"
              disabled={isLoadingUsages}
            >
              <History className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEditCustomer(customer)}
              title="تعديل"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenSubscriptionConfirm(customer, "stop")}
              title="إيقاف الاشتراك"
              disabled={isStopping || isRenewing}
            >
              <Ban className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenSubscriptionConfirm(customer, "renew")}
              title="تجديد الاشتراك"
              disabled={isStopping || isRenewing}
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteCustomer(String(customer._id))}
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
    <div className="p-4 sm:p-6">
      <DataTable
        data={customers}
        columns={columns}
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

      <AlertDialog
        open={!!subscriptionConfirmAction}
        onOpenChange={(open) => {
          if (!open) {
            setSubscriptionConfirmAction(null);
          }
        }}
      >
        <AlertDialogContent className="text-right">
          <AlertDialogHeader className="text-right sm:text-right">
            <AlertDialogTitle>
              {subscriptionConfirmAction?.type === "stop"
                ? "تأكيد إيقاف الاشتراك"
                : "تأكيد تجديد الاشتراك"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {subscriptionConfirmAction
                ? subscriptionConfirmAction.type === "stop"
                  ? `هل تريد إيقاف اشتراك ${subscriptionConfirmAction.customer.name}؟`
                  : `هل تريد تجديد اشتراك ${subscriptionConfirmAction.customer.name}؟`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSubscriptionAction}
              className={
                subscriptionConfirmAction?.type === "stop"
                  ? "bg-destructive text-white hover:bg-destructive/90"
                  : ""
              }
            >
              {subscriptionConfirmAction?.type === "stop"
                ? "إيقاف الاشتراك"
                : "تجديد الاشتراك"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={isUsagesModalOpen}
        onOpenChange={(open) => {
          setIsUsagesModalOpen(open);
          if (!open) {
            setUsageModalUser(null);
            setUserUsages([]);
          }
        }}
      >
        <DialogContent className="max-w-3xl text-right">
          <DialogHeader className="text-right">
            <DialogTitle>
              {usageModalUser
                ? `استخدامات ${usageModalUser.name}`
                : "استخدامات العميل"}
            </DialogTitle>
            <DialogDescription>
              عرض جميع استخدامات العميل مع المحل والمكان وحالة استخدام الخصم.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] overflow-y-auto">
            {userUsages.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                لا توجد استخدامات مسجلة لهذا العميل.
              </div>
            ) : (
              <div className="space-y-3">
                {userUsages.map((usage) => (
                  <div
                    key={usage._id}
                    className="rounded-lg border bg-card p-4 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {usage.storeName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {usage.placeName}
                        </p>
                      </div>
                      <Badge
                        variant={usage.usedDiscount ? "default" : "secondary"}
                      >
                        {usage.usedDiscount
                          ? "استخدم الخصم"
                          : "لم يستخدم الخصم"}
                      </Badge>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        تاريخ الاستخدام:{" "}
                        {usage.usageDate
                          ? new Date(usage.usageDate).toLocaleDateString("ar-SA")
                          : "-"}
                      </span>
                      <span>
                        وقت الاستخدام:{" "}
                        {usage.usedAt
                          ? new Date(usage.usedAt).toLocaleString("ar-SA")
                          : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
