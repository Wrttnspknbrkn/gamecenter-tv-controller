
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Key } from "lucide-react";
import { setAccessToken } from "@/services/api/smartThingsApi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function TokenSettings() {
  const [token, setToken] = useState<string>("");
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAccessToken(token);
    setOpen(false);
  };

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API Token</span>
              </Button>
            </DialogTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>Configure SmartThings API Token</p>
          </TooltipContent>
        </Tooltip>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>SmartThings API Token</DialogTitle>
            <DialogDescription>
              Enter your personal SmartThings API token for secure access.
              This token will replace the default token for all future sessions.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  id="token"
                  placeholder="Enter your SmartThings API token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Your token is stored locally in your browser and will become the new default token.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)} type="button">
                Cancel
              </Button>
              <Button type="submit">Save Token</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
