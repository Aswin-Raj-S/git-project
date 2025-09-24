import Link from 'next/link';
import { Logo } from '@/components/logo';

export function Header() {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg font-headline">ModelSherlock</span>
        </Link>
      </div>
    </header>
  );
}
