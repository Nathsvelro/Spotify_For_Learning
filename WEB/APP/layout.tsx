
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head />
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 24 }}>
        {children}
      </body>
    </html>
  );
}
