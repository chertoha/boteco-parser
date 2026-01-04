import fs from "fs-extra";
import path from "path";
import ExcelJS from "exceljs";
import { LANGS } from "./constants.js";

const DATA_DIR = "data";
const XLS_DIR = "xls";
const EXTRA_LANG = "uk";

const COLUMN_MAP = {
  code: ["Code", "Код", "Kod"],
  article: ["Art.", "Арт.", "Artykuł"],
};

const UK_COLUMN_RENAME = {
  "Weight (g)": "Вага (г)",
};

/* =========================
   ENTRY
========================= */

async function run() {
  await fs.ensureDir(XLS_DIR);

  const modelDirs = (await fs.readdir(DATA_DIR)).filter((d) => d !== XLS_DIR);

  console.log(`▶ Found ${modelDirs.length} models`);

  for (const modelDir of modelDirs) {
    const jsonPath = path.join(DATA_DIR, modelDir, `${modelDir}.json`);
    if (!(await fs.pathExists(jsonPath))) continue;

    const model = await fs.readJson(jsonPath);
    await generateXlsx(model, modelDir);
  }

  console.log("✔ XLS generation finished");
}

run().catch(console.error);

/* =========================
   XLS GENERATOR
========================= */

async function generateXlsx(model, modelDir) {
  const workbook = new ExcelJS.Workbook();

  for (const lang of LANGS) {
    addLangSheet(workbook, model, lang);
  }

  // 🇺🇦 uk = копия en
  addLangSheet(workbook, model, "en", EXTRA_LANG);

  const outPath = path.join(XLS_DIR, `${modelDir}.xlsx`);
  await workbook.xlsx.writeFile(outPath);

  console.log(`✔ ${modelDir}.xlsx`);
}

/* =========================
   SHEET BUILDER
========================= */

function addLangSheet(workbook, model, sourceLang, sheetName = sourceLang) {
  const articles = model.articles[sourceLang];
  if (!articles || !articles.length) return;

  const sheet = workbook.addWorksheet(sheetName);

  // 1️⃣ собираем все ключи из статей
  const columnSet = new Set();
  for (const row of articles) {
    Object.keys(row).forEach((k) => columnSet.add(k));
  }

  // 2️⃣ нормализуем колонки
  const columns = normalizeColumns([...columnSet]);

  // 3️⃣ описываем колонки Excel
  // sheet.columns = columns.map((col) => ({
  //   header: col, // ← тут уже "code", "article"
  //   key: col,
  //   width: Math.max(15, col.length + 2),
  // }));
  sheet.columns = columns.map((col) => {
    let header = col;

    // 🇺🇦 только для украинской вкладки
    if (sheetName === "uk" && UK_COLUMN_RENAME[col]) {
      header = UK_COLUMN_RENAME[col];
    }

    return {
      header,
      key: col, // ключ остаётся прежним!
      width: Math.max(15, header.length + 2),
    };
  });

  // 4️⃣ заполняем строки
  for (const row of articles) {
    const out = {};

    for (const col of columns) {
      if (COLUMN_MAP[col]) {
        // code / article
        out[col] = getMappedValue(row, col);
      } else {
        // все остальные поля — как есть
        out[col] = row[col] ?? "";
      }
    }

    sheet.addRow(out);
  }

  // 5️⃣ выделяем заголовок
  sheet.getRow(1).font = { bold: true };
}

/* =========================
   COLUMN NORMALIZATION
========================= */

function getMappedValue(row, column) {
  const keys = COLUMN_MAP[column];
  if (!keys) return "";

  for (const key of keys) {
    if (row[key] !== undefined) {
      let value = String(row[key]).trim();

      // ❗ убираем "*", пробелы в начале
      value = value.replace(/^\*\s*/, "");

      return value;
    }
  }

  return "";
}

// function getMappedValue(row, column) {
//   const keys = COLUMN_MAP[column];
//   if (!keys) return "";

//   for (const key of keys) {
//     if (row[key] !== undefined) {
//       return row[key];
//     }
//   }

//   return "";
// }

function normalizeColumns(keys) {
  const columns = ["code", "article"];

  for (const key of keys) {
    if (COLUMN_MAP.code.includes(key) || COLUMN_MAP.article.includes(key)) {
      continue;
    }
    columns.push(key);
  }

  return columns;
}
