import { useState, useMemo, useEffect, useRef } from "react";
import { C } from "./colors";
import ContentPlan from "./ContentPlan";
import CauTruc from "./CauTruc";
import KeyRank from "./KeyRank";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, AreaChart, Area, ComposedChart, Line
} from "recharts";

// ─── INJECT GLOBAL CSS ───────────────────────────────────────────────────────
const GLOBAL_CSS = `
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; background: #faf8fa; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #f0dbef22; }
  ::-webkit-scrollbar-thumb { background: #9d579960; border-radius: 3px; }
  @media (max-width: 640px) {
    .grid-2col { grid-template-columns: 1fr !important; }
    .grid-3col { grid-template-columns: 1fr 1fr !important; }
    .hide-mobile { display: none !important; }
    .kpi-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .plat-metrics { grid-template-columns: repeat(2, 1fr) !important; }
    .conv-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .chart-height-sm { height: 200px !important; }
    .field-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .month-grid { grid-template-columns: repeat(3, 1fr) !important; }
    .tab-label { display: none !important; }
  }
`;

// Current month auto-detect
function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
}
const CURRENT_MONTH = getCurrentMonth();

// ─── DATA ────────────────────────────────────────────────────────────────────
const INITIAL_DATA = {
  "2026-05": {
    website:  { sessions:0, pageviews:0, users:0, hotline:0, form:0, zalo:0, posts:0 },
    fanpage:  { posts:0, reach:0, engagement:0, followers:0, views:0 },
    youtube:  { posts:0, views:0, watchTime:0, subscribers:0, likes:0 },
    tiktok:   { posts:0, views:0, likes:0, followers:0, shares:0 },
    linkedin: { posts:0, impressions:0, engagement:0, followers:0, clicks:0 },
    pinterest:{ posts:0, impressions:0, saves:0, followers:0, clicks:0 },
    ggmaps:   { views:0, searches:0, clicks:0, calls:0, directions:0, reviews:0, rating:0 },
  },
};

function makeAllMonths() {
  const list = [];
  for (let y = 2025; y <= 2028; y++)
    for (let m = 1; m <= 12; m++)
      list.push(`${y}-${String(m).padStart(2,"0")}`);
  return list;
}
const ALL_MONTHS = makeAllMonths();
const ML = {};
ALL_MONTHS.forEach(k => { const [y,m]=k.split("-"); ML[k]=`T${parseInt(m)}/${y}`; });

const PLATFORMS = ["website","fanpage","youtube","tiktok","linkedin","pinterest","ggmaps"];
const PM = {
  website:  { label:"Website",          icon:"🌐", color:C.purple  },
  fanpage:  { label:"Fanpage",          icon:"📘", color:"#1877f2" },
  youtube:  { label:"YouTube",          icon:"▶️",  color:"#ff0000" },
  tiktok:   { label:"TikTok",           icon:"🎵", color:"#010101" },
  linkedin: { label:"LinkedIn",         icon:"💼", color:"#0a66c2" },
  pinterest:{ label:"Pinterest",        icon:"📌", color:"#e60023" },
  ggmaps:   { label:"Google My Business",icon:"📍", color:"#34a853" },
};
const CC = [C.purple,"#1877f2","#ff0000","#010101","#0a66c2","#e60023","#34a853"];

const EMPTY = {
  website:  { sessions:0, pageviews:0, users:0, hotline:0, form:0, zalo:0, posts:0 },
  fanpage:  { posts:0, reach:0, engagement:0, followers:0, views:0 },
  youtube:  { posts:0, views:0, watchTime:0, subscribers:0, likes:0 },
  tiktok:   { posts:0, views:0, likes:0, followers:0, shares:0 },
  linkedin: { posts:0, impressions:0, engagement:0, followers:0, clicks:0 },
  pinterest:{ posts:0, impressions:0, saves:0, followers:0, clicks:0 },
  ggmaps:   { views:0, searches:0, clicks:0, calls:0, directions:0, reviews:0, rating:0 },
};

const FIELDS = {
  website:[
    {key:"posts",label:"Bài đăng",icon:"📝"},{key:"sessions",label:"Sessions",icon:"👁"},
    {key:"pageviews",label:"Pageviews",icon:"📄"},{key:"users",label:"Users",icon:"👤"},
    {key:"hotline",label:"Hotline",icon:"📞"},{key:"form",label:"Form",icon:"📋"},
    {key:"zalo",label:"Zalo",icon:"💬"},
  ],
  fanpage: [{key:"posts",label:"Bài đăng",icon:"📝"},{key:"reach",label:"Reach",icon:"📡"},{key:"views",label:"Views",icon:"👁"},{key:"engagement",label:"Engage",icon:"❤️"},{key:"followers",label:"Followers",icon:"👥"}],
  youtube: [{key:"posts",label:"Video",icon:"🎬"},{key:"views",label:"Views",icon:"👁"},{key:"watchTime",label:"Giờ xem",icon:"⏱"},{key:"likes",label:"Likes",icon:"👍"},{key:"subscribers",label:"Subs",icon:"🔔"}],
  tiktok:  [{key:"posts",label:"Video",icon:"🎬"},{key:"views",label:"Views",icon:"👁"},{key:"likes",label:"Likes",icon:"❤️"},{key:"shares",label:"Shares",icon:"🔁"},{key:"followers",label:"Followers",icon:"👥"}],
  linkedin:[{key:"posts",label:"Bài đăng",icon:"📝"},{key:"impressions",label:"Impress.",icon:"👁"},{key:"engagement",label:"Engage",icon:"💬"},{key:"clicks",label:"Clicks",icon:"🖱"},{key:"followers",label:"Followers",icon:"👥"}],
  pinterest:[{key:"posts",label:"Pins",icon:"📌"},{key:"impressions",label:"Impress.",icon:"👁"},{key:"saves",label:"Saves",icon:"🔖"},{key:"clicks",label:"Clicks",icon:"🖱"},{key:"followers",label:"Followers",icon:"👥"}],
  ggmaps:  [{key:"views",label:"Lượt xem",icon:"👁"},{key:"searches",label:"Tìm kiếm",icon:"🔍"},{key:"clicks",label:"Clicks",icon:"🖱"},{key:"calls",label:"Gọi điện",icon:"📞"},{key:"directions",label:"Chỉ đường",icon:"🗺️"},{key:"reviews",label:"Đánh giá",icon:"⭐"},{key:"rating",label:"Điểm TB",icon:"🌟"}],
};

// ─── UTILS ───────────────────────────────────────────────────────────────────
function fmt(n) {
  if (n===null||n===undefined||isNaN(n)) return "—";
  if (n>=1000000) return (n/1000000).toFixed(1)+"M";
  if (n>=1000) return (n/1000).toFixed(1)+"K";
  return Number(n).toLocaleString();
}
function pct(a,b) { if(!b||b===0) return null; return parseFloat(((a-b)/b*100).toFixed(1)); }

function Badge({val, small=false}) {
  if (val===null||val===undefined) return <span style={{color:C.textMuted,fontSize:10}}>—</span>;
  const up=val>=0;
  return <span style={{display:"inline-flex",alignItems:"center",gap:1,background:up?"#e8f5e9":"#fdecea",color:up?"#2e7d32":"#c62828",borderRadius:20,padding:small?"1px 6px":"2px 7px",fontSize:small?10:11,fontWeight:700,whiteSpace:"nowrap",border:`1px solid ${up?"#c8e6c9":"#ffcdd2"}`}}>{up?"▲":"▼"}{Math.abs(val)}%</span>;
}

// ─── HOOK: detect mobile ──────────────────────────────────────────────────────
function useIsMobile() {
  const [mob, setMob] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 640);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return mob;
}

