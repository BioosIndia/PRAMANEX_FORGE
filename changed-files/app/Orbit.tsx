'use client';

import {useEffect, useRef, useState} from 'react';

// True signed-distance 3D rendering: translucent morphing shell and internal ribbons.
const VERTEX = `attribute vec2 position; void main(){gl_Position=vec4(position,0.,1.);}`;
const FRAGMENT = `
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform vec2 uPointer;
mat3 rotateY(float a){float c=cos(a),s=sin(a);return mat3(c,0.,s,0.,1.,0.,-s,0.,c);}
mat3 rotateX(float a){float c=cos(a),s=sin(a);return mat3(1.,0.,0.,0.,c,-s,0.,s,c);}
float phase(){return mod(uTime,20.);}
float split(){float t=phase();return smoothstep(2.,14.,t)*(1.-smoothstep(16.,20.,t));}
vec3 scenePoint(vec3 p){p*=vec3(1.+sin(uTime*.38)*.026,1.-sin(uTime*.38)*.018,1.+cos(uTime*.31)*.016);return rotateX(-.10+uPointer.y*.08)*rotateY(.13+sin(uTime*.12)*.16+uPointer.x*.12)*p;}
float smoothUnion(float a,float b,float k){float h=clamp(.5+.5*(b-a)/k,0.,1.);return mix(b,a,h)-k*h*(1.-h);}
float shell(vec3 p){
  float m=split(),offset=m*1.01,radius=mix(.91,.66,m);
  float a=length(p-vec3(offset,0.,0.))-radius;
  float b=length(p+vec3(offset,0.,0.))-radius;
  float d=smoothUnion(a,b,mix(.32,.035,m));
  // A thinning membrane between the two volumes, followed by a visible separation.
  float neck=smoothstep(5.,8.,phase())*(1.-smoothstep(12.,14.,phase()));
  vec3 q=p/vec3(max(.01,offset),mix(.21,.017,smoothstep(8.,13.,phase())),.10);
  float bridge=(length(q)-1.)*.08;
  return neck>.001?smoothUnion(d,bridge,.055*neck+.001):d;
}
float ribbon(vec3 p,float side,float color,float strand){
  float offset=split()*1.01;
  float center=side*offset+(color-.5)*.31;
  float twist=sin(p.y*5.+uTime*.12)*.022;
  float x=center+strand*p.y*.38+twist;
  float z=.06*cos(p.y*5.+color*2.)+strand*.025;
  return max(length(vec2(p.x-x,p.z-z))-.036,abs(p.y)-.43);
}
vec2 ribbonScene(vec3 p){
  float best=100.,id=0.;
  for(int side=0;side<2;side++)for(int c=0;c<2;c++){
    float d=min(ribbon(p,float(side)*2.-1.,float(c),-1.),ribbon(p,float(side)*2.-1.,float(c),1.));
    if(d<best){best=d;id=float(c);}
  }
  return vec2(best,id);
}
vec3 shellNormal(vec3 p){vec2 e=vec2(.003,0.);return normalize(vec3(shell(p+e.xyy)-shell(p-e.xyy),shell(p+e.yxy)-shell(p-e.yxy),shell(p+e.yyx)-shell(p-e.yyx)));}
vec3 ribbonNormal(vec3 p){vec2 e=vec2(.002,0.);return normalize(vec3(ribbonScene(p+e.xyy).x-ribbonScene(p-e.xyy).x,ribbonScene(p+e.yxy).x-ribbonScene(p-e.yxy).x,ribbonScene(p+e.yyx).x-ribbonScene(p-e.yyx).x));}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*uResolution)/uResolution.y;
  vec3 bg=vec3(.020,.045,.050);
  bg+=vec3(.018,.047,.10)*exp(-length(uv-vec2(.1,-.38))*2.8);
  bg+=vec3(.02,.055,.1)*exp(-pow(uv.y+.44,2.)*95.)*exp(-uv.x*uv.x*1.8);
  vec3 ro=vec3(uv*3.1,3.);
  ro.y-=sin(uTime*.21)*.027;
  vec3 rd=normalize(vec3(-uv*.07,-1.));
  float distance=0.;bool hit=false;vec3 p=vec3(0.);
  for(int i=0;i<52;i++){
    p=scenePoint(ro+rd*distance);float d=shell(p);
    if(d<.003){hit=true;break;}
    distance+=max(d*.82,.002);
    if(distance>5.5)break;
  }
  vec3 color=bg;
  if(hit){
    vec3 normal=shellNormal(p);vec3 view=scenePoint(-rd);vec3 light=normalize(vec3(-.7,1.,1.8));
    float fresnel=pow(1.-max(dot(normal,view),0.),2.5);
    float diffuse=max(dot(normal,light),0.);
    float spec=pow(max(dot(reflect(-light,normal),view),0.),38.);
    vec3 glass=vec3(.11,.12,.36)*(.55+diffuse*.42)+vec3(.38,.47,.96)*fresnel*.85;
    float walk=distance+.06;float glow=0.;vec3 inside=vec3(0.);bool tubeHit=false;
    for(int i=0;i<68;i++){
      vec3 q=scenePoint(ro+rd*walk);vec2 data=ribbonScene(q);
      if(shell(q)>.03)break;
      glow+=.00045/(.018+data.x*data.x);
      if(data.x<.003){
        vec3 n=ribbonNormal(q);float d=max(dot(n,light),0.);
        float s=pow(max(dot(reflect(-light,n),view),0.),20.);
        vec3 ink=data.y<.5?vec3(.95,.24,.29):vec3(.10,.57,.90);
        inside=ink*(.48+d*.64)+vec3(.7,.91,1.)*s*.65;
        tubeHit=true;break;
      }
      walk+=clamp(data.x*.65,.009,.075);
    }
    glass+=vec3(.018,.043,.085)*min(glow,.9);
    if(tubeHit)glass=mix(glass,inside,.76-fresnel*.28);
    glass+=vec3(.7,.85,1.)*spec*.6;
    glass+=vec3(.14,.45,.75)*pow(fresnel,2.)*.25;
    float filaments=pow(.5+.5*sin(p.y*45.+sin(p.x*7.)+sin(p.z*9.)),24.);
    glass+=vec3(.07,.17,.25)*filaments*fresnel*.22;
    color=mix(bg,glass,.8+fresnel*.2);
  }
  gl_FragColor=vec4(pow(max(color,vec3(0.)),vec3(.88)),hit?1.:0.);
}`;

