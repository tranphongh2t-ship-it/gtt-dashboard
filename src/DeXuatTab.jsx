import { useState, useEffect, useCallback } from "react";

const STATUSES = ['Đề xuất','Chờ duyệt','Đã duyệt','Phê duyệt chi phí','Thực hiện','Hoàn thành','Từ chối'];
const TYPES = ['Content mới','Cải thiện','Chi phí QC','Sự kiện','Khác'];
const CHANNELS = ['Fanpage','Fanpage (Reel)','Website','Fanpage + Website','TikTok','YouTube','Zalo','Nội bộ'];
const PRIORITIES = ['Cao','Trung bình','Thấp'];
const STORAGE_KEY = 'gtt_dx';

const STATUS_BADGE = {
  'Đề xuất': { bg: '#fdf1ea', color: '#b5502e' },
  'Chờ duyệt': { bg: '#fff8e1', color: '#f57f17' },
  'Đã duyệt': { bg: '#eef6f0', color: '#2f6b4f' },
  'Phê duyệt chi phí': { bg: '#e3f0ff', color: '#3b6b8a' },
  'Thực hiện': { bg: '#f3e5f5', color: '#7b1fa2' },
  'Hoàn thành': { bg: '#e8f5e9', color: '#1b5e20' },
  'Từ chối': { bg: '#fce4ec', color: '#c62828' },
};
const PRI_DOT = { 'Cao': '#c62828', 'Trung bình': '#f57f17', 'Thấp': '#2e7d32' };
const WF_STEPS = [
  { label: 'Đề xuất', color: '#b5502e', bg: '#fdf1ea' },
  { label: 'Chờ duyệt', color: '#f57f17', bg: '#fff8e1' },
  { label: 'Đã duyệt', color: '#2f6b4f', bg: '#eef6f0' },
  { label: 'Phê duyệt chi phí', color: '#3b6b8a', bg: '#e3f0ff' },
  { label: 'Thực hiện', color: '#7b1fa2', bg: '#f3e5f5' },
  { label: 'Hoàn thành', color: '#1b5e20', bg: '#e8f5e9' },
];

function fmtBudget(n) {
  if (!n) return '—';
  const num = Number(String(n).replace(/\D/g, ''));
  return num ? num.toLocaleString('vi-VN') + ' ₫' : '—';
}

