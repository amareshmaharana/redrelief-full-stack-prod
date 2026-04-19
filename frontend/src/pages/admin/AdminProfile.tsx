import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileApi } from '@/lib/backend-api';
import type { UserProfileDTO } from '@/lib/backend-api';
import { User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminProfile() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    profileApi.get().then(p => {
      setProfile(p);
      setFullName(p.full_name);
      setEmail(p.email ?? '');
      setMobile(p.mobile);
    });
  }, []);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    profileApi.update({ full_name: fullName, email: email || null }).then(() => {
      toast.success('Profile updated successfully!');
    }).catch(() => toast.error('Failed to update profile'));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword.trim()) {
      toast.error('Current password is required');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) { toast.error('Passwords do not match'); return; }
    profileApi.changePassword({ current_password: currentPassword, new_password: newPassword }).then(() => {
      toast.success('Password changed successfully!');
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    }).catch((error) => {
      const message = error instanceof Error ? error.message : 'Failed to change password';
      toast.error(message);
    });
  };

  const showLoader = useMinLoader(!profile);
  if (showLoader) return <BrandLoader message="Loading profile..." fullScreen={false} />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Admin Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your account details and security</p>
      </div>

      {/* Profile Info */}
      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleProfileUpdate} className="space-y-5">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-blood text-xl font-bold text-primary-foreground">
                {profile.full_name[0]}
              </div>
              <div>
                <p className="font-semibold text-foreground">{profile.full_name}</p>
                <p className="text-sm text-muted-foreground capitalize">{profile.role}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={e => setEmail(e.target.value)} type="email" />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={mobile} disabled className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} disabled className="bg-muted/50" />
              </div>
            </div>
            <Button type="submit" className="w-full sm:w-auto">Update Profile</Button>
          </form>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="overflow-hidden border-border">
        <CardHeader className="border-b border-border bg-muted/30">
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Change Password
          </CardTitle>
          <CardDescription>Choose a strong password with at least 8 characters</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handlePasswordChange} className="space-y-5">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <div className="relative">
                <Input type={showCurrent ? 'text' : 'password'} placeholder="Enter current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <div className="relative">
                <Input type={showNew ? 'text' : 'password'} placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <div className="relative">
                <Input type={showConfirm ? 'text' : 'password'} placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
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
