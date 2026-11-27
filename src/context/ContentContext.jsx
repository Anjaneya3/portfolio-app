import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { fetchContent } from "../services/api.js";

const ContentContext = createContext(null);

// Loads the portfolio from the server. Call reload() after any change so the page shows the new content.
export function ContentProvider({ children }) {
  const [content, setContent] = useState(null);
  const [status, setStatus] = useState("loading");

  const reload = useCallback(async () => {
    try {
      setContent(await fetchContent());
      setStatus("ready");
    } catch {
      setStatus((current) => (current === "ready" ? "ready" : "error"));
      toast.error("Couldn't refresh the content. Check your connection and try again.");
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const value = useMemo(() => ({ content, status, reload }), [content, status, reload]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used inside ContentProvider");
  return context;
}
