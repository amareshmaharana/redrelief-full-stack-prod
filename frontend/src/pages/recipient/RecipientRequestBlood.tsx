import { useEffect, useState } from "react";
import { AlertTriangle, Calendar, Droplets, FileText, Upload } from "lucide-react";
import { toast } from "sonner";

import { BloodGroupTag } from "@/components/dashboard/BloodGroupTag";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mapBloodRequest, recipientApi } from "@/lib/backend-api";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RecipientRequestBlood() {
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [units, setUnits] = useState(1);
  const [reason, setReason] = useState("");
  const [medicalReport, setMedicalReport] = useState<File | null>(null);
  const [idProof, setIdProof] = useState<File | null>(null);
  const [requests, setRequests] = useState<Array<ReturnType<typeof mapBloodRequest>>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const data = await recipientApi.requests();
      setRequests(data.map((item) => mapBloodRequest(item, "recipient")));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load requests.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadRequests();
    const intervalId = window.setInterval(() => {
      void loadRequests();
    }, 30000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

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
      payload.append("units_required", String(units));
      payload.append("admin_message", reason);
      if (medicalReport) {
        payload.append("medical_report", medicalReport);
      }
      if (idProof) {
        payload.append("id_proof", idProof);
      }
      await recipientApi.createRequest(payload);
      toast.success("Blood request submitted.");
      setSelectedBloodGroup("");
      setUnits(1);
      setReason("");
      setMedicalReport(null);
      setIdProof(null);
      await loadRequests();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit request.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Request Blood</h1>
        <p className="text-sm text-muted-foreground mt-1">Submit a blood request with supporting documents</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 overflow-hidden border-border">
          <CardHeader className="border-b border-border bg-muted/30">
            <CardTitle className="text-base flex items-center gap-2">
              <Droplets className="h-5 w-5 text-primary" /> Blood Request Form
            </CardTitle>
            <CardDescription>Provide the required details and upload supporting documents</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Blood Group Required</Label>
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
                  <Label>Units Required</Label>
                  <Input
                    type="number"
                    min={1}
                    value={units}
                    onChange={(event) => setUnits(Number(event.target.value || 1))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason / Medical Condition</Label>
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Describe the reason for blood request"
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>ID Proof</Label>
                  <label className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-medium text-foreground">Upload ID Proof</p>
                    <input
                      className="hidden"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) => setIdProof(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  {idProof && <p className="text-xs text-muted-foreground">{idProof.name}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Medical Report</Label>
                  <label className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer block">
                    <Upload className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                    <p className="text-xs font-medium text-foreground">Upload Report</p>
                    <input
                      className="hidden"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(event) => setMedicalReport(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  {medicalReport && <p className="text-xs text-muted-foreground">{medicalReport.name}</p>}
                </div>
              </div>

              <Button type="submit" className="w-full sm:w-auto gap-2" disabled={submitting}>
                <Droplets className="h-4 w-4" />
                {submitting ? "Submitting..." : "Submit Blood Request"}
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
                  <div key={request.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BloodGroupTag group={request.bloodGroup} />
                        <span className="text-sm font-medium text-foreground">{request.units} units</span>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{request.reason}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" /> {request.requestDate}
                    </p>
                    {request.status === "rejected" && (
                      <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-destructive/5 border border-destructive/20 p-2">
                        <AlertTriangle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />
                        <p className="text-xs text-destructive">{request.reason}</p>
                      </div>
                    )}
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
