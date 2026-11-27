import { useState } from "react";
import toast from "react-hot-toast";
import EditDialog from "../components/EditDialog.jsx";
import { useContent } from "../context/ContentContext.jsx";
import { createItem, deleteItem, reorderItems, updateItem } from "../services/api.js";

const capitalize = (text) => text.charAt(0).toUpperCase() + text.slice(1);

// Gives a section its add, edit, delete and reorder actions, and the dialog they open.
export function useCollectionEditor({ collection, label, fields }) {
  const { reload } = useContent();
  const [editing, setEditing] = useState(null);

  async function save(payload) {
    const isEdit = Boolean(editing?.item);
    if (isEdit) await updateItem(collection, editing.item.id, payload);
    else await createItem(collection, payload);
    setEditing(null);
    await reload();
    toast.success(`${capitalize(label)} ${isEdit ? "updated" : "added"}`);
  }

  async function remove(item) {
    if (!window.confirm(`Delete this ${label}? This can't be undone.`)) return;
    try {
      await deleteItem(collection, item.id);
      await reload();
      toast.success(`${capitalize(label)} deleted`);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function move(items, index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const ids = items.map((item) => item.id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    try {
      await reorderItems(collection, ids);
      await reload();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const dialog = (
    <EditDialog
      open={Boolean(editing)}
      title={editing?.item ? `Edit ${label}` : `Add ${label}`}
      fields={fields}
      item={editing?.item ?? null}
      onClose={() => setEditing(null)}
      onSubmit={save}
    />
  );

  return {
    openCreate: () => setEditing({ item: null }),
    openEdit: (item) => setEditing({ item }),
    remove,
    move,
    dialog,
  };
}
