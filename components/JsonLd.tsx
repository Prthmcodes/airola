import React from 'react';

// Renders schema.org JSON-LD. "<" is escaped so page text can never close the script tag early.
const JsonLd: React.FC<{ data: object }> = ({ data }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
);

export default JsonLd;
