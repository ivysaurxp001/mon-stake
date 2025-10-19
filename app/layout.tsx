import "./globals.css";
import HeaderNav from "@/components/HeaderNav";
import { MetaMaskProvider } from "@/components/MetaMaskProvider";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/deploy", label: "Deploy" },
  { href: "/stake", label: "Stake" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>MON Staking Platform - Earn 10% APY on Monad Testnet</title>
        <meta name="description" content="Stake MON tokens and earn 10% APY on Monad Testnet. Simple, secure, and automated staking platform." />
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f7fafc', minHeight: '100vh' }}>
        <MetaMaskProvider>
          <HeaderNav links={NAV_LINKS} />
          <main>{children}</main>
          <footer style={{
            marginTop: '4rem',
            padding: '2rem',
            backgroundColor: '#2d3748',
            color: 'white',
            textAlign: 'center',
          }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' }}>
                <strong>MON Staking Platform</strong> on Monad Testnet
              </p>
              <p style={{ margin: 0, fontSize: '0.875rem', opacity: '0.8' }}>
                Powered by <strong>Viem</strong> • <strong>Next.js</strong> • <strong>Monad</strong>
              </p>
              <p style={{ marginTop: '1rem', fontSize: '0.75rem', opacity: '0.6' }}>
                Contract: 0x91e33a594da3e8e2ad3af5195611cf8cabe75353
              </p>
            </div>
          </footer>
        </MetaMaskProvider>
      </body>
    </html>
  );
}
