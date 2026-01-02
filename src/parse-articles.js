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
