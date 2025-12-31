export function parseImages(container, $) {
  const images = [];
  const drawings = [];

  const gallery = container.find("div.galleria .principale");
  if (!gallery.length) {
    return { images, drawings };
  }

  gallery.find("a.media-link").each((_, a) => {
    let href = $(a).attr("href");
    if (!href) return;

    // нормализуем URL
    href = new URL(href, "https://www.boteco.com").href;

    // webp → jpg (на всякий случай)
    href = href.replace(/\.webp($|\?)/i, ".jpg$1");

    // ❗ фильтрация
    if (href.includes("/immagini/foto/")) {
      images.push(href);
    } else if (href.includes("/immagini/disegni/")) {
      drawings.push(href);
    }
  });

  return {
    images: [...new Set(images)],
    drawings: [...new Set(drawings)],
  };
}
