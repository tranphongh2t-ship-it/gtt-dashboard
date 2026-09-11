export default function BieuDoTab({ isMobile }) {
  return (
    <div style={{ margin: isMobile ? '0 -12px' : '0 -20px' }}>
      <iframe
        src="/gtt-bieu-do-tong-quan.html"
        style={{ width: '100%', height: 'calc(100vh - 80px)', border: 'none', display: 'block' }}
        title="Biểu Đồ Tổng Quan"
      />
    </div>
  );
}