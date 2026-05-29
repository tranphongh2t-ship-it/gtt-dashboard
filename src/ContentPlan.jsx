import { useState, useMemo, useEffect } from "react";
import { SEO_DATA } from "./seoData";

const C = {
  purple:"#40123e",purpleMid:"#9d5799",purpleLight:"#f0dbef",
  gold:"#eec277",white:"#ffffff",offWhite:"#efefef",silver:"#dbdbdb",
  bg:"#faf8fa",cardBg:"#ffffff",border:"#e8e0e8",
  textMain:"#2a1229",textSub:"#69626a",textMuted:"#b6b1b7",
};

const GRP_LABELS={G0:"🏛️ Pillar",G1:"🌿 Tổng quan",G2:"🪵 MDF/HDF",G3:"🎨 Melamine",G4:"📋 Laminate",G5:"✨ Acrylic",G6:"🎞️ PVC/Nẹp",G7:"🍂 Veneer",G8:"🏠 Nhà ở",G9:"🏢 VP/KS",G10:"⚖️ So sánh",G11:"💰 Báo giá",G12:"🔧 Kỹ thuật"};
const GRP_COLORS={G0:"#1a3c2e",G1:"#2d6a4f",G2:"#dc2626",G3:"#d97706",G4:"#059669",G5:"#7c3aed",G6:"#0284c7",G7:"#92400e",G8:"#be185d",G9:"#0f766e",G10:"#1d4ed8",G11:"#065f46",G12:"#4b5563"};
const DIFF_C={"Dễ":"#dcfce7|#166534","TB":"#fef9c3|#854d0e","Khó":"#fee2e2|#991b1b"};
const INTENT_C={"Thông tin":"#e0e7ff|#3730a3","Mua hàng":"#dcfce7|#166534","So sánh":"#fef3c7|#92400e","KT thuật":"#fce7f3|#9d174d","Ứng dụng":"#dcfce7|#166534"};
const PRIO_C={P1:"#fee2e2|#991b1b",P2:"#ffedd5|#9a3412",P3:"#dbeafe|#1e40af",P4:"#ede9fe|#5b21b6"};

function Bdg({text,cs,sm}){
  if(!text)return null;
  const[bg,col]=(cs||"#e5e7eb|#374151").split("|");
  return<span style={{display:"inline-block",padding:sm?"1px 6px":"2px 8px",borderRadius:99,fontSize:sm?9:10,fontWeight:700,background:bg,color:col,whiteSpace:"nowrap"}}>{text}</span>;
}

