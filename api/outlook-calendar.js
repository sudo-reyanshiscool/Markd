const normaliseCalendarUrl = (value) => value.trim().replace(/^webcal:\/\//i, "https://");

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
  const rows = content.replace(/\r\n/g, "\n").split("\n");
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

const parseEvents = (content) => {
  const lines = unfoldICalLines(content);
  const events = [];
  let block = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      block = [];
      continue;
    }

    if (line === "END:VEVENT") {
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

    if (block) block.push(line);
  }

  const today = new Date().toISOString().slice(0, 10);
  return events
    .filter((event) => event.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
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
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: "Could not fetch that calendar link" });
    }

    const content = await response.text();
    const events = parseEvents(content);
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Calendar import failed",
    });
  }
}
