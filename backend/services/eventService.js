// In-memory event queue
const eventQueue = [];

// In-memory campaign stats store
// Structure: Map<campaign_id, { play_count, screens: Set, last_played }>
const campaignStats = new Map();

/**
 * Add a play event to the queue
 * @param {Object} event - Play event object
 */
function addEventToQueue(event) {
  eventQueue.push({
    ...event,
    queued_at: new Date().toISOString()
  });
  console.log(`[QUEUE] Event queued: ${event.campaign_id} on ${event.screen_id} (Queue size: ${eventQueue.length})`);
}

/**
 * Get the next event from the queue (FIFO)
 * @returns {Object|null} - Next event or null if queue is empty
 */
function getNextEvent() {
  return eventQueue.shift() || null;
}

/**
 * Get current queue size
 * @returns {number}
 */
function getQueueSize() {
  return eventQueue.length;
}

/**
 * Process a play event and update campaign stats
 * @param {Object} event - Play event object
 */
function processEvent(event) {
  const { campaign_id, screen_id, timestamp } = event;
  
  if (!campaignStats.has(campaign_id)) {
    campaignStats.set(campaign_id, {
      play_count: 0,
      screens: new Set(),
      last_played: null
    });
  }

  const stats = campaignStats.get(campaign_id);
  stats.play_count += 1;
  stats.screens.add(screen_id);
  stats.last_played = timestamp;

  console.log(`[PROCESSOR] Processed: ${campaign_id} (Total plays: ${stats.play_count})`);
}

/**
 * Get all campaign statistics
 * @returns {Map} - Campaign stats map
 */
function getCampaignStats() {
  return campaignStats;
}

/**
 * Get stats for a specific campaign
 * @param {string} campaignId 
 * @returns {Object|null}
 */
function getCampaignById(campaignId) {
  return campaignStats.get(campaignId) || null;
}

/**
 * Reset all stats (useful for testing)
 */
function resetStats() {
  campaignStats.clear();
  eventQueue.length = 0;
}

module.exports = {
  addEventToQueue,
  getNextEvent,
  getQueueSize,
  processEvent,
  getCampaignStats,
  getCampaignById,
  resetStats
};
