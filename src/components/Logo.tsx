import type { SVGProps } from 'react';
import Image from 'next/image';

export function Logo(props: { className?: string }) {
  return (
    <Image src="/logo.png" alt="Artecasa Logo" width={120} height={30} priority {...props} />
  );
}
