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
  firstSection{...,introText[]{...,markDefs[]{...,"slug": coalesce(@.reference->store.slug.current, @.reference->slug.current),"type": @.reference->_type}},mainImage{...,link{...,"slug": coalesce(@.reference->store.slug.current, @.reference->slug.current),"type": @.reference->_type},image{...,asset->{url}}}, secondaryImage{...,link{...,"slug": coalesce(@.reference->store.slug.current, @.reference->slug.current),"type": @.reference->_type},image{...,asset->{url}}}},
  ourStandards{...,cards[]{...,link{...,"slug": coalesce(@.reference->store.slug.current, @.reference->slug.current),"type": @.reference->_type},image{...,asset->{url}}}},
  bottomSection{...,bannerImage{...,asset->{url}}}
}`;

export const MONOGRAM_AND_FOOTER_QUERY = `*[_type == "settings"][0]{
}`;

export const ABOUT_QUERY = `*[_type == "about"][0]{
  ...,
  hero{...,image{...,asset->{url}}},
  quoteAndImage{...,image{...,asset->{url}}},
  ourStandards{...,blurb[]{
      ...,
      markDefs[]{
        ...,
        _type == "linkInternal" => {
          "slug": @.reference->slug.current,
          "type": @.reference->_type
        }
      }
    },primaryImage{...,asset->{url}},squareImages[]{...,asset->{url}}},
  ourTeam{...,ourTeam[]{...,image{...,asset->{url}}}}
}`;

export const SANITY_PAGE_QUERY = `*[_type == "page" && slug.current == $slug][0]{
  ...,
  "slug": slug.current
}`;

export const SETTINGS_QUERY = `*[_type == "settings"][0]{
  ...,
  menu{
    ...,
    links[]{
      ...,
      reference->{
        _id,
        _type,
        title,
        "slug": slug.current,
      }
    }
  },
  pagesSideNav{
    ...,
    links[]{
      ...,
      reference->{
        _id,
        _type,
        title,
        "slug": slug.current,
      }
    }
  },
  footer{
    ...,
    linkColumns[]{
      ...,
      links[]{
        ...,
        reference->{
          _id,
          _type,
          title,
          "slug": slug.current,
        } 
      }
    }
  }
}`;
