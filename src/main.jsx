import React,{useEffect,useState} from 'react';
import{createRoot}from'react-dom/client';
import{supabase,db,idFor,synchronize}from './client';
import{program,maxTest}from './program';
import './style.css';
function App(){
const[user,setUser]=useState(null),[loading,setLoading]=useState(true),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[error,setError]=useState(''),[week,setWeek]=useState(1),[day,setDay]=useState('Monday'),[tab,setTab]=useState('Today'),[logs,setLogs]=useState([]),[status,setStatus]=useState('Ready'),[newPassword,setNewPassword]=useState(''),[passwordSetup,setPasswordSetup]=useState(false);
useEffect(()=>{supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setLoading(false)});const{data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{setUser(session?.user||null);if(event==='PASSWORD_RECOVERY'||(event==='SIGNED_IN'&&location.hash.includes('type=invite')))setPasswordSetup(true)});return()=>subscription.unsubscribe()},[]);
async function reload(){if(user)setLogs(await db.logs.where('user_id').equals(user.id).toArray())}
async function sync(){if(!user||!navigator.onLine)return;setStatus('Syncing');try{await synchronize(user.id);await reload();setStatus('Synced')}catch(e){setStatus('Sync paused: '+e.message)}}
useEffect(()=>{reload();if(user)sync()},[user?.id]);
useEffect(()=>{const timer=setInterval(()=>sync(),45000),online=()=>sync();window.addEventListener('online',online);return()=>{clearInterval(timer);window.removeEventListener('online',online)}},[user?.id]);
const workout=program[week-1].workouts.find(w=>w.day===day)||program[week-1].workouts[0];
async function save(ex,n,patch){const id=idFor(user.id,week,workout.day,ex.id,n);const old=await db.logs.get(id);const record={id,user_id:user.id,week,day:workout.day,exercise_id:ex.id,set_number:n,weight:null,reps:null,rpe:null,done:false,deleted_at:null,...old,...patch,updated_at:new Date().toISOString(),dirty:1};await db.logs.put(record);await reload();setStatus('Saved on device • pending sync')}
async function signIn(e){e.preventDefault();setError('');const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message)}
async function exportBackup(){const data=await db.logs.where('user_id').equals(user.id).toArray();const blob=new Blob([JSON.stringify({exported_at:new Date().toISOString(),logs:data},null,2)],{type:'application/json'});const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download='powerbuilding-backup.json';link.click();URL.revokeObjectURL(link.href)}
if(loading)return <main className="login">Loading Powerbuilding…</main>;
if(!user)return <main className="login"><div className="logo">P</div><h1>Powerbuilding.</h1><p>Strength has a plan.</p><form onSubmit={signIn} className="panel"><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<p className="error">{error}</p>}<button className="primary">Sign in</button><small>Invitation-only access</small></form></main>;
if(passwordSetup)return <main className="login"><div className="logo">P</div><h1>Create your password</h1><form className="panel" onSubmit={async e=>{e.preventDefault();const {error}=await supabase.auth.updateUser({password:newPassword});if(error)setError(error.message);else{setPasswordSetup(false);history.replaceState({},'',location.pathname)}}}><input type="password" required minLength="12" value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="12+ character password"/>{error&&<p className="error">{error}</p>}<button className="primary">Save password</button></form></main>;
