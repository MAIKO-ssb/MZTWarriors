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
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
