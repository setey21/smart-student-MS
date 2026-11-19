import { seedData } from "../data/seed.js";

export const schoolCollections = ["students", "teachers", "classes", "subjects", "attendance", "assignments", "assignmentSubmissions", "results", "research", "announcements", "timetable", "calendarEvents", "documents"];

export function migrateData(parsed) {
  const addNewSeeds = (parsed.schemaVersion || 0) < seedData.schemaVersion;
  const savedSchools = Array.isArray(parsed.schools) ? parsed.schools : [
    { ...seedData.schools[0], ...(parsed.school || {}) },
  ];
  const schools = [
    ...savedSchools,
    ...seedData.schools.filter((school) => !savedSchools.some((savedSchool) => savedSchool.id === school.id)),
  ];
  const migrated = { ...seedData, ...parsed, schools };
  delete migrated.school;
  const savedLevels = Array.isArray(parsed.educationLevels) ? parsed.educationLevels : [];
  migrated.educationLevels = [
    ...savedLevels.map((level) => ({
      ...seedData.educationLevels.find((seedLevel) => seedLevel.id === level.id),
      ...level,
      levels: [...new Set([
        ...(seedData.educationLevels.find((seedLevel) => seedLevel.id === level.id)?.levels || []),
        ...(Array.isArray(level.levels) ? level.levels : []),
      ])],
      active: level.active ?? true,
    })),
    ...seedData.educationLevels.filter((level) => !savedLevels.some((savedLevel) => savedLevel.id === level.id)),
  ];
  for (const collection of schoolCollections) {
    const records = Array.isArray(parsed[collection]) ? parsed[collection] : seedData[collection];
    const migratedRecords = records.map((record) => ({ ...record, schoolId: record.schoolId || "SCH-001" }));
    const extraSchoolSeeds = addNewSeeds
      ? seedData[collection].filter((record) => !migratedRecords.some((existing) => existing.id === record.id))
      : [];
    migrated[collection] = [...migratedRecords, ...extraSchoolSeeds].map((record) => {
      if (collection === "timetable") {
        const startTime = record.startTime || record.time || "08:00";
        const [hours, minutes] = startTime.split(":").map(Number);
        const end = hours * 60 + minutes + 60;
        const endTime = record.endTime || `${String(Math.floor(end / 60)).padStart(2, "0")}:${String(end % 60).padStart(2, "0")}`;
        return { ...record, startTime, endTime };
      }
      if (collection === "students") {
        const grade = String(record.grade || "");
        const gradeNumber = Number(grade);
        const educationStage = record.educationStage || (
          grade === "Class 0" ? "early-years" :
          gradeNumber >= 1 && gradeNumber <= 8 ? "primary" :
          gradeNumber >= 9 && gradeNumber <= 12 ? "secondary" :
          grade.toLowerCase().includes("master") || grade.toLowerCase().includes("doctoral") ? "postgraduate" :
          grade.toLowerCase().startsWith("year") ? "undergraduate" : "continuing"
        );
        return {
          ...record,
          educationStage,
          level: record.level || (gradeNumber ? `Grade ${grade}` : grade),
          program: record.program || (["undergraduate", "postgraduate"].includes(educationStage) ? "General program" : "General education"),
          enrolledCourseIds: record.enrolledCourseIds || seedData.students.find((student) => student.id === record.id)?.enrolledCourseIds || [],
        };
      }
      if (collection === "classes" && !record.educationStage) {
        const grade = String(record.grade || "");
        const gradeNumber = Number(grade);
        return {
          ...record,
          educationStage: grade === "Class 0" ? "early-years" :
            grade.toLowerCase().includes("undergraduate") ? "undergraduate" :
            grade.toLowerCase().includes("postgraduate") ? "postgraduate" :
            gradeNumber >= 1 && gradeNumber <= 8 ? "primary" :
            gradeNumber >= 9 && gradeNumber <= 12 ? "secondary" : "continuing",
        };
      }
      return record;
    });
  }
  migrated.schemaVersion = seedData.schemaVersion;
  return migrated;
}
