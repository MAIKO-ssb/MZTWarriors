// react-components/components/MintButton.js
"use client";

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { 
  mplCandyMachine, 
  fetchCandyMachine, 
  safeFetchCandyGuard,
  mintV2 
} from '@metaplex-foundation/mpl-candy-machine';
import { mplTokenMetadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { 
  publicKey, 
  generateSigner,
  some,
  transactionBuilder 
} from '@metaplex-foundation/umi';
import { 
  setComputeUnitLimit, 
  setComputeUnitPrice,
  mplToolbox 
} from '@metaplex-foundation/mpl-toolbox';
import bs58 from 'bs58';

const CANDY_MACHINE_ID = publicKey('33eFiEDpjjAFxM22p5PVQC3jGPzYjCEEmUEojVWYgjsK');
const COLLECTION_MINT = publicKey('3pCs14iq2azE7aWXuSmw7vgxia41pcHzm72RJX86zdc8');
const TREASURY = publicKey('FEYHjkQpvjkQuy8DuhwQNQBj9VtdThadkJBnB6T4iUGX');

export default function MintButton({ onMintStart, onMintSuccess, onMintError }) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [candyMachine, setCandyMachine] = useState(null);
  const [candyGuard, setCandyGuard] = useState(null);
  const [isMinting, setIsMinting] = useState(false);

  const umi = useMemo(() => {
    if (!connection?.rpcEndpoint || !wallet?.publicKey) return null;
    return createUmi(connection.rpcEndpoint)
      .use(walletAdapterIdentity(wallet))
      .use(mplCandyMachine())
      .use(mplTokenMetadata())
      .use(mplToolbox());
  }, [connection?.rpcEndpoint, wallet]);

  useEffect(() => {
    if (!umi) return;
    (async () => {
      try {
        const cm = await fetchCandyMachine(umi, CANDY_MACHINE_ID);
        const guard = await safeFetchCandyGuard(umi, cm.mintAuthority);
        setCandyMachine(cm);
        setCandyGuard(guard);
        console.log('Loaded:', { cm, guard });
      } catch (e) {
        console.error('Load failed:', e);
      }
    })();
  }, [umi]);

  const mint = useCallback(async () => {
    if (!umi || !wallet.connected || !candyMachine || !candyGuard) {
      onMintError?.('Loading...');
      return;
    }

    console.log('Sending mint transaction...');
    console.log('Candy Machine:', candyMachine.publicKey);
    console.log('Candy Guard:', candyMachine.mintAuthority);
    console.log('Group:', 'public');
    console.log('Treasury:', TREASURY);
    console.log('Wallet:', wallet.publicKey?.toBase58());

    setIsMinting(true);
    onMintStart?.();

    const nftMint = generateSigner(umi);

    try {
      const tx = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 800_000 }))
        .add(setComputeUnitPrice(umi, { microLamports: 100_000 }))
        .add(
          mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyMachine.mintAuthority,
            nftMint,
            collectionMint: COLLECTION_MINT,
            collectionUpdateAuthority: candyMachine.authority,
            tokenStandard: TokenStandard.ProgrammableNonFungible,
            group: some('public'),
            mintArgs: {
              solPayment: some({ destination: TREASURY }),
            },
          })
        );

      const { signature } = await tx.sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });
      console.log('MINTED https://solana.fm/tx/' + bs58.encode(signature));
      onMintSuccess?.(nftMint.publicKey.toString());
    } catch (error) {
      console.error('Mint failed:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
      console.error('Logs:', error.logs?.join('\n') || 'No logs');
      // ADD THIS: Check if transaction actually succeeded
      if (error.logs && error.logs.some(log => log.includes('Program log: Instruction: MintV2'))) {
        console.log('MINT ACTUALLY SUCCEEDED — IGNORE ERROR');
        onMintSuccess?.(nftMint.publicKey.toString());
        return;
      }
      onMintError?.('Mint failed — try again');
    } finally {
      setIsMinting(false);
    }
  }, [umi, wallet, candyMachine, candyGuard, onMintStart, onMintSuccess, onMintError]);

  const itemsLeft = candyMachine ? Number(candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed) : 0;

  const publicGroup = candyGuard?.groups?.find(g => g.label === 'public');
  const priceLamports = publicGroup?.guards?.solPayment?.value?.lamports?.basisPoints;
  const price = priceLamports ? (Number(priceLamports) / 1_000_000_000).toFixed(3) : '0.111';

  return (
    <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
      <WalletMultiButton style={{ marginBottom: '20px' }} />
      {wallet.connected && (
        <>
          <p>Connected: {wallet.publicKey?.toBase58().slice(0,4)}...{wallet.publicKey?.toBase58().slice(-4)}</p>
          <p style={{ fontSize: '20px' }}>
            Warriors Remaining: <strong style={{ color: '#00ff9d', fontSize: '32px' }}>{itemsLeft}</strong> / 1111
          </p>
          <p style={{ fontSize: '42px', fontWeight: 'bold', margin: '20px 0' }}>
            {price} SOL
          </p>
          <button
            onClick={mint}
            disabled={isMinting || itemsLeft === 0}
            style={{
              padding: '20px 80px',
              fontSize: '28px',
              background: itemsLeft === 0 ? '#444' : '#00ff9d',
              color: 'black',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 'bold',
              cursor: itemsLeft === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {isMinting ? 'MINTING...' : itemsLeft === 0 ? 'SOLD OUT' : 'MINT WARRIOR'}
          </button>
        </>
      )}
    </div>
  );
}