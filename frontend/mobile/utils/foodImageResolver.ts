/**
 * Food Image Resolver Utility
 *
 * Rules:
 * 1. If an authentic dish photo is present on the official AshokRaj Groups website
 *    (e.g., Breakfast items: Idly, Vada, Ven Pongal, Dosa, Parotto, Poori),
 *    we serve the authentic website image.
 * 2. If the dish image is not on the website, or is a generic category icon/placeholder,
 *    we provide high-definition, verified food photography (via curated verified food collections).
 * 3. All external images are safely routed through our local API image proxy
 *    (/api/v1/proxy/image) to eliminate browser/mobile SSL certificate issues (ERR_CERT_COMMON_NAME_INVALID)
 *    and ensure fast in-memory caching.
 * 4. Provides intelligent keyword-based matching and robust fallback logic for image load errors.
 */

import { getApiBaseUrl } from '../config/api';

// Authentic website base path
const WEBSITE_DOMAIN = 'https://www.ashokrajgroups.com';

/**
 * Proxies any external HTTP/HTTPS image URL through the local API backend.
 * This guarantees:
 * 1. Zero SSL certificate errors (ERR_CERT_COMMON_NAME_INVALID) in Chrome or mobile web.
 * 2. High-speed in-memory caching.
 * 3. Consistent Cross-Origin-Resource-Policy headers.
 */
export function proxyImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('data:') || url.includes('/proxy/image')) {
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const baseUrl = getApiBaseUrl();
      return `${baseUrl}/proxy/image?url=${encodeURIComponent(url)}`;
    } catch {
      return url;
    }
  }
  return url;
}

// Verified, high-resolution fetched food photography (tested & working 200 OK)
export const FETCHED_FOOD_IMAGES: Record<string, string> = {
  // Biryani & Rice
  mutton_biryani: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
  chicken_biryani: 'https://images.pexels.com/photos/7394819/pexels-photo-7394819.jpeg?auto=compress&cs=tinysrgb&w=800',
  veg_biryani: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
  paneer_biryani: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
  fried_rice: 'https://images.pexels.com/photos/3926123/pexels-photo-3926123.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Non-Veg Starters & Curries
  chicken_65: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800',
  chicken_chukka: 'https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=800',
  chicken_gravy: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800',
  mutton_curry: 'https://images.pexels.com/photos/9609838/pexels-photo-9609838.jpeg?auto=compress&cs=tinysrgb&w=800',
  fish_curry: 'https://images.pexels.com/photos/262959/pexels-photo-262959.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Meals & Thali
  nonveg_meals: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800',
  veg_meals: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
  banana_leaf_meals: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Veg Curries & Paneer
  paneer_butter_masala: 'https://images.pexels.com/photos/9609838/pexels-photo-9609838.jpeg?auto=compress&cs=tinysrgb&w=800',
  mushroom_gravy: 'https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=800',
  dal_tadka: 'https://images.pexels.com/photos/2474658/pexels-photo-2474658.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Beverages & Coffee
  filter_coffee: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800',
  tea: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=800',
  badam_milk: 'https://images.pexels.com/photos/5946618/pexels-photo-5946618.jpeg?auto=compress&cs=tinysrgb&w=800',
  orange_juice: 'https://images.pexels.com/photos/1337825/pexels-photo-1337825.jpeg?auto=compress&cs=tinysrgb&w=800',
  jigarthanda: 'https://images.pexels.com/photos/3727250/pexels-photo-3727250.jpeg?auto=compress&cs=tinysrgb&w=800',
  milkshake: 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Chaats & Street Food
  pani_puri: 'https://images.pexels.com/photos/14883752/pexels-photo-14883752.jpeg?auto=compress&cs=tinysrgb&w=800',
  samosa_chaat: 'https://images.pexels.com/photos/4449068/pexels-photo-4449068.jpeg?auto=compress&cs=tinysrgb&w=800',
  bhel_puri: 'https://images.pexels.com/photos/14883752/pexels-photo-14883752.jpeg?auto=compress&cs=tinysrgb&w=800',
  pav_bhaji: 'https://images.pexels.com/photos/5410400/pexels-photo-5410400.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Sweets
  halwa: 'https://images.pexels.com/photos/14463004/pexels-photo-14463004.jpeg?auto=compress&cs=tinysrgb&w=800',
  mysore_pak: 'https://images.pexels.com/photos/1098592/pexels-photo-1098592.jpeg?auto=compress&cs=tinysrgb&w=800',
  gulab_jamun: 'https://images.pexels.com/photos/14463004/pexels-photo-14463004.jpeg?auto=compress&cs=tinysrgb&w=800',
  laddu: 'https://images.pexels.com/photos/1098592/pexels-photo-1098592.jpeg?auto=compress&cs=tinysrgb&w=800',

  // Savouries & Bakery
  murukku: 'https://images.pexels.com/photos/1448721/pexels-photo-1448721.jpeg?auto=compress&cs=tinysrgb&w=800',
  veg_puff: 'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=800',
  egg_puff: 'https://images.pexels.com/photos/2135/food-france-morning-breakfast.jpg?auto=compress&cs=tinysrgb&w=800',
  custom_cake: 'https://images.pexels.com/photos/1702373/pexels-photo-1702373.jpeg?auto=compress&cs=tinysrgb&w=800',
  cookies: 'https://images.pexels.com/photos/230325/pexels-photo-230325.jpeg?auto=compress&cs=tinysrgb&w=800',

  // General Fallbacks
  south_indian_default: 'https://www.ashokrajgroups.com/images/Restaurant/Breakfast/Ghee-Dosa.webp',
  veg_default: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=800',
  nonveg_default: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=800',
};

