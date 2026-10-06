"use client";
import {useEffect,useState} from 'react';
export default function ProofNavigation({items}:{items:Array<[string,string]>}){
 const [active,setActive]=useState(items[0]?.[0]||'');
 useEffect(()=>{const nodes=items.map(([id])=>document.getElementById(id)).filter((n):n is HTMLElement=>!!n);const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top);if(visible[0])setActive(visible[0].target.id);},{rootMargin:'-15% 0px -60% 0px',threshold:0});nodes.forEach(n=>observer.observe(n));return()=>observer.disconnect();},[items]);
 return <nav className="pow-jump" aria-label="Product sections">{items.map(([id,label])=><a href={'#'+id} key={id} aria-current={active===id?'location':undefined} onClick={()=>setActive(id)}>{label}</a>)}</nav>;
}
