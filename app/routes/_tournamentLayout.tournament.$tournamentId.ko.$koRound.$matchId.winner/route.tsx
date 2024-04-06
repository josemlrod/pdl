import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function KoMatchWinner() {
  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>KoMatchWinner title</DialogTitle>
          <DialogDescription>Congratulations X!</DialogDescription>
        </DialogHeader>
        <p>KoMatchWinner dialog</p>
      </DialogContent>
    </Dialog>
  );
}
