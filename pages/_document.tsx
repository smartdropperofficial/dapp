import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
     return (
          <Html lang="en">
               <Head>
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" /> 
                    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />

                    <link rel="manifest" href="/site.webmanifest" />
                    <meta name="msapplication-TileColor" content="#da532c" />
                    <meta name="theme-color" content="#ffffff" />

                    <link rel="preconnect" href="https://fonts.googleapis.com" />
                    <link rel="preconnect" href="https://fonts.gstatic.com" />
                    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
               </Head>
               <body>
                    <Main />
                    <NextScript />
                    <div id="modal"></div>
                    <Script src="https://kit.fontawesome.com/400bd53359.js" strategy="lazyOnload" />

               </body>
          </Html>
     );
}
