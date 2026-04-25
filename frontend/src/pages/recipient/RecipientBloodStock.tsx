import { Card, CardContent } from "@/components/ui/card";
import { BloodGroupTag } from "@/components/dashboard/BloodGroupTag";
import { BrandLoader } from '@/components/ui/BrandLoader';
import { useMinLoader } from '@/hooks/useMinLoader';
import { recipientApi, mapStock } from "@/lib/backend-api";
import type { BloodStock } from "@/types";
import { Droplets, AlertTriangle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function RecipientBloodStock() {
  const [stock, setStock] = useState<BloodStock[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStock = async () => {
    setLoading(true);
    try {
      const list = await recipientApi.stock();
      setStock(list.map(mapStock));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStock();
    const intervalId = window.setInterval(() => {
      void loadStock();
    }, 90000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const showLoader = useMinLoader(loading);
  if (showLoader)
    return <BrandLoader message="Loading stock..." fullScreen={false} />;

  const totalUnits = stock.reduce((a, s) => a + s.units, 0);
  const lowStock = stock.filter((s) => s.units < 10);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Blood Stock
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            View current blood availability across all groups
          </p>
        </div>
        {lowStock.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-2">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">
              {lowStock.length} group(s) low stock
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-primary tracking-tight">
            {totalUnits}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Total Units
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-success tracking-tight">
            {stock.filter((s) => s.units >= 10).length}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Well Stocked
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-center">
          <p className="text-2xl font-bold text-destructive tracking-tight">
            {lowStock.length}
          </p>
          <p className="text-xs text-muted-foreground font-medium mt-1">
            Low Stock
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stock.map((s) => {
          const isLow = s.units < 10;
          return (
            <Card
              key={s.id}
              className={`overflow-hidden ${isLow ? "border-destructive/30" : "border-border"}`}
            >
              <CardContent className="p-5 text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full gradient-blood text-sm font-bold text-primary-foreground mb-3">
                  {s.bloodGroup}
                </div>
                <p className="text-3xl font-bold text-foreground tracking-tight">
                  {s.units}
                </p>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-1">
                  units
                </p>
                <div className="mt-3 flex items-center justify-center gap-1">
                  {isLow ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-destructive">
                      <AlertTriangle className="h-3.5 w-3.5" /> Low Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-success">
                      <CheckCircle className="h-3.5 w-3.5" /> Available
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">
                  Expires: {s.expiryDate}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
