// export function parseArticles(container, $) {
//   const headers = [];
//   const articles = [];

//   // заголовки
//   container.find("table thead th").each((_, th) => {
//     const header = $(th).text().trim();
//     if (header) headers.push(header);
//   });

//   // строки → articles
//   container.find("table tbody tr").each((_, tr) => {
//     const article = {};

//     $(tr)
//       .find("td")
//       .each((i, td) => {
//         const key = headers[i];
//         if (!key) return;

//         article[key] = $(td).text().trim();
//       });

//     // защита от пустых строк
//     if (Object.keys(article).length > 0) {
//       articles.push(article);
//     }
//   });

//   return articles;
// }

export function parseArticles(container, $) {
  const headers = [];
  const rows = [];

  container.find("table thead th").each((_, th) => {
    headers.push($(th).text().trim());
  });

  container.find("table tbody tr").each((_, tr) => {
    const row = {};

    $(tr)
      .find("td")
      .each((i, td) => {
        row[headers[i]] = $(td).text().trim();
      });

    if (Object.keys(row).length) {
      rows.push(row);
    }
  });

  return rows;
}
