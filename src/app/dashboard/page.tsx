"use client";

import * as React from "react";
import {
  Home,
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  Download,
  MoreHorizontal,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { AppShell } from "@/components/app-shell";

const recentOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    amount: 120.5,
    status: "Completed",
    date: "2024-01-15",
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    amount: 85.0,
    status: "Processing",
    date: "2024-01-15",
  },
  {
    id: "ORD-003",
    customer: "Bob Wilson",
    amount: 250.75,
    status: "Completed",
    date: "2024-01-14",
  },
  {
    id: "ORD-004",
    customer: "Alice Brown",
    amount: 45.0,
    status: "Pending",
    date: "2024-01-14",
  },
  {
    id: "ORD-005",
    customer: "Charlie Davis",
    amount: 180.25,
    status: "Completed",
    date: "2024-01-13",
  },
];

const chartConfig = {
  spending1: {
    label: "Pembelanjaan",
    color: "hsl(var(--chart-1))",
  },
  spending2: {
    label: "Pembelanjaan",
    color: "hsl(var(--chart-2))",
  },
  spending3: {
    label: "Pembelanjaan",
    color: "hsl(var(--chart-3))",
  },
  spending4: {
    label: "Pembelanjaan",
    color: "hsl(var(--chart-4))",
  },
  spending5: {
    label: "Pembelanjaan",
    color: "hsl(var(--chart-5))",
  },
  label: {
    color: "var(--background)",
  },
};

