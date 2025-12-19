import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function HelloBar() {
  const barStyle = {
    position: 'relative',
    zIndex: '222',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
    marginLeft: '2em',
    marginRight: '2em',
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
      <Image
        src="/img/flaming-manzanita-warrior-icon.png"
        alt="Flaming Warrior"
        width={70}
        height={70}
        className="hidden md:block"
        priority // Since it's above the fold
      />
      <div style={containerStyle}>
        <p style={mainHeadlineStyle} className="main-headline">
          Adventurer, Welcome to the Tribe!
        </p>
        <p style={subHeadlineStyle} className="sub-headline">
          Indie Creator Building an Original Web Game: Art, Code &amp; Lore on the Solana Network.
        </p>
        <div className="flex justify-center items-center gap-3 md:gap-8 text-sm md:text-base">
          <a
            href="https://discord.gg/3uXnWZEfgR" // ← Replace with your real invite
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8effbf] hover:text-yellow-400 transition-colors font-medium"
          >
            Join the Tribe
          </a>
          <span className="text-green-700">•</span>
          <a
            href="#mintSection"
            className="text-[#8effbf] hover:text-yellow-400 transition-colors font-medium"
          >
            Mint a Warrior
          </a>
          <span className="text-green-700">•</span>
          <a
            href="https://orbmarkets.io/token/3pCs14iq2azE7aWXuSmw7vgxia41pcHzm72RJX86zdc8" // ← Update after first mints
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#8effbf] hover:text-yellow-400 transition-colors font-medium"
          >
            View Collection
          </a>
        </div>
      </div>
      <Image
        src="/img/flaming-manzanita-warrior-icon.png"
        alt="Flaming Warrior"
        width={70}
        height={70}
        className="hidden md:block scale-x-[-1]"
        priority
      />

      {/* This block handles the responsive and hover styles that inline styles cannot */}
      <style>{`
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
        }
      `}</style>
    </div>
  );
};
