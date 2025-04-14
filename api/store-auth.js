let authStates = {};

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    const { userId, timestamp } = req.body;
    
    // Lưu trạng thái xác thực
    authStates[userId] = timestamp;
    
    // Xóa trạng thái cũ sau 5 phút
    setTimeout(() => {
      if (authStates[userId] === timestamp) {
        delete authStates[userId];
      }
    }, 5 * 60 * 1000);
    
    return res.status(200).json({ success: true });
  } else if (req.method === 'GET') {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ success: false, error: 'No userId provided' });
    }
    
    const isAuthorized = !!authStates[userId];
    
    return res.status(200).json({ 
      success: true, 
      authorized: isAuthorized,
      timestamp: authStates[userId] || null
    });
  }
  
  return res.status(405).json({ success: false, error: 'Method not allowed' });
};
