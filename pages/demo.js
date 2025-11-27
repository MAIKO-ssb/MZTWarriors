import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import dynamic from 'next/dynamic';

// Dynamically import PhaserGame with SSR disabled
const PhaserGame = dynamic(() => import('../react-components/sections/MZTGame/MZTGame'), { ssr: false });

export default function Home() {

  //const [contentView, setContentView] = useState('mint')

  return (
    <div>

      <Head>
        <title>MZT Warriors</title>
        <meta name="description" content="The Manzanita Forest Demo" />
        <link rel="icon" href="/favicon.ico" />
        {/* CRITICAL: This fixes zoom + bottom bar */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
        />

        {/* Safe area + body reset */}
        <style>{`
          html, body, #__next {
            margin: 0;
            padding: 0;
            overflow: hidden;
            height: 100%;
            background: black;
          }
          #mobile-controls {
            padding-bottom: max(20px, env(safe-area-inset-bottom)) !important;
          }
        `}</style>
      </Head>

      <div>
        <PhaserGame/>
      </div>
    </div>
  )
}
