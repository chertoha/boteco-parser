import * as cheerio from "cheerio";
import fs from "fs-extra";
import { api } from "./src/api.js";
import { parseCategories } from "./src/parse-categories.js";
import { parseFamilies } from "./src/parse-families.js";
import { parseProduct } from "./src/parse-product.js";
import { createBar } from "./src/progress.js";
import { sleep } from "./src/sleep.js";
import { downloadFile } from "./src/download-file.js";
import { LANGS, PARSE_PRODUCTS_SLEEP_DELAY } from "./src/constants.js";
import path from "path";

// const ROOT_URL = "https://www.boteco.com/en/products/";
// const LANGS = ["en", "ru", "pl"];

/* =========================
   ENTRY POINT
========================= */

async function run() {
  console.log("▶ Boteco parser started");

  /**
   * models = {
   *   A148: {
   *     modelName: "A148",
   *     assets: { images, drawings, pdfs },
   *     articles: { en: [], ru: [], pl: [] },
   *     i18n: { en: {}, ru: {}, pl: {} }
   *   }
   * }
   */
  const models = {};

  for (const lang of LANGS) {
    await parseLanguage(lang, models);
  }

  console.log("✔ Boteco parser finished");
}

run().catch(console.error);

/* =========================
   LANGUAGE LEVEL
========================= */

async function parseLanguage(lang, models) {
  console.log(`\n🌍 Parsing language: ${lang}`);

  console.log(`  ↳ loading categories`);
  const categories = await getCategories(lang);
  console.log(`  ↳ categories found: ${categories.length}`);

  console.log(`  ↳ loading products from categories`);
  const products = await getProductsForCategories(categories);
  console.log(`  ↳ products found: ${products.length}`);

  console.log(`  ↳ parsing ${products.length} products`);
  const bar = lang === LANGS[0] ? createBar(products.length) : null;

  await parseProductsForLanguage(products, lang, models, bar);

  if (bar) bar.stop();
}
// async function parseLanguage(lang, models) {
//   console.log(`🌍 Parsing language: ${lang}`);

//   const categories = await getCategories(lang);
//   const products = await getProductsForCategories(categories);

//   console.log(`▶ [${lang}] Found ${products.length} products`);

//   const bar = lang === LANGS[0] ? createBar(products.length) : null;

//   await parseProductsForLanguage(products, lang, models, bar);

//   if (bar) bar.stop();
// }

/* =========================
   CATEGORIES
========================= */

async function getCategories(lang) {
  const ROOT_URL = `https://www.boteco.com/${lang}/products/`;

  const res = await api.get(ROOT_URL);
  const $ = cheerio.load(res.data);

  return parseCategories($("body"), $);
}

/* =========================
   PRODUCTS
========================= */

async function getProductsForCategories(categories) {
  const products = [];

  for (let i = 0; i < categories.length; i++) {
    const categoryUrl = categories[i];
    console.log(`    • category ${i + 1}/${categories.length}`);

    const res = await api.get(categoryUrl);
    await sleep(PARSE_PRODUCTS_SLEEP_DELAY);
    const $ = cheerio.load(res.data);

    const families = parseFamilies($("body"), $);
    products.push(...families);
  }

  return products;
}
// async function getProductsForCategories(categories) {
//   const products = [];

//   for (const categoryUrl of categories) {
//     const res = await api.get(categoryUrl);
//     await sleep();
//     const $ = cheerio.load(res.data);

//     const families = parseFamilies($("body"), $);
//     products.push(...families);
//   }

//   return products;
// }

/* =========================
   PRODUCT PARSING
========================= */

async function parseProductsForLanguage(products, lang, models, bar) {
  // console.log(`  ↳ parsing ${products.length} products`);

  for (let i = 0; i < products.length; i++) {
    const productUrl = products[i];
    const code = productUrl.split("/").pop();

    if (bar) bar.update({ code });

    try {
      const data = await parseProduct(productUrl, lang);
      await sleep(PARSE_PRODUCTS_SLEEP_DELAY);

      await mergeProductData(data, models, lang);
    } catch (err) {
      console.error(`✖ [${lang}] ${code}:`, err.message);
    }

    if (bar) bar.increment();
  }
}

/* =========================
   DATA MERGE
========================= */

async function mergeProductData(data, models, lang) {
  const safeModelName = normalizeName(data.modelName);
  const baseDir = `data/${safeModelName}`;
  await fs.ensureDir(baseDir);

  if (!models[safeModelName]) {
    models[safeModelName] = {
      modelName: data.modelName,
      assets: {
        images: data.images.images,
        drawings: data.images.drawings,
        pdfs: {},
      },
      articles: {},
      i18n: {},
    };

    for (const img of data.images.images) {
      await downloadFile(img, `${baseDir}/images`);
    }

    for (const dr of data.images.drawings) {
      await downloadFile(dr, `${baseDir}/drawings`);
    }
  }

  models[safeModelName].articles[lang] = data.articles;

  models[safeModelName].i18n[lang] = {
    title: data.title,
    description: data.description,
    properties: data.properties,
  };

  if (data.pdfs[0]) {
    const pdfPath = `${baseDir}/pdf/${path.basename(data.pdfs[0])}`;
    models[safeModelName].assets.pdfs[lang] = data.pdfs[0];
    if (!(await fs.pathExists(pdfPath))) {
      await downloadFile(data.pdfs[0], `${baseDir}/pdf`);
    }
  }

  await fs.writeJson(
    `${baseDir}/${safeModelName}.json`,
    models[safeModelName],
    { spaces: 2 }
  );
}

/* =========================
   UTILS
========================= */

function normalizeName(name) {
  return name
    .toUpperCase()
    .replace(/\s+/g, "_")
    .replace(/[^A-Z0-9_]/g, "");
}
