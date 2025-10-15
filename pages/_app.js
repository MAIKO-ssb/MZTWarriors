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
// const endpoint = "https://mainnet.helius-rpc.com/?api-key=b51522ca-f265-4967-829a-fb829f1878a4"; 
const endpoint = "https://yolo-summer-firefly.solana-mainnet.quiknode.pro/9a4eba8499a88b47c2eede675014d479977a9704/"; 
// const endpoint = clusterApiUrl(network);


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
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Component {...pageProps} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default MyApp;
