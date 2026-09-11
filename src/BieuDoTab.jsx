export default function BieuDoTab() {
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
      <iframe
        src="/gtt-bieu-do-tong-quan.html"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="Biểu Đồ Tổng Quan"
      />
    </div>
  );
}