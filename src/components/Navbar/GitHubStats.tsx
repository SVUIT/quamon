import React, { useEffect, useState } from 'react';

const GitHubStats: React.FC = () => {
  const [stats, setStats] = useState({ stars: 0, forks: 0, version: 'v1.0.0' });

  useEffect(() => {
    // Keep existing API fetches
    fetch('https://api.github.com/repos/SVUIT/quamon')
      .then(res => res.json())
      .then(data => {
        setStats(prev => ({
          ...prev,
          stars: data.stargazers_count || 0,
          forks: data.forks_count || 0
        }));
      })
      .catch(() => console.log("GitHub API bận"));

    fetch('https://api.github.com/repos/SVUIT/quamon/releases/latest')
      .then(res => res.json())
      .then(data => {
        if (data.tag_name) setStats(prev => ({ ...prev, version: data.tag_name }));
      })
      .catch(() => {});
  }, []);

  return (
    <a 
      href="https://github.com/SVUIT/quamon" 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '5px 12px',
        backgroundColor: 'rgba(128, 128, 128, 0.08)', 
        borderRadius: '8px',
        textDecoration: 'none',
        color: 'var(--text-color)',
        fontSize: '12px',
        gap: '10px',
        transition: 'all 0.15s ease-out'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.15)'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.08)'}
      onMouseDown={(e) => e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.25)'}
      onMouseUp={(e) => e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.15)'}
    >
      {/* Main GitHub Icon*/}
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
      
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
        <span style={{ fontWeight: 800, fontSize: '11px' }}>SVUIT/quamon</span>
        
        {/* Repository statistics */}
        <div style={{ display: 'flex', gap: '4px', fontSize: '10px', opacity: 0.7, alignItems: 'center' }}>
          <span>{stats.version}</span>
          <span>•</span>
          {/* Star icon */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            {stats.stars}
          </span>
          <span>•</span>
          {/* Fork icon */}
          <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
            {stats.forks}
          </span>
        </div>
      </div>
    </a>
  );
};

export default GitHubStats;