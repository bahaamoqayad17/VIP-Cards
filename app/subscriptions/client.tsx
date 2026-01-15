"use client";

import React from "react";
import { createColumnHelper } from "@tanstack/react-table";
import DataTable from "@/components/DataTable";
import { SubscriptionType } from "@/models/Subscription";
import { Badge } from "@/components/ui/badge";

interface SubscriptionsClientProps {
  subscriptions: {
    status: boolean;
    message: string;
    data: SubscriptionType[];
  };
}

export default function SubscriptionsClient({
  subscriptions: initialSubscriptions,
}: SubscriptionsClientProps) {
  const columnHelper = createColumnHelper<SubscriptionType>();
  const subscriptions = initialSubscriptions.status
    ? initialSubscriptions.data
    : [];

  const columns = [
    columnHelper.accessor("user", {
      cell: (info) => {
        const user = info.getValue();
        if (typeof user === "object" && user !== null) {
          return (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {user?.name || "-"}
              </span>
              <span className="text-xs text-gray-500">
                {user?.mobile_number || ""}
              </span>
            </div>
          );
        }
        return <span className="text-gray-500">-</span>;
      },
      header: "العميل",
    }),
    columnHelper.accessor("startDate", {
      cell: (info) => {
        const date = info.getValue();
        return (
          <span className="text-sm text-gray-700">
            {date ? new Date(date).toLocaleDateString("ar-SA") : "-"}
          </span>
        );
      },
      header: "تاريخ البدء",
    }),
    columnHelper.accessor("expiresAt", {
      cell: (info) => {
        const date = info.getValue();
        const isExpired = date && new Date(date) < new Date();
        return (
          <div className="flex flex-col">
            <span className="text-sm text-gray-700">
              {date ? new Date(date).toLocaleDateString("ar-SA") : "-"}
            </span>
            {isExpired && (
              <span className="text-xs text-destructive">منتهية</span>
            )}
          </div>
        );
      },
      header: "تاريخ الانتهاء",
    }),
    columnHelper.accessor("status", {
      cell: (info) => {
        const status = info.getValue();
        const statusConfig: Record<
          string,
          { label: string; variant: "default" | "secondary" | "destructive" }
        > = {
          active: { label: "نشط", variant: "default" },
          expired: { label: "منتهي", variant: "secondary" },
          cancelled: { label: "ملغي", variant: "destructive" },
        };
        const config = statusConfig[status] || {
          label: status,
          variant: "secondary" as const,
        };
        return <Badge variant={config.variant}>{config.label}</Badge>;
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
  ];

  return (
    <div className="p-6">
      <DataTable
        data={subscriptions}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns={columns as any}
        title="الاشتراكات"
      />
    </div>
  );
}
