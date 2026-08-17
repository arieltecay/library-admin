export function exportToCSV<T extends object>(data: T[], filename: string, headers?: (keyof T | string)[]) {
  if (!data || !data.length) return;

  const getKeys = () => {
    if (headers) return headers;
    return Object.keys(data[0]) as (keyof T)[];
  };

  const keys = getKeys();

  const csvContent = [
    keys.join(","), // Header row
    ...data.map((item) =>
      keys
        .map((key) => {
          const val = item[key as keyof T];
          // Escape quotes and wrap in quotes if there's a comma, quote, or newline
          if (val === null || val === undefined) return "";
          const strVal = String(val);
          if (strVal.includes(",") || strVal.includes("\"") || strVal.includes("\n")) {
            return `"${strVal.replace(/"/g, "\"\"")}"`;
          }
          return strVal;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // UTF-8 BOM
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
