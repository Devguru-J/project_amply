// YouTube URL → videoId extractor.
// Supports: https://www.youtube.com/watch?v=ID, https://youtu.be/ID,
// https://www.youtube.com/embed/ID, https://www.youtube.com/shorts/ID,
// https://m.youtube.com/watch?v=ID, music.youtube.com, plus bare 11-char IDs.

const YT_ID_RE = /^[A-Za-z0-9_-]{11}$/;

export function extractYouTubeId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  if (YT_ID_RE.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return YT_ID_RE.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "music.youtube.com") {
    const v = url.searchParams.get("v");
    if (v && YT_ID_RE.test(v)) return v;

    const segments = url.pathname.split("/").filter(Boolean);
    const idx = segments.findIndex(
      (s) => s === "embed" || s === "shorts" || s === "live" || s === "v",
    );
    if (idx >= 0 && segments[idx + 1] && YT_ID_RE.test(segments[idx + 1])) {
      return segments[idx + 1];
    }
  }

  return null;
}

export function youtubeThumbnail(videoId: string, quality: "default" | "hq" | "max" = "hq") {
  const map = { default: "default", hq: "hqdefault", max: "maxresdefault" } as const;
  return `https://i.ytimg.com/vi/${videoId}/${map[quality]}.jpg`;
}

// Fetches public oEmbed metadata (title + author). No API key required.
export async function fetchYouTubeOEmbed(videoId: string): Promise<{
  title: string;
  author: string;
  thumbnail_url: string;
} | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      title: string;
      author_name: string;
      thumbnail_url: string;
    };
    return {
      title: data.title,
      author: data.author_name,
      thumbnail_url: data.thumbnail_url,
    };
  } catch {
    return null;
  }
}
