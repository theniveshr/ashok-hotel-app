/**
 * Lodge and Mini Hall Image Resolver Utility
 *
 * Rules:
 * 1. If an authentic room or banquet photo is present on the official AshokRaj Groups website
 *    (e.g., /images/Lodge/{single-non-ac.webp, single-ac.jpg, double-bed-ac.webp, six-bed-ac.webp}
 *    or /images/Minihall/Mini-Hall.webp), we serve that authentic image.
 * 2. If the room or hall image is not on the website, or triggers an error,
 *    we fetch/provide high-definition, verified hotel & banquet photography (via verified CDN collections).
 * 3. All external images are safely routed through our local API image proxy
 *    (/api/v1/proxy/image) to eliminate browser/mobile SSL certificate issues (ERR_CERT_COMMON_NAME_INVALID)
 *    and ensure fast in-memory caching.
 * 4. Provides intelligent keyword matching and robust fallback logic for image load errors.
 */

import { proxyImageUrl } from './foodImageResolver';

export { proxyImageUrl };

// Verified high-definition fetched room & venue photography (tested & working 200 OK)
export const FETCHED_LODGE_IMAGES = {
  singleRoom: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800',
  doubleRoom: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
  familySuite: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=800',
  deluxeRoom: 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg?auto=compress&cs=tinysrgb&w=800',
  miniHall: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg?auto=compress&cs=tinysrgb&w=800',
  banquetHall: 'https://images.pexels.com/photos/169198/pexels-photo-169198.jpeg?auto=compress&cs=tinysrgb&w=800',
};

/**
 * Checks whether a given URL is a real, authentic specific room/hall photograph on the official website.
 */
export function isAuthenticWebsiteLodgeImage(url?: string | null): boolean {
  if (!url) return false;
  if (url.includes('/images/Lodge/') || url.includes('/images/Minihall/') || url.includes('/images/Mini-Hall/')) {
    return true;
  }
  return false;
}

/**
 * Resolves the raw room image URL based on keywords and verified photo catalogs.
 */
function resolveRawRoomImageUrl(
  roomName: string,
  officialUrl?: string | null,
  isAc: boolean = true
): string {
  // If official URL is authentic website photo, use it
  if (isAuthenticWebsiteLodgeImage(officialUrl) && officialUrl) {
    return officialUrl;
  }

  const nameLower = (roomName || '').toLowerCase();

  // Family Suite / 6 Bed
  if (nameLower.includes('six') || nameLower.includes('6') || nameLower.includes('family') || nameLower.includes('suite')) {
    return 'https://www.ashokrajgroups.com/images/Lodge/six-bed-ac.webp';
  }

  // Double Bed AC
  if (nameLower.includes('double') || nameLower.includes('couple') || nameLower.includes('deluxe')) {
    return 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp';
  }

  // Single AC
  if (nameLower.includes('single') && (nameLower.includes('ac') || isAc) && !nameLower.includes('non')) {
    return 'https://www.ashokrajgroups.com/images/Lodge/single-ac.jpg';
  }

  // Single Non-AC
  if (nameLower.includes('non-ac') || nameLower.includes('non ac') || !isAc) {
    return 'https://www.ashokrajgroups.com/images/Lodge/single-non-ac.webp';
  }

  return 'https://www.ashokrajgroups.com/images/Lodge/double-bed-ac.webp';
}

/**
 * Resolves the optimal room image URL, safely proxied to avoid SSL cert errors.
 */
export function resolveRoomImageUrl(
  roomName: string,
  officialUrl?: string | null,
  isAc: boolean = true
): string {
  const raw = resolveRawRoomImageUrl(roomName, officialUrl, isAc);
  return proxyImageUrl(raw);
}

/**
 * Resolves the optimal Mini Hall image URL, safely proxied to avoid SSL cert errors.
 */
export function resolveMiniHallImageUrl(officialUrl?: string | null): string {
  if (isAuthenticWebsiteLodgeImage(officialUrl) && officialUrl) {
    return proxyImageUrl(officialUrl);
  }
  return proxyImageUrl('https://www.ashokrajgroups.com/images/Minihall/Mini-Hall.webp');
}

/**
 * Returns a fallback image when an initial room image fails to load, safely proxied.
 */
export function getFallbackRoomImage(roomName?: string): string {
  const nameLower = (roomName || '').toLowerCase();
  if (nameLower.includes('six') || nameLower.includes('family') || nameLower.includes('suite')) {
    return proxyImageUrl(FETCHED_LODGE_IMAGES.familySuite);
  }
  if (nameLower.includes('single')) {
    return proxyImageUrl(FETCHED_LODGE_IMAGES.singleRoom);
  }
  return proxyImageUrl(FETCHED_LODGE_IMAGES.doubleRoom);
}

/**
 * Returns a fallback image when an initial mini hall image fails to load, safely proxied.
 */
export function getFallbackMiniHallImage(): string {
  return proxyImageUrl(FETCHED_LODGE_IMAGES.miniHall);
}
