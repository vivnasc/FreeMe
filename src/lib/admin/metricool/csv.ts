function csvEscape(val: string): string {
  if (/[,"\r\n]/.test(val)) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

const HEADER = [
  "Date", "Time", "Draft",
  "Instagram", "Instagram Post Type", "Instagram Show Reel On Feed",
  "TikTok", "TikTok Post Privacy", "TikTok Auto Add Music",
  "TikTok disable comments", "TikTok disable duet", "TikTok disable stitch",
  "Facebook Page", "Facebook Page Post Type",
  "LinkedIn Profile", "LinkedIn Profile Post Type",
  "LinkedIn Page", "LinkedIn Page Post Type",
  "X (Twitter)", "X (Twitter) Post Type",
  "Pinterest", "Pinterest Board Name", "Pinterest Title",
  "Youtube", "Youtube Video Type", "Youtube Video Privacy", "Youtube video for kids",
  "Google Business", "Google Business Post Type", "Google Business Button Type", "Google Business Button Url",
  "Threads", "Bluesky",
  "Text",
  "Picture Url 1", "Picture Url 2", "Picture Url 3", "Picture Url 4", "Picture Url 5",
  "Picture Url 6", "Picture Url 7", "Picture Url 8", "Picture Url 9", "Picture Url 10",
  "Alt Text 1", "Alt Text 2", "Alt Text 3", "Alt Text 4", "Alt Text 5",
  "Alt Text 6", "Alt Text 7", "Alt Text 8", "Alt Text 9", "Alt Text 10",
  "First Comment",
  "Facebook Group", "Facebook Group Post Type",
  "Carousel Title 1", "Carousel Title 2", "Carousel Title 3", "Carousel Title 4", "Carousel Title 5",
  "Carousel Title 6", "Carousel Title 7", "Carousel Title 8", "Carousel Title 9", "Carousel Title 10",
  "Carousel Description 1", "Carousel Description 2", "Carousel Description 3", "Carousel Description 4", "Carousel Description 5",
  "Carousel Description 6", "Carousel Description 7", "Carousel Description 8", "Carousel Description 9", "Carousel Description 10",
  "Carousel Link 1", "Carousel Link 2", "Carousel Link 3", "Carousel Link 4", "Carousel Link 5",
  "Carousel Link 6", "Carousel Link 7", "Carousel Link 8", "Carousel Link 9", "Carousel Link 10",
  "Starter Account", "Starter Account Media Type",
  "Starter Bio Link",
];

interface MetricoolRow {
  date: string;
  time: string;
  text: string;
  pictureUrls: string[];
  platforms: {
    ig?: { type: "CAROUSEL" | "REEL"; showReelOnFeed?: boolean };
    tiktok?: boolean;
  };
  firstComment?: string;
}

export function buildCSV(rows: MetricoolRow[]): string {
  const lines: string[] = [HEADER.join(",")];

  for (const row of rows) {
    const cells = new Array(HEADER.length).fill("");

    cells[0] = row.date;
    cells[1] = row.time.includes(":") && row.time.split(":").length === 2 ? `${row.time}:00` : row.time;
    cells[2] = "FALSE";

    if (row.platforms.ig) {
      cells[3] = "TRUE";
      cells[4] = row.platforms.ig.type;
      cells[5] = row.platforms.ig.type === "REEL" ? "TRUE" : "FALSE";
    } else {
      cells[3] = "FALSE";
    }

    if (row.platforms.tiktok) {
      cells[6] = "TRUE";
      cells[7] = "PUBLIC_TO_EVERYONE";
      cells[8] = "FALSE";
      cells[9] = "FALSE";
      cells[10] = "TRUE";
      cells[11] = "TRUE";
    } else {
      cells[6] = "FALSE";
    }

    for (let i = 13; i <= 32; i++) {
      if (cells[i] === "") cells[i] = "FALSE";
    }

    cells[33] = csvEscape(row.text);

    for (let i = 0; i < Math.min(row.pictureUrls.length, 10); i++) {
      cells[34 + i] = row.pictureUrls[i];
    }

    if (row.firstComment) {
      cells[54] = csvEscape(row.firstComment);
    }

    lines.push(cells.map((c) => csvEscape(String(c))).join(","));
  }

  return lines.join("\r\n") + "\r\n";
}
