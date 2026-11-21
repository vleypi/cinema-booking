import { Button, FormError, Icon } from "@luch/shared/ui";
import { EDIT_LAYOUT_TEXT } from "@/features/edit-hall-layout/constants/edit-hall-layout.constant";

interface ILayoutFooterProps {
  seatsCount: number;
  rowsCount: number;
  version: number | undefined;
  isDirty: boolean;
  isSaving: boolean;
  isSaved: boolean;
  canReset: boolean;
  saveError: string | undefined;
  onReset: () => void;
  onSave: () => void;
}

export const LayoutFooter = ({ seatsCount, rowsCount, version, isDirty, isSaving, isSaved, canReset, saveError, onReset, onSave }: ILayoutFooterProps) => (
  <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white/90 px-5 py-3 shadow-sm backdrop-blur">
    <p className="text-sm text-gray-500 tabular-nums">
      <b className="font-semibold text-ink">{seatsCount}</b> {EDIT_LAYOUT_TEXT.seats} · <b className="font-semibold text-ink">{rowsCount}</b>{" "}
      {EDIT_LAYOUT_TEXT.rowsCount} · {version ? `${EDIT_LAYOUT_TEXT.version} ${version}` : EDIT_LAYOUT_TEXT.noLayout}
    </p>
    <FormError message={saveError} />
    <div className="flex items-center gap-2">
      {isSaved && !isDirty && (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-brand">
          <Icon name="check" className="size-4" />
          {EDIT_LAYOUT_TEXT.saved}
        </span>
      )}
      {canReset && isDirty && (
        <Button variant="ghost" onClick={onReset} disabled={isSaving}>
          {EDIT_LAYOUT_TEXT.reset}
        </Button>
      )}
      <Button isLoading={isSaving} disabled={!isDirty || seatsCount === 0} onClick={onSave}>
        {EDIT_LAYOUT_TEXT.save}
      </Button>
    </div>
  </div>
);
