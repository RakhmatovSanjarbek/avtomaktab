import { QuestionsList } from "@/components/admin/questions-list";

export default async function VariantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <QuestionsList variantId={id} />;
}
