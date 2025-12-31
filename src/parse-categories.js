export function parseCategories(container, $) {
  const links = [];

  container.find("div.elenco-gruppi a").each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;

    links.push(new URL(href, "https://www.boteco.com").href);
  });

  return [...new Set(links)];
}
