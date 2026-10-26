import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserRound, Loader2 } from "lucide-react";
import { createGuestProfile, getGuestProfile } from "@/lib/guestProfile";

export default function GuestAccess({ returnTo = "/" }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const existing = getGuestProfile();

  const handleContinue = () => {
    if (existing) {
      navigate(returnTo);
      return;
    }
    setOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createGuestProfile(username);
      setOpen(false);
      navigate(returnTo);
    } catch (err) {
      setError(err.message || "Could not save that username");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full h-12 text-sm font-medium"
        onClick={handleContinue}
      >
        <UserRound className="w-5 h-5 mr-2" />
        {existing ? `Continue as ${existing.username}` : "Continue as guest"}
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-3 text-muted-foreground">or</span>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choose your username</DialogTitle>
            <DialogDescription>
              Your unique username keeps the wishlist items you save, even without an account.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guest-username">Username</Label>
              <Input
                id="guest-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                autoFocus
                className="h-12"
                required
              />
              <p className="text-xs text-muted-foreground">
                3–20 characters: letters, numbers, dots or underscores.
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Start saving"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}