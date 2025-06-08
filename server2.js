const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const issuedTokens = new Map();  // token => userId

function generateToken(userId) {
  return Buffer.from(userId).toString('base64').slice(0, 16);
}

app.post('/api/issue-qr', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId 필요' });
  }
  const hasToken = Array.from(issuedTokens.values()).includes(userId);
  if (hasToken) {
    return res.json({ error: '이미 사용중인 id입니다.' });
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
  res.json({ success: true, userId });
});

// ✅ 여기에 추가
app.post('/api/save-userinfo', (req, res) => {
  const userInfo = req.body;
  console.log('받은 사용자 정보:', userInfo);
  res.json({ success: true, message: '정보 저장 완료' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

