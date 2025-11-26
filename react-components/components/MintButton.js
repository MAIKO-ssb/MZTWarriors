// react-components/components/MintButton.js
"use client";

import React, { useCallback, useState, useEffect, useMemo } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCandyMachine, fetchCandyMachine, safeFetchCandyGuard, mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { mplTokenMetadata, TokenStandard, fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { publicKey, transactionBuilder, generateSigner, some } from '@metaplex-foundation/umi';
import bs58 from 'bs58';

const CANDY_MACHINE_ID_STRING = '33eFiEDpjjAFxM22p5PVQC3jGPzYjCEEmUEojVWYgjsK';
const COLLECTION_MINT_ID_STRING = '3pCs14iq2azE7aWXuSmw7vgxia41pcHzm72RJX86zdc8';
const TREASURY_ADDRESS = 'FEYHjkQpvjkQuy8DuhwQNQBj9VtdThadkJBnB6T4iUGX';

export default function MintButton({ onMintStart, onMintSuccess, onMintError }) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [candyMachine, setCandyMachine] = useState(null);
  const [candyGuard, setCandyGuard] = useState(null);
  const [isMinting, setIsMinting] = useState(false);

  const umi = useMemo(() => {
    if (!connection || !wallet.publicKey) return null;
    return createUmi(connection)
      .use(walletAdapterIdentity(wallet))
      .use(mplCandyMachine())
      .use(mplTokenMetadata());
  }, [connection, wallet]);

  useEffect(() => {
    if (!umi) return;
    (async () => {
      try {
        const candyMachineAddress = publicKey(CANDY_MACHINE_ID_STRING);
        const cm = await fetchCandyMachine(umi, candyMachineAddress);
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
    if (!wallet.connected || !wallet.publicKey || !candyMachine || !candyGuard) {
      onMintError?.('Wallet not connected or data loading...');
      return;
    }

    setIsMinting(true);
    onMintStart?.();

    const nftMint = generateSigner(umi);

    // Auto-select group (free for owner)
    const isOwnerWallet = wallet.publicKey?.toBase58() === 'FEYHjkQpvjkQuy8DuhwQNQBj9VtdThadkJBnB6T4iUGX';
    const activeGroup = isOwnerWallet ? 'owner' : 'public';
    const useMintArgs = isOwnerWallet ? {} : { solPayment: some({ destination: publicKey(TREASURY_ADDRESS) }) };

    console.log(`Minting with group: ${activeGroup} (free for owner)`);

    try {
      const tx = transactionBuilder()
        .add(
          mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyGuard?.publicKey,
            nftMint,
            collectionMint: publicKey(COLLECTION_MINT_ID_STRING),
            collectionUpdateAuthority: candyMachine.authority,
            tokenStandard: TokenStandard.ProgrammableNonFungible,
            group: activeGroup ? some(activeGroup) : undefined,  // Only if group exists
            mintArgs: useMintArgs,
          })
        );

      const { signature } = await tx.sendAndConfirm(umi, {
        confirm: { commitment: 'finalized' },  // Old code's commitment
      });

      console.log(`Mint successful! Transaction: ${bs58.encode(signature)}`);

      // Fetch metadata (old code's exact method)
      try {
        const asset = await fetchDigitalAsset(umi, nftMint.publicKey);
        let metadataJsonUri = asset.metadata.uri.replace(/\0/g, '');
        if (metadataJsonUri.startsWith('ar://')) {
          metadataJsonUri = `https://arweave.net/${metadataJsonUri.substring(5)}`;
        }
        const metadataResponse = await fetch(metadataJsonUri);
        const metadataJson = await metadataResponse.json();
        onMintSuccess?.(nftMint.publicKey.toString(), metadataJson.image);
      } catch (metadataError) {
        console.error("Mint was successful, but failed to fetch metadata:", metadataError);
        onMintSuccess?.(nftMint.publicKey.toString(), null);
      }

    } catch (error) {
      console.error('Mint failed:', error);
      let userMessage = error.message;
      if (userMessage.includes('User rejected')) {
        userMessage = 'Transaction rejected in wallet.';
      }
      onMintError?.(userMessage || 'An unknown error occurred.');
    } finally {
      setIsMinting(false);
    }
  }, [wallet, umi, candyMachine, candyGuard, onMintStart, onMintSuccess, onMintError]);

  const itemsRemaining = candyMachine ? candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed : null;
  const totalItems = candyMachine ? candyMachine.data.itemsAvailable : null;
  const price = candyGuard && candyGuard.guards.solPayment?.__option === 'Some'
    ? (Number(candyGuard.guards.solPayment.value.lamports.basisPoints) / 1_000_000_000).toFixed(3)
    : 'N/A';

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <WalletMultiButton />
      {wallet.connected && wallet.publicKey ? (
        <>
          <p style={{ marginTop: '10px' }}>Connected: {wallet.publicKey.toBase58()}</p>
          {candyMachine ? (
            <>
              <p>Warriors Remaining: {itemsRemaining !== null ? itemsRemaining.toString() : 'Loading...'} / {totalItems !== null ? totalItems.toString() : 'Loading...'}</p>
              <p>Price: {price} SOL</p>
              <button
                onClick={mint}
                disabled={!wallet.connected || isMinting || !candyMachine || (itemsRemaining !== null && itemsRemaining <= 0n)}
                className="px-4 py-2 mt-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isMinting ? 'Minting...' : !candyMachine ? 'Loading...' : itemsRemaining !== null && itemsRemaining <= 0n ? 'Sold Out' : 'Mint a Random MZT Warrior'}
              </button>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </>
      ) : (
        <p style={{ marginTop: '10px' }}>Connect your Solana wallet to mint.</p>
      )}
    </div>
  );
}