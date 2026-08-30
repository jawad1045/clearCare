"use client";

import { useState, useEffect } from "react";
import { getReferralNotes, addReferralNote, editReferralNote } from "@/action/referral.action";
import { getBHReferralNotes, addBHReferralNote, editBHReferralNote } from "@/action/bh-referral.action";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/locale/use-translation";
import { useLocalFormatDate } from "@/hooks/use-local-format-date";
import { Loader2, Plus, Edit2, Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getStatusColor, getStatusLabel } from "@/lib/referral-statuses";

export function NotesTab({ referralId, isBH, isAdmin, currentStatus }: { referralId: number, isBH: boolean, isAdmin: boolean, currentStatus: string }) {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editNoteText, setEditNoteText] = useState("");

  const { t, locale } = useTranslation();
  const { formatDateTime } = useLocalFormatDate();

  useEffect(() => {
    loadNotes();
  }, [referralId, isBH]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      if (isBH) {
        const data = await getBHReferralNotes(referralId);
        setNotes(data);
      } else {
        const data = await getReferralNotes(referralId);
        setNotes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      if (isBH) {
        await addBHReferralNote(referralId, newNote, currentStatus);
      } else {
        await addReferralNote(referralId, newNote, currentStatus);
      }
      setNewNote("");
      await loadNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (id: number) => {
    if (!editNoteText.trim()) return;
    setIsSubmitting(true);
    try {
      if (isBH) {
        await editBHReferralNote(id, editNoteText);
      } else {
        await editReferralNote(id, editNoteText);
      }
      setEditingId(null);
      await loadNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-6 w-6 text-muted-foreground" /></div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="space-y-1.5">
          <CardTitle>{t("notesTab.title")}</CardTitle>
          <CardDescription>
            {isAdmin ? t("notesTab.descriptionAdmin") : t("notesTab.descriptionUser")}
          </CardDescription>
        </div>
        <div>
          <Badge
            variant="outline"
            style={{
              backgroundColor: getStatusColor(currentStatus) + "22",
              color: getStatusColor(currentStatus),
              borderColor: getStatusColor(currentStatus) + "55",
            }}
            className="rounded-md capitalize text-sm px-3 py-1"
          >
            {getStatusLabel(currentStatus, locale)}
          </Badge>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6 space-y-6">
        
        {isAdmin && (
          <div className="space-y-3">
            <Textarea
              placeholder={t("notesTab.addNotePlaceholder")}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              disabled={isSubmitting}
            />
            <Button onClick={handleAdd} disabled={isSubmitting || !newNote.trim()}>
              <Plus className="mr-2 h-4 w-4" /> {t("notesTab.addNoteBtn")}
            </Button>
          </div>
        )}

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-35 text-xs">{t("common.date")}</TableHead>
                <TableHead className="text-xs">{t("notesTab.author")}</TableHead>
                <TableHead className="text-xs">{t("notesTab.status")}</TableHead>
                <TableHead className="text-xs">{t("notesTab.noteToggle")}</TableHead>
                {isAdmin && <TableHead className="text-xs text-right">{t("notesTab.actions")}</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} className="h-24 text-center">
                    <p className="text-sm text-muted-foreground italic">{t("notesTab.noNotesFound")}</p>
                  </TableCell>
                </TableRow>
              ) : (
                notes.map(note => (
                  <TableRow key={note.id}>
                    <TableCell className="text-xs whitespace-nowrap py-3 align-top">
                      {formatDateTime(note.createdAt)}
                    </TableCell>
                    <TableCell className="text-xs py-3 align-top whitespace-nowrap">
                      {note.user.contactFirstName} {note.user.contactLastName}
                    </TableCell>
                    <TableCell className="py-3 align-top">
                      {note.status ? (
                        <Badge
                          variant="outline"
                          style={{
                            backgroundColor: getStatusColor(note.status) + "22",
                            color: getStatusColor(note.status),
                            borderColor: getStatusColor(note.status) + "55",
                          }}
                          className="rounded-md capitalize text-xs px-2 py-0.5 whitespace-nowrap"
                        >
                          {getStatusLabel(note.status, locale)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs py-3 align-top">
                      {editingId === note.id ? (
                        <div className="space-y-2">
                          <Textarea 
                            value={editNoteText} 
                            onChange={(e) => setEditNoteText(e.target.value)} 
                            disabled={isSubmitting} 
                            className="text-sm min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleEdit(note.id)} disabled={isSubmitting || !editNoteText.trim()}>
                              <Check className="mr-1 h-3.5 w-3.5" /> {t("notesTab.save")}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)} disabled={isSubmitting}>
                              <X className="mr-1 h-3.5 w-3.5" /> {t("notesTab.cancel")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{note.note}</p>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="py-3 align-top text-right">
                        {editingId !== note.id && (
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => {
                            setEditingId(note.id);
                            setEditNoteText(note.note);
                          }}>
                            {t("notesTab.edit")}
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </CardContent>
    </Card>
  );
}
