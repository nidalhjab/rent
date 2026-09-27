import { pageMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/container";
import { t } from "@/messages/ar";
import { SubmitItemForm } from "./submit-form";

export const metadata = pageMetadata({ title: t.submit.title, description: t.submit.intro, path: "/items/new" });

export default function NewItemPage() {
  return (
    <Container className="max-w-3xl py-10">
      <h1 className="text-3xl font-bold">{t.submit.title}</h1>
      <p className="mb-8 mt-2 leading-relaxed text-muted">{t.submit.intro}</p>
      <SubmitItemForm />
    </Container>
  );
}
