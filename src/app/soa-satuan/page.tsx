"use client";

import * as React from "react";
import {
  Search,
  CalendarIcon,
  DollarSign,
  Clock,
  Check,
  Download,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InvoiceData {
  no: number;
  tanggal: string;
  customer: string;
  pt: string;
  noPenawaran: string;
  noInvoice: string;
  totalInvoice: number;
  paymentStatus?: "Lunas" | "Belum Lunas";
  lunasDate?: string;
}

interface AgingData {
  no: number;
  invDate: string;
  pt: string;
  daysSinceInv: number;
  invoiceNo: string;
  poNo: string;
  namaKapal: string;
  termsDays: number;
  dueDate: string;
  amount: number;
  bucket0_30: number;
  bucket31_60: number;
  bucket61Plus: number;
  paymentDate: string | null;
  agingStatus: "Current" | "0-30" | "31-60" | "61+";
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number): string {
  return value.toLocaleString("id-ID");
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID");
}

function calculateAging(
  invoiceDate: string,
  dueDays: number,
  today: Date = new Date(),
): AgingData["agingStatus"] {
  const invDate = new Date(invoiceDate);
  const dueDate = new Date(invDate);
  dueDate.setDate(dueDate.getDate() + dueDays);

  const daysOverdue = Math.floor(
    (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysOverdue <= 0) return "Current";
  if (daysOverdue <= 30) return "0-30";
  if (daysOverdue <= 60) return "31-60";
  return "61+";
}

export default function SoaSatuanPage() {
  const [data, setData] = React.useState<AgingData[]>([]);

  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedPt, setSelectedPt] = React.useState("");
  const [selectedLunasDate, setSelectedLunasDate] = React.useState<
    Date | undefined
  >();
  const [currentInvoiceNo, setCurrentInvoiceNo] = React.useState("");
  const [pdfInvoiceNo, setPdfInvoiceNo] = React.useState<string | null>(null);
  const pdfRef = React.useRef<HTMLDivElement | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = React.useState(false);

  const { toast } = useToast();

  React.useEffect(() => {
    fetchSoaData();
  }, []);

  const markLunas = async (invoiceNo: string, lunasDate?: string) => {
    if (!lunasDate) return;

    try {
      const response = await fetch(
        `/api/soa-satuan/lunas/${encodeURIComponent(invoiceNo)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lunasDate }),
        },
      );

      if (response.ok) {
        await fetchSoaData();
        toast({
          title: "Berhasil",
          description: "Status pembayaran diupdate menjadi lunas.",
        });
      } else {
        const errorText = await response.text();
        toast({
          title: "Error",
          description: `Gagal update: ${errorText}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal update status pembayaran.",
        variant: "destructive",
      });
    }
  };

  // ========== PDF Laporan (Full Tabel dengan semua kolom) ==========
  const generatePdfReport = (rows: AgingData[], customerPt: string) => {
    if (!rows.length) {
      toast({
        title: "Error",
        description: "Tidak ada data untuk dicetak.",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date();
    const todayId = today.toLocaleDateString("id-ID");

    // Header perusahaan
    doc.setFontSize(20);
    doc.setTextColor(22, 163, 74);
    doc.text("S", 20, 20);
    doc.setTextColor(30, 58, 138);
    doc.text("OA ", 27, 20);
    doc.setTextColor(22, 163, 74);
    doc.text("S", 45, 20);
    doc.setTextColor(30, 58, 138);
    doc.text("atuan", 52, 20);

    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text("Statement of Account", 20, 28);
    doc.setFontSize(8);
    doc.text("NPWP : 073.121.453.2 - 012.000", 20, 34);

    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date     : ${todayId}`, 20, 45);
    doc.text(`Customer : ${customerPt || "-"}`, 20, 51);

    doc.setFontSize(12);
    doc.setTextColor(220, 38, 38);
    doc.text("STATEMENT OF ACCOUNT", pageWidth / 2, 65, { align: "center" });

    // Kolom tabel lengkap
    const tableHeaders = [
      "No",
      "INV Date",
      "Invoice No",
      "PO No",
      "Nama Kapal",
      "Terms\n(Days)",
      "Due Date",
      "Amount (IDR)",
      "0-30 Days",
      "31-60 Days",
      "61+ Days",
      "Payment Date",
    ];

    const totalAmount = rows.reduce((sum, r) => sum + (r.amount || 0), 0);

    const tableRows = rows.map((item, idx) => {
      return [
        idx + 1,
        item.invDate,
        item.invoiceNo,
        item.poNo,
        item.namaKapal,
        item.termsDays,
        item.dueDate,
        formatCurrency(item.amount).replace("Rp", "").trim(),
        item.bucket0_30,
        item.bucket31_60,
        item.bucket61Plus,
        item.paymentDate || "-",
      ];
    });

    // Baris total
    tableRows.push([
      "",
      "",
      "",
      "",
      "",
      "",
      "TOTAL",
      formatCurrency(totalAmount).replace("Rp", "").trim(),
      "",
      "",
      "",
      "",
    ]);

    autoTable(doc, {
      startY: 72,
      head: [tableHeaders],
      body: tableRows,
      theme: "striped",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        halign: "center",
      },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        1: { halign: "center", cellWidth: 16 },
        2: { halign: "left", cellWidth: 28 },
        3: { halign: "left", cellWidth: 22 },
        4: { halign: "left", cellWidth: 40 },
        5: { halign: "center", cellWidth: 12 },
        6: { halign: "center", cellWidth: 16 },
        7: { halign: "right", cellWidth: 28 },
        8: { halign: "center", cellWidth: 12 },
        9: { halign: "center", cellWidth: 12 },
        10: { halign: "center", cellWidth: 12 },
        11: { halign: "center", cellWidth: 18 },
      },
      didDrawCell: (dataCell) => {
        if (
          dataCell.section === "body" &&
          dataCell.row.index === tableRows.length - 1
        ) {
          doc.setFont("helvetica", "bold");
          doc.setTextColor(0, 0, 0);
        } else {
          // Reset font untuk baris lain
          doc.setFont("helvetica", "normal");
        }
      },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 250;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Dicetak: ${todayId} - Haluan Daya Niaga`,
      pageWidth / 2,
      finalY + 10,
      { align: "center" },
    );

    const safePt = (customerPt || "REPORT").replace(/\s+/g, "_");
    const safeDate = todayId.replace(/\//g, "-");
    doc.save(`SOA_${safePt}_${safeDate}.pdf`);
  };

  // ========== Download PDF Satu Invoice (tidak berubah) ==========
  const handleDownloadPdf = async (invoiceNo: string) => {
    try {
      if (!invoiceNo) {
        toast({
          title: "Error",
          description: "Invoice No tidak valid.",
          variant: "destructive",
        });
        return;
      }

      const target = data.find((d) => d.invoiceNo === invoiceNo);
      if (!target) {
        toast({
          title: "Error",
          description: "Data invoice tidak ditemukan untuk PDF.",
          variant: "destructive",
        });
        return;
      }

      if (!pdfRef.current) {
        toast({
          title: "Error",
          description: "PDF element tidak tersedia.",
          variant: "destructive",
        });
        return;
      }

      setPdfInvoiceNo(invoiceNo);
      await new Promise((r) => setTimeout(r, 250));

      if (pdfRef.current) {
        pdfRef.current.style.opacity = "1";
        pdfRef.current.style.pointerEvents = "auto";
        pdfRef.current.style.position = "relative";
        pdfRef.current.style.top = "0";
        pdfRef.current.style.left = "0";
      }

      setIsDownloadingPdf(true);
      const canvas = await html2canvas(pdfRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasW = canvas.width || 1;
      const canvasH = canvas.height || 1;
      const pdfHeight = (canvasH * pdfWidth) / canvasW;

      if (!Number.isFinite(pdfHeight) || pdfHeight <= 0) {
        pdf.save(`SOA-${invoiceNo || "report"}.pdf`);
        return;
      }

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`SOA-${invoiceNo || "report"}.pdf`);
    } catch (e) {
      console.error("Error generating SOA pdf:", e);
      toast({
        title: "Error",
        description: "Gagal mengunduh PDF.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const fetchSoaData = async () => {
    try {
      const response = await fetch("/api/penjualan");
      const rawData = await response.json();

      const today = new Date();
      const processedData: AgingData[] = rawData.map((item, index) => {
        const termsDays = 30;
        const inv = new Date(item.tanggal);
        const dueDate = new Date(inv);
        dueDate.setDate(dueDate.getDate() + termsDays);

        const amount = item.totalInvoice || 0;

        // Samakan dengan logika yang dipakai UI (menggunakan daysSinceInv untuk bucket)
        // daysSinceInv di sini adalah selisih dari INV date ke hari ini.
        const daysSinceInv = Math.floor(
          (today.getTime() - inv.getTime()) / (1000 * 60 * 60 * 24),
        );
        const clampedDaysSinceInv = Math.max(0, daysSinceInv);

        const bucket0_30 = clampedDaysSinceInv <= 30 ? clampedDaysSinceInv : 0;
        const bucket31_60 =
          clampedDaysSinceInv > 30 && clampedDaysSinceInv <= 60
            ? clampedDaysSinceInv
            : 0;
        const bucket61Plus = clampedDaysSinceInv > 60 ? clampedDaysSinceInv : 0;

        const agingStatus = calculateAging(item.tanggal, termsDays, today);

        return {
          no: index + 1,
          pt: item.pt || "",
          invDate: formatDate(item.tanggal),
          daysSinceInv,
          invoiceNo: item.noInvoice || "",
          poNo: item.noPenawaran || "",
          namaKapal: `${item.customer || ""} MV`,
          termsDays,
          dueDate: dueDate.toLocaleDateString("id-ID"),
          amount,
          bucket0_30,
          bucket31_60,
          bucket61Plus,
          paymentDate: item.lunasDate ? formatDate(item.lunasDate) : null,
          agingStatus,
        };
      });

      setData(processedData);
    } catch (error) {
      console.error("Error fetching SOA data:", error);
    } finally {
      setLoading(false);
    }
  };

  const uniquePts = useMemo(() => {
    return Array.from(new Set(data.map((item) => item.pt))).sort();
  }, [data]);

  const filteredData = data.filter(
    (item) =>
      (!selectedPt ||
        item.pt.toLowerCase().includes(selectedPt.toLowerCase())) &&
      (item.namaKapal.toLowerCase().includes(search.toLowerCase()) ||
        item.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
        item.namaKapal.toLowerCase().includes(search.toLowerCase())),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <DollarSign className="h-8 w-8 animate-spin" />
          <p>Loading SOA Satuan data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full px-2 sm:px-4 lg:px-6">
      <div className="space-y-6">
        {/* Elemen untuk PDF satu invoice (hidden) */}
        <div
          ref={pdfRef}
          className="absolute opacity-0 pointer-events-none"
          aria-hidden
        >
          {pdfInvoiceNo
            ? (() => {
                const inv = data.find((d) => d.invoiceNo === pdfInvoiceNo);
                if (!inv) return null;

                return (
                  <div
                    className="max-w-4xl mx-auto border border-[#e5e7eb] p-6 md:p-8 bg-white shadow-lg"
                    style={{ color: "#000000" }}
                  >
                    <div className="border-b pb-4 mb-4 relative">
                      <img
                        src="/logotok.png"
                        alt="Logo"
                        className="absolute top-0 right-0 w-20 h-20"
                      />
                      <h1 className="text-3xl font-bold">
                        <span style={{ color: "#16a34a" }}>S</span>
                        <span style={{ color: "#1e3a8a" }}>OA </span>
                        <span style={{ color: "#16a34a" }}>S</span>
                        <span style={{ color: "#1e3a8a" }}>atuan</span>
                      </h1>
                      <p
                        className="text-sm font-medium mt-1"
                        style={{ color: "#4b5563" }}
                      >
                        Statement of Account
                      </p>
                      <p
                        className="text-xs font-mono mt-1"
                        style={{ color: "#6b7280" }}
                      >
                        NPWP : 073.121.453.2-012.000
                      </p>
                    </div>

                    <div className="flex justify-between mb-4 text-sm">
                      <div className="text-xs space-y-1">
                        <div className="flex gap-2">
                          <span className="font-bold w-28">Date</span>
                          <span>{new Date().toLocaleDateString("id-ID")}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold w-28">Invoice No</span>
                          <span>: {inv.invoiceNo}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold w-28">PO No</span>
                          <span>: {inv.poNo}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-bold w-28">Kapal</span>
                          <span>: {inv.namaKapal}</span>
                        </div>
                      </div>
                      <div className="text-right text-xs space-y-1">
                        <div className="flex gap-2 justify-end">
                          <span className="font-bold">INV Date</span>
                          <span>: {inv.invDate}</span>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <span className="font-bold">Due Date</span>
                          <span>: {inv.dueDate}</span>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <span className="font-bold">Payment</span>
                          <span>
                            :{" "}
                            {inv.paymentDate ? inv.paymentDate : "Belum Lunas"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-center mb-4">
                      <h2
                        className="text-2xl font-bold border-b-2 pb-2 px-6 inline-block tracking-widest"
                        style={{
                          color: "#dc2626",
                          borderBottomColor: "#000000",
                        }}
                      >
                        SOA SATUAN
                      </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                      <div>
                        <div className="font-semibold">Amount</div>
                        <div>{formatCurrency(inv.amount)}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Aging Status</div>
                        <div>{inv.agingStatus}</div>
                      </div>
                    </div>
                  </div>
                );
              })()
            : null}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight mt-8">
              SOA Satuan
            </h1>
            <p className="text-muted-foreground">
              Statement of Account dengan analisis aging 0-30, 31-60, 61+ days.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">← Dashboard</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={fetchSoaData}>
              <Clock className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex flex-row items-center gap-2">
              <CardTitle className="text-lg">Aging Report</CardTitle>
              <Select value={selectedPt} onValueChange={setSelectedPt}>
                <SelectTrigger className="w-[250px] h-9">
                  <SelectValue placeholder="Filter PT" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua PT</SelectItem>
                  {uniquePts.map((pt) => (
                    <SelectItem key={pt} value={pt}>
                      {pt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              Total {filteredData.length} invoices |{" "}
              {filteredData
                .reduce((sum, item) => sum + item.amount, 0)
                .toLocaleString("id-ID")}{" "}
              IDR
            </CardDescription>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari invoice, kapal, atau customer..."
                  className="pl-10 w-[300px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (!filteredData.length) {
                    toast({
                      title: "Error",
                      description: "Tidak ada data untuk diunduh.",
                      variant: "destructive",
                    });
                    return;
                  }
                  const customerPt =
                    selectedPt && selectedPt !== "all"
                      ? selectedPt
                      : "Semua_PT";
                  generatePdfReport(filteredData, customerPt);
                }}
                disabled={isDownloadingPdf || !filteredData.length}
              >
                <Download className="mr-2 h-4 w-4" />
                {isDownloadingPdf
                  ? "Generating..."
                  : "Download PDF Laporan (Filter PT)"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>INV Date</TableHead>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>PO NO</TableHead>
                    <TableHead>Nama Kapal</TableHead>
                    <TableHead>Terms (Days)</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right font-mono">
                      0-30 Days
                    </TableHead>
                    <TableHead className="text-right">31-60 Days</TableHead>
                    <TableHead className="text-right">61+ Days</TableHead>
                    <TableHead>Payment Date</TableHead>
                    <TableHead className="w-[170px] text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => (
                    <TableRow key={item.invoiceNo}>
                      <TableCell>{item.no}</TableCell>
                      <TableCell>{item.invDate}</TableCell>
                      <TableCell className="font-medium">
                        {item.invoiceNo}
                      </TableCell>
                      <TableCell>{item.poNo}</TableCell>
                      <TableCell>{item.namaKapal}</TableCell>
                      <TableCell className="font-mono">
                        {item.termsDays}
                      </TableCell>
                      <TableCell>{item.dueDate}</TableCell>
                      <TableCell className="text-right font-mono font-semibold">
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {item.daysSinceInv <= 30 ? item.daysSinceInv : 0}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {formatNumber(item.bucket31_60)}
                      </TableCell>
                      <TableCell className="text-center font-mono">
                        {formatNumber(item.bucket61Plus)}
                      </TableCell>
                      <TableCell>
                        {item.paymentDate ? (
                          <Badge
                            variant="default"
                            className="bg-green-100 text-green-800 border-green-200"
                          >
                            Lunas {item.paymentDate}
                          </Badge>
                        ) : (
                          <>
                            <Badge variant="destructive">Belum Lunas</Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 ml-1"
                                  onClick={() =>
                                    setCurrentInvoiceNo(item.invoiceNo)
                                  }
                                >
                                  <Check className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Konfirmasi Lunas</DialogTitle>
                                  <DialogDescription>
                                    Tandai invoice {item.invoiceNo} sebagai
                                    lunas?
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <div className="grid grid-cols-4 items-center gap-4">
                                    <label className="text-right">
                                      Tanggal Lunas
                                    </label>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className={cn(
                                            "w-[280px] justify-start text-left font-normal col-span-3",
                                            !selectedLunasDate &&
                                              "text-muted-foreground",
                                          )}
                                        >
                                          <CalendarIcon className="mr-2 h-4 w-4" />
                                          {selectedLunasDate ? (
                                            format(selectedLunasDate, "PPP", {
                                              locale: id,
                                            })
                                          ) : (
                                            <span>Pilih tanggal</span>
                                          )}
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent
                                        className="w-auto p-0"
                                        align="start"
                                      >
                                        <Calendar
                                          mode="single"
                                          selected={selectedLunasDate}
                                          onSelect={(date) =>
                                            setSelectedLunasDate(date)
                                          }
                                          initialFocus
                                        />
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={() => {
                                      if (
                                        selectedLunasDate &&
                                        currentInvoiceNo
                                      ) {
                                        markLunas(
                                          currentInvoiceNo,
                                          selectedLunasDate
                                            .toISOString()
                                            .split("T")[0],
                                        );
                                      }
                                      setSelectedLunasDate(undefined);
                                      setCurrentInvoiceNo("");
                                    }}
                                  >
                                    Tandai Lunas
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-muted-foreground">
                          {item.paymentDate ? "Lunas" : ""}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="h-24 text-center">
                        Tidak ada data SOA ditemukan.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
