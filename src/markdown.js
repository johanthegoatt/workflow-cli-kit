// Headings as CommonMark defines them, so the checks see what a reader sees:
// ATX headings (`## Run`, up to three leading spaces, optional closing #s),
// setext headings (a line underlined with === or ---), and nothing inside
// fenced (``` or ~~~) or indented code blocks.
// https://spec.commonmark.org/0.31.2/#atx-headings

export function headings(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let fence = null;
  let paragraph = null; // previous line, if it could be a setext heading's text

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    if (fence) {
      const close = line.match(/^ {0,3}(`{3,}|~{3,})\s*$/);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) fence = null;
      continue;
    }
    const open = line.match(/^ {0,3}(`{3,}|~{3,})/);
    if (open) {
      fence = open[1];
      paragraph = null;
      continue;
    }
    // Indented code, unless it continues a paragraph.
    if (/^( {4}|\t)/.test(line) && !paragraph) continue;

    const atx = line.match(/^ {0,3}(#{1,6})(?:[ \t]+(.*?))?(?:[ \t]+#+)?[ \t]*$/);
    if (atx) {
      out.push({ level: atx[1].length, text: (atx[2] || "").replace(/[ \t]+#+$/, "").trim(), line: i });
      paragraph = null;
      continue;
    }
    const setext = line.match(/^ {0,3}(=+|-+)[ \t]*$/);
    if (setext && paragraph !== null) {
      out[out.length] = { level: setext[1][0] === "=" ? 1 : 2, text: paragraph.trim(), line: i - 1 };
      paragraph = null;
      continue;
    }
    paragraph = line.trim() ? line : null;
  }
  return out;
}

// Each heading with the text under it, up to the next heading of the same
// or a higher level.
export function sections(markdown) {
  const lines = String(markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const hs = headings(markdown);
  return hs.map((h, k) => {
    let end = lines.length;
    for (let j = k + 1; j < hs.length; j += 1) {
      if (hs[j].level <= h.level) {
        end = hs[j].line;
        break;
      }
    }
    const start = h.line + (isSetext(lines, h) ? 2 : 1);
    const body = lines.slice(start, end).join("\n");
    return { ...h, body };
  });
}

function isSetext(lines, h) {
  const next = lines[h.line + 1];
  return next !== undefined && /^ {0,3}(=+|-+)[ \t]*$/.test(next) && !/^ {0,3}#/.test(lines[h.line]);
}

export function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`*_[\]()]/g, "")
    .replace(/^[^a-z0-9]+/, "")
    .replace(/\s+/g, " ")
    .trim();
}
