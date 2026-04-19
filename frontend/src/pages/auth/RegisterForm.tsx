import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authApi } from "@/lib/backend-api";
import { setAuthSession } from "@/lib/auth-session";
import type { UserRole } from "@/types";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState<UserRole>("donor");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    mobile: "",
    email: "",
    password: "",
    blood_group: "",
    address: "",
    date_of_birth: "",
    hospital_name: "",
    registration_number: "",
    city: "",
    state: "",
    pincode: "",
    contact_person: "",
  });

  const medicalOrgMode = role === "hospital" || role === "clinic";
  const donorMode = role === "donor";
  const passwordRequired = role === "hospital" || role === "clinic" || role === "admin";

  useEffect(() => {
    const roleParam = searchParams.get("role") as UserRole | null;
    if (roleParam) {
      setRole(roleParam);
    }
  }, [searchParams]);

  const payload = useMemo(() => {
    const common: Record<string, unknown> = {
      full_name: formData.full_name,
      mobile: formData.mobile || undefined,
      email: formData.email || null,
      role,
      address: formData.address,
    };

    if (formData.password) {
      common.password = formData.password;
    }

    if (donorMode) {
      common.blood_group = formData.blood_group;
      if (formData.date_of_birth) {
        common.date_of_birth = formData.date_of_birth;
      }
    }

    if (medicalOrgMode) {
      common.hospital_name = formData.hospital_name;
      common.registration_number = formData.registration_number;
      common.city = formData.city;
      common.state = formData.state;
      common.pincode = formData.pincode;
      common.contact_person = formData.contact_person;
    }

    return common;
  }, [donorMode, formData, medicalOrgMode, role]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.register(payload);
      setAuthSession({
        access: response.tokens.access,
        refresh: response.tokens.refresh,
        user: response.user,
      });
      toast.success("Registration successful.");
      navigate(`/${response.user.role}`, { replace: true });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Registration failed.";
      toast.error(message);
      if (error instanceof Error && /already registered/i.test(error.message)) {
        navigate("/login/form?role=auto", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-card sm:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-6 text-center space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              Register as {role.charAt(0).toUpperCase() + role.slice(1)}
            </h1>
            <p className="text-sm text-muted-foreground">You selected this role in access chooser.</p>
            <Link to={`/register?role=${role}`} className="text-xs font-medium text-primary hover:underline">
              Change role
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={formData.full_name}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    full_name: event.target.value,
                  }))
                }
                placeholder="e.g. John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Mobile (Optional)</Label>
              <Input
                value={formData.mobile}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, mobile: event.target.value }))
                }
                placeholder="+919876543210"
              />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, email: event.target.value }))
                }
                placeholder="you@example.com"
                required={!formData.mobile}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Password {passwordRequired ? "(Required)" : "(Optional)"}
              </Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                placeholder="Minimum 8 characters"
                required={passwordRequired}
              />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={formData.address}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    address: event.target.value,
                  }))
                }
                placeholder="Street, Area, Landmark"
                required={medicalOrgMode}
              />
            </div>

            {donorMode && (
              <>
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, blood_group: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select blood group" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>
                          {group}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        date_of_birth: event.target.value,
                      }))
                    }
                  />
                </div>
              </>
            )}

            {medicalOrgMode && (
              <>
                <div className="space-y-2">
                  <Label>{role === "clinic" ? "Clinic Name" : "Hospital Name"}</Label>
                  <Input
                    value={formData.hospital_name}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        hospital_name: event.target.value,
                      }))
                    }
                    placeholder={role === "clinic" ? "e.g. CarePlus Clinic" : "e.g. City General Hospital"}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input
                    value={formData.registration_number}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        registration_number: event.target.value,
                      }))
                    }
                    placeholder="e.g. REG-2024-12345"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        city: event.target.value,
                      }))
                    }
                    placeholder="e.g. Mumbai"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        state: event.target.value,
                      }))
                    }
                    placeholder="e.g. Maharashtra"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pincode</Label>
                  <Input
                    value={formData.pincode}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        pincode: event.target.value,
                      }))
                    }
                    placeholder="e.g. 400001"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={formData.contact_person}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        contact_person: event.target.value,
                      }))
                    }
                    placeholder="e.g. Dr. Sharma"
                    required
                  />
                </div>
              </>
            )}

            <div className="sm:col-span-2">
              <Button className="w-full gap-2" type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Register"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <p className="pt-4 text-center text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
