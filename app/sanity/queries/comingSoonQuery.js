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
