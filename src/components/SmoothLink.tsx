"use client";

import Link from "next/link";

/**
 * A link that smooth-scrolls to an in-page anchor ("#…") when the target exists
 * (native fragment scrolling is unreliable under a fixed navbar), and uses
 * next/link for app routes. Usable from server components.
 */
export default function SmoothLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("#")) {
    const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      const el = document.getElementById(href.slice(1));
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", href);
      }
    };
    return (
      <a href={href} onClick={onClick} className={className}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
