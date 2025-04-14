const fetch = require('node-fetch');

module.exports = async (req, res) => {
  const { code } = req.query;
  const GUILD_ID = "1285519108968026194"; // ID máy chủ cố định

  if (!code) {
    return res.redirect('https://discord.gg/4CHBF9WBmM');
  }

  try {
    const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
    const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;
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
        scope: 'identify guilds.join',
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Lỗi token:', tokenData);
      return res.redirect('https://discord.gg/4CHBF9WBmM');
    }

    // Lấy thông tin người dùng
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Lỗi user:', await userResponse.text());
      return res.redirect('https://discord.gg/4CHBF9WBmM');
    }

    const userData = await userResponse.json();

    // Thêm người dùng vào server
    const addMemberResponse = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${userData.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: tokenData.access_token,
      }),
    });

    if (!addMemberResponse.ok) {
      console.error('Lỗi thêm thành viên:', await addMemberResponse.text());
      return res.redirect('https://discord.gg/4CHBF9WBmM');
    }

    // Nếu mọi thứ thành công, chuyển hướng đến trang authorized
    res.redirect('https://discord.com/oauth2/authorized');

  } catch (error) {
    console.error('Lỗi:', error);
    res.redirect('https://discord.gg/4CHBF9WBmM');
  }
};
