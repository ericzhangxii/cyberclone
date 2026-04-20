import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_DOCS = 5;

async function extractText(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pdfParse = (await import("pdf-parse" as any)) as any;
    const buffer = Buffer.from(await file.arrayBuffer());
    const data = await pdfParse(buffer);
    return data.text;
  }
  return file.text();
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clone = await prisma.cyberclone.findUnique({
    where: { userId: session.user.id },
    include: { documents: { select: { id: true } } },
  });

  if (!clone) {
    return NextResponse.json({ error: "No cyberclone found" }, { status: 400 });
  }

  if (clone.documents.length >= MAX_DOCS) {
    return NextResponse.json(
      { error: `Maximum ${MAX_DOCS} documents allowed` },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File too large (max 10 MB)" }, { status: 400 });
  }

  const blob = await put(`documents/${clone.id}/${file.name}`, file, {
    access: "public",
  });

  const textContent = await extractText(file);

  const doc = await prisma.document.create({
    data: {
      cloneId: clone.id,
      filename: file.name,
      blobUrl: blob.url,
      textContent,
    },
  });

  return NextResponse.json({ document: doc });
}
