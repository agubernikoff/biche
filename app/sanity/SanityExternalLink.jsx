import React from "react";

function SanityExternalLink({ value, children }) {
  return (
    <a href={value.url} rel="noopener noreferrer" target="_blank">
      {children[0]}
    </a>
  );
}

export default SanityExternalLink;
