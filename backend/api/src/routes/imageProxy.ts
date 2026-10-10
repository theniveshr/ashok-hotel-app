import { type FastifyPluginAsync } from 'fastify';

interface CachedImage {
  buffer: Buffer;
  contentType: string;
  cachedAt: number;
}

const imageCache = new Map<string, CachedImage>();
const MAX_CACHE_SIZE = 150;

// High-quality SVG fallback placeholder for missing/invalid images
const SVG_FALLBACK = `
<svg width="400" height="300" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="300" fill="#F1F5F9"/>
  <rect x="20" y="20" width="360" height="260" rx="16" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="6 6"/>
  <circle cx="200" cy="130" r="44" fill="#3B82F6" fill-opacity="0.1"/>
  <path d="M185 130C185 121.716 191.716 115 200 115C208.284 115 215 121.716 215 130C215 138.284 208.284 145 200 145C191.716 145 185 138.284 185 130Z" fill="#2563EB"/>
  <path d="M178 152C178 147.582 181.582 144 186 144H214C218.418 144 222 147.582 222 152V154H178V152Z" fill="#1D4ED8"/>
  <text x="200" y="195" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="600" font-size="15" fill="#475569">AshokRaj Groups</text>
  <text x="200" y="215" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="400" font-size="12" fill="#94A3B8">Authentic Hospitality &amp; Cuisine</text>
</svg>
`.trim();

const SVG_FALLBACK_BUFFER = Buffer.from(SVG_FALLBACK, 'utf-8');

export const imageProxyRoutes: FastifyPluginAsync = async (app) => {
  app.get('/image', async (request, reply) => {
    const { url } = request.query as { url?: string };

    if (!url || typeof url !== 'string') {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_URL', message: 'Missing or invalid url query parameter' },
      });
    }

    const decodedUrl = decodeURIComponent(url);

    // Validate protocol
    if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
      return reply.status(400).send({
        success: false,
        error: { code: 'INVALID_PROTOCOL', message: 'Only HTTP/HTTPS URLs are allowed' },
      });
    }

    // Check in-memory cache
    const cached = imageCache.get(decodedUrl);
    if (cached && Date.now() - cached.cachedAt < 1000 * 60 * 60 * 24 * 7) {
      return reply
        .header('Content-Type', cached.contentType)
        .header('Cache-Control', 'public, max-age=604800, immutable')
        .header('Access-Control-Allow-Origin', '*')
        .header('Cross-Origin-Resource-Policy', 'cross-origin')
        .send(cached.buffer);
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const upstreamRes = await fetch(decodedUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });

      clearTimeout(timeoutId);

      const contentType = (upstreamRes.headers.get('content-type') || '').toLowerCase();

      // Verify that the upstream returned a real image, not an HTML soft 404
      if (!upstreamRes.ok || !contentType.startsWith('image/')) {
        return reply
          .header('Content-Type', 'image/svg+xml')
          .header('Cache-Control', 'public, max-age=86400')
          .header('Access-Control-Allow-Origin', '*')
        .header('Cross-Origin-Resource-Policy', 'cross-origin')
          .send(SVG_FALLBACK_BUFFER);
      }

      const arrayBuffer = await upstreamRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Manage cache size
      if (imageCache.size >= MAX_CACHE_SIZE) {
        const firstKey = imageCache.keys().next().value;
        if (firstKey) imageCache.delete(firstKey);
      }

      imageCache.set(decodedUrl, {
        buffer,
        contentType,
        cachedAt: Date.now(),
      });

      return reply
        .header('Content-Type', contentType)
        .header('Cache-Control', 'public, max-age=604800, immutable')
        .header('Access-Control-Allow-Origin', '*')
        .header('Cross-Origin-Resource-Policy', 'cross-origin')
        .send(buffer);
    } catch (err: any) {
      app.log.warn({ err: err?.message, url: decodedUrl }, 'Image proxy fetch error, serving fallback SVG');
      return reply
        .header('Content-Type', 'image/svg+xml')
        .header('Cache-Control', 'public, max-age=3600')
        .header('Access-Control-Allow-Origin', '*')
        .header('Cross-Origin-Resource-Policy', 'cross-origin')
        .send(SVG_FALLBACK_BUFFER);
    }
  });
};
