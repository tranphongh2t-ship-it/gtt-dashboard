import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, PieChart, Pie, Cell } from "recharts";

const C = { green: '#2f6b4f', orange: '#b5502e', red: '#a83232', blue: '#3b6b8a', wood: '#8a5a3b', muted: '#7a6f5e' };

const INVENTORY_DATA = [
  { group: 'Thường', weeks: 26.3, color: C.blue },
  { group: 'Chỉ nẹp', weeks: 17.8, color: C.muted },
  { group: 'Kháng ẩm', weeks: 13.8, color: C.green },
  { group: 'Durabo', weeks: 5.2, color: C.red },
];

const TOP14_SKU = [
  { name: 'KEM SH', revenue: 31200, weeks: 3.8, color: C.green },
  { name: 'KEM T', revenue: 28500, weeks: 4.0, color: C.green },
  { name: 'LATTE T', revenue: 24100, weeks: 2.6, color: C.green },
  { name: 'CHÌ T', revenue: 22800, weeks: 3.2, color: C.green },
  { name: '01 G', revenue: 21500, weeks: 6.7, color: C.green },
  { name: '388 SN', revenue: 19800, weeks: 3.0, color: C.green },
  { name: '611 SN', revenue: 18200, weeks: 4.2, color: C.green },
  { name: '682 MW', revenue: 16500, weeks: 3.6, color: C.green },
  { name: '503 WN', revenue: 14200, weeks: 11.6, color: C.orange },
  { name: '388 T LE', revenue: 13800, weeks: 9.1, color: C.orange },
  { name: '388 WN-ES', revenue: 12500, weeks: 7.9, color: C.orange },
  { name: '503 MM', revenue: 11200, weeks: 3.8, color: C.green },
  { name: '209 SN', revenue: 10800, weeks: 0, color: C.red },
  { name: 'BH Tím', revenue: 9500, weeks: 0, color: C.red },
];

const REVENUE_DATA = [
  { name: 'Kháng ẩm', value: 144.3, color: C.green },
  { name: 'Thường', value: 34.2, color: C.blue },
  { name: 'Durabo', value: 14.1, color: C.orange },
  { name: 'Chỉ nẹp', value: 11.2, color: C.muted },
];

const SOCIAL_DATA = [
  { name: 'Reels/Video', posts: 5, color: C.green },
  { name: 'FB Post', posts: 16, color: C.wood },
  { name: 'Website SEO', posts: 6, color: C.blue },
  { name: 'Cả hai', posts: 5, color: C.orange },
];

const OVERVIEW_RADAR = [
  { subject: 'Doanh thu', real: 9, risk: 2 },
  { subject: 'Tồn Kho KA', real: 7.5, risk: 3 },
  { subject: 'Tồn Kho Durabo', real: 2, risk: 9 },
  { subject: '01 G', real: 9.5, risk: 1 },
  { subject: 'Xu hướng 2026', real: 8.5, risk: 1 },
];

