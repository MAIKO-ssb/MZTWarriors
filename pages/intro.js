//pages/intro
import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import SignupForm from '../react-components/sections/SignupForm/SignupForm'


export default function Intro() {

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
              <Image className='mzt-logo__img u-animated a-fadeIn' width="1490" height="1490" src="/img/mzt-logo.png" alt="MZT Warriors Logo" />
              <div style={{color: "white",textAlign:"center", padding: "1.5em 0"}}>
                <h1>Manzanita Tribe Warriors</h1>
                {/* Lead a tribe of fierce Manzanitas in the digital lands of MZT Warriors.  */}
                <p style={{maxWidth: "540px", margin: "0 auto"}}> Discover the universe of the MZT Warriors.<br/>
                Explore mystical forests, raid high-risk dungeons, and gain powerful loot!<span style={{color:"red"}}>*</span></p>
                <br/>
                <small style={{fontSize:".85em", display:"block", padding: "1em"}}><span style={{color:"red"}}>*</span>Project -(Platformer Web Game)- currently under development. <br/> Mint supports the continued development of the MZT universe.</small>
              </div>
            </div>
          </div>
          {/* MC */}
          {/* <SignupForm/> */}
        </main>
        <video width="100%" height="auto" autoPlay muted playsInline loop>
          <source src="/video/starry-night-bg-wide.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      
    </div>
  )
}
