import './globals.css';

export const metadata = {
  title: '📌 Pinboard',
  description: 'Notes app offline dengan sticky notes dan pin',
  manifest: '/manifest.json',
  themeColor: '#c94a3a',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pinboard',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#c94a3a" />
      </head>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

// Komponen client buat register service worker
function ServiceWorkerRegister() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
              navigator.serviceWorker.register('/sw.js')
                .then(function(reg) {
                  console.log('SW registered:', reg.scope);
                })
                .catch(function(err) {
                  console.log('SW registration failed:', err);
                });
            });
          }
        `,
      }}
    />
  );
}