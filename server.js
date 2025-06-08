const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const issuedTokens = new Map();

function generateToken(userId) {
  return Buffer.from(userId + Date.now()).toString('base64').slice(0, 16);
}

app.post('/api/issue-qr', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId 필요' });
  }
  const qrToken = generateToken(userId);
  issuedTokens.set(qrToken, userId);
  res.json({ qrToken });
});

app.get('/qr-login', (req, res) => {
  const { token } = req.query;
  if (!token || !issuedTokens.has(token)) {
    return res.json({ success: false, message: '유효하지 않은 토큰' });
  }
  const userId = issuedTokens.get(token);
  issuedTokens.delete(token);
  res.json({ success: true, userId });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});