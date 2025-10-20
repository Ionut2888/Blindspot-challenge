const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { connectToDatabase } = require('./config/database');
const { addEventToQueue, getCampaignStats, getScreenImpressions } = require('./services/eventService');
const { startQueueProcessor, pauseQueueProcessor, resumeQueueProcessor, getProcessorStatus } = require('./services/queueProcessor');

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
      'GET /screens': 'Get screen impressions breakdown',
      'GET /processor/status': 'Get queue processor status',
      'POST /processor/pause': 'Pause queue processing',
      'POST /processor/resume': 'Resume queue processing'
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

app.get('/campaigns', async (req, res) => {
  try {
    const campaigns = await getCampaignStats();
    
    // Format campaigns data
    const formattedCampaigns = campaigns.map(campaign => ({
      campaign_id: campaign.campaign_id,
      play_count: campaign.play_count || 0,
      screens: campaign.screen_ids ? campaign.screen_ids.length : 0,
      last_played: campaign.last_played,
      screen_ids: campaign.screen_ids || []
    }));

    res.json({
      total_campaigns: formattedCampaigns.length,
      campaigns: formattedCampaigns
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /screens - Get screen impressions breakdown
app.get('/screens', async (req, res) => {
  try {
    const screens = await getScreenImpressions();
    
    // Format screens data
    const formattedScreens = screens.map(screen => ({
      screen_id: screen.screen_id,
      impression_count: screen.impression_count || 0,
      campaigns: screen.campaign_ids ? screen.campaign_ids.length : 0,
      campaign_ids: screen.campaign_ids || []
    }));

    res.json({
      total_screens: formattedScreens.length,
      screens: formattedScreens
    });
  } catch (error) {
    console.error('Error fetching screen impressions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /processor/status - Get queue processor status
app.get('/processor/status', (req, res) => {
  try {
    const status = getProcessorStatus();
    res.json(status);
  } catch (error) {
    console.error('Error fetching processor status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /processor/pause - Pause queue processing
app.post('/processor/pause', (req, res) => {
  try {
    const success = pauseQueueProcessor();
    if (success) {
      res.json({ 
        message: 'Queue processor paused',
        status: getProcessorStatus()
      });
    } else {
      res.json({ 
        message: 'Queue processor already paused',
        status: getProcessorStatus()
      });
    }
  } catch (error) {
    console.error('Error pausing processor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /processor/resume - Resume queue processing
app.post('/processor/resume', async (req, res) => {
  try {
    const success = await resumeQueueProcessor();
    if (success) {
      res.json({ 
        message: 'Queue processor resumed',
        status: getProcessorStatus()
      });
    } else {
      res.json({ 
        message: 'Queue processor already running',
        status: getProcessorStatus()
      });
    }
  } catch (error) {
    console.error('Error resuming processor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB first
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`[SERVER] DOOH Platform API running on port ${PORT}`);
      console.log(`[SERVER] Dashboard: http://localhost:${PORT}`);
      
      // Start background queue processor
      startQueueProcessor();
      console.log('[SERVER] Background queue processor started');
    });
  } catch (error) {
    console.error('[SERVER] Failed to start:', error.message);
    process.exit(1);
  }
}

startServer();
