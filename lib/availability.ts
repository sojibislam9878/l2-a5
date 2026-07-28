import type { Availability, WeekDay } from "./types";

export const WEEKDAYS: WeekDay[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

export const DAY_LABELS: Record<WeekDay, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);

  return Number.isFinite(hours) && Number.isFinite(minutes)
    ? hours * 60 + minutes
    : null;
};

export const formatTime = (time: string) => {
  const total = toMinutes(time);

  if (total === null) {
    return time;
  }

  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours < 12 ? "AM" : "PM";
  const display = hours % 12 === 0 ? 12 : hours % 12;

  return `${display}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

export const slotsForDate = (date: Date, slots: Availability[]) => {
  const day = WEEKDAYS[date.getDay()];

  return slots.filter((slot) => slot.day === day);
};

export const isWithinAvailability = (date: Date, slots: Availability[]) => {
  if (!slots.length) {
    return true;
  }

  const daySlots = slotsForDate(date, slots);

  if (!daySlots.length) {
    return false;
  }

  const target = date.getHours() * 60 + date.getMinutes();

  return daySlots.some((slot) => {
    const start = toMinutes(slot.start_time);
    const end = toMinutes(slot.end_time);

    return start !== null && end !== null && target >= start && target <= end;
  });
};

export const groupByDay = (slots: Availability[]) =>
  WEEKDAYS.map((day) => ({
    day,
    slots: slots.filter((slot) => slot.day === day),
  })).filter((entry) => entry.slots.length > 0);
