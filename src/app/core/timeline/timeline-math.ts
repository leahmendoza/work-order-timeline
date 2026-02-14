/**
 * All math here is DST-safe and deterministic.
 * Never use raw millisecond / 86400000 division outside this file.
 */

 const MS_PER_DAY = 86_400_000;

 // -----------------------------
 // Normalization
 // -----------------------------
 
 export function startOfDay(d: Date): Date {
   return new Date(d.getFullYear(), d.getMonth(), d.getDate());
 }
 
 export function startOfMonth(d: Date): Date {
   return new Date(d.getFullYear(), d.getMonth(), 1);
 }
 
 export function startOfWeekMonday(d: Date): Date {
   const day = d.getDay(); // 0=Sun..6=Sat
   const diffToMonday = (day + 6) % 7;
   return addDays(startOfDay(d), -diffToMonday);
 }
 
 // -----------------------------
 // Date math
 // -----------------------------
 
 export function addDays(d: Date, days: number): Date {
   const x = new Date(d.getTime());
   x.setDate(x.getDate() + days);
   return startOfDay(x);
 }
 
 export function addMonthsFromMonthStart(d: Date, months: number): Date {
   // Assumes d is already the first of the month
   return new Date(d.getFullYear(), d.getMonth() + months, 1);
 }
 
 // -----------------------------
 // Day indexing (DST-safe)
 // -----------------------------
 
 function utcDayIndex(d: Date): number {
   return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / MS_PER_DAY);
 }
 
 export function diffDays(a: Date, b: Date): number {
   return utcDayIndex(b) - utcDayIndex(a);
 }
 
 // -----------------------------
 // Clipping
 // -----------------------------
 
 export function clampDate(d: Date, min: Date, max: Date): Date {
   if (d < min) return min;
   if (d > max) return max;
   return d;
 }
 
 // -----------------------------
 // Pixel mapping (core invariant)
 // -----------------------------
 
 export function pixelFromDate(
   visibleStart: Date,
   pxPerDay: number,
   date: Date
 ): number {
   const days = diffDays(visibleStart, startOfDay(date));
   return Math.round(days * pxPerDay);
 } 