// react-components/components/MintButton.js
import React, { useCallback, useState, useEffect, useMemo } from 'react'; // 1. Import useMemo
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey, transactionBuilder, generateSigner, some } from '@metaplex-foundation/umi';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCandyMachine, fetchCandyMachine, safeFetchCandyGuard, mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { mplTokenMetadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ComputeBudgetProgram } from '@solana/web3.js';
import bs58 from 'bs58';

function MintButton() {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isMinting, setIsMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState(null);
  const [candyGuard, setCandyGuard] = useState(null);
  const [error, setError] = useState(null);

  // 1. Add state to track if the component has mounted
  const [isClient, setIsClient] = useState(false);

  // 2. Set isClient to true only after the component mounts on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  const CANDY_MACHINE_ID_STRING = '33eFiEDpjjAFxM22p5PVQC3jGPzYjCEEmUEojVWYgjsK';
  const COLLECTION_MINT_ID_STRING = '3pCs14iq2azE7aWXuSmw7vgxia41pcHzm72RJX86zdc8';
  const TREASURY_ADDRESS = 'FEYHjkQpvjkQuy8DuhwQNQBj9VtdThadkJBnB6T4iUGX';

  // 2. Memoize the Umi instance
  const umi = useMemo(() => 
    createUmi(connection)
      .use(walletAdapterIdentity(wallet))
      .use(mplCandyMachine())
      .use(mplTokenMetadata()), 
    [connection, wallet]
  );

  // Fetch Candy Machine and Guard data (run even if wallet is not connected)
  useEffect(() => {
    if (!umi) return; // Don't run if umi is not yet initialized
    
    const fetchCandyMachineData = async () => {
      try {
        const candyMachineAddress = publicKey(CANDY_MACHINE_ID_STRING);
        const fetchedCandyMachine = await fetchCandyMachine(umi, candyMachineAddress);
        const fetchedCandyGuard = await safeFetchCandyGuard(umi, fetchedCandyMachine.mintAuthority);
        setCandyMachine(fetchedCandyMachine);
        setCandyGuard(fetchedCandyGuard);
        // We no longer need setError(null) here, as it causes our issue.
        // Errors will be cleared when the user initiates a new action.
      } catch (err) {
        console.error('Failed to fetch Candy Machine data:', err);
        setError('Failed to load Candy Machine data. Please check the network or Candy Machine ID.');
        setCandyMachine(null);
        setCandyGuard(null);
      }
    };

    fetchCandyMachineData();
  }, [umi]); // This now correctly runs only when the memoized umi instance changes

  const mintNft = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey || !candyMachine || !candyGuard) {
      console.error('Minting prerequisites not met');
      setError('Wallet not connected or Candy Machine data not loaded');
      return;
    }

    setIsMinting(true);
    setError(null); // 3. Clear previous errors on a new mint attempt
    try {
      const nftMint = generateSigner(umi);

      const transaction = await transactionBuilder()
        .add(mintV2(umi, {
          candyMachine: candyMachine.publicKey,
          candyGuard: candyGuard?.publicKey,
          nftMint,
          collectionMint: publicKey(COLLECTION_MINT_ID_STRING),
          collectionUpdateAuthority: candyMachine.authority,
          tokenStandard: TokenStandard.ProgrammableNonFungible,
          mintArgs: {
            solPayment: some({ destination: publicKey(TREASURY_ADDRESS) }),
          },
        }));

      const { signature } = await transaction.sendAndConfirm(umi, { confirm: { commitment: 'confirmed' } });
      console.log(`Mint successful! Transaction: ${bs58.encode(signature)}`);
    } catch (error) {
      console.error('Mint failed:', error);
      // Simplify error message to be more user-friendly
      if (error.message.includes('User rejected the request')) {
        setError('Transaction rejected.');
      } else {
        setError(`Minting failed: ${error.message}`);
      }
    } finally {
      setIsMinting(false);
    }
  }, [wallet, umi, candyMachine, candyGuard]);

  // Calculate items remaining and price
  const itemsRemaining = candyMachine ? candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed : null;
  const totalItems = candyMachine ? candyMachine.data.itemsAvailable : null;
  const price = candyGuard && candyGuard.guards.solPayment?.__option === 'Some'
    ? (Number(candyGuard.guards.solPayment.value.lamports.basisPoints) / 1_000_000_000).toFixed(2)
    : 'N/A';
  
    // 3. Prevent rendering the wallet-dependent UI until the component has mounted
  if (!isClient) {
    return null; // Render nothing on the server and initial client-side render
  }

  return (
    <div style={{ textAlign: 'center', color: 'white' }}>
      <WalletMultiButton />
      {wallet.connected && wallet.publicKey ? (
        <>
          <p style={{ marginTop: '10px' }}>Connected: {wallet.publicKey.toBase58()}</p>
          {candyMachine ? (
            <>
              <p>Items Remaining: {itemsRemaining !== null ? itemsRemaining.toString() : 'Loading...'} / {totalItems !== null ? totalItems.toString() : 'Loading...'}</p>
              <p>Price: {price} SOL</p>
              <button
                onClick={mintNft}
                disabled={!wallet.connected || isMinting || !candyMachine || (itemsRemaining !== null && itemsRemaining <= 0n)}
                className="px-4 py-2 mt-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
              >
                {isMinting ? 'Minting...' : !candyMachine ? 'Loading...' : itemsRemaining !== null && itemsRemaining <= 0n ? 'Sold Out' : 'Mint a Random MZT Warrior NFT'}
              </button>
            </>
          ) : (
            <p>Loading Candy Machine data...</p>
          )}
          {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
        </>
      ) : (
        <p style={{ marginTop: '10px' }}>Connect your Solana wallet to mint.</p>
      )}
    </div>
  );
}

export default MintButton;

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