export default function ContentPlan({isAdmin,apiSet,apiGet,isMobile}){
  const[written,setWritten]=useState({});
  const[loading,setLoading]=useState(true);
  const[search,setSearch]=useState("");
  const[fg,setFg]=useState("all");
  const[fp,setFp]=useState("all");
  const[fs,setFs]=useState("all");
  const[page,setPage]=useState(1);
  const[saving,setSaving]=useState(false);
  const PER=isMobile?20:50;

  useEffect(()=>{
    apiGet("seo_written").then(d=>{
      if(d&&typeof d==="object")setWritten(d);
      setLoading(false);
    }).catch(()=>setLoading(false));
  },[]);

  async function toggle(id){
    if(!isAdmin)return;
    const next={...written,[id]:!written[id]};
    setWritten(next);setSaving(true);
    await apiSet("seo_written",next).catch(()=>{});
    setSaving(false);
  }
  async function markAll(ids,val){
    if(!isAdmin)return;
    const next={...written};ids.forEach(id=>next[id]=val);
    setWritten(next);setSaving(true);
    await apiSet("seo_written",next).catch(()=>{});
    setSaving(false);
  }

  const totalW=SEO_DATA.filter(r=>written[r[0]]).length;
  const pct=Math.round(totalW/SEO_DATA.length*100);

  const filtered=useMemo(()=>{
    const q=search.toLowerCase().trim();
    return SEO_DATA.filter(r=>{
      if(fg!=="all"&&r[1]!==fg)return false;
      if(fp!=="all"&&r[12]!==fp)return false;
      if(fs==="written"&&!written[r[0]])return false;
      if(fs==="unwritten"&&written[r[0]])return false;
      if(q&&!(r[3]+" "+r[4]+" "+r[5]+" "+r[2]).toLowerCase().includes(q))return false;
      return true;
    });
  },[search,fg,fp,fs,written]);

  const totalPg=Math.ceil(filtered.length/PER);
  const pageData=filtered.slice((page-1)*PER,page*PER);
  const fids=filtered.map(r=>r[0]);
  function rp(){setPage(1);}

  const inp={background:C.offWhite,border:`1.5px solid ${C.silver}`,borderRadius:10,padding:"8px 12px",color:C.textMain,fontSize:13,outline:"none",fontFamily:"inherit"};
  const fbtn=(active)=>({padding:isMobile?"5px 10px":"5px 12px",borderRadius:20,border:`1.5px solid ${active?C.purple:C.silver}`,background:active?C.purple:C.white,color:active?C.white:C.textSub,fontSize:isMobile?10:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0});

  if(loading)return<div style={{textAlign:"center",padding:48,color:C.textMuted}}>Đang tải...</div>;

  return(
    <div>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1a3c2e,#2d6a4f)",borderRadius:14,padding:isMobile?"14px 16px":"18px 24px",marginBottom:16,boxShadow:"0 4px 16px #1a3c2e33"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:12}}>
          <div>
            <div style={{fontSize:isMobile?15:18,fontWeight:900,color:C.white}}>🌲 Plan Viết Content Website</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginTop:2}}>521 bài SEO · 36 tháng · 13 nhóm chủ đề</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{n:SEO_DATA.length,l:"Tổng bài"},{n:totalW,l:"Đã viết",c:"#74c69d"},{n:SEO_DATA.length-totalW,l:"Chưa viết",c:"#fca5a5"},{n:pct+"%",l:"Hoàn thành",c:"#fcd34d"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:10,padding:isMobile?"8px 10px":"10px 14px",textAlign:"center",minWidth:64}}>
                <div style={{fontSize:isMobile?16:20,fontWeight:900,color:s.c||C.white,lineHeight:1}}>{s.n}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,.65)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{height:8,background:"rgba(255,255,255,.15)",borderRadius:8,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${pct}%`,background:"linear-gradient(90deg,#74c69d,#40916c)",borderRadius:8,transition:"width .4s"}}/>
        </div>
      </div>

      {/* Filters */}
      <div style={{background:C.cardBg,borderRadius:14,border:`1px solid ${C.border}`,padding:isMobile?"12px":"14px 18px",marginBottom:14}}>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
          <input style={{...inp,flex:1,minWidth:isMobile?"100%":220}} placeholder="🔍 Tìm tiêu đề, từ khóa, URL..."
            value={search} onChange={e=>{setSearch(e.target.value);rp();}}/>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[["all","Tất cả"],["unwritten","⬜ Chưa viết"],["written","✅ Đã viết"]].map(([v,l])=>(
              <button key={v} style={fbtn(fs===v)} onClick={()=>{setFs(v);rp();}}>{l}</button>
            ))}
          </div>
          {isAdmin&&fids.length>0&&(
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>markAll(fids,true)} style={{...fbtn(false),background:"#2d6a4f",color:C.white,border:"none"}}>✅ Tick tất cả</button>
              <button onClick={()=>markAll(fids,false)} style={{...fbtn(false),background:"#dc2626",color:C.white,border:"none"}}>⬜ Bỏ tất cả</button>
            </div>
          )}
          <span style={{fontSize:12,color:C.purpleMid,fontWeight:700}}>{filtered.length} bài</span>
          {saving&&<span style={{fontSize:11,color:"#2e7d32",fontWeight:700}}>💾 Đang lưu...</span>}
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
          <button style={fbtn(fg==="all")} onClick={()=>{setFg("all");rp();}}>Tất cả nhóm</button>
          {Object.entries(GRP_LABELS).map(([k,v])=>(
            <button key={k} style={fbtn(fg===k)} onClick={()=>{setFg(k);rp();}}>{v}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:2,marginTop:8,WebkitOverflowScrolling:"touch"}}>
          {[["all","Tất cả ưu tiên"],["P1","🔴 P1 – Làm ngay"],["P2","🟠 P2 – T4-8"],["P3","🔵 P3 – T9-18"],["P4","🟣 P4 – T19+"]].map(([v,l])=>(
            <button key={v} style={fbtn(fp===v)} onClick={()=>{setFp(v);rp();}}>{l}</button>
          ))}
        </div>
      </div>

      {/* List */}
      {isMobile?(
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {pageData.length===0&&<div style={{textAlign:"center",padding:32,color:C.textMuted}}>Không tìm thấy</div>}
          {pageData.map(r=>{
            const done=!!written[r[0]];
            return(
              <div key={r[0]} style={{background:done?"#f0fdf4":C.cardBg,borderRadius:12,border:`1.5px solid ${done?"#86efac":C.border}`,padding:"12px 14px",opacity:done?.85:1}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <button onClick={()=>toggle(r[0])} style={{width:24,height:24,borderRadius:6,flexShrink:0,marginTop:1,border:`2px solid ${done?"#16a34a":C.purpleMid}`,background:done?"#16a34a":"transparent",cursor:isAdmin?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:C.white,fontWeight:700}}>{done?"✓":""}</button>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:700,color:done?C.textMuted:C.textMain,textDecoration:done?"line-through":"none",lineHeight:1.4,marginBottom:5}}>{r[3]}</div>
                    <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:4}}>
                      <Bdg text={GRP_LABELS[r[1]]||r[1]} cs={GRP_COLORS[r[1]]+"|#fff"} sm/>
                      <Bdg text={r[12]} cs={PRIO_C[r[12]]} sm/>
                      <Bdg text={r[7]} cs={DIFF_C[r[7]]} sm/>
                      <span style={{fontSize:10,color:C.textMuted}}>T{r[10]}</span>
                    </div>
                    <div style={{fontSize:11,color:"#1e40af",fontStyle:"italic"}}>{r[4]}</div>
                    <div style={{fontSize:10,color:C.textMuted,marginTop:2}}>/{r[5]}</div>
                  </div>
                  <div style={{fontSize:12,fontWeight:800,color:"#2d6a4f",flexShrink:0}}>{r[6]}</div>
                </div>
              </div>
            );
          })}
        </div>
      ):(
        <div style={{background:C.cardBg,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
              <thead>
                <tr style={{background:"#1a3c2e"}}>
                  {["#","✓","Nhóm","Tiêu đề bài viết","Từ khóa chính","URL Slug","Vol","Độ khó","Intent","T.","Ưu tiên","Trạng thái"].map((h,i)=>(
                    <th key={i} style={{padding:"10px 8px",textAlign:"left",color:C.white,fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageData.length===0&&<tr><td colSpan={12} style={{textAlign:"center",padding:48,color:C.textMuted}}>Không tìm thấy</td></tr>}
                {pageData.map((r,i)=>{
                  const done=!!written[r[0]];
                  return(
                    <tr key={r[0]} style={{background:done?"#f0fdf4":i%2===0?C.bg:C.white,opacity:done?.8:1}}>
                      <td style={{padding:"8px",color:C.textMuted,fontSize:11,textAlign:"center"}}>{r[0]}</td>
                      <td style={{padding:"8px 6px",textAlign:"center"}}>
                        <button onClick={()=>toggle(r[0])} title={done?"Đã viết":"Chưa viết"} style={{width:22,height:22,borderRadius:5,border:`2px solid ${done?"#16a34a":C.purpleMid}`,background:done?"#16a34a":"transparent",cursor:isAdmin?"pointer":"default",display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.white,fontWeight:700}}>{done?"✓":""}</button>
                      </td>
                      <td style={{padding:"8px 6px"}}><span style={{display:"inline-block",padding:"2px 7px",borderRadius:99,fontSize:10,fontWeight:700,background:GRP_COLORS[r[1]],color:C.white,whiteSpace:"nowrap"}}>{GRP_LABELS[r[1]]||r[1]}</span></td>
                      <td style={{padding:"8px",fontWeight:600,color:done?C.textMuted:C.textMain,textDecoration:done?"line-through":"none",maxWidth:280}}>{r[3]}</td>
                      <td style={{padding:"8px",color:"#1e40af",fontStyle:"italic",maxWidth:180}}>{r[4]}</td>
                      <td style={{padding:"8px",color:C.textMuted,fontSize:11,maxWidth:160,wordBreak:"break-all"}}>/{r[5]}</td>
                      <td style={{padding:"8px",textAlign:"center",fontWeight:700,color:"#2d6a4f"}}>{r[6]}</td>
                      <td style={{padding:"8px 6px",textAlign:"center"}}><Bdg text={r[7]} cs={DIFF_C[r[7]]}/></td>
                      <td style={{padding:"8px 6px",textAlign:"center"}}><Bdg text={r[8]} cs={INTENT_C[r[8]]}/></td>
                      <td style={{padding:"8px",textAlign:"center",fontWeight:700,color:C.textSub}}>T{r[10]}</td>
                      <td style={{padding:"8px 6px",textAlign:"center"}}><Bdg text={r[12]} cs={PRIO_C[r[12]]}/></td>
                      <td style={{padding:"8px",textAlign:"center"}}><span style={{fontSize:10,fontWeight:700,color:done?"#16a34a":C.textMuted}}>{done?"✅ Đã viết":"⬜ Chưa viết"}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPg>1&&(
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"16px 0",flexWrap:"wrap"}}>
          {[["«",1],["‹",Math.max(1,page-1)]].map(([l,p])=>(
            <button key={l} onClick={()=>setPage(p)} disabled={page===(l==="«"?1:1)&&l==="«"||page===1&&l==="‹"} style={{padding:"6px 10px",borderRadius:8,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{l}</button>
          ))}
          {Array.from({length:Math.min(5,totalPg)},(_,i)=>{
            let p;if(totalPg<=5)p=i+1;else if(page<=3)p=i+1;else if(page>=totalPg-2)p=totalPg-4+i;else p=page-2+i;
            return<button key={p} onClick={()=>setPage(p)} style={{padding:"6px 12px",borderRadius:8,border:`1.5px solid ${p===page?C.purple:C.border}`,background:p===page?C.purple:C.white,color:p===page?C.white:C.textSub,fontWeight:p===page?700:400,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{p}</button>;
          })}
          {[["›",Math.min(totalPg,page+1)],["»",totalPg]].map(([l,p])=>(
            <button key={l} onClick={()=>setPage(p)} style={{padding:"6px 10px",borderRadius:8,border:`1.5px solid ${C.border}`,background:C.white,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{l}</button>
          ))}
          <span style={{fontSize:12,color:C.textMuted}}>{(page-1)*PER+1}–{Math.min(page*PER,filtered.length)}/{filtered.length}</span>
        </div>
      )}
    </div>
  );
}
