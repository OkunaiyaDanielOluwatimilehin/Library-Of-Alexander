import { Router } from "express";
import fs from "fs";
import path from "path";
import { fetchFromContentful } from "../lib/fetchContentful.js";

const router = Router();

router.get("/cms/status", (req, res) => {
  const spaceId = process.env.CONTENTFUL_SPACE_ID || process.env.VITE_CONTENTFUL_SPACE_ID;
  const accessToken = process.env.CONTENTFUL_ACCESS_TOKEN || process.env.VITE_CONTENTFUL_ACCESS_TOKEN;
  const envId = process.env.CONTENTFUL_ENVIRONMENT || process.env.VITE_CONTENTFUL_ENVIRONMENT || "master";

  res.json({
    configured: !!(spaceId && accessToken),
    spaceId: spaceId ? `${spaceId.substring(0, 4)}...${spaceId.slice(-3)}` : null,
    environment: envId,
    mode: "Contentful Environment Connection"
  });
});

router.get("/cms/blog", async (req, res) => {
  try {
    const data = await fetchFromContentful("blogPost");
    const includes = data.includes || {};
    const posts = (data.items || []).map((item: any) => {
      const fields = item.fields;
      let cover_url = undefined;

      // Try getting image from fields.imageUrl which can be an array of Assets or a single Asset/string
      if (fields.imageUrl && includes.Asset) {
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
            if (cover_url && !cover_url.startsWith("http")) cover_url = `https:${cover_url}`;
          }
        }
      }

      // Fallback to older fields.coverImage
      if (!cover_url && fields.coverImage && fields.coverImage.sys && includes.Asset) {
        const asset = includes.Asset.find((a: any) => a.sys.id === fields.coverImage.sys.id);
        if (asset && asset.fields && asset.fields.file) {
          cover_url = asset.fields.file.url;
          if (cover_url && !cover_url.startsWith("http")) cover_url = `https:${cover_url}`;
        }
      }

      // Fallback to simple string value
      if (!cover_url && typeof fields.imageUrl === "string") {
        cover_url = fields.imageUrl;
      }

      return {
        id: item.sys.id,
        title: fields.title || "",
        summary: fields.summary || fields.excerpt || "",
        content: fields.content || fields.body || "",
        category: Array.isArray(fields.category) ? fields.category[0] || "General" : fields.category || "General",
        author: fields.author || "Alexander",
        date: fields.date || new Date(item.sys.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
        readTime: fields.readTime || fields.read_time || "5 min read",
        imageUrl: cover_url || "https://images.unsplash.com/photo-1507842217343-583bb7270b66",
        isFeatured: fields.isFeatured === true || fields.featured === true
      };
    });
    res.json({ data: posts });
  } catch (err: any) {
    res.json({ data: [] });
  }
});

router.get("/cms/blog-info", (req, res) => {
  try {
    const filePath = path.join(process.cwd(), "blog-info.md");
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");
      let title = "";
      let subtitle = "";
      let description = "";
      const descLines: string[] = [];
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith("# ")) {
          title = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("## ")) {
          subtitle = trimmed.substring(3).trim();
        } else if (trimmed && !trimmed.startsWith("---") && !trimmed.startsWith("#")) {
          descLines.push(trimmed);
        }
      });
      description = descLines.join(" ");
      
      res.json({
        title: title || "MONEYRISE BRIEFINGS",
        subtitle: subtitle || "Knowledge & Research Archive",
        description: description || "Investigations, economic research papers, and stories curated directly from the Scriptorium."
      });
    } else {
      res.json({
        title: "MONEYRISE BRIEFINGS",
        subtitle: "Knowledge & Research Archive",
        description: "Investigations, economic research papers, and stories curated directly from the Scriptorium."
      });
    }
  } catch (err) {
    res.json({
      title: "MONEYRISE BRIEFINGS",
      subtitle: "Knowledge & Research Archive",
      description: "Investigations, economic research papers, and stories curated directly from the Scriptorium."
    });
  }
});

export default router;
