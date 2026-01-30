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
      className={cn("w-full", className)}
      classNames={{
        months: "flex flex-col gap-6 justify-center w-full",
        month: "w-full space-y-2",
        caption: "flex justify-center items-center relative mb-2 h-10",
        caption_label: "text-base font-semibold",
        nav: "absolute w-full flex justify-between -inset-x-2 px-4",
        nav_button: cn(
          "inline-flex items-center justify-center rounded-md h-8 w-8 bg-transparent border-none cursor-pointer hover:bg-gray-100",
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-collapse",
        head_row: "grid grid-cols-7 gap-0 mb-1",
        head_cell: "text-muted-foreground text-center font-semibold text-xs h-8 w-12 flex items-center justify-center",
        row: "grid grid-cols-7 gap-0 mb-0",
        cell: "h-10 w-12 p-0 relative text-center",
        day: cn(buttonVariants({ variant: "ghost" }), "h-10 w-12 p-0 font-normal rounded-none hover:bg-gray-200"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-gray-400 opacity-50",
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

