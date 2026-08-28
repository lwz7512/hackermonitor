const VIDEO_MARKER_RE = /\s*\[video\]\s*$/i;

export function parseTitle(title: string): { title: string; isVideo: boolean } {
  const isVideo = VIDEO_MARKER_RE.test(title);
  return { title: title.replace(VIDEO_MARKER_RE, '').trim(), isVideo };
}
