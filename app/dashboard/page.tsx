"use client";

import { useState, useEffect } from "react";
import { useMetaMask } from "@/components/MetaMaskProvider";
import { getStakeInfo, type StakeInfo, formatStakeInfo } from "@/lib/staking";
import { formatEther } from "viem";
import StakingHistory from "@/components/StakingHistory";

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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        padding: '2rem 0'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          borderRadius: '20px',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.3)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>📊</span>
        </div>
        <h1 style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          margin: '0 0 1rem 0',
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Staking Dashboard
        </h1>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#6b7280', 
          margin: 0,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto',
          lineHeight: '1.6'
        }}>
          Monitor your MON staking activity and rewards in real-time
        </p>
      </div>

      {!account ? (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🔒</div>
            <h3 style={{ 
              fontSize: '1.75rem', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '1rem' 
            }}>
              Connect Your Wallet
            </h3>
            <p style={{ 
              color: '#6b7280', 
              fontSize: '1.1rem',
              margin: 0,
              maxWidth: '400px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Please connect your MetaMask wallet to view your staking dashboard
            </p>
          </div>
        </div>
      ) : loading ? (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
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
              Loading staking data...
            </p>
          </div>
        </div>
      ) : (
        <>
      {/* Stats Cards */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{ 
                background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', 
                color: 'white', 
                boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
                borderRadius: '20px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(139, 92, 246, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(139, 92, 246, 0.4)';
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-50%', 
                  right: '-50%', 
                  width: '100%', 
                  height: '100%', 
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💰</div>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                    fontWeight: 'bold', 
                    lineHeight: 1,
                    marginBottom: '0.5rem'
                  }}>
                    {stakeInfo ? formatEther(stakeInfo.stakedAmount) : '0'}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: '500' }}>
                    Total Staked (MON)
              </div>
            </div>
          </div>
          
              <div style={{ 
                background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', 
                color: 'white', 
                boxShadow: '0 10px 30px rgba(167, 139, 250, 0.4)',
                borderRadius: '20px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(167, 139, 250, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(167, 139, 250, 0.4)';
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-50%', 
                  right: '-50%', 
                  width: '100%', 
                  height: '100%', 
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎁</div>
                  <div style={{ 
                    fontSize: 'clamp(1.2rem, 3.5vw, 2rem)', 
                    fontWeight: 'bold', 
                    lineHeight: 1.1,
                    marginBottom: '0.5rem',
                    wordBreak: 'break-all',
                    overflowWrap: 'break-word'
                  }}>
                    {stakeInfo ? formatEther(stakeInfo.pendingRewards) : '0'}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: '500' }}>
                    Pending Rewards (MON)
              </div>
            </div>
          </div>
          
              <div style={{ 
                background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)', 
                color: 'white', 
                boxShadow: '0 10px 30px rgba(196, 181, 253, 0.4)',
                borderRadius: '20px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(196, 181, 253, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(196, 181, 253, 0.4)';
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-50%', 
                  right: '-50%', 
                  width: '100%', 
                  height: '100%', 
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📈</div>
                  <div style={{ 
                    fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', 
                    fontWeight: 'bold', 
                    lineHeight: 1,
                    marginBottom: '0.5rem'
                  }}>
                    10%
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: '500' }}>
                    Annual APY
              </div>
            </div>
          </div>
          
              <div style={{ 
                background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)', 
                color: '#5B21B6', 
                boxShadow: '0 10px 30px rgba(221, 214, 254, 0.4)',
                borderRadius: '20px',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'default'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(221, 214, 254, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(221, 214, 254, 0.4)';
              }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '-50%', 
                  right: '-50%', 
                  width: '100%', 
                  height: '100%', 
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                    {stakeInfo?.canUnstake ? '✅' : '🔒'}
                  </div>
                  <div style={{ 
                    fontSize: 'clamp(1.2rem, 3.5vw, 2rem)', 
                    fontWeight: 'bold', 
                    lineHeight: 1,
                    marginBottom: '0.5rem'
                  }}>
                    {stakeInfo?.canUnstake ? 'Unlocked' : `${daysRemaining}d`}
                  </div>
                  <div style={{ fontSize: '1rem', opacity: 0.9, fontWeight: '500' }}>
                    Lock Status
              </div>
            </div>
          </div>
        </div>
      </div>

          {/* Staking History from Envio */}
          {userAddress && <StakingHistory userAddress={userAddress} />}
        </>
      )}
    </div>
  );
}
