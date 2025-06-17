import * as cheerio from "cheerio";

export function extractAssetDetailsFromHTML(html: string) {
    const $ = cheerio.load(html);
    console.log("cek $ cheerio", $)
  const rows = $(".asset-details table tr");

  const result: Record<string, string> = {};
  rows.each((_, row) => {
    const th = $(row).find("th").text().trim().toLowerCase().replace(/\s+/g, "_");
    const td = $(row).find("td").text().trim();
    if (th && td) {
      result[th] = td;
    }
  });

  return result;
}
