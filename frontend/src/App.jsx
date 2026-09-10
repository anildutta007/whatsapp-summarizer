import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

function App() {
  const [status, setStatus] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [hours, setHours] = useState('24');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const [messageCount, setMessageCount] = useState(0);

  // Check WhatsApp connection status on mount
  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch groups when status changes to ready
  useEffect(() => {
    if (status?.ready) {
      fetchGroups();
    }
  }, [status?.ready]);

  const checkStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/status`);
      setStatus(response.data);
      setError(null);
    } catch (err) {
      setError(`Connection error: ${err.message}`);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/groups`);
      setGroups(response.data);
    } catch (err) {
      setError(`Failed to fetch groups: ${err.message}`);
    }
  };

  const handleSummarize = async () => {
    if (!selectedGroup) {
      setError('Please select a group');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await axios.post(`${API_BASE}/api/summarize`, {
        groupId: selectedGroup,
        hours: parseInt(hours)
      });

      setSummary(response.data);
      setMessageCount(response.data.messageCount);
    } catch (err) {
      setError(`Failed to summarize: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>📱 WhatsApp Message Summarizer</h1>
        <p>Catch up on group chats with AI summaries</p>
      </header>

      <main className="app-main">
        {/* Status Card */}
        <div className={`status-card ${status?.ready ? 'ready' : 'connecting'}`}>
          <div className="status-icon">
            {status?.ready ? '✓' : '⏳'}
          </div>
          <div className="status-content">
            <h2>{status?.ready ? 'Connected' : 'Connecting...'}</h2>
            <p>{status?.message}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {/* Main Form */}
        {status?.ready && (
          <div className="form-container">
            <div className="form-group">
              <label htmlFor="group-select">Select Group</label>
              <select
                id="group-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                disabled={loading}
              >
                <option value="">-- Choose a group --</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.participantCount} members)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="hours-select">Time Period</label>
              <select
                id="hours-select"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                disabled={loading}
              >
                <option value="6">Last 6 hours</option>
                <option value="12">Last 12 hours</option>
                <option value="24">Last 24 hours</option>
                <option value="48">Last 2 days</option>
                <option value="72">Last 3 days</option>
                <option value="168">Last week</option>
              </select>
            </div>

            <button
              className="summarize-btn"
              onClick={handleSummarize}
              disabled={loading || !selectedGroup}
            >
              {loading ? 'Summarizing...' : 'Summarize Messages'}
            </button>
          </div>
        )}

        {/* Summary Result */}
        {summary && (
          <div className="summary-container">
            <div className="summary-header">
              <h2>{summary.group}</h2>
              <div className="summary-meta">
                <span className="meta-item">📊 {summary.messageCount} messages</span>
                <span className="meta-item">⏰ {summary.period}</span>
                <span className="meta-item">🕐 {new Date(summary.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>

            <div className="summary-content">
              <h3>Summary</h3>
              <div className="summary-text">
                {summary.summary.split('\n').map((line, idx) => (
                  line.trim() && <p key={idx}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* No Messages */}
        {summary && summary.messageCount === 0 && (
          <div className="no-messages">
            <p>No messages found in the specified time period.</p>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Made with ❤️ for staying updated</p>
      </footer>
    </div>
  );
}

export default App;
