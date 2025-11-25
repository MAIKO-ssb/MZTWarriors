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

  // Create umi directly — no context hell
  const umi = useMemo(() => {
    if (!connection.rpcEndpoint || !wallet.publicKey) return null;
    return createUmi(connection.rpcEndpoint)
      .use(walletAdapterIdentity(wallet))
      .use(mplCandyMachine())
      .use(mplTokenMetadata())
      .use(mplToolbox()); // Required for compute units
  }, [connection.rpcEndpoint, wallet]);

  // Load candy machine
  useEffect(() => {
    if (!umi) return;
    
    (async () => {
      try {
        const cm = await fetchCandyMachine(umi, CANDY_MACHINE_ID);
        const guard = await safeFetchCandyGuard(umi, cm.mintAuthority); // ← THIS LINE
        setCandyMachine(cm);
        setCandyGuard(guard); // ← now guard.groups exists!
        console.log('Guard loaded:', guard); // ← you will see groups here
      } catch (e) {
        console.error('Failed to load CM:', e);
      }
    })();

  }, [umi]);

  const mint = useCallback(async () => {
    if (!umi || !wallet.connected || !candyMachine) {
      onMintError?.('Not ready yet...');
      return;
    }

    setIsMinting(true);
    onMintStart?.();

    const nftMint = generateSigner(umi);

    try {
      // FIX 2: Use transactionBuilder + .add() → this includes ALL required accounts
      const tx = transactionBuilder()
        .add(setComputeUnitLimit(umi, { units: 600_000 }))           // Critical for pNFTs
        .add(setComputeUnitPrice(umi, { microLamports: 100_000 }))   // Priority fee
        .add(
          mintV2(umi, {
            candyMachine: candyMachine.publicKey,
            candyGuard: candyMachine.mintAuthority, // Guard PDA
            nftMint,
            collectionMint: COLLECTION_MINT,
            collectionUpdateAuthority: candyMachine.authority,
            tokenStandard: TokenStandard.ProgrammableNonFungible,
          })
        );

      const { signature } = await tx.sendAndConfirm(umi, {
        confirm: { commitment: 'confirmed' },
      });

      console.log('MINTED https://solana.fm/tx/' + bs58.encode(signature));
      onMintSuccess?.(nftMint.publicKey.toString());

    } catch (error) {
      console.error('Mint failed:', error);
      console.error('Logs:', error.logs?.join('\n') || 'No logs');
      const msg = error.logs?.join(' ') || error.message || 'Unknown error';
      onMintError?.(
        msg.includes('User rejected') || msg.includes('rejected')
          ? 'You rejected the transaction'
          : 'Mint failed — try again'
      );
    } finally {
      setIsMinting(false);
    }
  }, [umi, wallet, candyMachine, onMintStart, onMintSuccess, onMintError]);

  const itemsLeft = candyMachine ? Number(candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed) : 0;
  // Dynamic price from the "public" guard group
  const publicGroup = candyGuard?.groups?.find(g => g.label === 'public');
  const priceLamports = publicGroup?.guards?.solPayment?.value?.lamports.basisPoints; 
  const price = priceLamports
    ? (Number(priceLamports) / 1_000_000_000).toFixed(3)
    : '...';

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <WalletMultiButton />
      {wallet.connected && (
        <>
          <p>Connected: {wallet.publicKey?.toBase58().slice(0,4)}...{wallet.publicKey?.toBase58().slice(-4)}</p>
          <p style={{ fontSize: '20px', margin: '20px 0' }}>
            Warriors Remaining: <br/><strong style={{ color: '#00ff9d', fontSize: '28px' }}>
              {itemsLeft !== null ? itemsLeft : 'Loading...'}
            </strong> / 1111
          </p>
          <p style={{ fontSize: '36px', fontWeight: 'bold', margin: '20px 0' }}>
            {price} SOL
          </p>
          <button
            onClick={mint}
            disabled={isMinting || itemsLeft === 0}
            style={{
              padding: '18px 36px',
              fontSize: '24px',
              background: '#00ff9d',
              color: 'black',
              border: 'none',
              borderRadius: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            {isMinting ? 'MINTING...' : itemsLeft === 0 ? 'SOLD OUT' : 'MINT WARRIOR'}
          </button>
        </>
      )}
    </div>
  );
}

