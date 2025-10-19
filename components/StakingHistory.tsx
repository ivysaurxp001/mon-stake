"use client";

import { useState, useEffect } from "react";
import { formatEther } from "viem";

interface StakingEvent {
  id: string;
  user: string;
  amount: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: string;
  blockTimestamp: string;
}

interface UnstakingEvent {
  id: string;
  user: string;
  amount: string;
  reward: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: string;
  blockTimestamp: string;
}

interface RewardClaimedEvent {
  id: string;
  user: string;
  amount: string;
  timestamp: string;
  transactionHash: string;
  blockNumber: string;
  blockTimestamp: string;
}

interface StakingHistoryProps {
  userAddress: string;
  envioApiUrl?: string;
}

export default function StakingHistory({ userAddress, envioApiUrl }: StakingHistoryProps) {
  const [stakingEvents, setStakingEvents] = useState<StakingEvent[]>([]);
  const [unstakingEvents, setUnstakingEvents] = useState<UnstakingEvent[]>([]);
  const [rewardEvents, setRewardEvents] = useState<RewardClaimedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Default Envio API URL (you can override this)
  const defaultApiUrl = envioApiUrl || process.env.NEXT_PUBLIC_ENVIO_API_URL || "https://api.envio.dev/v1/graphql";

  useEffect(() => {
    const fetchStakingHistory = async () => {
      if (!userAddress) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // GraphQL query for user staking history
        const query = `
          query UserStakingHistory($user: String!) {
            stakeds(where: { user: $user }, orderBy: timestamp, orderDirection: desc, first: 10) {
              id
              user
              amount
              timestamp
              transactionHash
              blockNumber
              blockTimestamp
            }
            
            unstakeds(where: { user: $user }, orderBy: timestamp, orderDirection: desc, first: 10) {
              id
              user
              amount
              reward
              timestamp
              transactionHash
              blockNumber
              blockTimestamp
            }
            
            rewardClaimeds(where: { user: $user }, orderBy: timestamp, orderDirection: desc, first: 10) {
              id
              user
              amount
              timestamp
              transactionHash
              blockNumber
              blockTimestamp
            }
          }
        `;

        const response = await fetch(defaultApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query,
            variables: { user: userAddress.toLowerCase() }
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.errors) {
          throw new Error(data.errors[0].message);
        }

        setStakingEvents(data.data.stakeds || []);
        setUnstakingEvents(data.data.unstakeds || []);
        setRewardEvents(data.data.rewardClaimeds || []);

      } catch (error: any) {
        console.error('Failed to fetch staking history:', error);
        setError(error.message || 'Failed to load staking history');
      } finally {
        setLoading(false);
      }
    };

    fetchStakingHistory();
  }, [userAddress, defaultApiUrl]);

  const formatDate = (timestamp: string) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const getExplorerUrl = (txHash: string) => {
    return `https://testnet.monadexplorer.com/tx/${txHash}`;
  };

  if (loading) {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(139, 92, 246, 0.2)',
            borderTop: '3px solid #8B5CF6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1.5rem auto'
          }}></div>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1.1rem',
            margin: 0
          }}>
            Loading staking history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: '#dc2626', 
            marginBottom: '0.5rem' 
          }}>
            Failed to Load History
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem',
            margin: 0
          }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  const allEvents = [
    ...stakingEvents.map(event => ({ ...event, type: 'stake' as const })),
    ...unstakingEvents.map(event => ({ ...event, type: 'unstake' as const })),
    ...rewardEvents.map(event => ({ ...event, type: 'claim' as const }))
  ].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  if (allEvents.length === 0) {
    return (
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2.5rem',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(139, 92, 246, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '0.5rem' 
          }}>
            No Staking History
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem',
            margin: 0
          }}>
            Start staking to see your transaction history here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.1)'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.75rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📈</span>
            Staking History
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem',
            margin: 0
          }}>
            Your recent staking transactions and rewards
          </p>
        </div>

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1rem' 
        }}>
          {allEvents.map((event, index) => (
            <div
              key={event.id}
              style={{
                padding: '1.5rem',
                background: event.type === 'stake' 
                  ? 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
                  : event.type === 'unstake'
                  ? 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)'
                  : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                borderRadius: '12px',
                border: event.type === 'stake' 
                  ? '1px solid #bae6fd'
                  : event.type === 'unstake'
                  ? '1px solid #fecaca'
                  : '1px solid #bbf7d0',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    marginBottom: '0.5rem'
                  }}>
                    <span style={{ fontSize: '1.25rem' }}>
                      {event.type === 'stake' ? '🔒' : event.type === 'unstake' ? '🔓' : '🎁'}
                    </span>
                    <span style={{ 
                      fontSize: '1.1rem', 
                      fontWeight: 'bold',
                      color: event.type === 'stake' 
                        ? '#0369a1'
                        : event.type === 'unstake'
                        ? '#dc2626'
                        : '#16a34a'
                    }}>
                      {event.type === 'stake' ? 'Staked' : event.type === 'unstake' ? 'Unstaked' : 'Reward Claimed'}
                    </span>
                  </div>
                  
                  <div style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 'bold',
                    color: event.type === 'stake' 
                      ? '#0369a1'
                      : event.type === 'unstake'
                      ? '#dc2626'
                      : '#16a34a',
                    marginBottom: '0.25rem'
                  }}>
                    {formatEther(BigInt(event.amount))} MON
                    {event.type === 'unstake' && 'reward' in event && (
                      <span style={{ fontSize: '1rem', opacity: 0.8 }}>
                        {' '}(+{formatEther(BigInt(event.reward))} reward)
                      </span>
                    )}
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: '#6b7280',
                    marginBottom: '0.5rem'
                  }}>
                    {formatDate(event.timestamp)}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <a
                    href={getExplorerUrl(event.transactionHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(139, 92, 246, 0.1)',
                      color: '#8B5CF6',
                      textDecoration: 'none',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                    }}
                  >
                    <span>🔗</span>
                    View on Explorer
                  </a>
                  
                  <div style={{ 
                    fontSize: '0.75rem', 
                    color: '#9ca3af',
                    fontFamily: 'monospace'
                  }}>
                    {event.transactionHash.slice(0, 10)}...{event.transactionHash.slice(-8)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
