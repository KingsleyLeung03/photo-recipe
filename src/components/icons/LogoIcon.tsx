import type { SVGProps } from 'react';

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    // Simple Chef Hat icon
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19.8 12.7c.1-.3.2-.6.2-1V8c0-2.2-1.8-4-4-4H8c-2.2 0-4 1.8-4 4v3.7c0 .4.1.7.2 1 .1.3.3.6.5.8.4.4.9.6 1.5.6h11.2c.6 0 1.1-.2 1.5-.6.2-.2.4-.5.5-.8zM8 17.5c0 .8.7 1.5 1.5 1.5h5c.8 0 1.5-.7 1.5-1.5V13H8v4.5z"/>
      <path d="M4.8 12.7c-.2.3-.3.6-.3 1v2.3c0 1.7 1.3 3 3 3h8.9c1.7 0 3-1.3 3-3V13.6c0-.4-.1-.7-.3-1"/>
    </svg>
  );
}
