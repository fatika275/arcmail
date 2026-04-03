export function renderTemplate(
  template: string,
  values: Record<string, string>
) {
  return template.replace(/{{(.*?)}}/g, (_, key) => {
    const cleanKey = String(key).trim();
    return values[cleanKey]?.trim() || `{{${cleanKey}}}`;
  });
}