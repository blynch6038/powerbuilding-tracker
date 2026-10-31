import {useEffect,useState} from 'react';

/** Check the deployed entry point without touching offline workout storage. */
export default function AppUpdate(){
 const [available,setAvailable]=useState(false),[busy,setBusy]=useState(false);
 useEffect(()=>{
  let alive=true;
  const current=document.querySelector<HTMLScriptElement>('script[type="module"][src]')?.src;
  async function check(){
   if(!navigator.onLine||document.visibilityState==='hidden')return;
   try{
    const registration=await navigator.serviceWorker?.getRegistration();
    await registration?.update();
    const response=await fetch('/index.html?pb-update='+Date.now(),{cache:'no-store'});
    if(!response.ok)return;
    const html=new DOMParser().parseFromString(await response.text(),'text/html');
    const next=html.querySelector<HTMLScriptElement>('script[type="module"][src]')?.getAttribute('src');
    if(alive&&current&&next&&new URL(next,location.origin).href!==current)setAvailable(true);
   }catch{/* Offline training continues when update checks fail. */}
  }
  const controlled=!!navigator.serviceWorker?.controller;
  const changed=()=>{if(alive&&controlled)setAvailable(true)};
  navigator.serviceWorker?.addEventListener('controllerchange',changed);
  document.addEventListener('visibilitychange',check);
  void check();const interval=setInterval(check,300000);
  return()=>{alive=false;clearInterval(interval);document.removeEventListener('visibilitychange',check);navigator.serviceWorker?.removeEventListener('controllerchange',changed)};
 },[]);
 async function refresh(){setBusy(true);try{
  const registration=await navigator.serviceWorker?.getRegistration();
  await registration?.update();
  const worker=registration?.installing||registration?.waiting;
  if(worker&&worker.state!=='activated'&&worker.state!=='redundant')await new Promise<void>(resolve=>{
   const finish=()=>{clearTimeout(timeout);worker.removeEventListener('statechange',changed);resolve()};
   const changed=()=>{if(worker.state==='activated'||worker.state==='redundant')finish()};
   const timeout=setTimeout(finish,10000);worker.addEventListener('statechange',changed);
  });
 }catch{/* A normal reload can still use the installed offline app. */}location.reload()}
 return <><div className="version-label">PERFORMANCE HUD · v1.1</div>{available&&<aside className="update-notice" role="status"><span>A new version is ready. Save your current set and notes, then refresh.</span><button disabled={busy} onClick={()=>void refresh()}>{busy?'Updating…':'Refresh app'}</button></aside>}</>;
}
