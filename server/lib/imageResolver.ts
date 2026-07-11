export function resolveCoverUrl(fields: any, includes: any): string | undefined {
  if (!fields) return undefined;

  let cover_url: string | undefined = undefined;

  // Try parsing fields.coverImage first which can be a link to an Asset
  if (fields.coverImage && includes && includes.Asset) {
    const coverImageObj = Array.isArray(fields.coverImage) ? fields.coverImage[0] : fields.coverImage;
    if (coverImageObj && coverImageObj.sys) {
      const assetId = coverImageObj.sys.id;
      const matchedAsset = includes.Asset.find((a: any) => a.sys.id === assetId);
      if (matchedAsset && matchedAsset.fields && matchedAsset.fields.file) {
        cover_url = matchedAsset.fields.file.url;
        if (cover_url && !cover_url.startsWith("http")) {
          cover_url = `https:${cover_url}`;
        }
      }
    }
  }

  // Fallback to fields.image
  if (!cover_url && fields.image && includes && includes.Asset) {
    const imageObj = Array.isArray(fields.image) ? fields.image[0] : fields.image;
    if (imageObj && imageObj.sys) {
      const assetId = imageObj.sys.id;
      const matchedAsset = includes.Asset.find((a: any) => a.sys.id === assetId);
      if (matchedAsset && matchedAsset.fields && matchedAsset.fields.file) {
        cover_url = matchedAsset.fields.file.url;
        if (cover_url && !cover_url.startsWith("http")) {
          cover_url = `https:${cover_url}`;
        }
      }
    }
  }

  // Fallback to fields.imageUrl
  if (!cover_url && fields.imageUrl && includes && includes.Asset) {
    let assetId = undefined;
    if (Array.isArray(fields.imageUrl) && fields.imageUrl[0] && fields.imageUrl[0].sys) {
      assetId = fields.imageUrl[0].sys.id;
    } else if (fields.imageUrl.sys) {
      assetId = fields.imageUrl.sys.id;
    }
    
    if (assetId) {
      const asset = includes.Asset.find((a: any) => a.sys.id === assetId);
      if (asset && asset.fields && asset.fields.file) {
        cover_url = asset.fields.file.url;
        if (cover_url && !cover_url.startsWith("http")) {
          cover_url = `https:${cover_url}`;
        }
      }
    }
  }

  // Fallback to direct string properties
  if (!cover_url && typeof fields.coverUrl === "string") {
    cover_url = fields.coverUrl;
  }
  if (!cover_url && typeof fields.cover_url === "string") {
    cover_url = fields.cover_url;
  }
  if (!cover_url && typeof fields.imageUrl === "string") {
    cover_url = fields.imageUrl;
  }
  if (!cover_url && typeof fields.image_url === "string") {
    cover_url = fields.image_url;
  }

  return cover_url;
}
