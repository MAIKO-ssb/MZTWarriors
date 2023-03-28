import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'


export default function Home() {

  const [contentView, setContentView] = useState('mint')

  return (
    <div style={{background:"black"}}>
      <Head>
        <title>MZT Warriors</title>
        <meta name="description" content="We are the Manzanita Tribe Warriors" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      
      <div className='s-hero'>
        <main>
          {/* MAIN CONTENT */}
          <div className='u-flex u-flex1' style={{maxWidth: "70vh"}}>
            <div className='mzt-logo u-animated a-fadeIn'>
              <Image className='mzt-logo__img u-animated a-fadeIn' width="1490" height="1490" src="/img/mzt-logo.png" alt="MZT Warriors Logo" />
              <div style={{color: "white",textAlign:"center", padding: "1.5em 0"}}>
                <h1>MZT Warriors</h1>
                Lead a tribe of fierce Manzanitas in the digital lands of MZT Warriors.<br/> 
                Explore mystical forests, raid dangerous dungeons, and gain powerful loot!<span style={{color:"red"}}>*</span><br/>
                <small style={{fontSize:".85em", display:"block", padding: "1em"}}><span style={{color:"red"}}>*</span>Currently in development.</small>
              </div>
            </div>
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
