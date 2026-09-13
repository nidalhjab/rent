import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { t } from "@/messages/ar";

export const metadata: Metadata = {
  title: t.offline.title,
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <Container className="max-w-md py-24 text-center">
      <h1 className="text-2xl font-bold">{t.offline.title}</h1>
      <p className="mb-8 mt-3 leading-relaxed text-muted">{t.offline.body}</p>
      <ButtonLink href="/">{t.offline.home}</ButtonLink>
    </Container>
  );
}
