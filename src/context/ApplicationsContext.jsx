import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as applicationsApi from "../api/applications";

const ApplicationsContext = createContext(null);

export function ApplicationsProvider({ children }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    setLoading(true);
    return applicationsApi.getApplications()
      .then((data) => { setApplications(data); setError(null); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

   useEffect(() => {
    refetch();
  }, [refetch]);

  async function addApplication(data) {
    const created = await applicationsApi.createApplication(data);
    const full = await applicationsApi.getApplication(created.id).catch(() => created);
    setApplications((prev) => [...prev, full]);
    return created;
  }

  async function patchApplication(id, patch) {
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
    try {
      const updated = await applicationsApi.updateApplication(id, patch);
      setApplications((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      await refetch(); // roll the optimistic change back to server truth
      throw err;
    }
  }

  async function removeApplication(id) {
    await applicationsApi.deleteApplication(id);
     setApplications((prev) => prev.filter((a) => String(a.id) !== String(id)));
  }

  return (
    <ApplicationsContext.Provider value={{ applications, loading, error, refetch, addApplication, patchApplication, removeApplication }}>
      {children}
    </ApplicationsContext.Provider>
  );
}

// This hook intentionally shares the context module's public API with the provider.
// eslint-disable-next-line react-refresh/only-export-components
export function useApplications() {
  const ctx = useContext(ApplicationsContext);
  if (!ctx) throw new Error("useApplications must be used inside <ApplicationsProvider>");
  return ctx;
}