const HistoryService = require('./HistoryService');
const RecommendationService = require('./RecommendationService');
const PlaybackService = require('./PlaybackService');

class HomeService {
  /**
   * Fetches the core initial data for the Home page
   * (Hero, Continue Listening, Made For You, Recently Played)
   */
  static async getCoreHomeData(userId) {
    // Run core queries in parallel to ensure fast response times
    const [recentSession, history, madeForYou] = await Promise.allSettled([
      PlaybackService.getMostRecentSession(userId),
      HistoryService.getRecentlyPlayed(userId, 6),
      RecommendationService.getMadeForYou(userId)
    ]);

    // Format the hero greeting
    const hour = new Date().getHours();
    let greeting = 'Good evening';
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';

    // Safe extraction of resolved promises
    const recentlyPlayed = history.status === 'fulfilled' ? history.value : [];
    const continueListening = recentSession.status === 'fulfilled' ? recentSession.value : null;
    const recommendations = madeForYou.status === 'fulfilled' ? madeForYou.value : [];

    return {
      hero: {
        greeting,
        stats: {
          streak: 5, // Mocked for now, can be calculated via analytics
          songsToday: recentlyPlayed.length,
          likedSongs: 42 // Mocked
        }
      },
      continueListening,
      recentlyPlayed,
      madeForYou: recommendations
    };
  }
}

module.exports = HomeService;
