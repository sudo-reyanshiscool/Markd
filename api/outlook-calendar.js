const normaliseCalendarUrl = (value) => value.trim().replace(/^webcal:\/\//i, "https://");

const isCalendarOnlineHost = (hostname = "") => {
  const value = hostname.toLowerCase();
  return value === "calendar.online" || value.endsWith(".calendar.online") || value === "kalender.digital" || value.endsWith(".kalender.digital");
};

const isPrivateHostname = (hostname) => {
  const value = hostname.toLowerCase();
  return (
    value === "localhost" ||
    value === "127.0.0.1" ||
    value === "::1" ||
    value.startsWith("10.") ||
    value.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(value)
  );
};

const unfoldICalLines = (content) => {
  const rows = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  return rows.reduce((lines, row) => {
    if ((row.startsWith(" ") || row.startsWith("\t")) && lines.length > 0) {
      lines[lines.length - 1] += row.slice(1);
      return lines;
    }
    lines.push(row);
    return lines;
  }, []);
};

const decodeICalText = (value = "") =>
  value
    .replace(/\\n/gi, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");

const parseICalDate = (value) => {
  const match = value.match(/^(\d{4})(\d{2})(\d{2})/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}`;
};

const escapeHtmlEntities = (value = "") =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

const looksLikeHtml = (contentType = "", content = "") =>
  /text\/html|application\/xhtml\+xml/i.test(contentType) ||
  /^\s*<!doctype html/i.test(content) ||
  /^\s*<html/i.test(content);

const pickCalendarFeedUrl = (html, baseUrl) => {
  const candidates = new Set();
  const hrefPattern = /(?:href|content)=["']([^"']+)["']/gi;
  const rawUrlPattern = /(webcal:\/\/[^"'`\s<]+|https:\/\/[^"'`\s<]+(?:\.ics|\/ics|calendar[^"'`\s<]*))/gi;

  for (const match of html.matchAll(hrefPattern)) {
    const candidate = escapeHtmlEntities(match[1] || "").trim();
    if (candidate) candidates.add(candidate);
  }

  for (const match of html.matchAll(rawUrlPattern)) {
    const candidate = escapeHtmlEntities(match[1] || "").trim();
    if (candidate) candidates.add(candidate);
  }

  for (const candidate of candidates) {
    const normalisedCandidate = normaliseCalendarUrl(candidate);
    try {
      const resolved = new URL(normalisedCandidate, baseUrl).toString();
      if (/\.ics(\?|$)/i.test(resolved) || /^https:\/\/.*calendar/i.test(resolved)) {
        return resolved;
      }
    } catch {
      continue;
    }
  }

  return null;
};

const fetchCalendarBody = async (inputUrl, visited = new Set()) => {
  const normalisedUrl = normaliseCalendarUrl(inputUrl);
  let parsedUrl;

  try {
    parsedUrl = new URL(normalisedUrl);
  } catch {
    throw new Error("Invalid calendar URL");
  }

  if (parsedUrl.protocol !== "https:" || isPrivateHostname(parsedUrl.hostname)) {
    throw new Error("Please use a public HTTPS Outlook calendar link");
  }

  if (visited.has(normalisedUrl)) {
    throw new Error("Calendar link redirected in a loop.");
  }

  visited.add(normalisedUrl);

  const response = await fetch(normalisedUrl, {
    headers: {
      Accept: "text/calendar,text/plain;q=0.9,text/html;q=0.8,*/*;q=0.7",
    },
  });

  if (!response.ok) {
    const error = new Error("Could not fetch that calendar link");
    error.status = response.status;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  const content = await response.text();

  if (looksLikeHtml(contentType, content)) {
    const feedUrl = pickCalendarFeedUrl(content, normalisedUrl);
    if (!feedUrl) {
      if (isCalendarOnlineHost(parsedUrl.hostname)) {
        throw new Error("This Calendar.online link is the calendar view, not the iCalendar feed. Open the link, use the top-right menu, choose iCalendar Feed, then paste the Feed URL or .ics link here.");
      }
      throw new Error("That looks like an Outlook calendar web page, not the published calendar feed. In Outlook, use the Subscribe/ICS/webcal link.");
    }

    return fetchCalendarBody(feedUrl, visited);
  }

  return content;
};

const parseEvents = (content) => {
  const lines = unfoldICalLines(content);
  const events = [];
  let block = null;

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.toUpperCase() === "BEGIN:VEVENT") {
      block = [];
      continue;
    }

    if (trimmedLine.toUpperCase() === "END:VEVENT") {
      if (block) {
        let title = "";
        let date = null;
        let uid = "";
        let description = "";
        let location = "";

        for (const entry of block) {
          const colonIndex = entry.indexOf(":");
          if (colonIndex === -1) continue;
          const rawKey = entry.slice(0, colonIndex);
          const rawValue = entry.slice(colonIndex + 1);
          const key = rawKey.split(";")[0].toUpperCase();

          if (key === "SUMMARY") title = decodeICalText(rawValue);
          if (key === "DTSTART") date = parseICalDate(rawValue);
          if (key === "UID") uid = decodeICalText(rawValue);
          if (key === "DESCRIPTION") description = decodeICalText(rawValue);
          if (key === "LOCATION") location = decodeICalText(rawValue);
        }

        if (title && date) {
          events.push({
            id: uid || `${title}-${date}`,
            title,
            date,
            description,
            location,
          });
        }
      }

      block = null;
      continue;
    }

    if (block) block.push(trimmedLine);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return events
    .filter((event) => event.date >= localToday)
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((event, index, items) => items.findIndex((item) => item.id === event.id && item.date === event.date) === index);
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rawUrl = typeof req.body?.url === "string" ? req.body.url : "";
  const calendarUrl = normaliseCalendarUrl(rawUrl);
  if (!calendarUrl) {
    return res.status(400).json({ error: "A calendar URL is required" });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(calendarUrl);
  } catch {
    return res.status(400).json({ error: "Invalid calendar URL" });
  }

  if (parsedUrl.protocol !== "https:" || isPrivateHostname(parsedUrl.hostname)) {
    return res.status(400).json({ error: "Please use a public HTTPS Outlook calendar link" });
  }

  try {
    const content = await fetchCalendarBody(parsedUrl.toString());
    const events = parseEvents(content);
    return res.status(200).json({ events });
  } catch (error) {
    const status = typeof error?.status === "number" ? error.status : 500;
    return res.status(status).json({
      error: error instanceof Error ? error.message : "Calendar import failed",
    });
  }
}
