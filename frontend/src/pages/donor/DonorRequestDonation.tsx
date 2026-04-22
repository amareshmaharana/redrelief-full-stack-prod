import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, FileText, Heart, Upload } from "lucide-react";
import { toast } from "sonner";

import { BloodGroupTag } from "@/components/dashboard/BloodGroupTag";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { donorApi, mapCamp, mapDonationRequest } from "@/lib/backend-api";
import type { BloodCamp } from "@/types";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function DonorRequestDonation() {
  const [searchParams] = useSearchParams();
  const [camps, setCamps] = useState<BloodCamp[]>([]);
  const [requests, setRequests] = useState<Array<ReturnType<typeof mapDonationRequest>>>([]);
  const [selectedCamp, setSelectedCamp] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [medicalReport, setMedicalReport] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [campData, requestData] = await Promise.all([
        donorApi.camps(),
        donorApi.requests(),
      ]);
      setCamps(campData.map(mapCamp));
      setRequests(requestData.map(mapDonationRequest));

      // Pre-select camp from query param
      const campParam = searchParams.get("camp");
      if (campParam) {
        setSelectedCamp(campParam);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load donation data.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedBloodGroup) {
      toast.error("Select blood group.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("blood_group", selectedBloodGroup);
      if (selectedCamp) {
        payload.append("camp", selectedCamp);
      }
      if (medicalReport) {
        payload.append("medical_report", medicalReport);
      }
      payload.append("admin_message", notes);
      await donorApi.createRequest(payload);
      toast.success("Donation request submitted.");
      setSelectedCamp("");
      setSelectedBloodGroup("");
      setMedicalReport(null);
      setNotes("");
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit donation request.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Request to Donate</h1>
        <p className="text-sm text-muted-foreground mt-1">Submit a new blood donation request</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle className="text-base flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" /> Donation Request Form
            </CardTitle>
            <CardDescription>Fill in the details to submit your donation request</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Blood Group</Label>
                  <Select value={selectedBloodGroup} onValueChange={setSelectedBloodGroup}>
                    <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map((group) => (
                        <SelectItem key={group} value={group}>{group}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Select Camp (Optional)</Label>
                  <Select value={selectedCamp} onValueChange={setSelectedCamp}>
                    <SelectTrigger><SelectValue placeholder="Walk-in donation" /></SelectTrigger>
                    <SelectContent>
                      {camps.map((camp) => (
                        <SelectItem key={camp.id} value={camp.id}>{camp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Medical Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Any medical conditions, allergies, or recent medications..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>Hospital Report / Medical Certificate</Label>
                <label className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm font-medium text-foreground">Click to upload report</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG</p>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setMedicalReport(event.target.files?.[0] ?? null)}
                  />
                </label>
                {medicalReport && (
                  <p className="text-xs text-muted-foreground">Selected: {medicalReport.name}</p>
                )}
              </div>

              <Button type="submit" className="w-full sm:w-auto gap-2" disabled={submitting}>
                <Heart className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Donation Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden border-border h-fit">
          <CardHeader className="border-b border-border bg-muted/30 py-4">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> My Requests
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {loading ? (
                <p className="p-6 text-center text-sm text-muted-foreground">Loading...</p>
              ) : requests.length === 0 ? (
                <p className="p-6 text-center text-sm text-muted-foreground">No requests yet.</p>
              ) : (
                requests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-foreground">{request.donorName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <BloodGroupTag group={request.bloodGroup} />
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {request.requestDate}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
