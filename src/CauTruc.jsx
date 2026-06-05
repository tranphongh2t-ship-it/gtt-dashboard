import { useState } from "react";

const C = {
  purple:"#40123e",purpleMid:"#9d5799",purpleLight:"#f0dbef",
  gold:"#eec277",goldLight:"#faefdc",
  white:"#ffffff",offWhite:"#efefef",silver:"#dbdbdb",
  bg:"#faf8fa",cardBg:"#ffffff",border:"#e8e0e8",
  textMain:"#2a1229",textSub:"#69626a",textMuted:"#b6b1b7",
  teal:"#0f766e",green:"#1a3c2e",amber:"#92400e",
  red:"#991b1b",blue:"#1e40af",coral:"#9a3412",
};

const TABS = [
  {id:"overview",  label:"📊 Tổng Quan"},
  {id:"blog-cat",  label:"📂 Danh Mục Bài Viết"},
  {id:"blog-tag",  label:"🏷️ Thẻ Bài Viết"},
  {id:"prod-cat",  label:"📦 Danh Mục Sản Phẩm"},
  {id:"prod-tag",  label:"🔖 Thẻ Sản Phẩm"},
  {id:"rules",     label:"📋 Quy Tắc"},
  {id:"examples",  label:"💡 Ví Dụ Thực Tế"},
  {id:"url",       label:"🔗 Cấu Trúc URL"},
];

function Tag({text,color="teal",req}){
  const BG={teal:"#ccfbf1",gray:"#f1f5f9",amber:"#fef3c7",purple:"#ede9fe",red:"#fee2e2",green:"#dcfce7",blue:"#dbeafe",coral:"#ffedd5",pink:"#fce7f3"};
  const TX={teal:"#134e4a",gray:"#374151",amber:"#78350f",purple:"#4c1d95",red:"#7f1d1d",green:"#14532d",blue:"#1e3a8a",coral:"#7c2d12",pink:"#831843"};
  return <span style={{display:"inline-block",padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:600,background:BG[color]||BG.teal,color:TX[color]||TX.teal,margin:"2px 3px",border:`1px solid ${TX[color]||TX.teal}22`}}>{text}{req&&<span style={{marginLeft:4,fontSize:9,fontWeight:800,color:"#dc2626",background:"#fee2e2",borderRadius:99,padding:"0 4px"}}>BẮT BUỘC</span>}</span>;
}

function InfoBox({children,type="info"}){
  const styles={info:{bg:"#eff6ff",border:"#bfdbfe",icon:"ℹ️"},warn:{bg:"#fffbeb",border:"#fcd34d",icon:"⚠️"},tip:{bg:"#f0fdf4",border:"#86efac",icon:"💡"}};
  const s=styles[type]||styles.info;
  return <div style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:13,lineHeight:1.7,color:C.textMain}} dangerouslySetInnerHTML={{__html:children}}/>;
}

