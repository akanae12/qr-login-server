
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const issuedTokens = new Map();  // token => userId

// userId 기반 고정 토큰 생성 (base64 인코딩 후 16자리로 자름)
function generateToken(userId) {
  return Buffer.from(userId).toString('base64').slice(0, 16);
}

// QR 토큰 발급 API (userId 중복 발급 방지)
app.post('/api/issue-qr', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId 필요' });
  }

  // 이미 발급된 토큰이 있는지 검사
  const hasToken = Array.from(issuedTokens.values()).includes(userId);
  if (hasToken) {
    return res.json({ error: '이미 사용중인 id입니다.' });
  }

  const qrToken = generateToken(userId);
  issuedTokens.set(qrToken, userId);
  res.json({ qrToken });
});

// QR 로그인 처리 API (토큰 유효 확인, 삭제하지 않아 영구 사용 가능)
app.get('/qr-login', (req, res) => {
  const { token } = req.query;
  if (!token || !issuedTokens.has(token)) {
    return res.json({ success: false, message: '유효하지 않은 토큰' });
  }
  const userId = issuedTokens.get(token);
  res.json({ success: true, userId });
});

// 서버 실행
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
