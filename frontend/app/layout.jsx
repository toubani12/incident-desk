import '@fontsource/poppins/200.css';
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import './globals.css';
import Main from '@/main';
import App from '@/App';

export const metadata = {
  title: 'Incident Desk',
  description: 'Déclaration et suivi des incidents informatiques et de cybersécurité',
};

export const viewport = { themeColor: '#050505' };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Main>
          <App>{children}</App>
        </Main>
      </body>
    </html>
  );
}
