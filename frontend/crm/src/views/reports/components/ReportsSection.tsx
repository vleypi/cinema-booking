"use client";

import { formatCalendarDate, formatRubles, formatTimeInZone, getTodayInTimeZone, joinClassNames, shiftDate, toDateInTimeZone } from "@luch/shared/lib";
import { Button } from "@luch/shared/ui";
import { useMemo, useState } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { Badge, CARD_CLASS_NAME, EmptyState, PageHeader, TOOLBAR_CONTROL_CLASS_NAME } from "@/shared/ui";
import { ORDER_CHANNEL_LABELS } from "@/entities/box-office";
import { type IRevenueTotals, useOccupancyReport, useRevenueReport } from "@/entities/report";
import { REPORTS_PAGE_TEXT } from "@/views/reports/constants/reports-page.constant";

interface IReportsSectionProps {
  cinema: ICinemaSummary;
}

type ReportsTab = "revenue" | "occupancy";

interface IBreakdownRow extends IRevenueTotals {
  key: string;
  label: string;
}

const RevenueBreakdownTable = ({ title, rows }: { title: string; rows: readonly IBreakdownRow[] }) => (
  <div className={joinClassNames(CARD_CLASS_NAME, "overflow-hidden")}>
    <div className="border-b border-gray-100 px-5 py-3.5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full min-w-[36rem] text-left text-sm">
        <thead className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
          <tr>
            <th className="px-5 py-3">{REPORTS_PAGE_TEXT.colName}</th>
            <th className="px-4 py-3 text-right">{REPORTS_PAGE_TEXT.colSold}</th>
            <th className="px-4 py-3 text-right">{REPORTS_PAGE_TEXT.colRefunded}</th>
            <th className="px-4 py-3 text-right">{REPORTS_PAGE_TEXT.colGross}</th>
            <th className="px-4 py-3 text-right">{REPORTS_PAGE_TEXT.colRefundSum}</th>
            <th className="px-5 py-3 text-right">{REPORTS_PAGE_TEXT.colNet}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((row) => (
            <tr key={row.key} className="hover:bg-gray-50/70">
              <td className="px-5 py-3 font-medium text-ink">{row.label}</td>
              <td className="px-4 py-3 text-right text-gray-700 tabular-nums">{row.ticketsSold}</td>
              <td className="px-4 py-3 text-right text-gray-500 tabular-nums">{row.ticketsRefunded}</td>
              <td className="px-4 py-3 text-right text-gray-700 tabular-nums">{formatRubles(row.grossAmount)}</td>
              <td className="px-4 py-3 text-right text-gray-500 tabular-nums">{formatRubles(row.refundedAmount)}</td>
              <td className="px-5 py-3 text-right font-semibold text-ink tabular-nums">{formatRubles(row.netRevenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const ReportsSection = ({ cinema }: IReportsSectionProps) => {
  const today = useMemo(() => getTodayInTimeZone(cinema.timezone), [cinema.timezone]);
  const [from, setFrom] = useState(() => shiftDate(today, -6));
  const [to, setTo] = useState(today);
  const [activeTab, setActiveTab] = useState<ReportsTab>("revenue");

  const period = useMemo(() => ({ from, to }), [from, to]);
  const { data: revenue, isPending: isRevenuePending } = useRevenueReport(cinema.id, period, activeTab === "revenue");
  const { data: occupancy, isPending: isOccupancyPending } = useOccupancyReport(
    cinema.id,
    period,
    activeTab === "occupancy",
  );

  const applyPreset = (daysBack: number) => {
    setFrom(shiftDate(today, -daysBack));
    setTo(today);
  };

  return (
    <>
      <PageHeader title={REPORTS_PAGE_TEXT.title} />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          <span>{REPORTS_PAGE_TEXT.fromLabel}</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className={joinClassNames(TOOLBAR_CONTROL_CLASS_NAME, "px-3")}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          <span>{REPORTS_PAGE_TEXT.toLabel}</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className={joinClassNames(TOOLBAR_CONTROL_CLASS_NAME, "px-3")}
          />
        </label>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => applyPreset(0)}>
            {REPORTS_PAGE_TEXT.presetToday}
          </Button>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => applyPreset(6)}>
            {REPORTS_PAGE_TEXT.presetWeek}
          </Button>
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={() => applyPreset(29)}>
            {REPORTS_PAGE_TEXT.presetMonth}
          </Button>
        </div>
      </div>

      <div className="mb-6 flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("revenue")}
          className={joinClassNames(
            "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "revenue" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-ink",
          )}
        >
          {REPORTS_PAGE_TEXT.revenueTab}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("occupancy")}
          className={joinClassNames(
            "-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
            activeTab === "occupancy" ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-ink",
          )}
        >
          {REPORTS_PAGE_TEXT.occupancyTab}
        </button>
      </div>

      {activeTab === "revenue" && (
        <div className="space-y-6">
          {isRevenuePending && <div className="h-40 animate-pulse rounded-xl bg-gray-100" />}

          {!isRevenuePending && revenue && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className={joinClassNames(CARD_CLASS_NAME, "p-4")}>
                  <p className="text-xs font-medium text-gray-500">{REPORTS_PAGE_TEXT.netRevenue}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-brand tabular-nums">
                    {formatRubles(revenue.totals.netRevenue)}
                  </p>
                </div>
                <div className={joinClassNames(CARD_CLASS_NAME, "p-4")}>
                  <p className="text-xs font-medium text-gray-500">{REPORTS_PAGE_TEXT.grossAmount}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink tabular-nums">
                    {formatRubles(revenue.totals.grossAmount)}
                  </p>
                </div>
                <div className={joinClassNames(CARD_CLASS_NAME, "p-4")}>
                  <p className="text-xs font-medium text-gray-500">{REPORTS_PAGE_TEXT.refundedAmount}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-red-700 tabular-nums">
                    {formatRubles(revenue.totals.refundedAmount)}
                  </p>
                </div>
                <div className={joinClassNames(CARD_CLASS_NAME, "p-4")}>
                  <p className="text-xs font-medium text-gray-500">{REPORTS_PAGE_TEXT.ticketsSold}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-ink tabular-nums">{revenue.totals.ticketsSold}</p>
                </div>
                <div className={joinClassNames(CARD_CLASS_NAME, "p-4")}>
                  <p className="text-xs font-medium text-gray-500">{REPORTS_PAGE_TEXT.ticketsRefunded}</p>
                  <p className="mt-1 font-display text-2xl font-bold text-gray-600 tabular-nums">
                    {revenue.totals.ticketsRefunded}
                  </p>
                </div>
              </div>

              {revenue.byFilm.length === 0 && revenue.byHall.length === 0 ? (
                <EmptyState
                  icon="chart"
                  title={REPORTS_PAGE_TEXT.emptyRevenueTitle}
                  description={REPORTS_PAGE_TEXT.emptyRevenueDescription}
                />
              ) : (
                <div className="space-y-5">
                  {revenue.byFilm.length > 0 && (
                    <RevenueBreakdownTable
                      title={REPORTS_PAGE_TEXT.byFilmHeading}
                      rows={revenue.byFilm.map((item) => ({ ...item, key: item.filmId, label: item.filmTitle }))}
                    />
                  )}
                  {revenue.byHall.length > 0 && (
                    <RevenueBreakdownTable
                      title={REPORTS_PAGE_TEXT.byHallHeading}
                      rows={revenue.byHall.map((item) => ({ ...item, key: item.hallId, label: item.hallName }))}
                    />
                  )}
                  {revenue.byChannel.length > 0 && (
                    <RevenueBreakdownTable
                      title={REPORTS_PAGE_TEXT.byChannelHeading}
                      rows={revenue.byChannel.map((item) => ({
                        ...item,
                        key: item.channel,
                        label: ORDER_CHANNEL_LABELS[item.channel],
                      }))}
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "occupancy" && (
        <div>
          {isOccupancyPending && <div className="h-48 animate-pulse rounded-xl bg-gray-100" />}

          {!isOccupancyPending && (!occupancy || occupancy.length === 0) && (
            <EmptyState
              icon="calendar"
              title={REPORTS_PAGE_TEXT.emptyOccupancyTitle}
              description={REPORTS_PAGE_TEXT.emptyOccupancyDescription}
            />
          )}

          {!isOccupancyPending && occupancy && occupancy.length > 0 && (
            <div className={joinClassNames(CARD_CLASS_NAME, "overflow-hidden")}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[42rem] text-left text-sm">
                  <thead className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                    <tr>
                      <th className="px-5 py-3">{REPORTS_PAGE_TEXT.colSession}</th>
                      <th className="px-4 py-3">{REPORTS_PAGE_TEXT.colFilm}</th>
                      <th className="px-4 py-3">{REPORTS_PAGE_TEXT.colHall}</th>
                      <th className="px-4 py-3">{REPORTS_PAGE_TEXT.colStatus}</th>
                      <th className="px-4 py-3 text-right">{REPORTS_PAGE_TEXT.colSeats}</th>
                      <th className="px-5 py-3 text-right">{REPORTS_PAGE_TEXT.colOccupancy}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {occupancy.map((item) => (
                      <tr key={item.sessionId} className="hover:bg-gray-50/70">
                        <td className="px-5 py-3 text-gray-700 tabular-nums whitespace-nowrap">
                          {formatCalendarDate(toDateInTimeZone(item.startsAt, cinema.timezone))},{" "}
                          {formatTimeInZone(item.startsAt, cinema.timezone)}
                        </td>
                        <td className="px-4 py-3 font-medium text-ink">{item.filmTitle}</td>
                        <td className="px-4 py-3 text-gray-600">{item.hallName}</td>
                        <td className="px-4 py-3">
                          <Badge tone={item.status === "CANCELLED" ? "danger" : "success"}>
                            {item.status === "CANCELLED"
                              ? REPORTS_PAGE_TEXT.statusCancelled
                              : REPORTS_PAGE_TEXT.statusScheduled}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-700 tabular-nums">
                          {item.soldTickets} / {item.totalSeats}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <progress
                              value={Math.min(100, Math.max(0, item.occupancyPercent))}
                              max={100}
                              className="h-2 w-20 overflow-hidden rounded-full [&::-moz-progress-bar]:bg-brand [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:bg-brand"
                            />
                            <span className="w-11 text-right font-semibold text-ink tabular-nums">
                              {item.occupancyPercent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};
