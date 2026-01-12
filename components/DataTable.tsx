"use client";

import React, { FC, useState } from "react";
import {
  flexRender,
  Table as TTableProps,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FieldWrap, Mounted } from "@/components/ui/field-wrap";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Plus,
  X,
} from "lucide-react";

// Table Template Components
interface ITableHeaderTemplateProps {
  table: TTableProps<any>;
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
                  key={header.id}
                  aria-hidden="true"
                  {...{
                    className: header.column.getCanSort()
                      ? "cursor-pointer select-none flex items-center"
                      : "",
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {{
                    asc: <ChevronUp className="h-4 w-4 ml-1.5" />,
                    desc: <ChevronDown className="h-4 w-4 ml-1.5" />,
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
  table: TTableProps<any>;
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
  table: TTableProps<any>;
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
                  key={header.id}
                  aria-hidden="true"
                  {...{
                    className: header.column.getCanSort()
                      ? "cursor-pointer select-none flex items-center"
                      : "",
                    onClick: header.column.getToggleSortingHandler(),
                  }}
                >
                  {flexRender(
                    header.column.columnDef.footer,
                    header.getContext()
                  )}
                  {{
                    asc: <ChevronUp className="h-4 w-4 ml-1.5" />,
                    desc: <ChevronDown className="h-4 w-4 ml-1.5" />,
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
  table: TTableProps<any>;
  hasHeader?: boolean;
  hasFooter?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const TableTemplate: FC<ITableTemplateProps> = (props) => {
  const {
    children,
    hasHeader = true,
    hasFooter = true,
    table,
    className,
    ...rest
  } = props;

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
  table: TTableProps<any>;
}

export const TableCardFooterTemplate: FC<ITableCardFooterTemplateProps> = ({
  table,
}) => {
  return (
    <CardFooter>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <Select
            value={table.getState().pagination.pageSize.toString()}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
            }}
            defaultValue="10"
          >
            <SelectTrigger className="w-fit">
              <SelectValue placeholder="Show items" />
            </SelectTrigger>
            <SelectContent>
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  Show {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            variant="outline"
            size="sm"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
          <span className="flex items-center gap-1">
            <div>الصفحة</div>
            <strong>
              <Input
                value={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="inline-flex !w-12 text-center"
                name="page"
              />{" "}
              من {table.getPageCount()}
            </strong>
          </span>
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
        </div>
      </div>
    </CardFooter>
  );
};

// Main DataTable Component
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
  addButtonText = "إضافة بطيخ",
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState<string>("");

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>{title}</CardTitle>
            <Badge
              variant="outline"
              className="bg-blue-100 text-blue-800 rounded-full text-xs"
            >
              {table.getFilteredRowModel().rows.length} عناصر
            </Badge>
          </div>
          {onAdd && (
            <Button onClick={onAdd} variant="outline" size="sm">
              <Plus className="h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
        <div className="mt-4">
          <FieldWrap
            firstSuffix={<Search className="h-4 w-4 mx-2" />}
            lastSuffix={
              globalFilter && (
                <X
                  className="h-4 w-4 mx-2 cursor-pointer text-red-500"
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
              placeholder={"ابحث"}
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </FieldWrap>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <TableTemplate
          className="table-fixed max-md:min-w-[70rem]"
          table={table}
        />
      </CardContent>
      <TableCardFooterTemplate table={table} />
    </Card>
  );
}

export default DataTable;
