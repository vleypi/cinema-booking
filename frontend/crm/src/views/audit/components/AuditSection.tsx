"use client";

import { formatCalendarDate, formatTimeInZone, joinClassNames, toDateInTimeZone } from "@luch/shared/lib";
import { Button, SelectControl } from "@luch/shared/ui";
import { Fragment, useMemo, useState } from "react";
import type { ICinemaSummary } from "@/shared/api";
import { Badge, CARD_CLASS_NAME, EmptyState, PageHeader, TOOLBAR_CONTROL_CLASS_NAME } from "@/shared/ui";
import { useAuditLogs } from "@/entities/audit";
import { AUDIT_ACTION_LABELS, AUDIT_ENTITY_OPTIONS, AUDIT_PAGE_TEXT } from "@/views/audit/constants/audit-page.constant";

interface IAuditSectionProps {
  cinema: ICinemaSummary;
}

export const AuditSection = ({ cinema }: IAuditSectionProps) => {
  const [entityType, setEntityType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filter = useMemo(() => ({ entityType, from, to }), [entityType, from, to]);
  const { data: logs, isPending } = useAuditLogs(cinema.id, filter);
  const hasFilters = Boolean(entityType || from || to);

  const handleReset = () => {
    setEntityType("");
    setFrom("");
    setTo("");
  };

  return (
    <>
      <PageHeader title={AUDIT_PAGE_TEXT.title} />

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex w-48 flex-col gap-1 text-xs font-medium text-gray-600">
          <span>{AUDIT_PAGE_TEXT.entityLabel}</span>
          <SelectControl
            aria-label={AUDIT_PAGE_TEXT.entityLabel}
            value={entityType}
            options={AUDIT_ENTITY_OPTIONS}
            onChange={(event) => setEntityType(event.target.value)}
          />
        </div>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          <span>{AUDIT_PAGE_TEXT.fromLabel}</span>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className={joinClassNames(TOOLBAR_CONTROL_CLASS_NAME, "px-3")}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          <span>{AUDIT_PAGE_TEXT.toLabel}</span>
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            className={joinClassNames(TOOLBAR_CONTROL_CLASS_NAME, "px-3")}
          />
        </label>
        {hasFilters && (
          <Button variant="ghost" className="px-3 py-1.5 text-xs" onClick={handleReset}>
            {AUDIT_PAGE_TEXT.resetFilters}
          </Button>
        )}
      </div>

      {isPending && <div className="h-48 animate-pulse rounded-xl bg-gray-100" />}

      {!isPending && (!logs || logs.length === 0) && (
        <EmptyState
          icon="clipboard"
          title={AUDIT_PAGE_TEXT.emptyTitle}
          description={AUDIT_PAGE_TEXT.emptyDescription}
        />
      )}

      {!isPending && logs && logs.length > 0 && (
        <div className={joinClassNames(CARD_CLASS_NAME, "overflow-hidden")}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs font-medium text-gray-500">
                <tr>
                  <th className="px-5 py-3">{AUDIT_PAGE_TEXT.colTime}</th>
                  <th className="px-4 py-3">{AUDIT_PAGE_TEXT.colStaff}</th>
                  <th className="px-4 py-3">{AUDIT_PAGE_TEXT.colAction}</th>
                  <th className="px-4 py-3">{AUDIT_PAGE_TEXT.colEntity}</th>
                  <th className="px-5 py-3 text-right">{AUDIT_PAGE_TEXT.colDetails}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const hasPayload = entry.before !== null || entry.after !== null;

                  return (
                    <Fragment key={entry.id}>
                      <tr className="hover:bg-gray-50/70">
                        <td className="px-5 py-3 text-gray-700 tabular-nums whitespace-nowrap">
                          {formatCalendarDate(toDateInTimeZone(entry.createdAt, cinema.timezone))},{" "}
                          {formatTimeInZone(entry.createdAt, cinema.timezone)}
                        </td>
                        <td className="px-4 py-3 font-medium text-ink">{entry.staffFullName}</td>
                        <td className="px-4 py-3">
                          <Badge tone="brand">{AUDIT_ACTION_LABELS[entry.action] ?? entry.action}</Badge>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-600">
                          {entry.entityType} #{entry.entityId}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {hasPayload && (
                            <Button
                              variant="ghost"
                              className="px-2.5 py-1 text-xs"
                              onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                            >
                              {isExpanded ? AUDIT_PAGE_TEXT.hideDetails : AUDIT_PAGE_TEXT.showDetails}
                            </Button>
                          )}
                        </td>
                      </tr>
                      {isExpanded && hasPayload && (
                        <tr className="bg-gray-50/80">
                          <td colSpan={5} className="px-5 py-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                              {entry.before !== null && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-500">{AUDIT_PAGE_TEXT.beforeLabel}</p>
                                  <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-3 font-mono text-xs text-gray-700">
                                    {JSON.stringify(entry.before, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {entry.after !== null && (
                                <div className="space-y-1">
                                  <p className="text-xs font-semibold text-gray-500">{AUDIT_PAGE_TEXT.afterLabel}</p>
                                  <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-white p-3 font-mono text-xs text-gray-700">
                                    {JSON.stringify(entry.after, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
