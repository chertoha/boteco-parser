export function parsePdf(container, $) {
  const pdfs = [];

  container.find('a[href$=".pdf"]').each((_, a) => {
    const href = $(a).attr("href");
    if (!href) return;

    pdfs.push(new URL(href, "https://www.boteco.com").href);
  });

  return [...new Set(pdfs)];
}