export default function Orbit({compact=false}:{compact?:boolean}) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const rootRef=useRef<HTMLDivElement>(null);
  const [fallback,setFallback]=useState(true);
  const elapsedRef=useRef(2);
  const [epoch,setEpoch]=useState(0);

  useEffect(()=>{
    const canvas=canvasRef.current, root=rootRef.current;
    if(!canvas||!root)return;
    const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,powerPreference:'default'});
    if(!gl){setFallback(true);return;}
    const compile=(type:number,source:string)=>{
      const shader=gl.createShader(type);if(!shader)return null;
      gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){gl.deleteShader(shader);return null;}
      return shader;
    };
    const vertex=compile(gl.VERTEX_SHADER,VERTEX),fragment=compile(gl.FRAGMENT_SHADER,FRAGMENT);
    const program=gl.createProgram();
    if(!vertex||!fragment||!program){
      if(vertex)gl.deleteShader(vertex);if(fragment)gl.deleteShader(fragment);if(program)gl.deleteProgram(program);
      setFallback(true);return;
    }
    gl.attachShader(program,vertex);gl.attachShader(program,fragment);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)){gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);setFallback(true);return;}
    gl.useProgram(program);
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const resolution=gl.getUniformLocation(program,'uResolution'),time=gl.getUniformLocation(program,'uTime'),pointer=gl.getUniformLocation(program,'uPointer');
    const media=matchMedia('(prefers-reduced-motion: reduce)');
    let frame=0,last=0,elapsed=elapsedRef.current,onScreen=true,px=0,py=0,tx=0,ty=0,lost=false;
    const still=()=>media.matches||document.hidden||!onScreen;
    const resize=()=>{const rect=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,rect.width<540?1.25:1.5),pixelBudget=rect.width<540?240000:620000,scale=Math.min(dpr,1024/Math.max(rect.width,rect.height),Math.sqrt(pixelBudget/Math.max(1,rect.width*rect.height)));canvas.width=Math.max(1,Math.round(rect.width*scale));canvas.height=Math.max(1,Math.round(rect.height*scale));gl.viewport(0,0,canvas.width,canvas.height);gl.uniform2f(resolution,canvas.width,canvas.height);};
    const paint=(now:number)=>{
      if(lost)return;
      if(now-last<33&&!still()){frame=requestAnimationFrame(paint);return;}
      const delta=last?Math.min((now-last)/1000,.06):0;last=now;
      if(!still()){elapsed+=delta;elapsedRef.current=elapsed;px+=(tx-px)*.05;py+=(ty-py)*.05;}
      gl.uniform1f(time,elapsed);gl.uniform2f(pointer,px,py);gl.drawArrays(gl.TRIANGLES,0,6);
      if(!still())frame=requestAnimationFrame(paint);
    };
    const restart=()=>{cancelAnimationFrame(frame);last=0;paint(performance.now());};
    const move=(e:PointerEvent)=>{if(media.matches||e.pointerType!=='mouse'||!matchMedia('(hover: hover) and (pointer: fine)').matches)return;const rect=root.getBoundingClientRect();tx=(e.clientX-rect.left)/rect.width-.5;ty=(e.clientY-rect.top)/rect.height-.5;};
    const leave=()=>{tx=0;ty=0;};
    const mediaChange=()=>{restart();};
    const contextLost=(e:Event)=>{e.preventDefault();lost=true;cancelAnimationFrame(frame);setFallback(true);};
    const contextRestored=()=>setEpoch(value=>value+1);
    const observer=new ResizeObserver(()=>{resize();restart();});observer.observe(canvas);
    const intersection=new IntersectionObserver(entries=>{onScreen=entries[0].isIntersecting;restart();},{threshold:.05});intersection.observe(root);
    root.addEventListener('pointermove',move);root.addEventListener('pointerleave',leave);
    document.addEventListener('visibilitychange',restart);media.addEventListener('change',mediaChange);
    canvas.addEventListener('webglcontextlost',contextLost);canvas.addEventListener('webglcontextrestored',contextRestored);
    setFallback(false);
    resize();restart();
    return()=>{cancelAnimationFrame(frame);observer.disconnect();intersection.disconnect();root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',restart);media.removeEventListener('change',mediaChange);canvas.removeEventListener('webglcontextlost',contextLost);canvas.removeEventListener('webglcontextrestored',contextRestored);gl.deleteBuffer(buffer);gl.deleteProgram(program);gl.deleteShader(vertex);gl.deleteShader(fragment);};
  },[epoch]);

  return <div ref={rootRef} className={`orbit-wrap sculpture-wrap ${compact?'compact':''} ${fallback?'sculpture-static':''}`}>
    <canvas ref={canvasRef} aria-hidden="true"/>
    <div className="sculpture-fallback" aria-hidden="true"><i/><i/><i/></div>
    <div className="sculpture-meta"><span className="dot"/> SOURCE + CONTEXT. HUMAN AUTHORITY.</div>
    <div className="sculpture-legend" aria-label="Abstract source and context threads inside a transforming translucent shell"><span><i/>Source evidence</span><span><i/>Scientific context</span></div>
    <div className="sculpture-caption"><span className="capsule-cross">+</span> Dynamic evidence.<br/><strong>Human authority.</strong></div>
  </div>;
}
