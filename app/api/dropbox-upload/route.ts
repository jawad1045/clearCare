import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const DROPBOX_UPLOAD_URL = "https://content.dropboxapi.com/2/files/upload";
const DROPBOX_SHARE_URL = "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings";

function buildDropboxPath(fileName: string) {
  const prefix = (process.env.DROPBOX_UPLOAD_PATH_PREFIX ?? "/uploads").replace(/\/+$/, "");
  const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${prefix}/${timestamp}-${safeName}`;
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = process.env.DROPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    return NextResponse.json({ error: "Dropbox storage is not configured." }, { status: 500 });
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

  const shareResponse = await fetch(DROPBOX_SHARE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      path,
      settings: {
        access: "viewer",
        allow_download: true,
      },
    }),
  });

  if (!shareResponse.ok) {
    const errorText = await shareResponse.text();
    return NextResponse.json({ error: errorText || "Dropbox link creation failed." }, { status: 502 });
  }

  const shareData = (await shareResponse.json()) as { url?: string };
  const sharedUrl = shareData.url?.replace("dl=0", "raw=1") ?? "";

  return NextResponse.json({
    url: sharedUrl,
    name: file.name,
    path,
  });
}
