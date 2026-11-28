"use client";

import { PERMISSIONS } from "@/shared/config";
import { PageHeader } from "@/shared/ui";
import { RequireCurrentCinema, RequirePermission } from "@/entities/viewer";
import { TicketScannerWorkspace } from "@/features/scan-ticket";
import { SCANNER_PAGE_TEXT } from "@/views/scanner/constants/scanner-page.constant";

export const ScannerPage = () => (
  <RequirePermission permission={PERMISSIONS.scanTickets}>
    <RequireCurrentCinema>
      {(cinema) => (
        <>
          <PageHeader title={SCANNER_PAGE_TEXT.title} />
          <TicketScannerWorkspace key={cinema.id} cinema={cinema} />
        </>
      )}
    </RequireCurrentCinema>
  </RequirePermission>
);
