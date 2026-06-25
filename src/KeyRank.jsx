import { useState, useMemo, useRef } from "react";

const C = {
  purple:"#40123e",purpleMid:"#9d5799",purpleLight:"#f0dbef",
  gold:"#eec277",goldLight:"#faefdc",
  white:"#ffffff",offWhite:"#efefef",silver:"#dbdbdb",
  bg:"#faf8fa",cardBg:"#ffffff",border:"#e8e0e8",
  textMain:"#2a1229",textSub:"#69626a",textMuted:"#b6b1b7",
};

const LS_KEY = "gtt_keyrank_v1";
function lsGet(k){try{const s=localStorage.getItem(k);return s?JSON.parse(s):null;}catch{return null;}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

const INIT = {
  keywords: [], // [{id, keyword, volume, positions:[{date,pos}], notes}]
  serpPages: [], // [{id, url, medianPos, keywords:[str]}]
};

function posColor(p){
  if(!p||p>100)return{bg:"#f1f5f9",col:"#94a3b8"};
  if(p<=3)return{bg:"#dcfce7",col:"#16a34a"};
  if(p<=10)return{bg:"#dbeafe",col:"#1e40af"};
  if(p<=20)return{bg:"#fef9c3",col:"#854d0e"};
  if(p<=50)return{bg:"#ffedd5",col:"#9a3412"};
  return{bg:"#fee2e2",col:"#991b1b"};
}

function PosBadge({pos}){
  if(!pos)return<span style={{color:C.textMuted,fontSize:11}}>—</span>;
  const{bg,col}=posColor(pos);
  return<span style={{display:"inline-block",padding:"2px 8px",borderRadius:99,fontSize:11,fontWeight:800,background:bg,color:col}}>{pos}</span>;
}

function PosArrow({prev,curr}){
  if(!prev||!curr)return null;
  const diff=prev-curr;
  if(diff===0)return<span style={{color:C.textMuted,fontSize:10}}>—</span>;
  if(diff>0)return<span style={{color:"#16a34a",fontSize:10,fontWeight:700}}>▲{diff}</span>;
  return<span style={{color:"#dc2626",fontSize:10,fontWeight:700}}>▼{Math.abs(diff)}</span>;
}

export default function KeyRank({isAdmin, isMobile}){
  const[tab,setTab]=useState("ranking");
  const[store,setStore]=useState(()=>lsGet(LS_KEY)||INIT);
  const[search,setSearch]=useState("");
  const[sortBy,setSortBy]=useState("pos_asc"); // pos_asc|pos_desc|vol_desc|alpha
  const[editKw,setEditKw]=useState(null); // {id} or null=new
  const[editPage,setEditPage]=useState(null);
  const[kwForm,setKwForm]=useState({keyword:"",volume:"",notes:""});
  const[pageForm,setPageForm]=useState({url:"",medianPos:"",keywords:""});
  const[addColDate,setAddColDate]=useState(""); // date for new ranking column
  const[posInputs,setPosInputs]=useState({}); // {kwId: posValue}
  const[saving,setSaving]=useState(false);

  function save(next){
    setStore(next);
    lsSet(LS_KEY,next);
  }

  // ── Columns = all unique dates sorted ──
  const allDates=useMemo(()=>{
    const d=new Set();
    store.keywords.forEach(k=>k.positions?.forEach(p=>d.add(p.date)));
    return [...d].sort();
  },[store]);

  // ── Filtered/sorted keywords ──
  const filtered=useMemo(()=>{
    const q=search.toLowerCase();
    let kws=store.keywords.filter(k=>!q||k.keyword.toLowerCase().includes(q));
    const lastDate=allDates[allDates.length-1];
    return kws.sort((a,b)=>{
      const pa=a.positions?.find(p=>p.date===lastDate)?.pos||999;
      const pb=b.positions?.find(p=>p.date===lastDate)?.pos||999;
      const va=parseInt(a.volume)||0;
      const vb=parseInt(b.volume)||0;
      if(sortBy==="pos_asc")return pa-pb;
      if(sortBy==="pos_desc")return pb-pa;
      if(sortBy==="vol_desc")return vb-va;
      if(sortBy==="alpha")return a.keyword.localeCompare(b.keyword);
      return 0;
    });
  },[store,search,sortBy,allDates]);

  // ── Stats ──
  const lastDate=allDates[allDates.length-1];
  const prevDate=allDates[allDates.length-2];
  const posLast=store.keywords.map(k=>k.positions?.find(p=>p.date===lastDate)?.pos).filter(Boolean);
  const top3=posLast.filter(p=>p<=3).length;
  const top10=posLast.filter(p=>p<=10).length;
  const avg=posLast.length?Math.round(posLast.reduce((a,b)=>a+b,0)/posLast.length):0;

  // ── Keyword CRUD ──
  function openNewKw(){setKwForm({keyword:"",volume:"",notes:""});setEditKw("new");}
  function openEditKw(kw){setKwForm({keyword:kw.keyword,volume:kw.volume||"",notes:kw.notes||""});setEditKw(kw.id);}
  function saveKw(){
    if(!kwForm.keyword.trim())return;
    if(editKw==="new"){
      const id="kw_"+Date.now();
      save({...store,keywords:[...store.keywords,{id,keyword:kwForm.keyword.trim(),volume:kwForm.volume,notes:kwForm.notes,positions:[]}]});
    } else {
      save({...store,keywords:store.keywords.map(k=>k.id===editKw?{...k,...kwForm}:k)});
    }
    setEditKw(null);
  }
  function deleteKw(id){
    if(!window.confirm("Xoá keyword này?"))return;
    save({...store,keywords:store.keywords.filter(k=>k.id!==id)});
  }

  // ── Add ranking column (date) ──
  function addRankingColumn(){
    if(!addColDate)return;
    // Add empty position for all keywords on this date
    const next={...store,keywords:store.keywords.map(k=>({
      ...k,
      positions:[...(k.positions||[]).filter(p=>p.date!==addColDate),
        {date:addColDate,pos:posInputs[k.id]||null}
      ]
    }))};
    save(next);
    setAddColDate("");
    setPosInputs({});
  }
  function updatePosCell(kwId,date,val){
    const pos=parseInt(val)||null;
    save({...store,keywords:store.keywords.map(k=>k.id!==kwId?k:{
      ...k,
      positions:[...(k.positions||[]).filter(p=>p.date!==date),
        ...(pos?[{date,pos}]:[])
      ]
    })});
  }
  function deleteColumn(date){
    if(!window.confirm(`Xoá cột ngày ${date}?`))return;
    save({...store,keywords:store.keywords.map(k=>({...k,positions:(k.positions||[]).filter(p=>p.date!==date)}))});
  }

  // ── SERP Pages CRUD ──
  function openNewPage(){setPageForm({url:"",medianPos:"",keywords:""});setEditPage("new");}
  function openEditPage(pg){setPageForm({url:pg.url,medianPos:pg.medianPos||"",keywords:(pg.keywords||[]).join(", ")});setEditPage(pg.id);}
  function savePage(){
    if(!pageForm.url.trim())return;
    const kws=pageForm.keywords.split(/[,\n]+/).map(s=>s.trim()).filter(Boolean);
    if(editPage==="new"){
      const id="pg_"+Date.now();
      save({...store,serpPages:[...store.serpPages,{id,url:pageForm.url.trim(),medianPos:pageForm.medianPos,keywords:kws}]});
    } else {
      save({...store,serpPages:store.serpPages.map(p=>p.id===editPage?{...p,url:pageForm.url.trim(),medianPos:pageForm.medianPos,keywords:kws}:p)});
    }
    setEditPage(null);
  }
  function deletePage(id){
    if(!window.confirm("Xoá trang này?"))return;
    save({...store,serpPages:store.serpPages.filter(p=>p.id!==id)});
  }

  const inp={background:C.offWhite,border:`1.5px solid ${C.silver}`,borderRadius:8,padding:"8px 12px",color:C.textMain,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",boxSizing:"border-box"};
  const tabBtn=(id)=>({padding:isMobile?"7px 14px":"8px 20px",borderRadius:10,border:`1.5px solid ${tab===id?"#1e40af":C.silver}`,background:tab===id?"#1e40af":C.white,color:tab===id?C.white:C.textSub,fontWeight:700,fontSize:isMobile?11:13,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0});

  return(
    <div>
      {/* Header */}
      <div style={{background:"linear-gradient(135deg,#1e40af,#1d4ed8,#3b82f6)",borderRadius:14,padding:isMobile?"14px 16px":"18px 24px",marginBottom:16,boxShadow:"0 4px 16px #1e40af33"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12,marginBottom:12}}>
          <div>
            <div style={{fontSize:isMobile?15:20,fontWeight:900,color:C.white}}>📊 Theo Dõi Thứ Hạng Từ Khóa</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,.65)",marginTop:2}}>Ranking · SERP Analysis · key-rank.com</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {[{n:store.keywords.length,l:"Từ khóa",c:"#93c5fd"},{n:top3,l:"Top 3",c:"#86efac"},{n:top10,l:"Top 10",c:"#fde68a"},{n:avg||"—",l:"Vị trí TB",c:"#fca5a5"}].map(s=>(
              <div key={s.l} style={{background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.2)",borderRadius:10,padding:isMobile?"8px 10px":"10px 14px",textAlign:"center",minWidth:64}}>
                <div style={{fontSize:isMobile?16:20,fontWeight:900,color:s.c,lineHeight:1}}>{s.n}</div>
                <div style={{fontSize:9,color:"rgba(255,255,255,.65)",marginTop:2,textTransform:"uppercase",letterSpacing:.5}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:8,marginBottom:14,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
        <button style={tabBtn("ranking")} onClick={()=>setTab("ranking")}>📈 Ranking</button>
        <button style={tabBtn("serp")} onClick={()=>setTab("serp")}>🔍 SERP Analysis</button>
      </div>

      {/* ── RANKING TAB ── */}
      {tab==="ranking"&&(
        <div>
          {/* Controls */}
          <div style={{background:C.cardBg,borderRadius:14,border:`1px solid ${C.border}`,padding:isMobile?"12px":"14px 18px",marginBottom:14}}>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:10}}>
              <input style={{...inp,flex:1,minWidth:isMobile?"100%":200}} placeholder="🔍 Tìm từ khóa..." value={search} onChange={e=>setSearch(e.target.value)}/>
              <select style={{...inp,width:"auto",cursor:"pointer"}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
                <option value="pos_asc">↑ Vị trí tốt nhất</option>
                <option value="pos_desc">↓ Vị trí thấp nhất</option>
                <option value="vol_desc">Volume cao nhất</option>
                <option value="alpha">A-Z</option>
              </select>
              {isAdmin&&<button onClick={openNewKw} style={{padding:"8px 16px",borderRadius:8,border:"none",cursor:"pointer",background:"#1e40af",color:C.white,fontWeight:700,fontSize:12,fontFamily:"inherit",whiteSpace:"nowrap"}}>+ Từ khóa</button>}
              <span style={{fontSize:12,color:C.purpleMid,fontWeight:700}}>{filtered.length} từ khóa</span>
            </div>

            {/* Add ranking column */}
            {isAdmin&&(
              <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                <span style={{fontSize:11,color:C.textMuted,fontWeight:700,flexShrink:0}}>📅 Nhập thứ hạng ngày:</span>
                <input type="date" style={{...inp,width:"auto"}} value={addColDate} onChange={e=>setAddColDate(e.target.value)}/>
                {addColDate&&<button onClick={addRankingColumn} style={{padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",background:"#1e40af",color:C.white,fontWeight:700,fontSize:12,fontFamily:"inherit"}}>✅ Lưu cột</button>}
              </div>
            )}
          </div>

          {/* Quick pos input when date selected */}
          {isAdmin&&addColDate&&store.keywords.length>0&&(
            <div style={{background:"#eff6ff",borderRadius:12,border:"1px solid #bfdbfe",padding:isMobile?"12px":"14px 18px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#1e40af",marginBottom:10}}>📝 Nhập vị trí cho {addColDate} ({store.keywords.length} từ khóa):</div>
              <div style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?"140px":"200px"},1fr))`,gap:8}}>
                {store.keywords.map(k=>(
                  <div key={k.id} style={{background:C.white,borderRadius:8,padding:"8px 10px",border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,fontWeight:600,color:C.textMain,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{k.keyword}</div>
                    <input type="number" min="1" max="200" placeholder="Vị trí..."
                      style={{...inp,padding:"5px 8px",fontSize:12}}
                      value={posInputs[k.id]||""}
                      onChange={e=>setPosInputs(p=>({...p,[k.id]:e.target.value}))}/>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table */}
          {store.keywords.length===0?(
            <div style={{background:C.cardBg,borderRadius:14,border:`1px solid ${C.border}`,padding:"48px 24px",textAlign:"center",color:C.textMuted}}>
              {isAdmin?"Chưa có từ khóa. Bấm \"+ Từ khóa\" để thêm!":"Chưa có dữ liệu từ khóa."}
            </div>
          ):(
            <div style={{background:C.cardBg,borderRadius:14,border:`1px solid ${C.border}`,overflow:"hidden"}}>
              <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                  <thead>
                    <tr style={{background:"#1e40af"}}>
                      {["#","Từ khóa","Volume",...allDates,"Trend",isAdmin?"":""].map((h,i)=>h!==""&&(
                        <th key={i} style={{padding:"9px 10px",textAlign:"left",color:C.white,fontWeight:700,fontSize:11,whiteSpace:"nowrap"}}>
                          {allDates.includes(h)?(
                            <span style={{display:"flex",alignItems:"center",gap:4}}>
                              {h}
                              {isAdmin&&<button onClick={()=>deleteColumn(h)} style={{background:"transparent",border:"none",cursor:"pointer",color:"rgba(255,255,255,.5)",fontSize:12,padding:0,lineHeight:1}}>×</button>}
                            </span>
                          ):h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((kw,i)=>{
                      const posMap={};
                      (kw.positions||[]).forEach(p=>posMap[p.date]=p.pos);
                      const lastPos=posMap[lastDate];
                      const prevPos=posMap[prevDate];
                      return(
                        <tr key={kw.id} style={{background:i%2===0?C.bg:C.white,borderBottom:`1px solid ${C.border}`}}>
                          <td style={{padding:"8px 10px",color:C.textMuted,fontSize:11,textAlign:"center"}}>{i+1}</td>
                          <td style={{padding:"8px 10px",maxWidth:200}}>
                            <div style={{fontWeight:600,color:C.textMain,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{kw.keyword}</div>
                            {kw.notes&&<div style={{fontSize:10,color:C.textMuted,marginTop:2}}>{kw.notes}</div>}
                          </td>
                          <td style={{padding:"8px 10px",textAlign:"center",fontWeight:700,color:"#1e40af"}}>{kw.volume||"—"}</td>
                          {allDates.map(d=>(
                            <td key={d} style={{padding:"6px 8px",textAlign:"center"}}>
                              {isAdmin?(
                                <input type="number" min="1" max="200" placeholder="—"
                                  defaultValue={posMap[d]||""}
                                  style={{width:46,padding:"3px 4px",borderRadius:6,border:`1px solid ${C.border}`,textAlign:"center",fontSize:11,fontFamily:"inherit",outline:"none",background:posMap[d]?posColor(posMap[d]).bg:"transparent"}}
                                  onBlur={e=>updatePosCell(kw.id,d,e.target.value)}
                                  onFocus={e=>e.target.select()}
                                />
                              ):<PosBadge pos={posMap[d]}/>}
                            </td>
                          ))}
                          <td style={{padding:"8px 10px",textAlign:"center"}}>
                            <PosArrow prev={prevPos} curr={lastPos}/>
                          </td>
                          {isAdmin&&<td style={{padding:"6px 8px",textAlign:"center",whiteSpace:"nowrap"}}>
                            <button onClick={()=>openEditKw(kw)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.purpleMid,fontSize:13,padding:"0 3px"}}>✎</button>
                            <button onClick={()=>deleteKw(kw.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#dc2626",fontSize:14,padding:"0 3px"}}>🗑</button>
                          </td>}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SERP TAB ── */}
      {tab==="serp"&&(
        <div>
          {isAdmin&&(
            <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
              <button onClick={openNewPage} style={{padding:"8px 18px",borderRadius:10,border:"none",cursor:"pointer",background:"#1e40af",color:C.white,fontWeight:700,fontSize:13,fontFamily:"inherit"}}>+ Thêm URL</button>
            </div>
          )}
          {store.serpPages.length===0?(
            <div style={{background:C.cardBg,borderRadius:14,border:`1px solid ${C.border}`,padding:"48px 24px",textAlign:"center",color:C.textMuted}}>
              {isAdmin?"Chưa có trang nào. Bấm \"+ Thêm URL\" để bắt đầu!":"Chưa có dữ liệu SERP."}
            </div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {store.serpPages.map((pg,i)=>(
                <div key={pg.id} style={{background:C.cardBg,borderRadius:14,border:`1px solid ${C.border}`,padding:isMobile?"12px 14px":"16px 20px",boxShadow:"0 2px 8px #40123e08"}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:12,marginBottom:10}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}>
                        <span style={{fontSize:11,color:C.textMuted,fontWeight:700}}>#{i+1}</span>
                        <a href={pg.url} target="_blank" rel="noopener noreferrer" style={{fontSize:isMobile?12:14,fontWeight:700,color:"#1e40af",textDecoration:"none",wordBreak:"break-all"}}>{pg.url}</a>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <span style={{fontSize:11,color:C.textSub,fontWeight:600}}>Vị trí trung vị:</span>
                        <PosBadge pos={parseInt(pg.medianPos)||null}/>
                        <span style={{fontSize:11,color:C.textMuted}}>{(pg.keywords||[]).length} từ khóa</span>
                      </div>
                    </div>
                    {isAdmin&&<div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button onClick={()=>openEditPage(pg)} style={{padding:"5px 10px",borderRadius:7,border:`1px solid ${C.purpleMid}`,background:"transparent",color:C.purpleMid,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>✎ Sửa</button>
                      <button onClick={()=>deletePage(pg.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#dc2626",fontSize:16,padding:"0 4px"}}>🗑</button>
                    </div>}
                  </div>
                  {(pg.keywords||[]).length>0&&(
                    <div style={{paddingTop:10,borderTop:`1px solid ${C.border}`}}>
                      <div style={{fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:.5,marginBottom:8}}>Từ khóa ranking ({pg.keywords.length})</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {pg.keywords.map((kw,j)=>(
                          <span key={j} style={{background:"#eff6ff",color:"#1e40af",padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:600,border:"1px solid #bfdbfe"}}>{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── KW Modal ── */}
      {editKw&&(
        <div style={{position:"fixed",inset:0,background:"#00000077",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={e=>e.target===e.currentTarget&&setEditKw(null)}>
          <div style={{background:C.white,borderRadius:16,padding:isMobile?20:28,width:"100%",maxWidth:400,boxShadow:"0 20px 60px #00000030"}}>
            <div style={{fontSize:15,fontWeight:800,color:C.textMain,marginBottom:16}}>{editKw==="new"?"➕ Thêm từ khóa mới":"✎ Sửa từ khóa"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              <div><label style={{fontSize:10,color:C.textSub,fontWeight:700,display:"block",marginBottom:4,textTransform:"uppercase"}}>Từ khóa *</label>
                <input style={inp} placeholder="gỗ công nghiệp là gì" value={kwForm.keyword} onChange={e=>setKwForm(f=>({...f,keyword:e.target.value}))}/></div>
              <div><label style={{fontSize:10,color:C.textSub,fontWeight:700,display:"block",marginBottom:4,textTransform:"uppercase"}}>Volume</label>
                <input style={inp} placeholder="1.000" value={kwForm.volume} onChange={e=>setKwForm(f=>({...f,volume:e.target.value}))}/></div>
              <div><label style={{fontSize:10,color:C.textSub,fontWeight:700,display:"block",marginBottom:4,textTransform:"uppercase"}}>Ghi chú</label>
                <input style={inp} placeholder="Ghi chú thêm..." value={kwForm.notes} onChange={e=>setKwForm(f=>({...f,notes:e.target.value}))}/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={saveKw} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:"#1e40af",color:C.white,fontWeight:700,fontSize:13,fontFamily:"inherit"}}>💾 Lưu</button>
              <button onClick={()=>setEditKw(null)} style={{padding:"10px 16px",borderRadius:10,border:`1px solid ${C.silver}`,cursor:"pointer",background:"transparent",color:C.textSub,fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Huỷ</button>
            </div>
          </div>
        </div>
      )}

      {/* ── SERP Page Modal ── */}
      {editPage&&(
        <div style={{position:"fixed",inset:0,background:"#00000077",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}
          onClick={e=>e.target===e.currentTarget&&setEditPage(null)}>
          <div style={{background:C.white,borderRadius:16,padding:isMobile?20:28,width:"100%",maxWidth:480,boxShadow:"0 20px 60px #00000030"}}>
            <div style={{fontSize:15,fontWeight:800,color:C.textMain,marginBottom:16}}>{editPage==="new"?"➕ Thêm URL trang":"✎ Sửa trang"}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:16}}>
              <div><label style={{fontSize:10,color:C.textSub,fontWeight:700,display:"block",marginBottom:4,textTransform:"uppercase"}}>URL *</label>
                <input style={inp} placeholder="https://gothanhthuy.com/kien-thuc/go-cong-nghiep-la-gi/" value={pageForm.url} onChange={e=>setPageForm(f=>({...f,url:e.target.value}))}/></div>
              <div><label style={{fontSize:10,color:C.textSub,fontWeight:700,display:"block",marginBottom:4,textTransform:"uppercase"}}>Vị trí trung vị (Median Position)</label>
                <input style={inp} type="number" min="1" max="200" placeholder="5" value={pageForm.medianPos} onChange={e=>setPageForm(f=>({...f,medianPos:e.target.value}))}/></div>
              <div><label style={{fontSize:10,color:C.textSub,fontWeight:700,display:"block",marginBottom:4,textTransform:"uppercase"}}>Từ khóa (mỗi dòng hoặc phân cách bằng dấu phẩy)</label>
                <textarea style={{...inp,minHeight:100,resize:"vertical"}} placeholder={"gỗ công nghiệp là gì\nván MDF là gì\ngiá gỗ công nghiệp"} value={pageForm.keywords} onChange={e=>setPageForm(f=>({...f,keywords:e.target.value}))}/></div>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={savePage} style={{flex:1,padding:"10px",borderRadius:10,border:"none",cursor:"pointer",background:"#1e40af",color:C.white,fontWeight:700,fontSize:13,fontFamily:"inherit"}}>💾 Lưu</button>
              <button onClick={()=>setEditPage(null)} style={{padding:"10px 16px",borderRadius:10,border:`1px solid ${C.silver}`,cursor:"pointer",background:"transparent",color:C.textSub,fontWeight:600,fontSize:13,fontFamily:"inherit"}}>Huỷ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
