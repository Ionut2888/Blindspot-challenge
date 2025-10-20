const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { addEventToQueue, getCampaignStats, getScreenImpressions } = require('./services/eventService');
const { startQueueProcessor } = require('./services/queueProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'DOOH Platform API',
    version: '1.0.0',
    endpoints: {
      'POST /events': 'Submit a play event',
      'GET /campaigns': 'Get campaign statistics',
      'GET /screens': 'Get screen impressions breakdown'
    }
  });
});

app.post('/events', (req, res) => {
  try {
    const event = req.body;
      
    if (!event.screen_id || !event.campaign_id || !event.timestamp) {
      return res.status(400).json({ 
        error: 'Invalid event format. Required fields: screen_id, campaign_id, timestamp' 
      });
    }

    addEventToQueue(event);
    
    res.status(202).json({ 
      message: 'Event accepted and queued for processing',
      event 
    });
  } catch (error) {
    console.error('Error processing event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/campaigns', (req, res) => {
  try {
    const stats = getCampaignStats();
    
    const campaigns = Array.from(stats.entries()).map(([campaignId, data]) => ({
      campaign_id: campaignId,
      play_count: data.play_count,
      screens: data.screens.size,
      last_played: data.last_played,
      screen_ids: Array.from(data.screens)
    }));

    campaigns.sort((a, b) => b.play_count - a.play_count);

    res.json({
      total_campaigns: campaigns.length,
      campaigns
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /screens - Get screen impressions breakdown
app.get('/screens', (req, res) => {
  try {
    const screenStats = getScreenImpressions();
    
    // Convert stats map to array format
    const screens = Array.from(screenStats.entries()).map(([screenId, data]) => ({
      screen_id: screenId,
      impression_count: data.impression_count,
      campaigns: data.campaigns.size,
      campaign_ids: Array.from(data.campaigns)
    }));

    // Sort by impression count descending
    screens.sort((a, b) => b.impression_count - a.impression_count);

    res.json({
      total_screens: screens.length,
      screens
    });
  } catch (error) {
    console.error('Error fetching screen impressions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`[SERVER] DOOH Platform API running on port ${PORT}`);
  console.log(`[SERVER] Dashboard: http://localhost:${PORT}`);
  
  // Start background queue processor
  startQueueProcessor();
  console.log('[SERVER] Background queue processor started');
});
