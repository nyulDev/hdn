"use client";

import * as React from "react";
import { Layers, Edit, Trash2, MoreHorizontal, Save } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppShell } from "@/components/app-shell";
import { getDefaultCostShipping } from "../cost-shipping/page";

export default function ModalPage() {
  const [modals, setModals] = React.useState<any[]>([]);
  const [penawarans, setPenawarans] = React.useState<any[]>([]);
  const [modalCosts, setModalCosts] = React.useState<any[]>([]);

  // Basic fields
  const [noQuo, setNoQuo] = React.useState("");
  const [kodeImpa, setKodeImpa] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [satuan, setSatuan] = React.useState("");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [tanggal, setTanggal] = React.useState("");

  // Cost fields (as multipliers)
  const [discount, setDiscount] = React.useState("");
  const [totalModalSperpart, setTotalModalSperpart] = React.useState("");
  const [bankCharge, setBankCharge] = React.useState("");
  const [packingCost, setPackingCost] = React.useState("");
  const [deliveryDutyTax, setDeliveryDutyTax] = React.useState("");
  const [deliveryAirDHL, setDeliveryAirDHL] = React.useState("");
  const [deliveryAirDoorToDoor, setDeliveryAirDoorToDoor] = React.useState("");
  const [deliverySeaResmi, setDeliverySeaResmi] = React.useState("");
  const [deliverySeaDoorToDoor, setDeliverySeaDoorToDoor] = React.useState("");
  const [deliveryLocalCost, setDeliveryLocalCost] = React.useState("");
  const [feeKurir, setFeeKurir] = React.useState("");
  const [otherCostTruck, setOtherCostTruck] = React.useState("");
  const [otherCostServiceBoat, setOtherCostServiceBoat] = React.useState("");
  const [otherCostLainLain, setOtherCostLainLain] = React.useState("");
  const [hsi, setHsi] = React.useState("");

  // Default cost shipping values
  const [defaultCosts, setDefaultCosts] = React.useState<any>({
    bankCharge: 0,
    packingCost: 0,
    deliveryDutyTax: 0,
    deliveryAirDHL: 0,
    deliveryAirDoorToDoor: 0,
    deliverySeaResmi: 0,
    deliverySeaDoorToDoor: 0,
    deliveryLocalCost: 0,
    feeKurir: 0,
    otherCostTruck: 0,
    otherCostServiceBoat: 0,
    otherCostLainLain: 0,
    hsi: 0,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState("");
  const [costSaved, setCostSaved] = React.useState(false);

  // Load default cost shipping on mount
  React.useEffect(() => {
    const costs = getDefaultCostShipping();
    setDefaultCosts(costs);
  }, []);

  const fetchModals = async () => {
    try {
      const response = await fetch("/api/modal");
      if (response.ok) {
        const data = await response.json();
        setModals(data);
      }
    } catch (error) {
      console.error("Error fetching modals:", error);
    }
  };

  const fetchPenawarans = async () => {
    try {
      const response = await fetch("/api/penawaran");
      if (response.ok) {
        const data = await response.json();
        setPenawarans(data);
      }
    } catch (error) {
      console.error("Error fetching penawarans:", error);
    }
  };

  const fetchModalCosts = async () => {
    try {
      const response = await fetch("/api/modal-cost");
      if (response.ok) {
        const data = await response.json();
        setModalCosts(data);
      }
    } catch (error) {
      console.error("Error fetching modal costs:", error);
    }
  };

  // Load modal cost when noQuo changes
  React.useEffect(() => {
    if (noQuo) {
      // Load existing cost for this noQuo
      const existingCost = modalCosts.find((c) => c.noQuo === noQuo);
      if (existingCost) {
        setDiscount(existingCost.discount?.toString() || "");
        setTotalModalSperpart(
          existingCost.totalModalSperpart?.toString() || "",
        );
        setBankCharge(existingCost.bankCharge?.toString() || "");
        setPackingCost(existingCost.packingCost?.toString() || "");
        setDeliveryDutyTax(existingCost.deliveryDutyTax?.toString() || "");
        setDeliveryAirDHL(existingCost.deliveryAirDHL?.toString() || "");
        setDeliveryAirDoorToDoor(
          existingCost.deliveryAirDoorToDoor?.toString() || "",
        );
        setDeliverySeaResmi(existingCost.deliverySeaResmi?.toString() || "");
        setDeliverySeaDoorToDoor(
          existingCost.deliverySeaDoorToDoor?.toString() || "",
        );
        setDeliveryLocalCost(existingCost.deliveryLocalCost?.toString() || "");
        setFeeKurir(existingCost.feeKurir?.toString() || "");
        setOtherCostTruck(existingCost.otherCostTruck?.toString() || "");
        setOtherCostServiceBoat(
          existingCost.otherCostServiceBoat?.toString() || "",
        );
        setOtherCostLainLain(existingCost.otherCostLainLain?.toString() || "");
        setHsi(existingCost.hsi?.toString() || "");
      } else {
        // Reset cost fields to defaults
        resetCostFields();
      }

      // Auto-calculate total modal sperpart from existing items
      const existingItems = modals.filter((m) => m.noQuo === noQuo);
      const totalAmount = existingItems.reduce(
        (sum, item) => sum + (parseFloat(item.amount) || 0),
        0,
      );
      if (totalAmount > 0) {
        setTotalModalSperpart(totalAmount.toString());
      }
    }
  }, [noQuo, modalCosts, modals]);

  React.useEffect(() => {
    fetchModals();
    fetchPenawarans();
    fetchModalCosts();
  }, []);

  React.useEffect(() => {
    if (qty && unitPrice) {
      const calculatedAmount = parseFloat(qty) * parseFloat(unitPrice);
      setAmount(calculatedAmount.toFixed(2));
    } else {
      setAmount("");
    }
  }, [qty, unitPrice]);

  // Handle noQuo selection change
  const handleNoQuoChange = (value: string) => {
    setNoQuo(value);
    // Cost fields will be loaded by the useEffect above
  };

  // Calculate actual cost from multiplier
  const calculateActualCost = (
    multiplier: string,
    defaultValue: number,
  ): number => {
    const mult = parseFloat(multiplier) || 0;
    return mult * defaultValue;
  };

  // Calculate total actual cost (all costs except HSI)
  const calculateTotalActualCost = (): number => {
    return (
      calculatedCosts.bankCharge +
      calculatedCosts.packingCost +
      calculatedCosts.deliveryDutyTax +
      calculatedCosts.deliveryAirDHL +
      calculatedCosts.deliveryAirDoorToDoor +
      calculatedCosts.deliverySeaResmi +
      calculatedCosts.deliverySeaDoorToDoor +
      calculatedCosts.deliveryLocalCost +
      calculatedCosts.feeKurir +
      calculatedCosts.otherCostTruck +
      calculatedCosts.otherCostServiceBoat +
      calculatedCosts.otherCostLainLain
    );
  };

  // Calculate total HSI based on Sub Total and HSI percentage from cost-shipping
  // HSI = Sub Total × (HSI percentage / 100)
  const calculateTotalHsi = (): number => {
    const subTotal = calculateSubTotal();
    const hsiPercent = defaultCosts.hsi || 0;
    return subTotal * (hsiPercent / 100);
  };

  // Calculate Sub Total = Discount + Total Modal Sperpart + All Actual Costs (WITHOUT HSI)
  const calculateSubTotal = (): number => {
    const discountValue = parseFloat(discount) || 0;
    const totalModal = parseFloat(totalModalSperpart) || 0;

    return (
      discountValue +
      totalModal +
      calculatedCosts.bankCharge +
      calculatedCosts.packingCost +
      calculatedCosts.deliveryDutyTax +
      calculatedCosts.deliveryLocalCost +
      calculatedCosts.deliveryAirDHL +
      calculatedCosts.deliveryAirDoorToDoor +
      calculatedCosts.deliverySeaResmi +
      calculatedCosts.deliverySeaDoorToDoor +
      calculatedCosts.feeKurir +
      calculatedCosts.otherCostTruck +
      calculatedCosts.otherCostServiceBoat +
      calculatedCosts.otherCostLainLain
    );
  };

  // Auto-calculate HSI when any cost field changes
  React.useEffect(() => {
    const calculatedHsi = calculateTotalHsi();
    setHsi(calculatedHsi.toFixed(2));
  }, [
    bankCharge,
    packingCost,
    deliveryDutyTax,
    deliveryAirDHL,
    deliveryAirDoorToDoor,
    deliverySeaResmi,
    deliverySeaDoorToDoor,
    deliveryLocalCost,
    feeKurir,
    otherCostTruck,
    otherCostServiceBoat,
    otherCostLainLain,
    defaultCosts.hsi,
    totalModalSperpart,
  ]);

  // Calculate Duty Tax as percentage of Total Modal Sperpart
  const calculateDutyTax = (percent: string): number => {
    const pct = parseFloat(percent) || 0;
    const totalModal = parseFloat(totalModalSperpart) || 0;
    return (pct / 100) * totalModal;
  };

  // Get all calculated costs
  const getCalculatedCosts = () => {
    return {
      bankCharge: calculateActualCost(bankCharge, defaultCosts.bankCharge),
      packingCost: calculateActualCost(packingCost, defaultCosts.packingCost),
      deliveryDutyTax: calculateDutyTax(deliveryDutyTax),
      deliveryAirDHL: calculateActualCost(
        deliveryAirDHL,
        defaultCosts.deliveryAirDHL,
      ),
      deliveryAirDoorToDoor: calculateActualCost(
        deliveryAirDoorToDoor,
        defaultCosts.deliveryAirDoorToDoor,
      ),
      deliverySeaResmi: calculateActualCost(
        deliverySeaResmi,
        defaultCosts.deliverySeaResmi,
      ),
      deliverySeaDoorToDoor: calculateActualCost(
        deliverySeaDoorToDoor,
        defaultCosts.deliverySeaDoorToDoor,
      ),
      deliveryLocalCost: calculateActualCost(
        deliveryLocalCost,
        defaultCosts.deliveryLocalCost,
      ),
      feeKurir: calculateActualCost(feeKurir, defaultCosts.feeKurir),
      otherCostTruck: calculateActualCost(
        otherCostTruck,
        defaultCosts.otherCostTruck,
      ),
      otherCostServiceBoat: calculateActualCost(
        otherCostServiceBoat,
        defaultCosts.otherCostServiceBoat,
      ),
      otherCostLainLain: calculateActualCost(
        otherCostLainLain,
        defaultCosts.otherCostLainLain,
      ),
    };
  };

  // Save cost to ModalCost table
  const handleSaveCost = async () => {
    if (!noQuo) {
      alert("Pilih No. Quo terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/modal-cost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noQuo,
          discount,
          totalModalSperpart: totalModalSperpart || "0",
          bankCharge,
          packingCost,
          deliveryDutyTax,
          deliveryAirDHL,
          deliveryAirDoorToDoor,
          deliverySeaResmi,
          deliverySeaDoorToDoor,
          deliveryLocalCost,
          feeKurir,
          otherCostTruck,
          otherCostServiceBoat,
          otherCostLainLain,
          hsi,
        }),
      });

      if (response.ok) {
        setCostSaved(true);
        setTimeout(() => setCostSaved(false), 3000);
        fetchModalCosts();
      } else {
        console.error("Failed to save cost");
      }
    } catch (error) {
      console.error("Error saving cost:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCostFields = () => {
    setDiscount("");
    setTotalModalSperpart("");
    setBankCharge("");
    setPackingCost("");
    setDeliveryDutyTax("");
    setDeliveryAirDHL("");
    setDeliveryAirDoorToDoor("");
    setDeliverySeaResmi("");
    setDeliverySeaDoorToDoor("");
    setDeliveryLocalCost("");
    setFeeKurir("");
    setOtherCostTruck("");
    setOtherCostServiceBoat("");
    setOtherCostLainLain("");
    setHsi("");
  };

  const handleEdit = (modal: any) => {
    setIsEditing(true);
    setEditingId(modal.id);
    setNoQuo(modal.noQuo);
    setKodeImpa(modal.kodeImpa || "");
    setDescription(modal.description);
    setLocation(modal.location || "");
    setQty(modal.qty.toString());
    setSatuan(modal.satuan);
    setUnitPrice(modal.unitPrice.toString());
    setAmount(modal.amount.toString());
    if (modal.tanggal) {
      const date = new Date(modal.tanggal);
      setTanggal(date.toISOString().split("T")[0]);
    } else {
      setTanggal("");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/modal/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchModals();
        if (editingId === id) {
          resetForm();
        }
      } else {
        console.error("Failed to delete modal");
      }
    } catch (error) {
      console.error("Error deleting modal:", error);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId("");
    setNoQuo("");
    setKodeImpa("");
    setDescription("");
    setLocation("");
    setQty("");
    setSatuan("");
    setUnitPrice("");
    setAmount("");
    setTanggal("");
    resetCostFields();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/modal/${editingId}` : "/api/modal";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noQuo,
          kodeImpa,
          description,
          location,
          qty,
          satuan,
          unitPrice,
          amount,
          tanggal,
        }),
      });

      if (response.ok) {
        resetForm();
        await fetchModals();
      } else {
        console.error("Failed to save modal");
      }
    } catch (error) {
      console.error("Error saving modal:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatedCosts = getCalculatedCosts();

  return (
    <AppShell>
      {/* Side by Side Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Add Modal Card */}
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Modal" : "Add Modal"}</CardTitle>
            <CardDescription>
              {isEditing
                ? "Edit data modal yang sudah ada"
                : "Tambahkan data modal baru ke dalam sistem"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="noQuo">No. Quo</Label>
                <Select
                  value={noQuo}
                  onValueChange={handleNoQuoChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih No. Quo" />
                  </SelectTrigger>
                  <SelectContent>
                    {penawarans.map((penawaran) => (
                      <SelectItem key={penawaran.id} value={penawaran.noQuo}>
                        {penawaran.noQuo} - {penawaran.pt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kodeImpa">Kode/IMPA</Label>
                <Input
                  id="kodeImpa"
                  placeholder="Masukkan Kode IMPA"
                  value={kodeImpa}
                  onChange={(e) => setKodeImpa(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="Masukkan Lokasi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Masukkan deskripsi"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="qty">Qty</Label>
                  <Input
                    id="qty"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="satuan">Satuan</Label>
                  <Input
                    id="satuan"
                    placeholder="Unit"
                    value={satuan}
                    onChange={(e) => setSatuan(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unitPrice">Unit Price</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  readOnly
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tanggal">Tanggal</Label>
                <Input
                  id="tanggal"
                  type="date"
                  value={tanggal}
                  onChange={(e) => setTanggal(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Menyimpan..."
                    : isEditing
                      ? "Update Modal"
                      : "Add Modal"}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Batal
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Cost Card - Now per noQuo */}
        <Card>
          <CardHeader>
            <CardTitle>Cost - {noQuo || "(Pilih No. Quo)"}</CardTitle>
            <CardDescription>
              Set biaya per no.quotation. Nilai yang diinput adalah multiplier.
              Actual Cost = multiplier × default cost shipping
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="discount">Discount</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="totalModalSperpart">Total Modal Sperpart</Label>
                <Input
                  id="totalModalSperpart"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={totalModalSperpart}
                  onChange={(e) => setTotalModalSperpart(e.target.value)}
                  className="bg-muted"
                  readOnly
                />
                <span className="text-xs text-muted-foreground">
                  (Auto dari total amount items)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="bankCharge">
                  Bank Charge (×{defaultCosts.bankCharge})
                </Label>
                <Input
                  id="bankCharge"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={bankCharge}
                  onChange={(e) => setBankCharge(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">
                  Actual: {calculatedCosts.bankCharge.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="packingCost">
                  Packing Cost (×{defaultCosts.packingCost})
                </Label>
                <Input
                  id="packingCost"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={packingCost}
                  onChange={(e) => setPackingCost(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">
                  Actual: {calculatedCosts.packingCost.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="border-t pt-3 mt-2">
              <Label className="text-sm font-semibold">Delivery</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="grid gap-1">
                  <Label htmlFor="deliveryDutyTax">
                    Duty Tax ({deliveryDutyTax || "0"}%)
                  </Label>
                  <Input
                    id="deliveryDutyTax"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={deliveryDutyTax}
                    onChange={(e) => setDeliveryDutyTax(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.deliveryDutyTax.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="deliveryLocalCost">
                    Local Cost (×{defaultCosts.deliveryLocalCost})
                  </Label>
                  <Input
                    id="deliveryLocalCost"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={deliveryLocalCost}
                    onChange={(e) => setDeliveryLocalCost(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.deliveryLocalCost.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="grid gap-1">
                  <Label htmlFor="deliveryAirDHL">
                    AIR (DHL) (×{defaultCosts.deliveryAirDHL})
                  </Label>
                  <Input
                    id="deliveryAirDHL"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={deliveryAirDHL}
                    onChange={(e) => setDeliveryAirDHL(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.deliveryAirDHL.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="deliveryAirDoorToDoor">
                    AIR (Door to Door) (×{defaultCosts.deliveryAirDoorToDoor})
                  </Label>
                  <Input
                    id="deliveryAirDoorToDoor"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={deliveryAirDoorToDoor}
                    onChange={(e) => setDeliveryAirDoorToDoor(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.deliveryAirDoorToDoor.toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="grid gap-1">
                  <Label htmlFor="deliverySeaResmi">
                    SEA (RESMI) (×{defaultCosts.deliverySeaResmi})
                  </Label>
                  <Input
                    id="deliverySeaResmi"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={deliverySeaResmi}
                    onChange={(e) => setDeliverySeaResmi(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.deliverySeaResmi.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="deliverySeaDoorToDoor">
                    SEA (Door to Door) (×{defaultCosts.deliverySeaDoorToDoor})
                  </Label>
                  <Input
                    id="deliverySeaDoorToDoor"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={deliverySeaDoorToDoor}
                    onChange={(e) => setDeliverySeaDoorToDoor(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.deliverySeaDoorToDoor.toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="grid gap-1">
                <Label htmlFor="feeKurir">
                  Fee Kurir (×{defaultCosts.feeKurir})
                </Label>
                <Input
                  id="feeKurir"
                  type="number"
                  step="0.01"
                  placeholder="0"
                  value={feeKurir}
                  onChange={(e) => setFeeKurir(e.target.value)}
                />
                <span className="text-xs text-muted-foreground">
                  Actual: {calculatedCosts.feeKurir.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="hsi">
                  HSI - 2 Bulan ({defaultCosts.hsi || 0}%)
                </Label>
                <Input
                  id="hsi"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={hsi}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                />
              </div>
            </div>

            {/* Other Cost Section */}

            <div className="border-t pt-3 mt-2">
              <Label className="text-sm font-semibold">Other Cost</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="grid gap-1">
                  <Label htmlFor="otherCostTruck">
                    Truck (×{defaultCosts.otherCostTruck})
                  </Label>
                  <Input
                    id="otherCostTruck"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={otherCostTruck}
                    onChange={(e) => setOtherCostTruck(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.otherCostTruck.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="otherCostServiceBoat">
                    Service Boat (×{defaultCosts.otherCostServiceBoat})
                  </Label>
                  <Input
                    id="otherCostServiceBoat"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={otherCostServiceBoat}
                    onChange={(e) => setOtherCostServiceBoat(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.otherCostServiceBoat.toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="otherCostLainLain">
                    Lain-lain (×{defaultCosts.otherCostLainLain})
                  </Label>
                  <Input
                    id="otherCostLainLain"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={otherCostLainLain}
                    onChange={(e) => setOtherCostLainLain(e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">
                    Actual:{" "}
                    {calculatedCosts.otherCostLainLain.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Save Cost Button */}
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                onClick={handleSaveCost}
                disabled={!noQuo || isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Simpan Cost {noQuo ? `(${noQuo})` : ""}
              </Button>
              {costSaved && (
                <span className="text-green-600 flex items-center text-sm">
                  ✓ Tersimpan!
                </span>
              )}
            </div>

            {/* Sub Total Display */}
            <div className="border-t pt-4 mt-4 bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">SUB TOTAL:</span>
                <span className="text-2xl font-bold text-primary">
                  {calculateSubTotal().toLocaleString("id-ID", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Card - 1/2 width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profit Analysis</CardTitle>
            <CardDescription>
              Analisis keuntungan dan sharing berdasarkan data modal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 text-xs">
              {/* Header Table */}
              <div className="grid grid-cols-3 gap-4 border-b pb-2 font-medium text-sm">
                <div></div>
                <div className="text-right">AKTUAL</div>
                <div className="text-right">ESTIMASI Ppn</div>
              </div>

              {/* INVOICE Row */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                <div className="font-medium">1. INVOICE</div>
                <div className="text-right">55.170.000</div>
                <div className="text-right">49.653.000</div>
              </div>

              {/* MODAL Row */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                <div className="font-medium">2. MODAL</div>
                <div className="text-right">30.757.900</div>
                <div className="text-right">30.757.900</div>
              </div>

              {/* GROSS PROFIT Row */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-2">
                <div className="font-medium">3. GROSS PROFIT</div>
                <div className="text-right">24.412.100</div>
                <div className="text-right">18.895.100</div>
                <div className="text-right text-sm text-muted-foreground col-span-1">
                  61,43%
                </div>
              </div>

              {/* PROFIT SHARING Header */}
              <div className="font-medium mt-4">4. PROFIT SHARING</div>

              {/* BANOS Row */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-2 ml-4">
                <div className="font-medium">a. BANOS</div>
                <div className="text-right">2.398.696</div>
                <div className="text-right">5,00%</div>
              </div>

              {/* INVESTOR Header */}
              <div className="grid grid-cols-3 gap-4 items-center ml-4">
                <div className="font-medium">b. INVESTOR</div>
              </div>

              {/* HSI Row */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-2 ml-8">
                {"i. H S I - - -> 2 bulan"}

                <div className="text-right">2.460.632</div>
                <div className="text-right">30.757.900</div>
                <div className="text-right">2.460.632</div>
                <div className="text-right">30.757.900</div>
              </div>

              {/* HTU Row */}
              <div className="grid grid-cols-3 gap-4 items-center border-b pb-2 ml-8">
                <div className="font-medium">c. HTU (net profit)</div>
                <div className="text-right">17.111.562</div>
                <div className="text-right">55,63%</div>
                <div className="text-right">12.062.308</div>
                <div className="text-right">39,22%</div>
              </div>

              {/* SHARING Marketing Fee */}
              <div className="mt-6">
                <div className="font-medium mb-4">5. SHARING Marketing Fee</div>

                {/* Payment Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Cash</TableHead>
                        <TableHead className="text-right">0-30 days</TableHead>
                        <TableHead className="text-right">31-60 days</TableHead>
                        <TableHead className="text-right">61-90 days</TableHead>
                        <TableHead className="text-right">
                          {">"} 90 days
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">
                          Prosentase
                        </TableCell>
                        <TableCell className="text-right">30%</TableCell>
                        <TableCell className="text-right">20%</TableCell>
                        <TableCell className="text-right">10%</TableCell>
                        <TableCell className="text-right">3%</TableCell>
                        <TableCell className="text-right">0%</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">
                          Nilai (Rp)
                        </TableCell>
                        <TableCell className="text-right">7.323.630</TableCell>
                        <TableCell className="text-right">4.882.420</TableCell>
                        <TableCell className="text-right">2.441.210</TableCell>
                        <TableCell className="text-right">732.363</TableCell>
                        <TableCell className="text-right">0</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daftar Modal Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Modal</CardTitle>
          <CardDescription>Daftar semua modal yang tersimpan</CardDescription>
        </CardHeader>
        <CardContent>
          {modals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Belum ada data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Silakan tambahkan modal baru menggunakan form di atas.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>No. Quo</TableHead>
                  <TableHead>Kode/IMPA</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modals.map((modal) => (
                  <TableRow key={modal.id}>
                    <TableCell>
                      {modal.tanggal
                        ? new Date(modal.tanggal).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : new Date(modal.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                    </TableCell>
                    <TableCell className="font-medium">{modal.noQuo}</TableCell>
                    <TableCell>{modal.kodeImpa || "-"}</TableCell>
                    <TableCell>{modal.description}</TableCell>
                    <TableCell>{modal.location || "-"}</TableCell>
                    <TableCell>{modal.qty}</TableCell>
                    <TableCell>{modal.satuan}</TableCell>
                    <TableCell>
                      {parseFloat(modal.unitPrice).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="font-medium">
                      {parseFloat(modal.amount).toLocaleString("id-ID")}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(modal)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(modal.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
