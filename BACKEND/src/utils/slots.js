/**
 * availability: array of { dayOfWeek?, date?, startTime, endTime }
 * targetDate: Date object (already PKT midnight)
 * returns array of slot strings like "09:00"
 */
export const generateSlotsForDate = (availability, targetDate) => {
  const weekday = [
    "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
  ][targetDate.getDay()];

  const slots = [];
  const pad = (num) => String(num).padStart(2, "0");

  for (const rule of availability) {
    // Skip if rule doesn't match this day
    if (rule.date) {
      const ruleDate = new Date(rule.date);
      if (ruleDate.toDateString() !== targetDate.toDateString()) continue;
    } else if (rule.dayOfWeek && rule.dayOfWeek !== weekday) {
      continue;
    }

    //  Normalize start/end time in PKT
    const startTimeStr =
      typeof rule.startTime === "number"
        ? `${pad(rule.startTime)}:00`
        : rule.startTime;
    const endTimeStr =
      typeof rule.endTime === "number"
        ? `${pad(rule.endTime)}:00`
        : rule.endTime;

    let [startHour, startMin] = startTimeStr.split(":").map(Number);
    let [endHour, endMin] = endTimeStr.split(":").map(Number);

    // Generate slots in PKT (no UTC conversion here)
    while (startHour < endHour || (startHour === endHour && startMin < endMin)) {
      slots.push(`${pad(startHour)}:${pad(startMin)}`);
      startMin += 30;
      if (startMin >= 60) {
        startHour += 1;
        startMin = 0;
      }
    }
  }

  return Array.from(new Set(slots)).sort();
};