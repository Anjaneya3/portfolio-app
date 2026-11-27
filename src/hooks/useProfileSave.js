import toast from "react-hot-toast";
import { useContent } from "../context/ContentContext.jsx";
import { saveProfile } from "../services/api.js";

// Saves changes to the profile. The full profile is sent, with the changed fields applied.
export function useProfileSave(profile) {
  const { reload } = useContent();

  return async function save(changes) {
    await saveProfile({ ...profile, ...changes });
    await reload();
    toast.success("Changes saved");
  };
}
