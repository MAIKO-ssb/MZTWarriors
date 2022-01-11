import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'


export default function Home() {

  const [contentView, setContentView] = useState('mint')

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
              <Image className='mzt-logo__img u-animated a-fadeIn' width="1490" height="1490" src="/img/mzt-logo.png" alt="MZT Warriors Logo" />
            </div>
          </div>
          <div className='u-flex u-flex1' style={{padding: "1.5em", flexDirection:"column", minHeight: "740px", width:"100%"}}>
            <div className='c-menu'>
              <ul className='u-list-unstyled'>
                <li>
                  <span className={`${contentView == 'mint' ? '-active': ''}`} onClick={() => setContentView('mint')}>
                    Mint Badge 
                  </span>
                </li>
                <li>
                  <span className={`${contentView == 'bios' ? '-active': ''}`} onClick={() => setContentView('bios')}>
                    The Team 
                  </span>
                </li>
                <li>
                  <span className={`${contentView == 'contact' ? '-active': ''}`} onClick={() => setContentView('contact')}>
                    Contact
                  </span>
                </li>
              </ul>
            </div>
            <div style={{maxWidth:"650px"}}>
              { 
                contentView == 'mint' ?
                <>
                  <h1>The MZT Warrior Badge (2022)</h1>
                  <p>
                    We are the Manzanita Tribe Warriors ᴹᶻᵀ, a small esports team based out of Southern California. 
                  </p>
                  <p> 
                    We have competed in `Super Smash Bros. Ultimate` for a few years and would like to continue our journey as a competitive team, pushing our limits this 2022🔥! 
                  </p>
                  <p>
                    As a team fundraising effort, we are starting off the year by dropping 1000 limited edition digital `Warrior Badges` priced at .1 solana each
                  </p>
                  <p>
                    The MZT Warriors would like to give special thanks to the smash bros. gaming community and everyone that follows and supports us.
                  </p>
                  
                  
                  <button>Mint a `Warrior Badge`*</button>
                  <br/>
                  <h3>1,000 / 1,000 available</h3>
                  <h4>Price: .1 sol</h4>
                  <br/>
                  <small>
                    * Your support of .1 sol goes directly to our team`s wallet, which helps fund our costs such as team equipment, player wages, event entries, transportation, hotel, food, etc. 
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
                </>
                  
                : contentView == 'bios' ?
                  <>
                    <h1>About the Team</h1>
                    <div className='mzt-bio u-flex'>
                      <div className='mzt-bio__imgWrap'>
                        <Image className='mzt-bio__img' width="150" height="150" src="/img/pfpMaiko.jpg" alt="MAIKO Profile Picture" />
                      </div>
                      <div className='mzt-bio__content'>
                        <h2>&lt;MAIKO/&gt;</h2>
                        <em>Founder</em>
                        <p>
                          Yoshi Main
                        </p>
                        <p>
                          Twitter: &nbsp;
                          <a href="https://twitter.com/maiko_ssb" target="_blank" rel="noreferrer" alt="Twitter Link">@maiko_ssb</a>
                        </p>
                      </div>
                    </div>
                    <div className='mzt-bio u-flex'>
                      <div className='mzt-bio__imgWrap'>
                        <Image className='mzt-bio__img' width="150" height="150" src="/img/pfpSin.png" alt="Sin Profile Picture" />
                      </div>
                      <div className='mzt-bio__content'>
                        <h2>Sin</h2>
                        <em>Co-Founder</em>
                        <p>
                          Jigglypuff Main
                        </p>
                        <p>
                          Twitter: &nbsp;
                          <a href="https://twitter.com/Sin_Puff" target="_blank" rel="noreferrer" alt="Twitter Link">@sin_puff</a>
                        </p>
                      </div>
                    </div>
                    <div className='mzt-bio u-flex'>
                      <div className='mzt-bio__imgWrap'>
                        <Image className='mzt-bio__img' width="150" height="150" src="/img/pfpTai.jpg" alt="Tai Profile Picture" />
                      </div>
                      <div className='mzt-bio__content'>
                        <h2>Tai</h2>
                        <em>Co-Founder</em>
                        <p>
                          Link Main
                        </p>
                        <p>
                          Twitter: &nbsp;
                          <a href="https://twitter.com/ssbtai" target="_blank" rel="noreferrer" alt="Twitter Link">@ssbtai</a>
                        </p>
                      </div>
                    </div>
                  </>
                : contentView == 'contact' ?
                  <>
                    <h1>Contact Us</h1>
                    <p>
                      Email: &nbsp; 
                      <a href="mailto:mztwarriors@gmail.com" target="_blank" rel="noreferrer">MZTWarriors@gmail.com</a>
                    </p>
                    <p>
                      Twitter: &nbsp;
                      <a href="https://twitter.com/mzt_warriors" target="_blank" rel="noreferrer" alt="Twitter Link">@MZT_Warriors</a>
                    </p>
                    <p>
                      Twitch: &nbsp;
                      <a href="https://twitch.com/mztwarriors" target="_blank" rel="noreferrer" alt="Twitch Link">@MZTWarriors</a>
                    </p>
                    <p>
                      Instagram: &nbsp;
                      <a href="https://www.instagram.com/mztwarriors/" target="_blank" rel="noreferrer" alt="Instagram Link">@MZTWarriors</a>
                    </p>
                    <p>
                      Solana Wallet: &nbsp; 
                      🍎🔥.sol
                    </p>
                  </>
                : null
              }
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
