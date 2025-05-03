//pages/intro
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import ImageFader from '../react-components/components/ImageFader'

const faderImages = [
  '/img/nft-preview/272.png',
  '/img/nft-preview/474.png',
  '/img/nft-preview/602.png',
  '/img/nft-preview/624.png',
  '/img/nft-preview/692.png',
  '/img/nft-preview/705.png',
  '/img/nft-preview/825.png',
  '/img/nft-preview/920.png',
  '/img/nft-preview/984.png',
  '/img/nft-preview/1043.png',
]

export default function Intro() {

  const handleMint = () => {
    // Implement your minting logic here
    alert("Hold on to ya WALLET Buddy!.. Mint coming soon.");
  };
  //const [contentView, setContentView] = useState('mint')

  return (
    <div>
      <Head>
        <title>MZT Warriors</title>
        <meta name="description" content="We are the Manzanita Tribe Warriors" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      
      <div className='s-hero'>
        <main>
          {/* MAIN CONTENT */}
          <div className='u-flex u-flex1 l-leftCol'>
            <div className='mzt-logo u-animated a-fadeIn'>
              <div style={{display:'flex', justifyContent:'center'}}>
                <Image className='mzt-logo__img  u-animated a-fadeIn' width="1490" height="1490" src="/img/mzt-logo.png" alt="Manzanita Tribe Warriors Logo" />
              </div>
              <div style={{color: "white",textAlign:"center", padding: "1.5em 0"}}>
                <h1>Manzanita Tribe Warriors <br/><span style={{fontSize:'.5em', color:"#ffff00"}}><span style={{color:"#ff0000"}}>(</span>Digital Collectibles<span style={{color:"#ff0000"}}>)</span></span></h1>
                {/* Lead a tribe of fierce Manzanitas in the digital lands of MZT Warriors.  */}
                <p style={{maxWidth: "540px", margin: "0 auto"}}> 
                  {/* Discover the universe of the MZT Warriors.<br/> */}
                  {/* Explore mystical forests, raid high-risk dungeons, and gain powerful loot!<span style={{color:"red"}}>*</span> */}
                  Join the origin of an evolving digital adventure! <br />
                  Mint a warrior from the Manzanita Tribe — fierce protectors of a mysterious forest realm.
                </p>
                <br/>
                <p style={{display:'flex', padding: '1.5em', border: "1px solid red", fontSize:".75em", maxWidth: '350px', justifyContent:'center', margin: '0 auto 1em'}}>
                  INTERACTIVE DEMO COMING SOON <span style={{color:"red"}}>*</span>
                </p>
                <p style={{fontSize:'.85em'}}>
                <span style={{color:"red"}}>*</span>This is a self-funded indie project by a solo creator. <br/> Every mint directly fuels the continued growth of the MZT Warriors universe.
                </p>
              </div>
            </div>
          </div>
          {/* Image Fader */}
          <div className="l-rightCol" style={{ padding: '2em' }}>
            <ImageFader images={faderImages} delay={3000} />
            {/* MINT BUTTON HERE */}
            <button
              onClick={handleMint}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
                transition: 'background-color 0.3s ease',
                display: 'flex',
                justifySelf: 'center'
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#45a049')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#4CAF50')}
            >
              Mint Your Manzanita Warrior
            </button>
          </div>
        </main>
        <video width="100%" height="auto" autoPlay muted playsInline loop>
          <source src="/video/starry-night-bg-wide.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      
    </div>
  )
}
