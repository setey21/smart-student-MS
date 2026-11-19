export function recordsForSchool(records, schoolId) {
  return records.filter((record) => (record.schoolId || "SCH-001") === schoolId);
}

export function schoolIdsForUser(user, schools) {
  if (user?.role === "super-admin") return schools.map((school) => school.id);
  return user?.schoolId ? [user.schoolId] : [];
}
