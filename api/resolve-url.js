// Vercel Serverless Function — resolve short Google Maps URLs server-side
// Called by frontend: /api/resolve-url?url=<encoded>
module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url parameter' });

  // Only allow Google Maps short URLs
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

    return res.status(200).json({ url: response.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
