import './password.css';
import React,{useState} from 'react';
import {supabase} from './client';
export default function PasswordPanel(){
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');
  async function save(e){
    e.preventDefault();
    setMessage('');
    if(password.length<12){setMessage('Use at least 12 characters.');return}
    if(password!==confirm){setMessage('Passwords do not match.');return}
    setBusy(true);
    try{
      const {error}=await supabase.auth.updateUser({password});
      if(error)throw error;
      setPassword('');setConfirm('');
      setMessage('Password saved. You can use it the next time you sign in.');
    }catch(e){setMessage(e.message||'Could not update your password.')}
    finally{setBusy(false)}
  }
  return <section className="exercise">
    <h3>Set or change your password</h3>
    <p>If you joined through an invitation and were signed in automatically, create your password here.</p>
    <form onSubmit={save}>
      <label>New password<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 12 characters" /></label>
      <label>Confirm password<input type="password" autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm password" /></label>
      <button className="primary" disabled={busy}>{busy?'Saving…':'Save password'}</button>
      {message&&<p role="status">{message}</p>}
    </form>
  </section>
}