/**
 * Checks whether a given URL is a real, authentic specific dish photograph on the official website.
 * Note: Egg-kalaki.jpg and Black-Forest.webp on the website return 404 HTML, so they are excluded.
 */
export function isAuthenticWebsiteDishImage(url?: string | null): boolean {
  if (!url) return false;

  // Real food photos in the Breakfast directory on ashokrajgroups.com
  if (
    url.includes('/images/Restaurant/Breakfast/') &&
    !url.includes('Special-Dosa.webp') &&
    !url.includes('Egg-kalaki.jpg') // Missing on upstream website
  ) {
    return true;
  }

  // Reject generic menu icons (.png), hotel interior/exterior images, and unsplash
  if (
    url.endsWith('.png') ||
    url.includes('hero-image.JPG') ||
    url.includes('/Services/') ||
    url.includes('unsplash') ||
    url.includes('Black-Forest.webp') // Missing on upstream website
  ) {
    return false;
  }

  return false;
}

/**
 * Resolves the raw food image URL based on keywords and verified photo catalogs.
 */
function resolveRawFoodImageUrl(
  dishName: string,
  officialUrl?: string | null,
  isVeg?: boolean
): string {
  // If official URL is authentic dish photography, use it
  if (isAuthenticWebsiteDishImage(officialUrl) && officialUrl) {
    return officialUrl;
  }

  const nameLower = (dishName || '').toLowerCase();

  // Biryani Matches
  if (nameLower.includes('mutton') && nameLower.includes('biryani')) return FETCHED_FOOD_IMAGES.mutton_biryani;
  if (nameLower.includes('chicken') && nameLower.includes('biryani')) return FETCHED_FOOD_IMAGES.chicken_biryani;
  if (nameLower.includes('paneer') && nameLower.includes('biryani')) return FETCHED_FOOD_IMAGES.paneer_biryani;
  if (nameLower.includes('biryani')) return FETCHED_FOOD_IMAGES.mutton_biryani;

  // Starters & Non-veg
  if (nameLower.includes('65')) return FETCHED_FOOD_IMAGES.chicken_65;
  if (nameLower.includes('chukka') || nameLower.includes('fry')) return FETCHED_FOOD_IMAGES.chicken_chukka;
  if (nameLower.includes('non-veg meals') || nameLower.includes('non veg meals')) return FETCHED_FOOD_IMAGES.nonveg_meals;

  // Veg Meals & Curries
  if (nameLower.includes('banana leaf') || nameLower.includes('veg meals') || nameLower.includes('veg full meals')) {
    return FETCHED_FOOD_IMAGES.banana_leaf_meals;
  }
  if (nameLower.includes('paneer butter') || nameLower.includes('paneer')) return FETCHED_FOOD_IMAGES.paneer_butter_masala;
  if (nameLower.includes('mushroom')) return FETCHED_FOOD_IMAGES.mushroom_gravy;

  // Beverages & Coffee
  if (nameLower.includes('coffee')) return FETCHED_FOOD_IMAGES.filter_coffee;
  if (nameLower.includes('tea')) return FETCHED_FOOD_IMAGES.tea;
  if (nameLower.includes('jigarthanda')) return FETCHED_FOOD_IMAGES.jigarthanda;
  if (nameLower.includes('juice') || nameLower.includes('orange')) return FETCHED_FOOD_IMAGES.orange_juice;
  if (nameLower.includes('milkshake')) return FETCHED_FOOD_IMAGES.milkshake;

  // Chaats
  if (nameLower.includes('pani puri')) return FETCHED_FOOD_IMAGES.pani_puri;
  if (nameLower.includes('samosa')) return FETCHED_FOOD_IMAGES.samosa_chaat;
  if (nameLower.includes('bhel') || nameLower.includes('chaat')) return FETCHED_FOOD_IMAGES.bhel_puri;
  if (nameLower.includes('pav bhaji')) return FETCHED_FOOD_IMAGES.pav_bhaji;

  // Sweets
  if (nameLower.includes('halwa')) return FETCHED_FOOD_IMAGES.halwa;
  if (nameLower.includes('mysore pak')) return FETCHED_FOOD_IMAGES.mysore_pak;
  if (nameLower.includes('gulab jamun') || nameLower.includes('sweet')) return FETCHED_FOOD_IMAGES.gulab_jamun;
  if (nameLower.includes('laddu')) return FETCHED_FOOD_IMAGES.laddu;

  // Savouries & Bakery
  if (nameLower.includes('murukku') || nameLower.includes('mixture') || nameLower.includes('savouries')) {
    return FETCHED_FOOD_IMAGES.murukku;
  }
  if (nameLower.includes('puff')) return FETCHED_FOOD_IMAGES.veg_puff;
  if (nameLower.includes('black forest') || nameLower.includes('cake')) return FETCHED_FOOD_IMAGES.custom_cake;
  if (nameLower.includes('cookie') || nameLower.includes('biscuit')) return FETCHED_FOOD_IMAGES.cookies;

  // Breakfast items that have authentic website photos
  if (nameLower.includes('idli') || nameLower.includes('idly')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Idly.webp`;
  if (nameLower.includes('vada')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Vada-Sambar.webp`;
  if (nameLower.includes('pongal')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/ven-pongal.webp`;
  if (nameLower.includes('poori')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Poori.webp`;
  if (nameLower.includes('idiyappam')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Idiyappam.webp`;
  if (nameLower.includes('parotto') || nameLower.includes('parotta')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Parotto.webp`;
  if (nameLower.includes('chapati')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Chapati.webp`;
  if (nameLower.includes('ghee roast') || nameLower.includes('ghee dosa')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Ghee-Dosa.webp`;
  if (nameLower.includes('onion dosa')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Onion-Dosa.webp`;
  if (nameLower.includes('podi dosa')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Podi-Dosa.webp`;
  if (nameLower.includes('rava dosa')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/rava-dosa.webp`;
  if (nameLower.includes('dosa')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Ghee-Dosa.webp`;
  if (nameLower.includes('kalaki')) return FETCHED_FOOD_IMAGES.chicken_65;
  if (nameLower.includes('omelette')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Omelette1.jpg`;
  if (nameLower.includes('podimass')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Egg-Podimass.jpg`;
  if (nameLower.includes('half boil')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Half-Boil.jpg`;
  if (nameLower.includes('egg')) return `${WEBSITE_DOMAIN}/images/Restaurant/Breakfast/Egg-Dosa.jpg`;

  // Default fallback
  return isVeg ? FETCHED_FOOD_IMAGES.veg_default : FETCHED_FOOD_IMAGES.nonveg_default;
}

/**
 * Resolves the optimal food image URL, proxied safely to prevent SSL certificate errors.
 */
export function resolveFoodImageUrl(
  dishName: string,
  officialUrl?: string | null,
  isVeg?: boolean
): string {
  const raw = resolveRawFoodImageUrl(dishName, officialUrl, isVeg);
  return proxyImageUrl(raw);
}

/**
 * Returns a fallback image when an initial image fails to load, proxied safely.
 */
export function getFallbackFoodImage(dishName?: string, isVeg?: boolean): string {
  if (!dishName) {
    return proxyImageUrl(isVeg ? FETCHED_FOOD_IMAGES.veg_default : FETCHED_FOOD_IMAGES.nonveg_default);
  }
  return proxyImageUrl(resolveRawFoodImageUrl(dishName, null, isVeg));
}
