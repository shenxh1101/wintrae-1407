import { format, parseISO, startOfWeek, endOfWeek, addDays, differenceInYears } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export function formatDate(date: string | Date, formatStr: string = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, formatStr, { locale: zhCN });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy-MM-dd HH:mm', { locale: zhCN });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'HH:mm', { locale: zhCN });
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date; days: Date[] } {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDays(start, i));
  }
  return { start, end, days };
}

export function getDayOfWeek(date: Date): string {
  return format(date, 'EEEE', { locale: zhCN });
}

export function getShortDayOfWeek(date: Date): string {
  return format(date, 'E', { locale: zhCN });
}

export function calculateAge(birthDate: string): number {
  return differenceInYears(new Date(), parseISO(birthDate));
}

export function getMonthLabel(date: Date): string {
  return format(date, 'yyyy年MM月', { locale: zhCN });
}

export function getTimeSlots(startHour: number = 8, endHour: number = 22): { hour: number; label: string }[] {
  const slots: { hour: number; label: string }[] = [];
  for (let h = startHour; h < endHour; h++) {
    slots.push({ hour: h, label: `${h.toString().padStart(2, '0')}:00` });
  }
  return slots;
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

export function isPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d < today;
}

export function isFuture(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d > today;
}
