import { requireAdmin } from "@/lib/require-admin";
import { resetDevice } from "@/lib/device-guard";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const { id } = await params;
  await resetDevice(id);

  return Response.json({ ok: true });
}
