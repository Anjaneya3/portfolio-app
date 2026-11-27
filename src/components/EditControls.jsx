import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { buttonClasses } from "./Button.jsx";

// A button that only the owner sees, for adding or editing a whole section.
export function ActionButton({ label, onClick, icon: Icon = Plus }) {
  return (
    <button type="button" onClick={onClick} className={`${buttonClasses("secondary")} py-2`}>
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}

function IconButton({ label, onClick, disabled = false, children }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-rule text-muted transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

// Move, edit and delete buttons shown beside each item, for the owner only.
export function ItemControls({ label, isFirst, isLast, onEdit, onDelete, onMoveUp, onMoveDown }) {
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <IconButton label={`Move ${label} up`} onClick={onMoveUp} disabled={isFirst}>
        <ArrowUp size={16} aria-hidden="true" />
      </IconButton>
      <IconButton label={`Move ${label} down`} onClick={onMoveDown} disabled={isLast}>
        <ArrowDown size={16} aria-hidden="true" />
      </IconButton>
      <IconButton label={`Edit ${label}`} onClick={onEdit}>
        <Pencil size={15} aria-hidden="true" />
      </IconButton>
      <IconButton label={`Delete ${label}`} onClick={onDelete}>
        <Trash2 size={15} aria-hidden="true" />
      </IconButton>
    </div>
  );
}
