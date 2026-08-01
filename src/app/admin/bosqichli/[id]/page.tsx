import { TopicDetail } from "@/components/admin/topic-detail";

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <TopicDetail topicId={id} />;
}
