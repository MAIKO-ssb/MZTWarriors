import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'


export default function Home() {

  const [contentView, setContentView] = useState('mint')

  return (
    <div>
      <Head>
        <title>Manzanita Tribe Warriors - Smash Bros. Local Socal Esports Team</title>
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
          <div className='u-flex u-flex1' style={{padding: "1.5em", flexDirection:"column", minHeight: "795px", width:"100%"}}>
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
                    We are the Manzanita Tribe Warriors ᴹᶻᵀ, a local esports team based out of Southern California. 
                  </p>
                  <p> 
                    We have competed in `Super Smash Bros. Ultimate` since the beginning &amp; would like to continue our journey as a competitive team, pushing our limits this 2022!🔥 
                  </p>
                  <p>
                    As a team fundraising effort, we are starting off the year by dropping 1,111 limited edition digital `Warrior Badges` priced at .1 solana each. 
                  </p>
                  <p>
                    The MZT Warriors would like to give special thanks to the smash bros. gaming community &amp; everyone that follows and supports us!
                  </p>
                  
                  
                  {/* <button>Mint a `Warrior Badge`*</button> */}
                  <button>
                    <span>Mint 🔜 Join</span> 
                    <a href="https://discordapp.com/channels/596954512661413890/934588025294438400" rel="noreferrer" target="_blank" icon="discord" style={{width:"25px", marginLeft:".25em", position: 'relative', top:"3px", display: "inline-block", height:"100%"}}>
                      <svg style={{maxWidth: "25px"}} aria-hidden="true" focusable="false" data-prefix="fab" data-icon="discord" className="svg-inline--fa fa-discord fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                        <path fill="#5865F2" d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                      </svg>
                    </a>
                  </button>
                  <small>Powered by <a href="https://solana.com/" target="_blank" rel="noreferrer">Solana</a>.</small>
                  <br/>
                  <h3>Max Supply: 1,111</h3>
                  <h4>Price: .1 sol</h4>
                  <small>(Whitelist Only)</small>
                  <br/>
                  <small>
                    * Your support of .1 sol goes directly to our team`s wallet, which helps fund our costs such as team equipment, player wages, event entries, transportation, hotel, food, etc. 
                    This token (minted in the Solana blockchain) serves as a representation of your support. Thank you.
                  </small>
                  <br/>
                  <div style={{marginTop:"1em"}}>
                    <h4> 
                      Our next competition:
                    </h4>
                    <p>
                      2/12: <a href="https://smash.gg/tournament/ascension-stroder-beloved/details">Ascension</a>, Phoenix, AZ.
                      <br/>
                      4/15 - 4/17: <a href="https://smash.gg/tournament/genesis-8/details">Genesis 8</a>, San Jose, CA.
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
                      <a href="https://twitter.com/mztwarriors" target="_blank" rel="noreferrer" alt="Twitter Link">@MZTWarriors</a>
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
                    
                    <p name="discordIcon" style={{marginTop: "25px",display:"flex", alignItems:"center"}}>
                      <a href="https://discordapp.com/channels/596954512661413890/934588025294438400" rel="noreferrer" target="_blank" icon="discord" style={{width:"100%", marginLeft:".25em", position: 'relative', top:"3px", display: "inline-block", height:"100%"}}>
                        <svg style={{maxWidth: "25px", top: "3px", position:'relative', left: "-2px"}} aria-hidden="true" focusable="false" data-prefix="fab" data-icon="discord" className="svg-inline--fa fa-discord fa-w-20" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512">
                          <path fill="#5865F2" d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                        </svg>
                        &nbsp;Join our Discord Community
                      </a>
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
