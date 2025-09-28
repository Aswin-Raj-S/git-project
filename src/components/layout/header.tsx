import Link from 'next/link';
import { Logo } from '@/components/logo';

export function Header() {
  return (
    <header className="w-full border-b border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <Logo className="h-10 w-10 text-primary drop-shadow-sm" />
          <span className="font-bold text-2xl font-headline text-slate-900 tracking-tight">Cogniguard</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-1">
            <Link href="/" className="px-4 py-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-all font-medium">
              Home
            </Link>
            <Link href="/report" className="px-4 py-2 text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-all font-medium">
              Access Report
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
