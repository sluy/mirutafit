import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getRegistrationEnabled } from "@/lib/settings";
import RegisterForm from "@/components/auth/RegisterForm";

export default async function RegisterPage() {
  const enabled = await getRegistrationEnabled();

  if (!enabled) {
    const tr = await getTranslations("auth.register");
    return (
      <div className="text-center">
        <h1 className="font-display text-2xl font-extrabold text-ink">{tr("disabledTitle")}</h1>
        <p className="mt-3 text-sm text-ink/60">{tr("disabledText")}</p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-full bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand/30"
        >
          {tr("loginLink")}
        </Link>
      </div>
    );
  }

  return <RegisterForm />;
}
