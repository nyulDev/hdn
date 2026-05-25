"use client";

import * as React from "react";
import { FileText, Edit, Trash2, MoreHorizontal } from "lucide-react";
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

interface Penawaran {
  id: string;
  pt: string;
  kapal?: string;
  noQuo: string;
  noPenawaran: string;
  tanggal?: string;
  departemen?: string;
  namaMesin?: string;
}

export default function PenawaranPage() {
  const [penawarans, setPenawarans] = React.useState<Penawaran[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [pt, setPt] = React.useState("");
  const [kapal, setKapal] = React.useState("");
  const [noQuo, setNoQuo] = React.useState("");
  const [noPenawaran, setNoPenawaran] = React.useState("");
  const [tanggal, setTanggal] = React.useState("");
  const [departemen, setDepartemen] = React.useState("");
  const [namaMesin, setNamaMesin] = React.useState("");

  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState("");

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

  const generateNoQuo = (dept: string) => {
    if (!dept) return "";

    const currentYear = new Date().getFullYear();
    const currentPenawarans = penawarans.filter(
      (p) => p.departemen === dept && p.noQuo?.includes(`-${currentYear}`),
    );
    const nextNumber = currentPenawarans.length + 1;
    const formattedNumber = nextNumber.toString().padStart(4, "0");

    return `${formattedNumber}-PH-${dept}-${currentYear}`;
  };

  const handleDepartemenChange = (value: string) => {
    setDepartemen(value);
    if (!isEditing && value) {
      setNoQuo(generateNoQuo(value));
    }
  };

  const handleEdit = (penawaran: Penawaran) => {
    setIsEditing(true);
    setEditingId(penawaran.id);
    setPt(penawaran.pt);
    setKapal(penawaran.kapal || "");
    setNoQuo(penawaran.noQuo);
    setNoPenawaran(penawaran.noPenawaran);
    setDepartemen(penawaran.departemen || "");
    setNamaMesin(penawaran.namaMesin || "");

    if (penawaran.tanggal) {
      const date = new Date(penawaran.tanggal);
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
      const response = await fetch(`/api/penawaran/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchPenawarans();
        if (editingId === id) {
          resetForm();
        }
      } else {
        console.error("Failed to delete penawaran");
      }
    } catch (error) {
      console.error("Error deleting penawaran:", error);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId("");
    setPt("");
    setKapal("");
    setNoQuo("");
    setNoPenawaran("");
    setTanggal("");
    setDepartemen("");
    setNamaMesin("");
  };

  React.useEffect(() => {
    fetchPenawarans();
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/penawaran/${editingId}` : "/api/penawaran";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pt,
          kapal,
          noQuo,
          noPenawaran,
          tanggal: tanggal || new Date().toISOString().split("T")[0],
          departemen: departemen || null,
          namaMesin: departemen === "HTU" ? namaMesin : null,
        }),
      });

      if (response.ok) {
        resetForm();
        await fetchPenawarans();
      } else {
        console.error("Failed to save penawaran");
      }
    } catch (error) {
      console.error("Error saving penawaran:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const uniqueKapals = React.useMemo(() => {
    const kapals = customers
      .map((c) => c.kapal)
      .filter((k) => k && k.trim() !== "");
    return [...new Set(kapals)];
  }, [customers]);

  const uniquePTs = React.useMemo(() => {
    const pts = customers
      .map((c) => c.ptMv)
      .filter((pt) => pt && pt.trim() !== "");
    return Array.from(new Set(pts));
  }, [customers]);

  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Edit Penawaran" : "Add Penawaran"}
          </CardTitle>
          <CardDescription>
            {isEditing
              ? "Edit data penawaran yang sudah ada"
              : "Tambahkan data penawaran baru ke dalam sistem"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pt">PT</Label>
              <Select value={pt} onValueChange={setPt} required>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Customer (PT/MV)" />
                </SelectTrigger>
                <SelectContent>
                  {uniquePTs.map((ptName, index) => {
                    const key = `pt-${index}-${ptName}`;
                    return (
                      <SelectItem key={key} value={ptName}>
                        {ptName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="kapal">Kapal</Label>
              <Select value={kapal} onValueChange={setKapal}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kapal (opsional)" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueKapals.map((k, index) => {
                    const key = `kapal-${index}-${k}`;
                    return (
                      <SelectItem key={key} value={k}>
                        {k}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="departemen">Departemen</Label>
                <Select
                  value={departemen}
                  onValueChange={handleDepartemenChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Departemen (opsional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HDN">HDN</SelectItem>
                    <SelectItem value="HMU">HMU</SelectItem>
                    <SelectItem value="HTU">HTU</SelectItem>
                    <SelectItem value="HSI">HSI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {departemen === "HTU" && (
              <div className="grid gap-2">
                <Label htmlFor="namaMesin">Nama Mesin</Label>
                <Input
                  id="namaMesin"
                  placeholder="Masukkan nama mesin"
                  value={namaMesin}
                  onChange={(e) => setNamaMesin(e.target.value)}
                />
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="noQuo">No. Quo</Label>
              <Input
                id="noQuo"
                placeholder="Nomor quotation (auto-generated)"
                value={noQuo}
                onChange={(e) => setNoQuo(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="noPenawaran">No. RFS</Label>
              <Input
                id="noPenawaran"
                placeholder="Masukkan nomor penawaran"
                value={noPenawaran}
                onChange={(e) => setNoPenawaran(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading
                  ? "Menyimpan..."
                  : isEditing
                    ? "Update Penawaran"
                    : "Add Penawaran"}
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
          <CardTitle>Daftar Penawaran</CardTitle>
          <CardDescription>
            Daftar semua penawaran yang tersimpan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {penawarans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Belum ada data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Silakan tambahkan penawaran baru menggunakan form di atas.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PT</TableHead>
                  <TableHead>Kapal</TableHead>
                  <TableHead>Departemen</TableHead>
                  <TableHead>Nama Mesin</TableHead>
                  <TableHead>No. Quo</TableHead>
                  <TableHead>No. RFS</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {penawarans.map((penawaran) => (
                  <TableRow key={penawaran.id}>
                    <TableCell className="font-medium">
                      {penawaran.pt}
                    </TableCell>
                    <TableCell>{penawaran.kapal || "-"}</TableCell>
                    <TableCell>{penawaran.departemen || "-"}</TableCell>
                    <TableCell>{penawaran.namaMesin || "-"}</TableCell>
                    <TableCell>{penawaran.noQuo}</TableCell>
                    <TableCell>{penawaran.noPenawaran}</TableCell>
                    <TableCell>
                      {penawaran.tanggal
                        ? new Date(penawaran.tanggal).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "Belum diisi"}
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
                          <DropdownMenuItem
                            onClick={() => handleEdit(penawaran)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(penawaran.id)}
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