function Card({head,headColor="teal",children}){
  const BG={teal:"#0f766e",gray:"#4b5563",amber:"#d97706",purple:"#7c3aed",red:"#dc2626",green:"#16a34a",blue:"#2563eb",coral:"#ea580c",pink:"#db2777"};
  return(
    <div style={{background:C.cardBg,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden",boxShadow:"0 2px 8px #40123e08",marginBottom:12}}>
      <div style={{background:BG[headColor]||BG.teal,padding:"10px 16px",color:C.white,fontWeight:700,fontSize:13}}>{head}</div>
      <div style={{padding:"14px 16px"}}>{children}</div>
    </div>
  );
}

function SecTitle({children}){
  return <div style={{fontSize:15,fontWeight:800,color:C.purple,margin:"18px 0 12px",paddingBottom:8,borderBottom:`2px solid ${C.purpleLight}`,display:"flex",alignItems:"center",gap:8}}>{children}</div>;
}

function RuleTable({rows}){
  return(
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%",borderCollapse:"collapse",fontSize:12,marginBottom:12}}>
        <thead><tr style={{background:"#1a3c2e"}}>
          <th style={{padding:"8px 12px",textAlign:"left",color:C.white,fontWeight:700}}>Hạng mục</th>
          <th style={{padding:"8px 12px",textAlign:"left",color:C.white,fontWeight:700}}>Quy tắc</th>
        </tr></thead>
        <tbody>{rows.map((r,i)=>(
          <tr key={i} style={{background:i%2===0?C.bg:C.white,borderBottom:`1px solid ${C.border}`}}>
            <td style={{padding:"8px 12px",color:C.textMain,fontWeight:500}} dangerouslySetInnerHTML={{__html:r[0]}}/>
            <td style={{padding:"8px 12px",color:C.textSub}} dangerouslySetInnerHTML={{__html:r[1]}}/>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function CatTree({items,color="green"}){
  const[open,setOpen]=useState(items.map(()=>true));
  const BG={green:"#e8f5ee",purple:"#f3e8ff"};
  const TX={green:"#1a3c2e",purple:"#4c1d95"};
  const BC={green:"#a7d9bc",purple:"#c4b5fd"};
  return(
    <div style={{marginBottom:12}}>
      {items.map((item,i)=>(
        <div key={i} style={{marginBottom:6,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`}}>
          <div onClick={()=>setOpen(o=>{const n=[...o];n[i]=!n[i];return n;})}
            style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:BG[color],cursor:"pointer",userSelect:"none"}}>
            <span style={{fontSize:16}}>{item.icon}</span>
            <span style={{fontWeight:700,color:TX[color],flex:1,fontSize:13}}>{item.name}</span>
            <span style={{background:BC[color],color:TX[color],fontSize:10,fontWeight:700,padding:"1px 8px",borderRadius:99}}>{item.count}</span>
            <span style={{color:TX[color],fontSize:11,transition:"transform .2s",transform:open[i]?"rotate(90deg)":"rotate(0deg)"}}>▶</span>
          </div>
          {open[i]&&(
            <div style={{padding:"8px 14px 10px",background:C.bg}}>
              {item.children.map((c,j)=>(
                <div key={j} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderBottom:j<item.children.length-1?`1px dashed ${C.border}`:"none"}}>
                  <span style={{color:C.textMuted,fontSize:12}}>└</span>
                  <span style={{fontSize:12,color:C.textMain,flex:1}}>{c.name}</span>
                  <span style={{fontSize:11,color:C.textMuted,fontWeight:600}}>{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function ArtExample({title,catParent,catChild,tags,type="blog"}){
  return(
    <div style={{background:type==="blog"?"#f0fdf4":"#f5f3ff",borderRadius:12,border:`1px solid ${type==="blog"?"#86efac":"#c4b5fd"}`,padding:"14px 16px",marginBottom:10}}>
      <div style={{fontWeight:700,fontSize:13,color:C.textMain,marginBottom:8}}>{title}</div>
      <div style={{fontSize:11,color:C.textMuted,fontWeight:600,marginBottom:4}}>Danh mục:</div>
      <div style={{marginBottom:8}}>
        <span style={{background:type==="blog"?"#ccfbf1":"#ede9fe",color:type==="blog"?"#134e4a":"#4c1d95",padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:700}}>📂 {catParent}</span>
        <span style={{color:C.textMuted,margin:"0 4px",fontSize:12}}>→</span>
        <span style={{background:"#dcfce7",color:"#14532d",padding:"2px 10px",borderRadius:99,fontSize:11,fontWeight:600}}>{catChild}</span>
      </div>
      <div style={{fontSize:11,color:C.textMuted,fontWeight:600,marginBottom:4}}>Thẻ ({tags.length} thẻ):</div>
      <div>{tags.map((t,i)=><Tag key={i} text={t.text} color={t.color}/>)}</div>
    </div>
  );
}

function UrlEx({parts}){
  const colors={gray:"#718096",green:"#0f766e",blue:"#1e40af",orange:"#d97706"};
  return(
    <div style={{background:"#f8fafc",border:`1px solid ${C.border}`,borderRadius:8,padding:"8px 14px",fontFamily:"monospace",fontSize:12,marginBottom:6,flexWrap:"wrap",display:"flex",alignItems:"center",gap:0}}>
      {parts.map((p,i)=><span key={i} style={{color:colors[p.color]||colors.gray}}>{p.text}</span>)}
    </div>
  );
}

function WarnBox({children}){
  return <div style={{background:"#fffbeb",border:"1px solid #fcd34d",borderRadius:10,padding:"12px 16px",marginBottom:12,fontSize:12,lineHeight:1.7,color:"#78350f"}} dangerouslySetInnerHTML={{__html:children}}/>;
}

// ─── TAB CONTENT ─────────────────────────────────────────────────────────────

function Overview(){
  return(
    <div>
      <InfoBox type="info"><b>Nguyên tắc cốt lõi:</b> Site có <b>2 khu vực nội dung riêng biệt</b> — Bài viết Blog và Trang Sản phẩm. Mỗi khu vực có danh mục + thẻ riêng, nhưng <b>chia sẻ thẻ chung</b> để tạo internal link tự động và biến trang thẻ thành landing page SEO mạnh.</InfoBox>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
        <Card head="📝 Khu Vực Bài Viết (Blog)" headColor="teal">
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:10,fontSize:12}}>
            <span style={{background:"#e8f5ee",color:"#1a3c2e",padding:"4px 10px",borderRadius:8,fontWeight:600}}>Bài viết</span>
            <span style={{color:C.textMuted}}>→</span>
            <span style={{background:"#d1ece0",color:"#1a3c2e",padding:"4px 10px",borderRadius:8,fontWeight:600}}>1 Danh mục cha</span>
            <span style={{color:C.textMuted}}>→</span>
            <span style={{background:"#a7d9bc",color:"#1a3c2e",padding:"4px 10px",borderRadius:8,fontWeight:600}}>1 Danh mục con</span>
          </div>
          <div style={{fontSize:12,lineHeight:2}}>
            ✅ Mỗi bài chỉ thuộc <b>1 danh mục duy nhất</b><br/>
            ✅ URL: <code style={{background:"#f1f5f9",padding:"1px 6px",borderRadius:4}}>/kien-thuc/</code> · <code style={{background:"#f1f5f9",padding:"1px 6px",borderRadius:4}}>/so-sanh/</code><br/>
            ✅ Pillar Page = bài quan trọng nhất mỗi nhóm<br/>
            ✅ Thẻ mô tả: loại ván, bề mặt, ứng dụng
          </div>
        </Card>
        <Card head="🏷️ Khu Vực Sản Phẩm" headColor="purple">
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:10,fontSize:12}}>
            <span style={{background:"#f3e8ff",color:"#4c1d95",padding:"4px 10px",borderRadius:8,fontWeight:600}}>Sản phẩm</span>
            <span style={{color:C.textMuted}}>→</span>
            <span style={{background:"#ede9fe",color:"#4c1d95",padding:"4px 10px",borderRadius:8,fontWeight:600}}>1 Danh mục cha</span>
            <span style={{color:C.textMuted}}>→</span>
            <span style={{background:"#c4b5fd",color:"#4c1d95",padding:"4px 10px",borderRadius:8,fontWeight:600}}>1 Danh mục con</span>
          </div>
          <div style={{fontSize:12,lineHeight:2}}>
            ✅ Mỗi SP thuộc <b>1 cha + 1 con bắt buộc</b><br/>
            ✅ URL: <code style={{background:"#f1f5f9",padding:"1px 6px",borderRadius:4}}>/san-pham/melamine/ma-mau/</code><br/>
            ✅ Mỗi mã màu = 1 trang sản phẩm riêng<br/>
            ✅ Thẻ phục vụ bộ lọc: vân, màu, bề mặt
          </div>
        </Card>
      </div>
      <SecTitle>🔗 Thẻ Dùng Chung – Cầu Nối 2 Khu Vực</SecTitle>
      <InfoBox type="tip"><b>Tại sao quan trọng?</b> Khi bài viết và sản phẩm cùng dùng thẻ <b>walnut</b>, CMS tạo trang <code>/tag/walnut/</code> tổng hợp tất cả nội dung liên quan → landing page tự nhiên cho từ khóa "walnut nội thất" mà không cần tạo thêm bài.</InfoBox>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        <Card head="Thẻ chung: Bề mặt phủ" headColor="teal">
          <div>{["Melamine","Laminate","Laminate HPL","Acrylic","Veneer","PVC Film"].map(t=><Tag key={t} text={t} color="teal"/>)}</div>
          <p style={{fontSize:11.5,color:C.textSub,marginTop:8}}>Bài viết về sản phẩm nào → gắn thẻ đó. Trang SP cùng thẻ → kết nối tự động.</p>
        </Card>
        <Card head="Thẻ chung: Vân / Màu gỗ" headColor="amber">
          <div>{["Walnut","Oak","Maple","Cherry","Vân đá","Màu trắng","Màu xám","Màu đen"].map(t=><Tag key={t} text={t} color="amber"/>)}</div>
          <p style={{fontSize:11.5,color:C.textSub,marginTop:8}}>Trang thẻ tự gom bài so sánh + sản phẩm cùng vân đó thành 1 landing page.</p>
        </Card>
        <Card head="Thẻ chung: Ứng dụng" headColor="purple">
          <div>{["Tủ bếp","Tủ quần áo","Ốp tường","Sàn gỗ CN","Vách ngăn","Mặt bàn"].map(t=><Tag key={t} text={t} color="purple"/>)}</div>
          <p style={{fontSize:11.5,color:C.textSub,marginTop:8}}>Bài "làm tủ bếp" + SP "melamine tủ bếp" → cùng thẻ → gom 1 trang /tag/tu-bep/.</p>
        </Card>
      </div>
    </div>
  );
}

function BlogCat(){
  const cats=[
    {icon:"📖",name:"Kiến thức gỗ công nghiệp",count:"~110 bài",children:[{name:"Kiến thức cơ bản",count:"~45 bài"},{name:"Kinh nghiệm mua gỗ",count:"~20 bài"},{name:"Kỹ thuật gia công",count:"~40 bài"}]},
    {icon:"⚖️",name:"So sánh vật liệu",count:"~40 bài",children:[{name:"So sánh loại ván (MDF vs Plywood…)",count:"~20 bài"},{name:"So sánh bề mặt phủ (Melamine vs…)",count:"~20 bài"}]},
    {icon:"💰",name:"Báo giá & định mức",count:"~29 bài",children:[{name:"Báo giá vật liệu",count:"~15 bài"},{name:"Báo giá công trình nội thất",count:"~14 bài"}]},
    {icon:"🏠",name:"Ứng dụng nội thất",count:"~80 bài",children:[{name:"Nhà ở (tủ bếp, phòng ngủ, phòng khách)",count:"~50 bài"},{name:"Văn phòng & thương mại",count:"~17 bài"},{name:"Khách sạn & dịch vụ",count:"~13 bài"}]},
    {icon:"📰",name:"Tin tức & xu hướng",count:"~12 bài",children:[{name:"Xu hướng màu sắc nội thất",count:"~6 bài"},{name:"Case study công trình thực tế",count:"~6 bài"}]},
  ];
  return(
    <div>
      <InfoBox><b>Quy tắc:</b> Mỗi bài viết chỉ thuộc <b>1 danh mục cha</b> và tối đa <b>1 danh mục con</b>. Không chọn nhiều danh mục — gây duplicate content và loãng PageRank.</InfoBox>
      <SecTitle>📂 Cây Danh Mục Bài Viết (5 cha · 12 con)</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div><CatTree items={cats} color="green"/></div>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:C.textMain,marginBottom:10}}>Bài nào vào danh mục nào?</div>
          <RuleTable rows={[
            ["<b>Pillar Page</b> (tổng quan)","Kiến thức gỗ CN → Kiến thức cơ bản"],
            ['Bài "X là gì?"',"Kiến thức gỗ CN → Kiến thức cơ bản"],
            ['Bài "Kỹ thuật / DIY"',"Kiến thức gỗ CN → Kỹ thuật gia công"],
            ['Bài "Kinh nghiệm mua"',"Kiến thức gỗ CN → Kinh nghiệm mua gỗ"],
            ['Bài "A vs B so sánh"',"So sánh vật liệu → Tùy loại so sánh"],
            ['Bài "Giá / Báo giá"',"Báo giá & định mức → Tùy loại"],
            ["Bài ứng dụng nhà ở","Ứng dụng nội thất → Nhà ở"],
            ["Bài văn phòng / KS","Ứng dụng nội thất → Văn phòng & thương mại"],
            ["Bài xu hướng / case study","Tin tức & xu hướng → Tùy loại"],
          ]}/>
          <WarnBox><b>⚠️ Lỗi phổ biến cần tránh:</b><br/>❌ Chọn nhiều danh mục cho 1 bài<br/>❌ Để bài ở danh mục cha, không chọn danh mục con<br/>❌ Tạo danh mục mới cho từng sản phẩm<br/>✅ Chỉ 1 danh mục, chọn con cụ thể nhất</WarnBox>
        </div>
      </div>
    </div>
  );
}

function BlogTag(){
  const groups=[
    {head:"Nhóm 1: Loại ván gỗ",color:"gray",req:true,tags:["MDF","HDF","Plywood","Ván dăm","Ván dăm kháng ẩm","OSB","Ván nhựa PVC","Ván nhựa WPC","LVL"],note:'Bài "MDF là gì" → thẻ <b>MDF</b>. Bài "MDF vs Plywood" → gắn <b>MDF</b> + <b>Plywood</b>.'},
    {head:"Nhóm 2: Bề mặt phủ",color:"teal",req:true,tags:["Melamine","Laminate","Laminate HPL","Acrylic","Veneer","PVC Film","Sơn PU","Chỉ nẹp PVC"],note:"Thẻ dùng chung với khu vực sản phẩm. Tên phải viết nhất quán trên toàn site."},
    {head:"Nhóm 3: Vân gỗ & màu sắc",color:"amber",req:false,tags:["Walnut","Oak","Maple","Cherry","Beech","Elm","Vân đá","Marble","Màu trắng","Màu xám","Màu đen","Màu walnut"],note:"Chỉ gắn khi bài tập trung vào vân/màu đó."},
    {head:"Nhóm 4: Ứng dụng",color:"purple",req:true,tags:["Tủ bếp","Tủ quần áo","Ốp tường","Sàn gỗ CN","Vách ngăn","Mặt bàn","Trần giả gỗ","Kệ sách","Cửa gỗ CN","Bàn làm việc","Nội thất VP","Nội thất KS"],note:"Thẻ dùng chung với sản phẩm → tạo trang /tag/tu-bep/."},
    {head:"Nhóm 5: Tính năng & tiêu chuẩn",color:"red",req:false,tags:["Chống ẩm","Chống cháy","Kháng khuẩn","E0","E1","Tiêu chuẩn E0 E1","Formaldehyde","HPL cao áp"],note:"Gắn khi bài chuyên sâu về tiêu chuẩn."},
    {head:"Nhóm 6: Phong cách thiết kế",color:"green",req:false,tags:["Scandinavian","Industrial","Minimalist","Japandi","Luxury","Modern Classic","Wabi Sabi"],note:"Gắn khi bài hướng dẫn thiết kế theo phong cách cụ thể."},
    {head:"Nhóm 7: Xu hướng & thời gian",color:"coral",req:false,tags:["2025","2026","Xu hướng màu","Xu hướng nội thất","Mocha Mousse","Neo Mint"],note:"Dùng cho bài dự báo xu hướng. Cần cập nhật hàng năm."},
    {head:"Nhóm 8: Địa điểm",color:"blue",req:false,tags:["TPHCM","Hà Nội","Bình Dương","Đà Nẵng","Miền Nam","Miền Bắc"],note:"Chỉ cho bài có yếu tố địa phương."},
    {head:"Nhóm 9: Loại nội dung",color:"gray",req:false,tags:["DIY tự làm","Cho người mới","Hướng dẫn step-by-step","FAQ","Case study","Checklist","Kinh nghiệm thực tế"],note:"Giúp người đọc lọc theo dạng nội dung."},
  ];
  return(
    <div>
      <InfoBox><b>Quy tắc thẻ bài viết:</b> Mỗi bài dùng <b>5–8 thẻ</b>. Chọn thẻ mô tả nội dung thực tế — thẻ nào bài nhắc đến ≥ 3 lần thì gắn, nhắc thoáng qua thì bỏ. Không gắn thẻ "cho có".</InfoBox>
      <SecTitle>9 Nhóm Thẻ Bài Viết</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {groups.map((g,i)=>(
          <Card key={i} head={`${g.head}${g.req?" ✦":""}`} headColor={g.color}>
            <div>{g.tags.map(t=><Tag key={t} text={t} color={g.color}/>)}</div>
            <p style={{fontSize:11.5,color:C.textSub,marginTop:8}} dangerouslySetInnerHTML={{__html:g.note}}/>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProdCat(){
  const cats=[
    {icon:"🎨",name:"Melamine",count:"~200 SKU",children:[{name:"Melamine vân gỗ",count:"~120 mã"},{name:"Melamine đơn sắc",count:"~50 mã"},{name:"Melamine vân đá & vải",count:"~30 mã"}]},
    {icon:"📋",name:"Laminate / HPL",count:"~90 SKU",children:[{name:"LP series vân gỗ",count:"~50 mã"},{name:"LP series vân đá",count:"~10 mã"},{name:"LP series đơn sắc",count:"~10 mã"},{name:"LE series",count:"~20 mã"}]},
    {icon:"✨",name:"Acrylic",count:"~35 SKU",children:[{name:"Glass Series (AM / AS)",count:"~19 mã"},{name:"Glass Series vân gỗ (AW)",count:"~4 mã"},{name:"Ultra Series (US / UM)",count:"~8 mã"}]},
    {icon:"🎞️",name:"PVC Film",count:"~35 SKU",children:[{name:"PVC Film vân gỗ (NW / PW / PM)",count:"~25 mã"},{name:"PVC Film đơn sắc (NS)",count:"~2 mã"},{name:"Màng PET bóng (SS)",count:"~2 mã"},{name:"PVC Film vân đá (NM)",count:"~1 mã"}]},
    {icon:"🍂",name:"Veneer gỗ tự nhiên",count:"~6 SKU",children:[{name:"Veneer Walnut",count:"~2 mã"},{name:"Veneer Oak",count:"~2 mã"},{name:"Veneer Cherry",count:"~2 mã"}]},
    {icon:"🔲",name:"Chỉ nẹp nhựa PVC",count:"~5 SKU",children:[{name:"Chỉ nẹp đơn sắc (trắng, đen)",count:"~2 mã"},{name:"Chỉ nẹp vân gỗ 1/2/3",count:"~3 mã"}]},
  ];
  return(
    <div>
      <InfoBox><b>Quy tắc:</b> Cấu trúc 2 cấp — cha là nhóm vật liệu lớn, con là phân loại theo đặc điểm. Mỗi sản phẩm <b>bắt buộc có cả cha lẫn con</b>. URL phản ánh cấu trúc này.</InfoBox>
      <SecTitle>6 Danh Mục Sản Phẩm Cha · 16+ Danh Mục Con</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <CatTree items={cats.slice(0,3)} color="purple"/>
        <CatTree items={cats.slice(3)} color="purple"/>
      </div>
      <WarnBox><b>⚠️ Không tạo danh mục theo từng mã màu</b> — "Melamine Walnut Arizona" không phải danh mục, đó là trang sản phẩm. Danh mục chỉ gồm 6 cha + 16 con như trên là đủ.</WarnBox>
    </div>
  );
}

function ProdTag(){
  const groups=[
    {head:"Nhóm 1: Tên vân gỗ",color:"amber",req:true,tags:["Walnut","Oak","Maple","Cherry","Beech","Elm","Acacia","Hickory"],note:'Dùng tên gỗ tiếng Anh để chuẩn hóa. SP "Sonoma Oak" → thẻ <b>Oak</b>.'},
    {head:"Nhóm 2: Màu đơn sắc",color:"gray",req:true,tags:["Trắng","Đen","Xám nhạt","Xám đậm","Nâu","Nâu latte","Kem","Xanh dương","Hồng","Cam"],note:'"Magic Black" → thẻ <b>Đen</b>. Dùng tiếng Việt cho bộ lọc thân thiện.'},
    {head:"Nhóm 3: Vân đặc biệt",color:"gray",req:false,tags:["Vân đá","Marble","Marquina","Volakas","Vân vải","Linen","Terrazzo","Ánh kim"],note:"LP D5 Volakas → <b>Vân đá</b> + <b>Volakas</b>."},
    {head:"Nhóm 4: Bề mặt / Độ bóng",color:"teal",req:true,tags:["Bóng gương","Mờ matt","Silk","Sync pore","Emboss","Nhám"],note:"Thẻ bộ lọc quan trọng nhất. Acrylic → <b>Bóng gương</b>. Melamine mờ → <b>Mờ matt</b>."},
    {head:"Nhóm 5: Tính năng đặc biệt",color:"red",req:true,tags:["Chống ẩm","Kháng ẩm","Chống cháy","Kháng khuẩn","Chống trầy","UV chống ố","Dễ vệ sinh"],note:"Người mua tủ bếp thường lọc <b>Chống ẩm</b> đầu tiên."},
    {head:"Nhóm 6: Tiêu chuẩn an toàn",color:"red",req:true,tags:["E0","E1","HPL cao áp","LPL","Nhập khẩu","Nội địa","Châu Âu"],note:"E0/E1 quan trọng cho phân khúc có con nhỏ."},
    {head:"Nhóm 7: Ứng dụng phù hợp",color:"purple",req:true,tags:["Tủ bếp","Tủ quần áo","Ốp tường","Mặt bàn","Vách ngăn","Cửa tủ","Trần giả gỗ","Nội thất VP","Nội thất KS"],note:"Gắn ≥ 2 ứng dụng. Thẻ dùng chung với bài viết — quan trọng nhất cho internal link."},
    {head:"Nhóm 8: Thương hiệu / Xuất xứ",color:"blue",req:false,tags:["Egger","Kronospan","An Cường","Đức","Áo","Thái Lan","Việt Nam"],note:"Trang /product-tag/egger/ → landing page hữu ích cho người tìm theo thương hiệu."},
    {head:"Nhóm 9: Kích thước tiêu chuẩn",color:"coral",req:false,tags:["6mm","9mm","12mm","15mm","18mm","25mm","1220x2440"],note:"Gắn độ dày thực tế SP có sẵn. Chỉ gắn loại chính bán nhiều nhất."},
    {head:"Nhóm 10: Phong cách thiết kế",color:"amber",req:false,tags:["Scandinavian","Industrial","Minimalist","Luxury","Classic","Modern","Japandi"],note:"Acrylic trắng bóng → <b>Minimalist</b> + <b>Modern</b>."},
  ];
  return(
    <div>
      <InfoBox><b>Quy tắc thẻ sản phẩm:</b> Mỗi SP dùng <b>6–10 thẻ</b>. Bắt buộc đủ 4 nhóm cốt lõi: vân/màu + bề mặt + tính năng + ứng dụng. Thẻ phục vụ bộ lọc catalog và SEO faceted navigation.</InfoBox>
      <SecTitle>10 Nhóm Thẻ Sản Phẩm</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:12}}>
        {groups.map((g,i)=>(
          <Card key={i} head={`${g.head}${g.req?" ✦":""}`} headColor={g.color}>
            <div>{g.tags.map(t=><Tag key={t} text={t} color={g.color}/>)}</div>
            <p style={{fontSize:11.5,color:C.textSub,marginTop:8}} dangerouslySetInnerHTML={{__html:g.note}}/>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Rules(){
  return(
    <div>
      <SecTitle>📋 Bảng Quy Tắc Tổng Hợp</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:C.textMain,marginBottom:10}}>Quy tắc Bài viết Blog</div>
          <RuleTable rows={[
            ["<b>Số danh mục cha</b>",'<span style="color:#16a34a;font-weight:700">Đúng 1</span> — không chọn nhiều'],
            ["<b>Số danh mục con</b>",'<span style="color:#16a34a;font-weight:700">1 hoặc 0</span>'],
            ["<b>Số thẻ tối thiểu</b>",'<span style="color:#16a34a;font-weight:700">5 thẻ</span>'],
            ["<b>Số thẻ tối đa</b>",'<span style="color:#16a34a;font-weight:700">8 thẻ</span>'],
            ["<b>Thẻ bắt buộc</b>","Loại ván + Bề mặt phủ (nếu bài đề cập)"],
            ["<b>Thẻ ứng dụng</b>",'<span style="color:#16a34a;font-weight:700">BẮT BUỘC</span> cho bài ứng dụng nội thất'],
            ["<b>Thẻ địa điểm</b>",'<span style="color:#d97706">Tùy chọn</span> — chỉ bài địa phương hóa'],
            ["<b>Thẻ năm (2025…)</b>",'<span style="color:#d97706">Tùy chọn</span> — chỉ bài xu hướng'],
            ["<b>Pillar Page có thẻ không?</b>",'<span style="color:#16a34a;font-weight:700">Có</span> — 6–8 thẻ tổng quát'],
            ["<b>Cập nhật thẻ khi refresh</b>",'<span style="color:#16a34a;font-weight:700">Có</span> — thêm thẻ năm mới'],
          ]}/>
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:C.textMain,marginBottom:10}}>Quy tắc Trang Sản phẩm</div>
          <RuleTable rows={[
            ["<b>Số danh mục cha</b>",'<span style="color:#16a34a;font-weight:700">Đúng 1</span>'],
            ["<b>Số danh mục con</b>",'<span style="color:#16a34a;font-weight:700">Đúng 1</span> — BẮT BUỘC'],
            ["<b>Số thẻ tối thiểu</b>",'<span style="color:#16a34a;font-weight:700">6 thẻ</span>'],
            ["<b>Số thẻ tối đa</b>",'<span style="color:#16a34a;font-weight:700">10 thẻ</span>'],
            ["<b>4 nhóm thẻ bắt buộc</b>","Vân/màu + Bề mặt + Tính năng + Ứng dụng"],
            ["<b>Thẻ thương hiệu</b>",'<span style="color:#d97706">Tùy chọn</span> — nếu có TH rõ'],
            ["<b>Thẻ kích thước</b>",'<span style="color:#d97706">Tùy chọn</span> — nếu SP nhiều size'],
            ["<b>Thẻ dùng chung Blog</b>",'<span style="color:#16a34a;font-weight:700">Bề mặt + Ứng dụng</span> — tên phải nhất quán'],
            ["<b>Không dùng thẻ gì?</b>",'<span style="color:#dc2626">Không</span> dùng thẻ địa điểm, thẻ năm'],
          ]}/>
        </div>
      </div>
      <SecTitle>⚠️ Những Điều Tuyệt Đối Không Làm</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
        <WarnBox><b>❌ Không tạo thẻ trùng nghĩa</b><br/>Vừa có "Ván MDF" vừa có "MDF" vừa có "Tấm MDF" → 3 thẻ giống nhau, gây phân tán. Chọn 1 tên chuẩn dùng nhất quán toàn site.</WarnBox>
        <WarnBox><b>❌ Không tạo thẻ quá cụ thể</b><br/>Thẻ "Melamine 319 Classical Walnut" → chỉ 1 SP có thẻ này, trang thẻ sẽ trống. Thẻ cần dùng ≥ 3–5 lần mới có giá trị SEO.</WarnBox>
        <WarnBox><b>❌ Không để thẻ dùng chung tên khác nhau</b><br/>Blog dùng "Tủ Bếp" nhưng SP dùng "tu-bep" → CMS tạo 2 trang thẻ khác nhau. Phải chuẩn hóa tên thẻ cho cả 2 khu vực.</WarnBox>
      </div>
    </div>
  );
}

function Examples(){
  return(
    <div>
      <SecTitle>💡 Ví Dụ Gắn Danh Mục & Thẻ Thực Tế</SecTitle>
      <div style={{fontWeight:700,fontSize:13,color:C.textMain,marginBottom:10}}>Bài viết Blog</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12,marginBottom:20}}>
        <ArtExample title="📝 Melamine Vân Walnut – Tổng Hợp Mã Màu & Báo Giá" catParent="Kiến thức gỗ CN" catChild="Kiến thức cơ bản" tags={[{text:"Melamine",color:"teal"},{text:"Walnut",color:"amber"},{text:"Màu walnut",color:"amber"},{text:"Vân gỗ",color:"amber"},{text:"Tủ bếp",color:"purple"},{text:"Tủ quần áo",color:"purple"},{text:"2025",color:"coral"}]}/>
        <ArtExample title="📝 MDF vs Plywood – So Sánh Chi Tiết Cho Nội Thất" catParent="So sánh vật liệu" catChild="So sánh loại ván" tags={[{text:"MDF",color:"gray"},{text:"Plywood",color:"gray"},{text:"Chống ẩm",color:"red"},{text:"Tủ bếp",color:"purple"},{text:"Nội thất VP",color:"purple"},{text:"Cho người mới",color:"gray"}]}/>
        <ArtExample title="📝 Chi Phí Làm Tủ Bếp Gỗ Công Nghiệp – Bảng Giá 2025" catParent="Báo giá & định mức" catChild="Báo giá công trình" tags={[{text:"MDF",color:"gray"},{text:"Melamine",color:"teal"},{text:"Laminate",color:"teal"},{text:"Tủ bếp",color:"purple"},{text:"Chống ẩm",color:"red"},{text:"2025",color:"coral"},{text:"Checklist",color:"gray"}]}/>
        <ArtExample title="📝 Ốp Tường Gỗ CN Phòng Ngủ – Mẫu Đẹp 2025" catParent="Ứng dụng nội thất" catChild="Nhà ở" tags={[{text:"Melamine",color:"teal"},{text:"Laminate",color:"teal"},{text:"Walnut",color:"amber"},{text:"Oak",color:"amber"},{text:"Ốp tường",color:"purple"},{text:"Scandinavian",color:"green"},{text:"Minimalist",color:"green"},{text:"2025",color:"coral"}]}/>
      </div>
      <div style={{fontWeight:700,fontSize:13,color:C.textMain,marginBottom:10}}>Trang Sản Phẩm</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))",gap:12}}>
        <ArtExample type="product" title="🏷️ SP: Melamine 319 Classical Walnut" catParent="Melamine" catChild="Melamine vân gỗ" tags={[{text:"Walnut",color:"amber"},{text:"Classical Walnut",color:"amber"},{text:"Mờ matt",color:"teal"},{text:"E1",color:"red"},{text:"Chống trầy",color:"red"},{text:"Tủ bếp",color:"purple"},{text:"Tủ quần áo",color:"purple"},{text:"Egger",color:"blue"},{text:"Luxury",color:"amber"}]}/>
        <ArtExample type="product" title="🏷️ SP: Acrylic US 106 Jet Black" catParent="Acrylic" catChild="Ultra Series" tags={[{text:"Đen",color:"gray"},{text:"Bóng gương",color:"teal"},{text:"E0",color:"red"},{text:"UV chống ố",color:"red"},{text:"Chống trầy",color:"red"},{text:"Tủ bếp",color:"purple"},{text:"Cửa tủ",color:"purple"},{text:"Minimalist",color:"amber"}]}/>
        <ArtExample type="product" title="🏷️ SP: LP D5G Volakas Marble" catParent="Laminate / HPL" catChild="LP series vân đá" tags={[{text:"Vân đá",color:"gray"},{text:"Marble",color:"gray"},{text:"Volakas",color:"gray"},{text:"Trắng",color:"gray"},{text:"Mờ matt",color:"teal"},{text:"HPL cao áp",color:"red"},{text:"Chống ẩm",color:"red"},{text:"Mặt bàn",color:"purple"},{text:"Ốp tường",color:"purple"}]}/>
        <ArtExample type="product" title="🏷️ SP: Melamine 204 Iron Grey" catParent="Melamine" catChild="Melamine đơn sắc" tags={[{text:"Xám đậm",color:"gray"},{text:"Iron Grey",color:"gray"},{text:"Mờ matt",color:"teal"},{text:"Silk",color:"teal"},{text:"E1",color:"red"},{text:"Chống trầy",color:"red"},{text:"Tủ bếp",color:"purple"},{text:"Industrial",color:"amber"}]}/>
      </div>
    </div>
  );
}

function UrlStructure(){
  return(
    <div>
      <InfoBox><b>URL phản ánh cấu trúc danh mục.</b> URL chuẩn giúp Google hiểu hierarchy của site, tối ưu crawl budget, và giúp người dùng biết mình đang ở đâu chỉ qua đọc URL.</InfoBox>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:C.textMain,marginBottom:10}}>URL Bài Viết Blog</div>
          <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:8}}>Cấu trúc chung:</div>
          <UrlEx parts={[{text:"domain.com/",color:"gray"},{text:"[danh-muc-cha]/",color:"green"},{text:"[ten-bai-viet]/",color:"blue"}]}/>
          <div style={{fontSize:12,fontWeight:700,color:C.textMuted,margin:"12px 0 8px"}}>Ví dụ:</div>
          {[
            [{text:"domain.com/",color:"gray"},{text:"kien-thuc/",color:"green"},{text:"van-mdf-la-gi/",color:"blue"}],
            [{text:"domain.com/",color:"gray"},{text:"so-sanh/",color:"green"},{text:"mdf-vs-plywood/",color:"blue"}],
            [{text:"domain.com/",color:"gray"},{text:"bao-gia/",color:"green"},{text:"gia-van-mdf-2025/",color:"blue"}],
            [{text:"domain.com/",color:"gray"},{text:"ung-dung/",color:"green"},{text:"lam-tu-bep-go-cong-nghiep/",color:"blue"}],
            [{text:"domain.com/",color:"gray"},{text:"tin-tuc/",color:"green"},{text:"xu-huong-mau-noi-that-2025/",color:"blue"}],
          ].map((p,i)=><UrlEx key={i} parts={p}/>)}
        </div>
        <div>
          <div style={{fontWeight:700,fontSize:13,color:C.textMain,marginBottom:10}}>URL Trang Sản Phẩm</div>
          <div style={{fontSize:12,fontWeight:600,color:C.textSub,marginBottom:8}}>Cấu trúc chung:</div>
          <UrlEx parts={[{text:"domain.com/",color:"gray"},{text:"san-pham/",color:"green"},{text:"[danh-muc-con]/",color:"orange"},{text:"[ten-ma-mau]/",color:"blue"}]}/>
          <div style={{fontSize:12,fontWeight:700,color:C.textMuted,margin:"12px 0 8px"}}>Ví dụ:</div>
          {[
            [{text:"domain.com/",color:"gray"},{text:"san-pham/",color:"green"},{text:"melamine/",color:"orange"},{text:"319-classical-walnut/",color:"blue"}],
            [{text:"domain.com/",color:"gray"},{text:"san-pham/",color:"green"},{text:"laminate/",color:"orange"},{text:"lp-388ev-oak-santana/",color:"blue"}],
            [{text:"domain.com/",color:"gray"},{text:"san-pham/",color:"green"},{text:"acrylic/",color:"orange"},{text:"us-106-jet-black/",color:"blue"}],
            [{text:"domain.com/",color:"gray"},{text:"san-pham/",color:"green"},{text:"pvc-film/",color:"orange"},{text:"nw-01-van-go/",color:"blue"}],
            [{text:"domain.com/",color:"gray"},{text:"san-pham/",color:"green"},{text:"veneer/",color:"orange"},{text:"veneer-walnut/",color:"blue"}],
          ].map((p,i)=><UrlEx key={i} parts={p}/>)}
        </div>
      </div>
      <SecTitle>🔗 URL Trang Thẻ & Danh Mục (Tự Động Tạo Bởi CMS)</SecTitle>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
        <Card head="Trang thẻ bài viết (WordPress)" headColor="teal">
          {[["domain.com/","tag/melamine/"],["domain.com/","tag/walnut/"],["domain.com/","tag/tu-bep/"],["domain.com/","tag/chong-am/"]].map((p,i)=>(
            <UrlEx key={i} parts={[{text:p[0],color:"gray"},{text:p[1],color:"green"}]}/>
          ))}
          <p style={{fontSize:11.5,color:C.textSub,marginTop:8}}>Gom tất cả bài blog có thẻ đó. Tối ưu meta title cho trang thẻ quan trọng.</p>
        </Card>
        <Card head="Trang thẻ sản phẩm (WooCommerce)" headColor="coral">
          {[["domain.com/","product-tag/walnut/"],["domain.com/","product-tag/bong-guong/"],["domain.com/","product-tag/chong-am/"],["domain.com/","product-tag/tu-bep/"]].map((p,i)=>(
            <UrlEx key={i} parts={[{text:p[0],color:"gray"},{text:p[1],color:"orange"}]}/>
          ))}
          <p style={{fontSize:11.5,color:C.textSub,marginTop:8}}>Catalog SP lọc tự động = faceted navigation chuẩn SEO.</p>
        </Card>
        <Card head="Trang danh mục" headColor="green">
          {[["domain.com/","kien-thuc/"],["domain.com/","so-sanh/"],["domain.com/","san-pham/melamine/"],["domain.com/","san-pham/laminate/"]].map((p,i)=>(
            <UrlEx key={i} parts={[{text:p[0],color:"gray"},{text:p[1],color:"green"}]}/>
          ))}
          <p style={{fontSize:11.5,color:C.textSub,marginTop:8}}>Trang danh mục cần 150–300 từ mô tả ở đầu trang. Đây là Pillar Page của nhóm đó.</p>
        </Card>
      </div>
      <InfoBox type="tip"><b>💡 WordPress + WooCommerce:</b> Post Tags (<code>/tag/</code>) và Product Tags (<code>/product-tag/</code>) là 2 hệ thống tách biệt. Muốn 1 trang landing tổng hợp cả bài viết lẫn sản phẩm → tạo trang tĩnh riêng và embed widget hoặc dùng plugin như <b>FacetWP</b> để tạo trang lọc thống nhất.</InfoBox>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function CauTruc({isMobile}){
  const[activeTab,setActiveTab]=useState("overview");

  const content={
    overview:<Overview/>,
    "blog-cat":<BlogCat/>,
    "blog-tag":<BlogTag/>,
    "prod-cat":<ProdCat/>,
    "prod-tag":<ProdTag/>,
    rules:<Rules/>,
    examples:<Examples/>,
    url:<UrlStructure/>,
  };

  return(
    <div>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1a3c2e,#2d6a4f)",borderRadius:14,padding:isMobile?"14px 16px":"18px 24px",marginBottom:16,boxShadow:"0 4px 16px #1a3c2e33"}}>
        <div style={{fontSize:isMobile?15:20,fontWeight:900,color:"#ffffff",marginBottom:6}}>🌲 Cấu Trúc Danh Mục & Thẻ – Gỗ Thanh Thùy</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,.7)",marginBottom:14}}>Hệ thống phân loại chuẩn SEO cho 2 khu vực: Bài viết Blog & Trang Sản phẩm · 521 bài · 36 tháng</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[{n:5,l:"DM bài viết cha"},{n:6,l:"DM sản phẩm cha"},{n:9,l:"Nhóm thẻ bài viết"},{n:10,l:"Nhóm thẻ sản phẩm"},{n:"~80",l:"Tổng số thẻ"}].map(s=>(
            <div key={s.l} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:10,padding:isMobile?"8px 10px":"10px 14px",textAlign:"center",minWidth:isMobile?60:80}}>
              <div style={{fontSize:isMobile?18:22,fontWeight:900,color:"#fcd34d",lineHeight:1}}>{s.n}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,.65)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tab nav */}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:16,WebkitOverflowScrolling:"touch"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setActiveTab(t.id)} style={{padding:isMobile?"7px 12px":"8px 16px",borderRadius:10,border:`1.5px solid ${activeTab===t.id?"#1a3c2e":"#dbdbdb"}`,background:activeTab===t.id?"#1a3c2e":"#ffffff",color:activeTab===t.id?"#ffffff":"#69626a",fontWeight:700,fontSize:isMobile?10:12,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,fontFamily:"inherit",transition:"all .15s"}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{background:"#ffffff",borderRadius:14,border:"1px solid #e8e0e8",padding:isMobile?"14px":"20px 24px",boxShadow:"0 2px 8px #40123e08"}}>
        {content[activeTab]}
      </div>
    </div>
  );
}
