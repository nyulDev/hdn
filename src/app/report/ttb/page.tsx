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
  isTtb: boolean;
  ttbQty?: number | null;
}

interface PenawaranData {
  id: string;
  noQuo: string;
  pt: string;
  noPenawaran: string;
  kapal: string;
}

interface ModalData {
  id: string;
  noQuo: string;
  location: string | null;
  qty: number;
  description: string;
  kodeImpa: string | null;
}

export default function TTBPage() {
  const [filterNoQuo, setFilterNoQuo] = React.useState("");
  const [penawarans, setPenawarans] = React.useState<PenawaranData[]>([]);
  const [quoPpns, setQuoPpns] = React.useState<QuoPpnData[]>([]);
  const [modals, setModals] = React.useState<ModalData[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedItemIds, setSelectedItemIds] = React.useState<string[]>([]);
  const [noPo, setNoPo] = React.useState<string>("");
  const reportRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    fetchPenawarans();
    fetchModals();
  }, []);

  React.useEffect(() => {
    if (quoPpns.length > 0) {
      const nonTtbIds = quoPpns
        .filter((item) => !item.isTtb)
        .map((item) => item.id);
      setSelectedItemIds(nonTtbIds);
    }
  }, [quoPpns]);

  React.useEffect(() => {
    const current = penawarans.find((p) => p.noQuo === filterNoQuo);
    if (current && current.noPenawaran) {
      fetch(`/api/report-inv?noPenawaran=${encodeURIComponent(current.noPenawaran)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.noPo) {
            setNoPo(data.noPo);
          } else {
            setNoPo("");
          }
        })
        .catch(() => setNoPo(""));
    } else {
      setNoPo("");
    }
  }, [filterNoQuo, penawarans]);

  const fetchPenawarans = async () => {
    try {
      const response = await fetch("/api/penawaran");
      const data = await response.json();
      setPenawarans(data);
    } catch (error) {
      console.error("Error fetching penawaran:", error);
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

  const handleFilterChange = async (value: string) => {
    setFilterNoQuo(value);
    setSelectedItemIds([]);
    if (!value) {
      setQuoPpns([]);
      return;
    }

    setIsLoading(true);
    setQuoPpns([]);
    try {
      const response = await fetch(
        `/api/quo-ppn?noQuo=${encodeURIComponent(value.trim())}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Fetched quo-ppn data:", data);
      const validData = Array.isArray(data) ? data : [];
      setQuoPpns(validData);
    } catch (error) {
      console.error("Error fetching quo-ppns:", error);
      setQuoPpns([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!filterNoQuo) return;
    await handleFilterChange(filterNoQuo);
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItemIds((prev) => {
      const alreadySelected = prev.includes(id);
      const next = alreadySelected
        ? prev.filter((itemId) => itemId !== id)
        : [...prev, id];

      const matchingModal = modals.find(
        (m) =>
          m.noQuo === filterNoQuo &&
          m.description === quoPpns.find((x) => x.id === id)?.description,
      );
      const defaultQty = matchingModal?.qty ?? 1;

      // Always keep ttbQty initialized for selected rows
      if (!alreadySelected) {
        setTtbQtyById((prevQty) => ({ ...prevQty, [id]: defaultQty }));
      } else {
        setTtbQtyById((prevQty) => {
          const copy = { ...prevQty };
          delete copy[id];
          return copy;
        });
      }

      return next;
    });
  };

  const toggleSelectAll = () => {
    const pendingCount = quoPpns.filter((item) => !item.isTtb).length;
    if (selectedItemIds.length === pendingCount) {
      setSelectedItemIds([]);
    } else {
      const nonTtbIds = quoPpns
        .filter((item) => !item.isTtb)
        .map((item) => item.id);
      setSelectedItemIds(nonTtbIds);
    }
  };

  const selectedItems = quoPpns.filter((item) =>
    selectedItemIds.includes(item.id),
  );

  const remainingItems = React.useMemo(() => {
    // "Sisa" = item yang belum selesai TTB (tidak ikut di PDF pertama kali)
    // atau item yang masih punya sisa qty berdasarkan ttbQty yang tersimpan.
    // Untuk konsistensi layout, kita tampilkan item yang tidak dipilih.
    return quoPpns
      .filter((item) => !selectedItemIds.includes(item.id))
      .map((item) => {
        const matchingModal = modals.find(
          (m) => m.noQuo === filterNoQuo && m.description === item.description,
        );
        const qty = matchingModal?.qty || 1;
        const alreadyTtbQty = item.ttbQty ?? (item.isTtb ? qty : 0);
        const remainingQty = Math.max(0, qty - alreadyTtbQty);
        return {
          item,
          qty,
          remainingQty,
          kodeImpa: matchingModal?.kodeImpa || item.pn || "00",
        };
      })
      .filter((x) => x.remainingQty > 0);
  }, [quoPpns, selectedItemIds, modals, filterNoQuo]);

  const currentPenawaran = penawarans.find((p) => p.noQuo === filterNoQuo);
  const currentModals = modals.filter((m) => m.noQuo === filterNoQuo);
  const currentLocation =
    currentModals.length > 0 && currentModals[0].location
      ? currentModals[0].location
      : "-";

  const currentYear = new Date().getFullYear();
  const noTTB = filterNoQuo ? `${filterNoQuo}-TTB-${currentYear}` : "-";

  const today = new Date();

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
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Function to remove lab() colors from all styles
  const removeLabColors = (element: HTMLElement) => {
    // Remove lab() from inline styles
    const allElements = element.querySelectorAll("*");
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);

      // Check and fix computed styles
      const colorProps = [
        "color",
        "backgroundColor",
        "borderColor",
        "outlineColor",
      ];
      colorProps.forEach((prop) => {
        const value = computedStyle.getPropertyValue(prop);
        if (
          value &&
          (value.includes("lab(") ||
            value.includes("oklab(") ||
            value.includes("lch("))
        ) {
          // Force set to safe colors
          if (prop === "color") {
            htmlEl.style.setProperty("color", "#000000", "important");
          } else if (prop === "backgroundColor") {
            htmlEl.style.setProperty("backgroundColor", "#ffffff", "important");
          } else if (prop.includes("border")) {
            htmlEl.style.setProperty("borderColor", "#cccccc", "important");
          }
        }
      });

      // Fix inline styles
      if (htmlEl.style.cssText) {
        let newCssText = htmlEl.style.cssText;
        newCssText = newCssText.replace(/lab\([^)]+\)/g, "#000000");
        newCssText = newCssText.replace(/oklab\([^)]+\)/g, "#000000");
        newCssText = newCssText.replace(/lch\([^)]+\)/g, "#000000");
        htmlEl.style.cssText = newCssText;
      }
    });
  };

  const [ttbQtyById, setTtbQtyById] = React.useState<Record<string, number>>(
    {},
  );

  const handleDownloadPDF = async () => {
    if (!reportRef.current || selectedItemIds.length === 0) {
      alert("Pilih minimal satu item untuk Tanda Terima Barang");
      return;
    }

    // Ensure all selected items have ttbQty
    for (const id of selectedItemIds) {
      const q = ttbQtyById[id];
      if (q === undefined || q === null || !Number.isFinite(q) || q <= 0) {
        alert("Masukkan TTB Qty untuk semua item yang dipilih");
        return;
      }
    }

    setIsLoading(true);

    try {
      // Create a clone of the report element
      const originalElement = reportRef.current;
      const cloneElement = originalElement.cloneNode(true) as HTMLElement;

      // Apply style fixes to the clone
      cloneElement.style.position = "absolute";
      cloneElement.style.top = "-9999px";
      cloneElement.style.left = "-9999px";
      cloneElement.style.visibility = "visible";
      document.body.appendChild(cloneElement);

      // Remove lab() colors from the clone
      removeLabColors(cloneElement);

      // Also remove any style tags that might contain lab()
      const styleTags = cloneElement.querySelectorAll("style");
      styleTags.forEach((styleTag) => {
        if (styleTag.textContent) {
          let content = styleTag.textContent;
          content = content.replace(/lab\([^)]+\)/g, "#000000");
          content = content.replace(/oklab\([^)]+\)/g, "#000000");
          content = content.replace(/lch\([^)]+\)/g, "#000000");
          styleTag.textContent = content;
        }
      });

      // Render the clone with html2canvas
      const canvas = await html2canvas(cloneElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        allowTaint: false,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          // Additional cleanup in the cloned document
          const allElementsCloned = clonedDoc.querySelectorAll("*");
          allElementsCloned.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // Remove any lab() colors from computed styles in the cloned document
            const clonedStyles =
              clonedDoc.defaultView?.getComputedStyle(htmlEl);
            if (clonedStyles) {
              const colorValue = clonedStyles.getPropertyValue("color");
              if (
                colorValue &&
                (colorValue.includes("lab(") || colorValue.includes("oklab("))
              ) {
                htmlEl.style.setProperty("color", "#000000", "important");
              }
            }
          });
        },
      });

      // Remove the clone from DOM
      document.body.removeChild(cloneElement);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("portrait", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`TTB-${filterNoQuo || "report"}.pdf`);

      // Update status TTB (partial supported)
      await fetch("/api/quo-ppn/ttb", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: selectedItemIds,
          ttbQtyById: selectedItemIds.reduce(
            (acc: Record<string, number>, id) => {
              acc[id] = ttbQtyById[id];
              return acc;
            },
            {},
          ),
        }),
      });

      // Refresh data
      await handleFilterChange(filterNoQuo);

      alert("PDF berhasil digenerate dan status TTB telah diupdate");
    } catch (error) {
      console.error("PDF error:", error);

      // Fallback: Use window.print as last resort
      try {
        alert("Menggunakan mode cetak sebagai alternatif...");
        window.print();
      } catch (printError) {
        console.error("Print error:", printError);
        alert(
          `Gagal generate PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <form
          onSubmit={handleFilterSubmit}
          className="bg-white shadow-sm border p-4 rounded-md mb-4"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <label className="text-sm font-semibold whitespace-nowrap">
              Filter No. RFS:
            </label>
            <select
              value={filterNoQuo}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Pilih No. RFS...</option>
              {penawarans.map((penawaran) => (
                <option key={penawaran.id} value={penawaran.noQuo}>
                  {penawaran.noQuo} - {penawaran.pt}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isLoading || selectedItemIds.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {isLoading ? "Generating..." : "PDF TTB"}
            </button>
          </div>
        </form>

        {quoPpns.length > 0 && (
          <div className="bg-white shadow-sm border p-4 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-semibold">
                Item untuk TTB ({selectedItemIds.length} /{" "}
                {quoPpns.filter((item) => !item.isTtb).length})
              </h3>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-xs text-blue-600 hover:text-blue-800 underline"
              >
                {selectedItemIds.length ===
                quoPpns.filter((item) => !item.isTtb).length
                  ? "Deselect All"
                  : "Select Pending"}
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto border rounded-md p-2 space-y-2">
              {quoPpns.map((item) => {
                const matchingModal = modals.find(
                  (m) =>
                    m.noQuo === filterNoQuo &&
                    m.description === item.description,
                );
                const qty = matchingModal?.qty || 1;
                const alreadyTtbQty = item.ttbQty ?? (item.isTtb ? qty : 0);
                const remainingQty = Math.max(0, qty - alreadyTtbQty);
                const isCompleted = item.isTtb;
                return (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-50 transition-colors ${
                      isCompleted ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedItemIds.includes(item.id)}
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
                          Sudah TTB
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-600 w-20 text-right">
                        {qty} {item.satuan}
                      </div>
                      <div className="text-xs text-gray-600 whitespace-nowrap">
                        Sisa: {remainingQty} {item.satuan}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="any"
                          min={0}
                          className="w-24 border rounded-md px-2 py-1 text-sm"
                          value={ttbQtyById[item.id] ?? qty}
                          disabled={isCompleted}
                          onChange={(e) => {
                            const raw = e.target.value;
                            const num = raw === "" ? NaN : Number(raw);
                            if (!Number.isFinite(num)) return;
                            if (num > qty) return;
                            setTtbQtyById((prev) => ({
                              ...prev,
                              [item.id]: num,
                            }));
                          }}
                        />
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          TTB
                        </span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Report Container with inline styles to avoid lab() colors */}
      <div
        ref={reportRef}
        className="max-w-4xl mx-auto bg-white border shadow-lg p-8"
        style={{
          color: "#000000",
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb",
        }}
      >
        <div
          className="border-b pb-4 mb-4 relative"
          style={{ borderBottomColor: "#e5e7eb" }}
        >
          <img
            src="/logotok.png"
            alt="Logo"
            className="absolute top-0 right-0 w-20 h-20"
          />
          <h1 className="text-3xl font-bold">
            <span style={{ color: "#16a34a" }}>H</span>
            <span style={{ color: "#1e3a8a" }}>ALUAN </span>
            <span style={{ color: "#16a34a" }}>D</span>
            <span style={{ color: "#1e3a8a" }}>AYA </span>
            <span style={{ color: "#16a34a" }}>N</span>
            <span style={{ color: "#1e3a8a" }}>IAGA, PT.</span>
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: "#4b5563" }}>
            <span style={{ color: "#16a34a" }}>
              Marine - Oil & Gas - Mining Services
            </span>
          </p>
          <p className="text-xs font-mono mt-1" style={{ color: "#6b7280" }}>
            NPWP : 073.121.453.2-012.000
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-xs mb-6">
          <div>
            <p className="font-semibold" style={{ color: "#000000" }}>
              Gd. One Pacific Place, Level 11-SCBD
            </p>
            <p style={{ color: "#4b5563" }}>
              Jl. Jend. Sudirman Kav. 52-53, Jak-Sei 12190
            </p>
            <p style={{ color: "#4b5563" }}>
              Ph./Fax. 021-21275897-7538093 ; HPWA: 0811-821723
            </p>
            <p style={{ color: "#4b5563" }}>
              Email : sales@haluan.id / haluan.group@yahoo.co.id
            </p>
          </div>
          <div>
            <p className="font-semibold" style={{ color: "#000000" }}>
              Workshop:
            </p>
            <p style={{ color: "#4b5563" }}>Cinere Residence H1 No. 5</p>
            <p style={{ color: "#4b5563" }}>Depok Meruyung Jawa Barat 16515</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2
            className="text-4xl font-bold border-b-2 pb-4 px-8 inline-block tracking-widest"
            style={{ color: "#dc2626", borderBottomColor: "#000000" }}
          >
            TANDA TERIMA BARANG
          </h2>
        </div>

        <div className="flex justify-between mb-4 text-sm">
          <div className="text-xs space-y-1">
            <div className="flex gap-2">
              <span className="font-bold w-28" style={{ color: "#000000" }}>
                Tanggal
              </span>
              <span style={{ color: "#000000" }}>: {formatDate(today)}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-28" style={{ color: "#000000" }}>
                PT
              </span>
              <span style={{ color: "#000000" }}>
                : {currentPenawaran?.pt || "-"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-28" style={{ color: "#000000" }}>
                Kapal
              </span>
              <span style={{ color: "#000000" }}>
                : {currentPenawaran?.kapal || "-"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-28" style={{ color: "#000000" }}>
                No. TTB
              </span>
              <span style={{ color: "#000000" }}>: {noTTB}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-28" style={{ color: "#000000" }}>
                No. RFS
              </span>
              <span style={{ color: "#000000" }}>
                : {currentPenawaran?.noPenawaran || "-"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-28" style={{ color: "#000000" }}>
                No. PO
              </span>
              <span style={{ color: "#000000" }}>
                : {noPo || "-"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="font-bold w-28" style={{ color: "#000000" }}>
                Lokasi
              </span>
              <span style={{ color: "#000000" }}>: {currentLocation}</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mb-4">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr
                className="border-y"
                style={{ backgroundColor: "#f3f4f6", borderColor: "#e5e7eb" }}
              >
                <th
                  className="text-left py-2 px-3 font-semibold"
                  style={{ color: "#000000" }}
                >
                  No
                </th>
                <th
                  className="text-left py-2 px-3 font-semibold"
                  style={{ color: "#000000" }}
                >
                  CODE
                </th>
                <th
                  className="text-left py-2 px-3 font-semibold"
                  style={{ color: "#000000" }}
                >
                  Description
                </th>
                <th
                  className="text-left py-2 px-3 font-semibold"
                  style={{ color: "#000000" }}
                >
                  Quantity
                </th>
                <th
                  className="text-left py-2 px-3 font-semibold"
                  style={{ color: "#000000" }}
                >
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.length > 0 ? (
                selectedItems.map((item, index) => {
                  const matchingModal = modals.find(
                    (m) =>
                      m.noQuo === filterNoQuo &&
                      m.description === item.description,
                  );
                  const qty = matchingModal?.qty || 1;
                  const kodeImpa = matchingModal?.kodeImpa || item.pn || "00";
                  const displayQty = ttbQtyById[item.id] ?? item.ttbQty ?? qty;
                  return (
                    <tr
                      key={item.id}
                      className="border-b"
                      style={{ borderBottomColor: "#e5e7eb" }}
                    >
                      <td className="py-2 px-3" style={{ color: "#000000" }}>
                        {index + 1}
                      </td>
                      <td className="py-2 px-3" style={{ color: "#000000" }}>
                        {kodeImpa}
                      </td>
                      <td className="py-2 px-3" style={{ color: "#000000" }}>
                        {item.description}
                      </td>
                      <td className="py-2 px-3" style={{ color: "#000000" }}>
                        {displayQty} {item.satuan}
                      </td>
                      <td className="py-2 px-3" style={{ color: "#000000" }}>
                        -
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm"
                    style={{ color: "#6b7280" }}
                  >
                    {filterNoQuo
                      ? "Pilih item untuk TTB"
                      : "Pilih No. RFS dulu"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {remainingItems.length > 0 && (
          <div className="mt-6 mb-4">
            <div
              className="text-xs font-semibold mb-2"
              style={{ color: "#000000" }}
            >
              SISA BARANG (belum TTB)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr
                    className="border-y"
                    style={{
                      backgroundColor: "#f3f4f6",
                      borderColor: "#e5e7eb",
                    }}
                  >
                    <th
                      className="text-left py-2 px-3"
                      style={{ color: "#000000" }}
                    >
                      CODE
                    </th>
                    <th
                      className="text-left py-2 px-3"
                      style={{ color: "#000000" }}
                    >
                      Description
                    </th>
                    <th
                      className="text-left py-2 px-3"
                      style={{ color: "#000000" }}
                    >
                      Sisa
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {remainingItems.map((x) => (
                    <tr
                      key={x.item.id}
                      className="border-b"
                      style={{ borderBottomColor: "#e5e7eb" }}
                    >
                      <td className="py-2 px-3" style={{ color: "#000000" }}>
                        {x.kodeImpa}
                      </td>
                      <td className="py-2 px-3" style={{ color: "#000000" }}>
                        {x.item.description}
                      </td>
                      <td className="py-2 px-3" style={{ color: "#000000" }}>
                        {x.remainingQty} {x.item.satuan}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div
          className="flex justify-between pt-8 border-t items-end"
          style={{ borderTopColor: "#e5e7eb" }}
        >
          <div className="text-xs space-y-2">
            <div className="flex gap-2">
              <img src="/4nbg.png" alt="" className="h-20 w-auto mr-2" />
              <img src="/5.png" alt="" className="h-20 w-auto mr-2" />
              <img src="/6.png" alt="" className="h-20 w-auto mr-2" />
            </div>
          </div>
          <div className="text-center">
            <p className="font-bold text-sm mb-12" style={{ color: "#000000" }}>
              Diterima Oleh,
            </p>
            <p className="font-serif text-lg" style={{ color: "#000000" }}>
              __________________
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
