import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrandLoader } from "@/components/ui/BrandLoader";
import { useMinLoader } from "@/hooks/useMinLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { profileApi } from "@/lib/backend-api";
import { ChangePasswordCard } from "@/components/profile/ChangePasswordCard";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ClinicProfile() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi
      .get()
      .then((p) => {
        setFullName(p.full_name);
        setEmail(p.email ?? "");
        setMobile(p.mobile);
        setRole(p.role);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await profileApi.update({ full_name: fullName, email: email || null });
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const showLoader = useMinLoader(loading);
  if (showLoader)
    return <BrandLoader message="Loading profile..." fullScreen={false} />;

  return (
    <div className="max-w-2xl space-y-6">
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-blood text-xl font-bold text-primary-foreground">
              {fullName[0] ?? "C"}
            </div>
            <div>
              <CardTitle>{fullName}</CardTitle>
              <p className="text-sm text-muted-foreground">{role}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Full Name</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input value={mobile} disabled />
            </div>
            <div>
              <Label>Role</Label>
              <Input value={role} disabled />
            </div>
          </div>
          <Button className="w-full sm:w-auto" onClick={handleSave}>
            Update Profile
          </Button>
        </CardContent>
      </Card>

      <ChangePasswordCard />
    </div>
  );
}

