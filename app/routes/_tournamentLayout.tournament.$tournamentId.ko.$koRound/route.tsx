import { useFetcher, useNavigate } from "@remix-run/react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function KoRoundDialog() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  return (
    <Dialog open onOpenChange={() => navigate("..")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>KO Round</DialogTitle>
          <DialogDescription>
            Some description for the ko round
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4"></div>
            <div className="grid grid-cols-4 items-center gap-4"></div>
          </div>
          <DialogFooter>
            {/* <Button type="submit">Save</Button> */}
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}
