"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ApiError } from "@luch/shared/api";
import { formatTimeInZone, joinClassNames } from "@luch/shared/lib";
import { Button, FormError, SelectField, TextField } from "@luch/shared/ui";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { ICinemaSummary } from "@/shared/api";
import { Badge, CARD_CLASS_NAME } from "@/shared/ui";
import {
  type ICheckInPayload,
  type ICheckInResult,
  useScannerHalls,
  useTicketCheckIn,
} from "@/entities/ticket-check-in";
import { CheckInResultOverlay } from "@/features/scan-ticket/components/CheckInResultOverlay";
import { QrCameraScanner } from "@/features/scan-ticket/components/QrCameraScanner";
import { SCAN_TICKET_TEXT, SCANNER_CONFIG } from "@/features/scan-ticket/constants/scan-ticket.constant";
import { type ManualCodeFormValues, manualCodeSchema } from "@/features/scan-ticket/schemas/manual-code.schema";

interface ITicketScannerWorkspaceProps {
  cinema: ICinemaSummary;
}

interface IScanHistoryItem {
  id: string;
  checkedAt: string;
  result: ICheckInResult;
}

export const TicketScannerWorkspace = ({ cinema }: ITicketScannerWorkspaceProps) => {
  const [selectedHallId, setSelectedHallId] = useState("");
  const [activeResult, setActiveResult] = useState<ICheckInResult | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [history, setHistory] = useState<IScanHistoryItem[]>([]);

  const { data: halls } = useScannerHalls(cinema.id);
  const checkInMutation = useTicketCheckIn(cinema.id);

  const form = useForm<ManualCodeFormValues>({
    resolver: zodResolver(manualCodeSchema),
    defaultValues: { code: "" },
  });

  const hallOptions = useMemo(
    () => [
      { value: "", label: SCAN_TICKET_TEXT.allHallsOption },
      ...(halls ?? []).map((hall) => ({ value: hall.id, label: `${hall.name}, ${hall.format}` })),
    ],
    [halls],
  );

  const runCheckIn = useCallback(
    async (payload: ICheckInPayload) => {
      setRequestError(null);
      try {
        const result = await checkInMutation.mutateAsync({
          ...payload,
          ...(selectedHallId && { hallId: selectedHallId }),
        });
        setActiveResult(result);
        setHistory((prev) => [
          { id: `${Date.now()}-${Math.random()}`, checkedAt: new Date().toISOString(), result },
          ...prev.slice(0, SCANNER_CONFIG.historyLimit - 1),
        ]);
      } catch (error) {
        if (error instanceof ApiError) {
          setRequestError(error.message);
        } else {
          setRequestError(SCAN_TICKET_TEXT.requestFailed);
        }
      }
    },
    [checkInMutation, selectedHallId],
  );

  const handleQrScan = useCallback(
    (decodedText: string) => {
      void runCheckIn({ qrPayload: decodedText });
    },
    [runCheckIn],
  );

  const handleManualSubmit = form.handleSubmit(async ({ code }) => {
    await runCheckIn({ code });
    form.reset({ code: "" });
  });

  return (
    <div className="space-y-6">
      <div className={joinClassNames(CARD_CLASS_NAME, "p-5")}>
        <div className="max-w-sm">
          <SelectField
            label={SCAN_TICKET_TEXT.hallFilterLabel}
            value={selectedHallId}
            options={hallOptions}
            onChange={(event) => setSelectedHallId(event.target.value)}
          />
        </div>
      </div>

      {requestError && <FormError message={requestError} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <QrCameraScanner isPaused={activeResult !== null || checkInMutation.isPending} onScan={handleQrScan} />

        <form onSubmit={handleManualSubmit} className={joinClassNames(CARD_CLASS_NAME, "flex h-fit flex-col gap-4 p-5")}>
          <h2 className="text-base font-semibold text-ink">{SCAN_TICKET_TEXT.manualHeading}</h2>
          <TextField
            label={SCAN_TICKET_TEXT.manualLabel}
            placeholder={SCAN_TICKET_TEXT.manualPlaceholder}
            autoComplete="off"
            autoCapitalize="characters"
            error={form.formState.errors.code?.message}
            {...form.register("code")}
          />
          <Button type="submit" disabled={checkInMutation.isPending} className="w-full sm:w-auto">
            {checkInMutation.isPending ? SCAN_TICKET_TEXT.manualSubmitting : SCAN_TICKET_TEXT.manualSubmit}
          </Button>
        </form>
      </div>

      {history.length > 0 && (
        <div className={joinClassNames(CARD_CLASS_NAME, "space-y-3 p-5")}>
          <h2 className="text-sm font-semibold text-gray-700">{SCAN_TICKET_TEXT.historyHeading}</h2>
          <ul className="divide-y divide-gray-100">
            {history.map(({ id, checkedAt, result }) => (
              <li key={id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={result.allowed ? "success" : "danger"}>
                    {result.allowed ? SCAN_TICKET_TEXT.historyAllowed : SCAN_TICKET_TEXT.historyDenied}
                  </Badge>
                  {result.ticket && <span className="font-mono text-xs font-semibold text-ink">{result.ticket.code}</span>}
                  <span className="text-gray-700">
                    {result.ticket
                      ? `${result.ticket.filmTitle}, ${SCAN_TICKET_TEXT.seatSummary(result.ticket.row, result.ticket.number)}`
                      : result.message}
                  </span>
                </div>
                <span className="text-xs text-gray-400 tabular-nums">{formatTimeInZone(checkedAt, cinema.timezone)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CheckInResultOverlay result={activeResult} timeZone={cinema.timezone} onClose={() => setActiveResult(null)} />
    </div>
  );
};
