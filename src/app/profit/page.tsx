"use client";

import * as React from "react";
import { HandCoins, TrendingUp, DollarSign, Calculator } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { AppShell } from "@/components/app-shell";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface ProfitData {
  id: string;
  noQuo: string;
  item: string;
  pn: string;
  aktual: number;
  estimasiPpn: number;
}

interface ReportQuoData {
  id: string;
  noQuo: string;
  atsn: string;
  delivery: string;
  price: string;
  discount: number;
  bansosUsed?: boolean;
  createdAt: string;
}

export default function ProfitPage() {
  const [penawarans, setPenawarans] = React.useState<any[]>([]);
  const [modals, setModals] = React.useState<any[]>([]);
  const [quoPpns, setQuoPpns] = React.useState<any[]>([]);
  const [modalCosts, setModalCosts] = React.useState<any[]>([]);
  const [reportQuoData, setReportQuoData] =
    React.useState<ReportQuoData | null>(null);
  const [reportInvData, setReportInvData] = React.useState<any>(null);
  const [totalModalAktual, setTotalModalAktual] = React.useState(0);
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
  const [filterNoQuo, setFilterNoQuo] = React.useState("all");
  const [showBansos, setShowBansos] = React.useState(false);
  const [savingBansos, setSavingBansos] = React.useState(false);
  const [syncingBansos, setSyncingBansos] = React.useState(false);

  const fetchPenawarans = async () => {
    try {
      const response = await fetch("/api/penawaran");
      const data = await response.json();
      setPenawarans(data);
    } catch (error) {
      console.error("Error fetching penawarans:", error);
    }
  };

  const fetchModals = async () => {
    try {
      const response = await fetch("/api/modal");
      const data = await response.json();
      // Filter out isAktual=true to match report/modal/page.tsx (regular modals only)
      const regularModals = data.filter((m: any) => !m.isAktual);
      setModals(regularModals);
    } catch (error) {
      console.error("Error fetching modals:", error);
    }
  };

  const fetchQuoPpns = async () => {
    try {
      const response = await fetch("/api/quo-ppn");
      const data = await response.json();
      setQuoPpns(data);
    } catch (error) {
      console.error("Error fetching quo-ppns:", error);
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

  // Fetch report-quo data when filterNoQuo changes
  React.useEffect(() => {
    const fetchReportQuoData = async () => {
      if (filterNoQuo === "all") {
        setReportQuoData(null);
        setReportInvData(null);
        return;
      }

      const selectedPenawaran = penawarans.find((p) => p.id === filterNoQuo);
      if (!selectedPenawaran) return;

      try {
        const response = await fetch(
          `/api/report-quo?noQuo=${encodeURIComponent(selectedPenawaran.noQuo)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setReportQuoData(data);
        } else {
          setReportQuoData(null);
        }
      } catch (error) {
        console.error("Error fetching report-quo data:", error);
        setReportQuoData(null);
      }
    };

    fetchReportQuoData();
  }, [filterNoQuo, penawarans]);

  // Sync checkbox from saved reportQuo.bansosUsed
  React.useEffect(() => {
    if (filterNoQuo === "all") return;
    if (!reportQuoData) return;
    setShowBansos(!!(reportQuoData as any)?.bansosUsed);
  }, [filterNoQuo, reportQuoData]);

  // Fetch report-inv data (totalAfterDiscount) when filterNoQuo changes
  React.useEffect(() => {
    const fetchReportInvData = async () => {
      if (filterNoQuo === "all") {
        setReportInvData(null);
        setTotalModalAktual(0);
        return;
      }

      const selectedPenawaran = penawarans.find((p) => p.id === filterNoQuo);
      if (!selectedPenawaran) return;

      // Fetch totalModalAktual from report/modal-aktual
      const fetchModalAktualData = async () => {
        try {
          const response = await fetch(
            `/api/report/modal-aktual?noQuo=${encodeURIComponent(selectedPenawaran.noQuo)}`,
          );
          if (response.ok) {
            const data = await response.json();
            setTotalModalAktual(data.totalModalAktual || 0);
          } else {
            setTotalModalAktual(0);
          }
        } catch (error) {
          console.error("Error fetching modal-aktual data:", error);
          setTotalModalAktual(0);
        }
      };

      fetchModalAktualData();

      if (!selectedPenawaran?.noPenawaran) return;

      try {
        const response = await fetch(
          `/api/report-inv?noPenawaran=${encodeURIComponent(selectedPenawaran.noPenawaran)}`,
        );
        if (response.ok) {
          const data = await response.json();
          setReportInvData(data);
        } else {
          setReportInvData(null);
        }
      } catch (error) {
        console.error("Error fetching report-inv data:", error);
        setReportInvData(null);
      }
    };

    fetchReportInvData();
  }, [filterNoQuo, penawarans]);

  // Load default cost shipping on mount
  React.useEffect(() => {
    const loadDefaultCosts = async () => {
      try {
        const { getDefaultCostShipping } =
          await import("../cost-shipping/page");
        const costs = getDefaultCostShipping();
        setDefaultCosts(costs);
      } catch (error) {
        console.error("Error loading default costs:", error);
      }
    };
    loadDefaultCosts();
  }, []);

  // Fetch data on mount
  React.useEffect(() => {
    fetchPenawarans();
    fetchModals();
    fetchQuoPpns();
    fetchModalCosts();
  }, []);

  // Calculate totals for Invoice card using actual invoice data
  const invoiceData = React.useMemo(() => {
    if (filterNoQuo === "all") return { aktual: 0, estimasiPpn: 0 };

    // Get selected penawaran
    const selectedPenawaran = penawarans.find((p) => p.id === filterNoQuo);
    if (!selectedPenawaran) return { aktual: 0, estimasiPpn: 0 };

    // Get quoPpns for Estimasi PPN
    const quoPpnsForNoQuo = quoPpns.filter(
      (q) => q.noQuo === selectedPenawaran.noQuo,
    );
    const subTotal = quoPpnsForNoQuo.reduce(
      (sum, item) => sum + (item.totalNew || 0),
      0,
    );

    // AKTUAL: Use TOTAL QUOTATION MUST BE PAID (IDR) from QUO calculation.
    // Formula used in dashboard/report: (subTotal - discount) * 1.11
    const quoDiscount = reportQuoData?.discount || 0;
    const aktual = (subTotal - quoDiscount) * 1.11;

    // Estimasi PPN tetap memakai (subTotal - discount)
    const estimasiPpn = subTotal - quoDiscount;

    return { aktual, estimasiPpn };
  }, [filterNoQuo, penawarans, quoPpns, reportQuoData, reportInvData]);

  // Modal card: Aktual from TOTAL MODAL AKTUAL (report/modal-aktual)
  const modalCardData = React.useMemo(() => {
    if (filterNoQuo === "all") return { aktual: 0, estimasiPpn: 0 };

    return {
      aktual: totalModalAktual,
      estimasiPpn: totalModalAktual,
    };
  }, [filterNoQuo, totalModalAktual]);

  // Calculate HSI - 2 Bulan EXACTLY matching report/modal/page.tsx formula
  const hsiValue = React.useMemo(() => {
    if (filterNoQuo === "all") return 0;

    const selectedPenawaran = penawarans.find((p) => p.id === filterNoQuo);
    if (!selectedPenawaran) return 0;

    const targetNoQuo = selectedPenawaran.noQuo;
    const modalsForNoQuo = modals.filter((m) => m.noQuo === targetNoQuo);
    const currentModalCost = modalCosts.find((m) => m.noQuo === targetNoQuo);
    if (!currentModalCost) return 0;

    const parse = (val: any) => parseFloat(String(val || "0")) || 0;

    // Sub Total Amount = sum(modal.amount)
    const subTotal = modalsForNoQuo.reduce(
      (sum, item) => sum + (item.amount || 0),
      0,
    );

    // Individual costs from modalCost
    const totalDiscount = parse(currentModalCost.discount);
    const totalBankCharge = parse(currentModalCost.bankCharge);
    const totalPackingCost = parse(currentModalCost.packingCost);

    // Total Delivery: dutyTax % of subTotal + all fixed delivery costs
    const deliveryDutyTaxPercent = parse(
      currentModalCost.deliveryDutyTaxPercent,
    );
    const totalDeliveryDutyTax = (deliveryDutyTaxPercent / 100) * subTotal;
    const totalDeliveryAirDHL = parse(currentModalCost.deliveryAirDHL);
    const totalDeliveryAirDoorToDoor = parse(
      currentModalCost.deliveryAirDoorToDoor,
    );
    const totalDeliverySeaResmi = parse(currentModalCost.deliverySeaResmi);
    const totalDeliverySeaDoorToDoor = parse(
      currentModalCost.deliverySeaDoorToDoor,
    );
    const totalDeliveryLocalCost = parse(currentModalCost.deliveryLocalCost);
    const totalDelivery =
      totalDeliveryDutyTax +
      totalDeliveryAirDHL +
      totalDeliveryAirDoorToDoor +
      totalDeliverySeaResmi +
      totalDeliverySeaDoorToDoor +
      totalDeliveryLocalCost;

    // Total Other Cost
    const totalFeeKurir = parse(currentModalCost.feeKurir);
    const totalOtherCostTruck = parse(currentModalCost.otherCostTruck);
    const totalOtherCostServiceBoat = parse(
      currentModalCost.otherCostServiceBoat,
    );
    const totalOtherCostLainLain = parse(currentModalCost.otherCostLainLain);
    const totalOtherCost =
      totalFeeKurir +
      totalOtherCostTruck +
      totalOtherCostServiceBoat +
      totalOtherCostLainLain;

    // EXACT formula: (Sub Total Amount + Discount + Bank Charge + Packing Cost + Total Delivery + Total Other Cost) x 8%
    return (
      (subTotal +
        totalDiscount +
        totalBankCharge +
        totalPackingCost +
        totalDelivery +
        totalOtherCost) *
      0.08
    );
  }, [filterNoQuo, penawarans, modals, modalCosts]);

  // Merge modal and quo-ppn data to create profit data (for table)
  const profitData: ProfitData[] = React.useMemo(() => {
    if (filterNoQuo === "all") return [];

    // Get selected noQuo from penawaran
    const selectedPenawaran = penawarans.find((p) => p.id === filterNoQuo);
    if (!selectedPenawaran) return [];

    const targetNoQuo = selectedPenawaran.noQuo;

    // Get modals and quoPpns for this noQuo
    const modalsForNoQuo = modals.filter((m) => m.noQuo === targetNoQuo);
    const quoPpnsForNoQuo = quoPpns.filter((q) => q.noQuo === targetNoQuo);

    // Create profit data by merging
    const result: ProfitData[] = [];

    // Process quoPpns and match with modals
    quoPpnsForNoQuo.forEach((quoPpn) => {
      // Find matching modal by description
      const matchingModal = modalsForNoQuo.find(
        (m) => m.description === quoPpn.description,
      );

      result.push({
        id: quoPpn.id,
        noQuo: quoPpn.noQuo,
        item: quoPpn.description || "-",
        pn: quoPpn.pn || "-",
        aktual: matchingModal
          ? matchingModal.nilaiAktual || matchingModal.unitPrice
          : 0,
        estimasiPpn: quoPpn.unitPriceNew || 0,
      });
    });

    // Add modals that don't have matching quoPpns
    modalsForNoQuo.forEach((modal) => {
      const hasQuoPpn = quoPpnsForNoQuo.some(
        (q) => q.description === modal.description,
      );
      if (!hasQuoPpn) {
        result.push({
          id: modal.id,
          noQuo: modal.noQuo,
          item: modal.description || "-",
          pn: modal.pn || "-",
          aktual: modal.nilaiAktual || modal.unitPrice || 0,
          estimasiPpn: 0,
        });
      }
    });

    return result;
  }, [filterNoQuo, penawarans, modals, quoPpns]);

  // Calculate GROSS PROFIT based on card values
  // GROSS PROFIT (Aktual) = INVOICE Aktual (report-inv totalAfterDiscount) - Modal (tanpa HSI) Aktual (report/modal-aktual)
  // GROSS PROFIT (Estimasi PPN) = INVOICE Estimasi PPN (quo subtotal-discount) - Modal (tanpa HSI) Estimasi PPN
  const grossProfitAktual = invoiceData.aktual - modalCardData.aktual;
  const grossProfitEstimasiPpn =
    invoiceData.estimasiPpn - modalCardData.estimasiPpn;

  // BANSOS 5%
  const bansos5Percent = Math.round((invoiceData.aktual / 1.15) * 0.05);
  const bansosEstPpn5Percent = showBansos
    ? Math.round(invoiceData.estimasiPpn * 0.05)
    : 0;

  // NET PROFIT = GROSS PROFIT Estimasi PPN - INVESTOR BANSOS - INVESTOR HSI - (GROSS PROFIT Estimasi PPN x 10%)
  const netProfitAktual =
    grossProfitAktual * 0.9 - (showBansos ? bansos5Percent : 0) - hsiValue;
  // NET PROFIT = GROSS PROFIT Estimasi PPN - BANSOS Est PPN - HSI - (GROSS PROFIT Estimasi PPN x 10%)
  const netProfitEstimasiPpn =
    grossProfitEstimasiPpn -
    bansosEstPpn5Percent -
    hsiValue -
    grossProfitEstimasiPpn * 0.1;

  // Calculate percentages (Gross Profit / Modal) × 100
  const profitPercentageAktual =
    modalCardData.aktual > 0
      ? (grossProfitAktual / modalCardData.aktual) * 100
      : 0;
  // Calculate percentages (Gross Profit / Modal) × 100
  const profitPercentageEstimasi =
    modalCardData.estimasiPpn > 0
      ? (grossProfitEstimasiPpn / modalCardData.estimasiPpn) * 100
      : 0;

  // NET PROFIT percentages
  const netProfitPercentageAktual =
    modalCardData.aktual > 0
      ? (netProfitAktual / modalCardData.aktual) * 100
      : 0;
  const netProfitPercentageEstimasi =
    modalCardData.estimasiPpn > 0
      ? (netProfitEstimasiPpn / modalCardData.estimasiPpn) * 100
      : 0;

  // NET PROFIT Aktual = (INVOICE - MODAL) - BANSOS - HSI - 61-90 days
  const netProfitAktualNew = netProfitAktual - grossProfitAktual * 0.03;
  const netProfitPercentageAktualNew =
    modalCardData.aktual > 0
      ? (netProfitAktualNew / modalCardData.aktual) * 100
      : 0;

  return (
    <AppShell>
      {/* Filter No. Quo */}
      <Card className="mt-2 md:mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Profit</CardTitle>
              <CardDescription>
                Laporan perhitungan profit dari Modal dan QUO PPN
              </CardDescription>
            </div>
          </div>
          {/* Filter No. Quo */}
          <div className="mt-4 flex items-center gap-4">
            <Label htmlFor="filterNoQuo" className="text-sm font-normal">
              Filter No. Quo:
            </Label>
            <Select value={filterNoQuo} onValueChange={setFilterNoQuo}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Semua No. Quo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua No. Quo</SelectItem>
                {penawarans.map((penawaran) => (
                  <SelectItem key={penawaran.id} value={penawaran.id}>
                    {penawaran.noQuo} - {penawaran.pt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={syncingBansos || filterNoQuo === "all"}
                onClick={async () => {
                  try {
                    if (filterNoQuo === "all") return;
                    setSyncingBansos(true);
                    // Sync bansos dari ReportQuo -> Penjualan
                    // (biar halaman /penjualan langsung mengikuti checkbox)
                    const res = await fetch(
                      "/api/penjualan-sync-bansos-from-profit",
                      { method: "POST" },
                    );
                    const payload = await res.json();
                    console.log("sync bansos payload", payload);
                    if (!res.ok) {
                      throw new Error(payload?.error || "sync failed");
                    }
                    // After sync, reload page data for current filter to reflect updated DB
                    // Penjualan page fetches on its own; Profit page just updates checkbox state.
                  } catch (e) {
                    console.error("sync bansos failed", e);
                  } finally {
                    setSyncingBansos(false);
                  }
                }}
              >
                {syncingBansos ? "Sync..." : "Sync Bansos"}
              </Button>
              <Checkbox
                id="show-bansos"
                checked={showBansos}
                onCheckedChange={(checked) => {
                  const next = !!checked;
                  setShowBansos(next);
                  // Fire-and-forget: save to DB for selected No. Quo
                  (async () => {
                    if (filterNoQuo === "all") return;
                    if (!penawarans?.length) return;
                    const selectedPenawaran = penawarans.find(
                      (p) => p.id === filterNoQuo,
                    );
                    if (!selectedPenawaran?.noQuo) return;

                    try {
                      setSavingBansos(true);
                      const res = await fetch("/api/report-quo-bansos", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          noQuo: selectedPenawaran.noQuo,
                          useBansos: next,
                        }),
                      });
                      const payload = await res.json();
                      console.log("save bansosUsed response", {
                        noQuo: selectedPenawaran.noQuo,
                        useBansos: next,
                        ok: res.ok,
                        payload,
                      });
                      if (!res.ok) {
                        throw new Error(payload?.error || "save failed");
                      }
                    } catch (e) {
                      console.error("Failed saving bansosUsed", e);
                    } finally {
                      setSavingBansos(false);
                    }
                  })();
                }}
              />
              <Label
                htmlFor="show-bansos"
                className="text-sm font-normal cursor-pointer"
              >
                Bansos
              </Label>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Profit Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Detail Profit</CardTitle>
          <CardDescription>Detail perhitungan profit per item</CardDescription>
        </CardHeader>
        <CardContent>
          {filterNoQuo === "all" ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Pilih No. Quo</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Silakan pilih No. Quo untuk melihat data profit.
              </p>
            </div>
          ) : profitData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Belum ada data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Tidak ada data untuk No. Quo yang dipilih.
              </p>
            </div>
          ) : (
            <>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      {/* <TableHead>PN</TableHead> */}
                      <TableHead className="text-right">Aktual</TableHead>
                      <TableHead className="text-right">Estimasi PPN</TableHead>
                      <TableHead className="text-right">Profit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {profitData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.item}
                        </TableCell>
                        {/* <TableCell>{item.pn}</TableCell> */}
                        <TableCell className="text-right">
                          {item.aktual > 0
                            ? item.aktual.toLocaleString("id-ID")
                            : "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.estimasiPpn > 0
                            ? item.estimasiPpn.toLocaleString("id-ID")
                            : "-"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            item.estimasiPpn - item.aktual >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.estimasiPpn > 0 || item.aktual > 0
                            ? (item.estimasiPpn - item.aktual).toLocaleString(
                                "id-ID",
                              )
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary Cards - Row 1 */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        INVOICE
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Aktual:</span>
                        <span className="font-semibold">
                          {invoiceData.aktual.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimasi PPN:
                        </span>
                        <span className="font-semibold">
                          {invoiceData.estimasiPpn.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Modal (tanpa HSI)
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Aktual:</span>
                        <span className="font-semibold">
                          {modalCardData.aktual.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimasi PPN:
                        </span>
                        <span className="font-semibold">
                          {modalCardData.estimasiPpn.toLocaleString("id-ID")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        GROSS PROFIT
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Aktual:</span>
                        <span
                          className={`font-semibold ${
                            grossProfitAktual >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {grossProfitAktual.toLocaleString("id-ID")}
                          <span className="ml-1 text-muted-foreground text-xs">
                            ({profitPercentageAktual.toFixed(2)}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimasi PPN:
                        </span>
                        <span
                          className={`font-semibold ${
                            grossProfitEstimasiPpn >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {grossProfitEstimasiPpn.toLocaleString("id-ID")}
                          <span className="ml-1 text-muted-foreground text-xs">
                            ({profitPercentageEstimasi.toFixed(2)}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        PROFIT SHARING
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      {showBansos && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              BANSOS Aktual 5%
                            </span>
                            <span
                              className={`font-semibold ${
                                grossProfitEstimasiPpn >= 0
                                  ? "text-red-600"
                                  : "text-red-600"
                              }`}
                            >
                              {Math.round(
                                (invoiceData.aktual / 1.15) * 0.05,
                              ).toLocaleString("id-ID")}
                              <span className="ml-1 text-muted-foreground text-xs"></span>
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              BANSOS Est PPN
                            </span>
                            <span className="font-semibold text-red-600">
                              {Math.round(
                                invoiceData.estimasiPpn * 0.05,
                              ).toLocaleString("id-ID")}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          HSI - 2 Bulan:
                        </span>
                        <span
                          className={`font-semibold ${
                            hsiValue >= 0 ? "text-blue-600" : "text-red-600"
                          }`}
                        >
                          {hsiValue.toLocaleString("id-ID")}
                          <span className="ml-1 text-muted-foreground text-xs"></span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* NET PROFIT Card */}
                <Card>
                  <CardContent className="pt-2">
                    <div className="flex items-center gap-2">
                      <HandCoins className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        NET PROFIT
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Aktual:</span>
                        <span
                          className={`font-semibold ${
                            netProfitAktual >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {netProfitAktual.toLocaleString("id-ID")}
                          <span className="ml-1 text-muted-foreground text-xs">
                            ({netProfitPercentageAktual.toFixed(2)}%)
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Estimasi PPN:
                        </span>
                        <span
                          className={`font-semibold ${
                            netProfitEstimasiPpn >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {netProfitEstimasiPpn.toLocaleString("id-ID")}
                          <span className="ml-1 text-muted-foreground text-xs">
                            ({netProfitPercentageEstimasi.toFixed(2)}%)
                          </span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Cards - Row 2 (Marketing Fee) */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Cash (30%)
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-semibold">
                      {(grossProfitAktual * 0.3).toLocaleString("id-ID")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        0-30 Days (20%)
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-semibold">
                      {(grossProfitAktual * 0.2).toLocaleString("id-ID")}
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-lime-500">
                  <CardHeader>
                    <CardTitle className="text-white">
                      Sharing Marketing Fee
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-white" />
                      <span className="text-sm text-white">
                        31-60 Days (10%)
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {(grossProfitAktual * 0.1).toLocaleString("id-ID")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        61-90 Days (3%)
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-semibold">
                      {(grossProfitAktual * 0.03).toLocaleString("id-ID")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {">"} 90 Days (0%)
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-semibold">0</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
