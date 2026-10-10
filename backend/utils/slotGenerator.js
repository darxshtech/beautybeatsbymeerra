// Convert "10:30 AM" or "08:00 PM" to minutes from 00:00
function timeStringToMinutes(timeStr) {
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return 0;
  let [_, hours, minutes, ampm] = match;
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  if (ampm) {
    ampm = ampm.toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
  }
  return h * 60 + m;
}

// Convert minutes to "10:30 AM"
function minutesToTimeString(totalMinutes) {
  let h = Math.floor(totalMinutes / 60) % 24;
  const m = totalMinutes % 60;
  const ampm = h >= 12 ? 'PM' : 'AM';
  let displayH = h % 12;
  if (displayH === 0) displayH = 12;
  const hh = displayH < 10 ? `0${displayH}` : `${displayH}`;
  const mm = m < 10 ? `0${m}` : `${m}`;
  return `${hh}:${mm} ${ampm}`;
}

// Generate slot intervals between open and close time
function generateSlots(openingTime, closingTime, interval = 30) {
  const openMinutes = timeStringToMinutes(openingTime);
  const closeMinutes = timeStringToMinutes(closingTime);
  const slots = [];
  for (let current = openMinutes; current < closeMinutes; current += interval) {
    slots.push(minutesToTimeString(current));
  }
  return slots;
}

module.exports = {
  timeStringToMinutes,
  minutesToTimeString,
  generateSlots
};
