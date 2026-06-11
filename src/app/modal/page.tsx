"use client";

import * as React from "react";
import {
  Layers,
  Edit,
  Trash2,
  MoreHorizontal,
  Save,
  Eye,
  X,
  RefreshCw,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AppShell } from "@/components/app-shell";
import { getDefaultCostShipping } from "../cost-shipping/page";

export default function ModalPage() {
  // Basic datasets
  const [modals, setModals] = React.useState<any[]>([]);
  const [penawarans, setPenawarans] = React.useState<any[]>([]);
  const [modalCosts, setModalCosts] = React.useState<any[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);

  // Basic fields
  const [noPenawaran, setNoPenawaran] = React.useState("");
  const [selectedPenawaran, setSelectedPenawaran] = React.useState<any>(null);
  const [kodeImpa, setKodeImpa] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [satuan, setSatuan] = React.useState("");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [tanggal, setTanggal] = React.useState("");
  const [namaToko, setNamaToko] = React.useState("");

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
  const [includeHsi2Bulan, setIncludeHsi2Bulan] = React.useState(true);

  // Defaults for multipliers
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

  // UI state
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState("");
  const [costSaved, setCostSaved] = React.useState(false);
  const [tableRefreshKey, setTableRefreshKey] = React.useState(0);

  // Track saved cost values for SUB TOTAL calculation
  const [savedCostValues, setSavedCostValues] = React.useState<any>(null);
  const [isLoadingCosts, setIsLoadingCosts] = React.useState(false);
  const [noCostData, setNoCostData] = React.useState(false);

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [isDetailMode, setIsDetailMode] = React.useState(false);
  const [detailNoPenawaran, setDetailNoPenawaran] = React.useState<any>(null);
  const [detailModals, setDetailModals] = React.useState<any[]>([]);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");

  // Load default cost shipping on mount
  React.useEffect(() => {
    setDefaultCosts(getDefaultCostShipping());
  }, []);

  const fetchModals = async () => {
    try {
      const response = await fetch("/api/modal");
      if (!response.ok) return;
      const data = await response.json();
      const regularModals = data.filter((m: any) => !m.isAktual);
      setModals(regularModals);
    } catch (error) {
      console.error("Error fetching modals:", error);
    }
  };

  const fetchPenawarans = async () => {
    try {
      const response = await fetch("/api/penawaran");
      if (!response.ok) return;
      const data = await response.json();
      setPenawarans(data);
    } catch (error) {
      console.error("Error fetching penawarans:", error);
    }
  };

  const fetchModalCosts = async () => {
    setIsLoadingCosts(true);
    try {
      const response = await fetch("/api/modal-cost");
      if (!response.ok) return;
      const data = await response.json();
      setModalCosts(data);
      setNoCostData(data.length === 0);
    } catch (error) {
      console.error("Error fetching modal costs:", error);
    } finally {
      setIsLoadingCosts(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customer");
      if (!response.ok) return;
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  React.useEffect(() => {
    fetchModals();
    fetchPenawarans();
    fetchModalCosts();
    fetchCustomers();
  }, []);

  // Auto-calculate Amount
  React.useEffect(() => {
    if (qty && unitPrice) {
      const calculatedAmount = parseFloat(qty) * parseFloat(unitPrice);
      setAmount(calculatedAmount.toFixed(2));
    } else {
      setAmount("");
    }
  }, [qty, unitPrice]);

  // Auto load cost when noPenawaran changes
  React.useEffect(() => {
    if (!noPenawaran || penawarans.length === 0) return;

    const penawaran = penawarans.find((p) => p.noPenawaran === noPenawaran);
    if (!penawaran) return;

    const existingCost = modalCosts.find((c) => c.noQuo === penawaran.noQuo);

    if (existingCost) {
      setDiscount(existingCost.discount?.toString() || "");
      setTotalModalSperpart(existingCost.totalModalSperpart?.toString() || "");
      setBankCharge(existingCost.bankCharge?.toString() || "");
      setPackingCost(existingCost.packingCost?.toString() || "");
      setDeliveryDutyTax(existingCost.deliveryDutyTaxPercent?.toString() || "");
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

      setSavedCostValues({
        discount: existingCost.discount || 0,
        totalModalSperpart: existingCost.totalModalSperpart || 0,
        bankCharge: existingCost.bankCharge || 0,
        packingCost: existingCost.packingCost || 0,
        deliveryDutyTax: existingCost.deliveryDutyTax || 0,
        deliveryAirDHL: existingCost.deliveryAirDHL || 0,
        deliveryAirDoorToDoor: existingCost.deliveryAirDoorToDoor || 0,
        deliverySeaResmi: existingCost.deliverySeaResmi || 0,
        deliverySeaDoorToDoor: existingCost.deliverySeaDoorToDoor || 0,
        deliveryLocalCost: existingCost.deliveryLocalCost || 0,
        feeKurir: existingCost.feeKurir || 0,
        otherCostTruck: existingCost.otherCostTruck || 0,
        otherCostServiceBoat: existingCost.otherCostServiceBoat || 0,
        otherCostLainLain: existingCost.otherCostLainLain || 0,
        hsi: existingCost.hsi || 0,
      });
    } else {
      // Fallback: calculate totalModalSperpart from existing modal items
      const modalSum = modals
        .filter((m) => m.noPenawaran === noPenawaran)
        .reduce((sum, m) => sum + (parseFloat(m.amount) || 0), 0);

      if (modalSum > 0) {
        setTotalModalSperpart(modalSum.toFixed(2));
        // ensure totalModalSperpart is not overwritten by spread
        setSavedCostValues({
          ...defaultCostObject(),
          totalModalSperpart: modalSum,
        });
      } else {
        resetCostFields();
        setSavedCostValues(null);
      }
    }
  }, [noPenawaran, penawarans, modalCosts, modals]);

  // Handle noPenawaran selection change
  const handleNoPenawaranChange = (value: string) => {
    setNoPenawaran(value);
    const penawaran = penawarans.find((p) => p.noPenawaran === value);
    setSelectedPenawaran(penawaran);

    if (penawaran?.tanggal) {
      const date = new Date(penawaran.tanggal);
      setTanggal(date.toISOString().split("T")[0]);
    }
  };

  const calculateActualCost = (
    multiplier: string,
    defaultValue: number,
  ): number => {
    const mult = parseFloat(multiplier) || 0;
    return mult * defaultValue;
  };

  const calculateDutyTax = (percent: string): number => {
    const pct = parseFloat(percent) || 0;
    const totalModal = parseFloat(totalModalSperpart) || 0;
    return (pct / 100) * totalModal;
  };

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
      feeKurir: parseFloat(feeKurir) || 0,
      otherCostTruck: parseFloat(otherCostTruck) || 0,
      otherCostServiceBoat: parseFloat(otherCostServiceBoat) || 0,
      otherCostLainLain: parseFloat(otherCostLainLain) || 0,
    };
  };

  const calculateSubTotal = (): number => {
    if (savedCostValues) {
      return (
        savedCostValues.discount +
        savedCostValues.totalModalSperpart +
        savedCostValues.bankCharge +
        savedCostValues.packingCost +
        savedCostValues.deliveryDutyTax +
        savedCostValues.deliveryLocalCost +
        savedCostValues.deliveryAirDHL +
        savedCostValues.deliveryAirDoorToDoor +
        savedCostValues.deliverySeaResmi +
        savedCostValues.deliverySeaDoorToDoor +
        savedCostValues.feeKurir +
        savedCostValues.otherCostTruck +
        savedCostValues.otherCostServiceBoat +
        savedCostValues.otherCostLainLain +
        calculateTotalHsi2BulanAddon() // tambahan 0.8% hanya saat checked
      );
    }

    const calculatedCosts = getCalculatedCosts();
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
      calculatedCosts.otherCostLainLain +
      calculateTotalHsi2BulanAddon() // tambahan 0.8% hanya saat checked
    );
  };

  // HSI-2 Bulan (sesuai permintaan):
  // Jika ter-checklist:
  //   HSI-2 = (Total Sperpart + Bank Charge + Packing Cost + Duty Tax + Local Cost +
  //           AIR DHL + AIR Door to Door + SEA Resmi + SEA Door to Door + Fee Kurir +
  //           Truck + Service Boat + Lain-lain - Discount) × 0.8%
  // Jika tidak ter-checklist: 0
  const calculateTotalHsi2BulanAddon = (): number => {
    if (!includeHsi2Bulan) return 0;

    const totalModal = parseFloat(totalModalSperpart) || 0;
    const discountValue = parseFloat(discount) || 0;

    const calculatedCosts = getCalculatedCosts();

    const base =
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
      calculatedCosts.otherCostLainLain -
      discountValue;

    const addonPercent = 0.08;
    return base * addonPercent;
  };

  // HSI-2 Bulan nilai yang ditampilkan harus ikut skema checklist
  const calculateTotalHsi = (): number => {
    return calculateTotalHsi2BulanAddon();
  };

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
    totalModalSperpart,
    discount,
  ]);

  const defaultCostObject = () => ({
    discount: 0,
    totalModalSperpart: 0,
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

  const handleSaveCost = async () => {
    if (!noPenawaran || !selectedPenawaran) {
      alert("Pilih No. RFS terlebih dahulu");
      return;
    }

    const saveNoQuo = selectedPenawaran.noQuo;
    setIsLoading(true);

    try {
      const actualCosts = getCalculatedCosts();
      const actualHsi = calculateTotalHsi();

      const costData = {
        noQuo: saveNoQuo,
        discount: parseFloat(discount) || 0,
        totalModalSperpart: parseFloat(totalModalSperpart) || 0,
        bankCharge: actualCosts.bankCharge,
        packingCost: actualCosts.packingCost,
        deliveryDutyTaxPercent: parseFloat(deliveryDutyTax) || 0,
        deliveryAirDHL: actualCosts.deliveryAirDHL,
        deliveryAirDoorToDoor: actualCosts.deliveryAirDoorToDoor,
        deliverySeaResmi: actualCosts.deliverySeaResmi,
        deliverySeaDoorToDoor: actualCosts.deliverySeaDoorToDoor,
        deliveryLocalCost: actualCosts.deliveryLocalCost,
        feeKurir: actualCosts.feeKurir,
        otherCostTruck: actualCosts.otherCostTruck,
        otherCostServiceBoat: actualCosts.otherCostServiceBoat,
        otherCostLainLain: actualCosts.otherCostLainLain,
        hsi: actualHsi,
      };

      const response = await fetch("/api/modal-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(costData),
      });

      const responseData = await response.json();
      if (!response.ok) {
        alert(`Gagal menyimpan cost: ${responseData.error || "Unknown error"}`);
        return;
      }

      setCostSaved(true);
      setTimeout(() => setCostSaved(false), 3000);

      setModalCosts((prev) => {
        const newCosts = prev.filter((c) => c.noQuo !== saveNoQuo);
        return [...newCosts, responseData];
      });

      setTableRefreshKey((prev) => prev + 1);
      await Promise.all([fetchModalCosts(), fetchModals(), fetchPenawarans()]);
      setTableRefreshKey((prev) => prev + 1);

      alert("Cost berhasil disimpan! Sub Total table updated.");
    } catch (error) {
      console.error("Error saving cost:", error);
      alert("Terjadi kesalahan saat menyimpan cost");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCost = async () => {
    if (!noPenawaran || !selectedPenawaran) return;
    if (!confirm("Apakah Anda yakin ingin mereset cost untuk No. RFS ini?"))
      return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/modal-cost?noQuo=${encodeURIComponent(selectedPenawaran.noQuo)}`,
        { method: "DELETE" },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(`Gagal mereset cost: ${errorData.error || "Unknown error"}`);
        return;
      }

      resetCostFields();
      setSavedCostValues(null);
      await fetchModalCosts();
      alert("Cost berhasil direset!");
    } catch (error) {
      console.error("Error resetting cost:", error);
      alert("Terjadi kesalahan saat mereset cost");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId("");
    setNoPenawaran("");
    setSelectedPenawaran(null);
    setKodeImpa("");
    setDescription("");
    setLocation("");
    setQty("");
    setSatuan("");
    setUnitPrice("");
    setAmount("");
    setTanggal("");
    setNamaToko("");
    resetCostFields();
  };

  const handleEdit = (modal: any) => {
    setIsEditing(true);
    setEditingId(modal.id);
    setNoPenawaran(modal.noPenawaran);

    const penawaran = penawarans.find(
      (p) => p.noPenawaran === modal.noPenawaran,
    );
    setSelectedPenawaran(penawaran);

    setKodeImpa(modal.kodeImpa || "");
    setDescription(modal.description);
    setLocation(modal.location || "");
    setQty(modal.qty.toString());
    setSatuan(modal.satuan);
    setUnitPrice(modal.unitPrice?.toString() || "");
    setAmount(modal.amount.toString());

    if (modal.tanggal) {
      const date = new Date(modal.tanggal);
      setTanggal(date.toISOString().split("T")[0]);
    } else if (penawaran?.tanggal) {
      const date = new Date(penawaran.tanggal);
      setTanggal(date.toISOString().split("T")[0]);
    } else {
      setTanggal("");
    }
    setNamaToko(modal.namaToko || "");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const response = await fetch(`/api/modal/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        alert(`Gagal menghapus data: ${errorData.error || "Unknown error"}`);
        return;
      }

      await fetchModals();
      if (editingId === id) resetForm();
      alert("Data berhasil dihapus!");
    } catch (error) {
      console.error("Error deleting modal:", error);
      alert("Terjadi kesalahan saat menghapus data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!noPenawaran) {
        alert("No. RFS wajib dipilih");
        return;
      }
      if (!description) {
        alert("Description wajib diisi");
        return;
      }
      if (!qty) {
        alert("Qty wajib diisi");
        return;
      }
      if (!satuan) {
        alert("Satuan wajib diisi");
        return;
      }
      if (!unitPrice) {
        alert("Unit Price wajib diisi");
        return;
      }
      if (!amount) {
        alert("Amount wajib diisi");
        return;
      }

      const url = isEditing ? `/api/modal/${editingId}` : "/api/modal";
      const method = isEditing ? "PUT" : "POST";

      const penawaran = penawarans.find((p) => p.noPenawaran === noPenawaran);

      const modalData = {
        noQuo: penawaran?.noQuo || null,
        noPenawaran,
        kodeImpa: kodeImpa || null,
        description,
        location: location || null,
        namaToko: namaToko || null,
        qty: parseFloat(qty) || 0,
        satuan,
        unitPrice: parseFloat(unitPrice) || 0,
        amount: parseFloat(amount) || 0,
        tanggal: tanggal || null,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modalData),
      });

      const responseData = await response.json();
      if (!response.ok) {
        const errorMsg =
          responseData.error || responseData.details || "Terjadi kesalahan";
        alert(`Gagal menyimpan modal: ${errorMsg}`);
        return;
      }

      await Promise.all([fetchModals(), fetchModalCosts(), fetchPenawarans()]);

      // Jika detail modal sedang terbuka untuk noPenawaran ini, paksa reload supaya tampilan disc ikut berubah
      if (showDetailModal && detailNoPenawaran?.noPenawaran === noPenawaran) {
        await refreshDetailData(1);
      }

      resetForm();
      alert("Data berhasil disimpan!");
    } catch (error) {
      console.error("Error saving modal:", error);
      alert("Terjadi kesalahan saat menyimpan modal");
    } finally {
      setIsLoading(false);
    }
  };

  // Grouped table for detail totals
  const groupedModals = React.useMemo(() => {
    const grouped: { [key: string]: any } = {};
    const lowerSearch = searchTerm.toLowerCase();

    const safeSum = (fields: any[]) =>
      fields.reduce((s, f) => s + (parseFloat(f) || 0), 0);

    modals.forEach((modal) => {
      if (!modal.noPenawaran) return;

      const penawaran = penawarans.find(
        (p) => p.noPenawaran === modal.noPenawaran,
      );

      const matchesSearch =
        !searchTerm ||
        modal.description?.toLowerCase().includes(lowerSearch) ||
        modal.unitPrice?.toString().includes(searchTerm) ||
        penawaran?.noQuo?.toLowerCase().includes(lowerSearch) ||
        penawaran?.pt?.toLowerCase().includes(lowerSearch);

      if (!matchesSearch) return;

      if (!grouped[modal.noPenawaran]) {
        grouped[modal.noPenawaran] = {
          noPenawaran: modal.noPenawaran,
          noQuo: penawaran?.noQuo || "-",
          pt: penawaran?.pt || "",
          kapal: penawaran?.kapal || "",
          tanggal: penawaran?.tanggal || "",
          items: [],
          hasCost: false,
          totalCost: 0,
          itemSubTotal: 0,
          totalKeseluruhan: 0,
        };
      }
      grouped[modal.noPenawaran].items.push(modal);
    });

    const result = Object.values(grouped).filter((g) => g.noPenawaran);

    result.forEach((group) => {
      const penawaran = penawarans.find(
        (p) => p.noPenawaran === group.noPenawaran,
      );
      const existingCost = penawaran
        ? modalCosts.find((c) => c.noQuo === penawaran.noQuo)
        : null;

      let hasCost = false;
      let totalCost = 0;

      let hsiValue = 0;

      if (existingCost) {
        hasCost = true;
        const costFields = [
          existingCost.bankCharge,
          existingCost.packingCost,
          existingCost.deliveryDutyTax,
          existingCost.deliveryLocalCost,
          existingCost.deliveryAirDHL,
          existingCost.deliveryAirDoorToDoor,
          existingCost.deliverySeaResmi,
          existingCost.deliverySeaDoorToDoor,
          existingCost.feeKurir,
          existingCost.otherCostTruck,
          existingCost.otherCostServiceBoat,
          existingCost.otherCostLainLain,
        ];
        totalCost = safeSum(costFields);

        // Field HSI sesuai permintaan:
        // HSI = Total Sperpart + Total Cost × 8%
        // (dibulatkan sesuai formatting tabel)
        if (includeHsi2Bulan) {
          const totalSperpart =
            parseFloat(existingCost.totalModalSperpart as any) || 0;
          hsiValue = (totalSperpart + totalCost) * 0.08;
        }
      }

       
      group.hsi = hsiValue;

      const itemSubTotal = group.items.reduce(
        (sum: number, item: any) => sum + (parseFloat(item.amount) || 0),
        0,
      );

      group.hasCost = hasCost;
      group.totalCost = totalCost;
      group.itemSubTotal = itemSubTotal;

      // Rumus Total Keseluruhan sesuai permintaan:
      // Total Keseluruhan = Total Sperpart + Total Cost + HSI
      group.totalKeseluruhan =
        itemSubTotal + (hasCost ? totalCost : 0) + (hasCost ? hsiValue : 0);
    });

    return result;
  }, [modals, penawarans, searchTerm, modalCosts, tableRefreshKey]);

  const refreshDetailData = async (attempt = 1) => {
    if (!detailNoPenawaran?.noPenawaran) {
      setDetailError("No No. RFS selected");
      return;
    }

    setDetailLoading(true);
    setDetailError("");

    try {
      const response = await fetch(
        `/api/modal?noPenawaran=${encodeURIComponent(detailNoPenawaran.noPenawaran)}`,
        { cache: "no-store" },
      );

      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const freshModals = await response.json();
      const regularModals = freshModals.filter((m: any) => !m.isAktual);
      setDetailModals(regularModals);

      if (regularModals.length === 0 && attempt < 3) {
        setTimeout(() => refreshDetailData(attempt + 1), 500);
        return;
      }

      if (regularModals.length === 0) {
        setDetailError(
          `No regular modal data found for ${detailNoPenawaran.noPenawaran} (tried ${attempt}x)`,
        );
      }
    } catch (error) {
      console.error("Error refreshing detail data:", error);
      if (attempt < 3) {
        setTimeout(() => refreshDetailData(attempt + 1), 500);
        return;
      }
      setDetailError(
        `Failed to load after ${attempt} attempts: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDetailClick = async (group: any) => {
    const noPenawaranValue = group?.noPenawaran;

    setIsDetailMode(true);
    setDetailError("");
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailNoPenawaran(group);

    if (!noPenawaranValue) {
      setDetailError("No No. RFS selected");
      setDetailLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/modal?noPenawaran=${encodeURIComponent(noPenawaranValue)}`,
        { cache: "no-store" },
      );

      if (!response.ok)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      const freshModals = await response.json();
      const regularModals = freshModals.filter((m: any) => !m.isAktual);
      setDetailModals(regularModals);

      if (regularModals.length === 0) {
        setDetailError(`No regular modal data found for ${noPenawaranValue}`);
      }
    } catch (error) {
      setDetailError(
        `Failed to load detail: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setDetailLoading(false);
    }
  };

  React.useEffect(() => {
    if (showDetailModal && detailNoPenawaran) refreshDetailData();
  }, [showDetailModal, detailNoPenawaran]);

  return (
    <AppShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                <Label htmlFor="noPenawaran">No. RFS</Label>
                <Select
                  value={noPenawaran}
                  onValueChange={handleNoPenawaranChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih No. RFS" />
                  </SelectTrigger>
                  <SelectContent>
                    {penawarans.map((penawaran) => (
                      <SelectItem
                        key={penawaran.id}
                        value={penawaran.noPenawaran}
                      >
                        {penawaran.noPenawaran} - {penawaran.pt}{" "}
                        {penawaran.noQuo ? `(${penawaran.noQuo})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPenawaran && (
                <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      No. Quo
                    </span>
                    <p className="font-medium">
                      {selectedPenawaran.noQuo || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      PT / Kapal
                    </span>
                    <p className="font-medium">
                      {selectedPenawaran.pt} / {selectedPenawaran.kapal || "-"}
                    </p>
                  </div>
                </div>
              )}

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
                <div className="grid gap-2">
                  <Label htmlFor="namaToko">Nama Toko</Label>
                  <Input
                    id="namaToko"
                    placeholder="Masukkan nama toko"
                    value={namaToko}
                    onChange={(e) => setNamaToko(e.target.value)}
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

        <Card>
          <CardHeader>
            <CardTitle>
              Cost - {selectedPenawaran?.noQuo || "(Pilih No. RFS)"}
              {selectedPenawaran && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (RFS: {noPenawaran})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Set biaya per quotation. Nilai yang diinput adalah multiplier.
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
                  className={noCostData || isLoadingCosts ? "bg-muted/80" : ""}
                />
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
              </div>
            </div>

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
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="feeKurir">Fee Kurir</Label>
                <Input
                  id="feeKurir"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={feeKurir}
                  onChange={(e) => setFeeKurir(e.target.value)}
                />
              </div>
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <input
                    id="includeHsi2Bulan"
                    type="checkbox"
                    checked={includeHsi2Bulan}
                    onChange={(e) => setIncludeHsi2Bulan(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="includeHsi2Bulan" className="m-0">
                    HSI - 2 Bulan (checkbox)
                  </Label>
                </div>
                <Input
                  id="hsi"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={hsi}
                  readOnly
                  className="bg-muted cursor-not-allowed"
                  title="Nilai HSI tersimpan mengikuti rumus existing; tambahan 0.8% dihitung ke Total Cost via checkbox"
                />
                <p className="text-xs text-muted-foreground">
                  Tambahan Total Cost:{" "}
                  <span className="font-medium">
                    {includeHsi2Bulan ? "ON" : "OFF"}
                  </span>{" "}
                  (= Total Sperpart × 0.8%)
                </p>
              </div>
            </div>

            <div className="border-t pt-3 mt-2">
              <Label className="text-sm font-semibold">Other Cost</Label>
              <div className="grid grid-cols-3 gap-3 mt-2">
                <div className="grid gap-1">
                  <Label htmlFor="otherCostTruck">Truck</Label>
                  <Input
                    id="otherCostTruck"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={otherCostTruck}
                    onChange={(e) => setOtherCostTruck(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="otherCostServiceBoat">Service Boat</Label>
                  <Input
                    id="otherCostServiceBoat"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={otherCostServiceBoat}
                    onChange={(e) => setOtherCostServiceBoat(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="otherCostLainLain">Lain-lain</Label>
                  <Input
                    id="otherCostLainLain"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={otherCostLainLain}
                    onChange={(e) => setOtherCostLainLain(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="border-t pt-4 mt-4 bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">SUB TOTAL:</span>
                <span className="text-2xl font-bold text-primary">
                  {calculateSubTotal().toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-4 items-center justify-end">
              <Button
                type="button"
                variant="destructive"
                onClick={handleResetCost}
                disabled={!noPenawaran || isLoading || !savedCostValues}
              >
                <X className="mr-2 h-4 w-4" />
                Reset Cost
              </Button>
              <Button
                type="button"
                onClick={handleSaveCost}
                disabled={!noPenawaran || isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Simpan Cost{" "}
                {selectedPenawaran?.noQuo ? `(${selectedPenawaran.noQuo})` : ""}
              </Button>
              {costSaved && (
                <span className="text-green-600 flex items-center text-sm">
                  ✓ Tersimpan!
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Modal</CardTitle>
            <CardDescription>
              Daftar modal yang tersimpan (dikelompokkan per No. RFS)
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-8"
              />
              {searchTerm && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={fetchModals}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {groupedModals.length === 0 ? (
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
                  <TableHead>No. RFS</TableHead>
                  <TableHead>No. Quo</TableHead>
                  <TableHead>PT</TableHead>
                  <TableHead>Kapal</TableHead>
                  <TableHead>Total Sperpart</TableHead>
                  <TableHead>Total Cost</TableHead>
                  <TableHead>HSI</TableHead>
                  <TableHead>Total Keseluruhan</TableHead>

                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedModals.map((group: any, index: number) => (
                  <TableRow
                    key={
                      group.noPenawaran ? group.noPenawaran : `group-${index}`
                    }
                  >
                    <TableCell>
                      {group.tanggal
                        ? new Date(group.tanggal).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="font-medium">
                      {group.noPenawaran}
                    </TableCell>
                    <TableCell>{group.noQuo}</TableCell>
                    <TableCell>{group.pt || "-"}</TableCell>
                    <TableCell>{group.kapal || "-"}</TableCell>
                    <TableCell className="font-medium">
                      {group.itemSubTotal.toLocaleString("id-ID", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="font-medium">
                      {group.totalCost.toLocaleString("id-ID", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                      {group.hasCost && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                          Cost
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">
                      {Number(group.hsi || 0).toLocaleString("id-ID", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>
                    <TableCell className="font-bold">
                      {group.totalKeseluruhan.toLocaleString("id-ID", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDetailClick(group)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Detail
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="!max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Detail Modal - {detailNoPenawaran?.noPenawaran}
            </DialogTitle>
            <DialogDescription className="text-base">
              No. Quo: {detailNoPenawaran?.noQuo || "-"} | PT:{" "}
              {detailNoPenawaran?.pt || "-"} | Kapal:{" "}
              {detailNoPenawaran?.kapal || "-"}
            </DialogDescription>
          </DialogHeader>

          {isEditing && (
            <Card className="mb-4 border-2 border-primary">
              <CardHeader>
                <CardTitle>Edit Modal</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-noPenawaran">No. RFS</Label>
                      <Input
                        id="edit-noPenawaran"
                        value={noPenawaran}
                        onChange={(e) => setNoPenawaran(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-kodeImpa">Kode/IMPA</Label>
                      <Input
                        id="edit-kodeImpa"
                        value={kodeImpa}
                        onChange={(e) => setKodeImpa(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-location">Location</Label>
                      <Input
                        id="edit-location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-tanggal">Tanggal</Label>
                      <Input
                        id="edit-tanggal"
                        type="date"
                        value={tanggal}
                        onChange={(e) => setTanggal(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-namaToko">Nama Toko</Label>
                      <Input
                        id="edit-namaToko"
                        placeholder="Masukkan nama toko"
                        value={namaToko}
                        onChange={(e) => setNamaToko(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-qty">Qty</Label>
                      <Input
                        id="edit-qty"
                        type="number"
                        step="0.01"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-satuan">Satuan</Label>
                      <Input
                        id="edit-satuan"
                        value={satuan}
                        onChange={(e) => setSatuan(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-unitPrice">Unit Price</Label>
                      <Input
                        id="edit-unitPrice"
                        type="number"
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-amount">Amount</Label>
                      <Input
                        id="edit-amount"
                        type="number"
                        step="0.01"
                        value={amount}
                        readOnly
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Menyimpan..." : "Update Modal"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                  <TableHead className="whitespace-nowrap">Kode/IMPA</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Description
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Location</TableHead>
                  <TableHead className="whitespace-nowrap">Nama Toko</TableHead>
                  <TableHead className="whitespace-nowrap">Qty</TableHead>
                  <TableHead className="whitespace-nowrap">Satuan</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Unit Price
                  </TableHead>
                  <TableHead className="whitespace-nowrap">Amount</TableHead>
                  <TableHead className="text-right whitespace-nowrap">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailModals
                  .filter((modal: any) => {
                    if (!searchTerm) return true;
                    const lowerSearch = searchTerm.toLowerCase();
                    return (
                      modal.description?.toLowerCase().includes(lowerSearch) ||
                      modal.unitPrice?.toString().includes(searchTerm)
                    );
                  })
                  .map((modal: any, index: number) => (
                    <TableRow key={modal.id || `modal-${index}`}>
                      <TableCell className="whitespace-nowrap">
                        {modal.tanggal
                          ? new Date(modal.tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : new Date(modal.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {modal.kodeImpa || "-"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {modal.description}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {modal.location || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {modal.namaToko || "-"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {modal.qty}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {modal.satuan}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {parseFloat(modal.unitPrice || 0).toLocaleString(
                          "id-ID",
                        )}
                      </TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {parseFloat(modal.amount).toLocaleString("id-ID")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(modal)}
                          >
                            <Edit className="mr-1 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(modal.id)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Hapus
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {detailLoading && (
            <div className="flex justify-center py-8">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground">
                  Loading detail data {detailError ? "(retrying...)" : ""}
                </p>
              </div>
            </div>
          )}

          {detailError && !detailLoading && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 font-medium">{detailError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refreshDetailData()}
                className="mt-2"
              >
                <RefreshCw className="mr-1 h-3 w-3" />
                Coba lagi
              </Button>
            </div>
          )}

          <div className="border-t mt-4 pt-4 bg-muted/50 rounded-lg">
            <div className="flex justify-between items-center px-4">
              <span className="text-sm font-semibold">TOTAL AMOUNT:</span>
              <span className="text-lg font-bold text-primary">
                {detailModals
                  .filter((modal: any) => {
                    if (!searchTerm) return true;
                    const lowerSearch = searchTerm.toLowerCase();
                    return (
                      modal.description?.toLowerCase().includes(lowerSearch) ||
                      modal.unitPrice?.toString().includes(searchTerm)
                    );
                  })
                  .reduce(
                    (sum: number, modal: any) =>
                      sum + (parseFloat(modal.amount) || 0),
                    0,
                  )
                  .toLocaleString("id-ID", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
              </span>
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshDetailData()}
              disabled={detailLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailModal(false);
                setIsDetailMode(false);
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
