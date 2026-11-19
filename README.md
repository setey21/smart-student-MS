# SR-EMS — Smart Education Management System Demo

A responsive, frontend-only, multi-institution education management demonstration built with React, Vite, React Router, Recharts, Lucide icons, and browser LocalStorage.

## Run locally

1. Install Node.js (LTS).
2. In this folder, run `npm install`.
3. Run `npm run dev`.
4. Open the local URL printed by Vite.

Create a production build with `npm run build`.

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@sr-ems.com` | `SuperAdmin123` |
| Director | `admin@school.com` | `Admin123` |
| Teacher | `teacher@school.com` | `Teacher123` |
| Grade 2 student | `student@school.com` | `Student123` |
| Grade 7 student | `mikael@school.com` | `Student123` |
| Grade 11 student | `selam@school.com` | `Student123` |
| Green Valley Grade 5 student | `student@greenvalley.edu` | `Student123` |
| Class 0 student | `student0@school.com` | `Student123` |
| Unity University undergraduate | `student@unity.edu` | `Student123` |
| Unity University postgraduate | `postgrad@unity.edu` | `Student123` |
| Unity University teacher | `teacher@unity.edu` | `Teacher123` |
| Merit TVET student | `tvet@merit.edu` | `Student123` |

Use the Class 0 and Grade 2 accounts to see early-years and younger learner experiences. Grade 7 and Grade 11 demonstrate primary/secondary records. The Merit account demonstrates a vocational program, and the Unity University accounts demonstrate undergraduate and postgraduate programs.

## Included in this first implementation

- Shared login and role-aware routes for Super Admin, Director, Teacher, and Student.
- A Super Admin workspace for platform-level institution selection and school workspace management. Only the Super Admin can create or edit institution workspaces.
- Student dashboards, records, assignments, and results are scoped to the signed-in demo student.
- Director dashboard preview for the teacher and student experiences.
- Four demo institutions with school-scoped records: two K–12 schools, one university, and one TVET college. The Director account is limited to Horizon International School; only the Super Admin can switch institutions.
- Director can add and edit school workspaces from the Schools page; school IDs are carried on each school-owned record.
- Student, teacher, class, subject, assignment, announcement, results, attendance, and timetable views.
- A month calendar with event scheduling, audience, date/time, all-day options, editing, and event PDF export.
- A Monday–Friday timetable with a full 08:00–17:00 grid, half-hour scheduling, duration controls, overlap prevention, and PDF export.
- PDF reports for data tables and school reports, alongside CSV exports.
- PDF and Word uploads (up to 10 MB) from record forms and the Documents library; files remain in this browser’s IndexedDB.
- Teachers can share assignment details and further explanations with a class, attach worksheets, and generate assignment PDFs. Students can download instructions, submit or replace their completed PDF/Word work, and assigned teachers and school administrators can review and download submissions.
- LocalStorage persistence, search, basic record forms, edit/delete actions, and demo reset.
- Responsive layouts, sample school activity, and charts.
- Email fields are validated as general email addresses; Gmail is accepted, but `@gmail.com` is not required. The supplied `@school.com` demo sign-ins remain valid.
- Education stages are data-driven: Nursery/KG/Class 0, Grades 1–12, TVET, undergraduate, postgraduate, and continuing education. Directors can edit the education-stage catalog in the Education Structure page.
- Only the Super Admin can create/edit institution workspaces. Directors can maintain the education-stage catalog for their assigned school; inactive levels are retained for historical records.
- University demo students can view enrolled courses, credit progress, and research/capstone milestones.
- CSV download is available for the visible data-table records.

## Important limitations

This is a learning/demo application, not a production school information system. Authentication and permissions run in the browser and are not security controls. Demo credentials and records can be inspected or changed by a user. Do not enter real student data. Uploaded documents and assignment submissions are local to the current browser and will not sync to another device; clearing browser storage can remove them. Notifications, QR attendance, and parent updates are not connected to real services.

The current data is fictional. Grade groupings are display guidance and should be configured to match the school’s own educational structure. Every school record carries a school ID and the UI filters records to the selected school; students and teachers are bound to their assigned demo school. This demonstrates tenant-aware data organization, but browser-side filtering is not secure tenant isolation. A real multi-school service must enforce school membership and every data access on a server.

The shared portal supports students from Class 0 through postgraduate study, while allowing each institution to use its own school type, program, cohort, course, and academic term labels. The demo currently implements common student/teacher workflows across these levels. University-specific production features—credit and GPA policy configuration, prerequisite enforcement, thesis supervision, formal transcript approval, and graduation audits—need institution-specific rules and are future implementation work; do not treat the sample percentages as official GPA or graduation decisions.

## Planned implementation phases

This is being built incrementally; the current version is a working foundation, not the complete SR-EMS specification.

1. **Foundation:** authentication demo, tenant-aware sample data, role routes, education-stage catalog, and responsive layouts.
2. **Core academics:** strengthen student/staff records, education structures, course/section registration, attendance, assessments, assignments, and results.
3. **Institution workflows:** parent portal, admissions, promotion, registrar workflows, and role-specific permission definitions.
4. **Operations and reporting:** notifications, library, simulated finance, HR, advanced reporting, and dashboards.
5. **Quality and polish:** accessibility review, responsive testing, data migration coverage, localization framework, backups, and complete role-by-role acceptance tests.

The front-end demo can illustrate these workflows with fictional data, but it cannot safely manage real institutions or student data. Server-side tenant authorization, authentication, and privacy controls are required before production use.

Email validation follows a practical international-aware format check and duplicate-address check for school records. It does not verify that an address exists or that its owner controls it; real verification requires an email service and backend.
