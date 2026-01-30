import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full max-w-xs", className)}
      classNames={{
        months: "flex flex-col gap-6 w-full",
        month: "w-full",
        caption: "flex items-center justify-between pt-1 pb-4 relative px-1",
        caption_label: "text-base font-semibold text-center",
        nav: "flex gap-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 hover:bg-gray-100 border border-gray-300"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse space-y-1",
        head_row: "flex w-full mb-1",
        head_cell:
          "text-muted-foreground rounded-md w-12 font-normal text-[0.8rem] flex items-center justify-center",
        row: "flex w-full",
        cell: "h-12 w-12 text-center p-0 relative [&:has([aria-selected].day-range-start)]:rounded-l-md [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
        day: cn(buttonVariants({ variant: "ghost" }), "h-12 w-12 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white rounded-none",
        day_today: "bg-slate-100 text-slate-900 font-bold",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-slate-100 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-blue-300 aria-selected:text-slate-900 rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      formatters={{
        formatWeekdayName: (date) => {
          // D = Domingo, S = Segunda, T = Terça, Q = Quarta, Q = Quinta, S = Sexta, S = Sábado
          const weekdays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
          return weekdays[date.getDay()];
        },
        formatCaption: (date, options) => {
          const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                         'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
          return `${months[date.getMonth()]} ${date.getFullYear()}`;
        }
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

