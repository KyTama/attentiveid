/* =====================================================================
   SKY · WebGL: fog, a breathing light, rays, dawn, grain
   ===================================================================== */

export interface SkyController {
  lite(): void
  draw(time: number, light: number, pulse: number, cx: number, cy: number): void
  destroy(): void
}

const VERTEX_SHADER = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

const FRAGMENT_SHADER = `precision mediump float;
uniform vec2 uRes;uniform float uTime,uLight,uPulse;uniform vec2 uC;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;
  vec2 p=(uv-uC)*vec2(asp,1.);float d=length(p);float L=uLight;float t=uTime;
  vec3 night=vec3(.010,.014,.036),dusk=vec3(.085,.042,.040),dawn=vec3(1.,.94,.83),flame=vec3(.98,.72,.34);
  vec2 q=uv*vec2(asp,1.)*2.2;
  float warp=fbm(q+vec2(t*.012,-t*.008));
  float fog=fbm(q*1.3+warp*1.6+vec2(-t*.02,t*.01));
  vec3 base=mix(night,dusk,smoothstep(0.,.5,L));
  base+=fog*fog*mix(vec3(.05,.06,.13),vec3(.16,.09,.04),smoothstep(0.,.5,L))*.9;
  float breathe=1.+.06*sin(t*.9)+uPulse*.6;
  float r=(.16+L*.85)*breathe;
  float glow=exp(-d*d/(r*r*.32))*(.22+L*1.05);
  float core=exp(-d*d/(.0025+L*.012))*(.55+L*.9)*breathe;
  float a=atan(p.y,p.x);
  float rays=pow(fbm(vec2(a*2.6+fog*.6,t*.05)),2.6)*exp(-d*(2.8-L*1.2))*(.25+L)*1.3;
  vec3 col=base+flame*glow*.55+flame*core*.7+flame*rays*.45*(1.-fog*.4);
  float dm=smoothstep(.45,.62,L);
  vec3 lit=mix(dawn*.86,dawn,clamp(1.-d*.55,0.,1.))+flame*glow*.16+flame*rays*.12+(fog-.5)*.035;
  col=mix(col,lit,dm);
  float vig=smoothstep(.55,1.45,length((uv-.5)*vec2(asp,1.)));
  col*=1.-vig*(.6-.42*dm);
  col+=(h(gl_FragCoord.xy+fract(t*7.)*91.)-.5)*.04;
  gl_FragColor=vec4(col,1.);
}`

export function createSky(canvas: HTMLCanvasElement): SkyController {
  let gl: WebGLRenderingContext | null = null
  try {
    gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
  } catch {
    gl = null
  }
  if (!gl) {
    return {
      lite() {},
      draw() {},
      destroy() {},
    }
  }

  const compile = (type: number, src: string) => {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, src)
    gl.compileShader(shader)
    return shader
  }

  const vs = compile(gl.VERTEX_SHADER, VERTEX_SHADER)
  const fs = compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
  const program = gl.createProgram()
  if (!vs || !fs || !program) {
    return {
      lite() {},
      draw() {},
      destroy() {},
    }
  }

  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return {
      lite() {},
      draw() {},
      destroy() {},
    }
  }

  gl.useProgram(program)
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)

  const posLoc = gl.getAttribLocation(program, 'p')
  gl.enableVertexAttribArray(posLoc)
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

  const uniforms = {
    uRes: gl.getUniformLocation(program, 'uRes'),
    uTime: gl.getUniformLocation(program, 'uTime'),
    uLight: gl.getUniformLocation(program, 'uLight'),
    uPulse: gl.getUniformLocation(program, 'uPulse'),
    uC: gl.getUniformLocation(program, 'uC'),
  }

  let width = 0
  let height = 0
  let scale = Math.min(window.devicePixelRatio || 1, 1.5)

  function size() {
    width = Math.round(window.innerWidth * scale)
    height = Math.round(window.innerHeight * scale)
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
      gl?.viewport(0, 0, width, height)
    }
  }

  return {
    lite() {
      scale = 0.5
    },
    draw(time, light, pulse, cx, cy) {
      size()
      gl.uniform2f(uniforms.uRes, width, height)
      gl.uniform1f(uniforms.uTime, time)
      gl.uniform1f(uniforms.uLight, light)
      gl.uniform1f(uniforms.uPulse, pulse)
      gl.uniform2f(uniforms.uC, cx / (window.innerWidth || 1), 1 - cy / (window.innerHeight || 1))
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    destroy() {
      if (buffer) gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
    },
  }
}
