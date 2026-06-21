"use client";

import type { ComponentType, SVGProps } from "react";
import type { SocialLink } from "@/lib/settings";
import {
  InstagramIcon,
  YoutubeIcon,
  TiktokIcon,
  FacebookIcon,
  WhatsappIcon,
  TwitterIcon,
  MailIcon,
  PhoneIcon,
  GlobeIcon,
} from "./icons";

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

const ICONS: Record<string, Icon> = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  facebook: FacebookIcon,
  whatsapp: WhatsappIcon,
  twitter: TwitterIcon,
  email: MailIcon,
  phone: PhoneIcon,
  website: GlobeIcon,
  address: GlobeIcon,
};

function hrefFor(link: SocialLink): string {
  const v = link.value.trim();
  switch (link.type) {
    case "email":
      return `mailto:${v}`;
    case "phone":
      return `tel:${v}`;
    case "whatsapp":
      return v.startsWith("http") ? v : `https://wa.me/${v.replace(/\D/g, "")}`;
    default:
      return v.startsWith("http") ? v : `https://${v}`;
  }
}

/** Renders a row of social icon links from the saved social settings. */
export function SocialIconLinks({
  links,
  size = 16,
  className = "",
}: {
  links: SocialLink[];
  size?: number;
  className?: string;
}) {
  return (
    <>
      {links
        .filter((l) => l.value?.trim())
        .map((link, i) => {
          const Icon = ICONS[link.type] ?? GlobeIcon;
          return (
            <a
              key={`${link.type}-${i}`}
              href={hrefFor(link)}
              target={link.type === "email" || link.type === "phone" ? undefined : "_blank"}
              rel="noreferrer"
              aria-label={link.type}
              className={className}
            >
              <Icon width={size} height={size} />
            </a>
          );
        })}
    </>
  );
}
