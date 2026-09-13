import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { t } from "@/messages/ar";
import { SubmitItemForm } from "./submit-form";

export const metadata: Metadata = {
  title: t.submit.title,
};

export default function NewItemPage() {
  return (
    <Container className="max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{t.submit.title}</h1>
      <p className="mb-8 mt-2 leading-relaxed text-muted">{t.submit.intro}</p>
      <SubmitItemForm />
    </Container>
  );
}
