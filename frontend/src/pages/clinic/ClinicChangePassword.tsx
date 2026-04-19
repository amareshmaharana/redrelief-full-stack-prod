import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { profileApi } from '@/lib/backend-api';

export default function ClinicChangePassword() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await profileApi.changePassword({ current_password: currentPassword, new_password: newPassword });
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch {
      toast.error('Failed to change password');
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Change Password</h1>
        <p className="text-sm text-muted-foreground mt-1">Update your clinic account password</p>
      </div>

      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Password Settings
          </CardTitle>
          <CardDescription>Choose a strong password with at least 8 characters</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showCurrent ? 'text' : 'password'} placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showNew ? 'text' : 'password'} placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="rounded-xl bg-muted/50 border border-border p-4">
              <p className="text-xs font-semibold text-foreground flex items-center gap-2 mb-2">
                <ShieldCheck className="h-4 w-4 text-success" /> Password Requirements
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 pl-6 list-disc">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Contains at least one number</li>
                <li>Contains at least one special character</li>
              </ul>
            </div>
            <Button type="submit" className="w-full sm:w-auto gap-2">
              <Lock className="h-4 w-4" /> Update Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

