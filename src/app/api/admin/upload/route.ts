import { requireAdmin } from "@/lib/require-admin";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return new Response("Forbidden", { status: 403 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return new Response("No file", { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = path.extname(file.name) || ".jpg";
  const filename = `${randomUUID()}${ext}`;

  const uploadDir = path.join(process.cwd(), "public", "uploads", "questions");
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return Response.json({ url: `/uploads/questions/${filename}` });
}
