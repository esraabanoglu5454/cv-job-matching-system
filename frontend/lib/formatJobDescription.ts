export type JobCriteriaItem = {
  label: string;
  value: string;
};

export type JobSection = {
  title: string;
  type: "text" | "list" | "criteria";
  text?: string;
  items?: string[];
  criteria?: JobCriteriaItem[];
};

const CRITERIA_LABELS = [
  "Tecrübe",
  "Eğitim Seviyesi",
  "Askerlik Durumu",
  "Ehliyet",
  "Yabancı Dil",
  "Pozisyon Seviyesi",
  "Çalışma Şekli",
  "Departman",
];

function cleanText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\t/g, " ")
    .replace(/\u2022/g, "•")
    .replace(/[ ]{2,}/g, " ")
    .trim();
}

function splitListItems(text: string): string[] {
  if (!text) return [];

  return text
    .replace(/\u2022/g, "\n")
    .replace(/•/g, "\n")
    .replace(/\s*;\s*/g, "\n")
    .replace(/,\s+(?=[A-ZÇĞİÖŞÜ])/g, "\n")
    .replace(/\.\s+(?=[A-ZÇĞİÖŞÜ])/g, ".\n")
    .split("\n")
    .map((item) => item.replace(/^[-•\s]+/, "").trim())
    .filter(Boolean)
    .filter((item) => item.length > 2);
}

function extractCriteria(text: string): JobCriteriaItem[] {
  if (!text) return [];

  const labelPattern = CRITERIA_LABELS.map((label) =>
    label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  ).join("|");

  let prepared = cleanText(text)
    .replace(/\u2022/g, "\n")
    .replace(/•/g, "\n");

  // Label'ların önüne satır kırılımı koy.
  // Böylece "3-7 yıl • Eğitim Seviyesi Üniversite..." tek kart olmaz.
  prepared = prepared.replace(
    new RegExp(`\\s*(${labelPattern})\\s*:?\\s*`, "gi"),
    "\n$1: "
  );

  const lines = prepared
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const criteria: JobCriteriaItem[] = [];
  let currentLabel = "";
  let currentValue = "";

  const labelRegex = new RegExp(`^(${labelPattern})\\s*:?\\s*(.*)$`, "i");

  for (const line of lines) {
    const match = line.match(labelRegex);

    if (match) {
      if (currentLabel && currentValue.trim()) {
        criteria.push({
          label: currentLabel,
          value: currentValue.trim(),
        });
      }

      currentLabel = match[1].trim();
      currentValue = (match[2] || "").trim();
    } else if (currentLabel) {
      currentValue += ` ${line}`;
    }
  }

  if (currentLabel && currentValue.trim()) {
    criteria.push({
      label: currentLabel,
      value: currentValue.trim(),
    });
  }

  return criteria;
}

export function formatJobDescription(rawText: string): JobSection[] {
  if (!rawText || !rawText.trim()) return [];

  let text = cleanText(rawText);

  text = text
    .replace(/\b(İş İlanı Hakkında|İş Hakkında)\b\s*:?/gi, "\n## İş Hakkında\n")
    .replace(/\b(Genel Nitelikler|Aranan Nitelikler|Nitelikler)\b\s*:?/gi, "\n## Genel Nitelikler\n")
    .replace(/\b(İş Tanımı|İŞ TANIMI|Pozisyonun Temel Amacı)\b\s*:?/g, "\n## İş Tanımı\n")
    .replace(/\b(Rol ve Sorumluluklar|Sorumluluklar|SORUMLULUKLAR|Görev Tanımı)\b\s*:?/g, "\n## Rol ve Sorumluluklar\n")
    .replace(/\b(Aday Kriterleri|ADAY KRİTERLERİ|Aranan Kriterler|Ek Bilgiler)\b\s*:?/g, "\n## Aday Kriterleri\n");

  const rawSections = text
    .split("\n## ")
    .map((part) => part.trim())
    .filter(Boolean);

  const sections: JobSection[] = [];

  for (const rawSection of rawSections) {
    const lines = rawSection
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) continue;

    const title = lines[0];
    const body = lines.slice(1).join("\n").trim();

    if (!body) continue;

    if (title === "İş Hakkında") {
      const aboutItems = splitListItems(body);

      sections.push({
        title,
        type: "text",
        text: aboutItems[0] || body,
      });

      if (aboutItems.length > 1) {
        sections.push({
          title: "Genel Nitelikler",
          type: "list",
          items: aboutItems.slice(1),
        });
      }

      continue;
    }

    if (title === "Aday Kriterleri") {
      const criteria = extractCriteria(body);

      sections.push({
        title,
        type: criteria.length > 0 ? "criteria" : "list",
        criteria: criteria.length > 0 ? criteria : undefined,
        items: criteria.length === 0 ? splitListItems(body) : undefined,
      });

      continue;
    }

    sections.push({
      title,
      type: "list",
      items: splitListItems(body),
    });
  }

  if (sections.length === 0) {
    return [
      {
        title: "İş Açıklaması",
        type: "text",
        text,
      },
    ];
  }

  return sections;
}