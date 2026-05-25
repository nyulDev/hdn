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

interface ProfitData {
  id: string;
  noQuo: string;
  item: string;
  pn: string;
  aktual: number;
  estimasiPpn: number;
}

export default function ProfitPage() {
  const [penawarans, setPenawarans] = React.useState<any[]>([]);
  const [modals, setModals] = React.useState<any[]>([]);
  const [quoPpns, setQuoPpns] = React.useState<any[]>([]);
  const [modalCosts, setModalCosts] = React.useState<any[]>([]);
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
  const [reportQuoDiscount, setReportQuoDiscount] = React.useState<number>(0);

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
      setModals(data);
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

  // Fetch report-quo discount when filterNoQuo changes
  React.useEffect(() => {
    const fetchReportQuoDiscount = async () => {
      if (filterNoQuo === "all") {
        setReportQuoDiscount(0);
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
          setReportQuoDiscount(data?.discount || 0);
        } else {
          setReportQuoDiscount(0);
        }
      } catch (error) {
        console.error("Error fetching report-quo discount:", error);
        setReportQuoDiscount(0);
      }
    };

    fetchReportQuoDiscount();
  }, [filterNoQuo, penawarans]);

  // Calculate totals from quoPpns for Invoice card
  const invoiceData = React.useMemo(() => {
    if (filterNoQuo === "all") return { aktual: 0, estimasiPpn: 0 };

    // Get selected noQuo from penawaran
    const selectedPenawaran = penawarans.find((p) => p.id === filterNoQuo);
    if (!selectedPenawaran) return { aktual: 0, estimasiPpn: 0 };

    const targetNoQuo = selectedPenawaran.noQuo;

    // Get quoPpns for this noQuo
    const quoPpnsForNoQuo = quoPpns.filter((q) => q.noQuo === targetNoQuo);

    // Calculate aktual (sum of totalNew)
    const aktual = quoPpnsForNoQuo.reduce(
      (sum, item) => sum + (item.totalNew || 0),
      0,
    );

    // Calculate estimasiPpn as Total after discount (subTotal - discount from report-quo)
    const estimasiPpn = aktual - reportQuoDiscount;

    return { aktual, estimasiPpn };
  }, [filterNoQuo, penawarans, quoPpns, reportQuoDiscount]);

  // Helper function to calculate costs from modalCost
  const getCalculatedCosts = (modalCost: any) => {
    if (!modalCost) {
      return {
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
      };
    }

    const parseMult = (val: number | string | null | undefined) =>
      parseFloat(String(val || "0")) || 0;
    const calc = (mult: number, def: number) => mult * def;

    return {
      bankCharge: calc(
        parseMult(modalCost.bankCharge),
        defaultCosts.bankCharge,
      ),
      packingCost: calc(
        parseMult(modalCost.packingCost),
        defaultCosts.packingCost,
      ),
      deliveryDutyTax:
        (parseMult(modalCost.deliveryDutyTax) / 100) *
        parseMult(modalCost.totalModalSperpart),
      deliveryAirDHL: calc(
        parseMult(modalCost.deliveryAirDHL),
        defaultCosts.deliveryAirDHL,
      ),
      deliveryAirDoorToDoor: calc(
        parseMult(modalCost.deliveryAirDoorToDoor),
        defaultCosts.deliveryAirDoorToDoor,
      ),
      deliverySeaResmi: calc(
        parseMult(modalCost.deliverySeaResmi),
        defaultCosts.deliverySeaResmi,
      ),
      deliverySeaDoorToDoor: calc(
        parseMult(modalCost.deliverySeaDoorToDoor),
        defaultCosts.deliverySeaDoorToDoor,
      ),
      deliveryLocalCost: calc(
        parseMult(modalCost.deliveryLocalCost),
        defaultCosts.deliveryLocalCost,
      ),
      feeKurir: calc(parseMult(modalCost.feeKurir), defaultCosts.feeKurir),
      otherCostTruck: calc(
        parseMult(modalCost.otherCostTruck),
        defaultCosts.otherCostTruck,
      ),
      otherCostServiceBoat: calc(
        parseMult(modalCost.otherCostServiceBoat),
        defaultCosts.otherCostServiceBoat,
      ),
      otherCostLainLain: calc(
        parseMult(modalCost.otherCostLainLain),
        defaultCosts.otherCostLainLain,
      ),
    };
  };

  // Calculate Modal totals - using modalSubTotal (discount + totalModalSperpart + costs)
  const modalCardData = React.useMemo(() => {
    if (filterNoQuo === "all") return { aktual: 0, estimasiPpn: 0 };

    const selectedPenawaran = penawarans.find((p) => p.id === filterNoQuo);
    if (!selectedPenawaran) return { aktual: 0, estimasiPpn: 0 };

    const targetNoQuo = selectedPenawaran.noQuo;
    const modalCost = modalCosts.find((m) => m.noQuo === targetNoQuo);
    const modalsForNoQuo = modals.filter((m) => m.noQuo === targetNoQuo);

    // Sum of unitPrice from modals
    const unitPriceSum = modalsForNoQuo.reduce(
      (sum, item) => sum + (item.unitPrice || 0),
      0,
    );

    // Calculate modalSubTotal (original formula: discount + totalModal + all costs)
    let modalSubTotal = 0;
    if (modalCost) {
      const discountValue = parseFloat(modalCost.discount) || 0;
      const totalModal = parseFloat(modalCost.totalModalSperpart) || 0;
      const calculatedCosts = getCalculatedCosts(modalCost);

      modalSubTotal =
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
        calculatedCosts.otherCostLainLain;
    }

    // For Modal card display: use modalSubTotal for both
    return { aktual: modalSubTotal, estimasiPpn: modalSubTotal };
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
        aktual: matchingModal ? matchingModal.unitPrice : 0,
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
          aktual: modal.unitPrice || 0,
          estimasiPpn: 0,
        });
      }
    });

    return result;
  }, [filterNoQuo, penawarans, modals, quoPpns]);

  // Calculate GROSS PROFIT based on card values
  // GROSS PROFIT (Aktual) = nilai aktual card INVOICE - nilai aktual card Modal
  // GROSS PROFIT (Estimasi PPN) = nilai estimasi ppn card INVOICE - nilai estimasi ppn card Modal
  const grossProfitAktual = invoiceData.aktual - modalCardData.aktual;
  const grossProfitEstimasiPpn =
    invoiceData.estimasiPpn - modalCardData.estimasiPpn;

  // Calculate percentages
  const profitPercentageAktual =
    invoiceData.aktual > 0 ? (grossProfitAktual / invoiceData.aktual) * 100 : 0;
  const profitPercentageEstimasi =
    invoiceData.estimasiPpn > 0
      ? (grossProfitEstimasiPpn / invoiceData.estimasiPpn) * 100
      : 0;

  return (
    <AppShell>
      {/* Filter No. Quo */}
      <Card>
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
                      <TableHead>PN</TableHead>
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
                        <TableCell>{item.pn}</TableCell>
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
                        Modal
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
                        INVESTOR
                      </span>
                    </div>
                    <div className="mt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          HSI - 2 Bulan:
                        </span>
                        <span
                          className={`font-semibold ${
                            grossProfitAktual >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {(modalCardData.aktual * 0.08).toLocaleString(
                            "id-ID",
                          )}
                          <span className="ml-1 text-muted-foreground text-xs"></span>
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">BANSOS</span>
                        <span
                          className={`font-semibold ${
                            grossProfitEstimasiPpn >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {Math.round(
                            (invoiceData.aktual / 1.15) * 0.05,
                          ).toLocaleString("id-ID")}
                          <span className="ml-1 text-muted-foreground text-xs"></span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
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
                            grossProfitAktual >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {(grossProfitAktual * 0.9).toLocaleString("id-ID")}
                          <span className="ml-1 text-muted-foreground text-xs">
                            (
                            {(
                              ((grossProfitAktual * 0.9) /
                                modalCardData.aktual) *
                                100 || 0
                            ).toFixed(2)}
                            %)
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
                            (
                            {(
                              (grossProfitEstimasiPpn /
                                modalCardData.estimasiPpn) *
                                100 || 0
                            ).toFixed(2)}
                            %)
                          </span>
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 pl-12">
                        GROSS PROFIT Est PPN - BANSOS Est PPN - HSI - (GROSS
                        PROFIT Est PPN × 10%)
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

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        31-60 Days (10%)
                      </span>
                    </div>
                    <p className="mt-2 text-lg font-semibold">
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
