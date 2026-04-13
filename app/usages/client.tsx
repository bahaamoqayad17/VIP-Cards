"use client";

import React, { useState } from "react";
import { createColumnHelper } from "@tanstack/react-table";

import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";

interface UsageRow {
  _id: string;
  userName: string;
  mobileNumber: string;
  idNumber: string;
  storeName: string;
  placeName: string;
  usedAt: string | null;
  usedDiscount: boolean;
  usageDate: string;
}

interface UsagesClientProps {
  usages: {
    success: boolean;
    message: string;
    data: UsageRow[];
  };
}

export default function UsagesClient({ usages: initialUsages }: UsagesClientProps) {
  const columnHelper = createColumnHelper<UsageRow>();
  const [usages] = useState<UsageRow[]>(
    initialUsages.success ? initialUsages.data : []
  );

  const columns = [
    columnHelper.accessor("userName", {
      header: "اسم العميل",
      cell: (info) => (
        <span className="font-semibold text-gray-900">{info.getValue() || "-"}</span>
      ),
    }),
    columnHelper.accessor("mobileNumber", {
      header: "رقم الهاتف",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue() || "-"}</span>
      ),
    }),
    columnHelper.accessor("idNumber", {
      header: "رقم الهوية",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue() || "-"}</span>
      ),
    }),
    columnHelper.accessor("storeName", {
      header: "المحل",
      cell: (info) => (
        <span className="font-medium text-gray-900">{info.getValue() || "-"}</span>
      ),
    }),
    columnHelper.accessor("placeName", {
      header: "المكان",
      cell: (info) => (
        <span className="text-sm text-gray-700">{info.getValue() || "-"}</span>
      ),
    }),
    columnHelper.accessor("usedDiscount", {
      header: "الخصم",
      cell: (info) => (
        <Badge variant={info.getValue() ? "default" : "secondary"}>
          {info.getValue() ? "استخدم الخصم" : "لم يستخدم الخصم"}
        </Badge>
      ),
    }),
    columnHelper.accessor("usageDate", {
      header: "تاريخ الاستخدام",
      cell: (info) => (
        <span className="text-sm text-gray-500">
          {info.getValue()
            ? new Date(info.getValue()).toLocaleDateString("ar-SA")
            : "-"}
        </span>
      ),
    }),
    columnHelper.accessor("usedAt", {
      header: "وقت الاستخدام",
      cell: (info) => (
        <span className="text-sm text-gray-500">
          {info.getValue()
            ? new Date(info.getValue()!).toLocaleString("ar-SA")
            : "-"}
        </span>
      ),
    }),
  ];

  return (
    <div className="p-4 sm:p-6">
      <DataTable data={usages} columns={columns} title="الاستخدامات" />
    </div>
  );
}