function StatsCard({ title, value, description, icon, trend }: any) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="rounded-md bg-primary/10 p-2 text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [ptSpending, setPtSpending] = React.useState<
    Array<{ pt: string; total: number; fill: string }>
  >([]);
  const [savedQuoCount, setSavedQuoCount] = React.useState(0);
  const [customerCount, setCustomerCount] = React.useState(0);
  const [isLoadingSpending, setIsLoadingSpending] = React.useState(false);
  const [reportQuoDiscounts, setReportQuoDiscounts] = React.useState<
    Record<string, number>
  >({});

  // Fetch all report-quo discounts and return the map
  const fetchReportQuoDiscounts = React.useCallback(async (): Promise<
    Record<string, number>
  > => {
    try {
      const response = await fetch("/api/report-quo");
      if (response.ok) {
        const data = await response.json();
        // Create a map of noQuo -> discount
        const discountMap: Record<string, number> = {};
        if (Array.isArray(data)) {
          data.forEach((item: any) => {
            discountMap[item.noQuo] = parseFloat(item.discount) || 0;
          });
        }
        console.log("ReportQuo discounts:", discountMap);
        return discountMap;
      }
    } catch (error) {
      console.error("Error fetching report-quo discounts:", error);
    }
    return {};
  }, []);

  const fetchPtSpending = React.useCallback(async () => {
    setIsLoadingSpending(true);
    try {
      // First fetch all report-quo discounts and get the data directly
      const discountMap = await fetchReportQuoDiscounts();
      setReportQuoDiscounts(discountMap);

      const response = await fetch("/api/quo-ppn");
      if (response.ok) {
        const quoPpns = await response.json();
        console.log("Fetched quoPpns:", quoPpns);

        const currentYear = new Date().getFullYear();

        // Group quoPpns by noQuo first, then by pt
        const quoPpnsByNoQuo = quoPpns.reduce(
          (acc: Record<string, any>, quoPpn: any) => {
            const noQuo = quoPpn.noQuo;
            const pt = quoPpn.noPt || "Unknown";
            const total = parseFloat(quoPpn.totalNew) || 0;

            const recordDate = new Date(quoPpn.tanggal || quoPpn.createdAt);
            if (recordDate.getFullYear() === currentYear) {
              if (!acc[noQuo]) {
                acc[noQuo] = { pt, total: 0 };
              }
              acc[noQuo].total += total;
            }

            return acc;
          },
          {},
        );

        console.log("QuoPpns by noQuo (all years):", quoPpnsByNoQuo);

        // Filter to only include noQuos that exist in ReportQuo (have been saved)
        // Use trimmed and lowercase for matching
        const validNoQuos = Object.keys(discountMap).map((nq) =>
          nq.trim().toLowerCase(),
        );
        console.log("Valid noQuos from ReportQuo:", validNoQuos);

        // Calculate Total Quotation Must Be Paid for each noQuo
        // Formula: (subTotal - discount) * 1.11
        // Only for noQuos that exist in ReportQuo (have been saved)
        const totalQuotationByNoQuo: Record<string, number> = {};
        Object.entries(quoPpnsByNoQuo).forEach(
          ([noQuo, data]: [string, any]) => {
            // Only calculate if this noQuo exists in ReportQuo (has been saved)
            const noQuoTrimmed = noQuo.trim().toLowerCase();
            if (validNoQuos.includes(noQuoTrimmed)) {
              const subTotal = data.total;
              // Find the original noQuo key from discountMap
              const originalNoQuo = Object.keys(discountMap).find(
                (nq) => nq.trim().toLowerCase() === noQuoTrimmed,
              );
              const discount = originalNoQuo
                ? discountMap[originalNoQuo] || 0
                : 0;
              const totalAfterDiscount = subTotal - discount;
              // TOTAL QUOTATION MUST BE PAID = (subTotal - discount) * 1.11
              // This includes PPN (11%)
              totalQuotationByNoQuo[noQuo] = totalAfterDiscount * 1.11;
            }
          },
        );

        console.log(
          "Total Quotation Must Be Paid by noQuo:",
          totalQuotationByNoQuo,
        );

        // Now group by PT and sum the Total Quotation Must Be Paid
        // Only for noQuos that exist in ReportQuo
        const spendingByPt: Record<string, number> = {};
        Object.entries(quoPpnsByNoQuo).forEach(
          ([noQuo, data]: [string, any]) => {
            // Only include if this noQuo exists in ReportQuo (has been saved)
            const noQuoTrimmed = noQuo.trim().toLowerCase();
            if (validNoQuos.includes(noQuoTrimmed)) {
              const pt = data.pt;
              const totalQuotation = totalQuotationByNoQuo[noQuo] || 0;
              spendingByPt[pt] = (spendingByPt[pt] || 0) + totalQuotation;
            }
          },
        );

        console.log(
          "Spending by PT (current year) - Total Quotation Must Be Paid:",
          spendingByPt,
        );

        const LIMIT_PER_PT = 2000000000;

        const spendingArray = Object.entries(spendingByPt)
          .map(([pt, total]) => ({ pt, total: Number(total), fill: "" }))
          .sort((a, b) => b.total - a.total)
          .map((item, index) => {
            const ptNameLower = item.pt.toLowerCase();
            let fill = "";

            if (
              ptNameLower.includes("mv. andhika alisha") ||
              ptNameLower.includes("mv andhika alisha")
            ) {
              fill = "#3b82f6";
            } else if (ptNameLower.includes("asal jangkar")) {
              fill = "#22c55e";
            } else {
              const colors = [
                "hsl(var(--chart-1))",
                "hsl(var(--chart-2))",
                "hsl(var(--chart-3))",
                "hsl(var(--chart-4))",
                "hsl(var(--chart-5))",
              ];
              fill = colors[index % colors.length];
            }

            return { ...item, fill };
          });

        console.log("Spending array for chart:", spendingArray);
        setPtSpending(spendingArray);
      }
    } catch (error) {
      console.error("Error fetching PT spending:", error);
    } finally {
      setIsLoadingSpending(false);
    }
  }, []);

  const fetchSavedQuoCount = React.useCallback(async () => {
    try {
      const response = await fetch("/api/report-quo-count");
      if (response.ok) {
        const data = await response.json();
        setSavedQuoCount(data.count || 0);
      }
    } catch (error) {
      console.error("Error fetching saved quo count:", error);
    }
  }, []);

  const fetchCustomerCount = React.useCallback(async () => {
    try {
      const response = await fetch("/api/customer");
      if (response.ok) {
        const data = await response.json();
        setCustomerCount(data.length || 0);
      }
    } catch (error) {
      console.error("Error fetching customer count:", error);
    }
  }, []);

  React.useEffect(() => {
    fetchPtSpending();
    fetchSavedQuoCount();
    fetchCustomerCount();
  }, [fetchPtSpending, fetchSavedQuoCount, fetchCustomerCount]);

  return (
    <AppShell>
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={`Rp ${ptSpending.reduce((sum, pt) => sum + pt.total, 0).toLocaleString("id-ID")}`}
          description={`Total pembelanjaan semua PT tahun ${new Date().getFullYear()}`}
          icon={<DollarSign className="h-4 w-4" />}
          trend="up"
        />
        <StatsCard
          title="Orders"
          value={`+${savedQuoCount}`}
          description={`Total ${savedQuoCount} Quo tersimpan`}
          icon={<ShoppingCart className="h-4 w-4" />}
          trend="up"
        />
        <StatsCard
          title="Customers"
          value={`+${customerCount}`}
          description={`Total ${customerCount} customer`}
          icon={<Users className="h-4 w-4" />}
          trend="up"
        />
        <StatsCard
          title="Active Now"
          value="+573"
          description="+201 since last hour"
          icon={<TrendingUp className="h-4 w-4" />}
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview </CardTitle>
            <CardDescription>
              Progress pembelanjaan per tahun {new Date().getFullYear()} (Limit:
              )
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSpending ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Memuat data...
              </div>
            ) : ptSpending.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Belum ada data pembelanjaan tahun {new Date().getFullYear()}
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    accessibilityLayer
                    data={ptSpending.map((item) => ({
                      ...item,
                      progress: Math.min((item.total / 2000000000) * 100, 100),
                    }))}
                    layout="vertical"
                    margin={{ right: 16, top: 20, bottom: 20 }}
                    barSize={24}
                  >
                    <CartesianGrid horizontal={false} />
                    <YAxis
                      dataKey="pt"
                      type="category"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      hide
                    />
                    <XAxis
                      dataKey="progress"
                      type="number"
                      domain={[0, 100]}
                      hide
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                      formatter={(value: any, name: string, props: any) => {
                        const totalValue = props.payload?.total || 0;
                        const progressValue = props.payload?.progress || 0;
                        return [
                          `${progressValue.toFixed(1)}% (Rp ${totalValue.toLocaleString("id-ID")})`,
                          "Pembelanjaan",
                        ];
                      }}
                      labelFormatter={(label) => `PT: ${label}`}
                    />
                    <Bar
                      dataKey="progress"
                      layout="vertical"
                      radius={4}
                      fill="fill"
                    >
                      <LabelList
                        dataKey="pt"
                        position="insideLeft"
                        offset={12}
                        fontSize={12}
                        fontWeight={500}
                        style={{ fill: "white" }}
                      />
                      <LabelList
                        dataKey="progress"
                        position="right"
                        offset={8}
                        fontSize={11}
                        fontWeight={500}
                        formatter={(value: number) => `${value.toFixed(0)}%`}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Spenders</CardTitle>
            <CardDescription>
              Total pembelanjaan per PT tahun {new Date().getFullYear()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingSpending ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Memuat data...
              </div>
            ) : ptSpending.length === 0 ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground">
                Belum ada data
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {ptSpending.map((pt) => {
                  const ptInitials = pt.pt
                    .split(" ")
                    .map((word: string) => word[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const progress = Math.min((pt.total / 2000000000) * 100, 100);
                  return (
                    <div key={pt.pt} className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>{ptInitials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {pt.pt}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-primary text-sm">
                            {pt.total.toLocaleString("id-ID")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {/* {progress.toFixed(1)}% / 2 Milyar */}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: pt.fill,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/*
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Track and manage your recent orders
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell>${order.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "Completed"
                          ? "default"
                          : order.status === "Processing"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      */}
    </AppShell>
  );
}
