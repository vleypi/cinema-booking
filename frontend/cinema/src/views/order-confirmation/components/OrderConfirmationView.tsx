import { joinClassNames } from "@luch/shared/lib";
import { ROUTES } from "@/shared/config";
import { ButtonLink, CONTAINER_CLASS_NAME, MONO_LABEL_CLASS_NAME, PANEL_CLASS_NAME } from "@/shared/ui";
import { ORDER_CONFIRMATION_TEXT } from "@/views/order-confirmation/constants/order-confirmation.constant";

interface IOrderConfirmationViewProps {
  orderNumber: string;
}

export const OrderConfirmationView = ({ orderNumber }: IOrderConfirmationViewProps) => (
  <section className="min-h-svh px-gutter pt-[calc(var(--spacing-nav)+3rem)] pb-24">
    <div className={CONTAINER_CLASS_NAME}>
      <div className={joinClassNames(PANEL_CLASS_NAME, "mx-auto grid max-w-2xl gap-6 bg-ink-2 p-6 sm:p-10")}>
        <div className="grid gap-2">
          <span className={MONO_LABEL_CLASS_NAME}>{ORDER_CONFIRMATION_TEXT.eyebrow}</span>
          <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] leading-none font-medium uppercase">
            {ORDER_CONFIRMATION_TEXT.title(orderNumber)}
          </h1>
        </div>
        <p className="text-paper/72">{ORDER_CONFIRMATION_TEXT.description}</p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={ROUTES.cabinet}>{ORDER_CONFIRMATION_TEXT.cabinetButton}</ButtonLink>
          <ButtonLink href={ROUTES.home} variant="ghost">
            {ORDER_CONFIRMATION_TEXT.homeButton}
          </ButtonLink>
        </div>
      </div>
    </div>
  </section>
);
