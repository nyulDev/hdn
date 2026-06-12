"use client";

import * as React from "react";
import { Receipt, Edit, Trash2, MoreHorizontal, Plus } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppShell } from "@/components/app-shell";

export default function QuoPpnPage() {
  const [quoPpns, setQuoPpns] = React.useState<any[]>([]);
  const [penawarans, setPenawarans] = React.useState<any[]>([]);
  const [modals, setModals] = React.useState<any[]>([]);
  const [modalsAktual, setModalsAktual] = React.useState<any[]>([]);
  const [noQuo, setNoQuo] = React.useState("");
  const [range1, setRange1] = React.useState("");
  const [range2, setRange2] = React.useState("");
  const [range3, setRange3] = React.useState("");
  const [filterNoQuo, setFilterNoQuo] = React.useState("all");
  const [isLoading, setIsLoading] = React.useState(false);

  // Filtered quoPpns based on filterNoQuo
  const filteredQuoPpns = React.useMemo(() => {
    // Don't show any data if filter is "all" (default - no filter selected)
    if (filterNoQuo === "all") return [];
    const selectedPenawaran = penawarans.find((p) => p.id === filterNoQuo);
    if (!selectedPenawaran) return [];
    return quoPpns.filter((q) => q.noQuo === selectedPenawaran.noQuo);
  }, [filterNoQuo, quoPpns, penawarans]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<"add" | "edit">("add");
  const [dialogEditId, setDialogEditId] = React.useState("");
  const [dialogPenawaranId, setDialogPenawaranId] = React.useState("");
  const [dialogNoQuo, setDialogNoQuo] = React.useState("");
  const [dialogPn, setDialogPn] = React.useState("");
  const [dialogDescription, setDialogDescription] = React.useState("");
  const [dialogSelectedModalId, setDialogSelectedModalId] = React.useState("");
  const [dialogKodeImpa, setDialogKodeImpa] = React.useState("");
  const [dialogQty, setDialogQty] = React.useState("");
  const [dialogSatuan, setDialogSatuan] = React.useState("");

  const [dialogUnitPrice, setDialogUnitPrice] = React.useState("");
  const [dialogTotal, setDialogTotal] = React.useState("");
  const [dialogUnitPriceNew, setDialogUnitPriceNew] = React.useState("");
  const [dialogTotalNew, setDialogTotalNew] = React.useState("");
  const [dialogTanggal, setDialogTanggal] = React.useState("");
  const [dialogRange1, setDialogRange1] = React.useState("");
  const [dialogRange2, setDialogRange2] = React.useState("");
  const [dialogRange3, setDialogRange3] = React.useState("");

  // Helper function to get penawaran by noQuo
  const getPenawaran = (noQuo: string) => {
    return penawarans.find((p) => p.noQuo === noQuo);
  };

  // Helper function to get modals by noQuo
  const getModalsByNoQuo = (noQuo: string) => {
    return modals.filter((m) => m.noQuo === noQuo);
  };

  // Fetch penawarans and modals on mount
  React.useEffect(() => {
    fetchPenawarans();
    fetchModals();
    fetchModalsAktual();
    fetchQuoPpns();
  }, []);

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

  const fetchModalsAktual = async () => {
    try {
      const response = await fetch("/api/modal?isAktual=true");
      const data = await response.json();
      setModalsAktual(data);
    } catch (error) {
      console.error("Error fetching modals aktual:", error);
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

  const handleDeleteQuoPpn = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) {
      return;
    }

    try {
      const response = await fetch(`/api/quo-ppn/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchQuoPpns();
      } else {
        console.error("Failed to delete quo-ppn");
      }
    } catch (error) {
      console.error("Error deleting quo-ppn:", error);
    }
  };

  // Dialog handlers
  const handleDialogNoQuoChange = (value: string) => {
    // value is the penawaran.id
    const selectedPenawaran = penawarans.find((p) => p.id === value);
    const noQuoValue = selectedPenawaran ? selectedPenawaran.noQuo : value;
    setDialogPenawaranId(value);
    setDialogNoQuo(noQuoValue);
    setDialogPn("");
    setDialogDescription("");
    setDialogSelectedModalId("");
    setDialogTanggal("");
  };

  const handleDialogDescriptionChange = (value: string) => {
    setDialogSelectedModalId(value);

    const modalsSafe = Array.isArray(modals) ? modals : [];
    // Find the modal by ID from regular modals (NOT modal-aktual)
    const modal = modalsSafe.find((m) => m.id === value);
    if (modal) {
      setDialogDescription(modal.description);
      setDialogPn(modal.pn || "");
      setDialogQty(modal.qty?.toString() || "");
      setDialogSatuan(modal.satuan || "");
      setDialogKodeImpa(modal.kodeImpa || "");

      // Regular modal stores unitPrice (and qty), no nilaiAktual
      const unitPriceValue = modal.unitPrice;
      setDialogUnitPrice(unitPriceValue?.toString() || "");

      const total =
        (parseFloat(modal.qty) || 0) * (parseFloat(unitPriceValue) || 0);
      setDialogTotal(total.toString());

      if (modal.createdAt) {
        const date = new Date(modal.createdAt);
        const formattedDate = date.toISOString().split("T")[0];
        setDialogTanggal(formattedDate);
      }
    }
  };

  const handleDialogQtyChange = (value: string) => {
    setDialogQty(value);
    const qty = parseFloat(value) || 0;
    const unitPrice = parseFloat(dialogUnitPrice) || 0;
    const unitPriceNew = parseFloat(dialogUnitPriceNew) || 0;
    setDialogTotal((qty * unitPrice).toString());
    setDialogTotalNew((qty * unitPriceNew).toString());
  };

  const handleDialogUnitPriceChange = (value: string) => {
    setDialogUnitPrice(value);
    const unitPrice = parseFloat(value) || 0;
    const qty = parseFloat(dialogQty) || 0;
    setDialogTotal((qty * unitPrice).toString());
  };

  const handleDialogUnitPriceNewChange = (value: string) => {
    setDialogUnitPriceNew(value);
    const unitPriceNew = parseFloat(value) || 0;
    const qty = parseFloat(dialogQty) || 0;
    setDialogTotalNew((qty * unitPriceNew).toString());
  };

  // Calculate range values for display
  const calculateRangeDisplay = () => {
    const unitPrice = parseFloat(dialogUnitPrice) || 0;
    const range1Val = parseFloat(dialogRange1) || 0;
    const range2Val = parseFloat(dialogRange2) || 0;
    const range3Val = parseFloat(dialogRange3) || 0;

    return {
      range1Result: (range1Val / 100) * unitPrice,
      range2Result: (range2Val / 100) * unitPrice,
      range3Result: (range3Val / 100) * unitPrice,
    };
  };

  const handleDialogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const penawaran = getPenawaran(dialogNoQuo);

      if (dialogMode === "edit" && dialogEditId) {
        // Update existing record
        const response = await fetch(`/api/quo-ppn/${dialogEditId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tanggal: dialogTanggal || null,
            noQuo: dialogNoQuo,
            noPt: getPenawaran(dialogNoQuo)?.pt || "",
            noPenawaran: getPenawaran(dialogNoQuo)?.noPenawaran || "",
            pn: dialogPn,
            description: dialogDescription,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update data");
        }
      } else {
        // Create new record
        const response = await fetch("/api/quo-ppn", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tanggal: dialogTanggal || null,
            noQuo: dialogNoQuo,
            noPt: getPenawaran(dialogNoQuo)?.pt || "",
            noPenawaran: getPenawaran(dialogNoQuo)?.noPenawaran || "",
            pn: dialogPn,
            description: dialogDescription,
            kodeImpa: dialogKodeImpa || null,
            qty: dialogQty,
            satuan: dialogSatuan,
            unitPriceNew: dialogUnitPriceNew,
            totalNew: dialogTotalNew,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to save data");
        }
      }

      setRange1(dialogRange1);
      setRange2(dialogRange2);
      setRange3(dialogRange3);
      setNoQuo(dialogNoQuo);
      fetchQuoPpns();

      setDialogOpen(false);
      setDialogNoQuo("");
      setDialogPn("");
      setDialogDescription("");
      setDialogSelectedModalId("");
      setDialogKodeImpa("");
      setDialogQty("");
      setDialogSatuan("");
      setDialogUnitPrice("");
      setDialogTotal("");
      setDialogUnitPriceNew("");
      setDialogTotalNew("");
      setDialogTanggal("");
      setDialogRange1("");
      setDialogRange2("");
      setDialogRange3("");
    } catch (error) {
      console.error("Error saving QUO PPN:", error);
      alert("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setDialogMode("add");
      setDialogEditId("");
      setDialogPenawaranId("");
      setDialogNoQuo("");
      setDialogPn("");
      setDialogDescription("");
      setDialogSelectedModalId("");
      setDialogKodeImpa("");
      setDialogQty("");
      setDialogSatuan("");

      setDialogUnitPrice("");
      setDialogTotal("");
      setDialogUnitPriceNew("");
      setDialogTotalNew("");
      setDialogTanggal("");
      setDialogRange1("");
      setDialogRange2("");
      setDialogRange3("");
    }
  };

  const handleEditQuoPpn = (quoPpn: any) => {
    // Find the penawaran that matches this quoPpn
    const selectedPenawaran = penawarans.find((p) => p.noQuo === quoPpn.noQuo);

    // Try to resolve modalAktualId from description (so dropdown matches)
    // NOTE: This page stores unitPrice/total lama by modalAktual selection,
    // but when editing we want values to be visible even without re-selecting.
    const resolvedModal = Array.isArray(modals)
      ? modals.find(
          (m) =>
            m.noQuo === (quoPpn.noQuo || "") &&
            (m.description === (quoPpn.description || "") ||
              // fallback match by pn + kodeImpa when description differs
              (m.pn === (quoPpn.pn || "") &&
                (m.kodeImpa || "") === (quoPpn.kodeImpa || ""))),
        )
      : undefined;

    const resolvedModalId = resolvedModal?.id || "";

    const resolvedQtyStr = quoPpn.qty?.toString() || "";
    const resolvedSatuanStr = quoPpn.satuan || "";
    const resolvedUnitPriceNewStr = quoPpn.unitPriceNew?.toString() || "";
    const resolvedTotalNewStr = quoPpn.totalNew?.toString() || "";

    // Fill lama fields from modal (regular) if available; otherwise compute from qty & unitPrice
    const lamaUnitPrice =
      resolvedModal?.unitPrice ?? quoPpn.unitPriceNew ?? null;

    const lamaQty = quoPpn.qty ?? resolvedModal?.qty ?? 0;
    const lamaUnitPriceNum = lamaUnitPrice !== null ? Number(lamaUnitPrice) : 0;
    const lamaTotalNum =
      (Number(lamaQty) || 0) * (Number(lamaUnitPriceNum) || 0);

    setDialogMode("edit");
    setDialogEditId(quoPpn.id);
    setDialogPenawaranId(selectedPenawaran?.id || "");
    setDialogNoQuo(quoPpn.noQuo || "");
    setDialogPn(quoPpn.pn || "");
    setDialogDescription(quoPpn.description || "");

    // set dropdown value so it renders correctly
    setDialogSelectedModalId(resolvedModalId);

    setDialogQty(resolvedQtyStr);
    setDialogSatuan(resolvedSatuanStr);
    setDialogKodeImpa(quoPpn.kodeImpa || "");

    setDialogUnitPrice(
      lamaUnitPriceNum && Number.isFinite(lamaUnitPriceNum)
        ? lamaUnitPriceNum.toString()
        : "",
    );
    setDialogTotal(
      lamaTotalNum && Number.isFinite(lamaTotalNum)
        ? lamaTotalNum.toString()
        : "",
    );

    setDialogUnitPriceNew(resolvedUnitPriceNewStr);
    setDialogTotalNew(resolvedTotalNewStr);

    setDialogTanggal(
      quoPpn.tanggal
        ? new Date(quoPpn.tanggal).toISOString().split("T")[0]
        : "",
    );

    // Tidak ada field range yang disimpan di record QUO PPN,
    // jadi kita biarkan kosong saat edit.
    setDialogRange1("");
    setDialogRange2("");
    setDialogRange3("");

    // Pastikan total lama baru sesuai dengan state qty/lama unit price
    // (menghindari edge case ketika user langsung melihat tanpa re-select description)
    const qtyNum =
      parseFloat(lamaQty?.toString?.() ? String(lamaQty) : String(lamaQty)) ||
      0;
    const unitPriceNum =
      parseFloat(
        lamaUnitPriceNum && Number.isFinite(lamaUnitPriceNum)
          ? lamaUnitPriceNum.toString()
          : "0",
      ) || 0;
    const totalCalc = qtyNum * unitPriceNum;
    if (Number.isFinite(totalCalc)) {
      setDialogTotal(totalCalc.toString());
    }

    setDialogOpen(true);
  };

  const handleAddQuoPpn = () => {
    setDialogMode("add");
    setDialogEditId("");
    setDialogPenawaranId("");
    setDialogNoQuo("");
    setDialogPn("");
    setDialogDescription("");
    setDialogSelectedModalId("");
    setDialogQty("");
    setDialogSatuan("");
    setDialogUnitPrice("");
    setDialogTotal("");
    setDialogUnitPriceNew("");
    setDialogTotalNew("");
    setDialogTanggal("");
    setDialogRange1("");
    setDialogRange2("");
    setDialogRange3("");
    setDialogOpen(true);
  };

  return (
    <AppShell>
      <Card className="mt-2 md:mt-4 min-h-[700px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>QUO PPN</CardTitle>
              <CardDescription>
                Kelola data QUO PPN dan export ke PDF
              </CardDescription>
            </div>
            <Button onClick={handleAddQuoPpn}>
              <Plus className="mr-2 h-4 w-4" />
              Add QUO PPN
            </Button>
          </div>
          {/* Filter No. Quo */}
          <div className="mt-4 flex items-center gap-4">
            <Label htmlFor="filterNoQuo" className="text-sm font-normal">
              Filter No. RFS:
            </Label>
            <Select value={filterNoQuo} onValueChange={setFilterNoQuo}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Semua No. RFS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua No. RFS</SelectItem>
                {penawarans.map((penawaran) => (
                  <SelectItem key={penawaran.id} value={penawaran.id}>
                    {penawaran.noPenawaran} - {penawaran.pt}{" "}
                    {penawaran.noQuo ? `(${penawaran.noQuo})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuoPpns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Belum ada data</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filterNoQuo === "all"
                  ? "Belum ada data QUO PPN yang tersedia."
                  : "Tidak ada data untuk No. Quo yang dipilih."}
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 font-medium">No</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>No. Quo</TableHead>
                    <TableHead>No. PT</TableHead>
                    <TableHead>No. RFS</TableHead>
                    <TableHead>Kode IMPA</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Satuan</TableHead>
                    <TableHead>Unit Price New</TableHead>
                    <TableHead>Total New</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...filteredQuoPpns].reverse().map((quoPpn, index) => (
                    <TableRow key={quoPpn.id}>
                      <TableCell className="w-16 font-medium">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        {quoPpn.tanggal
                          ? new Date(quoPpn.tanggal).toLocaleDateString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {quoPpn.noQuo}
                      </TableCell>
                      <TableCell>{quoPpn.noPt || "-"}</TableCell>
                      <TableCell>{quoPpn.noPenawaran || "-"}</TableCell>
                      <TableCell>{quoPpn.kodeImpa || "-"}</TableCell>
                      <TableCell>{quoPpn.description || "-"}</TableCell>
                      <TableCell>
                        {quoPpn.qty !== undefined && quoPpn.qty !== null
                          ? `${quoPpn.qty} ${quoPpn.satuan || ""}`.trim()
                          : "-"}
                      </TableCell>
                      <TableCell>{quoPpn.satuan || "-"}</TableCell>
                      <TableCell>
                        {quoPpn.unitPriceNew
                          ? parseFloat(quoPpn.unitPriceNew).toLocaleString(
                              "id-ID",
                            )
                          : "-"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {quoPpn.totalNew
                          ? parseFloat(quoPpn.totalNew).toLocaleString("id-ID")
                          : "-"}
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
                              onClick={() => handleEditQuoPpn(quoPpn)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteQuoPpn(quoPpn.id)}
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit QUO PPN Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[900px] w-[95vw] max-w-[95vw]">
          <DialogHeader>
            <DialogTitle>
              {dialogMode === "edit" ? "Edit QUO PPN" : "Tambah QUO PPN"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "edit"
                ? "Edit data QUO PPN yang sudah ada"
                : "Tambahkan data QUO PPN baru ke dalam sistem"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDialogSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="dialogNoQuo">No. RFS</Label>
                <Select
                  value={dialogPenawaranId}
                  onValueChange={handleDialogNoQuoChange}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih No. RFS" />
                  </SelectTrigger>
                  <SelectContent>
                    {penawarans.map((penawaran) => (
                      <SelectItem key={penawaran.id} value={penawaran.id}>
                        {penawaran.noPenawaran} - {penawaran.pt}{" "}
                        {penawaran.noQuo ? `(${penawaran.noQuo})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dialogDescription">Description</Label>
                <Select
                  value={dialogSelectedModalId}
                  onValueChange={handleDialogDescriptionChange}
                  disabled={!dialogNoQuo}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Description" />
                  </SelectTrigger>
                  <SelectContent>
                    {modals
                      .filter((m) => m.noQuo === dialogNoQuo)
                      .map((modal) => (
                        <SelectItem key={modal.id} value={modal.id}>
                          {modal.description}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dialogQty">Qty</Label>
                  <Input
                    id="dialogQty"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={dialogQty}
                    onChange={(e) => handleDialogQtyChange(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dialogSatuan">Satuan</Label>
                  <Input
                    id="dialogSatuan"
                    placeholder="Unit"
                    value={dialogSatuan}
                    onChange={(e) => setDialogSatuan(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dialogTanggal">Tanggal</Label>
                  <Input
                    id="dialogTanggal"
                    type="date"
                    value={dialogTanggal}
                    onChange={(e) => setDialogTanggal(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dialogKodeImpa">Kode IMPA</Label>
                  <Input
                    id="dialogKodeImpa"
                    placeholder="Kode IMPA"
                    value={dialogKodeImpa}
                    onChange={(e) => setDialogKodeImpa(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dialogUnitPrice">Unit Price ( Lama )</Label>
                  <Input
                    id="dialogUnitPrice"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dialogUnitPrice}
                    onChange={(e) =>
                      handleDialogUnitPriceChange(e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dialogTotal">Total ( Lama )</Label>
                  <Input
                    id="dialogTotal"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dialogTotal}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dialogUnitPriceNew">
                    Unit Price ( Baru )
                  </Label>
                  <Input
                    id="dialogUnitPriceNew"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dialogUnitPriceNew}
                    onChange={(e) =>
                      handleDialogUnitPriceNewChange(e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dialogTotalNew">Total ( Baru )</Label>
                  <Input
                    id="dialogTotalNew"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={dialogTotalNew}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dialogRange1">Range 1 (%)</Label>
                  <Input
                    id="dialogRange1"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={dialogRange1}
                    onChange={(e) => setDialogRange1(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dialogRange2">Range 2 (%)</Label>
                  <Input
                    id="dialogRange2"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={dialogRange2}
                    onChange={(e) => setDialogRange2(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="dialogRange3">Range 3 (%)</Label>
                  <Input
                    id="dialogRange3"
                    type="number"
                    step="0.01"
                    placeholder="0"
                    value={dialogRange3}
                    onChange={(e) => setDialogRange3(e.target.value)}
                  />
                </div>
              </div>

              {/* Display Range Results */}
              {(dialogRange1 || dialogRange2 || dialogRange3) && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">
                    Hasil Perhitungan Range:
                  </Label>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                    {dialogRange1 && (
                      <div>
                        <span className="text-muted-foreground">
                          Range 1 ({dialogRange1}%):
                        </span>
                        <span className="ml-2 font-medium">
                          {calculateRangeDisplay().range1Result.toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                    )}
                    {dialogRange2 && (
                      <div>
                        <span className="text-muted-foreground">
                          Range 2 ({dialogRange2}%):
                        </span>
                        <span className="ml-2 font-medium">
                          {calculateRangeDisplay().range2Result.toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                    )}
                    {dialogRange3 && (
                      <div>
                        <span className="text-muted-foreground">
                          Range 3 ({dialogRange3}%):
                        </span>
                        <span className="ml-2 font-medium">
                          {calculateRangeDisplay().range3Result.toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
