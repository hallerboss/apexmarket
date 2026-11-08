// Client-side image resize to an exact pixel size, exported as JPEG.
// Used by the admin product editor so uploaded product images match a
// fixed target dimension before being sent to storage.
export async function resizeImageFile(file, width, height) {
  if (!width || !height) return file;
  if (typeof document === "undefined") return file;

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    // Flatten transparency onto white for JPEG export.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92)
    );
    const outName = (file.name || "image").replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], outName, { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}