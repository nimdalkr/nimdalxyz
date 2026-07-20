export type MediaDimensions = Readonly<{
  width: number;
  height: number;
}>;

const mediaDimensions = {
  "/media/identity-octopus.jpg": { width: 400, height: 400 },
  "/media/projects/alphaduo-proof.png": { width: 1710, height: 873 },
  "/media/projects/hyperalphaduo-proof.png": { width: 1424, height: 805 },
  "/media/projects/hyperalphaduo.webp": { width: 1586, height: 992 },
  "/media/projects/mylol.webp": { width: 1557, height: 1320 },
  "/media/projects/proof/maple-union-field-proof.webp": { width: 1280, height: 720 },
  "/media/projects/ethosalpha-proof.png": { width: 1424, height: 805 },
  "/media/projects/kol-listing.webp": { width: 1586, height: 992 },
  "/media/projects/tg-finance-search-portal.webp": { width: 1586, height: 992 },
  "/media/projects/social-poster-one.webp": { width: 1586, height: 992 },
  "/media/projects/discord-bulk-leave.webp": { width: 1586, height: 992 },
  "/media/career/mkr-logo.jpg": { width: 1280, height: 720 }
} as const satisfies Record<string, MediaDimensions>;

export function getMediaDimensions(src: string): MediaDimensions {
  const dimensions = mediaDimensions[src as keyof typeof mediaDimensions];

  if (!dimensions) {
    throw new Error(`Missing verified media dimensions for ${src}`);
  }

  return dimensions;
}
