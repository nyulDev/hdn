"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit2, Trash2, Loader2, ShieldOff } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { addUser, getUsers, updateUser, deleteUser } from "./actions";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
  const { isSuperAdmin, isLoading: isAuthLoading } = useCurrentUser();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [status, setStatus] = useState("active");

  const fetchUsers = async () => {
    setIsLoading(true);
    const result = await getUsers();
    if (result.success && result.data) {
      setUsers(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!isAuthLoading && isSuperAdmin) {
      fetchUsers();
    }
  }, [isAuthLoading, isSuperAdmin]);

  // Tampilkan loading saat mengecek auth
  if (isAuthLoading) {
    return (
      <AppShell>
        <div className="flex h-full items-center justify-center p-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppShell>
    );
  }

  // Guard: hanya super_admin yang bisa akses
  if (!isSuperAdmin) {
    return (
      <AppShell>
        <div className="flex h-full flex-col items-center justify-center gap-4 p-10 text-center">
          <ShieldOff className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Akses Ditolak</h1>
          <p className="text-muted-foreground max-w-sm">
            Anda tidak memiliki izin untuk mengakses halaman ini. Halaman User
            Management hanya dapat diakses oleh <strong>Super Admin</strong>.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Kembali ke Dashboard
          </Button>
        </div>
      </AppShell>
    );
  }

  const resetForm = () => {
    setEditId(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("admin");
    setStatus("active");
  };

  const handleOpenNewUser = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleEditUser = (user: any) => {
    setEditId(user.id);
    setName(user.name || "");
    setEmail(user.email || "");
    setPassword(""); // Kosongkan password agar tidak terlihat, hanya diisi jika ingin diubah
    setRole(user.role || "admin");
    setStatus(user.status || "active");
    setIsOpen(true);
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus user ini?")) {
      const result = await deleteUser(id);
      if (result.success) {
        fetchUsers();
      } else {
        alert("Gagal menghapus user: " + result.error);
      }
    }
  };

  const handleSaveUser = async () => {
    if (!name || !email || (!editId && !password)) {
      alert("Nama, Email, dan Password wajib diisi!");
      return;
    }
    
    setIsSaving(true);
    const data = { name, email, password, role, status };
    
    const result = editId 
      ? await updateUser(editId, data) 
      : await addUser(data);
      
    setIsSaving(false);

    if (result.success) {
      setIsOpen(false);
      resetForm();
      fetchUsers();
    } else {
      alert("Gagal menyimpan user: " + result.error);
    }
  };

  return (
    <AppShell>
      <div className="p-4 md:p-6 max-w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Kelola pengguna, peran (role), dan status akses sistem.
            </p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={(open) => {
            if(!open) resetForm();
            setIsOpen(open);
          }}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenNewUser}>
                <Plus className="mr-2 h-4 w-4" /> Tambah User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editId ? "Edit User" : "Tambah User Baru"}</DialogTitle>
                <DialogDescription>
                  {editId 
                    ? "Perbarui detail informasi pengguna. Kosongkan password jika tidak ingin mengubahnya." 
                    : "Masukkan detail informasi pengguna di bawah ini untuk membuat akses Sign In baru."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nama
                  </Label>
                  <Input 
                    id="name" 
                    placeholder="Nama Lengkap" 
                    className="col-span-3" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@haluan.id" 
                    className="col-span-3"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder={editId ? "(Kosongkan jika tetap)" : "******"} 
                    className="col-span-3"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <div className="col-span-3">
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Peran" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3">
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSaving}>
                  Batal
                </Button>
                <Button onClick={handleSaveUser} disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Simpan User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
              <div className="relative w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari user berdasarkan nama/email..."
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Tidak ada data pengguna.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>{user.name || "-"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="capitalize">{user.role?.replace("_", " ") || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={user.status === "active" ? "default" : "destructive"}>
                            {user.status === "active" ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-blue-600"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

