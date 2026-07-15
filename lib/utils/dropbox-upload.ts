export async function uploadFileToDropbox(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/dropbox-upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Upload failed");
  }

  return (await response.json()) as { url: string; name: string; path: string };
}
