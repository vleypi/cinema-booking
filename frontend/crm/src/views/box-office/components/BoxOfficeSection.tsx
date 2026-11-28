"use client";

import { joinClassNames } from "@luch/shared/lib";
import { useState } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { PERMISSIONS } from "@/shared/config";
import { PageHeader } from "@/shared/ui";
import { hasPermission, useViewer } from "@/entities/viewer";
import { BoxOfficeOrdersTab } from "@/features/box-office-orders";
import { BoxOfficeSellTab } from "@/features/box-office-sell";
import { BOX_OFFICE_PAGE_TEXT } from "@/views/box-office/constants/box-office-page.constant";

interface IBoxOfficeSectionProps {
  cinema: ICinemaSummary;
}

type BoxOfficeTab = "sell" | "orders";

export const BoxOfficeSection = ({ cinema }: IBoxOfficeSectionProps) => {
  const { data: viewer } = useViewer();
  const canSell = hasPermission(viewer, PERMISSIONS.sellTickets);
  const canSearch = hasPermission(viewer, PERMISSIONS.searchOrders);
  const canRefund = hasPermission(viewer, PERMISSIONS.refundTickets);

  const [selectedTab, setSelectedTab] = useState<BoxOfficeTab>(() => (canSell ? "sell" : "orders"));
  const activeTab: BoxOfficeTab = selectedTab === "sell" && !canSell ? "orders" : selectedTab;

  return (
    <>
      <PageHeader title={BOX_OFFICE_PAGE_TEXT.title} />

      {canSell && canSearch && (
        <div className="mb-6 flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setSelectedTab("sell")}
            className={joinClassNames(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "sell" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-ink",
            )}
          >
            {BOX_OFFICE_PAGE_TEXT.sellTab}
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("orders")}
            className={joinClassNames(
              "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === "orders" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-ink",
            )}
          >
            {BOX_OFFICE_PAGE_TEXT.ordersTab}
          </button>
        </div>
      )}

      {activeTab === "sell" && canSell && <BoxOfficeSellTab cinema={cinema} />}
      {activeTab === "orders" && canSearch && <BoxOfficeOrdersTab cinema={cinema} canSell={canSell} canRefund={canRefund} />}
    </>
  );
};
