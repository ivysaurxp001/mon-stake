import StakingForm from '@/components/StakingForm';

export default function StakePage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
          🔒 Stake MON
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#666' }}>
          Stake your MON tokens to earn 10% APY rewards. Safe, secure, and automated.
        </p>
      </div>
      
      <StakingForm />
    </div>
  );
}



