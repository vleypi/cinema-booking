import { Suspense } from "react";
import { CONTAINER_CLASS_NAME } from "@/shared/ui";
import { OtpLoginForm } from "@/features/customer-login";

export const LoginView = () => (
  <section className="min-h-svh px-gutter pt-[calc(var(--spacing-nav)+3rem)] pb-24">
    <div className={CONTAINER_CLASS_NAME}>
      <Suspense>
        <OtpLoginForm />
      </Suspense>
    </div>
  </section>
);
