import { ButtonLink } from "@/components/ui/button";
import { t } from "@/messages/ar";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-3xl font-bold">{t.notFound.title}</h1>
      <p className="text-muted">{t.notFound.body}</p>
      <ButtonLink href="/">{t.notFound.home}</ButtonLink>
    </main>
  );
}
