import * as cheerio from "cheerio";
import { api } from "./api.js";
import { parseArticles } from "./parse-articles.js";
import { parsePdf } from "./parse-pdf.js";
import { parseProperties } from "./parse-properties.js";

export async function parseProductLang(url, lang) {
  const res = await api.get(url);
  const $ = cheerio.load(res.data);

  const container = $("div.dettaglio-famiglia");
  if (!container.length) {
    throw new Error(`dettaglio-famiglia not found [${lang}] ${url}`);
  }

  return {
    title: container.find("h1").first().text().trim(),
    description: container.find("h3").first().text().trim(),
    properties: parseProperties(container, $),
    articles: parseArticles(container, $),
    pdfs: parsePdf(container, $),
  };
}
