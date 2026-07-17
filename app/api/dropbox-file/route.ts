// app/api/dropbox-file/route.ts
import { getCurrentUser } from "@/lib/auth";
import { getDropboxAccessToken } from "@/lib/dropbox/get-access-token";
import { getClearCareNamespaceHeader } from "@/lib/dropbox/namespace_header";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");
  if (!path) {
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  let accessToken: string;
  let namespaceHeader: string;
  try {
    accessToken = await getDropboxAccessToken();
    namespaceHeader = getClearCareNamespaceHeader();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Dropbox storage is not configured." },
      { status: 500 }
    );
  }

  const dropboxRes = await fetch("https://content.dropboxapi.com/2/files/download", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Path-Root": namespaceHeader,
      "Dropbox-API-Arg": JSON.stringify({ path }),
    },
  });

  if (!dropboxRes.ok) {
    const errorText = await dropboxRes.text();
    return NextResponse.json({ error: errorText || "File fetch failed." }, { status: 502 });
  }

  const buffer = await dropboxRes.arrayBuffer();
  const apiResultHeader = dropboxRes.headers.get("dropbox-api-result");
  let fileName = "file";
  try {
    if (apiResultHeader) {
      const meta = JSON.parse(apiResultHeader) as { name?: string };
      fileName = meta.name ?? fileName;
    }
  } catch {
    // ignore
  }

  const contentType = fileName.toLowerCase().endsWith(".pdf")
    ? "application/pdf"
    : "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, max-age=0, no-store",
    },
  });
}