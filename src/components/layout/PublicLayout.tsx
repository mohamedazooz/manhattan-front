import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingWhatsAppButton } from '../common/FloatingWhatsAppButton';

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden w-full max-w-full">
      <Navbar />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </main>
      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
