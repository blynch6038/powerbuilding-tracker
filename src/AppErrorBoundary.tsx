import React from 'react';
type State={error:Error|null};
export default class AppErrorBoundary extends React.Component<React.PropsWithChildren,State>{
 state:State={error:null};
 static getDerivedStateFromError(error:Error):State{return {error};}
 componentDidCatch(error:Error,info:React.ErrorInfo){console.error('Powerbuilding app render error',error,info);}
 render(){
  if(!this.state.error)return this.props.children;
  return <main style={{fontFamily:'-apple-system,system-ui,sans-serif',background:'#071323',color:'#f0f5ff',minHeight:'100vh',padding:'32px 20px'}}>
   <section style={{maxWidth:520,margin:'12vh auto',background:'#13273d',border:'1px solid #34516b',borderRadius:22,padding:28}}>
    <h1 style={{fontSize:28}}>Powerbuilding needs to reload</h1>
    <p>Something interrupted the workout screen. Your saved workout records have not been deliberately cleared.</p>
    <p style={{color:'#afc8dd',overflowWrap:'anywhere',fontSize:13}}>{this.state.error.message}</p>
    <button type="button" style={{background:'#337fe0',color:'#fff',border:0,borderRadius:12,padding:'14px 22px',fontSize:16}} onClick={()=>location.reload()}>Reload app</button>
   </section>
  </main>;
 }
}
