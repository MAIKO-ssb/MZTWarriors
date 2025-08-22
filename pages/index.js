//pages/intro
import { useState, useEffect, useCallback, useMemo } from 'react';

// Import Wallet Stuff
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

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
                <em style={{fontWeight:'bold', marginTop: '0px', color:'#092e4d'}}>I can only promise you pixels.</em> 
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
            {/* <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button>MINT COMING SOON</button>
            </div> */}
            <MintButton
              onMintStart={handleMintStart}
              onMintSuccess={handleMintSuccess}
              onMintError={handleMintError}
            />
            {/* Displaying minting status and errors here */}
            <div style={{ textAlign: 'center', marginTop: '1em' }}>
                {minting && <p style={{ color: '#b8fff1ff' }}>Minting in progress...</p>}
                {error && <p style={{ color: '#ff8a8a' }}>Error: {error}</p>}
                {minted && <p style={{ color: '#aeffa2' }}>Mint Successful!🍎🔥🎉</p>}
            </div>
            
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
