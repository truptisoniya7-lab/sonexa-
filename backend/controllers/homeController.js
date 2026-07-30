const HomeService = require('../services/HomeService');
const LiveRoomService = require('../services/LiveRoomService');
const PlaylistService = require('../services/PlaylistService');
const RuleBasedProvider = require('../services/recommendation/RuleBasedProvider');
const recommendationProvider = new RuleBasedProvider();

const getCoreHome = async (req, res) => {
  try {
    const userId = req.cookies.user_id || '1'; // Defaulting to 1 for demo
    const data = await HomeService.getCoreHomeData(userId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTrending = async (req, res) => {
  try {
    const playlists = await PlaylistService.getTrendingPlaylists();
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLive = async (req, res) => {
  try {
    const rooms = await LiveRoomService.getLiveRooms();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getFriends = async (req, res) => {
  try {
    const activity = await LiveRoomService.getFriendsActivity();
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getLayout = async (req, res) => {
  try {
    const userId = req.cookies?.user_id || req.headers['x-user-id'] || 'guest';
    const layout = await recommendationProvider.getHomeRecommendations(userId);
    res.json({ layout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getCoreHome,
  getTrending,
  getLive,
  getFriends,
  getLayout
};
