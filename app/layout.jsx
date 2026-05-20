export const metadata = {
  title: 'Finance AI Agent',
  description: 'AI-powered finance assistant with stock prices, currency conversion, and more',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, sans-serif', background: '#0f1117' }}>
        {children}
      </body>
    </html>
  )
}
