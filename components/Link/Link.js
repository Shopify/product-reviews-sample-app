import React from "react";
import { default as NextLink } from "next/link";

/**
 * The component ensures that we use the NextLink to handle all
 * internal routing
 * See https://nextjs.org/docs/api-reference/next/link for more details
 */
export const Link = ({ children, external, url, ...rest }) => {
  const mailto = url.startsWith("mailto:");

  if (external || mailto) {
    const target = external ? "_blank" : "_top";
    const rel = external ? "noopener noreferrer" : undefined;

    return (
      <a target={target} href={url} rel={rel} {...rest}>
        {children}
      </a>
    );
  }

  return (
    <NextLink href={url}>
      <a {...rest}>{children}</a>
    </NextLink>
  );
};
