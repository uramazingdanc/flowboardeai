import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Copy, Check, Link, Mail, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useProject } from '@/contexts/ProjectContext';

interface InviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteDialog({ open, onOpenChange }: InviteDialogProps) {
  const { inviteMember } = useProject();
  const [email, setEmail] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviting, setInviting] = useState(false);

  const shareLink = window.location.origin;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = async () => {
    if (!email.trim()) return;

    setInviting(true);
    const success = await inviteMember(email);
    setInviting(false);

    if (success) {
      setEmail('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Invite Team Members
          </DialogTitle>
          <DialogDescription>
            Add team members to collaborate on this project
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Invite */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Invite by email
            </Label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              The user must have an account to be added
            </p>
            <Button onClick={handleSendInvite} className="w-full" disabled={!email || inviting}>
              {inviting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invitation'
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or share link</span>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Share invite link
            </Label>
            <div className="flex gap-2">
              <Input value={shareLink} readOnly className="flex-1 text-sm bg-muted" />
              <Button variant="outline" onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4 text-column-done" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link for others to sign up and join
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
