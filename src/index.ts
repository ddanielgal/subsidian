import dotenv from "dotenv";
import cheerio from "cheerio";
import TurndownService from "turndown";
import { z } from "zod";
import { promises as fs } from "fs";
import { setTimeout } from "timers/promises";

dotenv.config();

const Archive = z.array(
  z.object({
    title: z.string(),
    canonical_url: z.string().url(),
    slug: z.string(),
    post_date: z.string().datetime(),
    subtitle: z.string().nullable(),
    publication_id: z.number(),
  })
);

const newsletter = process.argv[2];

const api = new URL(newsletter);
api.pathname = "/api/v1/archive";

const limit = 40;
let offset = 0;

let fetchedArticles = [];
let articles: z.infer<typeof Archive> = [];

do {
  api.searchParams.set("limit", limit.toString());
  api.searchParams.set("offset", offset.toString());
  console.log(`🔎 Fetching ${api.href}`);
  const response = await fetch(api, {
    headers: { cookie: `connect.sid=${process.env.CONNECT_SID}` },
  });
  console.log(`📡 ${response.status} ${response.statusText}`);
  fetchedArticles = await response.json();
  articles.push(...Archive.parse(fetchedArticles));
  offset += limit;
} while (fetchedArticles.length);

console.log(`📜 Archive parsed, ${articles.length} articles found`);

const [firstArticle] = articles;

const publication = firstArticle.publication_id;

await fs.mkdir(publication.toString(), { recursive: true });

for (const article of articles) {
  const response = await fetch(article.canonical_url, {
    headers: { cookie: `connect.sid=${process.env.CONNECT_SID}` },
  });

  if (!response.ok) {
    console.warn(
      `❌ ${article.canonical_url} returned ${response.status}: ${response.statusText}`
    );
  }

  const content = await response.text();

  const $ = cheerio.load(content);

  // fix images
  const a = $("a");
  a.each((_, el) => {
    const $el = cheerio(el);
    if ($el.find("img").length) {
      const img = $el.find("img");
      $el.html($.html(img));
    }
  });

  const turndown = new TurndownService();

  // fix images again
  turndown.addRule("img", {
    filter: "img",
    replacement: function (_, node: any) {
      var alt = cleanAttribute(node.getAttribute("alt"));
      var src = node.getAttribute("src") || "";
      return src ? "![" + alt + "]" + "(" + src + ")" : "";
    },
  });

  function cleanAttribute(attribute: string) {
    return attribute ? attribute.replace(/(\n+\s*)+/g, "\n") : "";
  }

  const post = `
    <h1>${$("article > div.post-header > h1").html()}</h1>
    <h3>${$("article > div.post-header > h3").html()}</h3>
    ${$("div.body.markup").html()}
    `;

  const mdText = turndown.turndown(post);

  const obsidianText = mdText.replace(
    /\[([^\]]+)\]\(([^\)]+)\)/g,
    (_, linkText, link) => {
      let url: URL;
      try {
        url = new URL(link);
      } catch (error) {
        console.error(`Error parsing URL: ${error}`);
        return `[${linkText}](${link})`;
      }
      const linkedArticle = articles.find(
        (article) => url.pathname === `/p/${article.slug}`
      );
      if (linkedArticle) {
        return `[[${linkedArticle.slug}]]`;
      }
      return `[${linkText}](${url})`;
    }
  );

  const filename = `${publication}/${article.slug}.md`;
  await fs.writeFile(filename, obsidianText);
  console.log(`✅ ${filename}`);

  await setTimeout(2000); // avoid rate limiting
}
