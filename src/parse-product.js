import * as cheerio from "cheerio";
import { api } from "./api.js";
import { parseImages } from "./parse-images.js";
import { parseProperties } from "./parse-properties.js";
import { parsePdf } from "./parse-pdf.js";
import { parseArticles } from "./parse-articles.js";
import { parseProductLang } from "./parse-product-lang.js";

const LANGS = ["en", "ru", "pl"];

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

  // const articlesByLang = {};
  // const i18n = {};
  // const pdfsByLang = {};

  // const res = await api.get(url);
  // const $ = cheerio.load(res.data);

  // const container = $("div.dettaglio-famiglia");
  // if (!container.length) {
  //   throw new Error("dettaglio-famiglia not found: " + url);
  // }

  // const enRes = await api.get(url);
  // const $en = cheerio.load(enRes.data);
  // const containerEn = $en("div.dettaglio-famiglia");

  // const modelName = containerEn
  //   .find("h2.codice-famiglia")
  //   .first()
  //   .text()
  //   .trim();
  // const safeModelName = normalizeName(modelName);
  // const baseDir = `data/${safeModelName}`;
  // await fs.ensureDir(baseDir);

  // const { images, drawings } = parseImages(containerEn, $en);

  // const modelName = container.find("h2.codice-famiglia").first().text().trim();
  // const title = container.find("h1").first().text().trim();
  // const description = container.find("h3").first().text().trim();

  // const articles = parseArticles(container, $);
  // const { images, drawings } = parseImages(container, $);
  // const properties = parseProperties(container, $);
  // const pdfs = parsePdf(container, $);

  // const code = url.split("/").pop().split("-")[0].toUpperCase();

  // const baseDir = `data/${safeModelName}`;
  // await fs.ensureDir(baseDir);

  // for (const img of images) {
  //   await downloadFile(img, `${baseDir}/images`);
  // }

  // for (const dr of drawings) {
  //   await downloadFile(dr, `${baseDir}/drawings`);
  // }

  // for (const pdf of pdfs) {
  //   await downloadFile(pdf, `${baseDir}/pdf`);
  // }
  // for (const lang of LANGS) {
  //   const langUrl = url.replace("/en/", `/${lang}/`);
  //   const data = await parseProductLang(langUrl, lang);

  //   articlesByLang[lang] = data.articles;

  //   i18n[lang] = {
  //     title: data.title,
  //     description: data.description,
  //     properties: data.properties,
  //   };

  //   if (data.pdfs[0]) {
  //     pdfsByLang[lang] = data.pdfs[0];
  //     await downloadFile(data.pdfs[0], `${baseDir}/pdf`);
  //   }
  // }

  // const result = {
  //   modelName,
  //   assets: {
  //     images,
  //     drawings,
  //     pdfs: pdfsByLang,
  //   },
  //   articles: articlesByLang,
  //   i18n,
  // };

  // const result = {
  //   modelName,
  //   url,
  //   code,
  //   title,
  //   description,
  //   properties,
  //   articles,
  //   images,
  //   drawings,
  //   pdfs,
  // };

  // await fs.writeJson(`${baseDir}/${code}.json`, result, { spaces: 2 });
  // await fs.writeJson(`${baseDir}/${safeModelName}.json`, result, { spaces: 2 });
  // await fs.writeJson(`${baseDir}/${safeModelName}.json`, result, {
  //   spaces: 2,
  // });
}

function normalizeName(name) {
  return name
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}
