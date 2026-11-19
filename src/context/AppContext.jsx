import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { demoAccounts, seedData } from "../data/seed.js";
import { recordsForSchool, schoolIdsForUser } from "../utils/tenant.js";
import { migrateData, schoolCollections } from "../utils/migrateData.js";

const AppContext = createContext(null);
const STORAGE_KEY = "horizon-school-demo-v1";
const SESSION_KEY = "horizon-school-session-v1";
const SCHOOL_KEY = "horizon-school-active-id-v1";
function readStoredData() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) return { data: seedData, warning: "" };
    const parsed = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.students)) {
      return { data: seedData, warning: "Saved demo data was invalid. Seed data was loaded instead." };
    }
    return { data: migrateData(parsed), warning: "" };
  } catch {
    return { data: seedData, warning: "Saved demo data could not be read. Seed data was loaded instead." };
  }
}

function readActiveSchool() {
  try {
    return window.localStorage.getItem(SCHOOL_KEY) || "SCH-001";
  } catch {
    return "SCH-001";
  }
}

function readSession() {
  try {
    const session = JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null");
    return demoAccounts.find((account) => account.id === session?.id) || null;
  } catch {
    return null;
  }
}

export function AppProvider({ children }) {
  const [initial] = useState(readStoredData);
  const [data, setData] = useState(initial.data);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [user, setUser] = useState(readSession);
  const [previewRole, setPreviewRole] = useState("");
  const [activeSchoolId, setActiveSchoolId] = useState(readActiveSchool);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageWarning((current) => current.startsWith("Could not save") ? "" : current);
    } catch {
      setStorageWarning("Could not save demo data in this browser. Changes may not persist after refresh.");
    }
  }, [data]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SCHOOL_KEY, activeSchoolId);
    } catch {
      setStorageWarning("Could not save the selected school in this browser.");
    }
  }, [activeSchoolId]);

  const allowedSchoolIds = schoolIdsForUser(user, data.schools);
  const selectedSchoolId = allowedSchoolIds.includes(activeSchoolId)
    ? activeSchoolId
    : allowedSchoolIds[0] || data.schools[0]?.id || "SCH-001";
  const activeSchool = data.schools.find((school) => school.id === selectedSchoolId) || data.schools[0];
  const scopedData = useMemo(() => {
    const scoped = {
      ...data,
      schools: user?.role === "super-admin" ? data.schools : data.schools.filter((school) => school.id === selectedSchoolId),
      school: activeSchool,
    };
    for (const collection of schoolCollections) {
      scoped[collection] = recordsForSchool(data[collection] || [], selectedSchoolId);
    }
    return scoped;
  }, [data, activeSchool, selectedSchoolId, user]);

  const login = (email, password) => {
    const found = demoAccounts.find((account) =>
      account.email.toLowerCase() === email.trim().toLowerCase() && account.password === password,
    );
    if (!found) return false;
    setUser(found);
    setPreviewRole("");
    setActiveSchoolId(found.role === "super-admin" ? data.schools[0]?.id : found.schoolId);
    try {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify({ id: found.id }));
    } catch {
      setStorageWarning("Signed in for this session, but the browser could not save the session.");
    }
    return true;
  };

  const logout = () => {
    setUser(null);
    setPreviewRole("");
    try {
      window.localStorage.removeItem(SESSION_KEY);
    } catch {
      setStorageWarning("Could not clear the saved demo session from this browser.");
    }
  };

  const updateCollection = (collection, transform) => {
    setData((current) => ({ ...current, [collection]: transform(current[collection] || []) }));
  };

  const resetDemo = () => {
    setData(seedData);
    setStorageWarning("");
  };

  const value = useMemo(() => ({
    data: scopedData,
    user,
    schoolId: selectedSchoolId,
    schoolOptions: user?.role === "super-admin"
      ? data.schools.filter((school) => allowedSchoolIds.includes(school.id))
      : [activeSchool],
    viewRole: previewRole || user?.role,
    previewRole,
    storageWarning,
    login,
    logout,
    updateCollection,
    resetDemo,
    selectSchool: (schoolId) => {
      if (user?.role === "super-admin" && allowedSchoolIds.includes(schoolId)) {
        setActiveSchoolId(schoolId);
        setPreviewRole("");
      }
    },
    setPreviewRole: (role) => {
      if (user?.role === "director" && ["teacher", "student", ""].includes(role)) setPreviewRole(role);
    },
  }), [data, scopedData, user, previewRole, storageWarning, selectedSchoolId, activeSchool, allowedSchoolIds]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside AppProvider.");
  return context;
}
