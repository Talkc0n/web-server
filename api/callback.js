const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    // Chuyển hướng đến server Discord khi có lỗi
    return res.redirect('https://discord.gg/4CHBF9WBmM');
  }

  try {
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const REDIRECT_URI = 'https://talkc0n.vercel.app/api/callback';

    // Trao đổi code để lấy access token
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: REDIRECT_URI,
        scope: 'identify',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      // Chuyển hướng đến server Discord khi có lỗi token
      return res.redirect('https://discord.gg/4CHBF9WBmM');
    }

    // Lấy thông tin người dùng
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      // Chuyển hướng đến server Discord khi có lỗi user data
      return res.redirect('https://discord.gg/4CHBF9WBmM');
    }

    const userData = await userResponse.json();

    // Nếu mọi thứ thành công, chuyển hướng đến trang authorized của Discord
    res.redirect('https://discord.com/oauth2/authorized');

  } catch (error) {
    console.error('Lỗi:', error);
    // Chuyển hướng đến server Discord khi có lỗi bất kỳ
    res.redirect('https://discord.gg/4CHBF9WBmM');
  }
};
