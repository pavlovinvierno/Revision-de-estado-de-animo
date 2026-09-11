const $=id=>document.getElementById(id);
const KEY="estadoTrackerV3";
let entries=JSON.parse(localStorage.getItem(KEY)||"[]");
const ids=["date","sleepHours","sleepStart","sleepEnd","sleepNeed","energy","lowMood","activation","irritability","thoughtSpeed","concentration","risk","dissociation","riskBehavior","rested","reducedNeed","physical","behaviors","observation"];
// Draft persistence: unfinished entries survive closing/reloading the app.
const DRAFT_KEY="estadoTrackerV3Draft";
function saveDraft(){
  const draft={};
  ids.forEach(id=>{ const el=$(id); if(el) draft[id]=el.value; });
  localStorage.setItem(DRAFT_KEY,JSON.stringify(draft));
}
function restoreDraft(){
  try{
    const d=JSON.parse(localStorage.getItem(DRAFT_KEY)||"null");
    if(!d) return;
    ids.forEach(id=>{ if(d[id]!==undefined && $(id)) $(id).value=d[id]; });
  }catch{}
}
ids.forEach(id=>{
  const el=$(id);
  if(el) ["input","change"].forEach(ev=>el.addEventListener(ev,saveDraft));
});
window.addEventListener("beforeunload",saveDraft);

