import React, { useState, useEffect, useRef, useCallback } from "react";

const CHANNEL_LIST_INIT = ['Fanpage','Fanpage (Reel)','TikTok','YouTube','Zalo Video','LinkedIn','Website'];
const CHANNEL_COLORS = {'Fanpage':'#9d5799','Fanpage (Reel)':'#b5502e','TikTok':'#000','YouTube':'#c4302b','Zalo Video':'#0068ff','LinkedIn':'#0077b5','Website':'#2f6b4f'};
const STATUSES = ['Chờ duyệt','Đã duyệt','Đã đăng','Hủy'];
const DAYS_VN = ['CN','Hai','Ba','Tư','Năm','Sáu','Bảy'];
const STORAGE_KEY = 'gtt_content_plan';
const CHANNEL_KEY = 'gtt_channel_list';

const DEFAULT_DATA = [
  {date:'2026-09-15',channels:['Fanpage','Website'],content:'Pillar: "70% doanh số Thanh Thùy đến từ ván kháng ẩm — vì sao khách vẫn chọn dù mùa nào?"',product:'Kháng ẩm (tổng quan)',reason:'Dùng số liệu cả năm (70,8%) thay vì chỉ 3 tháng, mạnh hơn',status:'Chờ duyệt',link:''},
  {date:'2026-09-16',channels:['Fanpage (Reel)'],content:'Reel "khách đang chọn gì" — nhắc nhanh 388 SN / 611 SN',product:'388 SN, 611 SN',reason:'Tồn kho 3,0 và 4,2 tuần — đủ an toàn cho 1 reel ngắn',status:'Chờ duyệt',link:''},
  {date:'2026-09-17',channels:['Fanpage'],content:'Ảnh + review khách hàng thật',product:'Thương hiệu chung',reason:'Không gắn mã cụ thể — tận dụng review có sẵn',status:'Chờ duyệt',link:''},
  {date:'2026-09-18',channels:['Fanpage (Reel)','TikTok'],content:'Reel "3 tông màu dẫn đầu xu hướng nội thất 2026: be, kem, xám ấm" — giới thiệu CHÌ T, LATTE T, KEM SH/T',product:'CHÌ T, LATTE T, KEM SH, KEM T',reason:'TRỌNG TÂM ĐẨY CHÍNH — hội tụ cả doanh số, tồn kho 2,6–4,0 tuần',status:'Chờ duyệt',link:''},
  {date:'2026-09-19',channels:['Fanpage'],content:'Ảnh showroom, nội dung nhẹ cuối tuần',product:'—',reason:'Khách B2B ít quyết định cuối tuần',status:'Chờ duyệt',link:''},
  {date:'2026-09-20',channels:['Fanpage','Website'],content:'Bài SEO: "Tông màu nội thất 2026 và mã kháng ẩm tương ứng tại Thanh Thùy"',product:'CHÌ T, LATTE T, KEM SH/T, 682 MW',reason:'Bài SEO dài, kết nối xu hướng thật với sản phẩm tồn kho tốt',status:'Chờ duyệt',link:''},
  {date:'2026-09-21',channels:['Fanpage'],content:'Mini-poll: "Tông màu nào bạn thấy hợp xu hướng 2026 nhất?"',product:'Nhóm mã xu hướng',reason:'Thu thập insight, định hướng tuần 2',status:'Chờ duyệt',link:''},
  {date:'2026-09-22',channels:['Fanpage','Website'],content:'Bài "Vì sao tông be/kem/xám ấm đang chiếm lĩnh thiết kế nội thất 2026"',product:'KEM SH/T, LATTE T, CHÌ T',reason:'Trọng tâm đẩy — giáo dục xu hướng, dẫn tới sản phẩm còn hàng tốt',status:'Chờ duyệt',link:''},
  {date:'2026-09-23',channels:['Fanpage (Reel)'],content:'Reel cận cảnh mã 01 G — tồn kho tốt nhất nhóm (6,7 tuần)',product:'01 G',reason:'Ưu tiên boost quảng cáo — mã an toàn nhất',status:'Chờ duyệt',link:''},
  {date:'2026-09-24',channels:['Fanpage'],content:'Teaser Trung Thu, sáng tạo nhẹ từ vật liệu dư',product:'—',reason:'Chuyển nhịp sang lễ hội',status:'Chờ duyệt',link:''},
  {date:'2026-09-25',channels:['Fanpage'],content:'Chúc Trung Thu, gắn kết — KHÔNG BÁN HÀNG',product:'—',reason:'Ưu tiên thiện cảm dài hạn',status:'Chờ duyệt',link:''},
  {date:'2026-09-26',channels:['Fanpage (Reel)'],content:'Reel mã 503 WN — tồn kho Durabo tốt nhất (11,6 tuần)',product:'Durabo 503 WN',reason:'An toàn nhất nhóm Durabo để làm nội dung sâu',status:'Chờ duyệt',link:''},
  {date:'2026-09-27',channels:['Fanpage'],content:'Album công trình dùng 682 MW / 503 MM',product:'682 MW, 503 MM',reason:'Tồn kho 3,6–3,8 tuần — case study',status:'Chờ duyệt',link:''},
  {date:'2026-09-28',channels:['Fanpage'],content:'Q&A: "Mã nào có sẵn để giao ngay?"',product:'Nhóm mã tồn kho tốt (loại 209 SN)',reason:'Chủ động thông báo 209 SN KHÔNG còn hàng',status:'Chờ duyệt',link:''},
  {date:'2026-09-29',channels:['Fanpage','Website'],content:'"3 lựa chọn Ván Nhựa Durabo đang có sẵn cho khu vực siêu ẩm"',product:'388 WN-ES, 388 T LE, 503 WN',reason:'Trọng tâm đẩy phụ — CHỈ 3 mã còn hàng tốt',status:'Chờ duyệt',link:''},
  {date:'2026-09-30',channels:['Fanpage','Website'],content:'Infographic kỹ thuật: Kháng ẩm LMR/MMR/HMR khác nhau thế nào',product:'Kháng ẩm (kỹ thuật)',reason:'Phục vụ mọi mã, không thiên vị SKU nào',status:'Chờ duyệt',link:''},
  {date:'2026-10-01',channels:['Fanpage'],content:'Case study trước/sau Durabo 388 T LE',product:'Durabo 388 T LE',reason:'Tồn kho 9,1 tuần — an toàn',status:'Chờ duyệt',link:''},
  {date:'2026-10-02',channels:['Fanpage'],content:'Case study dự án Durabo (chỉ 3 mã còn hàng)',product:'388 WN-ES, 388 T LE, 503 WN',reason:'Bài case study, SEO tốt',status:'Chờ duyệt',link:''},
  {date:'2026-10-03',channels:['Fanpage'],content:'Ưu đãi "nhóm màu xu hướng + Durabo còn hàng"',product:'Nhóm xu hướng + 3 mã Durabo an toàn',reason:'Ưu đãi có kiểm soát tồn kho rõ ràng',status:'Chờ duyệt',link:''},
  {date:'2026-10-04',channels:['Website'],content:'Công cụ tính khối lượng ván kháng ẩm cho 1 bộ tủ bếp',product:'Kháng ẩm (mọi mã)',reason:'Giữ chân khách kỹ thuật, không thiên vị mã',status:'Chờ duyệt',link:''},
  {date:'2026-10-05',channels:['Fanpage'],content:'Hậu trường đóng gói, kiểm hàng',product:'Vận hành/kho',reason:'Dịp tự nhiên để nội bộ rà soát tồn kho',status:'Chờ duyệt',link:''},
  {date:'2026-10-06',channels:['Fanpage','Website'],content:'"Deadline đặt hàng sỉ tháng 9 — các lựa chọn còn hàng cho mùa cao điểm"',product:'Mã còn tồn kho tốt (loại 209 SN, Durabo hết hàng)',reason:'Thông điệp deadline theo danh mục thực tế',status:'Chờ duyệt',link:''},
  {date:'2026-10-07',channels:['Fanpage'],content:'Đếm ngược ưu đãi',product:'Cùng danh mục trên',reason:'Nhắc lại',status:'Chờ duyệt',link:''},
  {date:'2026-10-08',channels:['Fanpage (Reel)','TikTok','YouTube'],content:'Reel "Top mã khách hỏi nhiều nhất tháng 9 — còn hàng đủ để đặt ngay"',product:'Nhóm xu hướng + top 3 bằng chứng',reason:'Social proof kết hợp xác nhận tồn kho',status:'Chờ duyệt',link:''},
  {date:'2026-10-09',channels:['Fanpage'],content:'Giới thiệu Chỉ nẹp đi kèm (17,8 tuần tồn kho — an toàn upsell)',product:'Chỉ nẹp',reason:'Không lo hết hàng, upsell tự do',status:'Chờ duyệt',link:''},
  {date:'2026-10-10',channels:['Fanpage'],content:'Kho hàng + "giao 24h" — chỉ mã đã xác nhận tồn kho',product:'Kháng ẩm (nhóm tồn kho tốt)',reason:'Tránh hứa hẹn với Durabo đang thiếu hàng',status:'Chờ duyệt',link:''},
  {date:'2026-10-11',channels:['Website'],content:'"Tháng 10 — mùa khô quay lại, chuyển trọng tâm sang Melamine Thường"',product:'Kháng ẩm → Thường',reason:'Chuẩn bị nhịp chuyển mùa',status:'Chờ duyệt',link:''},
  {date:'2026-10-12',channels:['Fanpage'],content:'Tổng hợp review khách hàng tháng qua',product:'Thương hiệu chung',reason:'Củng cố uy tín trước tháng 10 cao điểm',status:'Chờ duyệt',link:''},
  {date:'2026-10-13',channels:['Fanpage'],content:'Ưu đãi mới cho tháng 10',product:'Kháng ẩm + Thường',reason:'Duy trì đà chuyển đổi',status:'Chờ duyệt',link:''},
  {date:'2026-10-14',channels:['Fanpage','Website'],content:'Tổng kết tháng 9: mã bán tốt + tồn kho có bổ sung kịp không',product:'—',reason:'Đối chiếu kế hoạch vs thực tế kho vận',status:'Chờ duyệt',link:''},
];

function getWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(monday.getDate() - ((day + 6) % 7));
  return monday.toISOString().slice(0, 10);
}

function getWeekDateRange(weekKey) {
  const start = new Date(weekKey + 'T00:00:00');
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmtShort = (d) => d.getDate() + '/' + (d.getMonth() + 1);
  return fmtShort(start) + '–' + fmtShort(end);
}

function getAllWeeks(data) {
  const weekMap = {};
  data.forEach(r => {
    const w = getWeek(r.date);
    if (!weekMap[w]) weekMap[w] = [];
    weekMap[w].push(r.date);
  });
  return Object.keys(weekMap).sort();
}

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return DAYS_VN[d.getDay()];
}

export default function ContentPlanTab({ Card, SecTitle, isMobile }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  });
  const [channels, setChannels] = useState(() => {
    try {
      const saved = localStorage.getItem(CHANNEL_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [...CHANNEL_LIST_INIT];
  });
  const [filterWeek, setFilterWeek] = useState('');
  const [filterChannel, setFilterChannel] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState({ date: '', content: '', product: '', reason: '', channels: [], status: 'Chờ duyệt', link: '' });
  const [toast, setToast] = useState('');
  const [openMs, setOpenMs] = useState(null);
  const msRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem(CHANNEL_KEY, JSON.stringify(channels));
  }, [channels]);

  useEffect(() => {
    const handler = (e) => {
      if (msRef.current && !msRef.current.contains(e.target)) setOpenMs(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  const filtered = data.filter((r) => {
    const dow = getDayOfWeek(r.date);
    if (dow === 'CN') return false;
    if (filterWeek && getWeek(r.date) !== filterWeek) return false;
    if (filterChannel && !(r.channels || []).includes(filterChannel)) return false;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterSearch && !(r.content + r.product + r.reason).toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  const groups = {};
  filtered.forEach(r => {
    const w = getWeek(r.date);
    if (!groups[w]) groups[w] = [];
    groups[w].push(r);
  });

  const allWeeks = getAllWeeks(data).filter(w => groups[w]);

  const stats = { total: data.length, 'Chờ duyệt': 0, 'Đã duyệt': 0, 'Đã đăng': 0, 'Hủy': 0 };
  data.forEach(r => { if (stats[r.status] !== undefined) stats[r.status]++; });

  function updateField(idx, field, value) {
    setData(prev => {
      const nd = [...prev];
      nd[idx] = { ...nd[idx], [field]: value };
      return nd;
    });
  }

  function addRow() {
    setEditIdx(-1);
    setForm({ date: new Date().toISOString().slice(0, 10), content: '', product: '', reason: '', channels: [], status: 'Chờ duyệt', link: '' });
    setModalOpen(true);
  }

  function editRow(idx) {
    const r = data[idx];
    setEditIdx(idx);
    setForm({ date: r.date || '', content: r.content || '', product: r.product || '', reason: r.reason || '', channels: r.channels || [], status: r.status || 'Chờ duyệt', link: r.link || '' });
    setModalOpen(true);
  }

  function saveRow() {
    if (editIdx >= 0) {
      setData(prev => { const nd = [...prev]; nd[editIdx] = { ...nd[editIdx], ...form }; return nd; });
      showToast('Đã cập nhật');
    } else {
      setData(prev => [...prev, { ...form }]);
      showToast('Đã thêm dòng mới');
    }
    setModalOpen(false);
  }

  function deleteRow(idx) {
    if (!window.confirm('Xóa dòng này?')) return;
    setData(prev => prev.filter((_, i) => i !== idx));
    showToast('Đã xóa');
  }

  function toggleChannel(ch) {
    setForm(f => {
      const channels = f.channels.includes(ch) ? f.channels.filter(c => c !== ch) : [...f.channels, ch];
      return { ...f, channels };
    });
  }

  function addNewChannel(name) {
    if (!name.trim()) return;
    if (channels.some(c => c.toLowerCase() === name.trim().toLowerCase())) { showToast('Nền tảng đã tồn tại!'); return; }
    setChannels(prev => [...prev, name.trim()]);
    showToast('Đã thêm: ' + name.trim());
  }

  function resetAll() {
    if (!window.confirm('Xóa toàn bộ và khôi phục mặc định?')) return;
    setData(JSON.parse(JSON.stringify(DEFAULT_DATA)));
    setChannels([...CHANNEL_LIST_INIT]);
    showToast('Đã khôi phục mặc định');
  }

  function exportCSV() {
    let csv = '\uFEFFNgày,Thứ,Kênh đăng,Nội dung,Chủ đề,S Lý do,Trạng thái,Link\n';
    data.forEach(r => {
      csv += `"${r.date}","${getDayOfWeek(r.date)}","${(r.channels || []).join(' + ')}","${(r.content || '').replace(/"/g, '""')}","${(r.product || '').replace(/"/g, '""')}","${(r.reason || '').replace(/"/g, '""')}","${r.status}","${r.link || ''}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gtt-content-plan.csv';
    a.click();
    showToast('Đã export CSV');
  }

  const chColor = (c) => CHANNEL_COLORS[c] || '#69626a';

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#40123e,#9d5799)', color: '#fff', padding: isMobile ? '14px 16px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: isMobile ? '0 0 12px 12px' : '0 0 16px 16px', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📅 Content Social Media</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Lịch đăng 30 ngày — multi nền tảng</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={addRow} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>+ Thêm dòng</button>
          <button onClick={exportCSV} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Export</button>
          <button onClick={resetAll} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>↺ Reset</button>
        </div>
      </div>

      {/* Stats */}
      <Card>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12 }}>
          <span>Tổng: <b style={{ color: '#40123e', fontSize: 14 }}>{stats.total}</b></span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#b5502e', marginRight: 4 }} />Chờ duyệt: <b>{stats['Chờ duyệt']}</b></span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#2f6b4f', marginRight: 4 }} />Đã duyệt: <b>{stats['Đã duyệt']}</b></span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3b6b8a', marginRight: 4 }} />Đã đăng: <b>{stats['Đã đăng']}</b></span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#a83232', marginRight: 4 }} />Hủy: <b>{stats['Hủy']}</b></span>
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#69626a', fontWeight: 600 }}>Tuần:</label>
          <select value={filterWeek} onChange={e => setFilterWeek(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #e6ddd0', borderRadius: 5, fontSize: 12 }}>
            <option value="">Tất cả</option>
            {getAllWeeks(data).map(w => <option key={w} value={w}>Tuần {getWeekDateRange(w)}</option>)}
          </select>
          <label style={{ fontSize: 11, color: '#69626a', fontWeight: 600 }}>Kênh:</label>
          <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #e6ddd0', borderRadius: 5, fontSize: 12 }}>
            <option value="">Tất cả</option>
            {channels.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label style={{ fontSize: 11, color: '#69626a', fontWeight: 600 }}>Trạng thái:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #e6ddd0', borderRadius: 5, fontSize: 12 }}>
            <option value="">Tất cả</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input type="text" placeholder="Tìm nội dung..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #e6ddd0', borderRadius: 5, fontSize: 12, minWidth: 140 }} />
        </div>
      </Card>

      {/* Table */}
      <Card style={{ overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : 12.5, minWidth: 1100 }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Ngày</th>
              <th style={thStyle}>Thứ</th>
              <th style={{ ...thStyle, minWidth: 120 }}>Kênh đăng</th>
              <th style={{ ...thStyle, minWidth: 200 }}>Nội dung</th>
              <th style={{ ...thStyle, minWidth: 120 }}>Chủ đề / SP</th>
              <th style={{ ...thStyle, minWidth: 150 }}>Lý do</th>
              <th style={thStyle}>Trạng thái</th>
              <th style={thStyle}>Link</th>
              <th style={{ ...thStyle, width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {allWeeks.map(w => (
              <React.Fragment key={w}>
                <tr>
                  <td colSpan={10} style={{ background: '#f0dbef', padding: '6px 10px', fontWeight: 700, fontSize: 12, color: '#40123e', borderTop: '2px solid #9d5799' }}>
                    📅 Tuần {getWeekDateRange(w)}
                  </td>
                </tr>
                {groups[w].map((r, i) => {
                  const di = data.indexOf(r);
                  const dow = getDayOfWeek(r.date);
                  const isWeekend = dow === 'Bảy';
                  return (
                    <tr key={di} style={isWeekend ? { background: '#fdf8f3' } : {}}>
                      <td style={tdStyleCenter}>{i + 1}</td>
                      <td style={tdStyle}><input type="date" value={r.date} onChange={e => updateField(di, 'date', e.value)} style={cellInput} /></td>
                      <td style={{ ...tdStyleCenter, fontWeight: 600, color: '#9d5799' }}>{dow}</td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                          {(r.channels || []).map(ch => (
                            <span key={ch} style={{ background: chColor(ch), color: '#fff', borderRadius: 4, padding: '2px 7px', fontSize: 10, fontWeight: 600, whiteSpace: 'nowrap' }}>{ch}</span>
                          ))}
                        </div>
                      </td>
                      <td style={tdStyle}><div contentEditable suppressContentEditableWarning onBlur={e => updateField(di, 'content', e.target.textContent)} style={{ outline: 'none', minHeight: 18 }}>{r.content}</div></td>
                      <td style={tdStyle}><div contentEditable suppressContentEditableWarning onBlur={e => updateField(di, 'product', e.target.textContent)} style={{ outline: 'none', minHeight: 18 }}>{r.product}</div></td>
                      <td style={tdStyle}><div contentEditable suppressContentEditableWarning onBlur={e => updateField(di, 'reason', e.target.textContent)} style={{ outline: 'none', minHeight: 18, fontSize: 11.5, color: '#69626a' }}>{r.reason}</div></td>
                      <td style={tdStyle}>
                        <select value={r.status} onChange={e => updateField(di, 'status', e.value)} style={{ ...cellInput, fontWeight: 600, cursor: 'pointer' }}>
                          {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td style={tdStyle}>
                        {r.link ? (
                          <a href={r.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#9d5799', textDecoration: 'none', border: '1px solid #9d5799', borderRadius: 4, padding: '2px 6px' }}>🔗 Xem</a>
                        ) : (
                          <input type="text" placeholder="Dán link..." value={r.link || ''} onChange={e => updateField(di, 'link', e.target.value)} style={{ ...cellInput, fontSize: 11, width: 80 }} />
                        )}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                          <button onClick={() => editRow(di)} title="Sửa" style={rowBtnStyle}>✏️</button>
                          <button onClick={() => deleteRow(di)} title="Xóa" style={{ ...rowBtnStyle, color: '#a83232' }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, maxWidth: 520, width: '95%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 14, color: '#40123e', fontSize: 15 }}>{editIdx >= 0 ? 'Sửa dòng #' + (editIdx + 1) : 'Thêm dòng mới'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <label style={labelStyle}>Ngày</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
              <label style={labelStyle}>Trạng thái</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nội dung</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Nội dung bài đăng..." />
              </div>
              <label style={labelStyle}>Chủ đề / Sản phẩm</label>
              <input type="text" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} style={inputStyle} placeholder="VD: 388 SN, CHÌ T..." />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Lý do chọn</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} placeholder="Tại sao chọn nội dung này?" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Kênh đăng</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {channels.map(ch => (
                    <label key={ch} style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 12, padding: '4px 8px', borderRadius: 6, border: `1px solid ${form.channels.includes(ch) ? chColor(ch) : '#e6ddd0'}`, background: form.channels.includes(ch) ? chColor(ch) + '22' : '#fff' }}>
                      <input type="checkbox" checked={form.channels.includes(ch)} onChange={() => toggleChannel(ch)} style={{ accentColor: chColor(ch) }} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: chColor(ch), display: 'inline-block' }} />
                      {ch}
                    </label>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                  <input type="text" id="newChannelInput" placeholder="Thêm nền tảng..." style={{ ...inputStyle, flex: 1, marginBottom: 0 }} onKeyDown={e => { if (e.key === 'Enter') { addNewChannel(e.target.value); e.target.value = ''; } }} />
                  <button onClick={() => { const inp = document.getElementById('newChannelInput'); if (inp) { addNewChannel(inp.value); inp.value = ''; } }} style={{ padding: '4px 10px', border: 'none', borderRadius: 4, background: '#2f6b4f', color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+</button>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Link video/file</label>
                <input type="text" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} style={inputStyle} placeholder="https://drive.google.com/..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14, paddingTop: 10, borderTop: '1px solid #e6ddd0' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '7px 16px', borderRadius: 5, border: 'none', background: '#e6ddd0', color: '#2b241d', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
              <button onClick={saveRow} style={{ padding: '7px 16px', borderRadius: 5, border: 'none', background: '#40123e', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Lưu</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 20, right: 20, background: '#40123e', color: '#fff', padding: '10px 18px', borderRadius: 7, fontSize: 12.5, fontWeight: 600, zIndex: 300, boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>{toast}</div>
      )}
    </div>
  );
}

const thStyle = { background: '#40123e', color: '#fff', padding: '8px 8px', textAlign: 'left', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' };
const tdStyle = { padding: '5px 6px', border: '1px solid #e6ddd0', verticalAlign: 'top', background: '#fff' };
const tdStyleCenter = { ...tdStyle, textAlign: 'center', color: '#b6b1b7', fontSize: 11 };
const cellInput = { width: '100%', border: 'none', background: 'transparent', font: 'inherit', color: 'inherit', padding: 0, outline: 'none', fontSize: 12 };
const rowBtnStyle = { background: 'none', border: '1px solid #e6ddd0', borderRadius: 4, padding: '2px 6px', cursor: 'pointer', fontSize: 10 };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, marginBottom: 2, color: '#69626a', marginTop: 6 };
const inputStyle = { width: '100%', padding: '6px 8px', border: '1px solid #e6ddd0', borderRadius: 5, fontSize: 12.5, marginBottom: 2 };