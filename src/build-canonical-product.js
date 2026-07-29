// export function buildCanonicalProduct(raw, lang) {
//   const productId = raw.modelName.trim().toUpperCase();

//   const articles = raw.articles.map((row) => {
//     // console.log("ARTICLE ROW:", row);
//     const sku = extractSku(row);

//     return {
//       externalArticleId: sku,
//       properties: normalizeArticleProperties(row),
//     };
//   });

//   return {
//     externalProductId: productId,
//     brandExternalId: "boteco",

//     media: {
//       images: raw.images.images.map(extractFilename),
//       drawings: raw.images.drawings.map(extractFilename),
//       pdfs: raw.pdfs.map(extractFilename),
//     },

//     articles,

//     translations: {
//       [lang]: {
//         name: raw.title,
//         description: raw.description,
//       },
//     },
//   };
// }

// /* ========================= */

// function extractSku(row) {
//   for (const key of Object.keys(row)) {
//     const normalized = key.toLowerCase().replace(/\s+/g, "");

//     if (normalized.includes("art")) {
//       const value = row[key];
//       if (value && String(value).trim()) {
//         return String(value).trim();
//       }
//     }
//   }

//   return null;
// }
// // function extractSku(row) {
// //   if (row.code) return row.code.trim();
// //   if (row.article) return row.article.trim();

// //   throw new Error("SKU not found in article row");
// // }

// function extractFilename(url) {
//   return url.split("/").pop().split("?")[0];
// }

// /* ========================= */

// function normalizeArticleProperties(row) {
//   const result = {};

//   for (const [key, value] of Object.entries(row)) {
//     const normalizedKey = normalizeKey(key);

//     if (normalizedKey === "code" || normalizedKey === "art") {
//       continue;
//     }

//     if (!value) continue;

//     result[normalizedKey] = String(value).trim();
//   }

//   return result;
// }
// // function normalizeArticleProperties(row) {
// //   const result = {};

// //   for (const key of Object.keys(row)) {
// //     if (key === "code" || key === "article") continue;

// //     const normalizedKey = normalizePropertyKey(key);
// //     const value = normalizeValue(row[key]);

// //     result[normalizedKey] = value;
// //   }

// //   return result;
// // }

// function normalizePropertyKey(label) {
//   return label
//     .toLowerCase()
//     .replace(/\(.*?\)/g, (match) => {
//       return "_" + match.replace(/[()]/g, "").toLowerCase();
//     })
//     .replace(/[^a-z0-9_]/g, "_")
//     .replace(/_+/g, "_")
//     .replace(/^_|_$/g, "");
// }

// function normalizeValue(value) {
//   if (!value) return null;

//   const numeric = parseFloat(
//     String(value)
//       .replace(",", ".")
//       .match(/[0-9.]+/)?.[0]
//   );

//   if (!isNaN(numeric)) return numeric;

//   return String(value).trim();
// }

export function buildCanonicalProduct(raw, lang) {
  const productId = raw.modelName.trim().toUpperCase();

  const articles = raw.articles.map((row) => {
    const sku = extractSku(row);

    if (!sku) {
      throw new Error("SKU not found in article row");
    }

    return {
      externalArticleId: sku,
      properties: normalizeArticleProperties(row),
    };
  });

  return {
    externalProductId: productId,
    brandExternalId: "boteco",

    media: {
      images: raw.images?.images?.map(extractFilename) || [],
      drawings: raw.images?.drawings?.map(extractFilename) || [],
      pdfs: raw.pdfs?.map(extractFilename) || [],
    },

    articles,

    translations: {
      [lang]: {
        name: raw.title,
        description: raw.description,
        properties: raw.properties,
      },
    },
  };
}

/* ========================= */

function extractSku(row) {
  // 1️⃣ сначала пробуем найти колонку art / арт
  for (const [key, value] of Object.entries(row)) {
    const normalized = key.toLowerCase();

    if (normalized.includes("art") || normalized.includes("арт")) {
      if (value && String(value).trim()) {
        return String(value).trim();
      }
    }
  }

  // 2️⃣ fallback — ищем по формату
  for (const value of Object.values(row)) {
    if (!value) continue;

    const str = String(value).trim();

    // содержит точку и хотя бы одну букву
    if (str.includes(".") && /[A-Z]/i.test(str)) {
      return str;
    }
  }

  return null;
}
// function extractSku(row) {
//   const skuPattern = /^[A-Z0-9]+\.[A-Z0-9]+$/i;

//   for (const value of Object.values(row)) {
//     if (!value) continue;

//     const str = String(value).trim();

//     if (skuPattern.test(str)) {
//       return str;
//     }
//   }

//   return null;
// }
// function extractSku(row) {
//   for (const key of Object.keys(row)) {
//     const normalized = key.toLowerCase().replace(/\s+/g, "");

//     if (normalized.includes("art")) {
//       const value = row[key];
//       if (value && String(value).trim()) {
//         return String(value).trim();
//       }
//     }
//   }

//   return null;
// }

function extractFilename(url) {
  return url.split("/").pop().split("?")[0];
}

/* ========================= */

function normalizeArticleProperties(row) {
  const result = {};

  for (const [key, value] of Object.entries(row)) {
    const normalizedKey = normalizeKey(key);

    // пропускаем служебные колонки
    if (normalizedKey === "code" || normalizedKey === "art") {
      continue;
    }

    if (!value) continue;

    result[normalizedKey] = String(value).trim();
  }

  return result;
}

/* ========================= */

function normalizeKey(key) {
  return key
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // убрать (g), (N)
    .replace(/\./g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}
