"use client";

import { joinClassNames } from "@luch/shared/lib";
import { Icon } from "@luch/shared/ui";
import Link from "next/link";
import { useId, useRef } from "react";
import { PERMISSIONS, ROUTES } from "@/shared/config";
import { HeaderPopover } from "@/shared/ui";
import { hasPermission, useCurrentCinema, useViewer } from "@/entities/viewer";
import { SELECT_CINEMA_TEXT } from "@/features/select-cinema/constants/select-cinema.constant";

const SINGLE_CINEMA_COUNT = 1;

const MENU_ITEM_CLASS_NAME = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-ink transition hover:bg-gray-100";

export const CinemaSwitcher = () => {
  const { data: viewer } = useViewer();
  const { cinema, select } = useCurrentCinema();
  const menuId = useId();
  const menuRef = useRef<HTMLDivElement>(null);
  const cinemas = viewer?.cinemas ?? [];
  const canManageCinemas = hasPermission(viewer, PERMISSIONS.manageCinemas);

  if (!canManageCinemas && !cinema) return null;
  if (!canManageCinemas && cinema && cinemas.length === SINGLE_CINEMA_COUNT)
    return <span className="truncate px-2.5 text-sm font-semibold text-ink">{cinema.name}</span>;

  return (
    <>
      <button
        type="button"
        popoverTarget={menuId}
        className="flex max-w-64 min-w-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink transition hover:bg-gray-100"
      >
        <span className="truncate">{cinema?.name ?? SELECT_CINEMA_TEXT.noCinema}</span>
        <Icon name="chevronDown" className="size-3 text-gray-500" />
      </button>
      <HeaderPopover id={menuId} ref={menuRef} className="right-16 w-72 p-1.5 md:right-22">
        {cinemas.length > 0 && (
          <>
            <p className="px-3 pt-2 pb-1 text-xs text-gray-500">{SELECT_CINEMA_TEXT.choose}</p>
            <ul>
              {cinemas.map(({ id, name }) => {
                const isCurrent = id === cinema?.id;

                return (
                  <li key={id}>
                    <button
                      type="button"
                      popoverTarget={menuId}
                      popoverTargetAction="hide"
                      aria-current={isCurrent}
                      onClick={() => select(id)}
                      className={joinClassNames(MENU_ITEM_CLASS_NAME, "justify-between aria-[current=true]:font-semibold aria-[current=true]:text-brand")}
                    >
                      <span className="truncate">{name}</span>
                      {isCurrent && <Icon name="check" className="size-4" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            {canManageCinemas && <div className="mx-1.5 my-1.5 h-px bg-gray-100" />}
          </>
        )}
        {canManageCinemas && (
          <Link
            href={ROUTES.cinemas}
            onClick={() => menuRef.current?.hidePopover()}
            className={MENU_ITEM_CLASS_NAME}
          >
            <Icon name="cog" className="size-4 text-gray-500" />
            {SELECT_CINEMA_TEXT.settings}
          </Link>
        )}
      </HeaderPopover>
    </>
  );
};
