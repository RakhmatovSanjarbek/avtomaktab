import { VariantDetail } from "@/components/admin/variant-detail";

export default async function VariantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VariantDetail variantId={id} />;
}
