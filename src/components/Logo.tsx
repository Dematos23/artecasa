import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      aria-label="Artecasa Logo"
    >
      <g fill="currentColor">
        <path d="M10,90 L10,20 L50,10 L90,20 L90,90 L10,90 Z M30,90 L30,40 L70,40 L70,90 L30,90 Z" />
      </g>
    </svg>
  );
}
