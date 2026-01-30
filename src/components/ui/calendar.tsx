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
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col gap-6 justify-center",
        month: "w-full max-w-sm",
        caption: "flex justify-center items-center relative mb-4 h-10 px-10",
        caption_label: "text-base font-semibold",
        nav: "absolute w-full flex justify-between px-1",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-100 hover:opacity-100 border-none",
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 mb-1 gap-0",
        head_cell: "text-muted-foreground text-center font-semibold text-sm h-8 w-10 flex items-center justify-center",
        row: "grid grid-cols-7 gap-0 mb-0",
        cell: "text-center p-0 relative h-10 w-10 focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-10 w-10 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-none"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50",
        day_disabled: "bg-gray-300 text-gray-600 cursor-not-allowed",
        day_range_middle: "aria-selected:bg-blue-300 aria-selected:text-white",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

