//pages/intro
import { useState, useEffect, useCallback, useMemo } from 'react';

//METAPLEX & UMI
// import { createUmi, generateSigner, transactionBuilder, PublicKey as UmiPublicKey, some  } from '@metaplex-foundation/umi';
// import bs58 from 'bs58';
// import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
// import { defaultPlugins } from '@metaplex-foundation/umi-bundle-defaults';
// import { mplToolbox } from '@metaplex-foundation/mpl-toolbox';
// import { Transaction } from '@solana/web3.js'; // Renamed for clarity
// import { PublicKey as Web3JsPublicKey } from '@solana/web3.js'; // Renamed for clarity
// import { fromWeb3JsPublicKey, toWeb3JsPublicKey, toWeb3JsTransaction } from '@metaplex-foundation/umi-web3js-adapters';
// import { fetchCandyMachine, mintV2, mplCandyMachine, safeFetchCandyGuard, CandyGuard as MplCandyGuard, CandyMachine as MplCandyMachine } from '@metaplex-foundation/mpl-candy-machine'; // Import fetchCandyMachine
// import { mplTokenMetadata, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
// import { setComputeUnitLimit, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox';
// import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata';

// Import Wallet Stuff
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
// import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Next.js UI
import Head from 'next/head';
import Image from 'next/image';

// Component UI
import ImageFader from '../react-components/components/ImageFader';
import HelloBar from '../react-components/components/HelloBar';
import LoreContent from '../react-components/components/LoreContent';
import MintButton from '../react-components/components/MintButton';

// *** CANDY MACHINE ***
// const CANDY_MACHINE_ID_STRING = '33eFiEDpjjAFxM22p5PVQC3jGPzYjCEEmUEojVWYgjsK';
// const CANDY_MACHINE_ID = new Web3JsPublicKey(CANDY_MACHINE_ID_STRING);
// const COLLECTION_MINT_ID_STRING = '3pCs14iq2azE7aWXuSmw7vgxia41pcHzm72RJX86zdc8';

// FADER IMAGES
const faderImages = [
  '/img/nft-preview/98.png',
  '/img/nft-preview/783.png',
  '/img/nft-preview/0.png',
  '/img/nft-preview/859.png',
  '/img/nft-preview/626.png',
  '/img/nft-preview/772.png',
  '/img/nft-preview/82.png',
  '/img/nft-preview/105.png',
  '/img/nft-preview/118.png',
  '/img/nft-preview/1090.png',
  '/img/nft-preview/138.png',
  '/img/nft-preview/225.png',
  '/img/nft-preview/372.png',
  '/img/nft-preview/457.png',
  '/img/nft-preview/766.png',
  '/img/nft-preview/617.png',
  '/img/nft-preview/919.png',
  '/img/nft-preview/711.png',
  '/img/nft-preview/1053.png',
  '/img/nft-preview/986.png',
  '/img/nft-preview/891.png',
  '/img/nft-preview/831.png',
]

// function shuffleArray(array) {
//   let currentIndex = array.length, randomIndex;

//   // While there remain elements to shuffle.
//   while (currentIndex !== 0) {

//     // Pick a remaining element.
//     randomIndex = Math.floor(Math.random() * currentIndex);
//     currentIndex--;

//     // And swap it with the current element.
//     [array[currentIndex], array[randomIndex]] = [
//       array[randomIndex], array[currentIndex]];
//   }

//   return array;
// }

// const randomizedFaderImages = shuffleArray([...faderImages]); // Create a shallow copy to avoid modifying the original array

