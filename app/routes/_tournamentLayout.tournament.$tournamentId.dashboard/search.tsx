import { useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { PlusIcon } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";
import Data from "../../data.json";
import { Command } from "cmdk";

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Search({ open, setOpen }: Props) {
  const [query, setQuery] = useState("");

  const { data } = Data;
  const filteredItems =
    query === ""
      ? []
      : data.filter((item) => {
          return item.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    <CommandDialog
      open={open}
      onOpenChange={(open) => {
        setQuery("");
        setOpen(false);
      }}
    >
      <Command shouldFilter={false}>
        <CommandInput
          placeholder="Type a command or search..."
          value={query}
          onValueChange={(search) => setQuery(search)}
        />
        {query ? (
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredItems.map((item, i) => (
                <CommandItem key={i}>
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-none items-center justify-center rounded-lg"
                    )}
                  >
                    <img
                      alt={`${item.github_name} sprite`}
                      className="h-6 w-6"
                      src={item.spriteUrl}
                    />
                  </div>
                  <div className="ml-4 flex-auto">
                    <p className={cn("text-sm font-medium")}>{item.name}</p>
                    <p className={cn("text-sm")}>{item.pts} points</p>
                  </div>
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-none items-center justify-center rounded-lg"
                    )}
                  >
                    <PlusIcon className="h-6 w-6" />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        ) : null}
      </Command>
    </CommandDialog>
  );
}
