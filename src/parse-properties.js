export function parseProperties(container, $) {
  const properties = {};

  container.find("div.dati > div.mt-2").each((_, block) => {
    const label = $(block).find("h4").first().text().replace(":", "").trim();

    if (!label) return;

    const values = [];

    $(block)
      .find("p")
      .each((_, p) => {
        const text = $(p).text().replace(/\s+/g, " ").trim();

        if (text) values.push(text);
      });

    if (!values.length) return;

    properties[label] = values.length === 1 ? values[0] : values;
  });

  return properties;
}
