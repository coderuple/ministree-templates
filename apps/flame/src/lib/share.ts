/**
 * Share a picture — the flyer, the key art — the way a phone expects to.
 *
 * Four rungs, in order:
 *   1. `navigator.share` with the file attached. What people actually want:
 *      the image lands in the story or the message, not a link to it.
 *   2. `navigator.share` with a link, where files aren't supported.
 *   3. A synthetic download, where there is no share sheet at all.
 *
 * The rung that everyone gets wrong is the third one. Closing the share sheet
 * rejects with `AbortError` — that is a person deciding not to share, not a
 * failure, and falling through to a download would hand them a file they just
 * declined. It counts as success.
 *
 * Returns whether anything happened, so a caller can toast on `false`.
 */
export async function shareFile({
  url,
  filename,
  title,
  text,
}: {
  /** The image to attach. Same-origin or CORS-enabled, or the fetch fails. */
  url: string;
  filename: string;
  title: string;
  text?: string;
}): Promise<boolean> {
  try {
    const blob = await fetch(url).then((r) => r.blob());
    // The blob knows its own type; hardcoding image/jpeg mislabels a PNG and
    // some share targets reject the mismatch.
    const file = new File([blob], filename, { type: blob.type || "image/jpeg" });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title, text });
      return true;
    }
    if (navigator.share) {
      await navigator.share({ title, text, url: window.location.href });
      return true;
    }
  } catch (err) {
    if ((err as DOMException)?.name === "AbortError") return true;
  }

  try {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    return true;
  } catch {
    return false;
  }
}
