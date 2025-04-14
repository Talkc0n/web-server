const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.redirect('https://discord.gg/4CHBF9WBmM');
  }

  try {
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
    const GUILD_ID = process.env.GUILD_ID;
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
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
        scope: 'identify guilds.join bot',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.redirect('https://discord.gg/4CHBF9WBmM');
    }

    // Lấy thông tin người dùng
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.redirect('https://discord.gg/4CHBF9WBmM');
    }

    const userData = await userResponse.json();

    // Thêm người dùng vào server
    try {
      await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bot ${BOT_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: tokenData.access_token,
        }),
      });
    } catch (error) {
      console.error('Lỗi khi thêm người dùng vào server:', error);
      return res.redirect('https://discord.gg/4CHBF9WBmM');
    }

    // Nếu mọi thứ thành công, chuyển hướng đến trang authorized của Discord
    res.redirect('https://discord.com/oauth2/authorized');

  } catch (error) {
    console.error('Lỗi:', error);
    res.redirect('https://discord.gg/4CHBF9WBmM');
  }
};
