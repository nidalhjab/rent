import Link from "next/link";
import { redirect } from "next/navigation";
import { site } from "@/config/site";
import { isAdmin } from "@/lib/auth";
import { t } from "@/messages/ar";
import { LoginForm } from "./login-form";

export const instant = false;

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin/dashboard");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-card border border-border bg-surface p-8 shadow-sm">
        <Link href="/" className="text-sm text-primary">
          {site.name}
        </Link>
        <h1 className="mt-4 text-2xl font-bold">{t.admin.loginTitle}</h1>
        <p className="mb-6 mt-1 text-sm text-muted">{t.admin.loginSubtitle}</p>
        <LoginForm />
      </div>
    </main>
  );
}
