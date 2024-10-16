import Head from 'next/head'
import Image from 'next/image'
import { useState } from 'react'
import dynamic from 'next/dynamic';

// Dynamically import PhaserGame with SSR disabled
const PhaserGame = dynamic(() => import('../react-components/sections/PhaserGame/PhaserGame'), { ssr: false });

export default function Home() {

  //const [contentView, setContentView] = useState('mint')

  return (
    <div>

      <Head>
        <title>MZT Warriors</title>
        <meta name="description" content="Stay Away! DO NOT ENTER" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        <PhaserGame/>
      </div>
    </div>
  )
}
