"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@luch/shared/api";
import { applyServerErrors, formatRubles } from "@luch/shared/lib";
import { Button, FormError, Modal, ModalFooter, TextAreaField } from "@luch/shared/ui";
import { useForm } from "react-hook-form";
import type { ISession } from "@/entities/session";
import { CANCEL_SESSION_TEXT } from "@/features/cancel-session/constants/cancel-session.constant";
import { useCancelSession, useSessionCancelPreview } from "@/features/cancel-session/hooks/useCancelSession";
import { type CancelSessionFormValues, cancelSessionSchema } from "@/features/cancel-session/schemas/cancel-session.schema";

interface ICancelSessionModalProps {
  session: ISession | null;
  onClose: () => void;
  onCancelled: () => void;
}

export const CancelSessionModal = ({ session, onClose, onCancelled }: ICancelSessionModalProps) => {
  const { data: preview, isPending: isPreviewPending } = useSessionCancelPreview(session?.id ?? null);
  const cancelMutation = useCancelSession();

  const form = useForm<CancelSessionFormValues>({
    resolver: zodResolver(cancelSessionSchema),
    defaultValues: { reason: "" },
  });

  const handleSubmit = form.handleSubmit(async ({ reason }) => {
    if (!session) return;
    try {
      await cancelMutation.mutateAsync({ sessionId: session.id, reason });
      form.reset();
      onCancelled();
    } catch (error) {
      if (error instanceof ApiError) {
        applyServerErrors(error, form.setError);
      }
    }
  });

  return (
    <Modal isOpen={session !== null} title={CANCEL_SESSION_TEXT.modalTitle} onClose={onClose}>
      {session && (
        <form onSubmit={handleSubmit} className="space-y-4 pb-6">
          <p className="text-sm font-semibold text-ink">{session.film.title}</p>

          {isPreviewPending && (
            <p className="rounded-lg bg-gray-50 px-3.5 py-3 text-sm text-gray-500">{CANCEL_SESSION_TEXT.loadingPreview}</p>
          )}

          {preview && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
              {preview.activeTicketsCount > 0
                ? CANCEL_SESSION_TEXT.previewSummary(
                    preview.activeTicketsCount,
                    preview.affectedOrdersCount,
                    formatRubles(preview.refundAmount),
                  )
                : CANCEL_SESSION_TEXT.previewNoTickets}
            </div>
          )}

          <TextAreaField
            label={CANCEL_SESSION_TEXT.reasonLabel}
            placeholder={CANCEL_SESSION_TEXT.reasonPlaceholder}
            rows={3}
            error={form.formState.errors.reason?.message}
            {...form.register("reason")}
          />

          <FormError message={form.formState.errors.root?.server?.message} />

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              {CANCEL_SESSION_TEXT.cancelLabel}
            </Button>
            <Button type="submit" disabled={cancelMutation.isPending}>
              {cancelMutation.isPending ? CANCEL_SESSION_TEXT.submittingLabel : CANCEL_SESSION_TEXT.confirmLabel}
            </Button>
          </ModalFooter>
        </form>
      )}
    </Modal>
  );
};
