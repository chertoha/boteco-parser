import cliProgress from "cli-progress";

export function createBar(total) {
  const bar = new cliProgress.SingleBar({
    format: "Progress |{bar}| {percentage}% | {value}/{total} | {code}",
    hideCursor: true,
  });

  bar.start(total, 0, { code: "" });

  return bar;
}
