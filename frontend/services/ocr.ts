import TextRecognition from '@react-native-ml-kit/text-recognition';

type Block = {
  text: string;
  frame?: { top?: number; left?: number; height?: number; width?: number };
};

const cleanToken = (token: string) =>
  token
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const looksLikeDrugName = (token: string) => {
  if (token.length < 3) return false;
  if (/^\d+$/.test(token)) return false;
  const banned = [
    'mg', 'mcg', 'ml', 'gm', 'tablet', 'tablets', 'capsule', 'capsules',
    'syrup', 'inhaler', 'suspension', 'each', 'per', 'dose', 'active',
    'ingredient', 'ingredients', 'store', 'below', 'celsius', 'batch',
    'expiry', 'manufactured', 'pakistan',
  ];
  if (banned.includes(token.toLowerCase())) return false;
  return true;
};

export const extractMedicineCandidates = (blocks: Block[]): string[] => {
  const scored = blocks
    .map((b) => {
      const raw = (b.text || '').trim();
      if (!raw) return null;
      const top = b.frame?.top ?? 0;
      const height = b.frame?.height ?? 0;
      const lines = raw.split('\n');
      return lines
        .map((line) => {
          const cleaned = cleanToken(line);
          if (!cleaned) return null;
          const tokens = cleaned.split(' ').filter((t) => looksLikeDrugName(t));
          if (tokens.length === 0) return null;
          const candidate = tokens.join(' ');
          const upperRatio =
            candidate.replace(/[^A-Z]/g, '').length /
            Math.max(candidate.replace(/[^A-Za-z]/g, '').length, 1);
          const score =
            height * 2 + upperRatio * 50 - top * 0.05 + Math.min(candidate.length, 20);
          return { candidate, score };
        })
        .filter(Boolean) as { candidate: string; score: number }[];
    })
    .flat()
    .filter(Boolean) as { candidate: string; score: number }[];

  const deduped = new Map<string, number>();
  scored.forEach(({ candidate, score }) => {
    const key = candidate.toUpperCase();
    if (!deduped.has(key) || (deduped.get(key) as number) < score) {
      deduped.set(key, score);
    }
  });

  return Array.from(deduped.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([candidate]) => candidate);
};

export const recognizeMedicineText = async (imageUri: string): Promise<string[]> => {
  const result = await TextRecognition.recognize(imageUri);
  const blocks = (result.blocks || []) as Block[];
  return extractMedicineCandidates(blocks);
};
