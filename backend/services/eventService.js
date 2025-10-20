const { getDatabase } = require('../config/database');

// In-memory event queue (still in memory as it's temporary)
const eventQueue = [];

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
 * Process a play event and update campaign stats in MongoDB
 * @param {Object} event - Play event object
 */
async function processEvent(event) {
  const { campaign_id, screen_id, timestamp } = event;
  
  try {
    const db = getDatabase();
    const campaignsCollection = db.collection('campaigns');
    const screensCollection = db.collection('screens');

    // Update campaign stats
    await campaignsCollection.updateOne(
      { campaign_id },
      {
        $inc: { play_count: 1 },
        $addToSet: { screen_ids: screen_id },
        $set: { last_played: timestamp }
      },
      { upsert: true }
    );

    // Update screen impressions
    await screensCollection.updateOne(
      { screen_id },
      {
        $inc: { impression_count: 1 },
        $addToSet: { campaign_ids: campaign_id }
      },
      { upsert: true }
    );

    console.log(`[PROCESSOR] Processed: ${campaign_id} on ${screen_id}`);
  } catch (error) {
    console.error('[PROCESSOR] Error processing event:', error.message);
    throw error;
  }
}

/**
 * Get all campaign statistics from MongoDB
 * @returns {Promise<Array>} - Array of campaign stats
 */
async function getCampaignStats() {
  try {
    const db = getDatabase();
    const campaigns = await db.collection('campaigns')
      .find({})
      .sort({ play_count: -1 })
      .toArray();
    
    return campaigns;
  } catch (error) {
    console.error('[DATABASE] Error fetching campaigns:', error.message);
    return [];
  }
}

/**
 * Get stats for a specific campaign from MongoDB
 * @param {string} campaignId 
 * @returns {Promise<Object|null>}
 */
async function getCampaignById(campaignId) {
  try {
    const db = getDatabase();
    const campaign = await db.collection('campaigns').findOne({ campaign_id: campaignId });
    return campaign;
  } catch (error) {
    console.error('[DATABASE] Error fetching campaign:', error.message);
    return null;
  }
}

/**
 * Get all screen impressions from MongoDB
 * @returns {Promise<Array>} - Array of screen stats
 */
async function getScreenImpressions() {
  try {
    const db = getDatabase();
    const screens = await db.collection('screens')
      .find({})
      .sort({ impression_count: -1 })
      .toArray();
    
    return screens;
  } catch (error) {
    console.error('[DATABASE] Error fetching screens:', error.message);
    return [];
  }
}

/**
 * Reset all stats (useful for testing)
 */
async function resetStats() {
  try {
    const db = getDatabase();
    await db.collection('campaigns').deleteMany({});
    await db.collection('screens').deleteMany({});
    eventQueue.length = 0;
    console.log('[DATABASE] All stats reset');
  } catch (error) {
    console.error('[DATABASE] Error resetting stats:', error.message);
  }
}

module.exports = {
  addEventToQueue,
  getNextEvent,
  getQueueSize,
  processEvent,
  getCampaignStats,
  getCampaignById,
  getScreenImpressions,
  resetStats
};
