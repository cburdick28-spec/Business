import './globals.css';

export const metadata = {
  title: 'Founder: A Startup Life Sim',
  description:
    'Build your company from a garage to a global empire, while your personal life hangs in the balance.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-base text-slate-100 antialiased">{children}</body>
    </html>
  );
}
