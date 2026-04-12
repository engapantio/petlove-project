/**
 * One-line address for Friends card: only full words (comma- or space-delimited);
 * never a partial word, no "..."; prefer cuts after whole comma-separated segments, then spaces.
 */
export const shortenFriendAddress = (raw: string, maxLen: number): string => {
  const t = raw.replace(/\s+/g, ' ').trim();
  if (!t) return '';
  if (t.length <= maxLen) return t;

  const segments = t.split(',').map((s) => s.trim()).filter(Boolean);

  let result = '';

  for (let si = 0; si < segments.length; si++) {
    const words = segments[si].split(/\s+/).filter(Boolean);
    let segAccum = '';

    for (const word of words) {
      const nextSeg = segAccum ? `${segAccum} ${word}` : word;
      const candidate = result ? `${result}, ${nextSeg}` : nextSeg;

      if (candidate.length <= maxLen) {
        segAccum = nextSeg;
      } else {
        if (segAccum) {
          return (result ? `${result}, ${segAccum}` : segAccum).trim();
        }
        return result.trim();
      }
    }

    if (segAccum) {
      result = result ? `${result}, ${segAccum}` : segAccum;
    }
  }

  return result.trim();
};
