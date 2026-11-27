import { useEffect, useState } from "react";

// Returns true only when the file exists and has the expected type. Some hosts answer a missing
// file with the home page, so the content type is checked as well as the status.
export function useFileAvailable(url, expectedType) {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (!url) {
      setAvailable(false);
      return undefined;
    }
    let active = true;

    fetch(url, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        const type = response.headers.get("content-type") || "";
        if (active) setAvailable(response.ok && type.includes(expectedType));
      })
      .catch(() => {
        if (active) setAvailable(false);
      });

    return () => {
      active = false;
    };
  }, [url, expectedType]);

  return available;
}
