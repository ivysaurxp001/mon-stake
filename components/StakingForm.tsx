'use client';

import { useState, useEffect } from 'react';
import { useMetaMask } from './MetaMaskProvider';
import { stake, unstake, claimRewards, getStakeInfo, formatStakeInfo, STAKING_CONSTANTS, type StakeInfo } from '@/lib/staking';
import { formatEther, parseEther } from 'viem';

export default function StakingForm() {
  const { smartAccount, account, ensureConnected } = useMetaMask();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [stakeInfo, setStakeInfo] = useState<StakeInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<React.ReactNode | null>(null);
  
  // Load stake info when smart account is available
  useEffect(() => {
    console.log('🔄 useEffect triggered, smartAccount:', smartAccount);
    
    if (smartAccount?.address) {
      console.log('✅ Smart account available, loading stake info...');
      loadStakeInfo();
      
      // Auto-refresh every 10 seconds
      const interval = setInterval(() => {
        console.log('⏰ Auto-refreshing stake info...');
        loadStakeInfo();
      }, 10000);
      return () => clearInterval(interval);
    } else {
      console.log('❌ No smart account available');
    }
  }, [smartAccount]);
  
  async function loadStakeInfo() {
    if (!smartAccount?.address) {
      console.log('❌ No smart account address');
      return;
    }
    
    console.log('🔄 Loading stake info for:', smartAccount.address);
    
    try {
      const info = await getStakeInfo(smartAccount.address);
      console.log('📊 Received stake info:', info);
      setStakeInfo(info);
    } catch (error) {
      console.error('❌ Failed to load stake info:', error);
    }
  }
  
  async function handleStake() {
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    const amountWei = parseEther(amount);
    
    // Check minimum stake
    if (amountWei < STAKING_CONSTANTS.MIN_STAKE) {
      setError(`Minimum stake is ${formatEther(STAKING_CONSTANTS.MIN_STAKE)} MON`);
      return;
    }
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      // Ensure connected
      await ensureConnected();
      
      if (!smartAccount) {
        throw new Error('Smart account not available');
      }

      // Stake
      const txHash = await stake(smartAccount, amountWei);
      
      setSuccess(
        <span>
          ✅ Staked {amount} MON successfully! Tx:{' '}
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', fontFamily: 'monospace' }}
          >
            {txHash}
          </a>
        </span>
      );
      setAmount('');
      
      // Wait a bit for blockchain to update
      setTimeout(loadStakeInfo, 3000);
    } catch (error: any) {
      console.error('Stake failed:', error);
      setError(error?.message || 'Stake failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleUnstake() {
    if (!stakeInfo || stakeInfo.stakedAmount === 0n) {
      setError('No stake to unstake');
      return;
    }

    if (!stakeInfo.canUnstake) {
      setError('Still in lock period. Please wait until lock expires.');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      await ensureConnected();
      
      if (!smartAccount) {
        throw new Error('Smart account not available');
      }

      const txHash = await unstake(smartAccount, stakeInfo.stakedAmount);
      
      setSuccess(
        <span>
          ✅ Unstaked {formatEther(stakeInfo.stakedAmount)} MON! Tx:{' '}
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', fontFamily: 'monospace' }}
          >
            {txHash}
          </a>
        </span>
      );
      
      setTimeout(loadStakeInfo, 3000);
    } catch (error: any) {
      console.error('Unstake failed:', error);
      setError(error?.message || 'Unstake failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleClaimRewards() {
    if (!stakeInfo || stakeInfo.pendingRewards === 0n) {
      setError('No rewards to claim');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      await ensureConnected();
      
      if (!smartAccount) {
        throw new Error('Smart account not available');
      }

      const txHash = await claimRewards(smartAccount);
      
      setSuccess(
        <span>
          ✅ Claimed {formatEther(stakeInfo.pendingRewards)} MON rewards! Tx:{' '}
          <a
            href={`https://testnet.monadexplorer.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#2563eb', textDecoration: 'underline', fontFamily: 'monospace' }}
          >
            {txHash}
          </a>
        </span>
      );
      
      setTimeout(loadStakeInfo, 3000);
    } catch (error: any) {
      console.error('Claim failed:', error);
      setError(error?.message || 'Claim failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  if (!account) {
    return (
      <div className="card">
        <h3>🔒 Staking</h3>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Please connect your MetaMask wallet to start staking
        </p>
      </div>
    );
  }
  
  const lockEndsDate = stakeInfo ? new Date(Number(stakeInfo.lockEndsAt) * 1000) : null;
  const timeRemaining = lockEndsDate ? lockEndsDate.getTime() - Date.now() : 0;
  const daysRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60 * 24));
  
  return (
    <div className="staking-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
      {/* Alert Messages */}
      {error && (
        <div style={{ 
          padding: '1.25rem', 
          marginBottom: '2rem', 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fecaca',
          borderRadius: '12px',
          color: '#dc2626',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>❌</span>
            <span style={{ fontWeight: '500' }}>{error}</span>
          </div>
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: '1.25rem', 
          marginBottom: '2rem', 
          backgroundColor: '#f0fdf4', 
          border: '1px solid #bbf7d0',
          borderRadius: '12px',
          color: '#166534',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.25rem' }}>✅</span>
            <span style={{ fontWeight: '500' }}>{success}</span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem'
      }}>
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', 
          boxShadow: '0 10px 30px rgba(139, 92, 246, 0.4)',
          borderRadius: '16px',
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
          <div style={{ color: 'white', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.75rem', fontWeight: '500' }}>💰 Staked Amount</div>
            <div style={{ 
              fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', 
              fontWeight: 'bold', 
              lineHeight: 1.1,
              wordBreak: 'break-all',
              overflowWrap: 'break-word',
              maxWidth: '100%'
            }}>
              {stakeInfo ? formatEther(stakeInfo.stakedAmount) : '0'}
            </div>
            <div style={{ 
              fontSize: 'clamp(1rem, 3vw, 1.5rem)', 
              fontWeight: '600', 
              marginTop: '0.25rem',
              opacity: 0.9
            }}>
              MON
            </div>
          </div>
        </div>
        
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', 
          boxShadow: '0 10px 30px rgba(167, 139, 250, 0.4)',
          borderRadius: '16px',
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
          <div style={{ color: 'white', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.75rem', fontWeight: '500' }}>🎁 Pending Rewards</div>
            <div style={{ 
              fontSize: 'clamp(1.2rem, 4vw, 2.2rem)', 
              fontWeight: 'bold', 
              lineHeight: 1.1,
              wordBreak: 'break-all',
              overflowWrap: 'break-word',
              maxWidth: '100%'
            }}>
              {stakeInfo ? formatEther(stakeInfo.pendingRewards) : '0'}
            </div>
            <div style={{ 
              fontSize: 'clamp(1rem, 3vw, 1.5rem)', 
              fontWeight: '600', 
              marginTop: '0.25rem',
              opacity: 0.9
            }}>
              MON
            </div>
          </div>
        </div>
        
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)', 
          boxShadow: '0 10px 30px rgba(196, 181, 253, 0.4)',
          borderRadius: '16px',
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
          <div style={{ color: 'white', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.75rem', fontWeight: '500' }}>🔒 Status</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 'bold', lineHeight: 1 }}>
              {stakeInfo?.canUnstake ? '✅ Unlocked' : `🔒 Locked (${daysRemaining}d)`}
            </div>
            {!stakeInfo?.canUnstake && stakeInfo && (
              <div style={{ fontSize: '0.75rem', opacity: 0.8, marginTop: '0.5rem' }}>
                Unlocks: {lockEndsDate?.toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Stake Form */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.1)',
        marginBottom: '2rem'
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
            <span style={{ fontSize: '1.5rem' }}>🔒</span>
            Stake MON
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem', 
            lineHeight: '1.5',
            margin: 0
          }}>
            Stake your MON tokens to earn <strong style={{ color: '#8B5CF6' }}>{STAKING_CONSTANTS.REWARD_RATE}% APY</strong>. 
            Minimum stake: <strong>{formatEther(STAKING_CONSTANTS.MIN_STAKE)} MON</strong>
          </p>
        </div>
        
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.75rem', 
            fontWeight: '600',
            color: '#374151',
            fontSize: '1rem'
          }}>
            Amount (MON)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to stake"
            min="0.1"
            step="0.1"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem 1.25rem',
              fontSize: '1.125rem',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.3s ease',
              backgroundColor: loading ? '#f9fafb' : 'white',
              color: loading ? '#9ca3af' : '#1f2937',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#8B5CF6';
              e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
          />
        </div>
        
        <button
          onClick={handleStake}
          disabled={loading || !amount || Number(amount) <= 0}
          style={{
            width: '100%',
            padding: '1.25rem',
            fontSize: '1.125rem',
            fontWeight: '700',
            color: 'white',
            background: loading || !amount || Number(amount) <= 0 
              ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
              : 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            border: 'none',
            borderRadius: '12px',
            cursor: loading || !amount || Number(amount) <= 0 ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: loading || !amount || Number(amount) <= 0 
              ? 'none' 
              : '0 8px 25px rgba(139, 92, 246, 0.4)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            if (!loading && amount && Number(amount) > 0) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 35px rgba(139, 92, 246, 0.5)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && amount && Number(amount) > 0) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
            }
          }}
        >
          <span style={{ position: 'relative', zIndex: 1 }}>
            {loading ? '⏳ Staking...' : '🔒 Stake MON'}
          </span>
          {!loading && amount && Number(amount) > 0 && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'left 0.5s ease'
            }}></div>
          )}
        </button>
      </div>
      
      {/* Manage Stake */}
      <div className="card" style={{
        background: 'white',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.1)',
        marginBottom: '2rem'
      }}>
        <h3 style={{ 
          fontSize: '1.75rem', 
          fontWeight: 'bold', 
          color: '#1f2937', 
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.5rem' }}>⚙️</span>
          Manage Stake
        </h3>
        
        {stakeInfo && stakeInfo.stakedAmount > 0n && (
          <div style={{ 
            padding: '1.5rem', 
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <span style={{ fontWeight: '600', color: '#475569' }}>Lock expires:</span>
              <strong style={{ color: '#1e293b', fontSize: '1.1rem' }}>{lockEndsDate?.toLocaleString()}</strong>
            </div>
            {!stakeInfo.canUnstake && (
              <div style={{ 
                color: '#dc2626', 
                fontSize: '0.95rem', 
                padding: '0.75rem',
                background: '#fef2f2',
                borderRadius: '8px',
                border: '1px solid #fecaca',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span>⏳</span>
                <span>You must wait <strong>{daysRemaining} more day(s)</strong> to unstake</span>
              </div>
            )}
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <button
            onClick={handleClaimRewards}
            disabled={loading || !stakeInfo || stakeInfo.pendingRewards === 0n}
            style={{
              padding: '1.25rem',
              fontSize: '1.125rem',
              fontWeight: '700',
              color: 'white',
              background: loading || !stakeInfo || stakeInfo.pendingRewards === 0n
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                : 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: (loading || !stakeInfo || stakeInfo.pendingRewards === 0n) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: (loading || !stakeInfo || stakeInfo.pendingRewards === 0n) 
                ? 'none' 
                : '0 8px 25px rgba(167, 139, 250, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading && stakeInfo && stakeInfo.pendingRewards > 0n) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(167, 139, 250, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && stakeInfo && stakeInfo.pendingRewards > 0n) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(167, 139, 250, 0.4)';
              }
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? '⏳ Processing...' : '🎁 Claim Rewards'}
            </span>
          </button>
          
          <button
            onClick={handleUnstake}
            disabled={loading || !stakeInfo?.canUnstake || stakeInfo?.stakedAmount === 0n}
            style={{
              padding: '1.25rem',
              fontSize: '1.125rem',
              fontWeight: '700',
              color: 'white',
              background: loading || !stakeInfo?.canUnstake || stakeInfo?.stakedAmount === 0n
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              border: 'none',
              borderRadius: '12px',
              cursor: (loading || !stakeInfo?.canUnstake || stakeInfo?.stakedAmount === 0n) ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: (loading || !stakeInfo?.canUnstake || stakeInfo?.stakedAmount === 0n)
                ? 'none'
                : '0 8px 25px rgba(245, 158, 11, 0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!loading && stakeInfo?.canUnstake && stakeInfo?.stakedAmount > 0n) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 35px rgba(245, 158, 11, 0.5)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && stakeInfo?.canUnstake && stakeInfo?.stakedAmount > 0n) {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(245, 158, 11, 0.4)';
              }
            }}
          >
            <span style={{ position: 'relative', zIndex: 1 }}>
              {loading ? '⏳ Processing...' : '🔓 Unstake All'}
            </span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card" style={{ 
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        borderRadius: '20px',
        padding: '2.5rem',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)'
      }}>
        <h4 style={{ 
          marginTop: 0, 
          marginBottom: '1.5rem',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: '#1e40af',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
          Staking Info
        </h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1rem' 
        }}>
          <div style={{ 
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>APY</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
              {STAKING_CONSTANTS.REWARD_RATE}%
            </div>
          </div>
          <div style={{ 
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>Lock Period</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>7 days</div>
          </div>
          <div style={{ 
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '12px',
            border: '1px solid rgba(59, 130, 246, 0.1)'
          }}>
            <div style={{ fontWeight: '600', color: '#1e40af', marginBottom: '0.5rem' }}>Minimum Stake</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b' }}>
              {formatEther(STAKING_CONSTANTS.MIN_STAKE)} MON
            </div>
          </div>
        </div>
        <div style={{ 
          marginTop: '1.5rem',
          padding: '1.25rem',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          border: '1px solid rgba(59, 130, 246, 0.1)'
        }}>
          <ul style={{ 
            margin: 0, 
            paddingLeft: '1.5rem', 
            color: '#374151',
            lineHeight: '1.6'
          }}>
            <li style={{ marginBottom: '0.5rem' }}>✅ Rewards are calculated in real-time</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ You can claim rewards anytime</li>
            <li style={{ marginBottom: '0.5rem' }}>✅ Unstaking requires lock period to expire</li>
            <li>✅ Smart Account powered by ERC-4337</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

