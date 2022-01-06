import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  return (
    <div>
      <Head>
        <title>Manzanita Tribe</title>
        <meta name="description" content="Manzanita Tribe" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      
      <div className='s-hero'>
        <main>
          {/* MAIN CONTENT */}
          <div className='u-flex u-flex1'>
            <div className='mzt-logo'>
              <Image className='mzt-logo__img u-animated a-fadeIn' width="1490" height="1490" src="/img/mzt-logo.png" alt="MZT Warriors Logo" />
            </div>
          </div>
          <div className='u-flex u-flex1' style={{padding: "1.5em"}}>
            <div style={{maxWidth:"650px"}}>
              <h1>The MZT Warrior Badge (2022)</h1>
              <p>
                The `Manzanita Tribe Warriors` is a small esports team located in Southern California. We compete in `Super Smash Bros. Ultimate` and want to continue our journey as a team, pushing our limits this 2022🔥! 
              </p>
              <p>As a team fundraising effort, we are dropping a collection of 1000 digital `Warrior Badges` priced at .1 solana each.</p>
              <p>
                We`d like to give special thanks to all of the competitive smash bros. community and everyone that follows us, the Manzanita Tribe Warriors ᴹᶻᵀ.
              </p>
              
              
              <button>Mint a `Warrior Badge`*</button>
              <br/>
              <h3>1,000 / 1,000 available</h3>
              <h4>Price: .1 sol</h4>
              <br/>
              <small>
                * Your support of .1 sol goes directly to our team`s wallet, which helps fund our costs such as team equipment, player wages, event entries, transportation, hotel, food, etc. 
                All re-sales include a 10% royalty fee that directly supports the team.
                This team badge serves as a representation of your support.   
                Thank you.
              </small>
              <br/>
              <div style={{marginTop:"1em"}}>
                <h4> 
                  Our next competition:
                </h4>
                <p>
                  1/28 - San Jose, CA - Major Event - <a href="https://smash.gg/tournament/genesis-8/details">Genesis 8</a> 
                </p>
              </div>
            </div>
          </div>
          
          {/* <div style={{position:"absolute", bottom: "0", display:"block", transform: "translateY(100px)"}}>
            <Image layout="intrinsic" width="1920" height="340" src="/img/tribal-ground.svg" alt="" style={{display:"block"}}/>
          </div> */}
        </main>
        <video width="100%" height="auto" autoPlay muted playsInline loop>
          <source src="/video/starry-night-bg-wide.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      
    </div>
  )
}
