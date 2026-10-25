"use client";

import { toApiError } from "@luch/shared/api";
import { Icon } from "@luch/shared/ui";
import { useState } from "react";
import { ConfirmModal } from "@/shared/ui";
import { REMOVE_SESSION_TEXT } from "@/features/remove-session/constants/remove-session.constant";
import { useRemoveSession } from "@/features/remove-session/hooks/useRemoveSession";

interface IRemoveSessionButtonProps {
  sessionId: string;
}

export const RemoveSessionButton = ({ sessionId }: IRemoveSessionButtonProps) => {
  const removal = useRemoveSession();
  const [isConfirming, setIsConfirming] = useState(false);

  const close = () => {
    removal.reset();
    setIsConfirming(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        aria-label={REMOVE_SESSION_TEXT.remove}
        title={REMOVE_SESSION_TEXT.remove}
        className="grid size-9 shrink-0 place-items-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-600"
      >
        <Icon name="trash" className="size-4" />
      </button>
      <ConfirmModal
        isOpen={isConfirming}
        title={REMOVE_SESSION_TEXT.title}
        description={REMOVE_SESSION_TEXT.description}
        confirmText={REMOVE_SESSION_TEXT.confirm}
        isPending={removal.isPending}
        error={removal.error ? toApiError(removal.error).message : undefined}
        onConfirm={() => removal.mutate(sessionId, { onSuccess: close })}
        onClose={close}
      />
    </>
  );
};
