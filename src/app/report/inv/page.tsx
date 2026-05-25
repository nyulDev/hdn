"use client";

import * as React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Types for the data
interface QuoPpnData {
  id: string;
  tanggal: string | null;
  noQuo: string;
  noPt: string;
  noPenawaran: string;
  pn: string;
  description: string;
  satuan: string;
  qty: number;
  invoicedQty?: number | null;
  unitPriceNew: number;
  totalNew: number;
  kodeImpa?: string | null;
  isInvoiced?: boolean;
}

interface PenawaranData {
  id: string;
  noQuo: string;
  pt: string;
  noPenawaran: string;
  kapal?: string | null;
  namaMesin?: string | null;
}

interface CustomerData {
  id: string;
  customerId: string;
  ptMv: string;
  alamat: string | null;
  kontak: string | null;
}

interface ModalData {
  id: string;
  noQuo: string;
  noPenawaran?: string | null;
  location: string | null;
  qty: number;
  description: string;
  kodeImpa: string | null;
  pn: string | null;
}

export default function INVPage() {
  // State for filter
  const [filterNoRfs, setFilterNoRfs] = React.useState("");
  const [atsn, setAtsn] = React.useState("");
  const [savedPn, setSavedPn] = React.useState("");
  const [savedKapal, setSavedKapal] = React.useState("");
  const [savedNamaMesin, setSavedNamaMesin] = React.useState("");
  const [savedLocation, setSavedLocation] = React.useState("");
  const [savedSubtotal, setSavedSubtotal] = React.useState(0);
  const [savedDiscountAmount, setSavedDiscountAmount] = React.useState(0);
  const [savedTotalAfterDiscount, setSavedTotalAfterDiscount] =
    React.useState(0);
  const [savedDpp, setSavedDpp] = React.useState(0);
  const [savedPpn, setSavedPpn] = React.useState(0);
  const [savedTotalInvoice, setSavedTotalInvoice] = React.useState(0);
  const [pnValues, setPnValues] = React.useState("");
  const [discount, setDiscount] = React.useState<number>(0);
  const [penawarans, setPenawarans] = React.useState<PenawaranData[]>([]);
  const [customers, setCustomers] = React.useState<CustomerData[]>([]);
  const [quoPpns, setQuoPpns] = React.useState<QuoPpnData[]>([]);
  const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>([]);
  const [modals, setModals] = React.useState<ModalData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const [totalPages, setTotalPages] = React.useState(1);
  const [isSaving, setIsSaving] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  // Fetch penawarans for dropdown
  React.useEffect(() => {
    fetchPenawarans();
    fetchModals();
    fetchCustomers();
  }, []);

  // Extract P/N values when modals or filterNoRfs changes
  React.useEffect(() => {
    if (filterNoRfs && modals.length > 0) {
      const filteredModals = modals.filter(
        (m) => m.noPenawaran === filterNoRfs,
      );
      const uniquePns = [
        ...new Set(filteredModals.map((m) => m.pn).filter((pn) => pn)),
      ];
      setPnValues(uniquePns.join(", "));
    } else if (!filterNoRfs) {
      setPnValues("");
    }
  }, [modals, filterNoRfs]);

  // Load saved report inv data when filterNoRfs changes
  React.useEffect(() => {
    const fetchSavedReportInv = async () => {
      if (!filterNoRfs) return;
      try {
        const response = await fetch(
          `/api/report-inv?noPenawaran=${encodeURIComponent(filterNoRfs)}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setAtsn(data.atsn || "");
            setDiscount(data.discount || 0);
            setSavedPn(data.pn || "");
            setSavedKapal(data.kapal || "");
            setSavedNamaMesin(data.namaMesin || "");
            setSavedLocation(data.location || "");
            setSavedSubtotal(data.subtotal || 0);
            setSavedDiscountAmount(data.discountAmount || 0);
            setSavedTotalAfterDiscount(data.totalAfterDiscount || 0);
            setSavedDpp(data.dpp || 0);
            setSavedPpn(data.ppn || 0);
            setSavedTotalInvoice(data.totalInvoice || 0);
            // Support saved customerId and pt for persistence
            if (data.customerId) {
              // Could set a state to override display
            }
            if (data.pt) {
              // Could set state to override currentPenawaran.pt
            }
          }
        }
      } catch (error) {
        console.error("Error fetching saved report-inv:", error);
      }
    };
    fetchSavedReportInv();
  }, [filterNoRfs]);

  const fetchPenawarans = async () => {
    try {
      const response = await fetch("/api/penawaran");
      const data = await response.json();
      setPenawarans(data);
    } catch (error) {
      console.error("Error fetching penawarans:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customer");
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
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

  // Handle filter change - FIXED: Use noQuo like QUO page + better logging
  const handleFilterChange = async (value: string) => {
    setFilterNoRfs(value);
    if (!value) {
      setQuoPpns([]);
      setSelectedItemIds([]);
      return;
    }

    // Get corresponding noQuo from penawaran
    const currentPenawaran = penawarans.find((p) => p.noPenawaran === value);
    const noQuoValue = currentPenawaran?.noQuo;

    console.log("🔍 INV Debug - Filter No.RFS:", value);
    console.log("🔍 INV Debug - Found noQuo:", noQuoValue);

    if (!noQuoValue) {
      console.warn("⚠️ No penawaran found for No.RFS:", value);
      setQuoPpns([]);
      setSelectedItemIds([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setQuoPpns([]); // Clear previous data

    try {
      // FIXED: Use noQuo like QUO page (this works!)
      const response = await fetch(
        `/api/quo-ppn?noQuo=${encodeURIComponent(noQuoValue.trim())}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ INV Fetched quo-ppn by noQuo:", noQuoValue);
      console.log("📊 Data length:", data.length);
      console.log("📋 Sample data:", data.slice(0, 2));

      // Ensure data is an array
      const validData = Array.isArray(data) ? data : [];
      setQuoPpns(validData);

      // FIXED: Auto-select ALL items (like QUO page behavior)
      setSelectedItemIds(validData.map((item: any) => item.id));

      if (validData.length === 0) {
        console.warn("⚠️ No quo-ppn data found for noQuo:", noQuoValue);
      }
    } catch (error) {
      console.error("❌ Error fetching quo-ppns:", error);
      setQuoPpns([]);
      setSelectedItemIds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter submission
  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterNoRfs) return;
    await handleFilterChange(filterNoRfs);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id)
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id],
    );
  };

  const pendingItemIds = React.useMemo(
    () => quoPpns.filter((item) => !item.isInvoiced).map((i) => i.id),
    [quoPpns],
  );

  const allSelectedPending =
    pendingItemIds.length > 0 &&
    selectedItemIds.length === pendingItemIds.length;

  const toggleSelectAllPending = () => {
    if (allSelectedPending) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(pendingItemIds);
    }
  };

  const selectedItems = quoPpns.filter((item) =>
    selectedItemIds.includes(item.id),
  );

  const [invoicedQtyById, setInvoicedQtyById] = React.useState<
    Record<string, number>
  >({});

  const remainingItems = React.useMemo(() => {
    // Ikuti pola di report TTB: SISA = qty yang belum dipenuhi.
    // Untuk INV, qty yang sudah ter-invoice tersimpan di `invoicedQty`.
    return quoPpns
      .map((item) => {
        const qty = item.qty ?? 0;
        const alreadyInvoicedQty = item.invoicedQty ?? 0;
        const remainingQty = Math.max(0, qty - alreadyInvoicedQty);

        return {
          item,
          remainingQty,
          kodeImpa: item.kodeImpa || item.pn || "00",
        };
      })
      .filter((x) => x.remainingQty > 0);
  }, [quoPpns]);

  const subTotal = selectedItems.reduce((sum, item) => {
    const qty = invoicedQtyById[item.id] ?? item.qty ?? 0;
    const amount = (item.unitPriceNew || 0) * (qty || 0);
    return sum + amount;
  }, 0);

  const discountAmount = subTotal > 0 ? discount : 0;
  const totalAfterDiscount = subTotal - discountAmount;
  const dpp = Math.round((11 / 12) * totalAfterDiscount); // DPP = 11/12 * Total after discount (rounded)
  const ppn = Math.round(0.12 * dpp); // PPN 12% = 12% * DPP (rounded)
  const totalInvoice = totalAfterDiscount + ppn;

  // Get current penawaran for customer info
  const currentPenawaran = penawarans.find(
    (p) => p.noPenawaran === filterNoRfs,
  );

  // Get current customer based on PT name matching
  const currentCustomer = customers.find(
    (c) => c.ptMv?.toLowerCase() === currentPenawaran?.pt?.toLowerCase(),
  );

  // Get current location from modals based on filterNoRfs
  const currentModals = modals.filter((m) => m.noPenawaran === filterNoRfs);
  const currentLocation =
    savedLocation ||
    (filterNoRfs && currentModals.length > 0 && currentModals[0].location
      ? currentModals[0].location
      : "-");

  // Auto-populate Atsn from customer contact
  React.useEffect(() => {
    if (currentCustomer?.kontak) {
      setAtsn(currentCustomer.kontak);
    } else if (filterNoRfs) {
      setAtsn("");
    }
  }, [currentCustomer, filterNoRfs]);

  // Generate No. INV
  const noINV = currentPenawaran?.noQuo || filterNoRfs || "-";

  // Get current date for invoice
  const today = new Date();

  // Format date for display (DD MMM YYYY format like "14 Mar 2025")
  const formatDate = (date: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Format date for DUE DATE (DD Mon YYYY format like "Sat 14 Mar 2026")
  const formatDueDate = (date: Date) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName} ${day} ${month} ${year}`;
  };

  // Calculate due date (30 days from now)
  const dueDate = new Date(today);
  dueDate.setDate(dueDate.getDate() + 30);
  const formattedDueDate = filterNoRfs ? formatDueDate(dueDate) : "-";
  const formatRupiah = (num: number) => {
    return num.toLocaleString("id-ID");
  };

  // Save report inv data
  const handleSave = async () => {
    if (!filterNoRfs) return;
    setIsSaving(true);
    try {
      const response = await fetch("/api/report-inv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noPenawaran: filterNoRfs,
          atsn,
          discount,
          location: currentLocation,
          pn: pnValues,
          kapal: currentPenawaran?.kapal || null,
          namaMesin: currentPenawaran?.namaMesin || null,
          subtotal: subTotal,
          discountAmount: discountAmount,
          totalAfterDiscount: totalAfterDiscount,
          dpp: dpp,
          ppn: ppn,
          totalInvoice: totalInvoice,
          customerId: currentCustomer?.customerId || null,
          pt: currentPenawaran?.pt || null,
        }),
      });

      if (response.ok) {
        alert("Data berhasil disimpan!");
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving report-inv:", error);
      alert("Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    if (selectedItemIds.length === 0) {
      alert("Pilih minimal satu item untuk Invoice");
      return;
    }

    setIsLoading(true);
    try {
      const element = reportRef.current;

      // Calculate total pages based on content height
      // A4 is 210mm x 297mm. At 96 DPI, 297mm is approx 1123px.
      // Since we use max-w-4xl (approx 896px), let's calculate based on aspect ratio.
      const rect = element.getBoundingClientRect();
      const a4AspectRatio = 297 / 210;
      const expectedHeightPerPage = rect.width * a4AspectRatio;
      const calculatedPages = Math.ceil(
        element.scrollHeight / expectedHeightPerPage,
      );
      setTotalPages(calculatedPages);

      // Wait for React to re-render with new totalPages
      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        scale: 2, // Higher quality
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Add extra pages if needed
      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`INV-${filterNoRfs || "report"}.pdf`);

      // Mark selected (pending) items as invoiced in the database (partial support)
      const pendingSelectedItems = selectedItemIds
        .filter((id) => !quoPpns.find((x) => x.id === id)?.isInvoiced)
        .map((id) => {
          const item = quoPpns.find((x) => x.id === id);
          if (!item) return null;
          const qtyToInvoice = invoicedQtyById[id] ?? item.qty ?? 0;
          return {
            id,
            invoicedQty: Number(qtyToInvoice) || 0,
          };
        })
        .filter(Boolean) as Array<{ id: string; invoicedQty: number }>;

      if (pendingSelectedItems.length > 0) {
        try {
          await fetch("/api/quo-ppn/invoiced", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ items: pendingSelectedItems }),
          });

          // Refresh data to show updated status
          await handleFilterChange(filterNoRfs);
        } catch (err) {
          console.error("Error marking items as invoiced:", err);
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal mengunduh PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans print:bg-white print:p-0 print:min-h-0">
      {/* Filter No. QUO - Outside the invoice paper */}
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <form
          onSubmit={handleFilterSubmit}
          className="bg-white shadow-sm border border-gray-200 p-4 rounded-md"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label
              htmlFor="noRfs"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Filter No. RFS :
            </label>
            <select
              id="noRfs"
              value={filterNoRfs}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Pilih No. RFS...</option>
              {penawarans.map((penawaran) => (
                <option key={penawaran.id} value={penawaran.noPenawaran}>
                  {penawaran.noPenawaran} - {penawaran.pt}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !filterNoRfs}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isLoading || !filterNoRfs}
              className="px-4 py-2 bg-[#21ae43] text-white text-sm font-medium rounded-md hover:bg-[#1a8f38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "PDF"}
            </button>
          </div>

          {/* Atsn and Discount Input Fields */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <label
              htmlFor="atsn"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Atsn :
            </label>
            <input
              id="atsn"
              type="text"
              value={atsn}
              onChange={(e) => setAtsn(e.target.value)}
              placeholder="Contoh: Bpk. Yohanes Dhani / Pak Desfandra"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label
              htmlFor="discount"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Discount :
            </label>
            <input
              id="discount"
              type="number"
              step="1"
              min="0"
              value={discount || ""}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-32 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {filterNoRfs && quoPpns.length > 0 && (
          <div className="bg-white shadow-sm border border-gray-200 p-4 rounded-md mt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">
                Item untuk Invoice ({selectedItemIds.length} /{" "}
                {quoPpns.filter((x) => !x.isInvoiced).length})
              </h3>
              <button
                type="button"
                onClick={toggleSelectAllPending}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {allSelectedPending ? "Deselect All" : "Select Pending"}
              </button>
            </div>

            <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-2">
              {quoPpns.map((item) => {
                const isCompleted = !!item.isInvoiced;
                const checked = selectedItemIds.includes(item.id);

                const remainingQty = Math.max(
                  0,
                  (item.qty ?? 0) - (item.invoicedQty ?? 0),
                );

                const displayQty =
                  invoicedQtyById[item.id] ??
                  (remainingQty > 0 ? remainingQty : (item.qty ?? 0));

                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                      isCompleted ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItemSelection(item.id)}
                      disabled={isCompleted}
                      className="rounded border-gray-300"
                    />
                    <span
                      className={`flex-1 ${isCompleted ? "line-through text-gray-500" : ""}`}
                    >
                      {item.description}
                      {isCompleted && (
                        <span className="ml-2 px-2 py-px text-xs bg-green-200 text-green-800 rounded-full font-bold uppercase">
                          Sudah Invoice
                        </span>
                      )}
                    </span>

                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-600 whitespace-nowrap">
                        Sisa: {remainingQty} {item.satuan}
                      </div>
                      <input
                        type="number"
                        step="any"
                        min={0}
                        className="w-24 border rounded-md px-2 py-1 text-sm"
                        value={displayQty}
                        disabled={isCompleted}
                        onChange={(e) => {
                          const raw = e.target.value;
                          const num = raw === "" ? NaN : Number(raw);
                          if (!Number.isFinite(num)) return;
                          if (num > remainingQty) return;
                          setInvoicedQtyById((prev) => ({
                            ...prev,
                            [item.id]: num,
                          }));
                        }}
                      />
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        Invoice
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Kertas Invoice */}
      <div
        ref={reportRef}
        style={{
          backgroundColor: "#ffffff",
          color: "#000000",
          boxShadow:
            "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        }}
        className="max-w-4xl mx-auto border border-[#e5e7eb] p-6 md:p-8"
      >
        {/* Header Perusahaan */}
        <div className="border-b border-[#d1d5db] pb-4 mb-4 relative">
          {/* Logo di pojok kanan */}
          <img
            src="/logotok.png"
            alt="Logo"
            className="absolute top-0 right-0 w-20 h-20 object-contain"
          />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            <span className="text-[#21ae43]">H</span>
            <span className="text-[#004d91]">ALUAN </span>
            <span className="text-[#21ae43]">D</span>
            <span className="text-[#004d91]">AYA </span>
            <span className="text-[#21ae43]">N</span>
            <span className="text-[#004d91]">IAGA, PT.</span>
          </h1>
          <p className="text-sm text-[#4b5563] font-medium">
            <span className="text-[#21ae43]">
              Marine - Oil & Gas - Mining Services
            </span>
          </p>
          <p className="text-xs text-[#6b7280] font-mono mt-1">
            N P W P : 0 7 3 . 1 2 1 . 4 5 3 . 2 - 0 1 2 . 0 0 0
          </p>
        </div>

        {/* Alamat & Kontak Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mb-6">
          <div>
            <p className="font-semibold">
              Gd. One Pacific Place, Level 11-SCBD
            </p>
            <p>Jl. Jend. Sudirman Kav. 52-53, Jak-Sel 12190</p>
            <p>Ph./Fax. 021-21275897-7538093 ; HP-WA: 0811-821723</p>
            <p> Email : sales@haluan.id / haluan.group@yahoo.co.id </p>
          </div>
          <div>
            <p className="font-semibold ml-50">Workshop:</p>
            <p className="ml-50">Cinere Residence H1 No. 5</p>
            <p className="ml-50">Depok Meruyung Jawa Barat 16515</p>
          </div>
        </div>

        {/* Judul INVOICE */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold tracking-widest text-[#b91c1c] border-b-2 border-[#d1d5db] inline-block px-8 pb-4">
            INVOICE
          </h2>
        </div>

        {/* Data Customer & Header Info Tergabung */}
        <div className="flex justify-between items-start mb-4 text-sm">
          {/* Data Customer Kiri */}
          <div>
            <p className="font-bold">{currentPenawaran?.pt}</p>
            <p className="text-xs">{atsn ? `Atsn. ${atsn}` : "Atsn. -"}</p>
            <div className="text-xs mt-2 flex flex-col gap-0.5">
              <p>Reference : {filterNoRfs}</p>
              <p className="text-xs">{currentPenawaran?.kapal || "-"}</p>
              {currentPenawaran?.namaMesin && (
                <p className="text-xs">{currentPenawaran.namaMesin}</p>
              )}
              <p>Terms : {filterNoRfs ? "30 calendar days" : "-"}</p>
              <p>Due Date : {formattedDueDate}</p>
            </div>
            <p className="text-xs mt-2">{pnValues}</p>
          </div>

          {/* Data Dokumen Kanan */}
          <div className="text-xs flex flex-col gap-1 w-64">
            <div className="flex justify-between">
              <span className="font-bold w-32">NO</span>
              <span className="w-32">: {noINV}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold w-32">CUSTOMER ID</span>
              <span className="w-32">
                : {currentCustomer?.customerId || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold w-32">DATE</span>
              <span className="w-32">
                : {filterNoRfs ? formatDate(today) : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold w-32">PAGE</span>
              <span className="w-32">: {filterNoRfs ? totalPages : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold w-32">LOCATION</span>
              <span className="w-32">: {currentLocation}</span>
            </div>
          </div>
        </div>

        {/* Tabel Item */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#f3f4f6] border-t border-b border-[#9ca3af]">
                <th className="text-left py-2 px-1">No</th>
                <th className="text-left py-2 px-1">CODE</th>
                <th className="text-left py-2 px-1">Description</th>
                <th className="text-left py-2 px-1">Quantity</th>
                <th className="text-left py-2 px-1">Unit Price</th>
                <th className="text-left py-2 px-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.length > 0 ? (
                selectedItems.map((item, index) => {
                  const qty = item.qty ?? 0;
                  const kodeImpa = item.kodeImpa || item.pn || "00";
                  return (
                    <tr key={item.id} className="border-b border-[#e5e7eb]">
                      <td className="py-2 px-1 align-top">{index + 1}</td>
                      <td className="py-2 px-1 align-top">{kodeImpa}</td>
                      <td className="py-2 px-1 align-top">
                        {item.description || "-"}
                      </td>
                      <td className="py-2 px-1 align-top">
                        {invoicedQtyById[item.id] ?? qty} {item.satuan}
                      </td>

                      <td className="py-2 px-1 align-top">
                        {formatRupiah(item.unitPriceNew)}
                      </td>
                      <td className="py-2 px-1 align-top">
                        {formatRupiah(item.totalNew)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr className="border-b border-[#e5e7eb]">
                  <td colSpan={6} className="py-4 text-center text-[#6b7280]">
                    {filterNoRfs
                      ? "Pilih item untuk Invoice"
                      : "Pilih No. RFS untuk menampilkan data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAYMENT IN FAVOUR OF & FINANCIAL SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Kiri: PAYMENT IN FAVOUR OF */}
          <div>
            <p className="font-bold text-sm mb-2">
              PAYMENT IN FAVOUR OF PT. HALUAN DAYA NIAGA
            </p>
          </div>

          {/* kanan: Ringkasan Keuangan */}
          <div className="text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-left">Sub Total :</div>
              <div className="text-right font-semibold">
                {formatRupiah(subTotal)}
              </div>

              <div className="text-left">Discount :</div>
              <div className="text-right font-semibold text-[#dc2626]">
                -{formatRupiah(discountAmount)}
              </div>

              <div className="text-left font-semibold">
                Total after discount :
              </div>
              <div className="text-right font-semibold">
                {formatRupiah(totalAfterDiscount)}
              </div>

              <div className="text-left">DPP :</div>
              <div className="text-right">{formatRupiah(dpp)}</div>

              <div className="text-left">PPN 12% :</div>
              <div className="text-right">{formatRupiah(ppn)}</div>

              <div className="text-left font-bold bg-[#f3f4f6] py-1">
                TOTAL INVOICE MUST BE PAID (IDR) :
              </div>
              <div className="text-right font-bold bg-[#f3f4f6] py-1">
                {formatRupiah(totalInvoice)}
              </div>
            </div>
          </div>
        </div>

        {/* Tanda Tangan & Nama Perusahaan - with REMIT TO and ASSOCIATION MEMBER */}
        <div className="flex justify-between items-end mt-8 pt-4 border-t border-[#d1d5db]">
          <div className="text-xs">
            <p className="font-bold">REMIT TO:</p>
            <p>BANK SYARIAH INDONESIA – CINERE BRANCH</p>
            <p>A/C NO. 7089 – 555 – 994</p>
            <p className="font-bold mb-2">A/C NAME: PT. HALUAN DAYA NIAGA</p>
            <p className="font-bold mt-4">ASSOCIATION MEMBER:</p>
            <div className="flex gap-4 mt-2">
              <img src="/1.png" alt="Partner 1" className="h-18 w-auto" />
              <img src="/2.png" alt="Partner 2" className="h-18 w-auto" />
              <img src="/3.png" alt="Partner 3" className="h-17 w-auto" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-15">PT. HALUAN DAYA NIAGA</p>
            <p className="mb-8">
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            </p>
            <p className="font-serif">IRFAN</p>
          </div>
        </div>
      </div>
    </div>
  );
}