export default function DeXuatTab({ Card, SecTitle, isMobile }) {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPri, setFilterPri] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [form, setForm] = useState(emptyForm());
  const [toast, setToast] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }, []);

  function emptyForm() {
    return { date: new Date().toISOString().slice(0, 10), author: '', type: 'Content mới', content: '', product: '', channel: 'Fanpage', priority: 'Trung bình', reason: '', budget: '', execDate: '', status: 'Đề xuất', approver: '', note: '' };
  }

  const filtered = data.filter((r, i) => {
    r._i = i;
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterPri && r.priority !== filterPri) return false;
    if (filterSearch && !(r.content + r.product + r.author + r.reason || '').toLowerCase().includes(filterSearch.toLowerCase())) return false;
    return true;
  });

  const kpiCounts = {};
  STATUSES.forEach(s => kpiCounts[s] = 0);
  data.forEach(r => kpiCounts[r.status] = (kpiCounts[r.status] || 0) + 1);
  const totalBudget = data.reduce((s, r) => s + Number(String(r.budget || '').replace(/\D/g, '') || 0), 0);

  function openModal() {
    setEditIdx(-1);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(i) {
    const r = data[i];
    setEditIdx(i);
    setForm({ date: r.date || '', author: r.author || '', type: r.type || 'Content mới', content: r.content || '', product: r.product || '', channel: r.channel || 'Fanpage', priority: r.priority || 'Trung bình', reason: r.reason || '', budget: r.budget || '', execDate: r.execDate || '', status: r.status || 'Đề xuất', approver: r.approver || '', note: r.note || '' });
    setModalOpen(true);
  }

  function saveRow() {
    if (editIdx >= 0) {
      setData(prev => { const nd = [...prev]; nd[editIdx] = { ...form }; return nd; });
      showToast('Đã cập nhật');
    } else {
      setData(prev => [...prev, { ...form }]);
      showToast('Đã thêm đề xuất');
    }
    setModalOpen(false);
  }

  function deleteRow(i) {
    if (!window.confirm('Xóa đề xuất này?')) return;
    setData(prev => prev.filter((_, idx) => idx !== i));
    showToast('Đã xóa');
  }

  function nextStatus(i) {
    const order = ['Đề xuất','Chờ duyệt','Đã duyệt','Phê duyệt chi phí','Thực hiện','Hoàn thành'];
    const cur = order.indexOf(data[i].status);
    let next;
    if (cur >= 0 && cur < order.length - 1) next = order[cur + 1];
    else if (data[i].status === 'Từ chối') next = 'Đề xuất';
    else return;
    setData(prev => { const nd = [...prev]; nd[i] = { ...nd[i], status: next }; return nd; });
    showToast('→ ' + next);
  }

  function cyclePri(i) {
    setData(prev => {
      const nd = [...prev];
      const p = nd[i].priority;
      nd[i] = { ...nd[i], priority: p === 'Cao' ? 'Trung bình' : p === 'Trung bình' ? 'Thấp' : 'Cao' };
      return nd;
    });
  }

  function exportCSV() {
    let csv = '\uFEFFNgày,Người đề xuất,Loại,Nội dung,Sản phẩm,Kênh,Ưu tiên,Lý do,Trạng thái,Chi phí,Ngày TH,Người duyệt,Ghi chú\n';
    data.forEach(r => {
      csv += `"${r.date || ''}","${r.author || ''}","${r.type || ''}","${(r.content || '').replace(/"/g, '""')}","${r.product || ''}","${r.channel || ''}","${r.priority || ''}","${(r.reason || '').replace(/"/g, '""')}","${r.status}","${r.budget || ''}","${r.execDate || ''}","${r.approver || ''}","${(r.note || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gtt-de-xuat.csv';
    a.click();
    showToast('Đã export CSV');
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#40123e,#9d5799)', color: '#fff', padding: isMobile ? '14px 16px' : '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: isMobile ? '0 0 12px 12px' : '0 0 16px 16px', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>📝 Đề xuất & Phê duyệt</div>
          <div style={{ fontSize: 11, opacity: 0.8, marginTop: 2 }}>Theo dõi luồng phê duyệt từ đề xuất đến hoàn thành</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={openModal} style={{ background: '#eec277', color: '#40123e', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>+ Đề xuất mới</button>
          <button onClick={exportCSV} style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>Export</button>
        </div>
      </div>

      {/* Workflow */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {WF_STEPS.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 14, fontSize: 11, fontWeight: 700, background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
                <span style={{ width: 18, height: 18, borderRadius: '50%', background: s.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, flexShrink: 0 }}>{i + 1}</span>
                {s.label}
              </div>
              {i < WF_STEPS.length - 1 && <span style={{ color: '#b6b1b7', fontSize: 12, margin: '0 3px' }}>→</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* KPI */}
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(7, 1fr)', gap: 0 }}>
          {[
            { label: 'Tổng', num: data.length, color: '#40123e' },
            { label: 'Đề xuất', num: kpiCounts['Đề xuất'], color: '#b5502e' },
            { label: 'Chờ duyệt', num: kpiCounts['Chờ duyệt'], color: '#f57f17' },
            { label: 'Đã duyệt', num: kpiCounts['Đã duyệt'], color: '#2f6b4f' },
            { label: 'Phê duyệt CP', num: kpiCounts['Phê duyệt chi phí'], color: '#3b6b8a' },
            { label: 'Hoàn thành', num: kpiCounts['Hoàn thành'], color: '#1b5e20' },
            { label: 'Tổng chi phí', num: fmtBudget(totalBudget), color: '#40123e', isStr: true },
          ].map((k, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '10px 6px', borderRight: i < 6 ? '1px solid #e6ddd0' : 'none' }}>
              <div style={{ fontSize: isMobile ? 16 : 22, fontWeight: 800, color: k.color }}>{k.isStr ? k.num : k.num}</div>
              <div style={{ fontSize: 10, color: '#69626a', marginTop: 2 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Filters */}
      <Card>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#69626a', fontWeight: 600 }}>Trạng thái:</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #e6ddd0', borderRadius: 5, fontSize: 12 }}>
            <option value="">Tất cả</option>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <label style={{ fontSize: 11, color: '#69626a', fontWeight: 600 }}>Ưu tiên:</label>
          <select value={filterPri} onChange={e => setFilterPri(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #e6ddd0', borderRadius: 5, fontSize: 12 }}>
            <option value="">Tất cả</option>
            {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input type="text" placeholder="Tìm nội dung, sản phẩm..." value={filterSearch} onChange={e => setFilterSearch(e.target.value)} style={{ padding: '5px 8px', border: '1px solid #e6ddd0', borderRadius: 5, fontSize: 12, minWidth: 180 }} />
        </div>
      </Card>

      {/* Table */}
      <Card style={{ overflow: 'auto' }}>
        {!filtered.length ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#b6b1b7' }}>
            <div style={{ fontSize: 36, marginBottom: 8, opacity: 0.35 }}>📋</div>
            <div style={{ fontSize: 13 }}>Chưa có đề xuất nào. Nhấn "Đề xuất mới" để bắt đầu.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? 11 : 12.5, minWidth: 1000 }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Ngày</th>
                <th style={thStyle}>Người ĐX</th>
                <th style={thStyle}>Loại</th>
                <th style={{ ...thStyle, minWidth: 160 }}>Nội dung</th>
                <th style={thStyle}>Sản phẩm</th>
                <th style={thStyle}>Kênh</th>
                <th style={thStyle}>Ưu tiên</th>
                <th style={{ ...thStyle, minWidth: 120 }}>Lý do</th>
                <th style={thStyle}>Trạng thái</th>
                <th style={thStyle}>Chi phí</th>
                <th style={thStyle}>Ngày TH</th>
                <th style={{ ...thStyle, width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r._i}>
                  <td style={tdStyleCenter}>{i + 1}</td>
                  <td style={tdStyle}><input type="date" value={r.date || ''} onChange={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], date: e.target.value }; setData(nd); }} style={cellInput} /></td>
                  <td style={tdStyle}><div contentEditable suppressContentEditableWarning onBlur={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], author: e.target.textContent }; setData(nd); }} style={{ outline: 'none', minHeight: 18 }}>{r.author || ''}</div></td>
                  <td style={tdStyle}>
                    <select value={r.type || 'Content mới'} onChange={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], type: e.target.value }; setData(nd); }} style={{ ...cellInput, cursor: 'pointer' }}>
                      {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle}><div contentEditable suppressContentEditableWarning onBlur={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], content: e.target.textContent }; setData(nd); }} style={{ outline: 'none', minHeight: 18, fontWeight: 600 }}>{r.content || ''}</div></td>
                  <td style={tdStyle}><div contentEditable suppressContentEditableWarning onBlur={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], product: e.target.textContent }; setData(nd); }} style={{ outline: 'none', minHeight: 18 }}>{r.product || ''}</div></td>
                  <td style={tdStyle}>
                    <select value={r.channel || 'Fanpage'} onChange={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], channel: e.target.value }; setData(nd); }} style={{ ...cellInput, cursor: 'pointer' }}>
                      {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, cursor: 'pointer' }} onClick={() => cyclePri(r._i)}>
                    <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: PRI_DOT[r.priority] || '#2e7d32', marginRight: 4, verticalAlign: 'middle' }} />
                    {r.priority || 'Thấp'}
                  </td>
                  <td style={tdStyle}><div contentEditable suppressContentEditableWarning onBlur={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], reason: e.target.textContent }; setData(nd); }} style={{ outline: 'none', minHeight: 18, fontSize: 11.5, color: '#69626a' }}>{r.reason || ''}</div></td>
                  <td style={tdStyle}>
                    <select value={r.status || 'Đề xuất'} onChange={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], status: e.target.value }; setData(nd); }} style={{ ...cellInput, fontWeight: 600, cursor: 'pointer' }}>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={tdStyle}><input type="text" value={r.budget || ''} onChange={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], budget: e.target.value }; setData(nd); }} style={{ ...cellInput, width: 80, textAlign: 'right', border: '1px solid #e6ddd0', borderRadius: 4, padding: '2px 4px' }} /></td>
                  <td style={tdStyle}><input type="date" value={r.execDate || ''} onChange={e => { const nd = [...data]; nd[r._i] = { ...nd[r._i], execDate: e.target.value }; setData(nd); }} style={cellInput} /></td>
                  <td style={{ ...tdStyle, textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                      <button onClick={() => openEdit(r._i)} title="Sửa" style={rowBtnStyle}>✏️</button>
                      <button onClick={() => nextStatus(r._i)} title="Chuyển bước" style={{ ...rowBtnStyle, color: '#2f6b4f' }}>→</button>
                      <button onClick={() => deleteRow(r._i)} title="Xóa" style={{ ...rowBtnStyle, color: '#a83232' }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModalOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, maxWidth: 560, width: '95%', maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 14, color: '#40123e', fontSize: 15 }}>{editIdx >= 0 ? 'Sửa đề xuất #' + (editIdx + 1) : 'Đề xuất mới'}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <label style={labelStyle}>Ngày đề xuất</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} />
              <label style={labelStyle}>Người đề xuất</label>
              <input type="text" value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} style={inputStyle} placeholder="Tên người đề xuất" />
              <label style={labelStyle}>Loại đề xuất</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} style={inputStyle}>
                {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label style={labelStyle}>Ưu tiên</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} style={inputStyle}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Nội dung đề xuất</label>
                <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Mô tả đề xuất..." />
              </div>
              <label style={labelStyle}>Sản phẩm / Mã hàng</label>
              <input type="text" value={form.product} onChange={e => setForm(f => ({ ...f, product: e.target.value }))} style={inputStyle} placeholder="VD: 388 SN, CHÌ T..." />
              <label style={labelStyle}>Kênh đăng</label>
              <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))} style={inputStyle}>
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Lý do đề xuất</label>
                <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} placeholder="Tại sao cần nội dung này?" />
              </div>
              <label style={labelStyle}>Chi phí dự kiến (VNĐ)</label>
              <input type="text" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} style={inputStyle} placeholder="0" />
              <label style={labelStyle}>Ngày thực hiện</label>
              <input type="date" value={form.execDate} onChange={e => setForm(f => ({ ...f, execDate: e.target.value }))} style={inputStyle} />
              <label style={labelStyle}>Trạng thái</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label style={labelStyle}>Người duyệt</label>
              <input type="text" value={form.approver} onChange={e => setForm(f => ({ ...f, approver: e.target.value }))} style={inputStyle} placeholder="Tên người duyệt" />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Ghi chú</label>
                <textarea value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} style={{ ...inputStyle, minHeight: 40, resize: 'vertical' }} placeholder="Ghi chú thêm..." />
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