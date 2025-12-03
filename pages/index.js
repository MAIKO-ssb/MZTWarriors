//pages/intro
import { useState, useEffect, useCallback, useMemo } from 'react';

// Import Wallet Stuff
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

// Next.js UI
import Head from 'next/head';
import Image from 'next/image';
import dynamic from 'next/dynamic'; // <--- 1. IMPORT dynamic

// Component UI
import ImageFader from '../react-components/components/ImageFader';
import HelloBar from '../react-components/components/HelloBar';
import LoreContent from '../react-components/components/LoreContent';
//import MintButton from '../react-components/components/MintButton';
import SocialMedia from '../react-components/sections/SocialMedia/SocialMedia';
import Footer from '../react-components/sections/Footer/Footer';

// 3. DYNAMIC IMPORT: This tells Next.js to render MintButton ONLY in the browser (client-side)
const DynamicMintButton = dynamic(() => import('../react-components/components/MintButton'), {
  ssr: false, // <-- THE CRUCIAL SETTING
  loading: () => (
    <div style={{ textAlign: 'center', color: 'white', marginTop: '10px' }}>
      Loading Wallet Interface...
    </div>
  ),
});

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
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const [mintedNftImageUri, setMintedNftImageUri] = useState(null);
  const [lastMintedNftAddress, setLastMintedNftAddress] = useState(null);
  const [error, setError] = useState(null);

  // 2. Define callback functions to pass to the MintButton component
  const handleMintStart = () => {
    setMinting(true);
    setMinted(false);
    setError(null);
    setMintedNftImageUri(null); // Clear previous image on new attempt
  };

  const handleMintSuccess = (mintAddress, imageUrl) => {
    setMinting(false);
    setMinted(true);
    console.log("SUCCESS! Received in parent:", { mintAddress, imageUrl });
    setLastMintedNftAddress(mintAddress);
    setMintedNftImageUri(imageUrl);
  };

  const handleMintError = (errorMessage) => {
    setMinting(false);
    setMinted(false);
    setError(errorMessage);
  };

  // --- UI Rendering ---
  return (
    <div>
      <Head>
        <title>Manzanita Tribe Warriors - Building Original Indie Art & Lore! A Digital Collection in the Solana Network.</title>
        <meta name="description" content="Manzanita Tribe Warriors — Building Original Indie Art & Lore! A digital collection in the Solana network." />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <HelloBar/>
      <div className='s-hero'>
        <main>

          {/* LEFT COLUMN */}
          <div className='u-flex u-flex1 l-leftCol'>
            {/* ... Logo & Text ... */}
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

                <div style={{display: 'flex', justifyContent: 'center'}}>
                  <Image src="/img/solanaLogo.png" alt="Solana Network" width={100} height={15} />
                </div>
                
                <p className="mb-4" style={{fontSize:'.85em', color:"#ccc"}}>
                  <br/> This is a self-funded indie passion project by a solo creator. 
                  <br/> Every mint fuels the continued growth of the MZT Warriors universe. 
                  <br/>
                </p>
                <div style={{marginTop: '6px'}}>
                  <span style={{color:"red"}}>*</span>
                  <em style={{color:"#ff0203"}}>Not a financial investment.</em> 
                </div>
                <em style={{fontWeight:'bold', marginTop: '0px', color:'#092e4d'}}>I can only promise you pixels. <br/>Thank you for your support!</em> 
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="l-rightCol" style={{ padding: '3em' }}>
            {/* Lead a tribe of fierce Manzanitas in the digital lands of MZT Warriors.  */}
            <h2 className='text-center' style={{color: '#9affc6ff'}}>Claim one of the First Warriors of the <br/>Manzanita Forest!</h2>
            <p className="max-w-[540px] mx-auto mb-6 text-center leading-relaxed">
              <span>Mint now —<br/> ...and prepare to explore and conquer the wild depths of the forest! <span style={{color:'red'}}>*</span></span>
            </p>

            {/* Image Fader or Minted NFT */}
            {mintedNftImageUri ? (
              <div className='u-animated -pulse' style={{ textAlign: 'center', marginBottom: '20px', border: '2px solid #aeffa2', padding:'1em 1.5em', borderRadius:'4px' }}>
                <h3 style={{color: 'white', marginBottom:'12px'}}>Your New MZT Warrior!</h3>
                <Image
                  key={lastMintedNftAddress + (mintedNftImageUri || '')}  // Forcing Remount on mint
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
            {/* Mint Button */}
            <p className='text-center mt-4'>
              <strong className="block text-[1.125em] mb-[-5px] text-[#8dffbf]">
                LIVE MINTING NOW ON SOLANA
              </strong>
            </p>
            <p className="note-text text-center text-sm mt-4 italic text-[#23ff91] opacity-90 max-w-[420px] mx-auto">
              <span style={{color:'red'}}>*</span> The interactive Manzanita Forest demo is currently being crafted — your mint helps bring it to life.
            </p>
            <DynamicMintButton 
              onMintStart={handleMintStart}
              onMintSuccess={handleMintSuccess}
              onMintError={handleMintError}
            />
            {/* Displaying minting status and errors here */}
            <div style={{ textAlign: 'center', marginTop: '1em' }}>
                {minting && <p style={{ color: '#b8fff1ff' }}>Minting in progress...</p>}
                {error && <p style={{ color: '#ff8a8a' }}>Error: {error}</p>}
                {minted && <p style={{ color: '#aeffa2' }}>Mint Successful! Check your wallet. 🍎🔥🎉</p>}
            </div>
            
            {/* <div style={{display: 'flex', justifyContent: 'center', marginTop: '1em'}}>
              <Image src="/img/solanaLogo.png" alt="Solana Network" width={100} height={15} />
            </div> */}
          </div>
        </main>
        <video width="100%" height="auto" autoPlay muted playsInline loop>
          <source src="/video/starry-night-bg-wide.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      <LoreContent/>
      <SocialMedia />
      <Footer />
    </div>
  )
}
