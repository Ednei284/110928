const VALID_API_KEYS = process.env.VALID_API_KEYS; // Use .env!

export default function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
    return res.status(401).json({
      error: 'Acesso não autorizado. API Key inválida.'
    });
  }

  next();
};