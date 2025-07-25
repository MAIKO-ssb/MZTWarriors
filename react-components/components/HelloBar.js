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
  };

  const containerStyle = {
    maxWidth: '80rem', // max-w-7xl
    marginLeft: 'auto',
    marginRight: 'auto',
  };

  const mainHeadlineStyle = {
    fontSize: '1.125rem', // text-lg
    fontWeight: '700', // font-bold
    letterSpacing: '0.025em', // tracking-wide
    marginBottom: '0.5rem', // mb-2
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
    <div style={barStyle}>
      <div style={containerStyle}>
        <p style={mainHeadlineStyle} className="main-headline">
          Manzanita Tribe Warriors — Building Original Indie Art &amp; Lore
        </p>
        <p style={subHeadlineStyle} className="sub-headline">
          Stickers, Prints &amp; Solana NFTs
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
      <style jsx>{`
        .cta-link {
        //   transition: color 300ms;
          color: #8effbf;
        }
        // .cta-link:hover {
        //   color: #facc15; /* hover:text-yellow-400 */
        //   cursor: default;
        // }
        
        /* md breakpoint (768px and up) */
        @media (min-width: 768px) {
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

// import React from 'react';

// export default function HelloBar() {
//   return (
//     <div className="relative bg-green-950 text-white py-4 px-4 text-center shadow-lg">
//       <div className="max-w-7xl mx-auto">
//         {/* Main headline */}
//         <p className="text-lg md:text-xl font-bold tracking-wide mb-2">
//           Manzanita Tribe Warriors — Building Original Indie Art &amp; Lore
//         </p>
//         {/* Sub-headline for products */}
//         <p className="text-sm md:text-base text-green-200 mb-3">
//           Stickers, Prints &amp; Solana NFTs
//         </p>
//         {/* Call to action links */}
//         <div className="flex justify-center items-center space-x-3 md:space-x-5 text-sm md:text-base">
//           <a disabled href="#join" className="hover:text-yellow-400 transition-colors duration-300">
//             Join the Tribe
//           </a>
//           <span className="text-green-700">•</span>
//           <a href="#mint" className="hover:text-yellow-400 transition-colors duration-300">
//             Mint a Warrior
//           </a>
//           <span className="text-green-700">•</span>
//           <a href="#collect" className="hover:text-yellow-400 transition-colors duration-300">
//             Collect &amp; Trade
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };