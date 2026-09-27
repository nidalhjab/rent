"use client";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { t } from "@/messages/ar";

export default function PublicError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return <Container className="space-y-4 py-16 text-center">
    <h1 className="text-xl font-semibold">{t.form.genericError}</h1>
    <Button onClick={() => retry()}>{t.offline.retry}</Button>
  </Container>;
}
