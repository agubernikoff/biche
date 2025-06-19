export const COMING_SOON_QUERY = `*[_type == "comingSoon"][0]{
  heroTitle,
  introText,
  launchMessage,
  quote,
  author,
  "leftImage": leftImage.asset->{url},
  "rightImage": rightImage.asset->{url},
  "logo": logo.asset->{url},
  "founderImage": founderImage.asset->{url},
  "monogramImage": monogramImage.asset->{url}
}`;

export const HOME_QUERY = `*[_type == "home"][0]{
  hero{
    leftImage{...,asset->{url}},
    rightImage{...,asset->{url}},
    logo{...,asset->{url}}
  },
  firstSection{..., mainImage{...,asset->{url}}, secondaryImage{...,asset->{url}},},
  ourStandards{...,cards[]{...,image{...,asset->{url}}}},
  bottomSection{...,bannerImage{...,asset->{url}}}
}`;

export const MONOGRAM_AND_FOOTER_QUERY = `*[_type == "settings"][0]{
}`;

export const ABOUT_QUERY = `*[_type == "about"][0]{
  ...,
  hero{...,image{...,asset->{url}}},
  quoteAndImage{...,image{...,asset->{url}}},
  ourStandards{...,primaryImage{...,asset->{url}},squareImages[]{...,asset->{url}}},
  ourTeam{...,ourTeam[]{...,image{...,asset->{url}}}}
}`;
