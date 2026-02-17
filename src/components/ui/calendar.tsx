"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, ...props }: CalendarProps) {
  return (
    <DayPicker
      locale={fr}
      showOutsideDays
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous:
          "absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100",
        button_next:
          "absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-100",
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative rounded-md focus-within:relative focus-within:z-20",
        day_button:
          "h-9 w-9 p-0 font-normal inline-flex items-center justify-center rounded-md hover:bg-emerald-50 hover:text-emerald-600 transition-colors",
        selected:
          "bg-emerald-500 text-white hover:bg-emerald-600 focus:bg-emerald-600 rounded-md",
        today: "bg-slate-100 text-navy font-bold",
        outside: "text-muted-foreground opacity-50",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "bg-emerald-50 text-emerald-700 rounded-none",
        range_start: "bg-emerald-500 text-white rounded-l-md rounded-r-none",
        range_end: "bg-emerald-500 text-white rounded-r-md rounded-l-none",
        hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