// // react-components/components/MintButton.js
// import React, { useCallback, useState, useEffect, useMemo } from 'react'; // 1. Import useMemo
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
// import { publicKey, transactionBuilder, generateSigner, some } from '@metaplex-foundation/umi';
// import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
// import { mplCandyMachine, fetchCandyMachine, safeFetchCandyGuard, mintV2 } from '@metaplex-foundation/mpl-candy-machine';
// import { mplTokenMetadata, TokenStandard, fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
// import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
// import { ComputeBudgetProgram } from '@solana/web3.js';
// import bs58 from 'bs58';

// function MintButton({onMintStart, onMintSuccess, onMintError}) {
//   const wallet = useWallet();
//   const { connection } = useConnection();
//   const [isMinting, setIsMinting] = useState(false);
//   const [candyMachine, setCandyMachine] = useState(null);
//   const [candyGuard, setCandyGuard] = useState(null);

//   const CANDY_MACHINE_ID_STRING = '33eFiEDpjjAFxM22p5PVQC3jGPzYjCEEmUEojVWYgjsK';
//   const COLLECTION_MINT_ID_STRING = '3pCs14iq2azE7aWXuSmw7vgxia41pcHzm72RJX86zdc8';
//   const TREASURY_ADDRESS = 'FEYHjkQpvjkQuy8DuhwQNQBj9VtdThadkJBnB6T4iUGX';

//   // Memoize the Umi instance
//   const umi = useMemo(() => 
//     // IMPORTANT: Because we use dynamic import (ssr: false), 'connection' and 'wallet' are guaranteed to be defined here on the client.
//     createUmi(connection)
//       .use(walletAdapterIdentity(wallet))
//       .use(mplCandyMachine())
//       .use(mplTokenMetadata()), 
//     [connection, wallet]
//   );

//   // Fetch Candy Machine and Guard data (run even if wallet is not connected)
//   useEffect(() => {
//     if (!umi) {
//       console.warn("UMI not initialized. Waiting for wallet context.");
//       return; 
//     }
    
//     const fetchCandyMachineData = async () => {
//       try {
//         const candyMachineAddress = publicKey(CANDY_MACHINE_ID_STRING);
//         const fetchedCandyMachine = await fetchCandyMachine(umi, candyMachineAddress);
//         const fetchedCandyGuard = await safeFetchCandyGuard(umi, fetchedCandyMachine.mintAuthority);
//         setCandyMachine(fetchedCandyMachine);
//         setCandyGuard(fetchedCandyGuard);
//         // We no longer need setError(null) here, as it causes our issue.
//         // Errors will be cleared when the user initiates a new action.
//       } catch (err) {
//         console.error('Failed to fetch Candy Machine data:', err);
//         onMintError?.('Failed to load minting data. Please refresh.');
//       }
//     };

//     fetchCandyMachineData();
//   }, [umi, onMintError]); // This now correctly runs only when the memoized umi instance changes

//   const mintNft = useCallback(async () => {
//     if (!wallet.connected || !wallet.publicKey || !candyMachine || !candyGuard) {
//       console.error('Minting prerequisites not met');
//       onMintError?.('Wallet not connected or Candy Machine data not loaded');
//       return;
//     }

//     setIsMinting(true);
//     onMintStart?.(); // 3. Notify parent that minting has started

//     const nftMint = generateSigner(umi);

