"use client";

import { CONTROL_CLASS_NAME, Icon } from "@luch/shared/ui";
import { joinClassNames } from "@luch/shared/lib";
import { useEffect, useEffectEvent, useState } from "react";
import { LIST_TEXT, SEARCH_DEBOUNCE_MS } from "@/shared/config";

interface ISearchFieldProps {
  value: string;
  placeholder: string;
  onSearch: (value: string) => void;
}

export const SearchField = ({ value, placeholder, onSearch }: ISearchFieldProps) => {
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const [sentValue, setSentValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    if (value !== sentValue) setDraft(value);
  }

  const submit = (nextValue: string) => {
    setSentValue(nextValue);
    onSearch(nextValue);
  };
  const submitAfterPause = useEffectEvent(submit);

  useEffect(() => {
    const nextValue = draft.trim();
    if (nextValue === value) return;

    const timer = setTimeout(() => submitAfterPause(nextValue), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, value]);

  const clear = () => {
    setDraft("");
    submit("");
  };

  return (
    <div className="relative w-full sm:max-w-xs">
      <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-gray-400" />
      <input
        type="search"
        value={draft}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => setDraft(event.target.value)}
        className={joinClassNames(CONTROL_CLASS_NAME, "border-gray-200 pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden")}
      />
      {draft && (
        <button
          type="button"
          onClick={clear}
          aria-label={LIST_TEXT.clearSearch}
          className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-gray-400 transition hover:bg-gray-100 hover:text-ink"
        >
          <Icon name="close" className="size-3.5" />
        </button>
      )}
    </div>
  );
};
