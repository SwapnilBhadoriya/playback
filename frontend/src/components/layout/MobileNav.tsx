import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = ["Dashboard", "History", "Bookmarks"];

export function MobileNav() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="size-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-card">
        <SheetHeader>
          <SheetTitle>Video Transcripter</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
            >
              {link}
            </a>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
