'use client';

import Link from 'next/link';
import { useMetaMask } from '@/components/MetaMaskProvider';

export default function Home() {
  const { account } = useMetaMask();

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
        borderRadius: '24px',
        padding: '4rem 3rem',
        color: 'white',
        marginBottom: '3rem',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
      }}>
        <div style={{ 
          display: 'inline-block',
          backgroundColor: 'rgba(255,255,255,0.2)',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          fontSize: '0.875rem',
          marginBottom: '1.5rem',
        }}>
          ⚡ Monad Testnet • 10% APY • 7-Day Lock
        </div>
        
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: '800',
          margin: '0 0 1.5rem 0',
          lineHeight: '1.2',
        }}>
          Stake MON,<br />Earn Rewards
        </h1>
        
        <p style={{
          fontSize: '1.25rem',
          opacity: '0.95',
          maxWidth: '700px',
          margin: '0 auto 2rem',
          lineHeight: '1.6',
        }}>
          Simple, secure, and automated staking on Monad testnet. 
          Lock your MON tokens and earn 10% annual rewards.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}>
          <Link 
            href="/stake"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              backgroundColor: 'white',
              color: '#8B5CF6',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '1.125rem',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s',
            }}
          >
            Start Staking →
          </Link>
          
          <Link 
            href="/dashboard"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '1.125rem',
              fontWeight: '600',
            }}
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginBottom: '3rem',
      }}>
        {[
          { icon: '💰', label: 'APY', value: '10%', color: '#8B5CF6' },
          { icon: '⏰', label: 'Lock Period', value: '7 Days', color: '#A78BFA' },
          { icon: '✨', label: 'Min Stake', value: '0.1 MON', color: '#7C3AED' },
          { icon: '🎁', label: 'Rewards', value: 'Real-time', color: '#C4B5FD' },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: '2rem',
            background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
            borderRadius: '16px',
            color: 'white',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{stat.value}</div>
            <div style={{ fontSize: '1rem', opacity: '0.9' }}>{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '3rem',
          color: '#2d3748',
        }}>
          How It Works
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem',
        }}>
          {[
            {
              step: '1',
              title: 'Connect Wallet',
              description: 'Connect your MetaMask wallet to get started. Make sure you\'re on Monad Testnet.',
              icon: '🦊',
            },
            {
              step: '2',
              title: 'Stake MON',
              description: 'Choose how much MON to stake. Minimum is 0.1 MON. Your tokens will be locked for 7 days.',
              icon: '🔒',
            },
            {
              step: '3',
              title: 'Earn Rewards',
              description: 'Start earning 10% APY immediately. Rewards are calculated in real-time every second.',
              icon: '💎',
            },
            {
              step: '4',
              title: 'Claim & Unstake',
              description: 'Claim your rewards anytime. After 7 days, unstake your MON plus all accumulated rewards.',
              icon: '🎉',
            },
          ].map((feature) => (
            <div key={feature.step} style={{
              padding: '2rem',
              backgroundColor: 'white',
              borderRadius: '16px',
              border: '2px solid #e2e8f0',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                }}>
                  {feature.step}
                </div>
                <div style={{ fontSize: '2.5rem' }}>{feature.icon}</div>
              </div>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                marginBottom: '0.75rem',
                color: '#2d3748',
              }}>
                {feature.title}
              </h3>
              <p style={{
                fontSize: '1rem',
                lineHeight: '1.6',
                color: '#718096',
                margin: 0,
              }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {!account && (
        <section style={{
          padding: '3rem',
          background: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)',
          borderRadius: '24px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.25)',
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '1rem',
          }}>
            Ready to Start Earning?
          </h2>
          <p style={{
            fontSize: '1.125rem',
            opacity: '0.95',
            marginBottom: '2rem',
          }}>
            Connect your wallet and start staking MON in minutes
          </p>
          <Link 
            href="/stake"
            style={{
              display: 'inline-block',
              padding: '1rem 2.5rem',
              backgroundColor: 'white',
              color: '#8B5CF6',
              borderRadius: '12px',
              textDecoration: 'none',
              fontSize: '1.125rem',
              fontWeight: '700',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            }}
          >
            Get Started Now →
          </Link>
        </section>
      )}

      {/* Info Section */}
      <section style={{
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: '#f7fafc',
        borderRadius: '16px',
        border: '2px solid #e2e8f0',
      }}>
        <h3 style={{ marginTop: 0, color: '#2d3748' }}>ℹ️ Important Information</h3>
        <ul style={{ lineHeight: '1.8', color: '#4a5568' }}>
          <li><strong>Staking Contract:</strong> Deployed and verified on Monad Testnet</li>
          <li><strong>Lock Period:</strong> 7 days from your last stake</li>
          <li><strong>Rewards:</strong> 10% APY calculated every second</li>
          <li><strong>Minimum Stake:</strong> 0.1 MON required</li>
          <li><strong>Security:</strong> Audited smart contract with time-lock mechanism</li>
          <li><strong>Network:</strong> Monad Testnet (Chain ID: 10143)</li>
        </ul>
      </section>
    </div>
  );
}