// ─── Netlify Blobs API ──────────────────────────────────────────────────────
async function apiGet(key) {
  try {
    const res = await fetch(`/api/store?key=${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}
async function apiSet(key, value) {
  try {
    await fetch("/api/store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value }),
    });
  } catch(e) { console.error("apiSet error:", e); }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
export default function App() {
  // inject CSS once
  useEffect(() => {
    if (!document.getElementById("gtt-css")) {
      const el = document.createElement("style");
      el.id = "gtt-css"; el.textContent = GLOBAL_CSS;
      document.head.appendChild(el);
    }
  }, []);

  const isMobile = useIsMobile();
  const ADMIN_PASSWORD = "190891";
  const [isAdmin, setIsAdmin] = useState(() => sessionStorage.getItem("gtt_admin") === "true");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleLogoClick() {
    if (isAdmin) return;
    const pwd = prompt("🔐 Nhập mật khẩu admin:");
    if (pwd === ADMIN_PASSWORD) {
      setIsAdmin(true);
      sessionStorage.setItem("gtt_admin", "true");
    } else if (pwd !== null) {
      alert("❌ Sai mật khẩu!");
    }
  }
  function handleAdminLogout() {
    setIsAdmin(false);
    sessionStorage.removeItem("gtt_admin");
  }

  const [data, setData] = useState(INITIAL_DATA);
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);

  // Load data from Netlify Blobs on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const [d, u, n] = await Promise.all([
        apiGet("data"), apiGet("urls"), apiGet("notes")
      ]);
      if (d && typeof d === 'object' && Object.keys(d).length) setData(d);
      if (u && typeof u === 'object' && Object.keys(u).length) setUrls(u);
      if (n && typeof n === 'object' && Object.keys(n).length) setOtherNotes(n);
      setLoading(false);
    }
    load();
  }, []);

  // Auto-save data changes to Netlify Blobs
  const dataReady = useRef(false);
  useEffect(() => {
    if (!dataReady.current) { dataReady.current = true; return; }
    setSaveStatus("saving");
    apiSet("data", data).then(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus(""), 1500);
    });
  }, [data]);

  const TABS = [
    {id:"dashboard",label:"Dashboard",icon:"▦"},
    {id:"charts",label:"Biểu đồ",icon:"↗"},
    {id:"compare",label:"So sánh",icon:"⇄"},
    {id:"other",label:"Công Việc Khác",icon:"📋"},
    {id:"content",label:"Plan Content",icon:"✍️"},
    {id:"cautruc",label:"Cấu Trúc DM & Thẻ",icon:"🏷️"},
    {id:"keyrank",label:"Từ Khóa",icon:"📊"},
    ...(isAdmin ? [{id:"input",label:"Nhập liệu",icon:"✎"}] : []),
  ];

  const [tab, setTab] = useState("dashboard");
  const [selMonth, setSelMonth] = useState(CURRENT_MONTH);
  const [editMonth, setEditMonth] = useState(CURRENT_MONTH);
  const [editPlat, setEditPlat] = useState("website");
  const [savedMsg, setSavedMsg] = useState("");
  const [newM, setNewM] = useState(""); const [showAdd, setShowAdd] = useState(false);
  const formRefs = useRef({});

  // ── URL posts state ──
  const [urls, setUrls] = useState({});
  const urlsReady = useRef(false);
  useEffect(() => {
    if (!urlsReady.current) { urlsReady.current = true; return; }
    apiSet("urls", urls);
  }, [urls]);
  const [showUrlPanel, setShowUrlPanel] = useState(false);
  const [urlForm, setUrlForm] = useState({title:"",url:"",date:"",type:"post"});
  const [copiedUrlId, setCopiedUrlId] = useState(null);

  function copyUrl(url, id) {
    navigator.clipboard.writeText(url);
    setCopiedUrlId(id);
    setTimeout(() => setCopiedUrlId(null), 1500);
  }

  // ── Other tasks state ──
  const [otherNotes, setOtherNotes] = useState({});
  const notesReady = useRef(false);
  useEffect(() => {
    if (!notesReady.current) { notesReady.current = true; return; }
    apiSet("notes", otherNotes);
  }, [otherNotes]);
  const [noteForm, setNoteForm] = useState({title:"",category:"design",content:"",date:""});
  const [noteMonth, setNoteMonth] = useState(CURRENT_MONTH);
  const [noteFilter, setNoteFilter] = useState("all");
  const [noteDateFilter, setNoteDateFilter] = useState("all");
  const [noteDateFrom, setNoteDateFrom] = useState("");
  const [noteDateTo, setNoteDateTo] = useState("");

  const NOTE_CATS = [
    {id:"design",   label:"Thiết kế",    icon:"🎨", color:"#9d5799"},
    {id:"content",  label:"Nội dung",    icon:"✍️",  color:"#1877f2"},
    {id:"event",    label:"Sự kiện",     icon:"🎉", color:"#e65100"},
    {id:"ads",      label:"Quảng cáo",   icon:"📣", color:"#e60023"},
    {id:"collab",   label:"Hợp tác",     icon:"🤝", color:"#0a66c2"},
    {id:"report",   label:"Báo cáo",     icon:"📊", color:"#34a853"},
    {id:"seo",     label:"SEO",         icon:"🔍", color:"#f57f17"},
    {id:"geo",     label:"GEO",         icon:"🌍", color:"#00838f"},
    {id:"other",    label:"Khác",        icon:"📌", color:"#69626a"},
  ];

  const dataMonths = useMemo(() => ALL_MONTHS.filter(m=>data[m]).sort(), [data]);
  const prevMonth  = useMemo(() => { const i=dataMonths.indexOf(selMonth); return i>0?dataMonths[i-1]:null; }, [dataMonths,selMonth]);
  const cur  = data[selMonth]||EMPTY;
  const prev = prevMonth?(data[prevMonth]||EMPTY):null;

  const tip = {
    contentStyle:{background:C.white,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:"0 4px 20px #40123e18",fontSize:12},
    labelStyle:{color:C.textMain,fontWeight:700,fontSize:12}
  };

  // chart data
  const viewsChart = useMemo(()=>dataMonths.map(m=>({
    month:ML[m], Website:data[m]?.website?.sessions||0, Fanpage:data[m]?.fanpage?.views||0,
    YouTube:data[m]?.youtube?.views||0, TikTok:data[m]?.tiktok?.views||0,
    LinkedIn:data[m]?.linkedin?.impressions||0, Pinterest:data[m]?.pinterest?.impressions||0, GGMaps:data[m]?.ggmaps?.views||0,
  })),[data,dataMonths]);

  const postsChart = useMemo(()=>dataMonths.map(m=>({
    month:ML[m], Website:data[m]?.website?.posts||0, Fanpage:data[m]?.fanpage?.posts||0,
    YouTube:data[m]?.youtube?.posts||0, TikTok:data[m]?.tiktok?.posts||0,
    LinkedIn:data[m]?.linkedin?.posts||0, Pinterest:data[m]?.pinterest?.posts||0, GGMaps:data[m]?.ggmaps?.reviews||0,
  })),[data,dataMonths]);

  const convChart = useMemo(()=>dataMonths.map(m=>({
    month:ML[m], Hotline:data[m]?.website?.hotline||0, Form:data[m]?.website?.form||0,
    Zalo:data[m]?.website?.zalo||0,
    Total:(data[m]?.website?.hotline||0)+(data[m]?.website?.form||0)+(data[m]?.website?.zalo||0),
  })),[data,dataMonths]);

  const radarData = useMemo(()=>{
    const m=data[selMonth]; if(!m) return [];
    return [
      {subject:"Web",    value:Math.min(100,((m.website?.sessions||0)/20000)*100)},
      {subject:"FB",     value:Math.min(100,((m.fanpage?.views||0)/100000)*100)},
      {subject:"YT",     value:Math.min(100,((m.youtube?.views||0)/150000)*100)},
      {subject:"TikTok", value:Math.min(100,((m.tiktok?.views||0)/1000000)*100)},
      {subject:"LinkedIn",value:Math.min(100,((m.linkedin?.impressions||0)/30000)*100)},
      {subject:"Pin",    value:Math.min(100,((m.pinterest?.impressions||0)/100000)*100)},
      {subject:"Maps",   value:Math.min(100,((m.ggmaps?.views||0)/50000)*100)},
    ];
  },[data,selMonth]);

  // ── Export / Import JSON backup ──
  function exportData() {
    const backup = { exportedAt: new Date().toISOString(), version: "gtt-v1", data, urls, otherNotes };
    const blob = new Blob([JSON.stringify(backup, null, 2)], {type:"application/json"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gtt-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }
  function importData(e) {
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const backup = JSON.parse(ev.target.result);
        if (backup.data)       setData(backup.data);
        if (backup.urls)       setUrls(backup.urls);
        if (backup.otherNotes) setOtherNotes(backup.otherNotes);
        alert("✅ Import thành công!");
      } catch { alert("❌ File không hợp lệ!"); }
    };
    reader.readAsText(file);
    e.target.value = "";
  }
  const importRef = useRef(null);

  function addMonth() {
    if(!newM) return;
    if(!data[newM]) setData(d=>({...d,[newM]:JSON.parse(JSON.stringify(EMPTY))}));
    setEditMonth(newM); setShowAdd(false);
  }
  function deleteMonth(m) {
    if(!window.confirm(`Xoá tháng ${ML[m]}? Toàn bộ dữ liệu tháng này sẽ mất!`)) return;
    setData(d=>{ const nd={...d}; delete nd[m]; return nd; });
    setUrls(d=>{ const nd={...d}; delete nd[m]; return nd; });
    setOtherNotes(d=>{ const nd={...d}; delete nd[m]; return nd; });
    if(editMonth===m) setEditMonth(dataMonths.find(x=>x!==m)||CURRENT_MONTH);
  }
  function saveAll() {
    const vals={};
    FIELDS[editPlat].forEach(f=>{ const el=formRefs.current[f.key]; vals[f.key]=el?(f.key==="rating"?parseFloat(el.value)||0:parseInt(el.value)||0):0; });
    setData(d=>({...d,[editMonth]:{...(d[editMonth]||JSON.parse(JSON.stringify(EMPTY))),[editPlat]:vals}}));
    setSavedMsg(`✓ Lưu ${PM[editPlat].label} — ${ML[editMonth]}`);
    setTimeout(()=>setSavedMsg(""),2500);
  }

  function goInput(platform) { setEditMonth(selMonth); setEditPlat(platform); setTab("input"); formRefs.current={}; }

  function addNote() {
    if(!noteForm.title.trim()) return;
    const entry = {...noteForm, id:Date.now(), done:false, date:noteForm.date||new Date().toISOString().slice(0,10)};
    setOtherNotes(prev => ({...prev, [noteMonth]: [...(prev[noteMonth]||[]), entry]}));
    setNoteForm({title:"",category:noteForm.category,content:"",date:""});
  }
  function toggleNote(month, id) {
    setOtherNotes(prev => ({...prev, [month]: (prev[month]||[]).map(n=>n.id===id?{...n,done:!n.done}:n)}));
  }
  function removeNote(month, id) {
    setOtherNotes(prev => ({...prev, [month]: (prev[month]||[]).filter(n=>n.id!==id)}));
  }

  // ── URL helpers ──
  function addUrl() {
    if(!urlForm.url.trim()) return;
    const entry = {...urlForm, id: Date.now(), date: urlForm.date || new Date().toISOString().slice(0,10)};
    setUrls(prev => {
      const mo = prev[editMonth] || {};
      const pl = mo[editPlat] || [];
      return {...prev, [editMonth]: {...mo, [editPlat]: [...pl, entry]}};
    });
    setUrlForm({title:"",url:"",date:"",type:"post"});
  }
  function removeUrl(id) {
    setUrls(prev => {
      const pl = (prev[editMonth]?.[editPlat] || []).filter(u=>u.id!==id);
      return {...prev, [editMonth]: {...(prev[editMonth]||{}), [editPlat]: pl}};
    });
  }

  // ── Shared Components ──
  const Card = ({children, style={}}) => (
    <div style={{background:C.cardBg,borderRadius:isMobile?12:16,border:`1px solid ${C.border}`,padding:isMobile?14:22,marginBottom:isMobile?12:18,boxShadow:"0 2px 12px #40123e0a",...style}}>{children}</div>
  );
  const SecTitle = ({children}) => (
    <div style={{fontSize:isMobile?10:11,fontWeight:800,color:C.purpleMid,marginBottom:isMobile?10:16,textTransform:"uppercase",letterSpacing:1.5,display:"flex",alignItems:"center",gap:8}}>
      <span style={{display:"inline-block",width:3,height:14,background:`linear-gradient(180deg,${C.purple},${C.purpleMid})`,borderRadius:2}}/>
      {children}
    </div>
  );
  const inp = {background:C.offWhite,border:`1.5px solid ${C.silver}`,borderRadius:10,padding:"10px 14px",color:C.textMain,fontSize:15,width:"100%",outline:"none",transition:"border .15s",fontFamily:"inherit"};
  const lbl = {fontSize:11,color:C.textSub,fontWeight:700,marginBottom:5,display:"block",textTransform:"uppercase",letterSpacing:.5};
  const Btn = ({children,variant="primary",onClick,style={}}) => (
    <button onClick={onClick} style={{padding:isMobile?"9px 16px":"10px 22px",borderRadius:10,cursor:"pointer",fontWeight:700,fontSize:isMobile?12:13,fontFamily:"inherit",background:variant==="primary"?`linear-gradient(135deg,${C.purple},${C.purpleMid})`:variant==="success"?"linear-gradient(135deg,#2e7d32,#43a047)":variant==="ghost"?"transparent":C.offWhite,color:variant==="ghost"?C.textSub:C.white,border:variant==="ghost"?`1px solid ${C.silver}`:"none",...style}}>{children}</button>
  );

  // ── Platform Card ──
  function PlatCard({platform}) {
    const p=PM[platform]; const fs=FIELDS[platform];
    const cp=cur[platform]||{}; const pp=prev?.[platform]||null;
    return (
      <Card>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14,paddingBottom:12,borderBottom:`1px solid ${C.border}`}}>
          <div style={{width:isMobile?36:42,height:isMobile?36:42,borderRadius:10,background:`${p.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isMobile?18:20,border:`1px solid ${p.color}25`,flexShrink:0}}>{p.icon}</div>
          <span style={{fontSize:isMobile?14:17,fontWeight:800,color:C.textMain}}>{p.label}</span>
          {isAdmin&&(
            <button onClick={()=>goInput(platform)} style={{marginLeft:"auto",padding:isMobile?"5px 10px":"6px 14px",borderRadius:8,border:`1px solid ${C.purpleMid}`,background:"transparent",color:C.purpleMid,fontSize:isMobile?11:12,fontWeight:700,cursor:"pointer",flexShrink:0}}>✎ Nhập</button>
          )}
        </div>
        {/* Metrics grid */}
        <div className="plat-metrics" style={{display:"grid",gridTemplateColumns:`repeat(${Math.min(fs.length,isMobile?2:5)},1fr)`,gap:isMobile?8:10}}>
          {fs.map(f=>(
            <div key={f.key} style={{background:C.bg,borderRadius:10,padding:isMobile?"10px 8px":"12px 14px",border:`1px solid ${C.border}`,textAlign:"center"}}>
              <div style={{fontSize:9,color:C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:.3}}>{f.icon} {f.label}</div>
              <div style={{fontSize:isMobile?17:20,fontWeight:800,color:C.textMain,marginTop:3,letterSpacing:-.5}}>{fmt(cp[f.key])}</div>
              {pp&&<div style={{marginTop:3}}><Badge val={pct(cp[f.key]||0,pp[f.key]||0)} small/></div>}
            </div>
          ))}
        </div>
        {/* Website conversions */}
        {platform==="website"&&(
          <div style={{marginTop:12,background:`linear-gradient(135deg,${C.purpleLight},${C.goldLight})`,borderRadius:10,padding:isMobile?10:14,border:`1px solid ${C.purpleMid}22`}}>
            <div style={{fontSize:10,color:C.purple,fontWeight:800,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>📊 Chuyển đổi</div>
            <div className="conv-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
              {[{k:"hotline",l:"📞 Hotline",c:"#2e7d32"},{k:"form",l:"📋 Form",c:C.purple},{k:"zalo",l:"💬 Zalo",c:"#0068ff"}].map(x=>(
                <div key={x.k} style={{textAlign:"center",background:C.white,borderRadius:8,padding:isMobile?"8px 4px":"12px 8px",border:`1px solid ${C.silver}`}}>
                  <div style={{fontSize:isMobile?9:11,color:C.textSub,fontWeight:600}}>{x.l}</div>
                  <div style={{fontSize:isMobile?17:20,fontWeight:800,color:x.c,marginTop:3}}>{fmt(cp[x.k])}</div>
                  {pp&&<div style={{marginTop:2}}><Badge val={pct(cp[x.k]||0,pp[x.k]||0)} small/></div>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* GG Maps rating */}
        {platform==="ggmaps"&&(
          <div style={{marginTop:12,background:"linear-gradient(135deg,#e8f5e9,#f1f8e9)",borderRadius:10,padding:isMobile?10:14,border:"1px solid #34a85322"}}>
            <div style={{fontSize:10,color:"#2e7d32",fontWeight:800,marginBottom:10,textTransform:"uppercase",letterSpacing:1}}>Đánh giá & Tương tác</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
              {[{k:"rating",l:"Điểm TB",c:"#f57f17",star:true},{k:"reviews",l:"Đánh giá",c:"#2e7d32"},{k:"calls",l:"Gọi điện",c:C.purple},{k:"directions",l:"Chỉ đường",c:"#0068ff"}].map(x=>(
                <div key={x.k} style={{textAlign:"center",background:C.white,borderRadius:8,padding:isMobile?"8px 4px":"12px 8px",border:`1px solid ${C.silver}`}}>
                  <div style={{fontSize:isMobile?9:11,color:C.textSub,fontWeight:600}}>{x.l}</div>
                  <div style={{fontSize:isMobile?16:20,fontWeight:800,color:x.c,marginTop:3}}>{x.star?(cp[x.k]>0?Number(cp[x.k]).toFixed(1)+"★":"—"):fmt(cp[x.k])}</div>
                  {!x.star&&pp&&<div style={{marginTop:2}}><Badge val={pct(cp[x.k]||0,pp[x.k]||0)} small/></div>}
                </div>
              ))}
            </div>
          </div>
        )}
        {/* URL Post List */}
        {(()=>{
          const platUrls = (urls[selMonth]?.[platform])||[];
          if(platUrls.length===0) return null;
          return (
            <div style={{marginTop:14,borderTop:`1px solid ${C.border}`,paddingTop:12}}>
              <div style={{fontSize:10,color:C.purpleMid,fontWeight:800,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>🔗 Bài đăng tháng này ({platUrls.length})</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {platUrls.map(u=>(
                  <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:isMobile?"8px 10px":"10px 12px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                    <span style={{fontSize:isMobile?10:11,fontWeight:700,color:C.white,background:TYPE_COLOR[u.type]||C.purple,padding:"2px 7px",borderRadius:20,whiteSpace:"nowrap",flexShrink:0}}>{TYPE_LABEL[u.type]||u.type}</span>
                    <a href={u.url} target="_blank" rel="noopener noreferrer" style={{fontSize:isMobile?11:13,fontWeight:600,color:C.textMain,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",textDecoration:"none"}}>{u.title||u.url}</a>
                    <button onClick={()=>copyUrl(u.url, u.id)} title="Copy URL" style={{background:"transparent",border:"none",cursor:"pointer",fontSize:isMobile?11:12,padding:"2px 4px",flexShrink:0,color:copiedUrlId===u.id?"#2e7d32":C.textMuted,fontWeight:700}}>{copiedUrlId===u.id?"✓":"📋"}</button>
                    <span style={{fontSize:10,color:C.textMuted,whiteSpace:"nowrap",flexShrink:0}}>{u.date}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </Card>
    );
  }

  const TYPE_COLOR={"post":C.purple,"video":"#ff0000","image":"#0a66c2","reel":"#e60023","story":"#eec277","pin":"#e60023"};
  const TYPE_LABEL={"post":"Bài viết","video":"Video","image":"Ảnh","reel":"Reel","story":"Story","pin":"Pin"};

  // ── Input Tab ──
  function InputTab() {
    const fs=FIELDS[editPlat]; const p=PM[editPlat];
    const existing=data[editMonth]?.[editPlat]||{};
    return (
      <div>
        <Card>
          <SecTitle>Chọn tháng nhập liệu</SecTitle>
          <div style={{display:"flex",gap:10,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div>
              <label style={lbl}>Tháng</label>
              <select style={{...inp,width:"auto",cursor:"pointer"}} value={editMonth} onChange={e=>{setEditMonth(e.target.value);formRefs.current={};}}>
                {dataMonths.map(m=><option key={m} value={m}>{ML[m]}</option>)}
              </select>
            </div>
            <Btn variant="success" onClick={()=>setShowAdd(!showAdd)}>+ Thêm tháng</Btn>
            {showAdd&&(
              <div style={{display:"flex",gap:8,alignItems:"center",background:C.goldLight,padding:"10px 12px",borderRadius:10,border:`1px solid ${C.gold}`,flexWrap:"wrap"}}>
                <select style={{...inp,width:"auto",cursor:"pointer"}} value={newM||""} onChange={e=>setNewM(e.target.value)}>
                  <option value="">-- chọn tháng --</option>
                  {ALL_MONTHS.filter(m=>!data[m]).map(m=><option key={m} value={m}>{ML[m]}</option>)}
                </select>
                <Btn variant="primary" onClick={addMonth}>Tạo</Btn>
                <Btn variant="ghost" onClick={()=>setShowAdd(false)}>✕</Btn>
              </div>
            )}
          </div>
        </Card>

        {/* Platform tabs */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:12,WebkitOverflowScrolling:"touch"}}>
          {PLATFORMS.map(pl=>{
            const act=editPlat===pl; const ppm=PM[pl];
            return <button key={pl} onClick={()=>{setEditPlat(pl);formRefs.current={};}} style={{padding:isMobile?"7px 12px":"8px 16px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${act?ppm.color:C.silver}`,fontWeight:700,fontSize:isMobile?11:13,background:act?ppm.color:C.white,color:act?C.white:C.textSub,whiteSpace:"nowrap",flexShrink:0,transition:"all .15s"}}>{ppm.icon} {ppm.label}</button>;
          })}
        </div>

        <Card>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18}}>
            <div style={{width:38,height:38,borderRadius:10,background:`${PM[editPlat].color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{PM[editPlat].icon}</div>
            <div>
              <div style={{fontSize:isMobile?14:16,fontWeight:800,color:C.textMain}}>{PM[editPlat].label}</div>
              <div style={{fontSize:11,color:C.textSub}}>{ML[editMonth]||editMonth}</div>
            </div>
          </div>
          <div className="field-grid" style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?"140px":"175px"},1fr))`,gap:isMobile?10:16}}>
            {fs.map(f=>(
              <div key={f.key}>
                <label style={lbl}>{f.icon} {f.label}</label>
                <input style={inp} type="number" min={0}
                  step={f.key==="rating"?"0.1":"1"}
                  defaultValue={existing[f.key]??0}
                  ref={el=>{formRefs.current[f.key]=el;}}
                  onFocus={e=>e.target.select()}
                />
              </div>
            ))}
          </div>
          <div style={{marginTop:20,display:"flex",gap:12,alignItems:"center",flexWrap:"wrap"}}>
            <Btn variant="primary" onClick={saveAll}>💾 Lưu dữ liệu</Btn>
            {savedMsg&&<span style={{color:"#2e7d32",fontWeight:700,fontSize:13}}>{savedMsg}</span>}
          </div>
        </Card>

        {/* URL Panel */}
        <Card>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:showUrlPanel?14:0}}>
            <SecTitle>🔗 Thêm URL bài đăng — {PM[editPlat].label}</SecTitle>
            <button onClick={()=>setShowUrlPanel(!showUrlPanel)} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.purpleMid}`,background:showUrlPanel?C.purpleLight:"transparent",color:C.purpleMid,fontSize:12,fontWeight:700,cursor:"pointer",marginBottom:showUrlPanel?0:4}}>
              {showUrlPanel?"▲ Ẩn":"▼ Mở"}
            </button>
          </div>
          {showUrlPanel&&(
            <div>
              {(()=>{
                const platUrls=(urls[editMonth]?.[editPlat])||[];
                return (
                  <div>
                    {/* Add form only for viewer — data won't persist across refreshes */}
                    <div style={{background:C.goldLight,borderRadius:12,padding:isMobile?12:16,border:`1px solid ${C.gold}`,marginBottom:16}}>
                      <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr":"1fr 1fr 140px 120px",gap:10,marginBottom:10}}>
                        <div>
                          <label style={lbl}>📝 Tiêu đề bài</label>
                          <input style={{...inp,padding:"8px 12px",fontSize:13}} placeholder="Tên bài viết / video..."
                            value={urlForm.title}
                            onChange={e=>setUrlForm(f=>({...f,title:e.target.value}))}
                          />
                        </div>
                        <div>
                          <label style={lbl}>🔗 URL</label>
                          <input style={{...inp,padding:"8px 12px",fontSize:13}} placeholder="https://..."
                            value={urlForm.url}
                            onChange={e=>setUrlForm(f=>({...f,url:e.target.value}))}
                            onKeyDown={e=>{if(e.key==="Enter"){addUrl();}}}
                          />
                        </div>
                        <div>
                          <label style={lbl}>📅 Ngày đăng</label>
                          <input type="date" style={{...inp,padding:"8px 10px",fontSize:13}} value={urlForm.date} onChange={e=>setUrlForm(f=>({...f,date:e.target.value}))}/>
                        </div>
                        <div>
                          <label style={lbl}>🏷 Loại</label>
                          <select style={{...inp,padding:"8px 10px",fontSize:13,cursor:"pointer"}} value={urlForm.type} onChange={e=>setUrlForm(f=>({...f,type:e.target.value}))}>
                            <option value="post">Bài viết</option>
                            <option value="video">Video</option>
                            <option value="image">Ảnh</option>
                            <option value="reel">Reel</option>
                            <option value="story">Story</option>
                            <option value="pin">Pin</option>
                          </select>
                        </div>
                      </div>
                      <Btn variant="primary" onClick={addUrl}>+ Thêm bài đăng</Btn>
                    </div>
                    {platUrls.length===0 ? (
                      <div style={{color:C.textMuted,fontSize:13,textAlign:"center",padding:"16px 0"}}>Chưa có bài đăng nào. Thêm ở trên!</div>
                    ) : (
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        {platUrls.map((u,i)=>(
                          <div key={u.id} style={{display:"flex",alignItems:"center",gap:8,padding:isMobile?"8px 10px":"10px 12px",background:i%2===0?C.bg:C.white,borderRadius:10,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                            <span style={{fontSize:isMobile?9:10,fontWeight:700,color:C.white,background:TYPE_COLOR[u.type]||C.purple,padding:"2px 7px",borderRadius:20,whiteSpace:"nowrap",flexShrink:0}}>{TYPE_LABEL[u.type]||u.type}</span>
                            <span style={{fontSize:isMobile?11:13,fontWeight:600,color:C.textMain,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{u.title||"—"}</span>
                            <a href={u.url} target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:C.purpleMid,textDecoration:"none",whiteSpace:"nowrap",flexShrink:0,border:`1px solid ${C.purpleMid}`,borderRadius:6,padding:"2px 7px",fontWeight:600}}>🔗</a>
                            <button onClick={()=>copyUrl(u.url, u.id)} title="Copy URL" style={{background:"transparent",border:"none",cursor:"pointer",fontSize:isMobile?11:12,padding:"2px 4px",flexShrink:0,color:copiedUrlId===u.id?"#2e7d32":C.textMuted,fontWeight:700}}>{copiedUrlId===u.id?"✓":"📋"}</button>
                            <span style={{fontSize:10,color:C.textMuted,whiteSpace:"nowrap",flexShrink:0,display:isMobile?"none":"inline"}}>{u.date}</span>
                            <button onClick={()=>removeUrl(u.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:"#c62828",fontSize:18,padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </Card>

        <Card>
          <SecTitle>Tháng đã lưu</SecTitle>
          <div className="month-grid" style={{display:"grid",gridTemplateColumns:`repeat(auto-fill,minmax(${isMobile?"90px":"110px"},1fr))`,gap:8}}>
            {dataMonths.map(m=>{
              const cnt=PLATFORMS.filter(p=>data[m]?.[p]&&Object.values(data[m][p]).some(v=>v>0)).length;
              const act=m===editMonth;
              return (
                <div key={m} style={{position:"relative"}}>
                  <button onClick={()=>{setEditMonth(m);formRefs.current={};}} style={{width:"100%",padding:"10px 6px",borderRadius:10,cursor:"pointer",textAlign:"center",fontFamily:"inherit",border:`1.5px solid ${act?C.purple:C.border}`,background:act?C.purpleLight:C.bg,transition:"all .15s"}}>
                    <div style={{fontSize:isMobile?11:13,fontWeight:700,color:act?C.purple:C.textSub}}>{ML[m]}</div>
                    <div style={{fontSize:9,color:cnt===7?"#2e7d32":cnt>0?"#e65100":C.textMuted,marginTop:2,fontWeight:600}}>{cnt}/7</div>
                  </button>
                  {isAdmin&&<button onClick={()=>deleteMonth(m)} title="Xoá tháng này" style={{position:"absolute",top:-6,right:-6,width:18,height:18,borderRadius:"50%",border:"none",background:"#e53935",color:"#fff",fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,lineHeight:1}}>×</button>}
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    );
  }

  // ── Charts Tab ──
  function ChartsTab() {
    const pNames=["Website","Fanpage","YouTube","TikTok","LinkedIn","Pinterest","GGMaps"];
    const h = isMobile ? 200 : 300;
    const h2 = isMobile ? 180 : 240;
    return (
      <div>
        <Card>
          <SecTitle>Xu hướng Views / Impressions</SecTitle>
          <ResponsiveContainer width="100%" height={h}>
            <AreaChart data={viewsChart}>
              <defs>{pNames.map((k,i)=>(<linearGradient key={k} id={`gv${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={CC[i]} stopOpacity={0.2}/><stop offset="95%" stopColor={CC[i]} stopOpacity={0}/></linearGradient>))}</defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.silver}/>
              <XAxis dataKey="month" tick={{fill:C.textSub,fontSize:isMobile?9:11}} axisLine={{stroke:C.border}}/>
              <YAxis tick={{fill:C.textSub,fontSize:isMobile?8:10}} tickFormatter={fmt} axisLine={false} tickLine={false} width={isMobile?32:40}/>
              <Tooltip {...tip} formatter={fmt}/>
              <Legend wrapperStyle={{fontSize:isMobile?10:12}}/>
              {pNames.map((k,i)=><Area key={k} type="monotone" dataKey={k} stroke={CC[i]} fill={`url(#gv${i})`} strokeWidth={2}/>)}
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <div className="grid-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isMobile?10:16}}>
          <Card style={{marginBottom:0}}>
            <SecTitle>Bài đăng (stacked)</SecTitle>
            <ResponsiveContainer width="100%" height={h2}>
              <BarChart data={postsChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.silver}/>
                <XAxis dataKey="month" tick={{fill:C.textSub,fontSize:isMobile?9:11}} axisLine={{stroke:C.border}}/>
                <YAxis tick={{fill:C.textSub,fontSize:isMobile?8:10}} axisLine={false} tickLine={false} width={isMobile?24:36}/>
                <Tooltip {...tip}/><Legend wrapperStyle={{fontSize:isMobile?10:12}}/>
                {pNames.map((k,i)=><Bar key={k} dataKey={k} fill={CC[i]} stackId="a" radius={i===6?[3,3,0,0]:[0,0,0,0]}/>)}
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{marginBottom:0}}>
            <SecTitle>Website Conversions</SecTitle>
            <ResponsiveContainer width="100%" height={h2}>
              <ComposedChart data={convChart}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.silver}/>
                <XAxis dataKey="month" tick={{fill:C.textSub,fontSize:isMobile?9:11}} axisLine={{stroke:C.border}}/>
                <YAxis tick={{fill:C.textSub,fontSize:isMobile?8:10}} axisLine={false} tickLine={false} width={isMobile?24:36}/>
                <Tooltip {...tip}/><Legend wrapperStyle={{fontSize:isMobile?10:12}}/>
                <Bar dataKey="Hotline" fill="#2e7d32" radius={[3,3,0,0]}/>
                <Bar dataKey="Form"    fill={C.purple} radius={[3,3,0,0]}/>
                <Bar dataKey="Zalo"    fill="#0068ff"  radius={[3,3,0,0]}/>
                <Line type="monotone" dataKey="Total" stroke={C.gold} strokeWidth={2} dot={isMobile?false:{r:3,fill:C.gold}}/>
              </ComposedChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <div style={{height:isMobile?10:16}}/>
        <div className="grid-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isMobile?10:16}}>
          <Card style={{marginBottom:0}}>
            <SecTitle>Radar hiệu suất — {ML[selMonth]}</SecTitle>
            <ResponsiveContainer width="100%" height={isMobile?180:260}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={C.silver}/>
                <PolarAngleAxis dataKey="subject" tick={{fill:C.textSub,fontSize:isMobile?9:11}}/>
                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{fill:C.textMuted,fontSize:isMobile?8:9}}/>
                <Radar name="Score" dataKey="value" stroke={C.purple} fill={C.purple} fillOpacity={0.2} strokeWidth={2}/>
                <Tooltip {...tip} formatter={v=>`${v.toFixed(1)}%`}/>
              </RadarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{marginBottom:0}}>
            <SecTitle>Tăng trưởng MoM</SecTitle>
            {prevMonth?(
              <ResponsiveContainer width="100%" height={isMobile?180:260}>
                <BarChart layout="vertical" data={PLATFORMS.map(p=>{ const key=p==="website"?"sessions":p==="linkedin"||p==="pinterest"?"impressions":"views"; return {name:isMobile?PM[p].icon:PM[p].label, val:pct(cur[p]?.[key]||0,prev[p]?.[key]||0)||0}; })}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.silver}/>
                  <XAxis type="number" tick={{fill:C.textSub,fontSize:isMobile?9:11}} tickFormatter={v=>`${v}%`} axisLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{fill:C.textSub,fontSize:isMobile?11:12}} width={isMobile?28:74} axisLine={false} tickLine={false}/>
                  <Tooltip {...tip} formatter={v=>`${v}%`}/>
                  <Bar dataKey="val" fill={C.purpleMid} radius={[0,5,5,0]} label={isMobile?false:{position:"right",fill:C.textSub,fontSize:10,formatter:v=>`${v}%`}}/>
                </BarChart>
              </ResponsiveContainer>
            ):<div style={{color:C.textMuted,textAlign:"center",paddingTop:60,fontSize:12}}>Cần ít nhất 2 tháng</div>}
          </Card>
        </div>
      </div>
    );
  }

  // ── Compare Tab ──
  function CompareTab() {
    const [m1,setM1]=useState(dataMonths[0]||"2026-05");
    const [m2,setM2]=useState(dataMonths[1]||"2026-05");
    const [cp,setCp]=useState("website");
    const d1=data[m1]||EMPTY; const d2=data[m2]||EMPTY;
    const p=PM[cp]; const fs=FIELDS[cp];
    const h2=isMobile?160:240;
    const overviewData=PLATFORMS.map(pl=>{ const key=pl==="website"?"sessions":pl==="linkedin"||pl==="pinterest"?"impressions":"views"; return {name:isMobile?PM[pl].icon:PM[pl].label,[ML[m1]]:d1[pl]?.[key]||0,[ML[m2]]:d2[pl]?.[key]||0}; });
    const detailData=fs.map(f=>({name:isMobile?f.icon:f.label,[ML[m1]]:d1[cp]?.[f.key]||0,[ML[m2]]:d2[cp]?.[f.key]||0}));
    const growthData=fs.map(f=>({name:isMobile?f.icon:f.label,pct:pct(d2[cp]?.[f.key]||0,d1[cp]?.[f.key]||0)||0}));

    return (
      <div>
        <Card>
          <SecTitle>Chọn 2 tháng so sánh</SecTitle>
          <div style={{display:"flex",gap:12,alignItems:"flex-end",flexWrap:"wrap"}}>
            <div><label style={lbl}>Tháng 1</label>
              <select style={{...inp,width:"auto",borderColor:C.purple,cursor:"pointer"}} value={m1} onChange={e=>setM1(e.target.value)}>
                {dataMonths.map(m=><option key={m} value={m}>{ML[m]}</option>)}
              </select></div>
            <div style={{fontSize:20,color:C.purpleMid,paddingBottom:8}}>⇄</div>
            <div><label style={lbl}>Tháng 2</label>
              <select style={{...inp,width:"auto",borderColor:C.gold,cursor:"pointer"}} value={m2} onChange={e=>setM2(e.target.value)}>
                {dataMonths.map(m=><option key={m} value={m}>{ML[m]}</option>)}
              </select></div>
          </div>
        </Card>

        <Card>
          <SecTitle>Tổng quan tất cả nền tảng</SecTitle>
          <ResponsiveContainer width="100%" height={isMobile?180:250}>
            <BarChart data={overviewData}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.silver}/>
              <XAxis dataKey="name" tick={{fill:C.textSub,fontSize:isMobile?11:12}}/>
              <YAxis tick={{fill:C.textSub,fontSize:isMobile?9:10}} tickFormatter={fmt} axisLine={false} tickLine={false} width={isMobile?32:40}/>
              <Tooltip {...tip} formatter={fmt}/><Legend wrapperStyle={{fontSize:isMobile?10:12}}/>
              <Bar dataKey={ML[m1]} fill={C.purple} radius={[5,5,0,0]}/>
              <Bar dataKey={ML[m2]} fill={C.gold}   radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Platform selector */}
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,marginBottom:12,WebkitOverflowScrolling:"touch"}}>
          {PLATFORMS.map(pl=>{ const act=cp===pl; const ppm=PM[pl]; return <button key={pl} onClick={()=>setCp(pl)} style={{padding:isMobile?"7px 12px":"8px 16px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",border:`1.5px solid ${act?ppm.color:C.silver}`,fontWeight:700,fontSize:isMobile?11:13,background:act?ppm.color:C.white,color:act?C.white:C.textSub,whiteSpace:"nowrap",flexShrink:0}}>{ppm.icon} {ppm.label}</button>; })}
        </div>

        <div className="grid-2col" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:isMobile?10:16}}>
          <Card style={{marginBottom:0}}>
            <SecTitle>{p.icon} {p.label}</SecTitle>
            <ResponsiveContainer width="100%" height={h2}>
              <BarChart data={detailData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.silver}/>
                <XAxis dataKey="name" tick={{fill:C.textSub,fontSize:isMobile?9:10}}/>
                <YAxis tick={{fill:C.textSub,fontSize:isMobile?8:9}} tickFormatter={fmt} axisLine={false} tickLine={false} width={isMobile?28:38}/>
                <Tooltip {...tip} formatter={fmt}/><Legend wrapperStyle={{fontSize:isMobile?10:12}}/>
                <Bar dataKey={ML[m1]} fill={C.purple} radius={[4,4,0,0]}/>
                <Bar dataKey={ML[m2]} fill={C.gold}   radius={[4,4,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card style={{marginBottom:0}}>
            <SecTitle>% Tăng trưởng</SecTitle>
            <ResponsiveContainer width="100%" height={h2}>
              <BarChart layout="vertical" data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.silver}/>
                <XAxis type="number" tick={{fill:C.textSub,fontSize:isMobile?9:10}} tickFormatter={v=>`${v}%`} axisLine={false}/>
                <YAxis type="category" dataKey="name" tick={{fill:C.textSub,fontSize:isMobile?11:11}} width={isMobile?28:95} axisLine={false} tickLine={false}/>
                <Tooltip {...tip} formatter={v=>`${v}%`}/>
                <Bar dataKey="pct" fill={C.purpleMid} radius={[0,5,5,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
        <div style={{height:isMobile?10:16}}/>

        {PLATFORMS.map(platform=>{
          const ppm=PM[platform]; const flds=FIELDS[platform];
          return (
            <Card key={platform}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
                <div style={{width:28,height:28,borderRadius:7,background:`${ppm.color}18`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>{ppm.icon}</div>
                <span style={{fontSize:isMobile?13:14,fontWeight:800,color:C.textMain}}>{ppm.label}</span>
              </div>
              <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:isMobile?12:13,minWidth:280}}>
                  <thead><tr style={{borderBottom:`2px solid ${C.border}`}}>
                    <th style={{textAlign:"left",padding:"7px 8px",color:C.textMuted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>Chỉ số</th>
                    <th style={{textAlign:"right",padding:"7px 8px",color:C.purple,fontWeight:700}}>{ML[m1]}</th>
                    <th style={{textAlign:"right",padding:"7px 8px",color:"#b07e00",fontWeight:700}}>{ML[m2]}</th>
                    <th style={{textAlign:"right",padding:"7px 8px",color:C.textMuted,fontWeight:700,fontSize:10,textTransform:"uppercase"}}>±</th>
                  </tr></thead>
                  <tbody>
                    {flds.map((f,i)=>{
                      const v1=d1[platform]?.[f.key]||0; const v2=d2[platform]?.[f.key]||0;
                      return (
                        <tr key={f.key} style={{borderBottom:`1px solid ${C.border}`,background:i%2===0?C.bg:C.white}}>
                          <td style={{padding:"8px 8px",color:C.textSub}}>{f.icon} {f.label}</td>
                          <td style={{padding:"8px 8px",textAlign:"right",color:C.purple,fontWeight:700}}>{fmt(v1)}</td>
                          <td style={{padding:"8px 8px",textAlign:"right",color:"#b07e00",fontWeight:700}}>{fmt(v2)}</td>
                          <td style={{padding:"8px 8px",textAlign:"right"}}><Badge val={pct(v2,v1)} small/></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  // ── Other Tasks Tab ──
  function OtherTab() {
    const monthNotes = otherNotes[noteMonth] || [];
    const today = new Date().toISOString().slice(0,10);
    const weekStart = new Date(Date.now() - 6*24*60*60*1000).toISOString().slice(0,10);
    const filtered = monthNotes.filter(n => {
      if (noteFilter==="done" && !n.done) return false;
      if (noteFilter==="todo" && n.done) return false;
      if (noteFilter!=="all"&&noteFilter!=="done"&&noteFilter!=="todo" && n.category!==noteFilter) return false;
      if (noteDateFilter==="today" && n.date !== today) return false;
      if (noteDateFilter==="thisweek" && n.date < weekStart) return false;
      if (noteDateFilter==="custom") {
        if (noteDateFrom && n.date < noteDateFrom) return false;
        if (noteDateTo && n.date > noteDateTo) return false;
      }
      return true;
    });
    const doneCnt = monthNotes.filter(n=>n.done).length;
    const pctDone = monthNotes.length ? Math.round(doneCnt/monthNotes.length*100) : 0;

    return (
      <div>
        <Card>
          <SecTitle>Chọn tháng</SecTitle>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {dataMonths.map(m=>{ const act=noteMonth===m; return (
              <button key={m} onClick={()=>setNoteMonth(m)} style={{padding:isMobile?"5px 10px":"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:isMobile?11:12,fontWeight:700,fontFamily:"inherit",background:act?`linear-gradient(135deg,${C.purple},${C.purpleMid})`:C.offWhite,color:act?C.white:C.textSub,whiteSpace:"nowrap"}}>{ML[m]}</button>
            );})}
          </div>
        </Card>

        {monthNotes.length>0&&(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:isMobile?12:18}}>
            {[
              {label:"Tổng công việc", val:monthNotes.length, icon:"📋", c:C.purple},
              {label:"Hoàn thành",     val:doneCnt,           icon:"✅", c:"#2e7d32"},
              {label:"Còn lại",        val:monthNotes.length-doneCnt, icon:"⏳", c:"#e65100"},
            ].map(k=>(
              <div key={k.label} style={{background:`linear-gradient(135deg,${k.c},${k.c}cc)`,borderRadius:12,padding:isMobile?"12px 10px":"14px 16px",boxShadow:`0 4px 12px ${k.c}33`,textAlign:"center"}}>
                <div style={{fontSize:isMobile?20:24}}>{k.icon}</div>
                <div style={{fontSize:isMobile?22:28,fontWeight:900,color:C.white,lineHeight:1}}>{k.val}</div>
                <div style={{fontSize:isMobile?9:10,color:`${C.white}cc`,fontWeight:700,textTransform:"uppercase",marginTop:2}}>{k.label}</div>
              </div>
            ))}
          </div>
        )}

        {monthNotes.length>0&&(
          <Card style={{padding:isMobile?12:16,marginBottom:isMobile?12:18}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <span style={{fontSize:12,fontWeight:700,color:C.textSub}}>Tiến độ tháng {ML[noteMonth]}</span>
              <span style={{fontSize:13,fontWeight:800,color:C.purple}}>{pctDone}%</span>
            </div>
            <div style={{height:10,background:C.silver,borderRadius:10,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pctDone}%`,background:`linear-gradient(90deg,${C.purple},${C.purpleMid})`,borderRadius:10,transition:"width .4s ease"}}/>
            </div>
          </Card>
        )}

        {monthNotes.length>0&&(
          <div style={{marginBottom:12}}>
            <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,WebkitOverflowScrolling:"touch"}}>
              {[{id:"all",label:"Tất cả",icon:"📋"},{id:"todo",label:"Chưa xong",icon:"⏳"},{id:"done",label:"Xong",icon:"✅"},...NOTE_CATS].map(f=>{ const act=noteFilter===f.id; return (
                <button key={f.id} onClick={()=>setNoteFilter(f.id)} style={{padding:isMobile?"6px 10px":"7px 14px",borderRadius:20,border:`1px solid ${act?C.purple:C.silver}`,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:isMobile?10:11,background:act?C.purpleLight:"transparent",color:act?C.purple:C.textSub,whiteSpace:"nowrap",flexShrink:0}}>
                  {f.icon} {f.label} {f.id==="all"?`(${monthNotes.length})`:f.id==="done"?`(${doneCnt})`:f.id==="todo"?`(${monthNotes.length-doneCnt})`:""}
                </button>
              );})}
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
            {/* Add form — admin only */}
        {isAdmin&&(
          <Card>
            <SecTitle>➕ Thêm công việc — {ML[noteMonth]}</SecTitle>
            <div style={{display:"grid",gridTemplateColumns:isMobile?"1fr 1fr":"2fr 1fr 1fr",gap:10,marginBottom:10}}>
              <div style={{gridColumn:isMobile?"1/-1":"auto"}}>
                <label style={lbl}>📝 Tên công việc *</label>
                <input style={{...inp,padding:"9px 12px",fontSize:13}} placeholder="Tên công việc..."
                  value={noteForm.title}
                  onChange={e=>setNoteForm(f=>({...f,title:e.target.value}))}
                  onKeyDown={e=>{if(e.key==="Enter")addNote();}}
                />
              </div>
              <div>
                <label style={lbl}>🏷 Danh mục</label>
                <select style={{...inp,padding:"9px 12px",fontSize:13,cursor:"pointer"}} value={noteForm.category} onChange={e=>setNoteForm(f=>({...f,category:e.target.value}))}>
                  {NOTE_CATS.map(c=><option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>📅 Ngày</label>
                <input type="date" style={{...inp,padding:"9px 12px",fontSize:13}} value={noteForm.date} onChange={e=>setNoteForm(f=>({...f,date:e.target.value}))}/>
              </div>
            </div>
            <div style={{marginBottom:12}}>                <label style={lbl}>📄 Ghi chú thêm</label>
              <textarea style={{...inp,padding:"9px 12px",fontSize:13,minHeight:72,resize:"vertical"}} placeholder="Chi tiết công việc, kết quả, ghi chú..."
                value={noteForm.content}
                onChange={e=>setNoteForm(f=>({...f,content:e.target.value}))}
              />
            </div>
            <Btn variant="primary" onClick={addNote}>+ Thêm công việc</Btn>
          </Card>
        )}
          <span style={{fontSize:11,color:C.textMuted,fontWeight:700,flexShrink:0}}>📅 Lọc ngày:</span>
              {[{id:"all",label:"Tất cả"},{id:"today",label:"Hôm nay"},{id:"thisweek",label:"7 ngày qua"}].map(f=>{
                const act=noteDateFilter===f.id;
                return <button key={f.id} onClick={()=>{setNoteDateFilter(f.id);setNoteDateFrom("");setNoteDateTo("");}} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${act?C.gold:"#dbdbdb"}`,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,background:act?C.goldLight:"transparent",color:act?"#b07e00":C.textSub,whiteSpace:"nowrap",flexShrink:0}}>{f.label}</button>;
              })}
              <button onClick={()=>setNoteDateFilter("custom")} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${noteDateFilter==="custom"?C.gold:"#dbdbdb"}`,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:11,background:noteDateFilter==="custom"?C.goldLight:"transparent",color:noteDateFilter==="custom"?"#b07e00":C.textSub,whiteSpace:"nowrap",flexShrink:0}}>📆 Tùy chọn</button>
              {noteDateFilter==="custom"&&(
                <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                  <input type="date" value={noteDateFrom} onChange={e=>setNoteDateFrom(e.target.value)} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 8px",fontSize:12,outline:"none",background:C.offWhite,color:C.textMain,fontFamily:"inherit"}}/>
                  <span style={{fontSize:11,color:C.textMuted}}>→</span>
                  <input type="date" value={noteDateTo} onChange={e=>setNoteDateTo(e.target.value)} style={{border:`1px solid ${C.border}`,borderRadius:8,padding:"4px 8px",fontSize:12,outline:"none",background:C.offWhite,color:C.textMain,fontFamily:"inherit"}}/>
                  {(noteDateFrom||noteDateTo)&&<button onClick={()=>{setNoteDateFrom("");setNoteDateTo("");}} style={{padding:"4px 10px",borderRadius:8,border:`1px solid ${C.silver}`,background:"transparent",color:C.textMuted,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>✕ Xoá</button>}
                </div>
              )}
              {filtered.length!==monthNotes.length&&<span style={{fontSize:11,color:C.purpleMid,fontWeight:700,marginLeft:4}}>{filtered.length}/{monthNotes.length} công việc</span>}
            </div>
          </div>
        )}
        {filtered.length===0&&<Card><div style={{textAlign:"center",color:C.textMuted,padding:"32px 0",fontSize:13}}>{monthNotes.length===0?"Chưa có công việc nào.":"Không có công việc nào trong danh mục này."}</div></Card>}
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {filtered.map(n=>{
            const cat=NOTE_CATS.find(c=>c.id===n.category)||NOTE_CATS[6];
            return (
              <div key={n.id} style={{background:n.done?C.offWhite:C.cardBg,borderRadius:14,border:`1px solid ${n.done?C.silver:C.border}`,padding:isMobile?"12px 14px":"14px 18px",boxShadow:n.done?"none":"0 2px 8px #40123e08",opacity:n.done?.75:1,transition:"all .2s"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                  <button onClick={()=>isAdmin&&toggleNote(noteMonth,n.id)} style={{width:22,height:22,borderRadius:6,border:`2px solid ${n.done?"#2e7d32":C.purpleMid}`,background:n.done?"#2e7d32":"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,marginTop:1,cursor:isAdmin?"pointer":"default",opacity:isAdmin?1:0.7}}>
                    {n.done?"✓":""}
                  </button>
                  <div style={{flex:1,minWidth:0,overflow:"hidden"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:n.content?6:0}}>
                      <span style={{fontSize:isMobile?12:14,fontWeight:700,color:n.done?C.textMuted:C.textMain,textDecoration:n.done?"line-through":"none"}}>{n.title}</span>
                      <span style={{fontSize:10,fontWeight:700,color:C.white,background:cat.color,padding:"2px 7px",borderRadius:20,flexShrink:0}}>{cat.icon} {cat.label}</span>
                      <span style={{fontSize:10,color:C.textMuted,flexShrink:0}}>{n.date}</span>
                    </div>
                    {n.content&&<div style={{fontSize:isMobile?11:13,color:C.textSub,lineHeight:1.5,marginTop:4,wordBreak:"break-word",whiteSpace:"pre-wrap"}}>
                      {n.content.split(/(\s+)/).map((word,i)=>
                        /^https?:\/\/\S+/.test(word)
                          ? <a key={i} href={word} target="_blank" rel="noopener noreferrer" style={{color:C.purpleMid,textDecoration:"underline",wordBreak:"break-all"}}>{word}</a>
                          : <span key={i}>{word}</span>
                      )}
                    </div>}
                  </div>
                  {isAdmin&&<button onClick={()=>removeNote(noteMonth,n.id)} style={{background:"transparent",border:"none",cursor:"pointer",color:C.textMuted,fontSize:18,padding:"0 2px",flexShrink:0,lineHeight:1}}>×</button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── KPIs ──
  const kpis=[
    {label:"Total Posts",   val:PLATFORMS.reduce((s,p)=>s+(cur[p]?.posts||0),0), icon:"📝",c1:C.purple,c2:C.purpleMid},
    {label:"Web Sessions",  val:cur.website?.sessions,   icon:"🌐",c1:"#1a237e",c2:"#3949ab"},
    {label:"TikTok Views",  val:cur.tiktok?.views,       icon:"🎵",c1:"#006064",c2:"#00acc1"},
    {label:"YouTube Views", val:cur.youtube?.views,      icon:"▶️", c1:"#b71c1c",c2:"#e53935"},
    {label:"FB Reach",      val:cur.fanpage?.reach,      icon:"📘",c1:"#1565c0",c2:"#1e88e5"},
    {label:"Maps Views",    val:cur.ggmaps?.views,       icon:"📍",c1:"#1b5e20",c2:"#34a853"},
    {label:"Web Chuyển đổi",val:(cur.website?.hotline||0)+(cur.website?.form||0)+(cur.website?.zalo||0),icon:"🎯",c1:"#4a148c",c2:"#7b1fa2"},
  ];

  // ── RENDER ──
  if (loading) return (
    <div style={{fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif",background:"#faf8fa",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
      <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,#eec277,#faefdc)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26}}>🌲</div>
      <div style={{fontSize:16,fontWeight:700,color:"#40123e"}}>Đang tải dữ liệu...</div>
      <div style={{fontSize:12,color:"#b6b1b7"}}>Gỗ Thanh Thùy Marketing Dashboard</div>
    </div>
  );

  return (
    <div style={{fontFamily:"'IBM Plex Sans','Segoe UI',sans-serif",background:C.bg,minHeight:"100vh",color:C.textMain}}>

      {/* ── HEADER ── */}
      <div style={{background:`linear-gradient(135deg,${C.purple} 0%,#6b1f68 60%,${C.purpleMid} 100%)`,boxShadow:"0 4px 24px #40123e33",position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:1400,margin:"0 auto",padding:isMobile?"0 14px":"0 24px",display:"flex",justifyContent:"space-between",alignItems:"center",height:isMobile?56:64}}>

          {/* Brand */}
          <div style={{display:"flex",alignItems:"center",gap:isMobile?10:14}}>
            <div onClick={handleLogoClick} style={{width:isMobile?34:40,height:isMobile?34:40,borderRadius:10,background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:isMobile?17:20,flexShrink:0,boxShadow:"0 2px 8px #eec27744",cursor:isAdmin?"default":"pointer",transition:"transform .15s",userSelect:"none"}} title={isAdmin?"🔑 Admin":"Click để đăng nhập admin"}>🌲</div>
            <div>
              <div style={{fontSize:isMobile?14:18,fontWeight:900,color:C.white,letterSpacing:-.3,lineHeight:1.1}}>Gỗ Thanh Thùy</div>
              {!isMobile&&<div style={{fontSize:10,color:`${C.gold}cc`,fontWeight:600,letterSpacing:1,textTransform:"uppercase"}}>Marketing Dashboard</div>}
            </div>
          </div>

          {/* Desktop nav */}
          {!isMobile&&(
            <div style={{display:"flex",gap:2}}>
              {TABS.map(t=>{ const act=tab===t.id; return <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 18px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,fontFamily:"inherit",background:act?`${C.gold}22`:"transparent",color:act?C.gold:C.purpleLight,borderBottom:act?`2px solid ${C.gold}`:"2px solid transparent",transition:"all .15s"}}>{t.icon} {t.label}</button>; })}
            </div>
          )}

          {/* Admin badge + Logout */}
          {!isMobile&&isAdmin&&(
            <div style={{display:"flex",alignItems:"center",gap:8,marginRight:12}}>
              <span style={{fontSize:10,fontWeight:700,color:C.gold,background:"rgba(255,255,255,.12)",padding:"3px 10px",borderRadius:20,border:`1px solid ${C.gold}55`,whiteSpace:"nowrap"}}>👑 Admin</span>
              <button onClick={handleAdminLogout} style={{padding:"5px 10px",borderRadius:8,border:`1px solid ${C.gold}66`,background:"transparent",color:`${C.gold}cc`,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>🔒 Thoát</button>
            </div>
          )}
          {/* Mobile hamburger */}
          {isMobile&&(
            <button onClick={()=>setMobileMenuOpen(!mobileMenuOpen)} style={{background:"transparent",border:"none",color:C.white,fontSize:22,cursor:"pointer",padding:4,lineHeight:1}}>
              {mobileMenuOpen?"✕":"☰"}
            </button>
          )}
        </div>

        {/* Mobile dropdown menu */}
        {isMobile&&mobileMenuOpen&&(
          <div style={{background:C.purple,borderTop:`1px solid #ffffff22`,padding:"8px 14px 12px"}}>
            {TABS.map(t=>{ const act=tab===t.id; return <button key={t.id} onClick={()=>{setTab(t.id);setMobileMenuOpen(false);}} style={{display:"block",width:"100%",textAlign:"left",padding:"11px 14px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:14,fontFamily:"inherit",background:act?`${C.gold}22`:"transparent",color:act?C.gold:C.purpleLight,marginBottom:2}}>{t.icon} {t.label}</button>; })}
          </div>
        )}
      </div>

      {/* ── MONTH BAR ── */}
      {(tab==="dashboard"||tab==="charts")&&(
        <div style={{background:C.white,borderBottom:`1px solid ${C.border}`,padding:isMobile?"10px 14px":"12px 24px",overflowX:"auto",WebkitOverflowScrolling:"touch"}}>
          <div style={{maxWidth:1400,margin:"0 auto",display:"flex",alignItems:"center",gap:8,flexWrap:isMobile?"nowrap":"wrap",minWidth:"max-content"}}>
            <span style={{fontSize:11,color:C.textMuted,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginRight:4,flexShrink:0}}>Tháng:</span>
            {dataMonths.map(m=>{ const act=selMonth===m; return <button key={m} onClick={()=>setSelMonth(m)} style={{padding:isMobile?"5px 10px":"6px 14px",borderRadius:8,border:"none",cursor:"pointer",fontSize:isMobile?11:12,fontWeight:700,fontFamily:"inherit",background:act?`linear-gradient(135deg,${C.purple},${C.purpleMid})`:C.offWhite,color:act?C.white:C.textSub,flexShrink:0,whiteSpace:"nowrap"}}>{ML[m]}</button>; })}
            {prevMonth&&<span style={{fontSize:10,color:C.textMuted,flexShrink:0,marginLeft:4}}>↩ {ML[prevMonth]}</span>}
          </div>
        </div>
      )}

      {/* ── BODY ── */}
      <div style={{maxWidth:1400,margin:"0 auto",padding:isMobile?"12px 12px 80px":"24px 20px 40px"}}>

        {tab==="dashboard"&&(
          <div>
            <div className="kpi-grid" style={{display:"grid",gridTemplateColumns:`repeat(${isMobile?2:4},1fr)`,gap:isMobile?10:14,marginBottom:isMobile?12:20}}>
              {kpis.map(k=>(
                <div key={k.label} style={{background:`linear-gradient(135deg,${k.c1},${k.c2})`,borderRadius:isMobile?10:14,padding:isMobile?"12px 12px":"16px 18px",boxShadow:`0 4px 16px ${k.c1}33`}}>
                  <div style={{fontSize:isMobile?18:22}}>{k.icon}</div>
                  <div style={{fontSize:isMobile?20:26,fontWeight:900,color:C.white,lineHeight:1.1,marginTop:isMobile?4:6,letterSpacing:-.5}}>{fmt(k.val)}</div>
                  <div style={{fontSize:isMobile?9:10,color:`${C.white}bb`,fontWeight:700,textTransform:"uppercase",letterSpacing:.5,marginTop:3}}>{k.label}</div>
                </div>
              ))}
            </div>
            {PLATFORMS.map(p=><PlatCard key={p} platform={p}/>)}
          </div>
        )}

        {tab==="charts"  && ChartsTab()}
        {tab==="other"   && OtherTab()}
        {tab==="compare" && <CompareTab />}
        {tab==="input"   && InputTab()}
        {tab==="content" && <ContentPlan isAdmin={isAdmin} apiGet={apiGet} apiSet={apiSet} isMobile={isMobile}/>}
        {tab==="cautruc" && <CauTruc isMobile={isMobile}/>}
        {tab==="keyrank" && <KeyRank isAdmin={isAdmin} isMobile={isMobile} apiGet={apiGet} apiSet={apiSet}/>}
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      {isMobile&&(
        <div style={{position:"fixed",bottom:0,left:0,right:0,background:C.white,borderTop:`1px solid ${C.border}`,display:"flex",boxShadow:"0 -4px 20px #40123e14",zIndex:90}}>
          {TABS.map(t=>{ const act=tab===t.id; return <button key={t.id} onClick={()=>{setTab(t.id);setMobileMenuOpen(false);}} style={{flex:1,padding:"10px 4px",border:"none",cursor:"pointer",fontFamily:"inherit",background:"transparent",color:act?C.purple:C.textMuted,borderTop:act?`2px solid ${C.purple}`:"2px solid transparent",transition:"all .15s"}}>
            <div style={{fontSize:18}}>{t.icon}</div>
            <div style={{fontSize:9,fontWeight:700,marginTop:2}}>{t.label}</div>
          </button>; })}
        </div>
      )}

      {/* ── FOOTER ── */}
      <div style={{borderTop:`1px solid ${C.border}`,background:C.white,padding:isMobile?"10px 14px":"14px 24px"}}>
        <div style={{maxWidth:1400,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{fontSize:11,color:C.textMuted}}>
            {saveStatus==="saved"&&<span style={{marginRight:8,color:"#2e7d32",fontWeight:700}}>✓ Đã lưu</span>}
            © {new Date().getFullYear()} Gỗ Thanh Thùy
            {isAdmin?<span style={{marginLeft:8,background:"#e8f5e9",color:"#2e7d32",padding:"2px 7px",borderRadius:6,fontWeight:700,fontSize:10}}>👑 Admin</span>:<span style={{marginLeft:8,background:C.purpleLight,color:C.purple,padding:"2px 7px",borderRadius:6,fontWeight:700,fontSize:10}}>👁 Viewer</span>}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <input ref={importRef} type="file" accept=".json" style={{display:"none"}} onChange={importData}/>
            <button onClick={()=>importRef.current.click()} style={{padding:"6px 14px",borderRadius:8,border:`1px solid ${C.purpleMid}`,background:"transparent",color:C.purpleMid,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>📂 Import</button>
            <button onClick={exportData} style={{padding:"6px 14px",borderRadius:8,border:"none",background:`linear-gradient(135deg,${C.purple},${C.purpleMid})`,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>💾 Export JSON</button>
            {isAdmin&&<button onClick={handleAdminLogout} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${C.border}`,background:"transparent",color:C.textMuted,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>🔒 Thoát Admin</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
