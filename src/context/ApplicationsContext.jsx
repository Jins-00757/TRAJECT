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
    let cancelled = false;

    applicationsApi.getApplications()
      .then((data) => {
        if (!cancelled) {
          setApplications(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  async function addApplication(data) {
    const created = await applicationsApi.createApplication(data);
    setApplications((prev) => [...prev, created]);
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
    setApplications((prev) => prev.filter((a) => a.id !== id));
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