//     try {
//       const txBuilder =transactionBuilder()
//         .add(mintV2(umi, {
//           candyMachine: candyMachine.publicKey,
//           candyGuard: candyGuard?.publicKey,
//           nftMint,
//           collectionMint: publicKey(COLLECTION_MINT_ID_STRING),
//           collectionUpdateAuthority: candyMachine.authority,
//           tokenStandard: TokenStandard.ProgrammableNonFungible,
//           mintArgs: {
//             solPayment: some({ destination: publicKey(TREASURY_ADDRESS) }),
//           },
//         }));

//       const blockhash = await umi.rpc.getLatestBlockhash();
//       const signed = await txBuilder
//         .setBlockhash(blockhash.blockhash)
//         .buildAndSign(umi);

//       const signature = await umi.rpc.sendTransaction(signed, {
//         skipPreflight: true,   // kills Phantom warning
//         maxRetries: 10
//       });

//       console.log(`MINTED https://solana.fm/tx/${bs58.encode(signature)}`);

//       await umi.rpc.confirmTransaction(signature, { commitment: "confirmed" });

//       console.log(`Mint successful! Transaction: ${bs58.encode(signature)}`);

//       // 4. --- FETCH METADATA AND REPORT SUCCESS ---
//       try {
//         const asset = await fetchDigitalAsset(umi, nftMint.publicKey);
//         let metadataJsonUri = asset.metadata.uri.replace(/\0/g, '');
//         if (metadataJsonUri.startsWith('ar://')) {
//             metadataJsonUri = `https://arweave.net/${metadataJsonUri.substring(5)}`;
//         }
//         const metadataResponse = await fetch(metadataJsonUri);
//         const metadataJson = await metadataResponse.json();
        
//         // Call the success callback with the mint address and image URL!
//         onMintSuccess?.(nftMint.publicKey.toString(), metadataJson.image);

//       } catch (metadataError) {
//         console.error("Mint was successful, but failed to fetch metadata:", metadataError);
//         // Still report success, but maybe without an image
//         onMintSuccess?.(nftMint.publicKey.toString(), null);
//       }
//       // ---------------------------------------------

//     } catch (error) {
//       console.error('Mint failed:', error);
//       let userMessage = error.message;
//       if (userMessage.includes('User rejected')) {
//         userMessage = 'Transaction rejected in wallet.';
//       }
//         onMintError?.(userMessage || 'An unknown error occurred.'); // 5. Report error to parent
//       } finally {
//         setIsMinting(false);
//       }
//   }, [wallet, umi, candyMachine, candyGuard, onMintStart, onMintSuccess, onMintError]);

//   // Calculate items remaining and price
//   const itemsRemaining = candyMachine ? candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed : null;
//   const totalItems = candyMachine ? candyMachine.data.itemsAvailable : null;
//   const price = candyGuard && candyGuard.guards.solPayment?.__option === 'Some'
//     ? (Number(candyGuard.guards.solPayment.value.lamports.basisPoints) / 1_000_000_000).toFixed(3)
//     : 'N/A';

//   return (
//     <div style={{ textAlign: 'center', color: 'white' }}>
//       <WalletMultiButton />
//       {wallet.connected && wallet.publicKey ? (
//         <>
//           <p style={{ marginTop: '10px' }}>Connected: {wallet.publicKey.toBase58()}</p>
//           {candyMachine ? (
//             <>
//               <p>Warriors Remaining: {itemsRemaining !== null ? itemsRemaining.toString() : 'Loading...'} / {totalItems !== null ? totalItems.toString() : 'Loading...'}</p>
//               <p>Price: {price} SOL</p>
//               <button
//                 onClick={mintNft}
//                 disabled={!wallet.connected || isMinting || !candyMachine || (itemsRemaining !== null && itemsRemaining <= 0n)}
//                 className="px-4 py-2 mt-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
//               >
//                 {isMinting ? 'Minting...' : !candyMachine ? 'Loading...' : itemsRemaining !== null && itemsRemaining <= 0n ? 'Sold Out' : 'Mint a Random MZT Warrior'}
//               </button>
//             </>
//           ) : (
//             <p>Loading...</p>
//           )}
//         </>
//       ) : (
//         <p style={{ marginTop: '10px' }}>Connect your Solana wallet to mint.</p>
//       )}
//     </div>
//   );
// }

