"use client";

import React, { FC, useState } from "react";
import {
  ColumnDef,
  SortingState,
  Table as TTableProps,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  Search,
  X,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldWrap, Mounted } from "@/components/ui/field-wrap";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ITableHeaderTemplateProps {
  table: TTableProps<unknown>;
}

export const TableHeaderTemplate: FC<ITableHeaderTemplateProps> = ({
  table,
}) => {
  return (
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder ? null : (
                <div
                  aria-hidden="true"
                  className={
                    header.column.getCanSort()
                      ? "flex cursor-pointer items-center select-none"
                      : ""
                  }
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: <ChevronUp className="ml-1.5 h-4 w-4" />,
                    desc: <ChevronDown className="ml-1.5 h-4 w-4" />,
                  }[header.column.getIsSorted() as string] ?? null}
                </div>
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
  );
};

interface ITableBodyTemplateProps {
  table: TTableProps<unknown>;
}

export const TableBodyTemplate: FC<ITableBodyTemplateProps> = ({ table }) => {
  return (
    <TableBody>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
};

interface ITableFooterTemplateProps {
  table: TTableProps<unknown>;
}

export const TableFooterTemplate: FC<ITableFooterTemplateProps> = ({
  table,
}) => {
  return (
    <TableFooter>
      {table.getFooterGroups().map((footerGroup) => (
        <TableRow key={footerGroup.id}>
          {footerGroup.headers.map((header) => (
            <TableHead key={header.id}>
              {header.isPlaceholder ? null : (
                <div
                  aria-hidden="true"
                  className={
                    header.column.getCanSort()
                      ? "flex cursor-pointer items-center select-none"
                      : ""
                  }
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.footer,
                    header.getContext()
                  )}
                  {{
                    asc: <ChevronUp className="ml-1.5 h-4 w-4" />,
                    desc: <ChevronDown className="ml-1.5 h-4 w-4" />,
                  }[header.column.getIsSorted() as string] ?? null}
                </div>
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableFooter>
  );
};

interface ITableTemplateProps {
  table: TTableProps<unknown>;
  hasHeader?: boolean;
  hasFooter?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const TableTemplate: FC<ITableTemplateProps> = ({
  children,
  hasHeader = true,
  hasFooter = true,
  table,
  className,
  ...rest
}) => {
  return (
    <Mounted>
      <Table className={className} {...rest}>
        {children || (
          <>
            {hasHeader && <TableHeaderTemplate table={table} />}
            <TableBodyTemplate table={table} />
            {hasFooter && <TableFooterTemplate table={table} />}
          </>
        )}
      </Table>
    </Mounted>
  );
};

interface ITableCardFooterTemplateProps {
  table: TTableProps<unknown>;
}

export const TableCardFooterTemplate: FC<ITableCardFooterTemplateProps> = ({
  table,
}) => {
  const pageCount = Math.max(table.getPageCount(), 1);
  const pageIndex = table.getState().pagination.pageIndex + 1;
  const filteredRowsCount = table.getFilteredRowModel().rows.length;

  return (
    <CardFooter className="mt-auto border-t px-4 pt-4 sm:px-6">
      <div className="flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm text-muted-foreground">
            {filteredRowsCount} عنصر
          </span>
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
          >
            <SelectTrigger className="w-full sm:w-[9rem]">
              <SelectValue placeholder="عدد العناصر" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  عرض {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="text-sm text-muted-foreground">
            الصفحة {pageIndex} من {pageCount}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="sm"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              min={1}
              max={pageCount}
              value={pageIndex}
              onChange={(e) => {
                const nextPage = Number(e.target.value);

                if (Number.isNaN(nextPage)) return;

                const boundedPage = Math.min(Math.max(nextPage, 1), pageCount);
                table.setPageIndex(boundedPage - 1);
              }}
              className="h-8 w-20 text-center"
              name="page"
              aria-label="رقم الصفحة"
            />
            <Button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => table.setPageIndex(pageCount - 1)}
              disabled={!table.getCanNextPage()}
              variant="outline"
              size="sm"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </CardFooter>
  );
};

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  title?: string;
  className?: string;
  onAdd?: () => void;
  addButtonText?: string;
}

function DataTable<TData>({
  data,
  columns,
  title = "Data Table",
  className,
  onAdd,
  addButtonText = "إضافة عنصر",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    enableGlobalFilter: true,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <Card className={`h-full ${className || ""}`}>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{title}</CardTitle>
            <Badge
              variant="outline"
              className="rounded-full bg-blue-100 text-xs text-blue-800"
            >
              {table.getFilteredRowModel().rows.length} عنصر
            </Badge>
          </div>
          {onAdd && (
            <Button
              onClick={onAdd}
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
        <div className="mt-4">
          <FieldWrap
            firstSuffix={<Search className="mx-2 h-4 w-4" />}
            lastSuffix={
              globalFilter && (
                <X
                  className="mx-2 h-4 w-4 cursor-pointer text-red-500"
                  onClick={() => {
                    setGlobalFilter("");
                  }}
                />
              )
            }
          >
            <Input
              id="table-search"
              name="table-search"
              placeholder="ابحث"
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </FieldWrap>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto overflow-y-visible">
        <TableTemplate
          className="table-fixed min-w-[40rem] md:min-w-full"
          table={table as TTableProps<unknown>}
          hasFooter={false}
        />
      </CardContent>

      <TableCardFooterTemplate table={table as TTableProps<unknown>} />
    </Card>
  );
}

export default DataTable;