export default function Intro() {
  // State variables
  // const { wallet, publicKey: web3JsWalletPublicKey, sendTransaction, signTransaction } = useWallet();
  // const { connection } = useConnection();
  // const [umi, setUmi] = useState(null);
  // const [candyMachine, setCandyMachine] = useState(null); // Will store { ...candyMachineData, candyGuard: candyGuardData }
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  // const [error, setError] = useState(null);
  const [mintedNftImageUri, setMintedNftImageUri] = useState(null);
  const [lastMintedNftAddress, setLastMintedNftAddress] = useState(null);
  // const [attempt, setAttempt] = useState(0);
  // const maxRetries = 3;

  // **STEP 1: Initialize UMI instance using useEffect**
  // useEffect(() => {
  //   console.log("--- UMI Effect Initialization ---");
  //   if (connection && web3JsWalletPublicKey && wallet?.adapter) {
  //     try {
  //       console.log("Attempting to create UMI instance...");
  //       console.log('Wallet Adapter available:', !!wallet.adapter);
  //       console.log('Connection RPC endpoint:', connection.rpcEndpoint);
  //       console.log('Wallet PublicKey (Web3.js):', web3JsWalletPublicKey.toBase58());


  //       if (typeof mplTokenMetadata !== 'function') {
  //         console.error('mplTokenMetadata is not loaded as a function. Type:', typeof mplTokenMetadata);
  //         setError('Failed to initialize UMI: mplTokenMetadata plugin could not be loaded correctly.');
  //         setUmi(null);
  //         return; // Prevent further execution if a plugin is not loaded
  //       }
  //       if (typeof mplCandyMachine !== 'function') {
  //         console.error('mplCandyMachine is not loaded as a function. Type:', typeof mplCandyMachine);
  //         setError('Failed to initialize UMI: mplCandyMachine plugin could not be loaded correctly.');
  //         setUmi(null);
  //         return; // Prevent further execution
  //       }
  //       if (typeof mplToolbox !== 'function') { // <<--- 2. ADD THIS CHECK
  //         console.error('mplToolbox is not loaded as a function. Type:', typeof mplToolbox);
  //         setError('Failed to initialize UMI: mplToolbox plugin could not be loaded correctly.');
  //         setUmi(null);
  //         return;
  //       }
  //       if (typeof walletAdapterIdentity !== 'function') { // <<--- ADD CHECK FOR walletAdapterIdentity
  //           console.error('walletAdapterIdentity is not loaded as a function. Type:', typeof walletAdapterIdentity);
  //           setError('Failed to initialize UMI: walletAdapterIdentity plugin could not be loaded correctly.');
  //           setUmi(null);
  //           return;
  //       }

  //       const umiInstance = createUmi()
  //         // Use defaultPlugins, providing the RPC endpoint from your connection.
  //         // This should set up the RPC interface and mplToolbox (which provides ProgramRepositoryInterface).
  //         .use(defaultPlugins(connection.rpcEndpoint))
  //         .use(mplToolbox())
  //         // Set the signer identity using your wallet adapter.
  //         .use(walletAdapterIdentity(wallet.adapter))
  //         // Install the Token Metadata plugin.
  //         .use(mplTokenMetadata())
  //         // Install the Candy Machine plugin.
  //         .use(mplCandyMachine());

  //       console.log("UMI instance successfully created:", umiInstance);
  //       // It's good practice to check if identity got set, though it might happen asynchronously
  //       // depending on wallet auto-connection.
  //       if (umiInstance.identity?.publicKey) {
  //         console.log("UMI Identity Public Key (Umi):", umiInstance.identity.publicKey.toString());
  //       } else {
  //         console.warn("UMI Identity not immediately set. This might be due to wallet connection timing.");
  //       }
  //       setUmi(umiInstance);
  //       setError(null);

  //     } catch (e) {
  //         console.error("Error initializing UMI (in effect):", e);
  //         const errorMessage = e instanceof Error ? e.message : String(e);
  //         // UMI errors often have a 'cause' property with more details
  //         if (e.cause) {
  //           console.error("Underlying cause:", e.cause);
  //         }
  //         setError(`Failed to initialize UMI: ${errorMessage}`);
  //         setUmi(null);
  //       }
  //   } else {
  //      // Log which specific conditions are not met
  //     let missingParts = [];
  //     if (!connection) missingParts.push("Solana connection");
  //     if (!web3JsWalletPublicKey) missingParts.push("wallet public key");
  //     if (!wallet?.adapter) missingParts.push("wallet adapter");
  //     console.log(`UMI effect initialization conditions not met. Missing: ${missingParts.join(', ')}.`);
  //     setUmi(null); // Reset UMI if conditions are not met
  //   }
  // }, [connection, web3JsWalletPublicKey, wallet, wallet?.adapter]);
  
  // **STEP 2: Fetch Candy Machine and Guard data**
  // useEffect(() => {
  //   if (!umi) {
  //     console.log("UMI is not initialized. Cannot fetch Candy Machine.");
  //     // Ensure candyMachine state is cleared if UMI is lost
  //     if (candyMachine) setCandyMachine(null);
  //     return;
  //   }

  //   const candyMachineAddressUmi = fromWeb3JsPublicKey(CANDY_MACHINE_ID);
  //   console.log(`Attempting to fetch Candy Machine: ${CANDY_MACHINE_ID_STRING} (Umi Pk: ${candyMachineAddressUmi})`);

  //   const fetchCMData = async () => {
  //     setError(null); // Clear previous errors
  //     try {
  //       // Fetch the Candy Machine account.
  //       // mplCandyMachine plugin should register the GpaBuilder for CandyMachine and CandyGuard.
  //       const fetchedCm = await fetchCandyMachine(umi, candyMachineAddressUmi);
  //       console.log("Fetched Candy Machine (UMI):", fetchedCm);

  //       if (!fetchedCm || !fetchedCm.mintAuthority) {
  //         console.error("Failed to fetch Candy Machine or it has no mintAuthority (guard address).");
  //         setError('Failed to load Candy Machine data or guard address missing.');
  //         setCandyMachine(null);
  //         return;
  //       }
        
  //       // The mintAuthority of the CandyMachine IS the CandyGuard address.
  //       const candyGuardAddress = fetchedCm.mintAuthority;
  //       console.log(`Candy Machine's mintAuthority (Candy Guard Address): ${candyGuardAddress.toString()}`);

  //       // Fetch the Candy Guard account using its address.
  //       // safeFetchCandyGuard will return null if not found, instead of throwing.
  //       const fetchedCandyGuard = await safeFetchCandyGuard(umi, candyGuardAddress);
        
  //       if (!fetchedCandyGuard) {
  //           console.error(`Candy Guard not found at address: ${candyGuardAddress.toString()}`);
  //           setError(`Configuration error: Candy Guard not found for this Candy Machine.`);
  //           // Set CM data without guard, or handle as critical error
  //           setCandyMachine({ ...fetchedCm, candyGuard: null });
  //           return;
  //       }
  //       console.log("Fetched Candy Guard (UMI):", fetchedCandyGuard);
  //       // MODIFY THE LINE BELOW:
  //       console.log("DETAILED GUARDS CONFIGURATION:", JSON.stringify(
  //         fetchedCandyGuard.guards,
  //         (key, value) => (typeof value === 'bigint' ? value.toString() : value), // This handles BigInts
  //         2 // This is for pretty printing (2 spaces indentation)
  //       ));
  //       console.log('Candy Guard raw guards object:', fetchedCandyGuard.guards);

  //       // Combine Candy Machine and its Guard into one state object
  //       setCandyMachine({ ...fetchedCm, candyGuard: fetchedCandyGuard });

  //     } catch (fetchError) {
  //       console.error('Error fetching Candy Machine or Guard (UMI):', fetchError);
  //       let errorMessage = `Failed to load Candy Machine data: ${fetchError.message}`;
  //       if (fetchError.name === 'AccountNotFoundError') {
  //         errorMessage = `Error: Candy Machine account not found at ${CANDY_MACHINE_ID_STRING}. Double-check the address and network.`;
  //       } else if (fetchError.message?.includes("Unable to find a GpaBuilder for the CandyMachine program")) {
  //         errorMessage = "Error: UMI isn't configured correctly for CandyMachine. Check mplCandyMachine plugin.";
  //       } else if (fetchError.message?.includes("Unable to find a GpaBuilder for the CandyGuard program")) {
  //           errorMessage = "Error: UMI isn't configured correctly for CandyGuard. Ensure mplCandyMachine plugin is up-to-date.";
  //       }
  //       setError(errorMessage);
  //       setCandyMachine(null);
  //     }
  //   };

  //   fetchCMData();
  // }, [umi]);

  // Your collectionMint PublicKey. Use useMemo for stability.
  // const collectionMint = useMemo(() => {
  //   if (!umi) return null; // UMI must be initialized to create UMI PublicKeys
  //   try {
  //     // The publicKey constructor from UMI should be used if you are working within UMI context primarily
  //     // However, you are converting from a web3.js public key string, so fromWeb3JsPublicKey is appropriate here.
  //     return fromWeb3JsPublicKey(new Web3JsPublicKey(COLLECTION_MINT_ID_STRING)); //collectionMint PublicKey
  //   } catch(e) {
  //     console.error("Invalid Collection Mint Public Key string", e);
  //     return null;
  //   }
  // }, [umi]);

  // **STEP 3: Implement the MINT function**
  // const handleMint = useCallback(async () => {
  //   console.log("Mint button clicked!");
  //   if (!umi || !wallet || !candyMachine || !candyMachine.candyGuard || !collectionMint || !signTransaction || !sendTransaction) {
  //     setError('Minting prerequisites not met. Please ensure your wallet is connected and supports signAndSendTransaction.');
  //     console.error('Mint aborted: UMI, Wallet, Candy Machine, Collection Mint, or transaction methods not available.');
  //     setMinting(false);
  //     return;
  //   }
  
  //   setMinting(true);
  //   setError(null);
  //   setMinted(false);
  //   setAttempt(0);
  
  //   while (attempt < maxRetries) {
  //     const startTime = Date.now();
  //     setAttempt(prev => prev + 1);
  //     console.log(`Mint attempt ${attempt + 1}/${maxRetries} started at ${new Date(startTime).toISOString()}`);
  
  //     let signature = 'unknown';
  //     try {
  //       // Check wallet balance
  //       const balanceStart = Date.now();
  //       const balance = await connection.getBalance(web3JsWalletPublicKey);
  //       console.log(`getBalance took ${Date.now() - balanceStart}ms`);
  //       const minBalance = candyMachine.candyGuard.guards.solPayment?.value?.lamports.basisPoints || 0;
  //       const feeLamports = 0.03 * 1_000_000_000;
  //       const requiredBalance = Number(minBalance) + feeLamports;
  //       if (balance < requiredBalance) {
  //         setError(`Insufficient SOL balance. Need ${(requiredBalance / 1_000_000_000).toFixed(6)} SOL, but wallet has ${(balance / 1_000_000_000).toFixed(6)} SOL.`);
  //         setMinting(false);
  //         return;
  //       }
  //       console.log(`Wallet balance: ${balance / 1_000_000_000} SOL, Required: ${requiredBalance / 1_000_000_000} SOL`);
  
  //       // Fetch recent prioritization fees
  //       const feeStart = Date.now();
  //       const recentFees = await connection.getRecentPrioritizationFees();
  //       console.log(`getRecentPrioritizationFees took ${Date.now() - feeStart}ms`);
  //       const avgFee = recentFees.length > 0
  //         ? Math.max(...recentFees.map(f => f.prioritizationFee), 5000000) * 4
  //         : 20000000;
  //       console.log(`Using priority fee: ${avgFee} microLamports`);
  
  //       // Generate mint signer
  //       const nftMintSigner = generateSigner(umi);
  //       console.log("Generated NFT Mint Signer:", nftMintSigner.publicKey.toString());
  
  //       // Set mint arguments
  //       let mintArguments = {};
  //       if (candyMachine.candyGuard.guards.solPayment?.__option === 'Some') {
  //         const solPaymentGuard = candyMachine.candyGuard.guards.solPayment.value;
  //         mintArguments.solPayment = some({ destination: solPaymentGuard.destination });
  //         console.log(`SolPayment Guard: ${Number(solPaymentGuard.lamports.basisPoints) / 1_000_000_000} SOL to ${solPaymentGuard.destination.toString()}`);
  //       }
  
  //       // Fetch blockhash
  //       const blockhashStart = Date.now();
  //       const latestBlockhash = await connection.getLatestBlockhash('confirmed');
  //       console.log(`getLatestBlockhash took ${Date.now() - blockhashStart}ms`);
  //       console.log("Transaction will use blockhash:", latestBlockhash.blockhash, "Last valid block height:", latestBlockhash.lastValidBlockHeight);
  
  //       // Check block height
  //       const blockHeightStart = Date.now();
  //       const blockHeight = await connection.getBlockHeight('confirmed');
  //       console.log(`getBlockHeight took ${Date.now() - blockHeightStart}ms`);
  //       console.log(`Current block height: ${blockHeight}`);
  //       if (blockHeight >= latestBlockhash.lastValidBlockHeight - 100) {
  //         console.warn(`Blockhash ${latestBlockhash.blockhash} is too close to expiration (block height ${blockHeight} vs ${latestBlockhash.lastValidBlockHeight}). Retrying...`);
  //         await new Promise(resolve => setTimeout(resolve, 500));
  //         continue;
  //       }
  
  //       // Build transaction (force legacy)
  //       const transaction = transactionBuilder()
  //         .add(setComputeUnitLimit(umi, { units: 1_400_000 }))
  //         .add(setComputeUnitPrice(umi, { microLamports: avgFee }))
  //         .add(
  //           mintV2(umi, {
  //             candyMachine: candyMachine.publicKey,
  //             nftMint: nftMintSigner,
  //             collectionMint: collectionMint,
  //             collectionUpdateAuthority: candyMachine.authority,
  //             candyGuard: candyMachine.candyGuard.publicKey,
  //             group: (candyMachine.candyGuard.groups.length > 0 && candyMachine.candyGuard.groups[0].label !== "default")
  //               ? some(candyMachine.candyGuard.groups[0].label)
  //               : undefined,
  //             tokenStandard: TokenStandard.ProgrammableNonFungible,
  //             mintArgs: mintArguments,
  //           })
  //         )
  //         .setBlockhash(latestBlockhash.blockhash);
  
  //       const unsignedTx = transaction.build(umi);
  //       const web3jsTransaction = toWeb3JsTransaction(unsignedTx);
  //       web3jsTransaction.feePayer = web3JsWalletPublicKey;
  //       web3jsTransaction.recentBlockhash = latestBlockhash.blockhash;
  
  //       // Log transaction type
  //       console.log("Transaction type:", Object.prototype.toString.call(web3jsTransaction));
  
  //       // Log expected signers
  //       console.log("Expected signers:", {
  //         feePayer: web3JsWalletPublicKey.toBase58(),
  //         nftMintSigner: nftMintSigner.publicKey.toString(),
  //       });
  
  //       // Conditionally handle signing based on transaction type
  //       const isLegacyTransaction = web3jsTransaction instanceof Transaction;
  //       if (isLegacyTransaction) {
  //         console.log("Partially signing legacy Transaction with nftMintSigner...");
  //         const keypair = {
  //           publicKey: toWeb3JsPublicKey(nftMintSigner.publicKey),
  //           secretKey: nftMintSigner.secretKey,
  //         };
  //         web3jsTransaction.partialSign(keypair);
  //       } else {
  //         console.log("Skipping partial signing for non-legacy transaction (likely VersionedTransaction).");
  //         // For VersionedTransaction, signing is handled by sendTransaction or requires sign() with Keypair array
  //       }
  
  //       console.log(`Transaction built in ${Date.now() - startTime}ms`);
  //       console.log("Transaction details:", {
  //         feePayer: web3jsTransaction.feePayer.toBase58(),
  //         recentBlockhash: web3jsTransaction.recentBlockhash,
  //         version: web3jsTransaction.version || 'legacy',
  //         signatures: web3jsTransaction.signatures ? web3jsTransaction.signatures.map((sig, i) => ({
  //           index: i,
  //           publicKey: sig.publicKey ? sig.publicKey.toBase58() : 'null',
  //           signature: sig.signature ? bs58.encode(sig.signature) : 'null',
  //         })) : 'No signatures array (VersionedTransaction)',
  //       });
  
  //       // Simulate transaction without signature verification
  //       const simStart = Date.now();
  //       const { value: simulationResult } = await connection.simulateTransaction(web3jsTransaction, {
  //         commitment: 'confirmed',
  //         sigVerify: false,
  //       });
  //       console.log(`simulateTransaction took ${Date.now() - simStart}ms`);
  //       if (simulationResult.err) {
  //         console.error("❌ Simulation Failed:", simulationResult.err);
  //         console.log("📜 Simulation Logs:", simulationResult.logs);
  //         setError(`Minting failed during pre-check: ${JSON.stringify(simulationResult.err)}. Logs: ${JSON.stringify(simulationResult.logs || 'No logs available')}.`);
  //         setMinting(false);
  //         return;
  //       }
  //       console.log("✅ Simulation successful in", Date.now() - startTime, "ms");
  
  //       // Sign and send using sendTransaction
  //       console.log("Signing and sending transaction with priority fee...");
  //       const sendStart = Date.now();
  //       signature = await sendTransaction(web3jsTransaction, connection, {
  //         skipPreflight: false,
  //         maxRetries: 2,
  //         preflightCommitment: 'confirmed',
  //       });
  //       console.log(`sendTransaction took ${Date.now() - sendStart}ms`);
  //       console.log("Transaction confirmed by wallet adapter! Signature:", signature, "Time:", Date.now() - startTime, "ms");
  
  //       // Confirm transaction
  //       console.log("Confirming transaction on-chain...");
  //       let confirmationStatus = null;
  //       const confirmStart = Date.now();
  //       for (let i = 0; i < 75; i++) {
  //         const statusStart = Date.now();
  //         const result = await connection.getSignatureStatuses([signature], { searchTransactionHistory: false });
  //         console.log(`getSignatureStatuses (poll ${i + 1}) took ${Date.now() - statusStart}ms`, result.value[0]);
  //         if (result.value[0] && result.value[0].confirmationStatus) {
  //           confirmationStatus = result.value[0].confirmationStatus;
  //           console.log(`Confirmation status (poll ${i + 1}): ${confirmationStatus}`);
  //           if (confirmationStatus === 'confirmed' || confirmationStatus === 'finalized') {
  //             break;
  //           }
  //         }
  //         await new Promise(resolve => setTimeout(resolve, 400));
  //       }
  //       console.log(`Confirmation polling took ${Date.now() - confirmStart}ms`);
  
  //       if (!confirmationStatus || confirmationStatus === 'recent') {
  //         console.error("On-chain confirmation timeout");
  //         throw new Error(`Minting failed: Transaction could not be confirmed in time. Signature: ${signature}`);
  //       }
  
  //       // Verify finalization
  //       console.log("Verifying transaction finalization...");
  //       const finalConfirmStart = Date.now();
  //       const finalConfirmation = await connection.getSignatureStatuses([signature], { searchTransactionHistory: false });
  //       console.log(`Final getSignatureStatuses took ${Date.now() - finalConfirmStart}ms`, finalConfirmation.value[0]);
  //       if (!finalConfirmation.value[0] || finalConfirmation.value[0].confirmationStatus !== 'finalized' || finalConfirmation.value[0].err) {
  //         console.error("Finalization error:", finalConfirmation.value[0]?.err);
  //         throw new Error(`Minting failed: Transaction could not be finalized. Error: ${JSON.stringify(finalConfirmation.value[0]?.err)}`);
  //       }
  
  //       console.log('Transaction successfully confirmed and finalized! ✅ Time:', Date.now() - startTime, "ms");
  
  //       // Fetch transaction details
  //       const txResultStart = Date.now();
  //       const txResult = await connection.getTransaction(signature, {
  //         commitment: 'finalized',
  //         maxSupportedTransactionVersion: 0,
  //       });
  //       console.log(`getTransaction took ${Date.now() - txResultStart}ms`);
  //       console.log('Fetched transaction details:', txResult);
  
  //       let mintTrulySuccessful = txResult && !txResult.meta?.err;
  //       if (mintTrulySuccessful) {
  //         setMinted(true);
  //         setError(null);
  //         setLastMintedNftAddress(nftMintSigner.publicKey.toString());
  //         try {
  //           const asset = await fetchDigitalAsset(umi, nftMintSigner.publicKey);
  //           if (asset?.metadata?.uri) {
  //             let metadataJsonUri = asset.metadata.uri;
  //             if (metadataJsonUri.startsWith('ar://')) {
  //               metadataJsonUri = `https://arweave.net/${metadataJsonUri.substring(5)}`;
  //             }
  //             const metadataResponse = await fetch(metadataJsonUri);
  //             if (!metadataResponse.ok) throw new Error('Failed to fetch metadata JSON');
  //             const metadataJson = await metadataResponse.json();
  //             if (metadataJson.image) setMintedNftImageUri(metadataJson.image);
  //           }
  //         } catch (metadataError) {
  //           console.error('Failed to fetch metadata for minted NFT:', metadataError);
  //           setMintedNftImageUri(null);
  //         }
  //         setMinting(false);
  //         return;
  //       } else {
  //         throw new Error("Minting failed: The transaction was confirmed but failed to execute properly.");
  //       }
  //     } catch (error) {
  //       console.error(`Mint attempt ${attempt + 1} failed:`, error, error.stack);
  //       console.log(`Failed after ${Date.now() - startTime}ms`);
  //       if (error.name === 'SendTransactionError') {
  //         console.error("SendTransactionError logs:", error.logs || 'No logs available');
  //         setError(`Minting failed: Transaction error. Logs: ${JSON.stringify(error.logs || 'No logs available')}. Signature: ${signature}. Try switching wallets or RPC providers.`);
  //       } else if (error.name === 'WalletSendTransactionError' || error.message.includes('User rejected')) {
  //         setError("Transaction rejected by user in wallet. Please approve the transaction to proceed.");
  //       } else if (error.name === 'TransactionExpiredBlockheightExceededError' || error.message.includes('expired')) {
  //         if (attempt + 1 < maxRetries) {
  //           console.log("Retrying due to blockhash expiration...");
  //           await new Promise(resolve => setTimeout(resolve, 1000));
  //           continue;
  //         }
  //         setError(`Minting failed after retries: Transaction expired due to network congestion. Signature: ${signature}. Try again or switch to a faster RPC provider.`);
  //       } else if (error.message.includes('insufficient lamports') || error.message.includes('custom program error: 0x1')) {
  //         setError(`Minting failed: Insufficient funds. Ensure your wallet has at least ${(requiredBalance / 1_000_000_000).toFixed(6)} SOL for minting and fees.`);
  //       } else {
  //         setError(`Minting failed: ${error.message || 'An unknown error occurred.'} Signature: ${signature}.`);
  //       }
  //       setMinted(false);
  //       setMintedNftImageUri(null);
  //       setMinting(false);
  //       if (attempt + 1 < maxRetries) {
  //         console.log("Retrying due to error...");
  //         await new Promise(resolve => setTimeout(resolve, 1000));
  //         continue;
  //       }
  //       return;
  //     }
  //   }
  // }, [umi, wallet, candyMachine, collectionMint, connection, sendTransaction, signTransaction, web3JsWalletPublicKey, attempt]);

  // --- UI Rendering ---
  return (
    <div>
      <Head>
        <title>Manzanita Tribe Warriors - Digital Collectibles in the Solana Network</title>
        <meta name="description" content="We are the Manzanita Tribe Warriors! A digital collection in the Solana network." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <HelloBar/>
      <div className='s-hero'>
        <main>
          <div className='u-flex u-flex1 l-leftCol'>
            {/* ... Logo and Text ... */}
            <div className='mzt-logo u-animated a-fadeIn'>
              <div style={{display:'flex', justifyContent:'center'}}>
                <Image className='mzt-logo__img  u-animated a-fadeIn' width="800" height="800" src="/img/mzt-logo.png" alt="Manzanita Tribe Warriors Logo" />
              </div>
              <div style={{color: "white",textAlign:"center", padding: "1.5em 0"}}>
                <h1>Manzanita Tribe Warriors <br/>
                  <span style={{fontSize:'.5em', color:"#ffff00"}}>
                    <span style={{color:"#ff0000"}}>( </span>Solana Digital Collectibles<span style={{color:"#ff0000"}}>* )</span> 
                  </span>
                </h1>
                {/* Lead a tribe of fierce Manzanitas in the digital lands of MZT Warriors.  */}
                <p style={{maxWidth: "540px", margin: "0 auto 25px"}}> 
                  {/* Discover the universe of the MZT Warriors.<br/> */}
                  {/* Explore mystical forests, raid high-risk dungeons, and gain powerful loot!<span style={{color:"red"}}>*</span> */}
                  <b style={{fontSize: '1.125em', marginBottom:'-5px', display: 'block'}}>🌲 Claim one of the First Warriors of the Manzanita Forest 🌲</b> <br />
                  <span style={{color: '#8dffbf'}}>Mint your Manzanita Tribe Warrior</span> <span style={{color: '#fff'}}>—</span> <br/><span>fierce survivors from a mysterious forest realm.</span>
                </p>
                <p style={{fontSize:'.85em'}}>
                  <br/> This is a self-funded indie passion project by a solo creator. 
                  <br/> Every mint &amp; purchase  fuels the continued growth of the MZT Warriors universe. 
                  <br/>
                </p>
                <div style={{marginTop: '6px'}}>
                  <span style={{color:"red"}}>*</span>
                  <em style={{color:"#ff0203"}}>Not a financial investment.</em> 
                </div>
                <em style={{fontWeight:'bold', marginTop: '0px', color:'#092e4d'}}>No promises — only pixels.</em> 
                <div style={{display: 'flex', alignItems:'center', justifyContent:'center'}}>
                  {/* Discord */}
                  <a href="https://discord.gg/3uXnWZEfgR" target="_blank" rel="noopener noreferrer" style={{display:'flex', alignItems:'center', justifyContent: 'center', color:'#6d79ff'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{marginRight: '5px'}} width="30" viewBox="0 0 640 512" fill="#5865f2"><path d="M524.5 69.8a1.5 1.5 0 0 0 -.8-.7A485.1 485.1 0 0 0 404.1 32a1.8 1.8 0 0 0 -1.9 .9 337.5 337.5 0 0 0 -14.9 30.6 447.8 447.8 0 0 0 -134.4 0 309.5 309.5 0 0 0 -15.1-30.6 1.9 1.9 0 0 0 -1.9-.9A483.7 483.7 0 0 0 116.1 69.1a1.7 1.7 0 0 0 -.8 .7C39.1 183.7 18.2 294.7 28.4 404.4a2 2 0 0 0 .8 1.4A487.7 487.7 0 0 0 176 479.9a1.9 1.9 0 0 0 2.1-.7A348.2 348.2 0 0 0 208.1 430.4a1.9 1.9 0 0 0 -1-2.6 321.2 321.2 0 0 1 -45.9-21.9 1.9 1.9 0 0 1 -.2-3.1c3.1-2.3 6.2-4.7 9.1-7.1a1.8 1.8 0 0 1 1.9-.3c96.2 43.9 200.4 43.9 295.5 0a1.8 1.8 0 0 1 1.9 .2c2.9 2.4 6 4.9 9.1 7.2a1.9 1.9 0 0 1 -.2 3.1 301.4 301.4 0 0 1 -45.9 21.8 1.9 1.9 0 0 0 -1 2.6 391.1 391.1 0 0 0 30 48.8 1.9 1.9 0 0 0 2.1 .7A486 486 0 0 0 610.7 405.7a1.9 1.9 0 0 0 .8-1.4C623.7 277.6 590.9 167.5 524.5 69.8zM222.5 337.6c-29 0-52.8-26.6-52.8-59.2S193.1 219.1 222.5 219.1c29.7 0 53.3 26.8 52.8 59.2C275.3 311 251.9 337.6 222.5 337.6zm195.4 0c-29 0-52.8-26.6-52.8-59.2S388.4 219.1 417.9 219.1c29.7 0 53.3 26.8 52.8 59.2C470.7 311 447.5 337.6 417.9 337.6z"></path></svg>
                  </a>
                  {/* Twitter */}
                  <a href="https://x.com/mztwarriors" target="_blank" rel="noopener noreferrer" style={{display:'flex', alignItems:'center', justifyContent: 'center', color:'#6d79ff'}}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="30" fill="#5865f2"><path d="M453.2 112L523.8 112L369.6 288.2L551 528L409 528L297.7 382.6L170.5 528L99.8 528L264.7 339.5L90.8 112L236.4 112L336.9 244.9L453.2 112zM428.4 485.8L467.5 485.8L215.1 152L173.1 152L428.4 485.8z"/></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="l-rightCol" style={{ padding: '2em' }}>
            {/* Image Fader or Minted NFT */}
            {mintedNftImageUri ? (
              <div className='u-animated -pulse' style={{ textAlign: 'center', marginBottom: '20px', border: '2px solid #aeffa2', padding:'1em 1.5em', borderRadius:'4px' }}>
                <h3 style={{color: 'white', marginBottom:'12px'}}>Your New MZT Warrior!</h3>
                <Image
                  src={mintedNftImageUri}
                  alt="Newly Minted NFT"
                  width={420} // Adjust size as needed
                  height={420} // Adjust size as needed
                  style={{ borderRadius: '8px' }}
                  className="u-animated -fadeIn"
                  // Add onError to handle cases where the image URI is valid but image fails to load
                  onError={(e) => {
                    console.error("Error loading minted NFT image:", mintedNftImageUri, e);
                    // Optionally set a fallback or revert to ImageFader
                    setMintedNftImageUri(null); // This would revert to ImageFader
                    // setError("Could not load your new NFT's image."); // Or show specific image load error
                  }}
                  priority // If this is the LCP element after mint, consider adding priority
                />
                {lastMintedNftAddress && (
                    <p style={{color: '#aaa', fontSize: '0.8em', marginTop: '10px'}}>
                        Mint Address: <a href={`https://solscan.io/token/${lastMintedNftAddress}?cluster=mainnet-beta`} target="_blank" rel="noopener noreferrer" style={{color: '#00ffff'}}>{lastMintedNftAddress.substring(0,4)}...{lastMintedNftAddress.substring(lastMintedNftAddress.length - 4)}</a>
                    </p>
                )}
              </div>
            ) : (
              <ImageFader images={faderImages} delay={3000} />
            )}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button>MINT COMING SOON</button>
            </div>
            {/* <MintButton/> */}
            
            {/* MINT BUTTON AND WALLET CONNECTION */}
            {/* {web3JsWalletPublicKey ? (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <WalletMultiButton />              
                <p style={{ marginBottom: '10px', color: 'white',  wordBreak: 'break-all', overflowWrap: 'anywhere'}}>
                  Connected: {web3JsWalletPublicKey.toBase58()}
                </p>
                {umi && candyMachine ? (
                  <div>
                    {(() => {
                      // Calculate items remaining. Both are bigints.
                      const totalItems = candyMachine.data.itemsAvailable; // e.g., 1111n
                      const itemsMinted = candyMachine.itemsRedeemed;     // e.g., 4n
                      const itemsRemaining = totalItems - itemsMinted;    // e.g., 1107n

                      // --- START: Logic to determine the price ---
                      let priceMintString = "N/A"; // Default if price can't be determined
                      if (candyMachine.candyGuard && 
                        candyMachine.candyGuard.guards &&
                        candyMachine.candyGuard.guards.solPayment &&
                        candyMachine.candyGuard.guards.solPayment.__option === 'Some') {
                          const solPaymentGuard = candyMachine.candyGuard.guards.solPayment.value;
                          // UMI's SolAmount stores lamports in basisPoints (bigint) and has decimals info
                          const lamportsBigInt = solPaymentGuard.lamports.basisPoints;
                          const decimals = solPaymentGuard.lamports.decimals; // Should be 9 for SOL
                          
                          // Convert bigint lamports to a numeric SOL value
                          // Ensure lamportsBigInt is not undefined before converting
                          if (typeof lamportsBigInt === 'bigint') {
                            const solAmount = Number(lamportsBigInt) / (10 ** decimals); 
                            
                            // Format to a few decimal places (e.g., 2 or 4). 0.25 SOL is common.
                            priceMintString = `${solAmount.toFixed(2)} SOL`; 
                          } else {
                            console.warn("solPayment lamports.basisPoints is not a bigint:", solPaymentGuard.lamports);
                            priceMintString = "Error fetching price";
                          }
                      } else {
                        console.log("solPayment guard not active or not found");
                        // You might want to set a specific message if no solPayment guard is found,
                        // e.g., "Free Mint (check other conditions)" or leave as "N/A"
                      }
                      // --- END: Logic to determine the price ---

                      return (
                        <>
                          <p style={{ color: 'white' }}>
                            Items Remaining: {itemsRemaining.toString()} / {totalItems.toString()}
                          </p>
                          <p style={{ color: 'white' }}>
                            Price: {priceMintString}
                          </p>
                        </>
                      );
                    })()}

                    <button
                      onClick={handleMint}
                      disabled={minting || !candyMachine.candyGuard || (candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed <= 0n)} // Disable if sold out
                      style={{
                        padding: '10px 20px',
                        backgroundColor: minting || !candyMachine.candyGuard ? '#808080' : '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: minting || !candyMachine.candyGuard ? 'not-allowed' : 'pointer',
                        fontSize: '16px',
                        marginTop: '10px',
                        marginBottom: '1em'
                      }}
                    >
                      {(() => {
                        const itemsRemaining = candyMachine.data.itemsAvailable - candyMachine.itemsRedeemed;
                        if (itemsRemaining <= 0n) {
                          return 'Sold Out';
                        }
                        if (minting) {
                          return 'Minting...';
                        }
                        if (!candyMachine.candyGuard) {
                          return 'Loading...';
                        }
                        if (minted) {
                          return 'Mint Another MZT Warrior!';
                        }
                        return 'Mint a Random MZT Warrior!';
                      })()}
                  </button>
                </div>
              ) : (
                <p style={{color: 'white'}}>Loading Mint Data...</p>
              )}
                {minted && <p style={{ color: 'green', marginTop: '10px' }}>Successfully minted! Check your wallet.<br/> Thank you for your support!</p>}
                {error && <p style={{ color: 'red', marginTop: '10px', maxWidth: '400px', margin: '10px auto' }}>{error}</p>}
              </div>
            ) : (
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <WalletMultiButton />
                <p style={{ color: 'white', marginTop: '10px' }}>Connect your Solana wallet to mint a Warrior.</p>
              </div>
            )} */}
            
            <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
              <Image src="/img/solanaLogo.png" alt="Solana Network" width={100} height={15} />
            </div>
          </div>
        </main>
        <video width="100%" height="auto" autoPlay muted playsInline loop>
          <source src="/video/starry-night-bg-wide.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <LoreContent/>
    </div>
  )
}
