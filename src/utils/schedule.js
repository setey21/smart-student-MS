export const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const OPEN_MINUTE = 8 * 60;
const CLOSE_MINUTE = 17 * 60;

export function timeToMinutes(time) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(time || ""));
  return match ? Number(match[1]) * 60 + Number(match[2]) : NaN;
}

export function validateSchoolSlot(day, startTime, endTime) {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (!WEEK_DAYS.includes(day)) return "Choose a weekday from Monday through Friday.";
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < OPEN_MINUTE || end > CLOSE_MINUTE || end <= start) {
    return "Choose a time between 08:00 and 17:00, with the end later than the start.";
  }
  if (start % 30 !== 0 || end % 30 !== 0) return "Start and end times must use 30-minute intervals.";
  return "";
}

export function hasScheduleConflict(sessions, proposed) {
  const start = timeToMinutes(proposed.startTime);
  const end = timeToMinutes(proposed.endTime);
  return sessions.some((session) => {
    if (session.id === proposed.id || session.day !== proposed.day) return false;
    const sameResource = (proposed.classId && session.classId === proposed.classId) ||
      (proposed.teacher && session.teacher === proposed.teacher);
    return sameResource && start < timeToMinutes(session.endTime) && end > timeToMinutes(session.startTime);
  });
}