// export default MintButton;

// WORKING MINT
// import React, { useCallback, useState } from 'react';
// import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
// import { publicKey, transactionBuilder, generateSigner, some } from '@metaplex-foundation/umi';
// import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
// import { mplCandyMachine, fetchCandyMachine, safeFetchCandyGuard, mintV2 } from '@metaplex-foundation/mpl-candy-machine';
// import { mplTokenMetadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
// import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// import { ComputeBudgetProgram } from '@solana/web3.js';
// import bs58 from 'bs58';

// function MintButton() {
//   const wallet = useWallet();
//   const { connection } = useConnection();
//   const [isMinting, setIsMinting] = useState(false);

//   const CANDY_MACHINE_ID_STRING = '33eFiEDpjjAFxM22p5PVQC3jGPzYjCEEmUEojVWYgjsK';
//   const COLLECTION_MINT_ID_STRING = '3pCs14iq2azE7aWXuSmw7vgxia41pcHzm72RJX86zdc8';
//   const TREASURY_ADDRESS = 'FEYHjkQpvjkQuy8DuhwQNQBj9VtdThadkJBnB6T4iUGX';

//   const umi = createUmi(connection)
//     .use(walletAdapterIdentity(wallet))
//     .use(mplCandyMachine())
//     .use(mplTokenMetadata());

//   const mintNft = useCallback(async () => {
//     if (!wallet.connected || !wallet.publicKey) {
//       console.error('Wallet not connected');
//       return;
//     }

//     setIsMinting(true);
//     try {
//       const candyMachineAddress = publicKey(CANDY_MACHINE_ID_STRING);
//       const collectionMint = publicKey(COLLECTION_MINT_ID_STRING);
//       const treasuryAddress = publicKey(TREASURY_ADDRESS);

//       const candyMachine = await fetchCandyMachine(umi, candyMachineAddress);
//       const candyGuard = await safeFetchCandyGuard(umi, candyMachine.mintAuthority);

//       const nftMint = generateSigner(umi);

//       const computeUnitInstruction = ComputeBudgetProgram.setComputeUnitLimit({
//         units: 1200000, // Increased for pNFT complexity
//       });

//       const transaction = await transactionBuilder()
//         .add({
//           instruction: {
//             programId: publicKey(computeUnitInstruction.programId.toString()),
//             keys: [],
//             data: computeUnitInstruction.data,
//           },
//           signers: [],
//           bytes: computeUnitInstruction.data,
//         })
//         .add(mintV2(umi, {
//           candyMachine: candyMachine.publicKey,
//           candyGuard: candyGuard?.publicKey,
//           nftMint,
//           collectionMint: collectionMint,
//           collectionUpdateAuthority: candyMachine.authority,
//           tokenStandard: TokenStandard.ProgrammableNonFungible, // Explicitly set for pNFT
//           mintArgs: {
//             solPayment: some({ destination: treasuryAddress }),
//           },
//         }));

//       const { signature } = await transaction.sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });
//       console.log(`Mint successful! Transaction: ${bs58.encode(signature)}`);
//     } catch (error) {
//       console.error('Mint failed:', error.message);
//       if (error.logs) {
//         console.error('Transaction logs:', error.logs);
//       }
//     } finally {
//       setIsMinting(false);
//     }
//   }, [wallet, umi]);

//   return (
//     <button
//       onClick={mintNft}
//       disabled={!wallet.connected || isMinting}
//       className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
//     >
//       {isMinting ? 'Minting...' : 'Mint NFT'}
//     </button>
//   );
// }

// export default MintButton;