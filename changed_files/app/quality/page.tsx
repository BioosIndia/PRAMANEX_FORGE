import QualityMonitorPanel from '../quality-monitor-panel';
export const metadata={title:'Saved quality evidence | FORGE'};
export default function Page(){return <main style={{maxWidth:1100,margin:'0 auto',padding:'28px 20px',color:'#162c42',background:'#f8fafc',minHeight:'100vh'}}><nav style={{display:'flex',gap:22,flexWrap:'wrap'}}><a href='/'>FORGE home</a><a href='/app'>Workspace</a><a href='/mvp-checklist'>Working proof boundaries</a></nav><QualityMonitorPanel product='FORGE'/></main>;}
