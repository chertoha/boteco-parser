// export function parseProperties(container, $) {
//   const properties = {};

//   container.find("div.dati > div.mt-2").each((_, block) => {
//     const key = $(block).find("h4").text().replace(":", "").trim();

//     const value = $(block).find("p").text().replace(/\s+/g, " ").trim();

//     if (key && value) {
//       properties[key] = value;
//     }
//   });

//   return properties;
// }

export function parseProperties(container, $) {
  const properties = {};

  container.find("div.dati > div.mt-2").each((_, block) => {
    const key = $(block).find("h4").first().text().replace(":", "").trim();

    if (!key) return;

    const values = [];

    $(block)
      .find("p")
      .each((_, p) => {
        const text = $(p).text().replace(/\s+/g, " ").trim();

        if (text) values.push(text);
      });

    if (values.length === 1) {
      properties[key] = values[0];
    } else if (values.length > 1) {
      properties[key] = values;
    }
  });

  return properties;
}
