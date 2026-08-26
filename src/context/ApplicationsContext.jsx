import { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as applicationsApi from "../api/applications";
import { calculateQualityScore } from '../lib/qualityScoreCalculator';

const ApplicationsContext = createContext(null);

export function ApplicationsProvider({ children }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

   // Helper function to add quality scores to applications
  const enrichApplicationsWithScores = useCallback((apps) => {
    return apps.map(app => ({
      ...app,
      qualityScore: calculateQualityScore(app)
    }));
  }, []);

 const load = useCallback(() => {
  return applicationsApi
    .getApplications()
    .then((data) => {
      const enrichedData = enrichApplicationsWithScores(data);
      setApplications(enrichedData);
      setError(null);
    })
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, [enrichApplicationsWithScores]);

useEffect(() => {
  load();
}, [load]);

const refetch = useCallback(() => {
  setLoading(true);
  return load();
}, [load]);

  async function addApplication(data) {

    // Calculate quality score before sending
    const dataWithScore = {
      ...data,
      qualityScore: calculateQualityScore(data)
    };


    const created = await applicationsApi.createApplication(dataWithScore);
    const full = await applicationsApi.getApplication(created.id).catch(() => created);
    // Ensure quality score is on the returned object
    const enriched = {
      ...full,
      qualityScore: calculateQualityScore(full)
    };
    setApplications((prev) => [...prev, enriched]);
    return enriched;
  }

  async function patchApplication(id, patch) {
    // Calculate quality score for the patched application
    const currentApp = applications.find(a => a.id === id);
    if (!currentApp) throw new Error("Application not found");

    const updatedAppData = { ...currentApp, ...patch };
    const qualityScore = calculateQualityScore(updatedAppData);

    // Optimistic update with quality score
    setApplications((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, ...patch, qualityScore } : a
      )
    );
    try {
      const updated = await applicationsApi.updateApplication(id, patch);
      
      // Ensure quality score is on the returned object
      const enriched = {
        ...updated,
        qualityScore: calculateQualityScore(updated)
      };
      
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? enriched : a))
      );
      return enriched;
    } catch (err) {
      await refetch(); // Roll back on error
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