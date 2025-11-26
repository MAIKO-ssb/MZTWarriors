import React from 'react';

export default function HelloBar() {
  const barStyle = {
    position: 'relative',
    zIndex: '222',
    backgroundColor: '#052e16', // bg-green-950
    color: '#ffffff', // text-white
    paddingTop: '1rem', // py-4
    paddingBottom: '1rem', // py-4
    paddingLeft: '1rem', // px-4
    paddingRight: '1rem', // px-4
    textAlign: 'center',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', // shadow-lg
    background: 'url("/img/bg-forest-pattern.png") repeat-x top/contain',
    borderBottom: '2px solid #0e2c1c'
  };

  const containerStyle = {
    maxWidth: '80rem', // max-w-7xl
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const mainHeadlineStyle = {
    fontSize: '1.45rem', // text-lg
    fontWeight: '700', // font-bold
    letterSpacing: '0.025em', // tracking-wide
    marginBottom: '0.75rem', // mb-2
  };

  const subHeadlineStyle = {
    fontSize: '0.875rem', // text-sm
    color: '#d1fae5', // text-green-200
    marginBottom: '0.75rem', // mb-3
  };
  
  const linksContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontSize: '0.875rem', // text-sm
    gap: '0.75rem', // Replaces space-x-3
  };

  const separatorStyle = {
    color: '#047857', // text-green-700
  };

  return (
    <div className='hello-bar' style={barStyle}>
      <div style={containerStyle}>
        <p style={mainHeadlineStyle} className="main-headline">
          Adventurer, Welcome to the Tribe!
        </p>
        <p style={subHeadlineStyle} className="sub-headline">
          Indie Creator Building Original Game Art, Code &amp; Lore on the Solana Network.
        </p>
        <div style={linksContainerStyle} className="links-container">
          <span className="cta-link">
            Join the Tribe
          </span>
          <span style={separatorStyle}>•</span>
          <span className="cta-link">
            Mint a Warrior
          </span>
          <span style={separatorStyle}>•</span>
          <span className="cta-link">
            Collect &amp; Trade
          </span>
        </div>
      </div>

      {/* This block handles the responsive and hover styles that inline styles cannot */}
      <style>{`
        .cta-link {
        //   transition: color 300ms;
          color: #8effbf;
        }
        // .cta-link:hover {
        //   color: #facc15; /* hover:text-yellow-400 */
        //   cursor: default;
        // }

        /* Mobile default: COVER */
        .hello-bar {
          background-size: cover !important;
          background-repeat: no-repeat;
        }
        
        /* md breakpoint (768px and up) */
        @media (min-width: 768px) {
          .hello-bar {
            background-size: contain !important;
            background-repeat: repeat-x;
          }
          .main-headline {
            font-size: 1.25rem; /* md:text-xl */
          }
          .sub-headline {
            font-size: 1rem; /* md:text-base */
          }
          .links-container {
            font-size: 1rem; /* md:text-base */
            gap: 1.25rem; /* md:space-x-5 */
          }
        }
      `}</style>
    </div>
  );
};
