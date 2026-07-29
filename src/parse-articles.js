// export function parseArticles(container, $) {
//   const headers = [];
//   const rows = [];

//   container.find("table thead th").each((_, th) => {
//     headers.push($(th).text().trim());
//   });

//   container.find("table tbody tr").each((_, tr) => {
//     const row = {};

//     $(tr)
//       .find("td")
//       .each((i, td) => {
//         row[headers[i]] = $(td).text().trim();
//       });

//     if (Object.keys(row).length) {
//       rows.push(row);
//     }
//   });

//   return rows;
// }

export function parseArticles(container, $) {
  const rows = [];

  const table = container.find("div.articolo table");

  if (!table.length) {
    return rows;
  }

  // 1️⃣ читаем заголовки
  const headers = [];

  table.find("thead th").each((_, th) => {
    headers.push($(th).text().trim());
  });

  if (!headers.length) {
    return rows;
  }

  // 2️⃣ читаем строки
  table.find("tbody tr").each((_, tr) => {
    const row = {};

    $(tr)
      .find("td")
      .each((i, td) => {
        const header = headers[i];
        if (!header) return;

        row[header] = $(td).text().trim();
      });

    if (Object.keys(row).length) {
      rows.push(row);
    }
  });

  return rows;
}