$("date").value=new Date().toISOString().slice(0,10);
restoreDraft();
function val(id){return $(id).value}
function save(){localStorage.setItem(KEY,JSON.stringify(entries));render()}
function formData(){
 let o={id:Date.now(),date:val("date")};
 ids.slice(1).forEach(id=>o[id]=val(id)); return o;
}
$("entryForm").addEventListener("submit",e=>{e.preventDefault();let d=formData();entries=entries.filter(x=>x.date!==d.date);entries.push(d);entries.sort((a,b)=>a.date.localeCompare(b.date));save();localStorage.removeItem(DRAFT_KEY);e.target.reset();$("date").value=d.date});
$("clearBtn").onclick=()=>{$("entryForm").reset();localStorage.removeItem(DRAFT_KEY);$("date").value=new Date().toISOString().slice(0,10)};
function num(v){return v===""?null:Number(v)}
function filtered(){let a=$("from").value,b=$("to").value;return entries.filter(e=>(!a||e.date>=a)&&(!b||e.date<=b)).sort((x,y)=>x.date.localeCompare(y.date))}
function renderTimeline(){
 let data=filtered(); if(!data.length){$("timeline").innerHTML='<div class="empty">No hay registros en este periodo.</div>';return}
 $("timeline").innerHTML=data.map(e=>`<div class="day">
 <div class="dayhead"><span>${e.date}</span><span>${e.sleepHours||"—"} h sueño</span></div>
 <div class="metrics">
 ${metric("Energía",e.energy)}${metric("Ánimo bajo",e.lowMood)}${metric("Activación",e.activation)}${metric("Irritabilidad",e.irritability)}${metric("Pensamiento",e.thoughtSpeed)}${metric("Concentración",e.concentration)}${metric("Riesgo",e.risk)}${metric("Necesidad sueño",e.sleepNeed)}${metric("Conducta riesgo",e.riskBehavior||"—")}
 </div>
 <div class="details">
 ${e.reducedNeed?tag("Menor necesidad de dormir: "+e.reducedNeed):""}${e.rested?tag("Descansado: "+e.rested):""}${e.dissociation?tag("Disociación: "+e.dissociation):""}
 ${e.physical?`<b>Síntomas físicos:</b> ${escapeHtml(e.physical)}`:""} ${e.behaviors?`<br><b>Conductas:</b> ${escapeHtml(e.behaviors)}`:""} ${e.observation?`<br><b>Observación:</b> ${escapeHtml(e.observation)}`:""}
 </div></div>`).join("");
}
function metric(n,v){return `<div class="metric"><small>${n}</small><b>${v||"—"}</b></div>`}
function tag(s){return `<span class="tag">${escapeHtml(s)}</span>`}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function renderPatterns(){
 let d=filtered(); if(d.length<2){$("patterns").innerHTML='<div class="empty">Se necesitan al menos 2 registros para estimar patrones.</div>';return}
 let avg=k=>{let a=d.map(x=>num(x[k])).filter(x=>x!=null);return a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):"—"};
 let high=k=>d.filter(x=>num(x[k])>=7).length;
 let lowSleep=d.filter(x=>num(x.sleepHours)<6).length;
 let reduced=d.filter(x=>x.reducedNeed==="Sí").length;
 let highRisk=d.filter(x=>num(x.risk)>=7||x.riskBehavior==="Sí").length;
 let highAct=d.filter(x=>num(x.activation)>=7).length;
 let lowEnergy=d.filter(x=>num(x.energy)<=3).length;
 let highNeed=d.filter(x=>num(x.sleepNeed)>=7).length;
 $("patterns").innerHTML=[
 `<div class="pattern"><strong>Activación alta</strong>${highAct} de ${d.length} días con activación ≥7/10.</div>`,
 `<div class="pattern"><strong>Sueño reducido</strong>${lowSleep} de ${d.length} días con <6 h de sueño.</div>`,
 `<div class="pattern"><strong>Menor necesidad de dormir</strong>${reduced} de ${d.length} días marcados como “Sí”.</div>`,
 `<div class="pattern"><strong>Riesgo elevado</strong>${highRisk} de ${d.length} días con riesgo ≥7/10 o conducta de riesgo.</div>`,
 `<div class="pattern"><strong>Caída de energía</strong>${lowEnergy} de ${d.length} días con energía ≤3/10.</div>`,
 `<div class="pattern"><strong>Necesidad de dormir elevada</strong>${highNeed} de ${d.length} días con ≥7/10.</div>`,
 `<div class="pattern"><strong>Promedios del periodo</strong>Energía ${avg("energy")} · Activación ${avg("activation")} · Ánimo bajo ${avg("lowMood")} · Necesidad de sueño ${avg("sleepNeed")} · Riesgo ${avg("risk")}</div>`
].join("");
}
function renderEntries(){
 let d=[...entries].sort((a,b)=>b.date.localeCompare(a.date)); $("entries").innerHTML=d.length?d.map(e=>`<div class="entry"><div><b>${e.date}</b> · sueño ${e.sleepHours||"—"} h · energía ${e.energy||"—"} · activación ${e.activation||"—"} · riesgo ${e.risk||"—"}</div><button class="secondary" onclick="delEntry('${e.id}')">Eliminar</button></div>`).join(""):'<div class="empty">Sin registros.</div>';
}
function render(){renderTimeline();renderPatterns();renderEntries()}
window.delEntry=id=>{entries=entries.filter(e=>String(e.id)!==String(id));save()}
$("todayBtn").onclick=()=>{let to=new Date(),from=new Date();from.setDate(to.getDate()-13);$("to").value=to.toISOString().slice(0,10);$("from").value=from.toISOString().slice(0,10);render()};
["from","to"].forEach(id=>$(id).addEventListener("change",render));
async function exportFile(name,data,type){
  const file=new File([data],name,{type});
  // iOS PWA/Safari: use the native Share sheet so the user can save to Files.
  if(navigator.share && navigator.canShare){
    try{
      if(navigator.canShare({files:[file]})){
        await navigator.share({files:[file],title:name});
        return;
      }
    }catch(err){
      if(err && err.name==="AbortError") return;
    }
  }
  // Fallback for browsers without file sharing.
  const url=URL.createObjectURL(file);
  const a=document.createElement("a");
  a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("exportJson").onclick=()=>exportFile("registro_estado_v3.json",JSON.stringify(entries,null,2),"application/json");
$("exportCsv").onclick=()=>{if(!entries.length){alert("No hay registros para exportar.");return;}let keys=Object.keys(entries[0]),rows=[keys,...entries.map(e=>keys.map(k=>String(e[k]??"").replaceAll('"','""')))];let csv=rows.map(r=>r.map(x=>`"${x}"`).join(",")).join("\n");exportFile("registro_estado_v3.csv",csv,"text/csv")};
$("importJson").onclick=()=>$("fileInput").click();
$("fileInput").onchange=async e=>{try{let x=JSON.parse(await e.target.files[0].text());if(!Array.isArray(x))throw Error();entries=x;save();alert("Importación completada.")}catch{alert("Archivo JSON no válido.")}};
function download(name,data,type){let a=document.createElement("a");a.href=URL.createObjectURL(new Blob([data],{type}));a.download=name;a.click();URL.revokeObjectURL(a.href)}
function fmtDate(iso){
  if(!iso) return "—";
  const [y,m,d]=iso.split("-");
  return `${d}/${m}/${y}`;
}
function avgNum(data,key){
  const a=data.map(e=>num(e[key])).filter(v=>v!=null && Number.isFinite(v));
  return a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):"—";
}
function sumSleep(data){
  const a=data.map(e=>num(e.sleepHours)).filter(v=>v!=null && Number.isFinite(v));
  return a.length?(a.reduce((x,y)=>x+y,0)/a.length).toFixed(1):"—";
}
function escapeAttr(s){return escapeHtml(s).replace(/\n/g," ")}
function reportMetric(label,value){return `<div class="rmetric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`}
function makeChart(data, keys){
  const W=900,H=300,PL=52,PR=20,PT=28,PB=52;
  const n=data.length, innerW=W-PL-PR, innerH=H-PT-PB;
  const x=i=>n<=1?PL+innerW/2:PL+i*innerW/(n-1);
  const y=v=>PT+(10-v)*innerH/10;
  const colors=["#17202a","#59636e","#8a949e","#b1b8bf","#3f4b56"];
  let svg=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tendencias del periodo">`;
  for(let v=0;v<=10;v+=2){const yy=y(v);svg+=`<line x1="${PL}" y1="${yy}" x2="${W-PR}" y2="${yy}" stroke="#dfe3e8"/><text x="${PL-10}" y="${yy+4}" text-anchor="end" font-size="12" fill="#667085">${v}</text>`;}
  data.forEach((e,i)=>{if(i%Math.max(1,Math.ceil(n/8))===0){svg+=`<text x="${x(i)}" y="${H-18}" text-anchor="middle" font-size="11" fill="#667085">${fmtDate(e.date).slice(0,5)}</text>`;}});
  keys.forEach((key,ki)=>{
    let path="",started=false;
    data.forEach((e,i)=>{const v=num(e[key]);if(v==null)return;path+=(started?" L":"M")+`${x(i)} ${y(v)}`;started=true;});
    if(started){svg+=`<path d="${path}" fill="none" stroke="${colors[ki%colors.length]}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`;data.forEach((e,i)=>{const v=num(e[key]);if(v!=null)svg+=`<circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="white" stroke="${colors[ki%colors.length]}" stroke-width="2"/>`;});}
  });
  const names={energy:"Energía",activation:"Activación",lowMood:"Ánimo bajo",risk:"Riesgo",sleepNeed:"Necesidad de sueño"};
  let lx=PL, ly=18;
  keys.forEach((key,ki)=>{svg+=`<line x1="${lx}" y1="${ly-4}" x2="${lx+20}" y2="${ly-4}" stroke="${colors[ki%colors.length]}" stroke-width="3"/><text x="${lx+26}" y="${ly}" font-size="12" fill="#17202a">${names[key]||key}</text>`;lx+=115;});
  return svg+`</svg>`;
}
function buildReport(){
  let data=filtered();
  if(!data.length){alert("No hay registros en el periodo seleccionado.");return null;}
  const from=$("from").value||data[0].date,to=$('to').value||data[data.length-1].date;
  const highAct=data.filter(e=>num(e.activation)>=7).length;
  const lowSleep=data.filter(e=>num(e.sleepHours)<6).length;
  const reduced=data.filter(e=>e.reducedNeed==="Sí").length;
  const highRisk=data.filter(e=>num(e.risk)>=7||e.riskBehavior==="Sí").length;
  const lowEnergy=data.filter(e=>num(e.energy)<=3).length;
  const highNeed=data.filter(e=>num(e.sleepNeed)>=7).length;
  const rows=data.map(e=>`<tr><td>${fmtDate(e.date)}</td><td>${e.sleepHours||"—"}</td><td>${e.energy||"—"}</td><td>${e.lowMood||"—"}</td><td>${e.activation||"—"}</td><td>${e.irritability||"—"}</td><td>${e.thoughtSpeed||"—"}</td><td>${e.concentration||"—"}</td><td>${e.risk||"—"}</td><td>${escapeHtml(e.reducedNeed||"—")}</td><td>${escapeHtml(e.rested||"—")}</td></tr>`).join("");
  const details=data.map(e=>`<article class="rday"><div class="rdayhead"><strong>${fmtDate(e.date)}</strong><span>${e.sleepHours||"—"} h de sueño</span></div><div class="rgrid">${reportMetric("Energía",e.energy||"—")}${reportMetric("Ánimo bajo",e.lowMood||"—")}${reportMetric("Activación",e.activation||"—")}${reportMetric("Irritabilidad",e.irritability||"—")}${reportMetric("Pensamiento",e.thoughtSpeed||"—")}${reportMetric("Concentración",e.concentration||"—")}${reportMetric("Riesgo",e.risk||"—")}${reportMetric("Necesidad sueño",e.sleepNeed||"—")}</div>${e.physical?`<p><b>Síntomas físicos:</b> ${escapeHtml(e.physical)}</p>`:""}${e.behaviors?`<p><b>Conductas relevantes:</b> ${escapeHtml(e.behaviors)}</p>`:""}${e.observation?`<p><b>Observación:</b> ${escapeHtml(e.observation)}</p>`:""}<p class="tags">${e.reducedNeed?`<span>${escapeHtml("Menor necesidad de dormir: "+e.reducedNeed)}</span>`:""}${e.rested?`<span>${escapeHtml("Descansado: "+e.rested)}</span>`:""}${e.dissociation?`<span>${escapeHtml("Disociación: "+e.dissociation)}</span>`:""}${e.riskBehavior?`<span>${escapeHtml("Conducta de riesgo: "+e.riskBehavior)}</span>`:""}</p></article>`).join("");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Informe de Estado ${fmtDate(from)}–${fmtDate(to)}</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f4f6f8;color:#17202a;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}main{max-width:1000px;margin:0 auto;padding:28px}header{background:#17202a;color:#fff;padding:28px;margin:-28px -28px 24px}h1{margin:0 0 6px;font-size:30px}h2{margin:24px 0 12px;font-size:21px}.muted{color:#667085}.notice{background:#eef1f4;padding:12px 14px;border-radius:10px;font-size:13px}.metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.rmetric{background:#fff;border:1px solid #dfe3e8;border-radius:10px;padding:12px}.rmetric span{display:block;color:#667085;font-size:12px}.rmetric strong{display:block;font-size:22px;margin-top:3px}.chart{background:#fff;border:1px solid #dfe3e8;border-radius:12px;padding:12px;overflow:hidden}.chart svg{width:100%;height:auto}.rday{background:#fff;border:1px solid #dfe3e8;border-radius:12px;padding:14px;margin:10px 0;page-break-inside:avoid}.rdayhead{display:flex;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-bottom:10px}.rgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.rday p{margin:8px 0;white-space:pre-wrap}.tags span{display:inline-block;background:#eef1f4;border-radius:999px;padding:4px 8px;margin:2px;font-size:12px}.tablewrap{overflow:auto;background:#fff;border:1px solid #dfe3e8;border-radius:12px}table{border-collapse:collapse;width:100%;font-size:11px}th,td{border-bottom:1px solid #e5e7eb;padding:7px;text-align:left;white-space:nowrap}th{background:#f7f8fa}.printbtn{position:sticky;top:10px;float:right;border:0;border-radius:8px;padding:10px 14px;background:#fff;color:#17202a;font-weight:700}@media(max-width:700px){main{padding:18px}header{margin:-18px -18px 18px}.metrics{grid-template-columns:repeat(2,1fr)}.rgrid{grid-template-columns:repeat(2,1fr)}}@media print{body{background:#fff}main{max-width:none;padding:0}header{margin:0 0 18px;break-after:avoid}.printbtn{display:none}.chart{break-inside:avoid}.tablewrap{overflow:visible}.rday{box-shadow:none}a{color:inherit;text-decoration:none}}
  </style></head><body><main><header><button class="printbtn" onclick="window.print()">Imprimir / Guardar PDF</button><h1>Informe de Estado</h1><div>${fmtDate(from)} — ${fmtDate(to)}</div><div>${data.length} registro${data.length===1?"":"s"}</div></header>
  <div class="notice">Informe descriptivo basado exclusivamente en los registros introducidos. Las tendencias no constituyen un diagnóstico ni sustituyen una evaluación clínica.</div>
  <h2>Resumen del periodo</h2><div class="metrics">${reportMetric("Sueño promedio",sumSleep(data)+" h")}${reportMetric("Energía promedio",avgNum(data,"energy")+"/10")}${reportMetric("Ánimo bajo",avgNum(data,"lowMood")+"/10")}${reportMetric("Activación",avgNum(data,"activation")+"/10")}${reportMetric("Riesgo",avgNum(data,"risk")+"/10")}</div>
  <h2>Señales descriptivas</h2><div class="metrics">${reportMetric("Activación ≥7",`${highAct}/${data.length} días`)}${reportMetric("Sueño <6 h",`${lowSleep}/${data.length} días`)}${reportMetric("Menor necesidad",`${reduced}/${data.length} días`)}${reportMetric("Riesgo elevado",`${highRisk}/${data.length} días`)}${reportMetric("Energía ≤3",`${lowEnergy}/${data.length} días`)}</div>
  <h2>Tendencias</h2><div class="chart">${makeChart(data,["energy","activation","lowMood","risk","sleepNeed"])}</div>
  <h2>Cronología detallada</h2>${details}
  <h2>Tabla de registros</h2><div class="tablewrap"><table><thead><tr><th>Fecha</th><th>Sueño h</th><th>Energía</th><th>Ánimo</th><th>Activación</th><th>Irrit.</th><th>Pens.</th><th>Conc.</th><th>Riesgo</th><th>Menor necesidad</th><th>Descansado</th></tr></thead><tbody>${rows}</tbody></table></div>
  </main></body></html>`;
}
let lastReportHtml="";
$("reportBtn").onclick=()=>{
  const html=buildReport(); if(!html)return;
  lastReportHtml=html;
  const win=window.open("about:blank","_blank");
  if(win){win.document.open();win.document.write(html);win.document.close();$("reportStatus").textContent="Informe generado. Usa “Imprimir / Guardar PDF” dentro del informe.";}
  else {alert("El navegador bloqueó la ventana del informe. Permite ventanas emergentes e inténtalo de nuevo.");}
};
$("printReportBtn").onclick=()=>{
  if(!lastReportHtml){const html=buildReport();if(!html)return;lastReportHtml=html;}
  const win=window.open("about:blank","_blank");
  if(win){win.document.open();win.document.write(lastReportHtml);win.document.close();setTimeout(()=>win.print(),500);}
};

render();
