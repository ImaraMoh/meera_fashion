import React from 'react';
import { Product } from '../../../types';

interface ReportsPanelProps {
  totalRevenue: number;
  products: Product[];
}

export const ReportsPanel: React.FC<
  ReportsPanelProps
> = ({
  totalRevenue,
  products,
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">

      {/* KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">
          <p className="text-xs text-[#8C5D6C] font-semibold">
            Total Revenue (Verified)
          </p>

          <h4 className="text-3xl font-serif font-bold text-[#9E315A] mt-1">
            £{totalRevenue.toLocaleString()}
          </h4>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">
          <p className="text-xs text-[#8C5D6C] font-semibold">
            Catalog Product Units
          </p>

          <h4 className="text-3xl font-serif font-bold text-[#241B20] mt-1">
            {products.length} Pieces
          </h4>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-rose-100 shadow-sm">
          <p className="text-xs text-[#8C5D6C] font-semibold">
            WhatsApp Conversion Rate
          </p>

          <h4 className="text-3xl font-serif font-bold text-emerald-700 mt-1">
            82.4%
          </h4>
        </div>

      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-3xl border border-rose-100 p-6 shadow-sm space-y-4">

        <h4 className="font-serif font-bold text-lg text-[#241B20]">
          Revenue by Collection Category
        </h4>

        <div className="space-y-3">

          {[
            {
              label: 'Kanjivaram & Silk Sarees',
              percentage: 45,
              revenue: '£5,602',
            },
            {
              label: 'The Dance Performance Edit (Saree + Temple Sets)',
              percentage: 30,
              revenue: '£3,735',
            },
            {
              label: 'Kundan & Temple Bangles',
              percentage: 15,
              revenue: '£1,867',
            },
            {
              label: 'Bridal Lehengas & Shalwar',
              percentage: 10,
              revenue: '£1,246',
            },
          ].map((item) => (
            <div key={item.label}>

              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>{item.label}</span>

                <span className="text-[#9E315A]">
                  {item.percentage}% ({item.revenue})
                </span>
              </div>

              <div className="w-full h-2.5 bg-rose-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#9E315A] rounded-full"
                  style={{
                    width: `${item.percentage}%`,
                  }}
                />
              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  );
};