import { fetchFromContentful } from "../lib/fetchContentful.ts";

export async function getHomepageConfig() {
  const data = await fetchFromContentful("homepageConfig");
  const includes = data.includes || {};
  const item = data.items[0];
  
  if (!item) {
    throw new Error("Homepage configuration entry not found in CMS");
  }

  const fields = item.fields;
  let hero_image_url = undefined;
  
  if (fields.heroImage && fields.heroImage.sys && includes.Asset) {
    const matchedAsset = includes.Asset.find((a: any) => a.sys.id === fields.heroImage.sys.id);
    if (matchedAsset && matchedAsset.fields && matchedAsset.fields.file) {
      hero_image_url = matchedAsset.fields.file.url;
      if (hero_image_url && !hero_image_url.startsWith("http")) {
        hero_image_url = `https:${hero_image_url}`;
      }
    }
  } else if (typeof fields.heroImageUrl === "string") {
    hero_image_url = fields.heroImageUrl;
  }

  return {
    curatorName: fields.curatorName || "",
    curatorTitle: fields.curatorTitle || "",
    curatorBio: fields.curatorBio || "",
    heroImageUrl: hero_image_url || "",
    scriptoriumTitle: fields.scriptoriumTitle || "",
    scriptoriumSubtitle: fields.scriptoriumSubtitle || "",
    scriptoriumDescription: fields.scriptoriumDescription || "",
    scriptoriumAuthor: fields.scriptoriumAuthor || "",
    reviewsTitle: fields.reviewsTitle || "",
    reviewsSubtitle: fields.reviewsSubtitle || "",
    reviewsDescription: fields.reviewsDescription || "",
    reviewsQuote: fields.reviewsQuote || "",
    discoveryTitle: fields.discoveryTitle || fields.discovery_title || "",
    discoveryDescription: fields.discoveryDescription || fields.discovery_description || "",
    bottomShelfTitle: fields.bottomShelfTitle || fields.bottom_shelf_title || "",
    bottomShelfDescription: fields.bottomShelfDescription || fields.bottom_shelf_description || "",
    topPicksTitle: fields.topPicksTitle || fields.top_picks_title || "",
    topPicksDescription: fields.topPicksDescription || fields.top_picks_description || "",
    blogTitle: fields.blogTitle || fields.blog_title || "",
    blogSubtitle: fields.blogSubtitle || fields.blog_subtitle || "",
    blogDescription: fields.blogDescription || fields.blog_description || "",
    rankingsTitle: fields.rankingsTitle || fields.rankings_title || "",
    rankingsSubtitle: fields.rankingsSubtitle || fields.rankings_subtitle || "",
    rankingsDescription: fields.rankingsDescription || fields.rankings_description || ""
  };
}

export async function getFooterConfig() {
  const data = await fetchFromContentful("footerConfig");
  const includes = data.includes || {};
  const item = data.items[0];

  if (!item) {
    throw new Error("Footer configuration entry not found in CMS");
  }

  const fields = item.fields;
  let brand_logo_url = "";

  if (fields.footerLogoImage && fields.footerLogoImage.sys && includes.Asset) {
    const matchedAsset = includes.Asset.find((a: any) => a.sys.id === fields.footerLogoImage.sys.id);
    if (matchedAsset && matchedAsset.fields && matchedAsset.fields.file) {
      brand_logo_url = matchedAsset.fields.file.url;
      if (brand_logo_url && !brand_logo_url.startsWith("http")) {
        brand_logo_url = `https:${brand_logo_url}`;
      }
    }
  } else if (typeof fields.footerLogoUrl === "string") {
    brand_logo_url = fields.footerLogoUrl;
  }

  let parsedSocial = [];
  if (fields.socialLinksJson) {
    try {
      parsedSocial = JSON.parse(fields.socialLinksJson);
    } catch (_) {
      // ignore
    }
  }

  let parsedCustom = [];
  if (fields.customLinksJson) {
    try {
      parsedCustom = JSON.parse(fields.customLinksJson);
    } catch (_) {
      // ignore
    }
  }

  return {
    footerLogoText: fields.footerLogoText || "",
    footerDescription: fields.footerDescription || "",
    footerLogoUrl: brand_logo_url || "",
    footerFollowLabel: fields.footerFollowLabel || "",
    footerFollowUrl: fields.footerFollowUrl || "",
    socialLinks: parsedSocial,
    customLinks: parsedCustom
  };
}
