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

interface ScreenImpression {
  screen_id: string;
  impression_count: number;
  campaigns: number;
  campaign_ids: string[];
}

interface ScreensResponse {
  total_screens: number;
  screens: ScreenImpression[];
}

interface ProcessorStatus {
  running: boolean;
  paused: boolean;
  interval: number;
  batchSize: number;
}

function App() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [screenImpressions, setScreenImpressions] = useState<ScreenImpression[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [processorPaused, setProcessorPaused] = useState(false);
  const [togglingProcessor, setTogglingProcessor] = useState(false);
  const [simulationInterval, setSimulationInterval] = useState<number | null>(null);

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

  // Fetch screen impressions from API
  const fetchScreenImpressions = async () => {
    try {
      const response = await fetch(`${API_URL}/screens`);
      const data: ScreensResponse = await response.json();
      setScreenImpressions(data.screens);
    } catch (error) {
      console.error('Error fetching screen impressions:', error);
    }
  };

  // Fetch processor status
  const fetchProcessorStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/processor/status`);
      const data: ProcessorStatus = await response.json();
      setProcessorPaused(data.paused);
    } catch (error) {
      console.error('Error fetching processor status:', error);
    }
  };

  // Toggle processor pause/resume
  const toggleProcessor = async () => {
    setTogglingProcessor(true);
    try {
      const endpoint = processorPaused ? '/processor/resume' : '/processor/pause';
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST'
      });
      const data = await response.json();
      setProcessorPaused(data.status.paused);
    } catch (error) {
      console.error('Error toggling processor:', error);
    } finally {
      setTogglingProcessor(false);
    }
  };

  // Generate and send events to the API
  const generateEvents = async () => {
    const screenIds = ['screen-101', 'screen-102', 'screen-103', 'screen-104', 'screen-105'];
    const campaignIds = ['cmp-2025-123', 'cmp-2025-456', 'cmp-2025-789'];
    
    try {
      // Generate and send 20 random events
      const eventPromises = [];
      for (let i = 0; i < 20; i++) {
        const randomScreen = screenIds[Math.floor(Math.random() * screenIds.length)];
        const randomCampaign = campaignIds[Math.floor(Math.random() * campaignIds.length)];
        
        const event = {
          screen_id: randomScreen,
          campaign_id: randomCampaign,
          timestamp: new Date().toISOString()
        };

        // Send event to API
        const promise = fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event)
        });

        eventPromises.push(promise);
      }

      // Wait for all events to be sent
      await Promise.all(eventPromises);
    } catch (error) {
      console.error('Error generating events:', error);
    }
  };

  // Toggle continuous event simulation
  const toggleSimulation = () => {
    if (simulating) {
      // Stop simulation
      if (simulationInterval) {
        clearInterval(simulationInterval);
        setSimulationInterval(null);
      }
      setSimulating(false);
    } else {
      // Start simulation
      setSimulating(true);
      
      // Generate events immediately
      generateEvents();
      
      // Then continue generating every 2 seconds
      const interval = setInterval(() => {
        generateEvents();
      }, 2000);
      
      setSimulationInterval(interval);
    }
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (simulationInterval) {
        clearInterval(simulationInterval);
      }
    };
  }, [simulationInterval]);

  // Auto-refresh effect
  useEffect(() => {
    fetchCampaigns();
    fetchScreenImpressions();
    fetchProcessorStatus();
    const interval = setInterval(() => {
      fetchCampaigns();
      fetchScreenImpressions();
      fetchProcessorStatus();
    }, REFRESH_INTERVAL);
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
            className={`simulate-btn ${simulating ? 'active' : ''}`}
            onClick={toggleSimulation}
          >
            {simulating ? 'Stop Simulation' : 'Start Simulation'}
          </button>
          <button 
            className={`processor-toggle-btn ${processorPaused ? 'paused' : 'running'}`}
            onClick={toggleProcessor}
            disabled={togglingProcessor}
          >
            {togglingProcessor 
              ? 'Toggling...' 
              : processorPaused 
                ? 'Resume Processing' 
                : 'Pause Processing'}
          </button>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Total Campaigns</span>
          <span className="stat-value">{campaigns.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Screens</span>
          <span className="stat-value">{screenImpressions.length}</span>
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
          <span className="stat-label">Processor Status</span>
          <span className={`stat-value ${processorPaused ? 'paused-status' : 'active-status'}`}>
            {processorPaused ? 'Paused' : 'Active'}
          </span>
        </div>
      </div>

      <main className="main-content">
        {loading ? (
          <div className="loading">Loading campaigns...</div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state">
            <h2>No campaigns yet</h2>
            <p>Click "Start Simulation" to generate data</p>
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

            {/* Screen Impressions Section */}
            <div className="chart-section">
              <h2 className="section-title">Impressions per Screen</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={screenImpressions}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis 
                      dataKey="screen_id" 
                      stroke="#64748b"
                      style={{ fontSize: '0.875rem' }}
                    />
                    <YAxis 
                      stroke="#64748b"
                      style={{ fontSize: '0.875rem' }}
                      label={{ value: 'Total Impressions', angle: -90, position: 'insideLeft', style: { fill: '#64748b' } }}
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
                      dataKey="impression_count" 
                      fill="#10b981" 
                      name="Impressions"
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
