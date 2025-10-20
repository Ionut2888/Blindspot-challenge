import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './App.scss'

const API_URL = 'http://localhost:3000';
const REFRESH_INTERVAL = 3000; // Refresh every 3 seconds

interface Campaign {
  campaign_id: string;
  play_count: number;
  screens: number;
  last_played: string;
  screen_ids: string[];
}

interface CampaignsResponse {
  total_campaigns: number;
  campaigns: Campaign[];
}

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [simulating, setSimulating] = useState(false);

  // Fetch campaigns from API
  const fetchCampaigns = async () => {
    try {
      const response = await fetch(`${API_URL}/campaigns`);
      const data: CampaignsResponse = await response.json();
      setCampaigns(data.campaigns);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setLoading(false);
    }
  };

  // Simulate a random play event
  const simulateEvent = async () => {
    setSimulating(true);
    
    const screenIds = ['screen-101', 'screen-102', 'screen-103', 'screen-104', 'screen-105'];
    const campaignIds = ['cmp-2025-123', 'cmp-2025-456', 'cmp-2025-789'];
    
    const randomScreen = screenIds[Math.floor(Math.random() * screenIds.length)];
    const randomCampaign = campaignIds[Math.floor(Math.random() * campaignIds.length)];
    
    const event = {
      screen_id: randomScreen,
      campaign_id: randomCampaign,
      timestamp: new Date().toISOString()
    };

    try {
      await fetch(`${API_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      });
      
      // Fetch updated data after a short delay
      setTimeout(fetchCampaigns, 500);
    } catch (error) {
      console.error('Error simulating event:', error);
    } finally {
      setTimeout(() => setSimulating(false), 500);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    fetchCampaigns();
    const interval = setInterval(fetchCampaigns, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>DOOH Campaign Dashboard</h1>
          <p className="subtitle">Real-time Digital Out-Of-Home Analytics</p>
        </div>
        <div className="header-actions">
          <button 
            className="simulate-btn" 
            onClick={simulateEvent}
            disabled={simulating}
          >
            {simulating ? 'Simulating...' : 'Simulate Event'}
          </button>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total Campaigns</span>
          <span className="stat-value">{campaigns.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Plays</span>
          <span className="stat-value">
            {campaigns.reduce((sum, c) => sum + c.play_count, 0)}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Last Updated</span>
          <span className="stat-value">
            {lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
          </span>
        </div>
        <div className="stat-item auto-refresh">
          <span className="stat-label">Auto-refresh</span>
          <span className="stat-value pulse">Active</span>
        </div>
      </div>

      <main className="main-content">
        {loading ? (
          <div className="loading">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <h2>No campaigns yet</h2>
            <p>Click "Simulate Event" to generate some data</p>
          </div>
        ) : (
          <>
            {/* Bar Chart Section */}
            <div className="chart-section">
              <h2 className="section-title">Campaign Performance</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={campaigns}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="campaign_id" 
                      stroke="#64748b"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis 
                      stroke="#64748b"
                      style={{ fontSize: '0.875rem' }}
                      label={{ value: 'Play Count', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.5rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      labelStyle={{ color: '#0f172a', fontWeight: 600 }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '20px' }}
                      iconType="square"
                    />
                    <Bar 
                      dataKey="play_count" 
                      fill="#2563eb" 
                      name="Play Count"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Campaign Cards Section */}
            <div className="cards-section">
              <h2 className="section-title">Campaign Details</h2>
              <div className="campaigns-grid">
                {campaigns.map((campaign) => (
                  <div key={campaign.campaign_id} className="campaign-card">
                    <div className="campaign-header">
                      <h3>{campaign.campaign_id}</h3>
                      <span className="badge">{campaign.screens} screens</span>
                    </div>
                    
                    <div className="play-count">
                      <span className="count-label">Total Plays</span>
                      <span className="count-value">{campaign.play_count}</span>
                    </div>

                    <div className="campaign-details">
                      <div className="detail-row">
                        <span className="detail-label">Screens:</span>
                        <span className="detail-value">
                          {campaign.screen_ids.join(', ')}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Last Played:</span>
                        <span className="detail-value">
                          {new Date(campaign.last_played).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="footer">
        <p>Ionut Gardu | Updates every {REFRESH_INTERVAL / 1000}s</p>
      </footer>
    </div>
  )
}

export default App
