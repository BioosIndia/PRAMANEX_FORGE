"use client";
import { useEffect, useRef, type CSSProperties } from "react";

type Props = { revealSelector: string; stageSelector: string; accent: string };
/** Presentation only: native scroll, no fetches, record writes or workflow state. */
export default function PresentationMotion({revealSelector,stageSelector,accent}:Props) {
 const progress=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
  const fine=window.matchMedia("(hover: hover) and (pointer: fine)");
  const reveals=new Set<HTMLElement>();
  const stages=new Map<HTMLElement,{cleanup:()=>void;reset:()=>void}>();
  let scanFrame=0,scrollFrame=0,disposed=false,lastScroll=window.scrollY;
  let observer:IntersectionObserver|null=null;
  const resetStage=(el:HTMLElement)=>{el.style.setProperty("--stage-rx","0deg");el.style.setProperty("--stage-ry","0deg");el.style.setProperty("--stage-x","0px");el.style.setProperty("--stage-y","0px");};
  const scan=()=>{
   scanFrame=0;if(disposed)return;
   document.querySelectorAll<HTMLElement>(revealSelector).forEach(el=>{
    if(reveals.has(el))return;reveals.add(el);
    if(!reduce.matches&&observer){el.dataset.motionEnhanced="true";observer.observe(el);}
   });
   document.querySelectorAll<HTMLElement>(stageSelector).forEach(el=>{
    if(stages.has(el))return;
    el.dataset.motionStage="true";resetStage(el);
    let raf=0,x=0,y=0,tx=0,ty=0;
    const paint=()=>{raf=0;x+=(tx-x)*.11;y+=(ty-y)*.11;
     el.style.setProperty("--stage-rx",(-y*2.2).toFixed(3)+"deg");
     el.style.setProperty("--stage-ry",(x*2.8).toFixed(3)+"deg");
     el.style.setProperty("--stage-x",(x*3.5).toFixed(3)+"px");
     el.style.setProperty("--stage-y",(y*2.5).toFixed(3)+"px");
     if(Math.abs(tx-x)+Math.abs(ty-y)>.002&&!reduce.matches&&!document.hidden)raf=requestAnimationFrame(paint);
    };
    const schedule=()=>{if(!raf)raf=requestAnimationFrame(paint);};
    const move=(e:PointerEvent)=>{if(reduce.matches||!fine.matches||e.pointerType!=="mouse")return;
     const b=el.getBoundingClientRect();if(!b.width||!b.height)return;
     tx=Math.max(-1,Math.min(1,((e.clientX-b.left)/b.width-.5)*2));
     ty=Math.max(-1,Math.min(1,((e.clientY-b.top)/b.height-.5)*2));schedule();
    };
    const leave=()=>{tx=0;ty=0;if(!reduce.matches)schedule();else resetStage(el);};
    const reset=()=>{cancelAnimationFrame(raf);raf=0;x=y=tx=ty=0;resetStage(el);};
    el.addEventListener("pointermove",move,{passive:true});el.addEventListener("pointerleave",leave);
    stages.set(el,{reset,cleanup:()=>{reset();el.removeEventListener("pointermove",move);el.removeEventListener("pointerleave",leave);delete el.dataset.motionStage;}});
   });
   for(const el of reveals)if(!el.isConnected){observer?.unobserve(el);reveals.delete(el);}
   for(const [el,stage] of stages)if(!el.isConnected){stage.cleanup();stages.delete(el);}
  };
  const queueScan=()=>{if(!scanFrame)scanFrame=requestAnimationFrame(scan);};
  const onScroll=()=>{
   if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{
    scrollFrame=0;const y=window.scrollY,range=document.documentElement.scrollHeight-window.innerHeight;
    if(progress.current){progress.current.style.transform="scaleX("+Math.max(0,Math.min(1,range>0?y/range:0))+")";progress.current.style.opacity=range>10&&!reduce.matches?"1":"0";}
    document.documentElement.dataset.presentationDirection=y<lastScroll?"up":"down";lastScroll=y;
   });
  };
  const configure=()=>{
   observer?.disconnect();observer=null;
   for(const el of reveals){delete el.dataset.motionEnhanced;delete el.dataset.motionEnter;delete el.dataset.motionDirection;}reveals.clear();
   for(const stage of stages.values())stage.reset();
   if(!reduce.matches&&"IntersectionObserver" in window){
    observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
     const el=entry.target as HTMLElement;
     el.dataset.motionDirection=document.documentElement.dataset.presentationDirection||"down";
     el.dataset.motionEnter=entry.isIntersecting||el.contains(document.activeElement)?"visible":"waiting";
    }),{threshold:0,rootMargin:"-24px 0px -90px 0px"});
   }
   scan();onScroll();
  };
  const focus=(e:FocusEvent)=>{const target=e.target as HTMLElement;for(const el of reveals)if(el.contains(target))el.dataset.motionEnter="visible";};
  const visibility=()=>{document.documentElement.dataset.presentationHidden=document.hidden?"true":"false";if(document.hidden)for(const stage of stages.values())stage.reset();else onScroll();};
  const mutations=new MutationObserver(queueScan);mutations.observe(document.body,{childList:true,subtree:true});
  window.addEventListener("scroll",onScroll,{passive:true});window.addEventListener("resize",onScroll,{passive:true});
  reduce.addEventListener("change",configure);fine.addEventListener("change",configure);
  document.addEventListener("focusin",focus);document.addEventListener("visibilitychange",visibility);
  configure();visibility();
  return()=>{disposed=true;cancelAnimationFrame(scanFrame);cancelAnimationFrame(scrollFrame);observer?.disconnect();mutations.disconnect();
   window.removeEventListener("scroll",onScroll);window.removeEventListener("resize",onScroll);reduce.removeEventListener("change",configure);fine.removeEventListener("change",configure);
   document.removeEventListener("focusin",focus);document.removeEventListener("visibilitychange",visibility);
   for(const el of reveals){delete el.dataset.motionEnhanced;delete el.dataset.motionEnter;delete el.dataset.motionDirection;}
   for(const stage of stages.values())stage.cleanup();
   delete document.documentElement.dataset.presentationDirection;delete document.documentElement.dataset.presentationHidden;
  };
 },[revealSelector,stageSelector]);
 return <div className="presentation-progress" style={{"--presentation-accent":accent} as CSSProperties} aria-hidden="true"><div ref={progress}/></div>;
}
