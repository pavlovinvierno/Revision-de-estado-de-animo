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
render();
