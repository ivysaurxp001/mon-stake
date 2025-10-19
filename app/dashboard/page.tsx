"use client";

import { useState, useEffect } from "react";
import { useMetaMask } from "@/components/MetaMaskProvider";
import { getStakeInfo, type StakeInfo, formatStakeInfo } from "@/lib/staking";
import { formatEther } from "viem";

export default function Dashboard() {
  const { account, smartAccount } = useMetaMask();
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // Use connected account
  const userAddress = smartAccount?.address || account;

  useEffect(() => {
    const loadStakeInfo = async () => {
      if (!userAddress) {
        setLoading(false);
        return;
      }

      try {
        const info = await getStakeInfo(userAddress);
        setStakeInfo(info);
      } catch (error) {
        console.error("Failed to load stake info:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStakeInfo();
    const interval = setInterval(loadStakeInfo, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [userAddress]);

  const formatTime = (timestamp: bigint) => {
    if (timestamp === 0n) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const timeRemaining = stakeInfo && stakeInfo.lockEndsAt > 0n
    ? Number(stakeInfo.lockEndsAt) * 1000 - Date.now()
    : 0;
  const daysRemaining = Math.max(0, Math.ceil(timeRemaining / (1000 * 60 * 60 * 24)));

  return (
    <div className="page-content">
      {/* Header Section */}
      <div className="page-section">
        <div className="hero-heading">
          <h1 className="section-title">📊 Staking Dashboard</h1>
          <p className="section-subtitle">
            Monitor your MON staking activity and rewards in real-time
          </p>
        </div>
      </div>

      {!account ? (
        <div className="page-section">
          <div className="card">
            <div className="empty-state">
              <div className="empty-state__icon">🔒</div>
              <h4 className="empty-state__title">Connect Your Wallet</h4>
              <p className="empty-state__description">
                Please connect your MetaMask wallet to view your staking dashboard
              </p>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="page-section">
          <div className="card">
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading staking data...</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="page-section">
            <div className="stats-grid">
              <div className="card card--accent" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', color: 'white', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)' }}>
                <div className="stat-card">
                  <div className="stat-card__icon">💰</div>
                  <div className="stat-card__content">
                    <div className="stat-card__value">
                      {stakeInfo ? formatEther(stakeInfo.stakedAmount) : '0'}
                    </div>
                    <div className="stat-card__label">Total Staked (MON)</div>
                  </div>
                </div>
              </div>
              
              <div className="card card--success" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', color: 'white', boxShadow: '0 8px 24px rgba(167, 139, 250, 0.3)' }}>
                <div className="stat-card">
                  <div className="stat-card__icon">🎁</div>
                  <div className="stat-card__content">
                    <div className="stat-card__value">
                      {stakeInfo ? formatEther(stakeInfo.pendingRewards) : '0'}
                    </div>
                    <div className="stat-card__label">Pending Rewards (MON)</div>
                  </div>
                </div>
              </div>
              
              <div className="card card--warning" style={{ background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)', color: 'white', boxShadow: '0 8px 24px rgba(196, 181, 253, 0.3)' }}>
                <div className="stat-card">
                  <div className="stat-card__icon">📈</div>
                  <div className="stat-card__content">
                    <div className="stat-card__value">10%</div>
                    <div className="stat-card__label">Annual APY</div>
                  </div>
                </div>
              </div>
              
              <div className="card card--info" style={{ background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)', color: '#5B21B6', boxShadow: '0 8px 24px rgba(221, 214, 254, 0.3)' }}>
                <div className="stat-card">
                  <div className="stat-card__icon">
                    {stakeInfo?.canUnstake ? '✅' : '🔒'}
                  </div>
                  <div className="stat-card__content">
                    <div className="stat-card__value">
                      {stakeInfo?.canUnstake ? 'Unlocked' : `${daysRemaining}d`}
                    </div>
                    <div className="stat-card__label">Lock Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Staking Details */}
          <div className="page-section">
            <div className="card">
              <h3 className="section-title">📋 Staking Details</h3>
              
              {stakeInfo && stakeInfo.stakedAmount > 0n ? (
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ 
                    display: 'grid', 
                    gap: '1rem',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
                  }}>
                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '8px' 
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                        Staked Amount
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                        {formatEther(stakeInfo.stakedAmount)} MON
                      </div>
                    </div>

                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '8px' 
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                        Pending Rewards
                      </div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f5576c' }}>
                        {formatEther(stakeInfo.pendingRewards)} MON
                      </div>
                    </div>

                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: '#f5f5f5', 
                      borderRadius: '8px' 
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                        Lock Expires
                      </div>
                      <div style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                        {formatTime(stakeInfo.lockEndsAt)}
                      </div>
                    </div>

                    <div style={{ 
                      padding: '1rem', 
                      backgroundColor: stakeInfo.canUnstake ? '#e8f5e9' : '#fff3e0', 
                      borderRadius: '8px' 
                    }}>
                      <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                        Status
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
                        {stakeInfo.canUnstake ? (
                          <span style={{ color: '#4caf50' }}>✅ Ready to Unstake</span>
                        ) : (
                          <span style={{ color: '#ff9800' }}>🔒 Locked ({daysRemaining} days left)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '2rem', 
                    padding: '1rem', 
                    backgroundColor: '#e3f2fd', 
                    borderRadius: '8px' 
                  }}>
                    <h4 style={{ marginTop: 0 }}>💡 Quick Actions</h4>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                      <a 
                        href="/stake" 
                        style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                        }}
                      >
                        Stake More MON
                      </a>
                      {stakeInfo.canUnstake && (
                        <a 
                          href="/stake" 
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                          }}
                        >
                          Unstake Now
                        </a>
                      )}
                      {stakeInfo.pendingRewards > 0n && (
                        <a 
                          href="/stake" 
                          style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f5576c',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                          }}
                        >
                          Claim Rewards
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state__icon">💎</div>
                  <h4 className="empty-state__title">No Active Stakes</h4>
                  <p className="empty-state__description">
                    Start staking MON to earn 10% APY rewards!
                  </p>
                  <a 
                    href="/stake" 
                    style={{
                      display: 'inline-block',
                      marginTop: '1rem',
                      padding: '0.75rem 2rem',
                      backgroundColor: '#667eea',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                    }}
                  >
                    Start Staking
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="page-section">
            <div className="card">
              <h3 className="section-title">ℹ️ How It Works</h3>
              <div style={{ marginTop: '1.5rem' }}>
                <ol style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
                  <li><strong>Stake MON:</strong> Lock your MON tokens to start earning rewards</li>
                  <li><strong>Earn Rewards:</strong> Automatically earn 10% APY on your staked amount</li>
                  <li><strong>Lock Period:</strong> Staked tokens are locked for 7 days</li>
                  <li><strong>Claim Anytime:</strong> Claim your rewards at any time without unstaking</li>
                  <li><strong>Unstake:</strong> After lock period expires, unstake your MON + rewards</li>
                </ol>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