const tip = {
  contentStyle: { background: '#fff', border: '1px solid #e6ddd0', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#40123e', fontWeight: 700, fontSize: 12 },
};

export default function BieuDoTab({ Card, SecTitle, isMobile }) {
  const h = isMobile ? 220 : 300;
  const h2 = isMobile ? 180 : 240;

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#5e3b24,#8a5a3b)', color: '#fff', padding: isMobile ? '14px 16px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: isMobile ? '0 0 12px 12px' : '0 0 16px 16px', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📊 Biểu Đồ Tổng Quan</div>
          <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2 }}>Dữ liệu bán hàng 01/01–11/09/2026 + tồn kho thực tế</div>
        </div>
      </div>

      {/* Revenue Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <Card>
          <SecTitle>💰 Doanh thu theo nhóm (tỷ VNĐ)</SecTitle>
          <ResponsiveContainer width="100%" height={h}>
            <PieChart>
              <Pie data={REVENUE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 80 : 100} innerRadius={isMobile ? 40 : 55} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {REVENUE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tip} formatter={v => v + ' tỷ'} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SecTitle>📊 Doanh thu.bar</SecTitle>
          <ResponsiveContainer width="100%" height={h}>
            <BarChart data={REVENUE_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ddd0" />
              <XAxis dataKey="name" tick={{ fill: '#69626a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#69626a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} formatter={v => v + ' tỷ'} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barThickness={40}>
                {REVENUE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ height: 16 }} />

      {/* Top 14 SKU */}
      <Card>
        <SecTitle>🏆 Top 14 mã — Doanh số + Tồn kho</SecTitle>
        <ResponsiveContainer width="100%" height={isMobile ? 260 : 340}>
          <BarChart data={TOP14_SKU} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e6ddd0" />
            <XAxis type="number" tick={{ fill: '#69626a', fontSize: 10 }} tickFormatter={v => (v / 1000).toFixed(0) + 'tr'} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#40123e', fontSize: 11, fontWeight: 600 }} width={70} axisLine={false} tickLine={false} />
            <Tooltip {...tip} formatter={(v, name) => name === 'Doanh số' ? (v / 1000).toFixed(0) + ' triệu' : v + ' tuần'} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="revenue" name="Doanh số (triệu)" fill={C.green} radius={[0, 4, 4, 0]} barThickness={14} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ height: 16 }} />

      {/* Inventory */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <Card>
          <SecTitle>📦 Tồn kho theo nhóm (tuần)</SecTitle>
          <ResponsiveContainer width="100%" height={h2}>
            <BarChart data={INVENTORY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6ddd0" />
              <XAxis dataKey="group" tick={{ fill: '#69626a', fontSize: 11 }} />
              <YAxis tick={{ fill: '#69626a', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip {...tip} formatter={v => v + ' tuần'} />
              <Bar dataKey="weeks" radius={[6, 6, 0, 0]} barThickness={36}>
                {INVENTORY_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SecTitle>📈 Radar tổng quan</SecTitle>
          <ResponsiveContainer width="100%" height={h2}>
            <RadarChart data={OVERVIEW_RADAR}>
              <PolarGrid stroke="#e6ddd0" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#69626a', fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#b6b1b7', fontSize: 9 }} />
              <Radar name="Thực tế" dataKey="real" stroke={C.green} fill={C.green} fillOpacity={0.2} strokeWidth={2} />
              <Radar name="Rủi ro" dataKey="risk" stroke={C.red} fill={C.red} fillOpacity={0.15} strokeWidth={2} />
              <Tooltip {...tip} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ height: 16 }} />

      {/* Top 14 Inventory */}
      <Card>
        <SecTitle>📉 Top 14 mã — Tồn kho (tuần)</SecTitle>
        <ResponsiveContainer width="100%" height={isMobile ? 260 : 320}>
          <BarChart data={TOP14_SKU} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e6ddd0" />
            <XAxis type="number" tick={{ fill: '#69626a', fontSize: 10 }} tickFormatter={v => v + 'w'} axisLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#40123e', fontSize: 11, fontWeight: 600 }} width={70} axisLine={false} tickLine={false} />
            <Tooltip {...tip} formatter={v => v + ' tuần'} />
            <Bar dataKey="weeks" radius={[0, 4, 4, 0]} barThickness={16}>
              {TOP14_SKU.map((e, i) => <Cell key={i} fill={e.weeks === 0 ? C.red : e.weeks <= 4 ? C.green : e.weeks <= 8 ? C.orange : C.blue} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ height: 16 }} />

      {/* Social Mix */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
        <Card>
          <SecTitle>📱 Phân bổ kênh content</SecTitle>
          <ResponsiveContainer width="100%" height={h2}>
            <PieChart>
              <Pie data={SOCIAL_DATA} dataKey="posts" nameKey="name" cx="50%" cy="50%" outerRadius={isMobile ? 70 : 90} paddingAngle={3} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {SOCIAL_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip {...tip} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <SecTitle>⚠️ Cảnh báo tồn kho</SecTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TOP14_SKU.filter(s => s.weeks === 0).map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fce4ec', borderRadius: 8, border: '1px solid #ffcdd2' }}>
                <span style={{ fontSize: 18 }}>🚨</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#c62828' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#a83232' }}>Hết hàng — Tồn kho: 0 tuần</div>
                </div>
              </div>
            ))}
            {TOP14_SKU.filter(s => s.weeks > 0 && s.weeks <= 3).map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fff8e1', borderRadius: 8, border: '1px solid #ffecb3' }}>
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#f57f17' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: '#e65100' }}>Tồn kho thấp — {s.weeks} tuần</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}