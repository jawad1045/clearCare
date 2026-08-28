import type { Metadata } from "next";
import { getAllAdminNotes } from "@/action/notes.action";
import { AdminNotesTable } from "@/components/referrals/admin-notes-table";

export const metadata: Metadata = {
  title: "Admin Notes",
};

export const dynamic = "force-dynamic";

export default async function AdminNotesPage() {
  const notes = await getAllAdminNotes();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Admin Notes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View all internal notes across medical and behavioral health referrals.
          </p>
        </div>
      </div>

      <AdminNotesTable notes={notes} />
    </div>
  );
}
