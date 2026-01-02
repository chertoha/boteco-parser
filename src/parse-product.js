import * as cheerio from "cheerio";
import { api } from "./api.js";
import { parseImages } from "./parse-images.js";
import { parseProperties } from "./parse-properties.js";
import { parsePdf } from "./parse-pdf.js";
import { parseArticles } from "./parse-articles.js";

export async function parseProduct(url, lang) {
  const res = await api.get(url);
  const $ = cheerio.load(res.data);
  const container = $("div.dettaglio-famiglia");
  if (!container.length) {
    throw new Error(`dettaglio-famiglia not found [${lang}] ${url}`);
  }

  const modelName = container.find("h2.codice-famiglia").first().text().trim();

  if (!modelName) {
    throw new Error(`modelName not found [${lang}] ${url}`);
  }

  return {
    modelName,
    lang,
    title: container.find("h1").first().text().trim(),
    description: container.find("h3").first().text().trim(),
    properties: parseProperties(container, $),
    articles: parseArticles(container, $),
    images: parseImages(container, $),
    pdfs: parsePdf(container, $),
  };
}
