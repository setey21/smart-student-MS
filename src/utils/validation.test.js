import test from "node:test";
import assert from "node:assert/strict";
import { demoAccounts } from "../data/seed.js";
import { seedData } from "../data/seed.js";
import { recordsForSchool, schoolIdsForUser } from "./tenant.js";
import { createCsv } from "./csv.js";
import { isValidEmail, normalizeEmail } from "./validation.js";
import { migrateData } from "./migrateData.js";
import { validateUpload, MAX_UPLOAD_BYTES } from "./fileUploads.js";
import { hasScheduleConflict, validateSchoolSlot } from "./schedule.js";

test("the three specified school demo accounts keep their exact credentials", () => {
  const expected = [
    ["admin@school.com", "Admin123", "director"],
    ["teacher@school.com", "Teacher123", "teacher"],
    ["student@school.com", "Student123", "student"],
  ];

  for (const [email, password, role] of expected) {
    assert.ok(demoAccounts.some((account) =>
      account.email === email && account.password === password && account.role === role
    ));
  }
});

test("the seeded Super Admin has a dedicated platform account", () => {
  assert.ok(demoAccounts.some((account) =>
    account.role === "super-admin" &&
    account.email === "superadmin@sr-ems.com" &&
    account.password === "SuperAdmin123"
  ));
});

test("school directors are limited to their assigned school while Super Admin can select all schools", () => {
  const schools = [{ id: "SCH-001" }, { id: "SCH-002" }, { id: "SCH-003" }];
  const director = demoAccounts.find((account) => account.role === "director");
  const superAdmin = demoAccounts.find((account) => account.role === "super-admin");
  assert.deepEqual(schoolIdsForUser(director, schools), ["SCH-001"]);
  assert.deepEqual(schoolIdsForUser(superAdmin, schools), ["SCH-001", "SCH-002", "SCH-003"]);
});

test("accepts Gmail and valid school email addresses without requiring Gmail", () => {
  assert.equal(isValidEmail("admin@school.com"), true);
  assert.equal(isValidEmail("student@gmail.com"), true);
  assert.equal(isValidEmail("first.last+class@school.example"), true);
});

test("accepts internationalized mailbox and domain characters", () => {
  assert.equal(isValidEmail("élève@école.example"), true);
});

test("rejects malformed or overlong email addresses", () => {
  assert.equal(isValidEmail("no-at-sign"), false);
  assert.equal(isValidEmail("two@@school.com"), false);
  assert.equal(isValidEmail(".student@school.com"), false);
  assert.equal(isValidEmail("student..name@school.com"), false);
  assert.equal(isValidEmail("student@-school.com"), false);
  assert.equal(isValidEmail(`${"a".repeat(65)}@school.com`), false);
});

test("normalizes addresses for duplicate checks", () => {
  assert.equal(normalizeEmail("  STUDENT@School.COM "), "student@school.com");
});

test("demo schools have separate student records", () => {
  const firstSchool = recordsForSchool(seedData.students, "SCH-001");
  const secondSchool = recordsForSchool(seedData.students, "SCH-002");

  assert.ok(firstSchool.some((student) => student.id === "S-1001"));
  assert.ok(firstSchool.every((student) => student.schoolId === "SCH-001"));
  assert.ok(secondSchool.some((student) => student.id === "S-2001"));
  assert.ok(secondSchool.every((student) => student.schoolId === "SCH-002"));
});

test("the education catalog and demo data cover Class 0 through postgraduate study", () => {
  const stages = seedData.educationLevels.map((stage) => stage.id);
  assert.ok(stages.includes("early-years"));
  assert.ok(stages.includes("primary"));
  assert.ok(stages.includes("secondary"));
  assert.ok(stages.includes("tvet"));
  assert.ok(stages.includes("undergraduate"));
  assert.ok(stages.includes("postgraduate"));
  assert.ok(seedData.students.some((student) => student.grade === "Class 0"));
  assert.ok(seedData.students.some((student) => student.educationStage === "tvet"));
  assert.ok(seedData.students.some((student) => student.educationStage === "undergraduate"));
  assert.ok(seedData.students.some((student) => student.educationStage === "postgraduate"));
  assert.equal(seedData.schools.length, 4);
});

