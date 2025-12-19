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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-KC79NF52Y1" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KC79NF52Y1');
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
