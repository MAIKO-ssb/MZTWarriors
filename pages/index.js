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
            <div className='mzt-logo u-animated a-fadeIn'>
              <Image className='mzt-logo__img' width="1490" height="1490" src="/img/mzt-logo.png" alt="MZT Warriors Logo" />
              
            </div>
          </div>
          <div className='u-flex u-flex1'>
            <div>
              <h1>MZT Warrior Badge</h1>
              <p>Lorem Ipsum Dolor Sit Amet Consecetur...</p>
              <button>Mint a 'Warrior Badge'</button>
            </div>
          </div>
          
          {/* <div style={{position:"absolute", bottom: "0", display:"block", transform: "translateY(100px)"}}>
            <Image layout="intrinsic" width="1920" height="340" src="/img/tribal-ground.svg" alt="" style={{display:"block"}}/>
          </div> */}
        </main>
        <video width="100%" height="auto" autoPlay muted playsInline loop>
          <source src="/video/starry-night-bg.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
      
      
    </div>
  )
}
