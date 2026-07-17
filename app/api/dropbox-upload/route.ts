// app/api/dropbox-upload/route.ts
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getDropboxAccessToken } from "@/lib/dropbox/get-access-token";
import { getClearCareNamespaceHeader } from "@/lib/dropbox/namespace_header";

const DROPBOX_UPLOAD_URL = "https://content.dropboxapi.com/2/files/upload";

function buildDropboxPath(fileName: string) {
  // Relative to the CLEAR-CARE namespace root — no "/CLEAR-CARE" prefix needed
  const prefix = (process.env.DROPBOX_UPLOAD_SUBFOLDER ?? "/uploads").replace(/\/+$/, "");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}/${timestamp}-${safeName}`;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const dropboxPath = buildDropboxPath(file.name);

  const uploadResponse = await fetch(DROPBOX_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Path-Root": namespaceHeader,
      "Dropbox-API-Arg": JSON.stringify({
        path: dropboxPath,
        mode: "add",
        autorename: true,
        mute: true,
      }),
      "Content-Type": "application/octet-stream",
    },
    body: fileBuffer,
  });

  if (!uploadResponse.ok) {
    const errorText = await uploadResponse.text();
    return NextResponse.json({ error: errorText || "Dropbox upload failed." }, { status: 502 });
  }

  const uploadData = (await uploadResponse.json()) as { path_display?: string };
  const path = uploadData.path_display ?? dropboxPath;

  const proxyUrl = `/api/dropbox-file?path=${encodeURIComponent(path)}`;

  return NextResponse.json({
    url: proxyUrl,
    name: file.name,
    path,
  });
}