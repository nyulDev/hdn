"use client";

import * as React from "react";
import { Search, DollarSign, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

type PenjualanItem = {
  no: number;
  tanggal: string;
  customer: string;
  noInvoice: string;
  totalAfterDiscount: number;
  ppn: number;
  totalSparepart: number;
  pengajuanModal: number;
  pembelianAktual: number;
  bansosValue?: number;
  paymentStatus?: string;
  lunasDate?: string | null;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("id-ID");
}

export default function PenjualanPage() {
  const [data, setData] = React.useState<PenjualanItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setLoading(true);

      // Pastikan bansos sudah tersync ke tabel penjualan sebelum fetch data
      // Mode all: update bansos untuk semua record
      await fetch("/api/penjualan-sync-bansos-from-profit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noQuo: "0002-PH" }),
      }).catch(() => null);

      const params = search ? new URLSearchParams({ search }) : "";
      const url = `/api/penjualan${params ? `?${params}` : ""}`;
      const response = await fetch(url);

      if (!response.ok) throw new Error("Fetch failed");
      const json = await response.json();
      setData(Array.isArray(json) ? json : []);
      toast({
        title: "Refresh",
        description: `${json.length || 0} records loaded`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchData();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
     
  }, []);

  const filteredData = data.filter(
    (item) =>
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.noInvoice.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2">
          <DollarSign className="h-8 w-8 animate-spin" />
          <p>Loading Report INV data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-full px-2 sm:px-4 lg:px-6">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight mt-8">
              Penjualan
            </h1>
            <p className="text-black">
              Data dari Report INV tersimpan: Tanggal, Customer, No. Invoice +
              financials
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard">← Dashboard</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Report INV Tersimpan</CardTitle>
              <CardDescription>
                Total {filteredData.length} records ({data.length} total)
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-black" />
              <Input
                placeholder="Cari customer atau no. invoice..."
                className="pl-10 w-[300px]"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>No. Invoice</TableHead>
                    <TableHead className="text-right">
                      Total After Disc.
                    </TableHead>
                    <TableHead className="text-center">PPN</TableHead>

                    <TableHead className="text-right font-mono text-black">
                      Pengajuan Modal
                    </TableHead>
                    <TableHead className="text-right font-mono text-black">
                      Pembelian Aktual
                    </TableHead>
                    <TableHead className="text-right font-mono font-semibold text-black">
                      Gross Profit
                    </TableHead>
                    <TableHead className="text-right font-mono font-semibold text-black">
                      Marketing Fee (10%)
                    </TableHead>
                    <TableHead className="text-right font-mono font-semibold text-black">
                      Bagi Hasil HSI (8%)
                    </TableHead>
                    <TableHead className="text-right font-mono font-semibold text-black">
                      Bansos (5%)
                    </TableHead>
                    <TableHead className="text-right font-mono font-semibold text-red-700">
                      Net Profit
                    </TableHead>
                    <TableHead>Waktu Pembayaran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const grossProfit =
                      item.totalAfterDiscount - item.pembelianAktual;
                    const marketingFee = grossProfit * 0.1;
                    const bagiHasilHSI = item.pengajuanModal * 0.08;

                    // BANSOS mengikuti state di Profit page:
                    // - jika checklist Bansos tidak aktif => bansos = 0
                    // - jika checklist aktif => ambil nilai bansosValue (hasil sync dari DB)
                    const bansos = Number(item.bansosValue ?? 0);

                    const netProfit =
                      grossProfit - (marketingFee + bagiHasilHSI + bansos);

                    return (
                      <TableRow key={item.noInvoice}>
                        <TableCell>{item.no}</TableCell>
                        <TableCell>{formatDate(item.tanggal)}</TableCell>
                        <TableCell className="font-medium whitespace-pre-line align-top">
                          {item.customer}
                        </TableCell>
                        <TableCell className="font-mono">
                          {item.noInvoice}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(item.totalAfterDiscount)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-black">
                          {formatCurrency(item.ppn)}
                        </TableCell>

                        <TableCell className="text-right font-mono text-black font-medium">
                          {formatCurrency(item.pengajuanModal)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-black font-medium">
                          {formatCurrency(item.pembelianAktual)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-black">
                          {formatCurrency(grossProfit)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-black">
                          {formatCurrency(marketingFee)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-black">
                          {formatCurrency(bagiHasilHSI)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold text-black">
                          {formatCurrency(bansos)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-red-700">
                          {formatCurrency(netProfit)}
                        </TableCell>
                        <TableCell>
                          {item.lunasDate ? (
                            <Badge
                              variant="default"
                              className="bg-green-100 text-green-800 border-green-200"
                            >
                              Lunas {formatDate(item.lunasDate)}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">
                              Belum Lunas
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredData.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={14} className="h-24 text-center">
                        {search
                          ? "Tidak ditemukan"
                          : "Belum ada data Report INV tersimpan."}
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
