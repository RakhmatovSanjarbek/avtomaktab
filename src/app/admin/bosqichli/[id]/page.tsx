import { redirect } from "next/navigation";

export default async function BosqichliRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/talim/${id}`);
}
