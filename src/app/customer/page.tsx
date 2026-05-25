"use client";

import * as React from "react";
import { Users, Edit, Trash2, MoreHorizontal, Plus, X } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppShell } from "@/components/app-shell";

export default function CustomerPage() {
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [customerId, setCustomerId] = React.useState("");
  const [ptMv, setPtMv] = React.useState("");
  const [alamat, setAlamat] = React.useState("");
  const [kontak, setKontak] = React.useState("");
  const [kapal, setKapal] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editingId, setEditingId] = React.useState("");
  const [showForm, setShowForm] = React.useState(false);

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

  const handleEdit = (customer: any) => {
    setIsEditing(true);
    setEditingId(customer.id);
    setCustomerId(customer.customerId);
    setPtMv(customer.ptMv);
    setAlamat(customer.alamat || "");
    setKontak(customer.kontak || "");
    setKapal(customer.kapal || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/customer/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCustomers();
        if (editingId === id) {
          resetForm();
        }
      } else {
        console.error("Failed to delete customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId("");
    setCustomerId("");
    setPtMv("");
    setAlamat("");
    setKontak("");
    setKapal("");
    setShowForm(false);
  };

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = isEditing ? `/api/customer/${editingId}` : "/api/customer";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          ptMv,
          alamat,
          kontak,
          kapal,
        }),
      });

      if (response.ok) {
        resetForm();
        await fetchCustomers();
      } else {
        console.error("Failed to save customer");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell>
      {/* Add Customer Button */}
      {!showForm && (
        <Button onClick={() => setShowForm(true)} className="mb-4">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      )}

      {/* Add/Edit Customer Form Card */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {isEditing ? "Edit Customer" : "Add Customer"}
                </CardTitle>
                <CardDescription>
                  {isEditing
                    ? "Edit data customer yang sudah ada"
                    : "Tambahkan data customer baru ke dalam sistem"}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="customerId">Customer ID</Label>
                <Input
                  id="customerId"
                  placeholder="Masukkan Customer ID"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ptMv">Perusahaan</Label>
                <Input
                  id="ptMv"
                  placeholder="Masukkan nama perusahaan (PT/MV)"
                  value={ptMv}
                  onChange={(e) => setPtMv(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="alamat">Alamat</Label>
                <Input
                  id="alamat"
                  placeholder="Masukkan alamat"
                  value={alamat}
                  onChange={(e) => setAlamat(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kontak">Kontak</Label>
                <Input
                  id="kontak"
                  placeholder="Masukkan nomor kontak"
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="kapal">Kapal</Label>
                <Input
                  id="kapal"
                  placeholder="Masukkan nama kapal"
                  value={kapal}
                  onChange={(e) => setKapal(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading
                    ? "Menyimpan..."
                    : isEditing
                      ? "Update Customer"
                      : "Add Customer"}
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
      )}

      {/* Customer List Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Customer</CardTitle>
          <CardDescription>
            Daftar semua customer yang tersimpan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Belum ada data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Silakan tambahkan customer baru menggunakan tombol di atas.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>PT / MV</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Kapal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.customerId}
                    </TableCell>
                    <TableCell>{customer.ptMv}</TableCell>
                    <TableCell>{customer.alamat}</TableCell>
                    <TableCell>{customer.kontak}</TableCell>
                    <TableCell>{customer.kapal}</TableCell>
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
                            onClick={() => handleEdit(customer)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(customer.id)}
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
