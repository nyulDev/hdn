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
  unitPriceNew: number;
  totalNew: number;
  qty?: number;
}

interface PenawaranData {
  id: string;
  noQuo: string;
  pt: string;
  noPenawaran: string;
  kapal: string;
  namaMesin: string | null;
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
  location: string | null;
  qty: number;
  description: string;
  kodeImpa: string | null;
  pn: string | null;
}

export default function QUOPage() {
  // State for filter
  const [filterNoRfs, setFilterNoRfs] = React.useState("");
  const [delivery, setDelivery] = React.useState(
    "4 working days after confirmation order",
  );
  const [draftItems, setDraftItems] = React.useState<
    Array<{
      id: string;
      description: string;
      qty: number;
      satuan: string;
      unitPriceNew: number;
      totalNew: number;
      kodeImpa: string | null;
      pn: string;
      noQuo: string;
      noPt: string;
      noPenawaran: string;
      tanggal: string | null;
    }>
  >([]);
  const [note, setNote] = React.useState<string>("");

  const [price, setPrice] = React.useState(
    "Jakarta, exclude service boat and entry permit",
  );
  const [pnValues, setPnValues] = React.useState("");
  const [discount, setDiscount] = React.useState<number>(0);
  const [penawarans, setPenawarans] = React.useState<PenawaranData[]>([]);
  const [customers, setCustomers] = React.useState<CustomerData[]>([]);
  const [quoPpns, setQuoPpns] = React.useState<QuoPpnData[]>([]);
  const [modals, setModals] = React.useState<ModalData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [sktd, setSktd] = React.useState(false);
  const [revisi, setRevisi] = React.useState<number>(0); // 0 = no revision, 1..n = Revisi Rn
  const [totalPages, setTotalPages] = React.useState(1);
  const reportRef = React.useRef<HTMLDivElement>(null);

  // Fetch penawarans for dropdown
  React.useEffect(() => {
    fetchPenawarans();
    fetchModals();
    fetchCustomers();
  }, []);

  // Get current penawaran (used by multiple effects)
  const currentPenawaran = React.useMemo(() => {
    return penawarans.find((p) => p.noPenawaran === filterNoRfs);
  }, [penawarans, filterNoRfs]);

  // Get current location from modals based on derived noQuo
  const currentModals = React.useMemo(() => {
    return modals.filter((m) => m.noQuo === currentPenawaran?.noQuo);
  }, [modals, currentPenawaran?.noQuo]);

  const currentLocation =
    filterNoRfs && currentModals.length > 0 && currentModals[0].location
      ? currentModals[0].location
      : "-";

  // Extract P/N values when modals or filterNoRfs changes
  React.useEffect(() => {
    if (!filterNoRfs) {
      setPnValues("");
      return;
    }
    if (!currentPenawaran?.noQuo || modals.length === 0) return;

    const filteredModals = modals.filter(
      (m) => m.noQuo === currentPenawaran.noQuo,
    );
    const uniquePns = [
      ...new Set(filteredModals.map((m) => m.pn).filter((pn) => pn)),
    ];
    setPnValues(uniquePns.join(", "));
  }, [modals, filterNoRfs, currentPenawaran?.noQuo]);

  // Fetch saved report quo data when filterNoRfs changes
  React.useEffect(() => {
    const noQuoValue = currentPenawaran?.noQuo;
    if (noQuoValue) {
      fetchSavedReportQuo(noQuoValue);
      return;
    }

    // reset defaults when no selection or penawaran mapping missing
    setDelivery("4 working days after confirmation order");
    setPrice("Jakarta, exclude service boat and entry permit");
    setDiscount(0);
    setNote("");
  }, [filterNoRfs, currentPenawaran?.noQuo]);

  // Fetch saved report quo data
  const fetchSavedReportQuo = async (noQuoValue: string) => {
    try {
      const response = await fetch(
        `/api/report-quo?noQuo=${encodeURIComponent(noQuoValue)}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data) {
          if (data.delivery) {
            setDelivery(data.delivery);
          } else {
            setDelivery("4 working days after confirmation order");
          }
          if (data.price) {
            setPrice(data.price);
          } else {
            setPrice("Jakarta, exclude service boat and entry permit");
          }
          setDiscount(data.discount || 0);
          if (typeof data.note === "string") {
            setNote(data.note);
          } else {
            setNote("");
          }
        }
      }
    } catch (error) {
      console.error("Error fetching saved report-quo:", error);
    }
  };

  // Save report quo data
  const handleSave = async () => {
    const selectedPenawaran = penawarans.find(
      (p) => p.noPenawaran === filterNoRfs,
    );
    const noQuoValue = selectedPenawaran?.noQuo;
    if (!noQuoValue) return;

    setIsSaving(true);
    try {
      const response = await fetch("/api/report-quo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noQuo: noQuoValue,
          delivery: delivery,
          price: price,
          discount: discount,
          note: note,
        }),
      });

      if (response.ok) {
        alert("Data berhasil disimpan!");
      } else {
        alert("Gagal menyimpan data");
      }
    } catch (error) {
      console.error("Error saving report-quo:", error);
      alert("Gagal menyimpan data");
    } finally {
      setIsSaving(false);
    }
  };

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

  // Handle filter change - auto fetch when No. QUO is selected
  const handleFilterChange = async (value: string) => {
    setFilterNoRfs(value);

    const selectedPenawaran = penawarans.find((p) => p.noPenawaran === value);
    const noQuoValue = selectedPenawaran?.noQuo;

    // Extract P/N values from modals when noQuo changes
    if (noQuoValue) {
      const filteredModals = modals.filter((m) => m.noQuo === noQuoValue);
      const uniquePns = [
        ...new Set(filteredModals.map((m) => m.pn).filter((pn) => pn)),
      ];
      setPnValues(uniquePns.join(", "));
    } else {
      setPnValues("");
    }

    if (!noQuoValue) {
      setQuoPpns([]);
      return;
    }

    setIsLoading(true);
    setQuoPpns([]); // Clear previous data
    try {
      const response = await fetch(
        `/api/quo-ppn?noQuo=${encodeURIComponent(noQuoValue.trim())}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched quo-ppn data:", data);
      console.log("Filter noQuo:", noQuoValue);
      console.log("Data length:", data.length);

      // Ensure data is an array
      const validData = Array.isArray(data) ? data : [];
      setQuoPpns(validData);

      if (validData.length === 0) {
        console.log(
          "No data found for this noQuo. Please check if quo-ppn data exists for:",
          noQuoValue,
        );
      }
    } catch (error) {
      console.error("Error fetching quo-ppns:", error);
      setQuoPpns([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter submission (for button click - kept for compatibility)
  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterNoRfs) return;
    await handleFilterChange(filterNoRfs);
  };

  // Calculate financial summary
  const subTotal = quoPpns.reduce((sum, item) => sum + (item.totalNew || 0), 0);
  const discountAmount = subTotal > 0 ? discount : 0;
  const totalAfterDiscount = subTotal - discountAmount;
  const dpp = Math.round((11 / 12) * totalAfterDiscount); // DPP = 11/12 * Total after discount (rounded)
  const ppn = Math.round(0.12 * dpp); // PPN 12% = 12% * DPP (rounded)
  const totalInvoice = sktd ? totalAfterDiscount : totalAfterDiscount + ppn;

  // Get current customer based on PT name matching
  const currentCustomer = customers.find(
    (c) => c.ptMv?.toLowerCase() === currentPenawaran?.pt?.toLowerCase(),
  );

  // Get current date for invoice
  const today = new Date();

  // Generate No. QUO (with Revision)
  const year = today.getFullYear();
  const dept = (currentPenawaran as any)?.departemen || "-";
  const baseNo = currentPenawaran?.noQuo || filterNoRfs || "-";
  // Rule:
  // - Revis i=0  => No-Dept-Tahun
  // - Revis i>0 => No-R{n}-Dept-Tahun
  const noINV =
    revisi > 0
      ? `${baseNo}-R${revisi}-${dept}-${year}`
      : `${baseNo}-${dept}-${year}`;

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

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsLoading(true);
    try {
      const element = reportRef.current;

      // Calculate total pages based on content height
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

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`QUO-${filterNoRfs || "report"}.pdf`);
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
              htmlFor="noQuo"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Filter No. RFS :
            </label>
            <select
              id="noQuo"
              value={filterNoRfs}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Pilih No. QUO...</option>
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
              {isSaving ? "Saving..." : "Save"}
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

          {/* Discount Input Fields */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
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
            <input
              id="sktd"
              type="checkbox"
              checked={sktd}
              onChange={(e) => setSktd(e.target.checked)}
              className="w-4 h-4 accent-blue-600 cursor-pointer"
            />
            <label
              htmlFor="sktd"
              className="text-sm font-semibold cursor-pointer select-none"
            >
              SKTD
            </label>
            {sktd && (
              <span className="text-xs text-blue-600 ml-1">
                (Total = Total after discount, tanpa PPN)
              </span>
            )}
          </div>

          {/* Revisi Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <label className="text-sm font-semibold whitespace-nowrap">
              Revisi :
            </label>

            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((n) => (
                <label key={n} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="revisi"
                    checked={revisi === n}
                    onChange={() => setRevisi(n)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                  <span className="whitespace-nowrap">
                    {n === 0 ? "Revisi 0" : `Revisi ${n}`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Note, Delivery and Price Input Fields */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <label
              htmlFor="note"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Note :
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder=""
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y min-h-[72px]"
            />

            <label
              htmlFor="delivery"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Delivery :
            </label>
            <input
              id="delivery"
              type="text"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              placeholder="e.g. 4 working days..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label
              htmlFor="price"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Price :
            </label>
            <input
              id="price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. Jakarta, exclude..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Delivery and Price Input Fields (deprecated layout) */}
          <div className="hidden">
            <label
              htmlFor="delivery"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Delivery :
            </label>
            <input
              id="delivery"
              type="text"
              value={delivery}
              onChange={(e) => setDelivery(e.target.value)}
              placeholder="e.g. 4 working days..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <label
              htmlFor="price"
              className="text-sm font-semibold whitespace-nowrap"
            >
              Price :
            </label>
            <input
              id="price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. Jakarta, exclude..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>
      </div>

      {/* Kertas QUOTATION */}
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
            <p>Jl. Jend. Sudirman Kav. 52-53, Jak-Sei 12190</p>
            <p>Ph./Fax. 021-21275897-7538093 ; HPWA: 0811-821723</p>
            <p> Email : sales@haluan.id / haluan.group@yahoo.co.id </p>
          </div>
          <div>
            <p className="font-semibold ml-50">Workshop:</p>
            <p className="ml-50">Cinere Residence H1 No. 5</p>
            <p className="ml-50">Depok Meruyung Jawa Barat 16515</p>
          </div>
        </div>

        {/* Judul QUOTATION */}
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold tracking-widest text-[#b91c1c] border-b-2 border-[#d1d5db] inline-block px-8 pb-4">
            QUOTATION
          </h2>
        </div>

        {/* Data Customer & Header Info Tergabung */}
        <div className="flex justify-between items-start mb-4 text-sm">
          {/* Data Customer Kiri */}
          <div>
            <p className="font-bold">{currentPenawaran?.pt || "-"}</p>
            <p className="text-xs">{currentPenawaran?.noPenawaran || "-"}</p>
            <p className="text-xs">{currentPenawaran?.kapal || "-"}</p>
            {currentPenawaran?.namaMesin && (
              <p className="text-xs">{currentPenawaran.namaMesin}</p>
            )}
          </div>

          {/* Data Dokumen Kanan */}
          <div className="text-xs flex flex-col gap-1 w-70">
            <div className="flex justify-between">
              <span className="font-bold w-32">NO</span>
              <span className="w-40">: {noINV}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold w-32">CUSTOMER ID</span>
              <span className="w-40">
                : {currentCustomer?.customerId || "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold w-32">DATE</span>
              <span className="w-40">
                : {filterNoRfs ? formatDate(today) : "-"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold w-32">PAGE</span>
              <span className="w-40">: {filterNoRfs ? totalPages : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold w-32">SUPPLAY LOCATION</span>
              <span className="w-40">: {currentLocation}</span>
            </div>
          </div>
        </div>

        {/* Tabel Item (read-only untuk layout PDF) */}
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
              {quoPpns.length > 0 ? (
                quoPpns.map((item, index) => {
                  // Qty mengikuti data QUO PPN (source of truth)
                  const matchingModal = modals.find(
                    (m) =>
                      m.noQuo === currentPenawaran?.noQuo &&
                      m.description === item.description,
                  );

                  const qty = item.qty ?? 1;
                  // CODE IMPA bisa tetap diambil dari modal jika tersedia, fallback ke item.pn
                  const kodeImpa = matchingModal?.kodeImpa || item.pn || "00";
                  return (
                    <tr key={item.id} className="border-b border-[#e5e7eb]">
                      <td className="py-2 px-1 align-top">{index + 1}</td>
                      <td className="py-2 px-1 align-top">{kodeImpa}</td>
                      <td className="py-2 px-1 align-top">
                        {item.description || "-"}
                      </td>
                      <td className="py-2 px-1 align-top">
                        {qty} {item.satuan}
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
                      ? "Tidak ada data untuk No. RFS yang dipilih"
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
            <p className="font-semibold text-xs mb-2">
              #
              Note&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <span
                style={{
                  whiteSpace: "pre-line",
                  display: "inline-block",
                  width: "100%",
                }}
              >
                {note || "-"}
              </span>
            </p>
            <p className="font-semibold text-xs mb-2">
              #
              Delivery&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              : {delivery}
            </p>

            <p className="font-semibold text-xs mb-2">
              #
              Price&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              : {price}
            </p>
            <p className="font-semibold text-xs mb-2">
              #
              Payment&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;:
              30 calender days after delivery
            </p>
            <p className="font-semibold text-xs mb-2">
              # Stock Validity&nbsp; : Not binding
            </p>
            <p className="font-semibold text-xs mb-2">
              # Price Validity&nbsp;&nbsp;&nbsp;: 3 calender days
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
                TOTAL QUOTATION MUST BE PAID (IDR) :
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
            {/* <p className="font-bold">REMIT TO:</p>
            <p>BANK SYARIAH INDONESIA – CINERE BRANCH</p>
            <p>A/C NO. 7089 – 555 – 994</p>
            <p className="font-bold mb-2">A/C NAME: PT. HALUAN DAYA NIAGA</p> */}
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
