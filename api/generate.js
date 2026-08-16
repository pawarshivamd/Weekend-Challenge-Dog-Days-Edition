module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawKey = process.env.GEMINI_API_KEY || '';
  const apiKey = rawKey.replace(/["']/g, '').trim();

  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured in Vercel Environment Variables.' });
  }

  try {
    const { prompt, systemPrompt } = req.body || {};

    const models = [
      process.env.GEMINI_MODEL || 'gemini-flash-latest',
      'gemini-2.0-flash-001',
      'gemini-2.0-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-pro-latest'
    ];

    let lastData = null;
    let success = false;
    let lastErrorMsg = '';

    for (const model of models) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: (systemPrompt || '') + '\n\n' + (prompt || '') }] }]
          })
        });

        if (response.ok) {
          lastData = await response.json();
          success = true;
          break;
        } else {
          const errData = await response.json().catch(() => ({}));
          const detail = errData.error ? (errData.error.message || JSON.stringify(errData.error)) : response.statusText;
          lastErrorMsg = `[${response.status} ${model}] ${detail}`;
        }
      } catch (e) {
        lastErrorMsg = `[Network] ${e.message}`;
      }
    }

    if (success && lastData) {
      return res.status(200).json(lastData);
    } else {
      return res.status(500).json({ error: `Gemini API call failed: ${lastErrorMsg || 'Unknown error'}` });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
