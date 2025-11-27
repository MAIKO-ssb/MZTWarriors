import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Load Titillium Web font properly */}
        <link
          href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;1,700&display=swap"
          rel="stylesheet"
        />
        <meta name="solana:dapp" content="trusted" />
        <meta name="solana:dapp-name" content="Manzanita Tribe Warriors" />
        <meta name="solana:dapp-description" content="Indie Solana NFT mint for MZT Warriors. Candy Machine v3, 1111 pNFTs, 0.111 SOL ea." />
        <meta name="solana:dapp-icon" content="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
