"use client";

import * as React from "react";
import { Settings, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/app-shell";

// Default cost shipping values
interface DefaultCostShipping {
  bankCharge: number;
  packingCost: number;
  deliveryDutyTax: number;
  deliveryAirDHL: number;
  deliveryAirDoorToDoor: number;
  deliverySeaResmi: number;
  deliverySeaDoorToDoor: number;
  deliveryLocalCost: number;
  hsi: number;
}

const defaultValues: DefaultCostShipping = {
  bankCharge: 0,
  packingCost: 0,
  deliveryDutyTax: 0,
  deliveryAirDHL: 0,
  deliveryAirDoorToDoor: 0,
  deliverySeaResmi: 0,
  deliverySeaDoorToDoor: 0,
  deliveryLocalCost: 0,
  hsi: 0,
};

const STORAGE_KEY = "defaultCostShipping";

export default function CostShippingPage() {
  const [bankCharge, setBankCharge] = React.useState("");
  const [packingCost, setPackingCost] = React.useState("");
  const [deliveryDutyTax, setDeliveryDutyTax] = React.useState("");
  const [deliveryAirDHL, setDeliveryAirDHL] = React.useState("");
  const [deliveryAirDoorToDoor, setDeliveryAirDoorToDoor] = React.useState("");
  const [deliverySeaResmi, setDeliverySeaResmi] = React.useState("");
  const [deliverySeaDoorToDoor, setDeliverySeaDoorToDoor] = React.useState("");
  const [deliveryLocalCost, setDeliveryLocalCost] = React.useState("");
  const [hsi, setHsi] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);

  // Load saved values from localStorage on mount
  React.useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setBankCharge(parsed.bankCharge?.toString() || "");
        setPackingCost(parsed.packingCost?.toString() || "");
        setDeliveryDutyTax(parsed.deliveryDutyTax?.toString() || "");
        setDeliveryAirDHL(parsed.deliveryAirDHL?.toString() || "");
        setDeliveryAirDoorToDoor(
          parsed.deliveryAirDoorToDoor?.toString() || "",
        );
        setDeliverySeaResmi(parsed.deliverySeaResmi?.toString() || "");
        setDeliverySeaDoorToDoor(
          parsed.deliverySeaDoorToDoor?.toString() || "",
        );
        setDeliveryLocalCost(parsed.deliveryLocalCost?.toString() || "");
        setHsi(parsed.hsi?.toString() || "");
      } catch (e) {
        console.error("Error parsing saved cost shipping data:", e);
      }
    }
  }, []);

  // Calculate total default cost
  const calculateTotalCost = () => {
    const costs = [
      parseFloat(bankCharge) || 0,
      parseFloat(packingCost) || 0,
      parseFloat(deliveryDutyTax) || 0,
      parseFloat(deliveryAirDHL) || 0,
      parseFloat(deliveryAirDoorToDoor) || 0,
      parseFloat(deliverySeaResmi) || 0,
      parseFloat(deliverySeaDoorToDoor) || 0,
      parseFloat(deliveryLocalCost) || 0,
    ];
    return costs.reduce((sum, cost) => sum + cost, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const costData: DefaultCostShipping = {
        bankCharge: parseFloat(bankCharge) || 0,
        packingCost: parseFloat(packingCost) || 0,
        deliveryDutyTax: parseFloat(deliveryDutyTax) || 0,
        deliveryAirDHL: parseFloat(deliveryAirDHL) || 0,
        deliveryAirDoorToDoor: parseFloat(deliveryAirDoorToDoor) || 0,
        deliverySeaResmi: parseFloat(deliverySeaResmi) || 0,
        deliverySeaDoorToDoor: parseFloat(deliverySeaDoorToDoor) || 0,
        deliveryLocalCost: parseFloat(deliveryLocalCost) || 0,
        hsi: parseFloat(hsi) || 0,
      };

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(costData));

      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch (error) {
      console.error("Error saving cost shipping:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setBankCharge("");
    setPackingCost("");
    setDeliveryDutyTax("");
    setDeliveryAirDHL("");
    setDeliveryAirDoorToDoor("");
    setDeliverySeaResmi("");
    setDeliverySeaDoorToDoor("");
    setDeliveryLocalCost("");
    setHsi("");
    localStorage.removeItem(STORAGE_KEY);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <AppShell>
      {/* Cost Shipping Settings Card */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Cost Shipping - Default Values
          </CardTitle>
          <CardDescription>
            Set nilai default cost shipping untuk digunakan di halaman Modal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Cost Shipping Section - Grid Layout */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">
                Biaya Pengiriman (Cost Shipping)
              </h3>

              {/* Row 1: Bank Charge, Packing Cost, Duty Tax, Local Cost */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="bankCharge"
                    className="text-primary font-medium"
                  >
                    BANK CHARGE
                  </Label>
                  <Input
                    id="bankCharge"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={bankCharge}
                    onChange={(e) => setBankCharge(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="packingCost"
                    className="text-primary font-medium"
                  >
                    PACKING COST
                  </Label>
                  <Input
                    id="packingCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={packingCost}
                    onChange={(e) => setPackingCost(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="deliveryDutyTax"
                    className="text-primary font-medium"
                  >
                    Duty Tax
                  </Label>
                  <Input
                    id="deliveryDutyTax"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={deliveryDutyTax}
                    onChange={(e) => setDeliveryDutyTax(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="deliveryLocalCost"
                    className="text-primary font-medium"
                  >
                    Local Cost
                  </Label>
                  <Input
                    id="deliveryLocalCost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={deliveryLocalCost}
                    onChange={(e) => setDeliveryLocalCost(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: AIR (DHL), AIR (Door to Door), SEA (RESMI), SEA (Door to Door) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="grid gap-2">
                  <Label
                    htmlFor="deliveryAirDHL"
                    className="text-primary font-medium"
                  >
                    AIR (DHL)
                  </Label>
                  <Input
                    id="deliveryAirDHL"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={deliveryAirDHL}
                    onChange={(e) => setDeliveryAirDHL(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="deliveryAirDoorToDoor"
                    className="text-primary font-medium"
                  >
                    AIR (Door to Door)
                  </Label>
                  <Input
                    id="deliveryAirDoorToDoor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={deliveryAirDoorToDoor}
                    onChange={(e) => setDeliveryAirDoorToDoor(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="deliverySeaResmi"
                    className="text-primary font-medium"
                  >
                    SEA (RESMI)
                  </Label>
                  <Input
                    id="deliverySeaResmi"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={deliverySeaResmi}
                    onChange={(e) => setDeliverySeaResmi(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="deliverySeaDoorToDoor"
                    className="text-primary font-medium"
                  >
                    SEA (Door to Door)
                  </Label>
                  <Input
                    id="deliverySeaDoorToDoor"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={deliverySeaDoorToDoor}
                    onChange={(e) => setDeliverySeaDoorToDoor(e.target.value)}
                  />
                </div>
              </div>

              {/* Total Cost Display */}
              <div className="bg-muted p-4 rounded-lg mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    Total Default Cost Shipping:
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    {calculateTotalCost().toLocaleString("id-ID", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* HSI Section - Percentage */}
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-4">HSI - 2 Bulan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="hsi" className="text-primary font-medium">
                    HSI - 2 Bulan (%)
                  </Label>
                  <Input
                    id="hsi"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={hsi}
                    onChange={(e) => setHsi(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Persentase HSI untuk 2 bulan
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Save Default Values"}
              </Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset to Default
              </Button>
              {isSaved && (
                <span className="text-green-600 flex items-center">
                  ✓ Saved successfully!
                </span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Informasi</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nilai default cost shipping yang disimpan di sini akan digunakan
            sebagai nilai awal saat menambahkan data baru di halaman Modal. Anda
            dapat mengubah nilai tersebut sesuai kebutuhan saat menambah atau
            mengedit data modal.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

// Helper function to get default cost shipping values
export function getDefaultCostShipping(): DefaultCostShipping {
  if (typeof window === "undefined") {
    return defaultValues;
  }

  const savedData = localStorage.getItem(STORAGE_KEY);
  if (savedData) {
    try {
      return JSON.parse(savedData);
    } catch (e) {
      return defaultValues;
    }
  }
  return defaultValues;
}
