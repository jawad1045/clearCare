import type { Metadata } from "next";
import { getAllUserNotes } from "@/action/notes.action";
import { AdminNotesTable } from "@/components/referrals/admin-notes-table";

export const metadata: Metadata = {
  title: "My Notes",
};

export const dynamic = "force-dynamic";

export default async function UserNotesPage() {
  const notes = await getAllUserNotes();

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My Notes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            View all internal notes across your medical and behavioral health referrals.
          </p>
        </div>
      </div>

      <AdminNotesTable notes={notes} basePath="/user" />
    </div>
  );
}
