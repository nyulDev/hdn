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
  TableFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { AppShell } from "@/components/app-shell";

export default function ModalAktualPage() {
  const [modals, setModals] = React.useState<any[]>([]);
  const [penawarans, setPenawarans] = React.useState<any[]>([]);
  const [modalCosts, setModalCosts] = React.useState<any[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);

  // Basic fields
  const [noQuo, setNoQuo] = React.useState("");
  const [thisNoQuo, setThisNoQuo] = React.useState("");
  const [noPenawaran, setNoPenawaran] = React.useState("");
  const [kodeImpa, setKodeImpa] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [qty, setQty] = React.useState("");
  const [satuan, setSatuan] = React.useState("");
  const [unitPrice, setUnitPrice] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [tanggal, setTanggal] = React.useState("");
  const [namaToko, setNamaToko] = React.useState("");
  const [disc, setDisc] = React.useState("");
  const [onkir, setOnkir] = React.useState("");
  const [layanan, setLayanan] = React.useState("");

  // Cost fields (DIRECT INPUT - semua nominal aktual)
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
  const [includeHsi, setIncludeHsi] = React.useState(true);

  // Auto-populate states
  const [availableModals, setAvailableModals] = React.useState<any[]>([]);
  const [originalUnitPrice, setOriginalUnitPrice] = React.useState<
    number | null
  >(null);

  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState("");
  const [costSaved, setCostSaved] = React.useState(false);

  // Track saved cost values for SUB TOTAL calculation
  const [savedCostValues, setSavedCostValues] = React.useState<any>(null);

  // Description modal state
  const [showDescriptionModal, setShowDescriptionModal] = React.useState(false);
  const [selectedAvailableModals, setSelectedAvailableModals] = React.useState<
    any[]
  >([]);

  // Detail modal state
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [isDetailMode, setIsDetailMode] = React.useState(false);
  const [detailNoQuo, setDetailNoQuo] = React.useState<any>(null);
  const [detailModals, setDetailModals] = React.useState<any[]>([]);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [detailError, setDetailError] = React.useState("");

  // Search state
  const [searchTerm, setSearchTerm] = React.useState("");

  const fetchModals = async () => {
    try {
      const response = await fetch("/api/modal?isAktual=true");
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
      const response = await fetch("/api/modal-aktual-cost");
      if (response.ok) {
        const data = await response.json();
        setModalCosts(data);
      }
    } catch (error) {
      console.error("Error fetching modal costs:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customer");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const fetchAvailableModals = async (noPenawaranValue: string) => {
    try {
      const response = await fetch(
        `/api/modal?noPenawaran=${encodeURIComponent(noPenawaranValue)}&isAktual=false`,
      );
      if (response.ok) {
        const data = await response.json();
        setAvailableModals(data);
      }
    } catch (error) {
      console.error("Error fetching available modals:", error);
    }
  };

  // Get customer data by customerId
  const getCustomerById = (customerId: string) => {
    return customers.find((c) => c.id === customerId);
  };

  // Enhanced Group subtotal - 3-tier fallback with source tracking
  const [subtotalSource, setSubtotalSource] = React.useState<string>("");

  const getGroupSubtotal = (noQuo: string): number => {
    // 1. Saved ModalAktualCost (highest priority)
    const savedCost = modalCosts.find((c: any) => c.noQuo === noQuo);
    if (
      savedCost &&
      savedCost.totalModalSperpart !== null &&
      savedCost.totalModalSperpart !== undefined
    ) {
      setSubtotalSource("Saved Cost");
      return savedCost.totalModalSperpart;
    }

    // 2. Sum saved amount from AKTUEL modals
    const aktualItems = modals.filter(
      (m: any) => m.noQuo === noQuo && m.isAktual,
    );
    if (aktualItems.length > 0) {
      const sumAmount = aktualItems.reduce((sum: number, item: any) => {
        return sum + parseFloat(item.amount || "0");
      }, 0);
      if (sumAmount > 0) {
        setSubtotalSource(`Saved Amount (${aktualItems.length} items)`);
        return sumAmount;
      }
      const sum = aktualItems.reduce((sum: number, item: any) => {
        const qty = parseFloat(item.qty || 0);
        const nilaiAktual = parseFloat(item.nilaiAktual || 0);
        return sum + qty * nilaiAktual;
      }, 0);
      setSubtotalSource(`Aktual Fallback (${aktualItems.length} items)`);
      return sum;
    }

    // 3. Sum REGULAR modals (qty * unitPrice)
    const regularItems = modals.filter(
      (m: any) => m.noQuo === noQuo && !m.isAktual,
    );
    if (regularItems.length > 0) {
      const sum = regularItems.reduce((sum: number, item: any) => {
        const qty = parseFloat(item.qty || 0);
        const unitPrice = parseFloat(item.unitPrice || 0);
        return sum + qty * unitPrice;
      }, 0);
      setSubtotalSource(`Regular (${regularItems.length} items)`);
      return sum;
    }

    setSubtotalSource("No data");
    return 0;
  };

  const safeSum = (fields: any[]) =>
    fields.reduce((sum, field) => sum + (parseFloat(field) || 0), 0);

  // Group modals by noPenawaran
  const groupedModals = React.useMemo(() => {
    const grouped: { [key: string]: any } = {};
    const lowerSearch = searchTerm.toLowerCase();

    modals.forEach((modal) => {
      if (!modal.noPenawaran) return;

      const matchesSearch =
        !searchTerm ||
        modal.description?.toLowerCase().includes(lowerSearch) ||
        modal.unitPrice?.toString().includes(searchTerm) ||
        modal.nilaiAktual?.toString().includes(searchTerm);

      if (!matchesSearch) return;

      if (!grouped[modal.noPenawaran]) {
        const penawaran = penawarans.find(
          (p) => p.noPenawaran === modal.noPenawaran,
        );
        const noQuo = penawaran?.noQuo || "-";

        let hasCost = false;
        let totalCost = 0;
        const existingCost = modalCosts.find((c: any) => c.noQuo === noQuo);
        if (existingCost) {
          hasCost = true;
          // Total Cost = semua cost direct input - discount
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
          totalCost = safeSum(costFields) - (existingCost.discount || 0);
        }
        const aktualItems = modals.filter(
          (m: any) => m.noQuo === noQuo && m.isAktual,
        );
        let itemSubTotal = 0;
        if (aktualItems.length > 0) {
          const sumAmount = aktualItems.reduce((sum: number, item: any) => {
            return sum + parseFloat(item.amount || "0");
          }, 0);
          if (sumAmount > 0) {
            itemSubTotal = sumAmount;
          } else {
            itemSubTotal = aktualItems.reduce((sum: number, item: any) => {
              const qty = parseFloat(item.qty || 0);
              const nilaiAktual = parseFloat(item.nilaiAktual || 0);
              return sum + qty * nilaiAktual;
            }, 0);
          }
        }

        // HSI 2 Bulan (dibulatkan integer). Pakai angka yang tersimpan di existingCost saat ada.
        const hsiRounded = existingCost?.hsi
          ? Math.round(parseFloat(existingCost.hsi))
          : 0;
        const totalCostIncludingHsi = totalCost + hsiRounded;
        // Total Keseluruhan = Total Sperpart + Total Cost (termasuk HSI)
        const totalKeseluruhan = totalCostIncludingHsi + itemSubTotal;

        grouped[modal.noPenawaran] = {
          noPenawaran: modal.noPenawaran,
          noQuo,
          pt: penawaran?.pt || "",
          kapal: penawaran?.kapal || "",
          tanggal: penawaran?.tanggal || "",
          itemSubTotal,
          totalCost: totalCostIncludingHsi,
          totalKeseluruhan,
          hasCost,
          items: [],
        };
      }
      grouped[modal.noPenawaran].items.push(modal);
    });

    return Object.values(grouped).filter((group: any) => group.noPenawaran);
  }, [modals, penawarans, searchTerm, modalCosts]);

  // Load/populate cost fields when noQuo changes
  React.useEffect(() => {
    if (!noQuo) return;

    const loadData = async () => {
      try {
        const response = await fetch("/api/modal-aktual-cost");
        if (response.ok) {
          const data = await response.json();
          setModalCosts(data);

          const savedCost = data.find((c: any) => c.noQuo === noQuo);
          if (savedCost) {
            setDiscount((savedCost.discount || 0).toString());
            setTotalModalSperpart(
              (savedCost.totalModalSperpart || 0).toString(),
            );
            setBankCharge((savedCost.bankCharge || 0).toString());
            setPackingCost((savedCost.packingCost || 0).toString());
            setDeliveryDutyTax((savedCost.deliveryDutyTax || 0).toString());
            setDeliveryAirDHL((savedCost.deliveryAirDHL || 0).toString());
            setDeliveryAirDoorToDoor(
              (savedCost.deliveryAirDoorToDoor || 0).toString(),
            );
            setDeliverySeaResmi((savedCost.deliverySeaResmi || 0).toString());
            setDeliverySeaDoorToDoor(
              (savedCost.deliverySeaDoorToDoor || 0).toString(),
            );
            setDeliveryLocalCost((savedCost.deliveryLocalCost || 0).toString());
            setFeeKurir((savedCost.feeKurir || 0).toString());
            setOtherCostTruck((savedCost.otherCostTruck || 0).toString());
            setOtherCostServiceBoat(
              (savedCost.otherCostServiceBoat || 0).toString(),
            );
            setOtherCostLainLain((savedCost.otherCostLainLain || 0).toString());
            setHsi((savedCost.hsi || 0).toString());
            setSavedCostValues(savedCost);
          } else {
            resetCostFields();
            setSavedCostValues(null);
          }
        }
      } catch (error) {
        console.error("Error fetching modal costs:", error);
      }
    };

    loadData();
  }, [noQuo]);

  // Auto-populate Total Modal Sperpart
  React.useEffect(() => {
    if (noQuo) {
      const sum = getGroupSubtotal(noQuo);
      const displayValue = parseFloat(sum.toFixed(2));
      setTotalModalSperpart(displayValue.toString());
    }
  }, [noQuo, modals, modalCosts, penawarans]);

  React.useEffect(() => {
    fetchModals();
    fetchPenawarans();
    fetchModalCosts();
    fetchCustomers();
  }, []);

  React.useEffect(() => {
    if (qty && unitPrice) {
      const qtyNum = parseFloat(qty);
      const unitPriceNum = parseFloat(unitPrice);
      const discNum = parseFloat(disc || "0");
      const onkirNum = parseFloat(onkir || "0");
      const layananNum = parseFloat(layanan || "0");
      const calculatedAmount =
        qtyNum * unitPriceNum - discNum + onkirNum + layananNum;
      setAmount(calculatedAmount.toFixed(2));
    } else {
      setAmount("");
    }
  }, [qty, unitPrice, disc, onkir, layanan]);

  const handleNoPenawaranChange = async (value: string) => {
    setNoPenawaran(value);
    const penawaran = penawarans.find((p) => p.noPenawaran === value);
    if (penawaran) {
      setNoQuo(penawaran.noQuo);
    }
    await fetchAvailableModals(value);

    if (availableModals.length > 0) {
      setSelectedAvailableModals(availableModals);
      setShowDescriptionModal(true);
    }

    setKodeImpa("");
    setLocation("");
    setDescription("");
    setQty("");
    setSatuan("");
    setUnitPrice("");
    setAmount("");
    setOriginalUnitPrice(null);
  };

  const handleDescriptionSelect = (value: string) => {
    const modal = availableModals.find((m) => m.id === value);
    if (modal) {
      setDescription(modal.description);
      setKodeImpa(modal.kodeImpa || "");
      setLocation(modal.location || "");
      setQty(modal.qty?.toString() || "");
      setSatuan(modal.satuan || "");
      setOriginalUnitPrice(modal.unitPrice);
      setUnitPrice("");
      setAmount("");
    }
  };

  // Get all calculated costs (langsung dari state)
  const getCalculatedCosts = () => {
    return {
      bankCharge: parseFloat(bankCharge) || 0,
      packingCost: parseFloat(packingCost) || 0,
      deliveryDutyTax: parseFloat(deliveryDutyTax) || 0,
      deliveryAirDHL: parseFloat(deliveryAirDHL) || 0,
      deliveryAirDoorToDoor: parseFloat(deliveryAirDoorToDoor) || 0,
      deliverySeaResmi: parseFloat(deliverySeaResmi) || 0,
      deliverySeaDoorToDoor: parseFloat(deliverySeaDoorToDoor) || 0,
      deliveryLocalCost: parseFloat(deliveryLocalCost) || 0,
      feeKurir: parseFloat(feeKurir) || 0,
      otherCostTruck: parseFloat(otherCostTruck) || 0,
      otherCostServiceBoat: parseFloat(otherCostServiceBoat) || 0,
      otherCostLainLain: parseFloat(otherCostLainLain) || 0,
    };
  };

  // Calculate total actual cost (semua cost termasuk discount sebagai pengurang)
  const calculateTotalActualCost = (): number => {
    const calculatedCosts = getCalculatedCosts();
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

  // Calculate HSI base = (Discount + Total Modal Sperpart + Bank Charge + Packing Cost + Duty Tax + Local Cost +
  // AIR DHL + AIR Door to Door + SEA Resmi + SEA Door to Door + Fee Kurir)
  const calculateHsiBase = (): number => {
    const totalModal = parseFloat(totalModalSperpart) || 0;
    return (
      (parseFloat(discount) || 0) +
      totalModal +
      (parseFloat(bankCharge) || 0) +
      (parseFloat(packingCost) || 0) +
      (parseFloat(deliveryDutyTax) || 0) +
      (parseFloat(deliveryLocalCost) || 0) +
      (parseFloat(deliveryAirDHL) || 0) +
      (parseFloat(deliveryAirDoorToDoor) || 0) +
      (parseFloat(deliverySeaResmi) || 0) +
      (parseFloat(deliverySeaDoorToDoor) || 0) +
      (parseFloat(feeKurir) || 0)
    );
  };

  // Calculate total HSI - 2 Bulan = 8% dari HSI base
  const calculateTotalHsi = (): number => {
    if (!includeHsi) return 0;
    return calculateHsiBase() * 0.08;
  };

  // Calculate Sub Total = Total Modal Sperpart + semua cost - discount
  const calculateSubTotal = (): number => {
    if (savedCostValues) {
      return (
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
        savedCostValues.otherCostLainLain -
        savedCostValues.discount
      );
    }

    const calculatedCosts = getCalculatedCosts();
    const discountValue = parseFloat(discount) || 0;
    const totalModal = parseFloat(totalModalSperpart) || 0;

    return (
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
      discountValue
    );
  };

  // Auto-calculate HSI ketika cost berubah
  // HSI - 2 Bulan harus dibulatkan (contoh: 1541761,60 -> 1541762)
  React.useEffect(() => {
    const calculatedHsi = calculateTotalHsi();
    // Round to nearest integer (IDR)
    const rounded = Math.round(calculatedHsi);
    setHsi(rounded.toString());
  }, [
    includeHsi,
    discount,
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
  ]);

  // Save cost ke database (nilai langsung)
  const handleSaveCost = async () => {
    if (!noQuo) {
      alert("Pilih No. Quo terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      const actualCosts = getCalculatedCosts();
      const actualHsi = calculateTotalHsi();

      const response = await fetch("/api/modal-aktual-cost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noQuo,
          discount: parseFloat(discount) || 0,
          totalModalSperpart: parseFloat(totalModalSperpart) || 0,
          bankCharge: actualCosts.bankCharge,
          packingCost: actualCosts.packingCost,
          deliveryDutyTax: actualCosts.deliveryDutyTax,
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
        }),
      });

      if (response.ok) {
        setCostSaved(true);
        setTimeout(() => setCostSaved(false), 3000);

        await Promise.all([
          fetchModals(),
          fetchModalCosts(),
          fetchPenawarans(),
        ]);

        const updatedCosts = await (
          await fetch("/api/modal-aktual-cost")
        ).json();
        const updatedSavedCost = updatedCosts.find(
          (c: any) => c.noQuo === noQuo,
        );
        if (updatedSavedCost) {
          setSavedCostValues(updatedSavedCost);
        }

        alert(
          "✅ Cost berhasil disimpan! Sub Total di table Daftar Modal Aktual sudah update.",
        );
      } else {
        console.error("Failed to save cost");
      }
    } catch (error) {
      console.error("Error saving cost:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetCost = async () => {
    if (!noQuo) return;
    if (!confirm("Apakah Anda yakin ingin mereset cost untuk No. Quo ini?"))
      return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/modal-aktual-cost?noQuo=${encodeURIComponent(noQuo)}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        resetCostFields();
        setSavedCostValues(null);
        await fetchModalCosts();
      } else {
        console.error("Failed to reset cost");
      }
    } catch (error) {
      console.error("Error resetting cost:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetCostFields = () => {
    setIncludeHsi(true);
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
    setNoPenawaran(modal.noPenawaran);
    setNoQuo(modal.noQuo);
    setKodeImpa(modal.kodeImpa || "");
    setDescription(modal.description);
    setLocation(modal.location || "");
    setQty(modal.qty.toString());
    setSatuan(modal.satuan);
    setDisc(modal.disc?.toString() || "");
    setOnkir(modal.onkir?.toString() || "");
    setLayanan(modal.layanan?.toString() || "");
    setOriginalUnitPrice(modal.unitPrice);
    setUnitPrice(modal.nilaiAktual?.toString() || "");
    setAmount(modal.amount.toString());
    if (modal.tanggal) {
      const date = new Date(modal.tanggal);
      setTanggal(date.toISOString().split("T")[0]);
    } else {
      setTanggal("");
    }
    setNamaToko(modal.namaToko || "");
  };

  const handleDeleteGroup = async (noQuo: string) => {
    if (
      !confirm(
        `Apakah Anda yakin ingin menghapus semua data modal dengan No. Quo "${noQuo}"?`,
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const modalsToDelete = modals.filter((m) => m.noQuo === noQuo);
      for (const modal of modalsToDelete) {
        const response = await fetch(`/api/modal/${modal.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          console.error(`Failed to delete modal ${modal.id}`);
        }
      }
      await fetchModals();
    } catch (error) {
      console.error("Error deleting modals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    try {
      const response = await fetch(`/api/modal/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchModals();
        if (editingId === id) resetForm();
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
    setNoPenawaran("");
    setKodeImpa("");
    setDescription("");
    setLocation("");
    setQty("");
    setSatuan("");
    setDisc("");
    setOnkir("");
    setLayanan("");
    setUnitPrice("");
    setAmount("");
    setOriginalUnitPrice(null);
    setTanggal("");
    setNamaToko("");
    resetCostFields();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!noQuo) {
        alert("No. Quo wajib dipilih");
        setIsLoading(false);
        return;
      }

      if (!description) {
        alert("Description wajib diisi");
        setIsLoading(false);
        return;
      }
      if (!qty) {
        alert("Qty wajib diisi");
        setIsLoading(false);
        return;
      }
      if (!satuan) {
        alert("Satuan wajib diisi");
        setIsLoading(false);
        return;
      }
      if (!unitPrice) {
        alert("Nilai Aktual wajib diisi");
        setIsLoading(false);
        return;
      }
      if (!amount) {
        alert("Amount wajib diisi");
        setIsLoading(false);
        return;
      }

      // Description boleh sama untuk No. RFS yang sama.
      // Duplikasi hanya ditangani oleh aturan backend (mis. kodeImpa) jika memang diperlukan.

      if (!isEditing) {
        // no-op
      }

      const url = isEditing ? `/api/modal/${editingId}` : "/api/modal";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noPenawaran,
          noQuo,
          kodeImpa: kodeImpa || null,
          description,
          location: location || null,
          qty: parseFloat(qty) || 0,
          satuan,
          unitPrice: originalUnitPrice !== null ? originalUnitPrice : 0,
          isAktual: true,
          nilaiAktual: parseFloat(unitPrice) || 0,
          amount: parseFloat(amount) || 0,
          tanggal: tanggal || null,
          namaToko: namaToko || null,
          disc: parseFloat(disc) || 0,
          onkir: parseFloat(onkir) || 0,
          layanan: parseFloat(layanan) || 0,
        }),
      });

      if (response.ok) {
        await fetchModals();
        if (showDetailModal && detailNoQuo?.noQuo === noQuo) {
          await refreshDetailData(noQuo);
          // ensure UI shows latest edited row amount
          setIsEditing(false);
          setEditingId("");
        }

        resetForm();
      } else {
        let errorData = {};
        try {
          const text = await response.text();
          if (text) errorData = JSON.parse(text);
        } catch (e) {
          console.log("Could not parse response:", e);
        }
        console.error("Failed to save modal:", errorData);
        const errorMsg =
          (errorData as any).error ||
          (errorData as any).details ||
          "Terjadi kesalahan";
        alert(`Gagal menyimpan modal (${response.status}): ${errorMsg}`);
      }
    } catch (error) {
      console.error("Error saving modal:", error);
      alert("Terjadi kesalahan saat menyimpan modal. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const detailAbortRef = React.useRef<AbortController | null>(null);
  const detailCacheRef = React.useRef<Map<string, any[]>>(new Map());

  const refreshDetailData = async (
    noQuoValue: string,
    opts?: { force?: boolean },
  ) => {
    if (!noQuoValue) return;

    const force = !!opts?.force;

    // Serve from cache for instant UX
    if (!force && detailCacheRef.current.has(noQuoValue)) {
      setDetailModals(detailCacheRef.current.get(noQuoValue) || []);
      setDetailLoading(false);
      setDetailError("");
      return;
    }

    // Abort previous request so fast clicks don't pile up
    detailAbortRef.current?.abort();
    const controller = new AbortController();
    detailAbortRef.current = controller;

    setDetailLoading(true);
    setDetailError("");
    // keep empty while loading (already set by click handler)

    try {
      const response = await fetch(
        `/api/modal?noQuo=${encodeURIComponent(noQuoValue)}&isAktual=true`,
        {
          signal: controller.signal,
          // keep cache coherent without browser stale issues; backend should be source-of-truth
          cache: "no-store",
        },
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const freshModals = await response.json();
      detailCacheRef.current.set(noQuoValue, freshModals);
      setDetailModals(freshModals);
      setDetailLoading(false);
    } catch (error: any) {
      if (error?.name === "AbortError") return;
      console.warn("Detail fetch failed:", error);
      setDetailError("Gagal memuat detail. Coba lagi.");
      setDetailLoading(false);
    }
  };

  const handleDetailClick = async (group: any) => {
    setDetailNoQuo(group);
    setIsDetailMode(true);
    setShowDetailModal(true);

    // Reset UI dulu agar tidak tampil data lama saat klik cepat/berulang
    setDetailError("");
    setDetailLoading(true);
    setDetailModals([]);

    // Fetch (or instant from cache)
    refreshDetailData(group?.noQuo);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("id-ID", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const calculatedCosts = getCalculatedCosts();

  return (
    <AppShell>
      <div className="mt-0 md:mt-0 p-2 md:p-2 space-y-4">
        {/* Side by Side Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Add Modal Card (tidak berubah) */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? "Edit Modal Aktual" : "Add Modal Aktual"}
              </CardTitle>
              <CardDescription>
                {isEditing
                  ? "Edit data modal yang sudah ada"
                  : "Tambahkan data modal baru ke dalam sistem"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ... (sama seperti kode asli, tidak diubah) ... */}
                <div className="grid gap-2">
                  <Label htmlFor="noRFS">No. RFS</Label>
                  <div className="flex gap-2">
                    <Select
                      value={noPenawaran}
                      onValueChange={handleNoPenawaranChange}
                      required
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Pilih No. RFS" />
                      </SelectTrigger>
                      <SelectContent>
                        {penawarans.map((penawaran) => (
                          <SelectItem
                            key={penawaran.id}
                            value={penawaran.noPenawaran}
                          >
                            {penawaran.noPenawaran} - {penawaran.pt} (
                            {penawaran.noQuo})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (availableModals.length > 0 && noPenawaran) {
                          setSelectedAvailableModals(availableModals);
                          setShowDescriptionModal(true);
                        } else {
                          alert("Pilih No. RFS terlebih dahulu");
                        }
                      }}
                      title="Lihat Descriptions"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {noQuo && availableModals.length > 0 && (
                  <div className="grid gap-2">
                    <Label htmlFor="descriptionSelect">
                      Pilih dari Modal (Opsional)
                    </Label>
                    <Select onValueChange={handleDescriptionSelect}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Description" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableModals.map((modal) => (
                          <SelectItem key={modal.id} value={modal.id}>
                            {modal.description} (IMPA: {modal.kodeImpa || "-"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      placeholder="PCS"
                      value={satuan}
                      onChange={(e) => setSatuan(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="unitPrice">Nilai Aktual</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      step="1"
                      placeholder="0"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="disc">Disc</Label>
                    <Input
                      id="disc"
                      type="number"
                      step="1"
                      placeholder="0"
                      value={disc}
                      onChange={(e) => setDisc(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="onkir">Onkir</Label>
                    <Input
                      id="onkir"
                      type="number"
                      step="1"
                      placeholder="0"
                      value={onkir}
                      onChange={(e) => setOnkir(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="layanan">Layanan</Label>
                    <Input
                      id="layanan"
                      type="number"
                      step="1"
                      placeholder="0"
                      value={layanan}
                      onChange={(e) => setLayanan(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="namaToko">Nama Toko</Label>
                    <Input
                      id="namaToko"
                      placeholder="Masukkan nama toko"
                      value={namaToko}
                      onChange={(e) => setNamaToko(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="1"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-muted"
                    />
                  </div>
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

          {/* Cost Card - SEMUA DIRECT INPUT */}
          <Card>
            <CardHeader>
              <CardTitle>
                Cost - {noPenawaran || "(Pilih No. RFS)"}{" "}
                {noQuo ? `(${noQuo})` : ""}
              </CardTitle>
              <CardDescription>
                Masukkan nominal aktual setiap biaya (Direct Input)
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
                  <Label htmlFor="totalModalSperpart">
                    Total Modal Sperpart
                  </Label>
                  <Input
                    id="totalModalSperpart"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={totalModalSperpart}
                    className="bg-muted/80 font-mono"
                    readOnly
                    title={subtotalSource}
                  />
                  <span className="text-xs text-muted-foreground">
                    ({subtotalSource}) No. Quo {noQuo || "..."}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1">
                  <Label htmlFor="bankCharge">Bank Charge (Direct Input)</Label>
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
                    Packing Cost (Direct Input)
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

              {/* Delivery Section - Semua direct input */}
              <div className="border-t pt-3 mt-2">
                <Label className="text-sm font-semibold">Delivery</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="grid gap-1">
                    <Label htmlFor="deliveryDutyTax">
                      Duty Tax (Direct Input)
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
                      Local Cost (Direct Input)
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
                      AIR (DHL) (Direct Input)
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
                      AIR (Door to Door) (Direct Input)
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
                      SEA (RESMI) (Direct Input)
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
                      SEA (Door to Door) (Direct Input)
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

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="grid gap-1">
                  <Label htmlFor="feeKurir">Fee Kurir (Direct Input)</Label>
                  <Input
                    id="feeKurir"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={feeKurir}
                    onChange={(e) => setFeeKurir(e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="includeHsi"
                      checked={includeHsi}
                      onCheckedChange={(v) => setIncludeHsi(Boolean(v))}
                    />
                    <Label htmlFor="hsi" className="m-0">
                      HSI - 2 Bulan (8%)
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
                  />
                </div>
              </div>

              {/* Other Cost Section (tetap direct input) */}
              <div className="border-t pt-3 mt-2">
                <Label className="text-sm font-semibold">Other Cost</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div className="grid gap-1">
                    <Label htmlFor="otherCostTruck">Truck (Direct Input)</Label>
                    <Input
                      id="otherCostTruck"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={otherCostTruck}
                      onChange={(e) => setOtherCostTruck(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="otherCostServiceBoat">
                      Service Boat (Direct Input)
                    </Label>
                    <Input
                      id="otherCostServiceBoat"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={otherCostServiceBoat}
                      onChange={(e) => setOtherCostServiceBoat(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-1">
                    <Label htmlFor="otherCostLainLain">
                      Lain-lain (Direct Input)
                    </Label>
                    <Input
                      id="otherCostLainLain"
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={otherCostLainLain}
                      onChange={(e) => setOtherCostLainLain(e.target.value)}
                    />
                  </div>
                </div>
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

              {/* Save / Reset Buttons */}
              <div className="flex gap-2 mt-4 items-center justify-end">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleResetCost}
                  disabled={!noQuo || isLoading || !savedCostValues}
                >
                  <X className="mr-2 h-4 w-4" />
                  Reset Cost
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveCost}
                  disabled={!noQuo || isLoading}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Simpan Cost {noPenawaran ? `(${noPenawaran})` : ""}
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
      </div>

      {/* Daftar Modal Table (tidak berubah signifikan) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Daftar Modal Aktual</CardTitle>
            <CardDescription>
              Daftar modal yang tersimpan (dikelompokkan per No. Quo)
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Input
                placeholder="Search desc / price..."
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
                  <TableHead>PT</TableHead>
                  <TableHead>Kapal</TableHead>
                  <TableHead className="text-left items-end">
                    Total Sperpart
                  </TableHead>
                  <TableHead className="text-left items-end">
                    Total Cost
                  </TableHead>
                  <TableHead className="text-left items-end font-bold">
                    Total Keseluruhan
                  </TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {groupedModals.map((group: any) => (
                  <TableRow key={group.noPenawaran || group.noQuo}>
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
                    <TableCell>{group.pt || "-"}</TableCell>
                    <TableCell>{group.kapal || "-"}</TableCell>
                    <TableCell className="font-medium items-end">
                      Rp {formatCurrency(group.itemSubTotal)}
                    </TableCell>
                    <TableCell className="font-medium items-end">
                      Rp {formatCurrency(group.totalCost)}
                      {group.hasCost && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                          Cost
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="font-bold items-end">
                      Rp {formatCurrency(group.totalKeseluruhan)}
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteGroup(group.noQuo)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
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

      {/* Description Modal (tidak berubah) */}
      <Dialog
        open={showDescriptionModal}
        onOpenChange={setShowDescriptionModal}
      >
        <DialogContent className="!max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Descriptions untuk No. RFS: {noPenawaran}
            </DialogTitle>
            <DialogDescription>
              Daftar descriptions yang tersedia dari modal page. Klik "Pilih"
              untuk auto-fill form.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode/IMPA</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedAvailableModals.map((modal: any) => (
                  <TableRow key={modal.id}>
                    <TableCell>{modal.kodeImpa || "-"}</TableCell>
                    <TableCell className="max-w-xs">
                      {modal.description}
                    </TableCell>
                    <TableCell>{modal.location || "-"}</TableCell>
                    <TableCell>{modal.qty}</TableCell>
                    <TableCell>{modal.satuan}</TableCell>
                    <TableCell>
                      {formatCurrency(parseFloat(modal.unitPrice || 0))}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => {
                          handleDescriptionSelect(modal.id);
                          setShowDescriptionModal(false);
                        }}
                      >
                        Pilih
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {selectedAvailableModals.length === 0 && (
            <p className="text-center text-muted-foreground mt-4">
              Belum ada descriptions untuk No. RFS ini.
            </p>
          )}
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setShowDescriptionModal(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Tutup
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Modal (tidak berubah signifikan) */}
      <Dialog
        open={showDetailModal}
        onOpenChange={(open) => {
          setShowDetailModal(open);
          if (!open) {
            setIsEditing(false);
            setEditingId("");
          }
        }}
      >
        <DialogContent className="!max-w-[95vw] w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Detail Modal Aktual - {detailNoQuo?.noQuo}
            </DialogTitle>
            <DialogDescription className="text-base">
              PT: {detailNoQuo?.pt || "-"} | Kapal: {detailNoQuo?.kapal || "-"}
            </DialogDescription>
          </DialogHeader>

          {isEditing && (
            <Card className="mb-4 border-2 border-primary">
              <CardHeader>
                <CardTitle>Edit Modal Aktual</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-noQuo">No. Quo</Label>
                      <Input
                        id="edit-noQuo"
                        value={noQuo}
                        onChange={(e) => setNoQuo(e.target.value)}
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
                      <Label htmlFor="edit-unitPrice">Nilai Aktual</Label>
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
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-muted"
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
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="edit-disc">Disc</Label>
                        <Input
                          id="edit-disc"
                          type="number"
                          step="1"
                          placeholder="0"
                          value={disc}
                          onChange={(e) => setDisc(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-onkir">Onkir</Label>
                        <Input
                          id="edit-onkir"
                          type="number"
                          step="1"
                          placeholder="0"
                          value={onkir}
                          onChange={(e) => setOnkir(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="edit-layanan">Layanan</Label>
                        <Input
                          id="edit-layanan"
                          type="number"
                          step="1"
                          placeholder="0"
                          value={layanan}
                          onChange={(e) => setLayanan(e.target.value)}
                        />
                      </div>
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
                  <TableHead className="whitespace-nowrap">Qty</TableHead>
                  <TableHead className="whitespace-nowrap">Satuan</TableHead>
                  <TableHead className="whitespace-nowrap">Disc</TableHead>
                  <TableHead className="whitespace-nowrap">Onkir</TableHead>
                  <TableHead className="whitespace-nowrap">Layanan</TableHead>
                  <TableHead className="whitespace-nowrap">Nama Toko</TableHead>
                  <TableHead className="whitespace-nowrap">
                    Nilai Aktual
                  </TableHead>
                  <TableHead className="whitespace-nowrap">
                    Amount Aktual (saved)
                  </TableHead>

                  <TableHead className="text-right whitespace-nowrap">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={12}
                      className="text-center text-muted-foreground py-6"
                    >
                      Memuat detail...
                    </TableCell>
                  </TableRow>
                ) : (
                  detailModals.map((modal: any) => {
                    const qty = parseFloat(modal.qty || 0);
                    const disc = parseFloat(modal.disc || 0);
                    const onkir = parseFloat(modal.onkir || 0);
                    const layanan = parseFloat(modal.layanan || 0);
                    const nilaiAktual = parseFloat(modal.nilaiAktual || 0);
                    const total = qty * nilaiAktual;

                    return (
                      <TableRow key={modal.id}>
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
                          {modal.qty}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {modal.satuan}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          Rp {formatCurrency(modal.disc || 0)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          Rp {formatCurrency(modal.onkir || 0)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          Rp {formatCurrency(modal.layanan || 0)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {modal.namaToko || "-"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          Rp {formatCurrency(modal.nilaiAktual || 0)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          Rp {formatCurrency(modal.amount || 0)}
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
                    );
                  })
                )}
              </TableBody>
              <TableFooter>
                <TableRow className="font-bold border-t-2 border-gray-900 bg-muted/50 text-base">
                  <TableCell colSpan={11} className="text-right pr-4 font-bold">
                    Total Amount Aktual:
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {formatCurrency(
                      detailModals.reduce((sum: number, modal: any) => {
                        return sum + parseFloat(modal.amount || "0");
                      }, 0),
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
          <div className="flex justify-end mt-4">
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
