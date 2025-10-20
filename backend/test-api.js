/**
 * Test script for DOOH Platform API
 * Run this after starting the server to test the endpoints
 */

const API_URL = 'http://localhost:3000';

// Sample play events
const sampleEvents = [
  { screen_id: 'screen-101', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:00:00Z' },
  { screen_id: 'screen-102', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:05:00Z' },
  { screen_id: 'screen-103', campaign_id: 'cmp-2025-456', timestamp: '2025-10-20T08:10:00Z' },
  { screen_id: 'screen-101', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:15:00Z' },
  { screen_id: 'screen-104', campaign_id: 'cmp-2025-789', timestamp: '2025-10-20T08:20:00Z' },
  { screen_id: 'screen-102', campaign_id: 'cmp-2025-456', timestamp: '2025-10-20T08:25:00Z' },
  { screen_id: 'screen-105', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:30:00Z' },
  { screen_id: 'screen-103', campaign_id: 'cmp-2025-789', timestamp: '2025-10-20T08:35:00Z' },
  { screen_id: 'screen-101', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:00:00Z' },
  { screen_id: 'screen-102', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:05:00Z' },
  { screen_id: 'screen-103', campaign_id: 'cmp-2025-456', timestamp: '2025-10-20T08:10:00Z' },
  { screen_id: 'screen-101', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:15:00Z' },
  { screen_id: 'screen-104', campaign_id: 'cmp-2025-789', timestamp: '2025-10-20T08:20:00Z' },
  { screen_id: 'screen-102', campaign_id: 'cmp-2025-456', timestamp: '2025-10-20T08:25:00Z' },
  { screen_id: 'screen-105', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:30:00Z' },
  { screen_id: 'screen-103', campaign_id: 'cmp-2025-789', timestamp: '2025-10-20T08:35:00Z' },
  { screen_id: 'screen-101', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:00:00Z' },
  { screen_id: 'screen-102', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:05:00Z' },
  { screen_id: 'screen-103', campaign_id: 'cmp-2025-456', timestamp: '2025-10-20T08:10:00Z' },
  { screen_id: 'screen-101', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:15:00Z' },
  { screen_id: 'screen-104', campaign_id: 'cmp-2025-789', timestamp: '2025-10-20T08:20:00Z' },
  { screen_id: 'screen-102', campaign_id: 'cmp-2025-456', timestamp: '2025-10-20T08:25:00Z' },
  { screen_id: 'screen-105', campaign_id: 'cmp-2025-123', timestamp: '2025-10-20T08:30:00Z' },
  { screen_id: 'screen-103', campaign_id: 'cmp-2025-789', timestamp: '2025-10-20T08:35:00Z' },
];

async function postEvent(event) {
  try {
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });
    const data = await response.json();
    console.log('Event posted:', event.campaign_id, 'on', event.screen_id);
    return data;
  } catch (error) {
    console.error('Error posting event:', error.message);
  }
}

async function getCampaigns() {
  try {
    const response = await fetch(`${API_URL}/campaigns`);
    const data = await response.json();
    console.log('\nCampaign Statistics:');
    console.log(`Total Campaigns: ${data.total_campaigns}\n`);
    
    data.campaigns.forEach((campaign, index) => {
      console.log(`${index + 1}. ${campaign.campaign_id}`);
      console.log(`   Play Count: ${campaign.play_count}`);
      console.log(`   Unique Screens: ${campaign.screens}`);
      console.log(`   Screen IDs: ${campaign.screen_ids.join(', ')}`);
      console.log(`   Last Played: ${campaign.last_played}`);
      console.log();
    });
    
    return data;
  } catch (error) {
    console.error('Error fetching campaigns:', error.message);
  }
}

async function runTest() {
  console.log('Starting DOOH Platform API Test\n');
  console.log('Sending sample events...\n');

  // Post all events
  for (const event of sampleEvents) {
    await postEvent(event);
    await new Promise(resolve => setTimeout(resolve, 200)); // Small delay between events
  }

  console.log('\nWaiting for events to be processed (5 seconds)...\n');
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Fetch campaign stats
  await getCampaigns();

  console.log('Test completed!\n');
}

// Run the test
runTest().catch(console.error);
