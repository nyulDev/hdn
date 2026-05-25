"use client";

import * as React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Types for the data
interface ModalData {
  id: string;
  pt: string | null;
  noQuo: string;
  noPenawaran: string;
  kodeImpa: string | null;
  pn: string | null;
  description: string;
  location: string | null;
  namaToko?: string | null;
  qty: number;
  satuan: string;
  unitPrice: number;
  amount: number;
  displayAmount?: number;
  displayUnitPrice?: number;
  isAktual?: boolean;
  nilaiAktual?: number;
  tanggal: string | null;
  createdAt: string;
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

export default function ModalReportPage() {
  const [filterNoRfs, setFilterNoRfs] = React.useState("");
  const [allModals, setAllModals] = React.useState<ModalData[]>([]);
  const [modals, setModals] = React.useState<ModalData[]>([]);
  const [modalCosts, setModalCosts] = React.useState<ModalCostData[]>([]);
  const [customers, setCustomers] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const reportRef = React.useRef<HTMLDivElement>(null);

  // Derive unique RFS list from allModals (no duplicates)
  const uniqueRfsList = React.useMemo(() => {
    const map = new Map<string, { noPenawaran: string; pt: string }>();
    allModals.forEach((m) => {
      if (m.noPenawaran && !map.has(m.noPenawaran)) {
        map.set(m.noPenawaran, {
          noPenawaran: m.noPenawaran,
          pt: m.pt || "PT Unknown",
        });
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.noPenawaran.localeCompare(b.noPenawaran),
    );
  }, [allModals]);

  // Load all modals for dropdown
  React.useEffect(() => {
    fetchAllModals();
  }, []);

  const fetchAllModals = async () => {
    try {
      const [modalRes, penawaranRes, customerRes] = await Promise.all([
        fetch("/api/modal"),
        fetch("/api/penawaran"),
        fetch("/api/customer"),
      ]);

      const modalData = await modalRes.json();
      const penawarans: any[] = await penawaranRes.json();
      const customersData: any[] = await customerRes.json();

      setCustomers(customersData);

      // Only include regular modal data (not aktual)
      const regularData = modalData.filter((m: any) => !m.isAktual);

      // Merge PT name from penawaran if missing in modal
      const enrichedData = regularData.map((m: any) => {
        if (!m.pt) {
          const p = penawarans.find((pen) => pen.noPenawaran === m.noPenawaran);
          return { ...m, pt: p?.pt || "PT Unknown" };
        }
        return m;
      });

      setAllModals(enrichedData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const fetchModalsForRfs = async (noPenawaran: string) => {
    setIsLoading(true);
    try {
      // Fetch only regular data
      const response = await fetch(
        `/api/modal?noPenawaran=${encodeURIComponent(noPenawaran)}`,
      );

      const data = response.ok ? await response.json() : [];
      // Filter out any accidentally included aktual data
      const regularData = data.filter((m: any) => !m.isAktual);

      setModals(regularData);

      if (regularData.length > 0) {
        const noQuo = regularData[0].noQuo;
        const costRes = await fetch(
          `/api/modal-cost?noQuo=${encodeURIComponent(noQuo)}`,
        );
        if (costRes.ok) {
          setModalCosts(await costRes.json());
        }
      } else {
        setModalCosts([]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (value: string) => {
    setFilterNoRfs(value);
    if (value) {
      fetchModalsForRfs(value);
    } else {
      setModals([]);
      setModalCosts([]);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`MODAL-${filterNoRfs}-${new Date().getFullYear()}.pdf`);
    } catch (error) {
      alert("PDF generation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredModals = modals;
  const currentModalCost = modalCosts[0] || null;
  const subTotal = filteredModals.reduce((sum, item) => sum + item.amount, 0);

  const totalDiscount = currentModalCost?.discount || 0;
  const totalModalSperpart = currentModalCost?.totalModalSperpart || 0;
  const totalBankCharge = currentModalCost?.bankCharge || 0;
  const totalPackingCost = currentModalCost?.packingCost || 0;
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

  // New sums for formula
  const totalDelivery =
    totalDeliveryDutyTax +
    totalDeliveryAirDHL +
    totalDeliveryAirDoorToDoor +
    totalDeliverySeaResmi +
    totalDeliverySeaDoorToDoor +
    totalDeliveryLocalCost;
  const totalOtherCost =
    totalFeeKurir +
    totalOtherCostTruck +
    totalOtherCostServiceBoat +
    totalOtherCostLainLain;

  // Fixed HSI formula: (Sub Total Amount + Discount + Bank Charge + Packing Cost + Total Delivery + Total Other Cost) x 8%
  const totalHsi =
    (subTotal +
      totalDiscount +
      totalBankCharge +
      totalPackingCost +
      totalDelivery +
      totalOtherCost) *
    0.08;

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
    totalOtherCostLainLain +
    totalHsi;
  const totalModal = subTotal + totalAllCost;

  const currentPt = filteredModals[0]?.pt || "PT. ANDHIKA LINES";
  const currentCustomerId = React.useMemo(() => {
    if (!filterNoRfs || !currentPt || customers.length === 0) return "-";
    const customer = customers.find(
      (c) => c.ptMv?.toLowerCase() === currentPt.toLowerCase(),
    );
    return customer?.customerId || "-";
  }, [filterNoRfs, currentPt, customers]);
  const currentLocation = filteredModals[0]?.location || "-";
  const pnValues =
    [...new Set(filteredModals.map((m) => m.pn).filter(Boolean))].join(", ") ||
    "-";
  const noQUO = filteredModals[0]
    ? `${filteredModals[0].noQuo}-MODAL-${new Date().getFullYear()}`
    : "-";
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
  const formatRupiah = (num: number) => num.toLocaleString("id-ID");

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6 font-sans print:bg-white print:p-0 print:min-h-0">
      <div className="max-w-4xl mx-auto mb-4 print:hidden">
        <div className="bg-white shadow-sm border border-gray-200 p-4 rounded-md">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="text-sm font-semibold whitespace-nowrap">
              Filter No. RFS:
            </label>
            <Select value={filterNoRfs} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-[350px]">
                <SelectValue placeholder="Pilih No. RFS" />
              </SelectTrigger>
              <SelectContent>
                {uniqueRfsList.map((item) => (
                  <SelectItem key={item.noPenawaran} value={item.noPenawaran}>
                    {item.noPenawaran} - {item.pt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={isLoading || !filterNoRfs}
              className="px-4 py-2 bg-[#21ae43] text-white text-sm font-medium rounded-md hover:bg-[#1a8f38] transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isLoading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>

      <div
        ref={reportRef}
        className="max-w-4xl mx-auto border border-[#e5e7eb] p-6 md:p-8 bg-white shadow-lg print:shadow-none"
        style={{ color: "#000000" }}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs border border-[#d1d5db] p-2 mb-4 bg-[#f9fafb]">
          <div>
            <span className="font-bold">NO</span>
            <br />
            {noQUO}
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

        <div className="mb-4 text-sm">
          <p className="font-bold">{currentPt}</p>
          <p className="text-xs">{pnValues}</p>
        </div>

        <div className="overflow-x-auto mb-6">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-[#f3f4f6] border-t border-b border-[#9ca3af]">
                <th className="text-left py-2 px-1">No</th>
                <th className="text-left py-2 px-1">Kode IMPA</th>
                <th className="text-left py-2 px-1">Description</th>
                <th className="text-left py-2 px-1">Qty</th>
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
                    <td className="py-2 px-1 align-top">{item.description}</td>
                    <td className="py-2 px-1 align-top">
                      {item.qty} {item.satuan}
                    </td>
                    <td className="py-2 px-1 align-top">
                      {item.namaToko || "-"}
                    </td>
                    <td className="py-2 px-1 align-top">
                      {formatRupiah(item.unitPrice)}
                    </td>
                    <td className="py-2 px-1 align-top">
                      {formatRupiah(item.amount)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

          <div className="text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-left">Sub Total :</div>
              <div className="text-right font-semibold">
                {formatRupiah(subTotal)}
              </div>

              <div className="text-left">Total Biaya Lain :</div>
              <div className="text-right">{formatRupiah(totalAllCost)}</div>

              <div className="text-left font-bold bg-[#f3f4f6] py-1">
                TOTAL MODAL (IDR) :
              </div>
              <div className="text-right font-bold bg-[#f3f4f6] py-1">
                {formatRupiah(totalModal)}
              </div>
            </div>
          </div>
        </div>

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
