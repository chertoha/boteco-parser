export function parseFamilies(container, $) {
  const links = [];

  container.find("div.elenco-famiglie a").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;

    const url = new URL(href, "https://www.boteco.com").href;

    // ❗ фильтр только страниц моделей
    if (
      url.includes("/products/") &&
      !url.endsWith(".pdf") &&
      !url.includes("/pdf/")
    ) {
      links.push(url);
    }
  });

  return [...new Set(links)];
}