test("migrates existing browser data to include the new TVET institution and records", () => {
  const legacyData = {
    ...seedData,
    schemaVersion: seedData.schemaVersion - 1,
    schools: seedData.schools.filter((school) => school.id !== "SCH-004"),
  };
  for (const collection of ["students", "teachers", "classes", "subjects", "attendance", "assignments", "results", "research", "announcements", "timetable"]) {
    legacyData[collection] = seedData[collection].filter((record) => record.schoolId !== "SCH-004");
  }

  const migrated = migrateData(legacyData);

  assert.ok(migrated.schools.some((school) => school.id === "SCH-004"));
  assert.ok(migrated.students.some((student) => student.id === "S-4001"));
  assert.ok(migrated.subjects.some((subject) => subject.id === "TV-203"));
});

test("migrates newly added calendar events into existing school data", () => {
  const migrated = migrateData({
    ...seedData,
    schemaVersion: seedData.schemaVersion - 1,
    calendarEvents: [],
    documents: [],
  });
  assert.ok(migrated.calendarEvents.some((event) => event.id === "EV-004" && event.schoolId === "SCH-004"));
});

test("migrates assignment submissions as school-scoped records", () => {
  const migrated = migrateData({
    ...seedData,
    schemaVersion: seedData.schemaVersion - 1,
    assignmentSubmissions: [{ id: "SUB-legacy", assignmentId: "AS-01", studentId: "S-1001" }],
  });
  assert.deepEqual(migrated.assignmentSubmissions[0], {
    id: "SUB-legacy",
    assignmentId: "AS-01",
    studentId: "S-1001",
    schoolId: "SCH-001",
  });
  assert.deepEqual(recordsForSchool(migrated.assignmentSubmissions, "SCH-002"), []);
});

test("migrates legacy timetable entries into full-day schedule slots", () => {
  const migrated = migrateData({
    ...seedData,
    schemaVersion: seedData.schemaVersion - 1,
    timetable: [{ id: "legacy-session", day: "Friday", time: "16:00", subject: "Math", className: "7 Green", teacher: "Daniel Tadesse", schoolId: "SCH-001" }],
  });
  const session = migrated.timetable.find((item) => item.id === "legacy-session");
  assert.equal(session.startTime, "16:00");
  assert.equal(session.endTime, "17:00");
});

test("accepts only supported PDF and Word files within the upload limit", () => {
  assert.equal(validateUpload({ name: "report.PDF", size: 1024 }), "");
  assert.equal(validateUpload({ name: "essay.docx", size: 1024 }), "");
  assert.match(validateUpload({ name: "image.png", size: 1024 }), /Only PDF and Word/);
  assert.match(validateUpload({ name: "too-large.doc", size: MAX_UPLOAD_BYTES + 1 }), /10 MB or smaller/);
});

test("validates weekday school hours and blocks overlapping class or teacher sessions", () => {
  assert.equal(validateSchoolSlot("Monday", "08:00", "09:30"), "");
  assert.match(validateSchoolSlot("Saturday", "08:00", "09:00"), /Monday through Friday/);
  assert.match(validateSchoolSlot("Friday", "16:30", "17:30"), /08:00 and 17:00/);
  const sessions = [{ id: "a", day: "Monday", startTime: "09:00", endTime: "10:00", classId: "C1", teacher: "Teacher One" }];
  assert.equal(hasScheduleConflict(sessions, { day: "Monday", startTime: "09:30", endTime: "10:30", classId: "C2", teacher: "Teacher One" }), true);
  assert.equal(hasScheduleConflict(sessions, { day: "Monday", startTime: "10:00", endTime: "11:00", classId: "C1", teacher: "Teacher One" }), false);
});

test("school record scoping treats legacy records as belonging to the original school", () => {
  const rows = [{ id: "legacy" }, { id: "other", schoolId: "SCH-002" }];
  assert.deepEqual(recordsForSchool(rows, "SCH-001"), [{ id: "legacy" }]);
  assert.deepEqual(recordsForSchool(rows, "SCH-002"), [{ id: "other", schoolId: "SCH-002" }]);
});

test("CSV export escapes commas, quotes, and line breaks", () => {
  const csv = createCsv([{ title: 'Book, "A"\nsecond line' }], [["title", "Assignment"]]);
  assert.equal(csv, 'Assignment\r\n"Book, ""A""\nsecond line"');
});
