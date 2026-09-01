import React, { useEffect, useState } from 'react';

import {
  TrendingUp,
  ShoppingBag,
  Package,
  MessageCircle,
  RefreshCw,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';

import {
  loadAnalytics,
  AnalyticsData,
} from '../../../services/api';

interface ReportsPanelProps {
  totalRevenue?: number;
  products?: any[];
}

type AnalyticsRange = '7' | '30' | '90' | 'all';

export const ReportsPanel: React.FC<
  ReportsPanelProps
> = () => {

  const [analytics, setAnalytics] =
    useState<AnalyticsData | null>(null);

  const [range, setRange] =
    useState<AnalyticsRange>('30');

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ---------------------------------------------------------
  // LOAD ANALYTICS
  // ---------------------------------------------------------

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      const data =
        await loadAnalytics(range);

      setAnalytics(data);
    } catch (err) {
      console.error(
        'Failed to load analytics:',
        err
      );

      setError(
        'Unable to load analytics data.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const formatCurrency = (
    value: number
  ) => {
    return `£${value.toLocaleString(
      'en-GB',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatPercentage = (
    value: number
  ) => {
    return `${value.toFixed(1)}%`;
  };

  const formatCategory = (
    category: string
  ) => {
    if (!category) return 'Other';

    return category
      .replace(/[-_]/g, ' ')
      .replace(
        /\b\w/g,
        (char) => char.toUpperCase()
      );
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading && !analytics) {
    return (
      <div className="space-y-6 animate-fadeIn">

        <div className="flex items-center justify-between">

          <div>
            <h3 className="text-xl font-serif font-bold text-[#241B20]">
              Analytics & Reports
            </h3>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Loading real-time business analytics...
            </p>
          </div>

          <Loader2 className="w-5 h-5 text-[#9E315A] animate-spin" />

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {[1, 2, 3, 4].map(
            (item) => (
              <div
                key={item}
                className="h-32 rounded-3xl bg-white border border-rose-100 animate-pulse"
              />
            )
          )}

        </div>

      </div>
    );
  }

  // ---------------------------------------------------------
  // ERROR
  // ---------------------------------------------------------

  if (error) {
    return (
      <div className="space-y-6">

        <div className="bg-white border border-rose-100 rounded-3xl p-8 text-center shadow-sm">

          <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 flex items-center justify-center mb-3">

            <TrendingUp className="w-5 h-5 text-[#9E315A]" />

          </div>

          <h3 className="font-serif font-bold text-[#241B20]">
            Analytics Unavailable
          </h3>

          <p className="text-xs text-[#8C5D6C] mt-1">
            {error}
          </p>

          <button
            onClick={fetchAnalytics}
            className="mt-4 inline-flex items-center gap-2 bg-[#9E315A] hover:bg-[#832247] text-white px-4 py-2 rounded-xl text-xs font-bold"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>

        </div>

      </div>
    );
  }

  if (!analytics) return null;

  const {
    summary,
    revenueByCategory,
    topProducts,
  } = analytics;

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* -------------------------------------------------- */}
      {/* HEADER */}
      {/* -------------------------------------------------- */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div>
          <h3 className="text-xl font-serif font-bold text-[#241B20]">
            Analytics & Reports
          </h3>

          <p className="text-xs text-[#8C5D6C] mt-1">
            Real-time performance from your
            Neon PostgreSQL database.
          </p>
        </div>

        <div className="flex items-center gap-2">

          {/* Period */}

          <select
            value={range}
            onChange={(e) =>
              setRange(
                e.target.value as AnalyticsRange
              )
            }
            className="bg-white border border-rose-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#3E2F37] outline-none"
          >
            <option value="7">
              Last 7 Days
            </option>

            <option value="30">
              Last 30 Days
            </option>

            <option value="90">
              Last 90 Days
            </option>

            <option value="all">
              All Time
            </option>
          </select>

          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white border border-rose-200 text-[#9E315A] hover:bg-rose-50"
            title="Refresh Analytics"
          >
            <RefreshCw
              className={`w-4 h-4 ${
                loading
                  ? 'animate-spin'
                  : ''
              }`}
            />
          </button>

        </div>

      </div>

      {/* -------------------------------------------------- */}
      {/* KPI CARDS */}
      {/* -------------------------------------------------- */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Revenue */}

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-[#8C5D6C] font-semibold">
                Verified Revenue
              </p>

              <h4 className="text-2xl font-serif font-bold text-[#9E315A] mt-1">
                {formatCurrency(
                  summary.totalRevenue
                )}
              </h4>

            </div>

            <div className="p-2 rounded-xl bg-rose-50">
              <TrendingUp className="w-4 h-4 text-[#9E315A]" />
            </div>

          </div>

          <p className="text-[11px] text-[#8C5D6C] mt-3">
            From verified / completed invoices
          </p>

        </div>

        {/* Orders */}

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-[#8C5D6C] font-semibold">
                Total Orders
              </p>

              <h4 className="text-2xl font-serif font-bold text-[#241B20] mt-1">
                {summary.totalOrders}
              </h4>

            </div>

            <div className="p-2 rounded-xl bg-rose-50">
              <ShoppingBag className="w-4 h-4 text-[#9E315A]" />
            </div>

          </div>

          <p className="text-[11px] text-[#8C5D6C] mt-3">
            Invoices created during period
          </p>

        </div>

        {/* Products */}

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-[#8C5D6C] font-semibold">
                Catalog Products
              </p>

              <h4 className="text-2xl font-serif font-bold text-[#241B20] mt-1">
                {summary.productCount}
              </h4>

            </div>

            <div className="p-2 rounded-xl bg-rose-50">
              <Package className="w-4 h-4 text-[#9E315A]" />
            </div>

          </div>

          <p className="text-[11px] text-[#8C5D6C] mt-3">
            Active products in catalog
          </p>

        </div>

        {/* Conversion */}

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">

          <div className="flex items-start justify-between">

            <div>

              <p className="text-xs text-[#8C5D6C] font-semibold">
                Enquiry Conversion
              </p>

              <h4 className="text-2xl font-serif font-bold text-emerald-700 mt-1">
                {formatPercentage(
                  summary.conversionRate
                )}
              </h4>

            </div>

            <div className="p-2 rounded-xl bg-emerald-50">
              <MessageCircle className="w-4 h-4 text-emerald-700" />
            </div>

          </div>

          <p className="text-[11px] text-[#8C5D6C] mt-3">
            Paid orders ÷ customer enquiries
          </p>

        </div>

      </div>

      {/* -------------------------------------------------- */}
      {/* ORDER STATUS */}
      {/* -------------------------------------------------- */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white rounded-3xl border border-rose-100 p-5">

          <p className="text-xs text-[#8C5D6C]">
            Verified Orders
          </p>

          <p className="text-2xl font-serif font-bold text-emerald-700 mt-1">
            {summary.paidOrders}
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-rose-100 p-5">

          <p className="text-xs text-[#8C5D6C]">
            Pending Orders
          </p>

          <p className="text-2xl font-serif font-bold text-amber-700 mt-1">
            {summary.pendingOrders}
          </p>

        </div>

        <div className="bg-white rounded-3xl border border-rose-100 p-5">

          <p className="text-xs text-[#8C5D6C]">
            Customer Enquiries
          </p>

          <p className="text-2xl font-serif font-bold text-[#9E315A] mt-1">
            {summary.totalEnquiries}
          </p>

        </div>

      </div>

      {/* -------------------------------------------------- */}
      {/* REVENUE BY CATEGORY */}
      {/* -------------------------------------------------- */}

      <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm">

        <div className="flex items-center justify-between mb-5">

          <div>
            <h4 className="font-serif font-bold text-lg text-[#241B20]">
              Revenue by Collection
            </h4>

            <p className="text-xs text-[#8C5D6C] mt-1">
              Calculated from actual invoice items.
            </p>
          </div>

          <ArrowUpRight className="w-5 h-5 text-[#9E315A]" />

        </div>

        {revenueByCategory.length === 0 ? (

          <div className="py-10 text-center text-xs text-[#8C5D6C]">
            No verified revenue available
            for this period.
          </div>

        ) : (

          <div className="space-y-4">

            {revenueByCategory.map(
              (item) => (

                <div
                  key={item.category}
                >

                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">

                    <span className="text-[#3E2F37]">
                      {formatCategory(
                        item.category
                      )}
                    </span>

                    <span className="text-[#9E315A]">
                      {formatPercentage(
                        item.percentage
                      )}{' '}
                      (
                      {formatCurrency(
                        item.revenue
                      )}
                      )
                    </span>

                  </div>

                  <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">

                    <div
                      className="h-full bg-[#9E315A] rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min(
                          item.percentage,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* -------------------------------------------------- */}
      {/* TOP PRODUCTS */}
      {/* -------------------------------------------------- */}

      <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm">

        <div className="mb-5">

          <h4 className="font-serif font-bold text-lg text-[#241B20]">
            Top Selling Products
          </h4>

          <p className="text-xs text-[#8C5D6C] mt-1">
            Based on verified invoice sales.
          </p>

        </div>

        {topProducts.length === 0 ? (

          <div className="py-10 text-center text-xs text-[#8C5D6C]">
            No product sales available
            for this period.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead>

                <tr className="border-b border-rose-100">

                  <th className="text-left py-3 text-[11px] uppercase tracking-wider text-[#8C5D6C]">
                    Product
                  </th>

                  <th className="text-center py-3 text-[11px] uppercase tracking-wider text-[#8C5D6C]">
                    Units
                  </th>

                  <th className="text-right py-3 text-[11px] uppercase tracking-wider text-[#8C5D6C]">
                    Revenue
                  </th>

                </tr>

              </thead>

              <tbody>

                {topProducts.map(
                  (product, index) => (

                    <tr
                      key={product.productId}
                      className="border-b border-rose-50 last:border-0"
                    >

                      <td className="py-3">

                        <div className="flex items-center gap-3">

                          <span className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center text-[10px] font-bold text-[#9E315A]">
                            {index + 1}
                          </span>

                          <span className="text-xs font-semibold text-[#241B20]">
                            {product.name}
                          </span>

                        </div>

                      </td>

                      <td className="py-3 text-center text-xs font-semibold text-[#5A4550]">
                        {product.quantity}
                      </td>

                      <td className="py-3 text-right text-xs font-bold text-[#9E315A]">
                        {formatCurrency(
                          product.revenue
                        )}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};