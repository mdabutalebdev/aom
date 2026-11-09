// Small YouTube helpers — admin pastes a plain YouTube link, we derive the
// video ID, a thumbnail URL, and an embeddable player URL from it.

// Extracts the 11-char video ID from any common YouTube URL shape:
// watch?v=, youtu.be/, embed/, shorts/ — tolerant of extra query params
// (&t=, &list=, ?si=...) and reordered params (list=X&v=ID).
export const extractYouTubeId = (url) => {
  if (!url) return null;
  const trimmed = String(url).trim();

  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{11})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match) return match[1];
  }
  return null;
};

// hqdefault is reliably generated for every video, unlike maxresdefault.
export const getYouTubeThumbnail = (videoId) =>
  videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "";

export const getYouTubeEmbedUrl = (videoId) =>
  videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : "";
