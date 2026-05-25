"use client";

import * as React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Types for the data
// Modal item data from modal table
interface ModalData {
  id: string;
  pt: string | null;
  noQuo: string;
  noPenawaran: string; // Added noPenawaran
  kodeImpa: string | null;
  pn: string | null;
  description: string;
  location: string | null;
  qty: number;
  satuan: string;
  unitPrice: number;
  nilaiAktual?: number;
  amount: number;
  tanggal: string | null;
  createdAt: string;
  namaToko: string | null;
}

// ModalCost data - actual calculated values
interface ModalCostData {
  id: string;
  noQuo: string;
  discount: number | null;
  totalModalSperpart: number | null;
  bankCharge: number | null;
  packingCost: number | null;
  deliveryDutyTax: number | null;
  deliveryDutyTaxPercent: number | null;
  deliveryAirDHL: number | null;
  deliveryAirDoorToDoor: number | null;
  deliverySeaResmi: number | null;
  deliverySeaDoorToDoor: number | null;
  deliveryLocalCost: number | null;
  feeKurir: number | null;
  otherCostTruck: number | null;
  otherCostServiceBoat: number | null;
  otherCostLainLain: number | null;
  hsi: number | null;
  createdAt: string;
}

export default function ModalAktualReportPage() {
  const [filterNoRfs, setFilterNoRfs] = React.useState("");
  const [modals, setModals] = React.useState<ModalData[]>([]);
  const [modalCosts, setModalCosts] = React.useState<ModalCostData[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [uniqueRfsList, setUniqueRfsList] = React.useState<
    { noPenawaran: string; pt: string; noQuo: string }[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  // Fetch penawarans for dropdown
  React.useEffect(() => {
    fetchModals();
  }, []);

  // Removed fetchPenawarans - using modals data instead

  // Removed fetchCustomers - derive from modals data

  const fetchModals = async () => {
    try {
      const [modalRes, penawaranRes, customerRes] = await Promise.all([
        fetch("/api/modal?isAktual=true"),
        fetch("/api/penawaran"),
        fetch("/api/customer"),
      ]);

      const data: ModalData[] = await modalRes.json();
      const penawarans: any[] = await penawaranRes.json();
      const customersData: any[] = await customerRes.json();
      setModals(data);
      setCustomers(customersData);

      // Extract unique noPenawaran/pt/noQuo for dropdown
      const uniqueList = Array.from(
        new Map(
          data
            .filter((item) => item.noPenawaran)
            .map((item) => {
              // Try to get PT from the item first, then from penawaran table
              let ptName = item.pt || "";
              if (!ptName) {
                const p = penawarans.find(
                  (pen) => pen.noPenawaran === item.noPenawaran,
                );
                ptName = p?.pt || "";
              }

              return [
                item.noPenawaran,
                {
                  noPenawaran: item.noPenawaran,
                  pt: ptName,
                  noQuo: item.noQuo,
                },
              ];
            }),
        ).values(),
      ).sort((a, b) =>
        (a.noPenawaran || "").localeCompare(b.noPenawaran || ""),
      );

      setUniqueRfsList(uniqueList);
    } catch (error) {
      console.error("Error fetching modals:", error);
    }
  };

  // fetchModalCosts moved to handleFilterChange

  // Handle filter change - now fetches only aktual data
  const fetchModalCostForQuo = async (noQuo: string) => {
    try {
      const response = await fetch(
        `/api/modal-aktual-cost?noQuo=${encodeURIComponent(noQuo)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setModalCosts(data);
      }
    } catch (error) {
      console.error("Error fetching modal cost:", error);
    }
  };

  const handleFilterChange = async (noPenawaran: string) => {
    setFilterNoRfs(noPenawaran);
    setModalCosts([]); // Reset costs

    if (!noPenawaran) {
      return;
    }

    setIsLoading(true);
    try {
      const modalResponse = await fetch(
        `/api/modal?noPenawaran=${encodeURIComponent(noPenawaran)}&isAktual=true`,
      );
      if (!modalResponse.ok) {
        throw new Error(`HTTP error! status: ${modalResponse.status}`);
      }
      const modalData = await modalResponse.json();
      const currentNoQuo = modalData[0]?.noQuo;

      if (currentNoQuo) {
        await fetchModalCostForQuo(currentNoQuo);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  // Get filtered modals based on selected noPenawaran
  const filteredModals = filterNoRfs
    ? modals.filter((m) => m.noPenawaran === filterNoRfs)
    : [];

  // Get modal cost data
  const currentModalCost = modalCosts[0] || null;

  // Calculate financial summary from modal items
  const subTotal = filteredModals.reduce((sum, item) => sum + item.amount, 0);

  // Get actual cost values from ModalCost table
  const totalDiscount = currentModalCost?.discount || 0;
  const totalModalSperpart = currentModalCost?.totalModalSperpart || 0;
  const totalBankCharge = currentModalCost?.bankCharge || 0;
  const totalPackingCost = currentModalCost?.packingCost || 0;
  // Duty Tax = (ModalCost.deliveryDutyTaxPercent % / 100) * Sub Total Amount from report modal
  const totalDeliveryDutyTax =
    ((currentModalCost?.deliveryDutyTaxPercent || 0) / 100) * subTotal;
  const totalDeliveryAirDHL = currentModalCost?.deliveryAirDHL || 0;
  const totalDeliveryAirDoorToDoor =
    currentModalCost?.deliveryAirDoorToDoor || 0;
  const totalDeliverySeaResmi = currentModalCost?.deliverySeaResmi || 0;
  const totalDeliverySeaDoorToDoor =
    currentModalCost?.deliverySeaDoorToDoor || 0;
  const totalDeliveryLocalCost = currentModalCost?.deliveryLocalCost || 0;
  const totalFeeKurir = currentModalCost?.feeKurir || 0;
  const totalOtherCostTruck = currentModalCost?.otherCostTruck || 0;
  const totalOtherCostServiceBoat = currentModalCost?.otherCostServiceBoat || 0;
  const totalOtherCostLainLain = currentModalCost?.otherCostLainLain || 0;
  const totalHsi = currentModalCost?.hsi || 0;

  const totalAllCost =
    -totalDiscount +
    totalBankCharge +
    totalPackingCost +
    totalDeliveryDutyTax +
    totalDeliveryAirDHL +
    totalDeliveryAirDoorToDoor +
    totalDeliverySeaResmi +
    totalDeliverySeaDoorToDoor +
    totalDeliveryLocalCost +
    totalFeeKurir +
    totalOtherCostTruck +
    totalOtherCostServiceBoat +
    totalOtherCostLainLain;

  const totalModal = subTotal + totalAllCost;

  // Derive PT and customer from first modal item
  const currentPt =
    filteredModals.length > 0
      ? filteredModals[0].pt || "PT. ANDHIKA LINES"
      : "PT. ANDHIKA LINES";
  const currentCustomerId = React.useMemo(() => {
    if (!filterNoRfs || !currentPt || customers.length === 0) return "-";
    const customer = customers.find(
      (c) => c.ptMv?.toLowerCase() === currentPt.toLowerCase(),
    );
    return customer?.customerId || "-";
  }, [currentPt, customers]);

  // Get unique P/N values from modals
  const uniquePns = [
    ...new Set(filteredModals.map((m) => m.pn).filter((pn) => pn)),
  ];
  const pnValues = uniquePns.join(", ");

  // Get current location from modals
  const currentLocation =
    filteredModals.length > 0 && filteredModals[0].location
      ? filteredModals[0].location
      : "-";

  // Generate No. QUO (for report title/header)
  const currentYear = new Date().getFullYear();
  const reportNoQuo = filteredModals[0]
    ? `${filteredModals[0].noQuo}-MODAL-AKTUAL-${currentYear}`
    : "-";

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

  const formatRupiah = (num: number) => {
    return num.toLocaleString("id-ID");
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    setIsLoading(true);
    try {
      const element = reportRef.current;
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
      pdf.save(`MODAL-AKTUAL-${filterNoRfs || "report"}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Gagal mengunduh PDF");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans print:bg-white print:p-0 print:min-h-0">
      {/* Filter No. RFS - Outside the invoice paper */}
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
              {uniqueRfsList.map((item) => (
                <option key={item.noPenawaran} value={item.noPenawaran}>
                  {item.noPenawaran} - {item.pt}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isLoading || !filterNoRfs}
              className="px-4 py-2 bg-[#21ae43] text-white text-sm font-medium rounded-md hover:bg-[#1a8f38] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Generating..." : "PDF"}
            </button>
          </div>
        </form>
      </div>

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
        {/* Baris Informasi Atas (NO, CUSTOMER ID, DATE, PAGE, LOCATION) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs border border-[#d1d5db] p-2 mb-4 bg-[#f9fafb]">
          <div>
            <span className="font-bold">NO</span>
            <br />
            {reportNoQuo}
          </div>
          <div>
            <span className="font-bold">CUSTOMER ID</span>
            <br />
            {currentCustomerId}
          </div>
          <div>
            <span className="font-bold">DATE</span>
            <br />
            {filterNoRfs ? formatDate(today) : "-"}
          </div>
          <div>
            <span className="font-bold">SUPPLAY LOCATION</span>
            <br />
            {currentLocation}
          </div>
        </div>

        {/* Data Customer & Kapal */}
        <div className="mb-4 text-sm">
          <p className="font-bold">{currentPt}</p>
          <p className="text-xs">{pnValues}</p>
        </div>

        {/* Tabel Item Modal */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#f3f4f6] border-t border-b border-[#9ca3af]">
                <th className="text-left py-2 px-1">No</th>
                <th className="text-left py-2 px-1">CODE</th>
                <th className="text-left py-2 px-1">Description</th>
                <th className="text-left py-2 px-1">Quantity</th>
                <th className="text-left py-2 px-1">Nama Toko</th>
                <th className="text-left py-2 px-1">Unit Price</th>
                <th className="text-left py-2 px-1">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filteredModals.length > 0 ? (
                filteredModals.map((item, index) => (
                  <tr key={item.id} className="border-b border-[#e5e7eb]">
                    <td className="py-2 px-1 align-top">{index + 1}</td>
                    <td className="py-2 px-1 align-top">
                      {item.kodeImpa || item.pn || "00"}
                    </td>
                    <td className="py-2 px-1 align-top">
                      {item.description || "-"}
                    </td>
                    <td className="py-2 px-1 align-top">
                      {item.qty} {item.satuan}
                    </td>
                    <td className="py-2 px-1 align-top">
                      {item.namaToko || "-"}
                    </td>
                    <td className="py-2 px-1 align-top">
                      {formatRupiah(item.nilaiAktual || item.unitPrice)}
                    </td>
                    <td className="py-2 px-1 align-top">
                      {formatRupiah(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="border-b border-[#e5e7eb]">
                  <td colSpan={7} className="py-4 text-center text-[#6b7280]">
                    {filterNoRfs
                      ? "Tidak ada data untuk No. RFS yang dipilih"
                      : "Pilih No. RFS untuk menampilkan data"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* RINGKASAN BIAYA & FINANCIAL SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Kiri: Ringkasan Biaya */}
          <div className="text-xs">
            <p className="font-bold text-sm mb-2">RINGKASAN BIAYA:</p>
            <div className="border border-[#d1d5db] p-2">
              <div className="grid grid-cols-2 gap-1">
                <div className="text-left">Sub Total Amount :</div>
                <div className="text-right font-semibold">
                  {formatRupiah(subTotal)}
                </div>

                <div className="text-left">Discount :</div>
                <div className="text-right font-semibold text-[#dc2626]">
                  {formatRupiah(totalDiscount)}
                </div>

                <div className="text-left">Bank Charge :</div>
                <div className="text-right">
                  {formatRupiah(totalBankCharge)}
                </div>

                <div className="text-left">Packing Cost :</div>
                <div className="text-right">
                  {formatRupiah(totalPackingCost)}
                </div>

                <div className="text-left border-t border-[#d1d5db] mt-1 pt-1 font-bold">
                  Total Delivery :
                </div>
                <div className="text-right border-t border-[#d1d5db] mt-1 pt-1 font-semibold">
                  {formatRupiah(
                    totalDeliveryDutyTax +
                      totalDeliveryAirDHL +
                      totalDeliveryAirDoorToDoor +
                      totalDeliverySeaResmi +
                      totalDeliverySeaDoorToDoor +
                      totalDeliveryLocalCost,
                  )}
                </div>

                <div className="text-left text-xs col-span-2">
                  <p>
                    Duty Tax ({currentModalCost?.deliveryDutyTaxPercent || 0}%):{" "}
                    {formatRupiah(totalDeliveryDutyTax)}
                  </p>
                  <p>- AIR (DHL): {formatRupiah(totalDeliveryAirDHL)}</p>
                  <p>
                    - AIR (Door to Door):{" "}
                    {formatRupiah(totalDeliveryAirDoorToDoor)}
                  </p>
                  <p>- SEA (RESMI): {formatRupiah(totalDeliverySeaResmi)}</p>
                  <p>
                    - SEA (Door to Door):{" "}
                    {formatRupiah(totalDeliverySeaDoorToDoor)}
                  </p>
                  <p>- Local Cost: {formatRupiah(totalDeliveryLocalCost)}</p>
                </div>

                <div className="text-left">Fee Kurir :</div>
                <div className="text-right">{formatRupiah(totalFeeKurir)}</div>

                <div className="text-left">HSI - 2 Bulan :</div>
                <div className="text-right">{formatRupiah(totalHsi)}</div>

                <div className="text-left border-t border-[#d1d5db] mt-1 pt-1 font-bold">
                  Total Other Cost :
                </div>
                <div className="text-right border-t border-[#d1d5db] mt-1 pt-1 font-semibold">
                  {formatRupiah(
                    totalOtherCostTruck +
                      totalOtherCostServiceBoat +
                      totalOtherCostLainLain,
                  )}
                </div>

                <div className="text-left text-xs col-span-2">
                  <p>- Truck: {formatRupiah(totalOtherCostTruck)}</p>
                  <p>
                    - Service Boat: {formatRupiah(totalOtherCostServiceBoat)}
                  </p>
                  <p>- Lain-lain: {formatRupiah(totalOtherCostLainLain)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* kanan: Total Summary */}
          <div className="text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-left">Sub Total :</div>
              <div className="text-right font-semibold">
                {formatRupiah(subTotal)}
              </div>

              <div className="text-left">Total Biaya Lain :</div>
              <div className="text-right">{formatRupiah(totalAllCost)}</div>

              <div className="text-left font-bold bg-[#f3f4f6] py-1">
                TOTAL MODAL AKTUAL (IDR) :
              </div>
              <div className="text-right font-bold bg-[#f3f4f6] py-1">
                {formatRupiah(totalModal)}
              </div>
            </div>
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="flex justify-end mt-8 pt-4 border-t border-[#d1d5db]">
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
