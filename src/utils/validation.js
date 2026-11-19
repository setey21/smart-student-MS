const localPartCharacters = /^[\p{L}\p{N}!#$%&'*+/=?^_`{|}~.-]+$/u;
const domainLabelCharacters = /^[\p{L}\p{N}-]+$/u;

export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export function isValidEmail(value) {
  const email = String(value || "").trim();
  if (!email || email.length > 254 || /[\s<>(),;:"[\]\\]/u.test(email)) return false;

  const atIndex = email.lastIndexOf("@");
  if (atIndex < 1 || atIndex !== email.indexOf("@")) return false;

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  if (
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !localPartCharacters.test(localPart)
  ) return false;

  const labels = domain.split(".");
  if (labels.length < 2 || labels.some((label) =>
    !label || label.length > 63 || label.startsWith("-") || label.endsWith("-") ||
    !domainLabelCharacters.test(label)
  )) return false;

  return labels[labels.length - 1].length >= 2;
}
