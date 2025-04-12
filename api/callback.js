const axios = require("axios");

module.exports = async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Hello world, Draken here! Nothing happened!");

  const {
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
    GUILD_ID,
    BOT_TOKEN,
  } = process.env;

  try {
    const tokenRes = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        scope: "identify guilds.join",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const access_token = tokenRes.data.access_token;
    const token_type = tokenRes.data.token_type;

    const userRes = await axios.get("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `${token_type} ${access_token}`,
      },
    });

    const user_id = userRes.data.id;

    const addRes = await axios.put(
      `https://discord.com/api/guilds/${GUILD_ID}/members/${user_id}`,
      {
        access_token: access_token,
      },
      {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (addRes.status === 201 || addRes.status === 204) {
      return res.redirect("https://discord.com/oauth2/authorized");
    } else {
      return res
        .status(addRes.status)
        .send("❌ Không thể xử lý yêu cầu đăng ký của bạn! Đã xảy ra lỗi ngoài ý muốn!");
    }
  } catch (err) {
    return res
      .status(500)
      .send("⚠️ Lỗi trong quá trình xử lý: " + err.message);
  }
};
