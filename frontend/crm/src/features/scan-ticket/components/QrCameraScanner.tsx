"use client";

import { joinClassNames } from "@luch/shared/lib";
import { Button, Icon } from "@luch/shared/ui";
import type { Html5Qrcode } from "html5-qrcode";
import { useEffect, useId, useRef, useState } from "react";
import { CARD_CLASS_NAME } from "@/shared/ui";
import { SCAN_TICKET_TEXT, SCANNER_CONFIG } from "@/features/scan-ticket/constants/scan-ticket.constant";

interface IQrCameraScannerProps {
  isPaused: boolean;
  onScan: (decodedText: string) => void;
}

export const QrCameraScanner = ({ isPaused, onScan }: IQrCameraScannerProps) => {
  const rawId = useId();
  const containerId = `qr-reader-${rawId.replaceAll(":", "")}`;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const pausedRef = useRef(isPaused);
  const onScanRef = useRef(onScan);
  const [isRunning, setIsRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const stopScanner = async () => {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    setIsRunning(false);
    if (!scanner) return;

    try {
      if (scanner.isScanning) {
        await scanner.stop();
      }
      scanner.clear();
    } catch {
      return;
    }
  };

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (!scanner) return;
      void Promise.resolve(scanner.isScanning ? scanner.stop() : undefined)
        .catch(() => undefined)
        .finally(() => {
          try {
            scanner.clear();
          } catch {
            return;
          }
        });
    };
  }, []);

  const handleStart = async () => {
    setCameraError(null);
    await stopScanner();

    try {
      const { Html5Qrcode: Html5QrcodeCtor } = await import("html5-qrcode");
      const scanner = new Html5QrcodeCtor(containerId);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: SCANNER_CONFIG.fps,
          qrbox: { width: SCANNER_CONFIG.qrBoxSize, height: SCANNER_CONFIG.qrBoxSize },
        },
        (decodedText) => {
          if (pausedRef.current) return;
          pausedRef.current = true;
          onScanRef.current(decodedText);
        },
        () => undefined,
      );

      setIsRunning(true);
    } catch {
      scannerRef.current = null;
      setIsRunning(false);
      setCameraError(SCAN_TICKET_TEXT.cameraUnavailable);
    }
  };

  return (
    <div className={joinClassNames(CARD_CLASS_NAME, "space-y-4 p-5")}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon name="qrcode" className="size-5 text-brand" />
          <h2 className="text-base font-semibold text-ink">{SCAN_TICKET_TEXT.cameraHeading}</h2>
        </div>
        {isRunning ? (
          <Button variant="ghost" onClick={() => void stopScanner()}>
            {SCAN_TICKET_TEXT.stopCamera}
          </Button>
        ) : (
          <Button onClick={() => void handleStart()}>{SCAN_TICKET_TEXT.startCamera}</Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950">
        <div id={containerId} className={joinClassNames("w-full", isRunning ? "min-h-72" : "min-h-0")} />
        {!isRunning && (
          <div className="flex min-h-52 flex-col items-center justify-center gap-2 bg-gray-50 px-6 py-8 text-center">
            <Icon name="qrcode" className="size-10 text-gray-300" />
            <p className="max-w-sm text-sm text-gray-500">{SCAN_TICKET_TEXT.cameraIdleHint}</p>
          </div>
        )}
      </div>

      {cameraError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {cameraError}
        </p>
      )}
    </div>
  );
};
