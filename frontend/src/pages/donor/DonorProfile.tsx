import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { profileApi } from '@/lib/backend-api';
import { ChangePasswordCard } from '@/components/profile/ChangePasswordCard';
import type { UserProfileDTO } from '@/lib/backend-api';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function DonorProfile() {
  const [profile, setProfile] = useState<UserProfileDTO | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    profileApi.get().then(p => {
      setProfile(p);
      setFullName(p.full_name);
      setEmail(p.email ?? '');
    });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileApi.update({ full_name: fullName, email: email || null }).then(() => {
      toast.success('Profile updated!');
    }).catch(() => toast.error('Update failed'));
  };

  const showLoader = useMinLoader(!profile);
  if (showLoader) return <BrandLoader message="Loading profile..." fullScreen={false} />;

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-blood text-xl font-bold text-primary-foreground">
              {profile.full_name[0]}
            </div>
            <div>
              <CardTitle>{profile.full_name}</CardTitle>
              <span className="text-sm text-muted-foreground capitalize">{profile.role}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Full Name</Label><Input value={fullName} onChange={e => setFullName(e.target.value)} /></div>
              <div><Label>Email</Label><Input value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div><Label>Phone</Label><Input value={profile.mobile} disabled className="bg-muted/50" /></div>
              <div><Label>Role</Label><Input value={profile.role} disabled className="bg-muted/50" /></div>
            </div>
            <Button type="submit" className="w-full sm:w-auto mt-4">Update Profile</Button>
          </form>
        </CardContent>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}
