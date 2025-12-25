// /pages/_app.js
import '../styles/globals.css';
import '../sass/site.scss';
import { useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';
import { 
  PhantomWalletAdapter, 
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
  FractalWalletAdapter,
  NightlyWalletAdapter,
  SafePalWalletAdapter,
  SolongWalletAdapter,
  TokenPocketWalletAdapter,
  TrustWalletAdapter,
  MathWalletAdapter 
} from '@solana/wallet-adapter-wallets';

// const network = WalletAdapterNetwork.Devnet;
const network = WalletAdapterNetwork.MainnetBeta;
const endpoint = "https://mainnet.helius-rpc.com/?api-key=27ebc857-458c-4b9d-9c57-f004a9f02c50"; 
// const endpoint = "https://powerful-sly-forest.solana-mainnet.quiknode.pro/ceffec3dc86a9b23f99b2d97493c7ce70244b990/"; EXPIRED
// const endpoint = clusterApiUrl(network);
const connectionConfig = { commitment: 'confirmed' };

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter({ network }),
  new TorusWalletAdapter(),
  new LedgerWalletAdapter(),
  new CoinbaseWalletAdapter(),
  new FractalWalletAdapter(),
  new NightlyWalletAdapter(),
  new SafePalWalletAdapter(),
  new SolongWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new TrustWalletAdapter(),
  new MathWalletAdapter()
];

function MyApp({ Component, pageProps }) {
  return (
    <ConnectionProvider endpoint={endpoint} config={connectionConfig}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
