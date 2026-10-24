const INITIALS_WORD_COUNT = 2;

export const getInitials = (fullName: string): string =>
  fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, INITIALS_WORD_COUNT)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
