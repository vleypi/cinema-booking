const PLURAL_RULES = new Intl.PluralRules("ru-RU");

export const pluralize = (count: number, forms: Record<"one" | "few" | "many", string>): string => {
  const rule = PLURAL_RULES.select(count);

  return rule === "one" || rule === "few" ? forms[rule] : forms.many;
};
