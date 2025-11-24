// react-components/components/MintButton.js
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { publicKey, transactionBuilder, generateSigner, some } from '@metaplex-foundation/umi';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { mplCandyMachine, fetchCandyMachine, safeFetchCandyGuard, mintV2 } from '@metaplex-foundation/mpl-candy-machine';
import { mplTokenMetadata, TokenStandard, fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { ComputeBudgetProgram } from '@solana/web3.js';
import bs58 from 'bs58';

function MintButton({onMintStart, onMintSuccess, onMintError}) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [isMinting, setIsMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState(null);
  const [candyGuard, setCandyGuard] = useState(null);
  
  // const [error, setError] = useState(null);


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
        onMintError?.('Failed to load minting data. Please refresh.');
      }
    };

    fetchCandyMachineData();
  }, [umi, onMintError]); // This now correctly runs only when the memoized umi instance changes

  const mintNft = useCallback(async () => {
    if (!wallet.connected || !wallet.publicKey || !candyMachine || !candyGuard) {
      console.error('Minting prerequisites not met');
      onMintError?.('Wallet not connected or Candy Machine data not loaded');
      return;
    }

    setIsMinting(true);
    onMintStart?.(); // 3. Notify parent that minting has started

    const nftMint = generateSigner(umi);

    try {
      const nftMint = generateSigner(umi);

      // Build the mint transaction
      const tx = transactionBuilder()
        .add(mintV2(umi, {
          candyMachine: candyMachine.publicKey,
          candyGuard: candyGuard?.publicKey,
          nftMint,
          collectionMint: publicKey(COLLECTION_MINT_ID_STRING),
          collectionUpdateAuthority: candyMachine.authority,
          tokenStandard: TokenStandard.ProgrammableNonFungible,
          mintArgs: {
            solPayment: some({ destination: publicKey(TREASURY_ADDRESS) })
          }
        }));

      // GET FRESH BLOCKHASH THE ONLY WAY UMI ACCEPTS IT
      const { blockhash } = await umi.rpc.getLatestBlockhash({ commitment: 'confirmed' });

      // BUILD + SIGN + SEND WITH skipPreflight = TRUE
      const signedTx = await tx.setBlockhash(blockhash).buildAndSign(umi);

      const signature = await umi.rpc.sendTransaction(signedTx, {
        skipPreflight: true,   // THIS IS WHAT KILLS PHANTOM WARNING 100%
        maxRetries: 10
      });

      console.log(`MINTED → https://solana.fm/tx/${bs58.encode(signature)}`);

      await umi.rpc.confirmTransaction(signature, { commitment: 'confirmed' });

      // Metadata fetch (unchanged)
      const asset = await fetchDigitalAsset(umi, nftMint.publicKey);
      let uri = asset.metadata.uri.replace(/\0/g, '');
      if (uri.startsWith('ar://')) uri = `https://arweave.net/${uri.slice(5)}`;
      const metadata = await (await fetch(uri)).json();
      onMintSuccess?.(nftMint.publicKey.toString(), metadata.image);

    } catch (error) {
      console.error('Mint failed:', error);
      const msg = error?.message || 'Unknown error';
      onMintError?.(msg.includes('User rejected') ? 'You rejected the transaction' : msg);
    } finally {
      setIsMinting(false);
    }
  }, [wallet, umi, candyMachine, candyGuard, onMintStart, onMintSuccess, onMintError]);

  // Calculate items remaining and price
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
                onClick={mintNft}
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