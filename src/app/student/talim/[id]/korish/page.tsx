import { TalimMemorizeView } from "@/components/student/talim-memorize-view";

export default async function TalimKorishPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TalimMemorizeView stageId={id} />;
}
