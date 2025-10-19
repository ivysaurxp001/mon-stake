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
  const [success, setSuccess] = useState<string | null>(null);
  
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
      
      setSuccess(`✅ Staked ${amount} MON successfully! Tx: ${txHash.slice(0, 10)}...`);
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
      
      setSuccess(`✅ Unstaked ${formatEther(stakeInfo.stakedAmount)} MON! Tx: ${txHash.slice(0, 10)}...`);
      
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
      
      setSuccess(`✅ Claimed ${formatEther(stakeInfo.pendingRewards)} MON rewards! Tx: ${txHash.slice(0, 10)}...`);
      
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
    <div className="staking-container">
      {/* Alert Messages */}
      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c00'
        }}>
          ❌ {error}
        </div>
      )}
      
      {success && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#efe', 
          border: '1px solid #cfc',
          borderRadius: '8px',
          color: '#060'
        }}>
          {success}
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div className="card" style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>💰 Staked Amount</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {stakeInfo ? formatEther(stakeInfo.stakedAmount) : '0'} MON
            </div>
          </div>
        </div>
        
        <div className="card" style={{ background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)', boxShadow: '0 8px 24px rgba(167, 139, 250, 0.3)' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>🎁 Pending Rewards</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {stakeInfo ? formatEther(stakeInfo.pendingRewards) : '0'} MON
            </div>
          </div>
        </div>
        
        <div className="card" style={{ background: 'linear-gradient(135deg, #C4B5FD 0%, #A78BFA 100%)', boxShadow: '0 8px 24px rgba(196, 181, 253, 0.3)' }}>
          <div style={{ color: 'white' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>🔒 Status</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              {stakeInfo?.canUnstake ? '✅ Unlocked' : `🔒 Locked (${daysRemaining}d)`}
            </div>
          </div>
        </div>
      </div>
      
      {/* Stake Form */}
      <div className="card">
        <h3>🔒 Stake MON</h3>
        <p style={{ color: '#666', fontSize: '0.875rem', marginBottom: '1rem' }}>
          Stake your MON tokens to earn {STAKING_CONSTANTS.REWARD_RATE}% APY. Minimum stake: {formatEther(STAKING_CONSTANTS.MIN_STAKE)} MON
        </p>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
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
              padding: '0.75rem',
              fontSize: '1rem',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
          />
        </div>
        
        <button
          onClick={handleStake}
          disabled={loading || !amount || Number(amount) <= 0}
          style={{
            width: '100%',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: '600',
            color: 'white',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: (loading || !amount || Number(amount) <= 0) ? 0.5 : 1,
            transition: 'all 0.2s',
            boxShadow: (loading || !amount || Number(amount) <= 0) ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)',
          }}
        >
          {loading ? '⏳ Staking...' : '🔒 Stake MON'}
        </button>
      </div>
      
      {/* Manage Stake */}
      <div className="card">
        <h3>⚙️ Manage Stake</h3>
        
        {stakeInfo && stakeInfo.stakedAmount > 0n && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span>Lock expires:</span>
              <strong>{lockEndsDate?.toLocaleString()}</strong>
            </div>
            {!stakeInfo.canUnstake && (
              <div style={{ color: '#f5576c', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                ⏳ You must wait {daysRemaining} more day(s) to unstake
              </div>
            )}
          </div>
        )}
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button
            onClick={handleClaimRewards}
            disabled={loading || !stakeInfo || stakeInfo.pendingRewards === 0n}
            style={{
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !stakeInfo || stakeInfo.pendingRewards === 0n) ? 'not-allowed' : 'pointer',
              opacity: (loading || !stakeInfo || stakeInfo.pendingRewards === 0n) ? 0.5 : 1,
              transition: 'all 0.2s',
              boxShadow: (loading || !stakeInfo || stakeInfo.pendingRewards === 0n) ? 'none' : '0 4px 12px rgba(167, 139, 250, 0.3)',
            }}
          >
            {loading ? '⏳ Processing...' : '🎁 Claim Rewards'}
          </button>
          
          <button
            onClick={handleUnstake}
            disabled={loading || !stakeInfo?.canUnstake || stakeInfo?.stakedAmount === 0n}
            style={{
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: '600',
              color: 'white',
              backgroundColor: '#ff9800',
              border: 'none',
              borderRadius: '8px',
              cursor: (loading || !stakeInfo?.canUnstake || stakeInfo?.stakedAmount === 0n) ? 'not-allowed' : 'pointer',
              opacity: (loading || !stakeInfo?.canUnstake || stakeInfo?.stakedAmount === 0n) ? 0.5 : 1,
              transition: 'all 0.2s',
            }}
          >
            {loading ? '⏳ Processing...' : '🔓 Unstake All'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="card" style={{ backgroundColor: '#e3f2fd' }}>
        <h4 style={{ marginTop: 0 }}>ℹ️ Staking Info</h4>
        <ul style={{ marginLeft: '1.5rem', color: '#666' }}>
          <li>APY: <strong>{STAKING_CONSTANTS.REWARD_RATE}%</strong></li>
          <li>Lock period: <strong>7 days</strong></li>
          <li>Minimum stake: <strong>{formatEther(STAKING_CONSTANTS.MIN_STAKE)} MON</strong></li>
          <li>Rewards are calculated in real-time</li>
          <li>You can claim rewards anytime</li>
          <li>Unstaking requires lock period to expire</li>
        </ul>
      </div>
    </div>
  );
}

