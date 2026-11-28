"use client";

import { joinClassNames } from "@luch/shared/lib";
import { useState } from "react";
import { ROUTES } from "@/shared/config";
import { Button, ButtonLink, CHIP_CLASS_NAME, CONTAINER_CLASS_NAME, MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import { useCustomerLogout, useCustomerMe, useCustomerOrders } from "@/entities/customer";
import { OrderCard } from "@/views/cabinet/components/OrderCard";
import { ProfileCard } from "@/views/cabinet/components/ProfileCard";
import { CABINET_TEXT } from "@/views/cabinet/constants/cabinet.constant";

type CabinetTab = "upcoming" | "past" | "profile";

export const CabinetView = () => {
  const [tab, setTab] = useState<CabinetTab>("upcoming");
  const { data: profile, isLoading: isProfileLoading } = useCustomerMe();
  const { data: orders, isLoading: isOrdersLoading } = useCustomerOrders();
  const logout = useCustomerLogout();

  const handleLogout = async () => {
    await logout.mutateAsync();
    window.location.assign(ROUTES.home);
  };

  const visibleOrders = tab === "upcoming" ? (orders?.upcoming ?? []) : (orders?.past ?? []);

  return (
    <section className="min-h-svh px-gutter pt-[calc(var(--spacing-nav)+2rem)] pb-24">
      <div className={CONTAINER_CLASS_NAME}>
        <div className="grid gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="grid gap-2">
              <span className={MONO_LABEL_CLASS_NAME}>{CABINET_TEXT.eyebrow}</span>
              <h1 className="font-display text-[clamp(2rem,4.5vw,3.5rem)] leading-none font-medium uppercase">{CABINET_TEXT.title}</h1>
            </div>
            <Button variant="ghost" size="small" disabled={logout.isPending} onClick={() => void handleLogout()}>
              {CABINET_TEXT.logout}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(
              [
                ["upcoming", CABINET_TEXT.upcomingTab],
                ["past", CABINET_TEXT.pastTab],
                ["profile", CABINET_TEXT.profileTab],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
                className={CHIP_CLASS_NAME}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "profile" ? (
            isProfileLoading || !profile ? (
              <p className="text-paper/64">{CABINET_TEXT.loading}</p>
            ) : (
              <ProfileCard profile={profile} />
            )
          ) : isOrdersLoading ? (
            <p className="text-paper/64">{CABINET_TEXT.loading}</p>
          ) : visibleOrders.length === 0 ? (
            <div className={joinClassNames(PANEL_CLASS_NAME, "grid max-w-xl justify-items-start gap-5 bg-ink-2 p-6 sm:p-8")}>
              <p className="text-paper/72">{tab === "upcoming" ? CABINET_TEXT.emptyUpcoming : CABINET_TEXT.emptyPast}</p>
              <ButtonLink href={ROUTES.home} variant="ghost" size="small">
                {CABINET_TEXT.goToSchedule}
              </ButtonLink>
            </div>
          ) : (
            <div className="grid gap-5">
              {visibleOrders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
