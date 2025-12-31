"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ReactNode, MouseEvent } from "react";

interface SmoothScrollLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  href: string;
  children: ReactNode;
  className?: string;
}

export function SmoothScrollLink({ href, children, className, ...props }: SmoothScrollLinkProps) {
  const pathname = usePathname();
  const isHashLink = href.startsWith("#");
  const isSamePage = pathname === "/" && isHashLink;

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isSamePage) {
      e.preventDefault();
      const targetId = href.substring(1);
      const element = document.getElementById(targetId);
      if (element) {
        // Calculate offset for fixed header
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        
        // Update URL without causing a scroll
        window.history.pushState(null, "", href);
      }
    }
  };

  // For hash links on homepage, use anchor tag directly
  if (isSamePage) {
    return (
      <a href={href} className={className} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  }

  // For other links, use Next.js Link
  return (
    <Link href={href} className={className} {...props}>
      {children}
    </Link>
  );
}
