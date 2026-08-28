"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Edit, ArrowUpDown, Loader2 } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/pagination";
import { useTranslation } from "@/locale/use-translation";
import { useLocalFormatDate } from "@/hooks/use-local-format-date";
import { getStatusColor, getStatusLabel, REFERRAL_STATUSES } from "@/lib/referral-statuses";
import { editReferralNote } from "@/action/referral.action";
import { editBHReferralNote } from "@/action/bh-referral.action";

type GlobalNote = {
  id: number;
  noteId: string;
  type: "Medical" | "BH";
  note: string;
  status: string | null;
  createdAt: Date;
  referralId: number;
  patientFirstName: string;
  patientLastName: string;
  referName: string;
};

export function AdminNotesTable({ notes: initialNotes, basePath = "/admin" }: { notes: GlobalNote[], basePath?: string }) {
  const { t, locale } = useTranslation();
  const { formatDateTime } = useLocalFormatDate();
  const router = useRouter();

  const [notes, setNotes] = useState<GlobalNote[]>(initialNotes);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  // Edit modal state
  const [editingNote, setEditingNote] = useState<GlobalNote | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const filteredNotes = useMemo(() => {
    let result = notes;
    
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        n => 
          n.patientFirstName.toLowerCase().includes(q) ||
          n.patientLastName.toLowerCase().includes(q) ||
          n.referName.toLowerCase().includes(q) ||
          (n.note && n.note.toLowerCase().includes(q)) ||
          n.referralId.toString().includes(q)
      );
    }
    
    if (filterStatus !== "all") {
      result = result.filter(n => n.status === filterStatus);
    }
    
    if (filterType !== "all") {
      result = result.filter(n => n.type === filterType);
    }
    
    return result;
  }, [notes, search, filterStatus, filterType]);

  const toggleNote = (noteId: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(noteId)) next.delete(noteId);
      else next.add(noteId);
      return next;
    });
  };

  const openEditModal = (note: GlobalNote) => {
    setEditingNote(note);
    setEditNoteText(note.note || "");
  };

  const handleSaveEdit = async () => {
    if (!editingNote || !editNoteText.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingNote.type === "BH") {
        await editBHReferralNote(editingNote.id, editNoteText);
      } else {
        await editReferralNote(editingNote.id, editNoteText);
      }
      
      // Update local state
      setNotes(prev => prev.map(n => n.noteId === editingNote.noteId ? { ...n, note: editNoteText } : n));
      setEditingNote(null);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = basePath === "/admin";

  const columns: ColumnDef<GlobalNote>[] = [
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button variant="ghost" className="px-0 font-semibold" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Status date <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="text-sm">{formatDateTime(row.original.createdAt)}</span>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        if (!status) return <span className="text-muted-foreground italic">—</span>;
        return (
          <Badge
            variant="outline"
            style={{
              backgroundColor: getStatusColor(status) + "22",
              color: getStatusColor(status),
              borderColor: getStatusColor(status) + "55",
            }}
            className="rounded-md capitalize px-2 py-0.5 whitespace-nowrap"
          >
            {getStatusLabel(status, locale as "en" | "es")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "referralId",
      header: "Pat ID",
      cell: ({ row }) => <span className="font-medium text-primary">#{row.original.referralId}</span>,
    },
    {
      id: "patient",
      header: "Patient",
      cell: ({ row }) => <span className="font-medium">{row.original.patientFirstName} {row.original.patientLastName}</span>,
    },
    {
      accessorKey: "referName",
      header: "Referrer",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.referName}</span>,
    },
    {
      id: "noteToggle",
      header: "Note (toggle)",
      cell: ({ row }) => {
        const note = row.original;
        const isExpanded = expandedNotes.has(note.noteId);
        
        if (!note.note) {
          return <span className="text-muted-foreground italic text-sm">No note</span>;
        }

        return (
          <div className="space-y-2 min-w-[200px]">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleNote(note.noteId)}
              className="h-8 gap-1.5 font-normal shadow-sm"
            >
              {isExpanded ? "Hide" : "Show"}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </Button>
            {isExpanded && (
              <div className="p-3 bg-muted/40 rounded-md border border-border/60 text-sm whitespace-pre-wrap mt-2">
                {note.note}
              </div>
            )}
          </div>
        );
      },
    }
  ];

  if (isAdmin) {
    columns.push({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const note = row.original;
        return (
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 px-3 font-normal shadow-sm"
              onClick={() => openEditModal(note)}
            >
              Edit
            </Button>
          </div>
        );
      }
    });
  }

  const table = useReactTable({
    data: filteredNotes,
    columns,
    state: {
      sorting,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onPaginationChange: (updater) => {
      const next = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(next.pageIndex);
      setPageSize(next.pageSize);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-3 overflow-x-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Referral Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Referral Types</SelectItem>
              <SelectItem value="Medical">Medical Referrals</SelectItem>
              <SelectItem value="BH">Behavioral Health</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder={t("common.allStatuses")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.allStatuses")}</SelectItem>
              {REFERRAL_STATUSES.map(status => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status, locale as "en" | "es")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10 / page</SelectItem>
              <SelectItem value="20">20 / page</SelectItem>
              <SelectItem value="50">50 / page</SelectItem>
              <SelectItem value="100">100 / page</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Input
            className="w-56"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border overflow-x-auto bg-background">
        <Table>
          <TableHeader className="bg-sidebar">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-sidebar-foreground">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="table-row-even">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="align-top py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No notes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        page={table.getState().pagination.pageIndex + 1}
        totalPages={Math.max(1, table.getPageCount())}
        total={filteredNotes.length}
        onPageChange={(p) => table.setPageIndex(p - 1)}
      />

      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              value={editNoteText}
              onChange={(e) => setEditNoteText(e.target.value)}
              className="min-h-[120px]"
              placeholder="Enter note text..."
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting || !editNoteText.trim()}>
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
