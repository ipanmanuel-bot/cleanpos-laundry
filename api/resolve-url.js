// Vercel Serverless Function — resolve short Google Maps URLs server-side
// Called by frontend: /api/resolve-url?url=<encoded>
// Returns: { url, lat, lng } — coordinates extracted from redirect URL or HTML body

function extractCoords(text) {
  if (!text) return null;

  // @lat,lng (standard Google Maps URL)
  let m = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (m) return validate(m[1], m[2]);

  // ?q=lat,lng or query=lat,lng or ll=lat,lng
  m = text.match(/[?&](?:q|query|ll)=(-?\d+\.\d+)[,+](-?\d+\.\d+)/);
  if (m) return validate(m[1], m[2]);

  // !3d<lat>!4d<lng> embedded in data URLs or HTML
  const lat3d = text.match(/!3d(-?\d+\.\d+)/);
  const lng4d = text.match(/!4d(-?\d+\.\d+)/);
  if (lat3d && lng4d) return validate(lat3d[1], lng4d[1]);

  // center=lat%2Clng (URL-encoded comma)
  m = text.match(/center=(-?\d+\.\d+)(?:%2C|,)(-?\d+\.\d+)/i);
  if (m) return validate(m[1], m[2]);

  // "lat":-6.xxx,"lng":106.xxx (JSON in HTML)
  const jlat = text.match(/"lat(?:itude)?"\s*:\s*(-?\d+\.\d+)/);
  const jlng = text.match(/"ln?g(?:itude)?"\s*:\s*(-?\d+\.\d+)/);
  if (jlat && jlng) return validate(jlat[1], jlng[1]);

  // pb=!...!8m2!3d<lat>!4d<lng> pattern in encoded URLs
  m = text.match(/8m2!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (m) return validate(m[1], m[2]);

  return null;
}

function validate(latStr, lngStr) {
  const lat = parseFloat(latStr), lng = parseFloat(lngStr);
  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
  return null;
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  if (!url.includes('maps.app.goo.gl') && !url.includes('goo.gl/maps')) {
    return res.status(400).json({ error: 'Only Google Maps short URLs are supported' });
  }

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
      }
    });

    const finalUrl = response.url;

    // Try coordinates from the redirect URL first (fastest)
    const fromUrl = extractCoords(finalUrl);
    if (fromUrl) return res.status(200).json({ url: finalUrl, ...fromUrl });

    // Scan HTML body — read up to 150KB only
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = '';
    while (html.length < 150000) {
      const { done, value } = await reader.read();
      if (done) break;
      html += decoder.decode(value, { stream: true });
      const fromHtml = extractCoords(html);
      if (fromHtml) {
        reader.cancel();
        return res.status(200).json({ url: finalUrl, ...fromHtml });
      }
    }

    return res.status(200).json({ url: finalUrl, lat: null, lng: null });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
