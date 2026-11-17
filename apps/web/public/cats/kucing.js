(()=>{var hh=0,_l=1,uh=2;var or=1,dh=2,ds=3,mn=0,Xe=1,gi=2,In=0,fs=1,yl=2,vl=3,Ml=4,fh=5;var Ln=100,ph=101,mh=102,gh=103,xh=104,_h=200,yh=201,vh=202,Mh=203,Sl=204,bl=205,Sh=206,bh=207,wh=208,Th=209,Eh=210,Ah=211,Rh=212,Ch=213,Ph=214,ea=0,ia=1,na=2,ts=3,sa=4,ra=5,aa=6,oa=7,Na=0,Ih=1,Lh=2,Di=0,wl=1,Tl=2,El=3,Al=4,Rl=5,lr=6,Cl=7,cl="attached",Dh="detached",Pl=300,Dn=301,ps=302,Ua=303,Fa=304,la=1e3,Ci=1001,ca=1002,He=1003,Nh=1004;var cr=1005;var ii=1006,Oa=1007;var Yi=1008;var oi=1009,Il=1010,Ll=1011,ms=1012,Ba=1013,Ei=1014,di=1015,Ai=1016,ka=1017,za=1018,Nn=1020,Dl=35902,Nl=35899,Ul=1021,Fl=1022,xi=1023,Wi=1026,Zi=1027,Ha=1028,Ga=1029,gn=1030,Va=1031;var Wa=1033,hr=33776,ur=33777,dr=33778,fr=33779,Xa=35840,qa=35841,Ya=35842,Za=35843,$a=36196,Ka=37492,Ja=37496,Qa=37488,ja=37489,pr=37490,to=37491,eo=37808,io=37809,no=37810,so=37811,ro=37812,ao=37813,oo=37814,lo=37815,co=37816,ho=37817,uo=37818,fo=37819,po=37820,mo=37821,go=36492,xo=36494,_o=36495,yo=36283,vo=36284,mr=36285,Mo=36286;var Bs=2300,ha=2301,jr=2302,hl=2303,ul=2400,dl=2401,fl=2402;var Uh=3200;var gr=0,Fh=1,$i="",We="srgb",ks="srgb-linear",zs="linear",de="srgb";var ta=7680;var Oh=519,Bh=512,kh=513,zh=514,Ol=515,Hh=516,Gh=517,Bl=518,kl=519,Vh=35044;var zl="300 es",pi=2e3,es=2001;function sd(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function rd(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Hs(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Wh(){let s=Hs("canvas");return s.style.display="block",s}var Rc={},is=null;function Hl(...s){let t="THREE."+s.shift();is?is("log",t,...s):console.log(t,...s)}function Xh(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Lt(...s){s=Xh(s);let t="THREE."+s.shift();if(is)is("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function kt(...s){s=Xh(s);let t="THREE."+s.shift();if(is)is("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function wn(...s){let t=s.join(" ");t in Rc||(Rc[t]=!0,Lt(...s))}function qh(s,t,e){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var Yh={[ea]:ea,[na]:aa,[sa]:sa,[ts]:ra,[ia]:ia,[aa]:na,[oa]:oa,[ra]:ts},Pi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let r=n.indexOf(e);r!==-1&&n.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let r=0,a=n.length;r<a;r++)n[r].call(this,t);t.target=null}}},Ke=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Uo=Math.PI/180,ua=180/Math.PI;function gs(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ke[s&255]+Ke[s>>8&255]+Ke[s>>16&255]+Ke[s>>24&255]+"-"+Ke[t&255]+Ke[t>>8&255]+"-"+Ke[t>>16&15|64]+Ke[t>>24&255]+"-"+Ke[e&63|128]+Ke[e>>8&255]+"-"+Ke[e>>16&255]+Ke[e>>24&255]+Ke[i&255]+Ke[i>>8&255]+Ke[i>>16&255]+Ke[i>>24&255]).toLowerCase()}function Jt(s,t,e){return Math.max(t,Math.min(e,s))}function ad(s,t){return(s%t+t)%t}function Fo(s,t,e){return(1-e)*s+e*t}function Zh(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Gl(s){switch(s.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function od(s,t){if(t.constructor===Float32Array)return s;let e=Gl(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(s/e,-1)}function ld(s,t){if(t.constructor===Float32Array)return s;let e=Gl(t);if(e===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(s*e)}var Xt=class{static{this.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Jt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*n+t.x,this.y=r*n+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ie=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,r,a,o){let c=i[n+0],l=i[n+1],h=i[n+2],u=i[n+3],d=r[a+0],f=r[a+1],g=r[a+2],_=r[a+3];if(u!==_||c!==d||l!==f||h!==g){let m=c*d+l*f+h*g+u*_;m<0&&(d=-d,f=-f,g=-g,_=-_,m=-m);let p=1-o;if(m<.9995){let y=Math.acos(m),b=Math.sin(y);p=Math.sin(p*y)/b,o=Math.sin(o*y)/b,c=c*p+d*o,l=l*p+f*o,h=h*p+g*o,u=u*p+_*o}else{c=c*p+d*o,l=l*p+f*o,h=h*p+g*o,u=u*p+_*o;let y=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=y,l*=y,h*=y,u*=y}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,n,r,a){let o=i[n],c=i[n+1],l=i[n+2],h=i[n+3],u=r[a],d=r[a+1],f=r[a+2],g=r[a+3];return t[e]=o*g+h*u+c*f-l*d,t[e+1]=c*g+h*d+l*u-o*f,t[e+2]=l*g+h*f+o*d-c*u,t[e+3]=h*g-o*u-c*d-l*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,r=t._z,a=t._order,o=Math.cos,c=Math.sin,l=o(i/2),h=o(n/2),u=o(r/2),d=c(i/2),f=c(n/2),g=c(r/2);switch(a){case"XYZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"YZX":this._x=d*h*u+l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u-d*f*g;break;case"XZY":this._x=d*h*u-l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u+d*f*g;break;default:Lt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],r=e[8],a=e[1],o=e[5],c=e[9],l=e[2],h=e[6],u=e[10],d=i+o+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(a-n)*f}else if(i>o&&i>u){let f=2*Math.sqrt(1+i-o-u);this._w=(h-c)/f,this._x=.25*f,this._y=(n+a)/f,this._z=(r+l)/f}else if(o>u){let f=2*Math.sqrt(1+o-i-u);this._w=(r-l)/f,this._x=(n+a)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+u-i-o);this._w=(a-n)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Jt(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,r=t._z,a=t._w,o=e._x,c=e._y,l=e._z,h=e._w;return this._x=i*h+a*o+n*l-r*c,this._y=n*h+a*c+r*o-i*l,this._z=r*h+a*l+i*c-n*o,this._w=a*h-i*o-n*c-r*l,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(i=-i,n=-n,r=-r,a=-a,o=-o);let c=1-e;if(o<.9995){let l=Math.acos(o),h=Math.sin(l);c=Math.sin(c*l)/h,e=Math.sin(e*l)/h,this._x=this._x*c+i*e,this._y=this._y*c+n*e,this._z=this._z*c+r*e,this._w=this._w*c+a*e,this._onChangeCallback()}else this._x=this._x*c+i*e,this._y=this._y*c+n*e,this._z=this._z*c+r*e,this._w=this._w*c+a*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},U=class{static{this.prototype.isVector3=!0}constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Cc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Cc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*n,this.y=r[1]*e+r[4]*i+r[7]*n,this.z=r[2]*e+r[5]*i+r[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*n+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*n+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*n+r[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,r=t.x,a=t.y,o=t.z,c=t.w,l=2*(a*n-o*i),h=2*(o*e-r*n),u=2*(r*i-a*e);return this.x=e+c*l+a*u-o*h,this.y=i+c*h+o*l-r*u,this.z=n+c*u+r*h-a*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n,this.y=r[1]*e+r[5]*i+r[9]*n,this.z=r[2]*e+r[6]*i+r[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this.z=Jt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this.z=Jt(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,r=t.z,a=e.x,o=e.y,c=e.z;return this.x=n*c-r*o,this.y=r*a-i*c,this.z=i*o-n*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Oo.copy(this).projectOnVector(t),this.sub(Oo)}reflect(t){return this.sub(Oo.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Jt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Oo=new U,Cc=new Ie,zt=class{static{this.prototype.isMatrix3=!0}constructor(t,e,i,n,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,a,o,c,l)}set(t,e,i,n,r,a,o,c,l){let h=this.elements;return h[0]=t,h[1]=n,h[2]=o,h[3]=e,h[4]=r,h[5]=c,h[6]=i,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],h=i[4],u=i[7],d=i[2],f=i[5],g=i[8],_=n[0],m=n[3],p=n[6],y=n[1],b=n[4],v=n[7],T=n[2],E=n[5],x=n[8];return r[0]=a*_+o*y+c*T,r[3]=a*m+o*b+c*E,r[6]=a*p+o*v+c*x,r[1]=l*_+h*y+u*T,r[4]=l*m+h*b+u*E,r[7]=l*p+h*v+u*x,r[2]=d*_+f*y+g*T,r[5]=d*m+f*b+g*E,r[8]=d*p+f*v+g*x,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8];return e*a*h-e*o*l-i*r*h+i*o*c+n*r*l-n*a*c}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8],u=h*a-o*l,d=o*c-h*r,f=l*r-a*c,g=e*u+i*d+n*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=u*_,t[1]=(n*l-h*i)*_,t[2]=(o*i-n*a)*_,t[3]=d*_,t[4]=(h*e-n*c)*_,t[5]=(n*r-o*e)*_,t[6]=f*_,t[7]=(i*c-l*e)*_,t[8]=(a*e-i*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*a+l*o)+a+t,-n*l,n*c,-n*(-l*a+c*o)+o+e,0,0,1),this}scale(t,e){return wn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Bo.makeScale(t,e)),this}rotate(t){return wn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Bo.makeRotation(-t)),this}translate(t,e){return wn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Bo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Bo=new zt,Pc=new zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ic=new zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function cd(){let s={enabled:!0,workingColorSpace:ks,spaces:{},convert:function(n,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===de&&(n.r=Vi(n.r),n.g=Vi(n.g),n.b=Vi(n.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===de&&(n.r=jn(n.r),n.g=jn(n.g),n.b=jn(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===$i?zs:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,a){return n.copy(this.spaces[a].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[ks]:{primaries:t,whitePoint:i,transfer:zs,toXYZ:Pc,fromXYZ:Ic,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:We},outputColorSpaceConfig:{drawingBufferColorSpace:We}},[We]:{primaries:t,whitePoint:i,transfer:de,toXYZ:Pc,fromXYZ:Ic,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:We}}}),s}var ee=cd();function Vi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function jn(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var kn,da=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{kn===void 0&&(kn=Hs("canvas")),kn.width=t.width,kn.height=t.height;let n=kn.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=kn}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Hs("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),r=n.data;for(let a=0;a<r.length;a++)r[a]=Vi(r[a]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Vi(e[i]/255)*255):e[i]=Vi(e[i]);return{data:e,width:t.width,height:t.height}}else return Lt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},hd=0,ns=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:hd++}),this.uuid=gs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width||0,e.height||0,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let a=0,o=n.length;a<o;a++)n[a].isDataTexture?r.push(ko(n[a].image)):r.push(ko(n[a]))}else r=ko(n);i.url=r}return e||(t.images[this.uuid]=i),i}};function ko(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?da.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Lt("Texture: Unable to serialize Texture."),{})}var ud=0,zo=new U,ni=class s extends Pi{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,i=Ci,n=Ci,r=ii,a=Yi,o=xi,c=oi,l=s.DEFAULT_ANISOTROPY,h=$i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ud++}),this.uuid=gs(),this.name="",this.source=new ns(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Xt(0,0),this.repeat=new Xt(1,1),this.center=new Xt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new zt,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(zo).x}get height(){return this.source.getSize(zo).y}get depth(){return this.source.getSize(zo).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.mipmapsAutoUpdate=t.mipmapsAutoUpdate,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isPMREMTexture=t.isPMREMTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Lt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Lt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Pl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case la:t.x=t.x-Math.floor(t.x);break;case Ci:t.x=t.x<0?0:1;break;case ca:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case la:t.y=t.y-Math.floor(t.y);break;case Ci:t.y=t.y<0?0:1;break;case ca:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};ni.DEFAULT_IMAGE=null;ni.DEFAULT_MAPPING=Pl;ni.DEFAULT_ANISOTROPY=1;var pe=class{static{this.prototype.isVector4=!0}constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*n+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*n+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*n+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*n+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,r,c=t.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],g=c[9],_=c[2],m=c[6],p=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let b=(l+1)/2,v=(f+1)/2,T=(p+1)/2,E=(h+d)/4,x=(u+_)/4,S=(g+m)/4;return b>v&&b>T?b<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(b),n=E/i,r=x/i):v>T?v<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(v),i=E/n,r=S/n):T<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(T),i=x/r,n=S/r),this.set(i,n,r,e),this}let y=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-_)/y,this.z=(d-h)/y,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Jt(this.x,t.x,e.x),this.y=Jt(this.y,t.y,e.y),this.z=Jt(this.z,t.z,e.z),this.w=Jt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Jt(this.x,t,e),this.y=Jt(this.y,t,e),this.z=Jt(this.z,t,e),this.w=Jt(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},fa=class extends Pi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ii,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new pe(0,0,t,e),this.scissorTest=!1,this.viewport=new pe(0,0,t,e),this.textures=[];let n=i.count;for(let r=0;r<n;r++)this.textures[r]=new ni({width:t,height:e,depth:i.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:ii,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.mipmapsAutoUpdate!==void 0&&(e.mipmapsAutoUpdate=t.mipmapsAutoUpdate),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new ns(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;else this.depthTexture=null;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Qe=class extends fa{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Gs=class extends ni{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=He,this.minFilter=He,this.wrapR=Ci,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var pa=class extends ni{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=He,this.minFilter=He,this.wrapR=Ci,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Zt=class s{static{this.prototype.isMatrix4=!0}constructor(t,e,i,n,r,a,o,c,l,h,u,d,f,g,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,a,o,c,l,h,u,d,f,g,_,m)}set(t,e,i,n,r,a,o,c,l,h,u,d,f,g,_,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=n,p[1]=r,p[5]=a,p[9]=o,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new s().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/zn.setFromMatrixColumn(t,0).length(),r=1/zn.setFromMatrixColumn(t,1).length(),a=1/zn.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,r=t.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(n),l=Math.sin(n),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=a*h,f=a*u,g=o*h,_=o*u;e[0]=c*h,e[4]=-c*u,e[8]=l,e[1]=f+g*l,e[5]=d-_*l,e[9]=-o*c,e[2]=_-d*l,e[6]=g+f*l,e[10]=a*c}else if(t.order==="YXZ"){let d=c*h,f=c*u,g=l*h,_=l*u;e[0]=d+_*o,e[4]=g*o-f,e[8]=a*l,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=f*o-g,e[6]=_+d*o,e[10]=a*c}else if(t.order==="ZXY"){let d=c*h,f=c*u,g=l*h,_=l*u;e[0]=d-_*o,e[4]=-a*u,e[8]=g+f*o,e[1]=f+g*o,e[5]=a*h,e[9]=_-d*o,e[2]=-a*l,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){let d=a*h,f=a*u,g=o*h,_=o*u;e[0]=c*h,e[4]=g*l-f,e[8]=d*l+_,e[1]=c*u,e[5]=_*l+d,e[9]=f*l-g,e[2]=-l,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){let d=a*c,f=a*l,g=o*c,_=o*l;e[0]=c*h,e[4]=_-d*u,e[8]=g*u+f,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-l*h,e[6]=f*u+g,e[10]=d-_*u}else if(t.order==="XZY"){let d=a*c,f=a*l,g=o*c,_=o*l;e[0]=c*h,e[4]=-u,e[8]=l*h,e[1]=d*u+_,e[5]=a*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=o*h,e[10]=_*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(dd,t,fd)}lookAt(t,e,i){let n=this.elements;return li.subVectors(t,e),li.lengthSq()===0&&(li.z=1),li.normalize(),tn.crossVectors(i,li),tn.lengthSq()===0&&(Math.abs(i.z)===1?li.x+=1e-4:li.z+=1e-4,li.normalize(),tn.crossVectors(i,li)),tn.normalize(),Cr.crossVectors(li,tn),n[0]=tn.x,n[4]=Cr.x,n[8]=li.x,n[1]=tn.y,n[5]=Cr.y,n[9]=li.y,n[2]=tn.z,n[6]=Cr.z,n[10]=li.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],h=i[1],u=i[5],d=i[9],f=i[13],g=i[2],_=i[6],m=i[10],p=i[14],y=i[3],b=i[7],v=i[11],T=i[15],E=n[0],x=n[4],S=n[8],C=n[12],R=n[1],D=n[5],I=n[9],F=n[13],P=n[2],B=n[6],z=n[10],k=n[14],J=n[3],H=n[7],Z=n[11],tt=n[15];return r[0]=a*E+o*R+c*P+l*J,r[4]=a*x+o*D+c*B+l*H,r[8]=a*S+o*I+c*z+l*Z,r[12]=a*C+o*F+c*k+l*tt,r[1]=h*E+u*R+d*P+f*J,r[5]=h*x+u*D+d*B+f*H,r[9]=h*S+u*I+d*z+f*Z,r[13]=h*C+u*F+d*k+f*tt,r[2]=g*E+_*R+m*P+p*J,r[6]=g*x+_*D+m*B+p*H,r[10]=g*S+_*I+m*z+p*Z,r[14]=g*C+_*F+m*k+p*tt,r[3]=y*E+b*R+v*P+T*J,r[7]=y*x+b*D+v*B+T*H,r[11]=y*S+b*I+v*z+T*Z,r[15]=y*C+b*F+v*k+T*tt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[12],a=t[1],o=t[5],c=t[9],l=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],_=t[7],m=t[11],p=t[15],y=c*f-l*d,b=o*f-l*u,v=o*d-c*u,T=a*f-l*h,E=a*d-c*h,x=a*u-o*h;return e*(_*y-m*b+p*v)-i*(g*y-m*T+p*E)+n*(g*b-_*T+p*x)-r*(g*v-_*E+m*x)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[1],a=t[5],o=t[9],c=t[2],l=t[6],h=t[10];return e*(a*h-o*l)-i*(r*h-o*c)+n*(r*l-a*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],_=t[13],m=t[14],p=t[15],y=e*o-i*a,b=e*c-n*a,v=e*l-r*a,T=i*c-n*o,E=i*l-r*o,x=n*l-r*c,S=h*_-u*g,C=h*m-d*g,R=h*p-f*g,D=u*m-d*_,I=u*p-f*_,F=d*p-f*m,P=y*F-b*I+v*D+T*R-E*C+x*S;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let B=1/P;return t[0]=(o*F-c*I+l*D)*B,t[1]=(n*I-i*F-r*D)*B,t[2]=(_*x-m*E+p*T)*B,t[3]=(d*E-u*x-f*T)*B,t[4]=(c*R-a*F-l*C)*B,t[5]=(e*F-n*R+r*C)*B,t[6]=(m*v-g*x-p*b)*B,t[7]=(h*x-d*v+f*b)*B,t[8]=(a*I-o*R+l*S)*B,t[9]=(i*R-e*I-r*S)*B,t[10]=(g*E-_*v+p*y)*B,t[11]=(u*v-h*E-f*y)*B,t[12]=(o*C-a*D-c*S)*B,t[13]=(e*D-i*C+n*S)*B,t[14]=(_*b-g*T-m*y)*B,t[15]=(h*T-u*b+d*y)*B,this}scale(t){let e=this.elements,i=t.x,n=t.y,r=t.z;return e[0]*=i,e[4]*=n,e[8]*=r,e[1]*=i,e[5]*=n,e[9]*=r,e[2]*=i,e[6]*=n,e[10]*=r,e[3]*=i,e[7]*=n,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),r=1-i,a=t.x,o=t.y,c=t.z,l=r*a,h=r*o;return this.set(l*a+i,l*o-n*c,l*c+n*o,0,l*o+n*c,h*o+i,h*c-n*a,0,l*c-n*o,h*c+n*a,r*c*c+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,r,a){return this.set(1,i,r,0,t,1,a,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,r=e._x,a=e._y,o=e._z,c=e._w,l=r+r,h=a+a,u=o+o,d=r*l,f=r*h,g=r*u,_=a*h,m=a*u,p=o*u,y=c*l,b=c*h,v=c*u,T=i.x,E=i.y,x=i.z;return n[0]=(1-(_+p))*T,n[1]=(f+v)*T,n[2]=(g-b)*T,n[3]=0,n[4]=(f-v)*E,n[5]=(1-(d+p))*E,n[6]=(m+y)*E,n[7]=0,n[8]=(g+b)*x,n[9]=(m-y)*x,n[10]=(1-(d+_))*x,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let a=zn.set(n[0],n[1],n[2]).length(),o=zn.set(n[4],n[5],n[6]).length(),c=zn.set(n[8],n[9],n[10]).length();r<0&&(a=-a),vi.copy(this);let l=1/a,h=1/o,u=1/c;return vi.elements[0]*=l,vi.elements[1]*=l,vi.elements[2]*=l,vi.elements[4]*=h,vi.elements[5]*=h,vi.elements[6]*=h,vi.elements[8]*=u,vi.elements[9]*=u,vi.elements[10]*=u,e.setFromRotationMatrix(vi),i.x=a,i.y=o,i.z=c,this}makePerspective(t,e,i,n,r,a,o=pi,c=!1){let l=this.elements,h=2*r/(e-t),u=2*r/(i-n),d=(e+t)/(e-t),f=(i+n)/(i-n),g,_;if(c)g=r/(a-r),_=a*r/(a-r);else if(o===pi)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===es)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,n,r,a,o=pi,c=!1){let l=this.elements,h=2/(e-t),u=2/(i-n),d=-(e+t)/(e-t),f=-(i+n)/(i-n),g,_;if(c)g=1/(a-r),_=a/(a-r);else if(o===pi)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===es)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=u,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},zn=new U,vi=new Zt,dd=new U(0,0,0),fd=new U(1,1,1),tn=new U,Cr=new U,li=new U,Lc=new Zt,Dc=new Ie,Ii=class s{constructor(t=0,e=0,i=0,n=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,r=n[0],a=n[4],o=n[8],c=n[1],l=n[5],h=n[9],u=n[2],d=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(Jt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Jt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Jt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Jt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(Jt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Lt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Lc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Lc,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Dc.setFromEuler(this),this.setFromQuaternion(Dc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ii.DEFAULT_ORDER="XYZ";var Vs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},pd=0,Nc=new U,Hn=new Ie,Bi=new Zt,Pr=new U,Ps=new U,md=new U,gd=new Ie,Uc=new U(1,0,0),Fc=new U(0,1,0),Oc=new U(0,0,1),Bc={type:"added"},xd={type:"removed"},Gn={type:"childadded",child:null},Ho={type:"childremoved",child:null},we=class s extends Pi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:pd++}),this.uuid=gs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new U,e=new Ii,i=new Ie,n=new U(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Zt},normalMatrix:{value:new zt}}),this.matrix=new Zt,this.matrixWorld=new Zt,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Vs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Hn.setFromAxisAngle(t,e),this.quaternion.multiply(Hn),this}rotateOnWorldAxis(t,e){return Hn.setFromAxisAngle(t,e),this.quaternion.premultiply(Hn),this}rotateX(t){return this.rotateOnAxis(Uc,t)}rotateY(t){return this.rotateOnAxis(Fc,t)}rotateZ(t){return this.rotateOnAxis(Oc,t)}translateOnAxis(t,e){return Nc.copy(t).applyQuaternion(this.quaternion),this.position.add(Nc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Uc,t)}translateY(t){return this.translateOnAxis(Fc,t)}translateZ(t){return this.translateOnAxis(Oc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Bi.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Pr.copy(t):Pr.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),Ps.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Bi.lookAt(Ps,Pr,this.up):Bi.lookAt(Pr,Ps,this.up),this.quaternion.setFromRotationMatrix(Bi),n&&(Bi.extractRotation(n.matrixWorld),Hn.setFromRotationMatrix(Bi),this.quaternion.premultiply(Hn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(kt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Bc),Gn.child=t,this.dispatchEvent(Gn),Gn.child=null):kt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(xd),Ho.child=t,this.dispatchEvent(Ho),Ho.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Bi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Bi.multiply(t.parent.matrixWorld)),t.applyMatrix4(Bi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Bc),Gn.child=t,this.dispatchEvent(Gn),Gn.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ps,t,md),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ps,gd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*n,r[13]+=i-r[1]*e-r[5]*i-r[9]*n,r[14]+=n-r[2]*e-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(o=>({...o})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];r(t.shapes,u)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(t.materials,this.material[c]));n.material=o}else n.material=r(t.materials,this.material);if(this.children.length>0){n.children=[];for(let o=0;o<this.children.length;o++)n.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];n.animations.push(r(t.animations,c))}}if(e){let o=a(t.geometries),c=a(t.materials),l=a(t.textures),h=a(t.images),u=a(t.shapes),d=a(t.skeletons),f=a(t.animations),g=a(t.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=n,i;function a(o){let c=[];for(let l in o){let h=o[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};we.DEFAULT_UP=new U(0,1,0);we.DEFAULT_MATRIX_AUTO_UPDATE=!0;we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var mi=class extends we{constructor(){super(),this.isGroup=!0,this.type="Group"}},_d={type:"move"},ss=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new mi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new mi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new U,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new U),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new mi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new U,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new U,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){a=!0;for(let _ of t.hand.values()){let m=e.getJointPose(_,i),p=this._getHandJoint(l,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.quaternion,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;l.inputState.pinching&&d>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&d<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.quaternion,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(o.matrix.fromArray(n.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.matrixWorldNeedsUpdate=!0,n.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(n.linearVelocity)):o.hasLinearVelocity=!1,n.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(n.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(_d)))}return o!==null&&(o.visible=n!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new mi;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},$h={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},en={h:0,s:0,l:0},Ir={h:0,s:0,l:0};function Go(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var vt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=We){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ee.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=ee.workingColorSpace){return this.r=t,this.g=e,this.b=i,ee.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=ee.workingColorSpace){if(t=ad(t,1),e=Jt(e,0,1),i=Jt(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=Go(a,r,t+1/3),this.g=Go(a,r,t),this.b=Go(a,r,t-1/3)}return ee.colorSpaceToWorking(this,n),this}setStyle(t,e=We){function i(r){r!==void 0&&parseFloat(r)<1&&Lt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=n[1],o=n[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,e);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Lt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=n[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Lt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=We){let i=$h[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Lt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Vi(t.r),this.g=Vi(t.g),this.b=Vi(t.b),this}copyLinearToSRGB(t){return this.r=jn(t.r),this.g=jn(t.g),this.b=jn(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=We){return ee.workingToColorSpace(Je.copy(this),t),Math.round(Jt(Je.r*255,0,255))*65536+Math.round(Jt(Je.g*255,0,255))*256+Math.round(Jt(Je.b*255,0,255))}getHexString(t=We){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ee.workingColorSpace){ee.workingToColorSpace(Je.copy(this),e);let i=Je.r,n=Je.g,r=Je.b,a=Math.max(i,n,r),o=Math.min(i,n,r),c,l,h=(o+a)/2;if(o===a)c=0,l=0;else{let u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case i:c=(n-r)/u+(n<r?6:0);break;case n:c=(r-i)/u+2;break;case r:c=(i-n)/u+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=ee.workingColorSpace){return ee.workingToColorSpace(Je.copy(this),e),t.r=Je.r,t.g=Je.g,t.b=Je.b,t}getStyle(t=We){ee.workingToColorSpace(Je.copy(this),t);let e=Je.r,i=Je.g,n=Je.b;return t!==We?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(en),this.setHSL(en.h+t,en.s+e,en.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(en),t.getHSL(Ir);let i=Fo(en.h,Ir.h,e),n=Fo(en.s,Ir.s,e),r=Fo(en.l,Ir.l,e);return this.setHSL(i,n,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*n,this.g=r[1]*e+r[4]*i+r[7]*n,this.b=r[2]*e+r[5]*i+r[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Je=new vt;vt.NAMES=$h;var Xi=class extends we{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ii,this.environmentIntensity=1,this.environmentRotation=new Ii,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),this.background=t.background!==null?t.background.clone():null,this.environment=t.environment!==null?t.environment.clone():null,this.fog=t.fog!==null?t.fog.clone():null,this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),this.overrideMaterial=t.overrideMaterial!==null?t.overrideMaterial.clone():null,this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Mi=new U,ki=new U,Vo=new U,zi=new U,Vn=new U,Wn=new U,kc=new U,Wo=new U,Xo=new U,qo=new U,Yo=new pe,Zo=new pe,$o=new pe,an=class s{constructor(t=new U,e=new U,i=new U){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),Mi.subVectors(t,e),n.cross(Mi);let r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(t,e,i,n,r){Mi.subVectors(n,e),ki.subVectors(i,e),Vo.subVectors(t,e);let a=Mi.dot(Mi),o=Mi.dot(ki),c=Mi.dot(Vo),l=ki.dot(ki),h=ki.dot(Vo),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(l*c-o*h)*d,g=(a*h-o*c)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,zi)===null?!1:zi.x>=0&&zi.y>=0&&zi.x+zi.y<=1}static getInterpolation(t,e,i,n,r,a,o,c){return this.getBarycoord(t,e,i,n,zi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,zi.x),c.addScaledVector(a,zi.y),c.addScaledVector(o,zi.z),c)}static getInterpolatedAttribute(t,e,i,n,r,a){return Yo.setScalar(0),Zo.setScalar(0),$o.setScalar(0),Yo.fromBufferAttribute(t,e),Zo.fromBufferAttribute(t,i),$o.fromBufferAttribute(t,n),a.setScalar(0),a.addScaledVector(Yo,r.x),a.addScaledVector(Zo,r.y),a.addScaledVector($o,r.z),a}static isFrontFacing(t,e,i,n){return Mi.subVectors(i,e),ki.subVectors(t,e),Mi.cross(ki).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Mi.subVectors(this.c,this.b),ki.subVectors(this.a,this.b),Mi.cross(ki).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,r){return s.getInterpolation(t,this.a,this.b,this.c,e,i,n,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,r=this.c,a,o;Vn.subVectors(n,i),Wn.subVectors(r,i),Wo.subVectors(t,i);let c=Vn.dot(Wo),l=Wn.dot(Wo);if(c<=0&&l<=0)return e.copy(i);Xo.subVectors(t,n);let h=Vn.dot(Xo),u=Wn.dot(Xo);if(h>=0&&u<=h)return e.copy(n);let d=c*u-h*l;if(d<=0&&c>=0&&h<=0&&c-h>0)return a=c/(c-h),e.copy(i).addScaledVector(Vn,a);qo.subVectors(t,r);let f=Vn.dot(qo),g=Wn.dot(qo);if(g>=0&&f<=g)return e.copy(r);let _=f*l-c*g;if(_<=0&&l>=0&&g<=0)return o=l/(l-g),e.copy(i).addScaledVector(Wn,o);let m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return kc.subVectors(r,n),o=(u-h)/(u-h+(f-g)),e.copy(n).addScaledVector(kc,o);let p=1/(m+_+d);return a=_*p,o=d*p,e.copy(i).addScaledVector(Vn,a).addScaledVector(Wn,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},wi=class{constructor(t=new U(1/0,1/0,1/0),e=new U(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Si.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Si.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Si.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0&&t.isBatchedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Si):Si.fromBufferAttribute(r,a),Si.applyMatrix4(t.matrixWorld),this.expandByPoint(Si);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Lr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Lr.copy(i.boundingBox)),Lr.applyMatrix4(t.matrixWorld),this.union(Lr)}let n=t.children;for(let r=0,a=n.length;r<a;r++)this.expandByObject(n[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Si),Si.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Is),Dr.subVectors(this.max,Is),Xn.subVectors(t.a,Is),qn.subVectors(t.b,Is),Yn.subVectors(t.c,Is),nn.subVectors(qn,Xn),sn.subVectors(Yn,qn),vn.subVectors(Xn,Yn);let e=[0,-nn.z,nn.y,0,-sn.z,sn.y,0,-vn.z,vn.y,nn.z,0,-nn.x,sn.z,0,-sn.x,vn.z,0,-vn.x,-nn.y,nn.x,0,-sn.y,sn.x,0,-vn.y,vn.x,0];return!Ko(e,Xn,qn,Yn,Dr)||(e=[1,0,0,0,1,0,0,0,1],!Ko(e,Xn,qn,Yn,Dr))?!1:(Nr.crossVectors(nn,sn),e=[Nr.x,Nr.y,Nr.z],Ko(e,Xn,qn,Yn,Dr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Si).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Si).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Hi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Hi=[new U,new U,new U,new U,new U,new U,new U,new U],Si=new U,Lr=new wi,Xn=new U,qn=new U,Yn=new U,nn=new U,sn=new U,vn=new U,Is=new U,Dr=new U,Nr=new U,Mn=new U;function Ko(s,t,e,i,n){for(let r=0,a=s.length-3;r<=a;r+=3){Mn.fromArray(s,r);let o=n.x*Math.abs(Mn.x)+n.y*Math.abs(Mn.y)+n.z*Math.abs(Mn.z),c=t.dot(Mn),l=e.dot(Mn),h=i.dot(Mn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}var Pe=new U,Ur=new Xt,yd=0,ri=class extends Pi{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:yd++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Vh,this.updateRanges=[],this.gpuType=di,this.version=0,this._normalizationScale=t!==void 0?Gl(t):void 0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this._normalizationScale=t._normalizationScale,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Ur.fromBufferAttribute(this,e),Ur.applyMatrix3(t),this.setXY(e,Ur.x,Ur.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Pe.fromBufferAttribute(this,e),Pe.applyMatrix3(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Pe.fromBufferAttribute(this,e),Pe.applyMatrix4(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Pe.fromBufferAttribute(this,e),Pe.applyNormalMatrix(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Pe.fromBufferAttribute(this,e),Pe.transformDirection(t),this.setXYZ(e,Pe.x,Pe.y,Pe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=this._denormalize(i)),i}setComponent(t,e,i){return this.normalized&&(i=this._normalize(i)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=this._denormalize(e)),e}setX(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=this._denormalize(e)),e}setY(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=this._denormalize(e)),e}setZ(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=this._denormalize(e)),e}setW(t,e){return this.normalized&&(e=this._normalize(e)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i),n=this._normalize(n)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=this._normalize(e),i=this._normalize(i),n=this._normalize(n),r=this._normalize(r)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(t){let e=this._normalizationScale;return e!==void 0?Math.max(t/e,-1):od(t,this.array)}_normalize(t){let e=this._normalizationScale;return e!==void 0?Math.round(t*e):ld(t,this.array)}};var Tn=class extends ri{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Ws=class extends ri{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var ue=class extends ri{constructor(t,e,i){super(new Float32Array(t),e,i)}},vd=new wi,Ls=new U,Jo=new U,Ti=class{constructor(t=new U,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):vd.setFromPoints(t).getCenter(i);let n=0;for(let r=0,a=t.length;r<a;r++)n=Math.max(n,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ls.subVectors(t,this.center);let e=Ls.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(Ls,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Jo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ls.copy(t.center).add(Jo)),this.expandByPoint(Ls.copy(t.center).sub(Jo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Md=0,fi=new Zt,Qo=new we,Zn=new U,ci=new wi,Ds=new wi,ze=new U,je=class s extends Pi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Md++}),this.uuid=gs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(sd(t)?Ws:Tn)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new zt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return fi.makeRotationFromQuaternion(t),this.applyMatrix4(fi),this}rotateX(t){return fi.makeRotationX(t),this.applyMatrix4(fi),this}rotateY(t){return fi.makeRotationY(t),this.applyMatrix4(fi),this}rotateZ(t){return fi.makeRotationZ(t),this.applyMatrix4(fi),this}translate(t,e,i){return fi.makeTranslation(t,e,i),this.applyMatrix4(fi),this}scale(t,e,i){return fi.makeScale(t,e,i),this.applyMatrix4(fi),this}lookAt(t){return Qo.lookAt(t),Qo.updateMatrix(),this.applyMatrix4(Qo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Zn).negate(),this.translate(Zn.x,Zn.y,Zn.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,r=t.length;n<r;n++){let a=t[n];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ue(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&Lt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new wi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){kt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new U(-1/0,-1/0,-1/0),new U(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let r=e[i];ci.setFromBufferAttribute(r),this.morphTargetsRelative?(ze.addVectors(this.boundingBox.min,ci.min),this.boundingBox.expandByPoint(ze),ze.addVectors(this.boundingBox.max,ci.max),this.boundingBox.expandByPoint(ze)):(this.boundingBox.expandByPoint(ci.min),this.boundingBox.expandByPoint(ci.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&kt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ti);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){kt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new U,1/0);return}if(t){let i=this.boundingSphere.center;if(ci.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];Ds.setFromBufferAttribute(o),this.morphTargetsRelative?(ze.addVectors(ci.min,Ds.min),ci.expandByPoint(ze),ze.addVectors(ci.max,Ds.max),ci.expandByPoint(ze)):(ci.expandByPoint(Ds.min),ci.expandByPoint(Ds.max))}ci.getCenter(i);let n=0;for(let r=0,a=t.count;r<a;r++)ze.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(ze));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)ze.fromBufferAttribute(o,l),c&&(Zn.fromBufferAttribute(t,l),ze.add(Zn)),n=Math.max(n,i.distanceToSquared(ze))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&kt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){kt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new ri(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],c=[],l=new Uint8Array(i.count);for(let C=0;C<i.count;C++)o[C]=new U,c[C]=new U;let h=new U,u=new U,d=new U,f=new Xt,g=new Xt,_=new Xt,m=new U,p=new U;function y(C,R,D){l[C]=l[R]=l[D]=1,h.fromBufferAttribute(i,C),u.fromBufferAttribute(i,R),d.fromBufferAttribute(i,D),f.fromBufferAttribute(r,C),g.fromBufferAttribute(r,R),_.fromBufferAttribute(r,D),u.sub(h),d.sub(h),g.sub(f),_.sub(f);let I=1/(g.x*_.y-_.x*g.y);isFinite(I)&&(m.copy(u).multiplyScalar(_.y).addScaledVector(d,-g.y).multiplyScalar(I),p.copy(d).multiplyScalar(g.x).addScaledVector(u,-_.x).multiplyScalar(I),o[C].add(m),o[R].add(m),o[D].add(m),c[C].add(p),c[R].add(p),c[D].add(p))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let C=0,R=b.length;C<R;++C){let D=b[C],I=D.start,F=D.count;for(let P=I,B=I+F;P<B;P+=3)y(t.getX(P+0),t.getX(P+1),t.getX(P+2))}let v=new U,T=new U,E=new U,x=new U;function S(C){E.fromBufferAttribute(n,C),x.copy(E);let R=o[C];v.copy(R),v.sub(E.multiplyScalar(E.dot(R))).normalize(),T.crossVectors(x,R);let I=T.dot(c[C])<0?-1:1;a.setXYZW(C,v.x,v.y,v.z,I)}for(let C=0,R=i.count;C<R;++C)l[C]&&S(C);this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new ri(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let n=new U,r=new U,a=new U,o=new U,c=new U,l=new U,h=new U,u=new U;if(t)for(let d=0,f=t.count;d<f;d+=3){let g=t.getX(d+0),_=t.getX(d+1),m=t.getX(d+2);n.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(n,r),h.cross(u),o.fromBufferAttribute(i,g),c.fromBufferAttribute(i,_),l.fromBufferAttribute(i,m),o.add(h),c.add(h),l.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(_,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=e.count;d<f;d+=3)n.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),a.fromBufferAttribute(e,d+2),h.subVectors(a,r),u.subVectors(n,r),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)ze.fromBufferAttribute(t,e),ze.normalize(),t.setXYZ(e,ze.x,ze.y,ze.z)}toNonIndexed(){function t(o,c){let l=o.array,h=o.itemSize,u=o.normalized,d=new l.constructor(c.length*h),f=0,g=0;for(let _=0,m=c.length;_<m;_++){o.isInterleavedBufferAttribute?f=c[_]*o.data.stride+o.offset:f=c[_]*h;for(let p=0;p<h;p++)d[g++]=l[f++]}return new ri(d,h,u)}if(this.index===null)return Lt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,i=this.index.array,n=this.attributes;for(let o in n){let c=n[o],l=t(c,i);e.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){let d=l[h],f=t(d,i);c.push(f)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let c in i){let l=i[c];t.data.attributes[c]=l.toJSON(t.data)}let n={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){let f=l[u];h.push(f.toJSON(t.data))}h.length>0&&(n[c]=h,r=!0)}r&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let l in n){let h=n[l];this.setAttribute(l,h.clone(e))}let r=t.morphAttributes;for(let l in r){let h=[],u=r[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let l=0,h=a.length;l<h;l++){let u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var jo=new U,Sd=new U,bd=new zt,bi=class{constructor(t=new U(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=jo.subVectors(i,e).cross(Sd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(jo),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(n,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||bd.getNormalMatrix(t),n=this.coplanarPoint(jo).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},wd=0,Li=class extends Pi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:wd++}),this.uuid=gs(),this.name="",this.type="Material",this.blending=fs,this.side=mn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Sl,this.blendDst=bl,this.blendEquation=Ln,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new vt(0,0,0),this.blendAlpha=0,this.depthFunc=ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Oh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ta,this.stencilZFail=ta,this.stencilZPass=ta,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Lt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Lt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(i.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(i.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(t).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(i.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(i.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(e){let r=n(t.textures),a=n(t.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new vt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.diffuseRoughness!==void 0&&(this.diffuseRoughness=t.diffuseRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum),t.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=t.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=t.iridescenceThicknessRange[1]),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new bi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Xt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Xt().fromArray(t.clearcoatNormalScale)),t.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=e[t.diffuseRoughnessMap]||null),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Gi=new U,tl=new U,Fr=new U,Or=new U,rs=class{constructor(t=new U,e=new U(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Gi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Gi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Gi.copy(this.origin).addScaledVector(this.direction,e),Gi.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){tl.copy(t).add(e).multiplyScalar(.5),Fr.copy(e).sub(t).normalize(),Or.copy(this.origin).sub(tl);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Fr),o=Or.dot(this.direction),c=-Or.dot(Fr),l=Or.lengthSq(),h=Math.abs(1-a*a),u,d,f,g;if(h>0)if(u=a*c-o,d=a*o-c,g=r*h,u>=0)if(d>=-g)if(d<=g){let _=1/h;u*=_,d*=_,f=u*(u+a*d+2*o)+d*(a*u+d+2*c)+l}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;else d<=-g?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l):d<=g?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,u),n&&n.copy(tl).addScaledVector(Fr,d),f}intersectSphere(t,e){if(t.radius<0)return null;Gi.subVectors(t.center,this.origin);let i=Gi.dot(this.direction),n=Gi.dot(Gi)-i*i,r=t.radius*t.radius;if(n>r)return null;let a=Math.sqrt(r-n),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,r,a,o,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(i=(t.min.x-d.x)*l,n=(t.max.x-d.x)*l):(i=(t.max.x-d.x)*l,n=(t.min.x-d.x)*l),h>=0?(r=(t.min.y-d.y)*h,a=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,a=(t.min.y-d.y)*h),i>a||r>n||((r>i||isNaN(i))&&(i=r),(a<n||isNaN(n))&&(n=a),u>=0?(o=(t.min.z-d.z)*u,c=(t.max.z-d.z)*u):(o=(t.max.z-d.z)*u,c=(t.min.z-d.z)*u),i>c||o>n)||((o>i||i!==i)&&(i=o),(c<n||n!==n)&&(n=c),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,Gi)!==null}intersectTriangle(t,e,i,n,r){let a=this.origin,o=this.direction,c=o.x,l=o.y,h=o.z,u=t.x-a.x,d=t.y-a.y,f=t.z-a.z,g=e.x-a.x,_=e.y-a.y,m=e.z-a.z,p=i.x-a.x,y=i.y-a.y,b=i.z-a.z,v=Math.abs(c),T=Math.abs(l),E=Math.abs(h),x,S,C,R,D,I,F,P,B,z,k,J;if(v>=T&&v>=E?(C=c,I=u,B=g,J=p,c>=0?(x=l,S=h,R=d,D=f,F=_,P=m,z=y,k=b):(x=h,S=l,R=f,D=d,F=m,P=_,z=b,k=y)):T>=E?(C=l,I=d,B=_,J=y,l>=0?(x=h,S=c,R=f,D=u,F=m,P=g,z=b,k=p):(x=c,S=h,R=u,D=f,F=g,P=m,z=p,k=b)):(C=h,I=f,B=m,J=b,h>=0?(x=c,S=l,R=u,D=d,F=g,P=_,z=p,k=y):(x=l,S=c,R=d,D=u,F=_,P=g,z=y,k=p)),C===0)return null;let H=x/C,Z=S/C,tt=1/C,St=R-H*I,Ft=D-Z*I,$=F-H*B,pt=P-Z*B,yt=z-H*J,It=k-Z*J,mt=yt*pt-It*$,Ht=St*It-Ft*yt,Ee=$*Ft-pt*St;if(n){if(mt<0||Ht<0||Ee<0)return null}else if((mt<0||Ht<0||Ee<0)&&(mt>0||Ht>0||Ee>0))return null;let ct=mt+Ht+Ee;if(ct===0)return null;let at=tt*(mt*I+Ht*B+Ee*J);return(ct>0?at<0:at>0)?null:this.at(at/ct,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},En=class extends Li{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.combine=Na,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},zc=new Zt,Sn=new rs,Br=new Ti,Hc=new U,kr=new U,zr=new U,Hr=new U,el=new U,Gr=new U,Gc=new U,Vr=new U,ce=class extends we{constructor(t=new je,e=new En){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let o=this.morphTargetInfluences;if(r&&o){Gr.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=o[c],u=r[c];h!==0&&(el.fromBufferAttribute(u,t),a?Gr.addScaledVector(el,h):Gr.addScaledVector(el.sub(e),h))}e.add(Gr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Br.copy(i.boundingSphere),Br.applyMatrix4(r),Sn.copy(t.ray).recast(t.near),!(Br.containsPoint(Sn.origin)===!1&&(Sn.intersectSphere(Br,Hc)===null||Sn.origin.distanceToSquared(Hc)>(t.far-t.near)**2))&&(zc.copy(r).invert(),Sn.copy(t.ray).applyMatrix4(zc),!(i.boundingBox!==null&&Sn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Sn)))}_computeIntersections(t,e,i){let n,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=a[m.materialIndex],y=Math.max(m.start,f.start),b=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,T=b;v<T;v+=3){let E=o.getX(v),x=o.getX(v+1),S=o.getX(v+2);n=Wr(this,p,t,i,l,h,u,E,x,S),n&&(n.faceIndex=Math.floor(v/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),_=Math.min(o.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let y=o.getX(m),b=o.getX(m+1),v=o.getX(m+2);n=Wr(this,a,t,i,l,h,u,y,b,v),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=a[m.materialIndex],y=Math.max(m.start,f.start),b=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,T=b;v<T;v+=3){let E=v,x=v+1,S=v+2;n=Wr(this,p,t,i,l,h,u,E,x,S),n&&(n.faceIndex=Math.floor(v/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),_=Math.min(c.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let y=m,b=m+1,v=m+2;n=Wr(this,a,t,i,l,h,u,y,b,v),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}}};function Td(s,t,e,i,n,r,a,o){let c;if(t.side===Xe?c=i.intersectTriangle(a,r,n,!0,o):c=i.intersectTriangle(n,r,a,t.side===mn,o),c===null)return null;Vr.copy(o),Vr.applyMatrix4(s.matrixWorld);let l=e.ray.origin.distanceTo(Vr);return l<e.near||l>e.far?null:{distance:l,point:Vr.clone(),object:s}}function Wr(s,t,e,i,n,r,a,o,c,l){s.getVertexPosition(o,kr),s.getVertexPosition(c,zr),s.getVertexPosition(l,Hr);let h=Td(s,t,e,i,kr,zr,Hr,Gc);if(h){let u=new U;an.getBarycoord(Gc,kr,zr,Hr,u),n&&(h.uv=an.getInterpolatedAttribute(n,o,c,l,u,new Xt)),r&&(h.uv1=an.getInterpolatedAttribute(r,o,c,l,u,new Xt)),a&&(h.normal=an.getInterpolatedAttribute(a,o,c,l,u,new U),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:c,c:l,normal:new U,materialIndex:0};an.getNormal(kr,zr,Hr,d.normal),h.face=d,h.barycoord=u}return h}var Ns=new pe,Vc=new pe,Wc=new pe,Ed=new pe,Xc=new Zt,Xr=new U,il=new Ti,qc=new Zt,nl=new rs,as=class extends ce{constructor(t,e){super(t,e),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=cl,this.bindMatrix=new Zt,this.bindMatrixInverse=new Zt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let t=this.geometry;this.boundingBox===null&&(this.boundingBox=new wi),this.boundingBox.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,Xr),this.boundingBox.expandByPoint(Xr)}computeBoundingSphere(){let t=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Ti),this.boundingSphere.makeEmpty();let e=t.getAttribute("position");for(let i=0;i<e.count;i++)this.getVertexPosition(i,Xr),this.boundingSphere.expandByPoint(Xr)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}raycast(t,e){let i=this.material,n=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),il.copy(this.boundingSphere),il.applyMatrix4(n),t.ray.intersectsSphere(il)!==!1&&(qc.copy(n).invert(),nl.copy(t.ray).applyMatrix4(qc),!(this.boundingBox!==null&&nl.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(t,e,nl)))}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){this.skeleton=t,e===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld),this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let t=new pe,e=this.geometry.attributes.skinWeight;for(let i=0,n=e.count;i<n;i++){t.fromBufferAttribute(e,i);let r=1/t.manhattanLength();r!==1/0?t.multiplyScalar(r):t.set(1,0,0,0),e.setXYZW(i,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){super.updateMatrixWorld(t),this.bindMode===cl?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Dh?this.bindMatrixInverse.copy(this.bindMatrix).invert():Lt("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){let i=this.skeleton,n=this.geometry;Vc.fromBufferAttribute(n.attributes.skinIndex,t),Wc.fromBufferAttribute(n.attributes.skinWeight,t),e.isVector4?(Ns.copy(e),e.set(0,0,0,0)):(Ns.set(e.x,e.y,e.z,1),e.set(0,0,0)),Ns.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let a=Wc.getComponent(r);if(a!==0){let o=Vc.getComponent(r);Xc.multiplyMatrices(i.bones[o].matrixWorld,i.boneInverses[o]),e.addScaledVector(Ed.copy(Ns).applyMatrix4(Xc),a)}}return e.isVector4&&(e.w=Ns.w),e.applyMatrix4(this.bindMatrixInverse)}},os=class extends we{constructor(){super(),this.isBone=!0,this.type="Bone"}},ls=class extends ni{constructor(t=null,e=1,i=1,n,r,a,o,c,l=He,h=He,u,d){super(null,a,o,c,l,h,n,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Yc=new Zt,Ad=new Zt,Xs=class s{constructor(t=[],e=[]){this.uuid=gs(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){let t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){Lt("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,n=this.bones.length;i<n;i++)this.boneInverses.push(new Zt)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){let i=new Zt;this.bones[t]&&i.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];i&&i.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){let i=this.bones[t];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){let t=this.bones,e=this.boneInverses,i=this.boneMatrices,n=this.boneTexture;for(let r=0,a=t.length;r<a;r++){let o=t[r]?t[r].matrixWorld:Ad;Yc.multiplyMatrices(o,e[r]),Yc.toArray(i,r*16)}n!==null&&(n.needsUpdate=!0)}clone(){return new s(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);let e=new Float32Array(t*t*4);e.set(this.boneMatrices);let i=new ls(e,t,t,xi,di);return i.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=i,this}getBoneByName(t){for(let e=0,i=this.bones.length;e<i;e++){let n=this.bones[e];if(n.name===t)return n}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(t,e){this.uuid=t.uuid;for(let i=0,n=t.bones.length;i<n;i++){let r=t.bones[i],a=e[r];a===void 0&&(Lt("Skeleton: No bone found with UUID:",r),a=new os),this.bones.push(a),this.boneInverses.push(new Zt().fromArray(t.boneInverses[i]))}return this.init(),this}toJSON(){let t={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;let e=this.bones,i=this.boneInverses;for(let n=0,r=e.length;n<r;n++){let a=e[n];t.bones.push(a.uuid);let o=i[n];t.boneInverses.push(o.toArray())}return t}},An=class extends ri{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},$n=new Zt,Zc=new Zt,qr=[],$c=new wi,Rd=new Zt,Us=new ce,Fs=new Ti,qs=class extends ce{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new An(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,Rd)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new wi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,$n),$c.copy(t.boundingBox).applyMatrix4($n),this.boundingBox.union($c)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ti),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,$n),Fs.copy(t.boundingSphere).applyMatrix4($n),this.boundingSphere.union(Fs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),this.morphTexture=t.morphTexture!==null?t.morphTexture.clone():null,this.instanceColor=t.instanceColor!==null?t.instanceColor.clone():null,this.count=t.count,this.boundingBox=t.boundingBox!==null?t.boundingBox.clone():null,this.boundingSphere=t.boundingSphere!==null?t.boundingSphere.clone():null,this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let o=0;o<i.length;o++)i[o]=n[a+o]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(Us.geometry=this.geometry,Us.material=this.material,Us.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Fs.copy(this.boundingSphere),Fs.applyMatrix4(i),t.ray.intersectsSphere(Fs)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,$n),Zc.multiplyMatrices(i,$n),Us.matrixWorld=Zc,Us.raycast(t,qr);for(let a=0,o=qr.length;a<o;a++){let c=qr[a];c.instanceId=r,c.object=this,e.push(c)}qr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new An(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new ls(new Float32Array(n*this.count),n,this.count,Ha,di));let r=this.morphTexture.source.data.data,a=0;for(let l=0;l<i.length;l++)a+=i[l];let o=this.geometry.morphTargetsRelative?1:1-a,c=n*t;return r[c]=o,r.set(i,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},bn=new Ti,Cd=new Xt(.5,.5),Yr=new U,on=class{constructor(t=new bi,e=new bi,i=new bi,n=new bi,r=new bi,a=new bi){this.planes=[t,e,i,n,r,a]}set(t,e,i,n,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(n),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=pi,i=!1){let n=this.planes,r=t.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],_=r[9],m=r[10],p=r[11],y=r[12],b=r[13],v=r[14],T=r[15];if(n[0].setComponents(l-a,f-h,p-g,T-y).normalize(),n[1].setComponents(l+a,f+h,p+g,T+y).normalize(),n[2].setComponents(l+o,f+u,p+_,T+b).normalize(),n[3].setComponents(l-o,f-u,p-_,T-b).normalize(),i)n[4].setComponents(c,d,m,v).normalize(),n[5].setComponents(l-c,f-d,p-m,T-v).normalize();else if(n[4].setComponents(l-c,f-d,p-m,T-v).normalize(),e===pi)n[5].setComponents(l+c,f+d,p+m,T+v).normalize();else if(e===es)n[5].setComponents(c,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),bn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),bn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(bn)}intersectsSprite(t){bn.center.set(0,0,0);let e=Cd.distanceTo(t.center);return bn.radius=.7071067811865476+e,bn.applyMatrix4(t.matrixWorld),this.intersectsSphere(bn)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(Yr.x=n.normal.x>0?t.max.x:t.min.x,Yr.y=n.normal.y>0?t.max.y:t.min.y,Yr.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Yr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}},Kc=new Zt,ma=class s{constructor(){this.coordinateSystem=pi,this._frustums=[],this._count=0}setFromArrayCamera(t){let e=t.cameras,i=this._frustums;for(let n=0;n<e.length;n++){let r=e[n];Kc.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),i[n]===void 0&&(i[n]=new on),i[n].setFromProjectionMatrix(Kc,r.coordinateSystem,r.reversedDepth)}return this._count=e.length,this}getFrustum(t){return this._frustums[t]}intersectsObject(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsObject(t))return!0;return!1}intersectsSprite(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSprite(t))return!0;return!1}intersectsSphere(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsSphere(t))return!0;return!1}intersectsBox(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].intersectsBox(t))return!0;return!1}containsPoint(t){let e=this._frustums;for(let i=0;i<this._count;i++)if(e[i].containsPoint(t))return!0;return!1}copy(t){this.coordinateSystem=t.coordinateSystem;let e=this._frustums,i=t._frustums;for(let n=0;n<t._count;n++)e[n]===void 0&&(e[n]=new on),e[n].copy(i[n]);return this._count=t._count,this}clone(){return new s().copy(this)}};var cs=class extends Li{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new vt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},ga=new U,xa=new U,Jc=new Zt,Os=new rs,Zr=new Ti,sl=new U,Qc=new U,_a=class extends we{constructor(t=new je,e=new cs){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0?this.morphTargetInfluences=t.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,t.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let n=1,r=e.count;n<r;n++)ga.fromBufferAttribute(e,n-1),xa.fromBufferAttribute(e,n),i[n]=i[n-1],i[n]+=ga.distanceTo(xa);t.setAttribute("lineDistance",new ue(i,1))}else Lt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Zr.copy(i.boundingSphere),Zr.applyMatrix4(n),Zr.radius+=r,t.ray.intersectsSphere(Zr)===!1)return;Jc.copy(n).invert(),Os.copy(t.ray).applyMatrix4(Jc);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let f=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let _=f,m=g-1;_<m;_+=l){let p=h.getX(_),y=h.getX(_+1),b=$r(this,t,Os,c,p,y,_);b&&e.push(b)}if(this.isLineLoop){let _=h.getX(g-1),m=h.getX(f),p=$r(this,t,Os,c,_,m,g-1);p&&e.push(p)}}else{let f=Math.max(0,a.start),g=Math.min(d.count,a.start+a.count);for(let _=f,m=g-1;_<m;_+=l){let p=$r(this,t,Os,c,_,_+1,_);p&&e.push(p)}if(this.isLineLoop){let _=$r(this,t,Os,c,g-1,f,g-1);_&&e.push(_)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=n.length;r<a;r++){let o=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function $r(s,t,e,i,n,r,a){let o=s.geometry.attributes.position;if(ga.fromBufferAttribute(o,n),xa.fromBufferAttribute(o,r),e.distanceSqToSegment(ga,xa,sl,Qc)>i)return;sl.applyMatrix4(s.matrixWorld);let l=t.ray.origin.distanceTo(sl);if(!(l<t.near||l>t.far))return{distance:l,point:Qc.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}var jc=new U,th=new U,Ys=class extends _a{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let n=0,r=e.count;n<r;n+=2)jc.fromBufferAttribute(e,n),th.fromBufferAttribute(e,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+jc.distanceTo(th);t.setAttribute("lineDistance",new ue(i,1))}else Lt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Zs=class extends ni{constructor(t=[],e=Dn,i,n,r,a,o,c,l,h){super(t,e,i,n,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Rn=class extends ni{constructor(t,e,i,n,r,a,o,c,l){super(t,e,i,n,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var qi=class extends ni{constructor(t,e,i=Ei,n,r,a,o=He,c=He,l,h=Wi,u=1){if(h!==Wi&&h!==Zi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,n,r,a,o,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new ns(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},$s=class extends qi{constructor(t,e=Ei,i=Dn,n,r,a=He,o=He,c,l=Wi){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,i,n,r,a,o,c,l),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Ks=class extends ni{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},ln=class s extends je{constructor(t=1,e=1,i=1,n=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:r,depthSegments:a};let o=this;n=Math.floor(n),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,i,e,t,a,r,0),g("z","y","x",1,-1,i,e,-t,a,r,1),g("x","z","y",1,1,t,i,e,n,a,2),g("x","z","y",1,-1,t,i,-e,n,a,3),g("x","y","z",1,-1,t,e,i,n,r,4),g("x","y","z",-1,-1,t,e,-i,n,r,5),this.setIndex(c),this.setAttribute("position",new ue(l,3)),this.setAttribute("normal",new ue(h,3)),this.setAttribute("uv",new ue(u,2));function g(_,m,p,y,b,v,T,E,x,S,C){let R=v/x,D=T/S,I=v/2,F=T/2,P=E/2,B=x+1,z=S+1,k=0,J=0,H=new U;for(let Z=0;Z<z;Z++){let tt=Z*D-F;for(let St=0;St<B;St++){let Ft=St*R-I;H[_]=Ft*y,H[m]=tt*b,H[p]=P,l.push(H.x,H.y,H.z),H[_]=0,H[m]=0,H[p]=E>0?1:-1,h.push(H.x,H.y,H.z),u.push(St/x),u.push(1-Z/S),k+=1}}for(let Z=0;Z<S;Z++)for(let tt=0;tt<x;tt++){let St=d+tt+B*Z,Ft=d+tt+B*(Z+1),$=d+(tt+1)+B*(Z+1),pt=d+(tt+1)+B*Z;c.push(St,Ft,pt),c.push(Ft,$,pt),J+=6}o.addGroup(f,J,C),f+=J,d+=k}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Js=class s extends je{constructor(t=1,e=1,i=1,n=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;n=Math.floor(n),r=Math.floor(r);let h=[],u=[],d=[],f=[],g=0,_=[],m=i/2,p=0;y(),a===!1&&(t>0&&b(!0),e>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new ue(u,3)),this.setAttribute("normal",new ue(d,3)),this.setAttribute("uv",new ue(f,2));function y(){let v=new U,T=new U,E=0,x=(e-t)/i;for(let S=0;S<=r;S++){let C=[],R=S/r,D=R*(e-t)+t;for(let I=0;I<=n;I++){let F=I/n,P=F*c+o,B=Math.sin(P),z=Math.cos(P);T.x=D*B,T.y=-R*i+m,T.z=D*z,u.push(T.x,T.y,T.z),v.set(B,x,z).normalize(),d.push(v.x,v.y,v.z),f.push(F,1-R),C.push(g++)}_.push(C)}for(let S=0;S<n;S++)for(let C=0;C<r;C++){let R=_[C][S],D=_[C+1][S],I=_[C+1][S+1],F=_[C][S+1];(t>0||C!==0)&&(h.push(R,D,F),E+=3),(e>0||C!==r-1)&&(h.push(D,I,F),E+=3)}l.addGroup(p,E,0),p+=E}function b(v){let T=g,E=new Xt,x=new U,S=0,C=v===!0?t:e,R=v===!0?1:-1;for(let I=1;I<=n;I++)u.push(0,m*R,0),d.push(0,R,0),f.push(.5,.5),g++;let D=g;for(let I=0;I<=n;I++){let P=I/n*c+o,B=Math.cos(P),z=Math.sin(P);x.x=C*z,x.y=m*R,x.z=C*B,u.push(x.x,x.y,x.z),d.push(0,R,0),E.x=B*.5+.5,E.y=z*.5*R+.5,f.push(E.x,E.y),g++}for(let I=0;I<n;I++){let F=T+I,P=D+I;v===!0?h.push(P,P+1,F):h.push(P+1,P,F),S+=3}l.addGroup(p,S,v===!0?1:2),p+=S}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var ya=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Lt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,n=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)i=this.getPoint(a/t),r+=i.distanceTo(n),e.push(r),n=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),n=0,r=i.length,a;e?a=e:a=t*i[r-1];let o=0,c=r-1,l;for(;o<=c;)if(n=Math.floor(o+(c-o)/2),l=i[n]-a,l<0)o=n+1;else if(l>0)c=n-1;else{c=n;break}if(n=c,i[n]===a)return n/(r-1);let h=i[n],d=i[n+1]-h,f=(a-h)/d;return(n+f)/(r-1)}getTangent(t,e){let n=t-1e-4,r=t+1e-4;n<0&&(n=0),r>1&&(r=1);let a=this.getPoint(n),o=this.getPoint(r),c=e||(a.isVector2?new Xt:new U);return c.copy(o).sub(a).normalize(),c}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new U,n=[],r=[],a=[],o=new U,c=new Zt;for(let f=0;f<=t;f++){let g=f/t;n[f]=this.getTangentAt(g,new U)}r[0]=new U,a[0]=new U;let l=Number.MAX_VALUE,h=Math.abs(n[0].x),u=Math.abs(n[0].y),d=Math.abs(n[0].z);h<=l&&(l=h,i.set(1,0,0)),u<=l&&(l=u,i.set(0,1,0)),d<=l&&i.set(0,0,1),o.crossVectors(n[0],i).normalize(),r[0].crossVectors(n[0],o),a[0].crossVectors(n[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(n[f-1],n[f]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Jt(n[f-1].dot(n[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(o,g))}a[f].crossVectors(n[f],r[f])}if(e===!0){let f=Math.acos(Jt(r[0].dot(r[t]),-1,1));f/=t,n[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(c.makeRotationAxis(n[g],f*g)),a[g].crossVectors(n[g],r[g])}return{tangents:n,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this.cacheArcLengths=null,this}};function Vl(){let s=0,t=0,e=0,i=0;function n(r,a,o,c){s=r,t=o,e=-3*r+3*a-2*o-c,i=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,l){n(a,o,l*(o-r),l*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,l,h,u){let d=(a-r)/l-(o-r)/(l+h)+(o-a)/h,f=(o-a)/h-(c-a)/(h+u)+(c-o)/u;d*=h,f*=h,n(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return s+t*r+e*a+i*o}}}var eh=new U,ih=new U,rl=new Vl,al=new Vl,ol=new Vl,Qs=class extends ya{constructor(t=[],e=!1,i="centripetal",n=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=n}getPoint(t,e=new U){let i=e,n=this.points,r=n.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let l,h;this.closed||o>0?l=n[(o-1)%r]:(ih.subVectors(n[0],n[1]).add(n[0]),l=ih);let u=n[o%r],d=n[(o+1)%r];if(this.closed||o+2<r?h=n[(o+2)%r]:(eh.subVectors(n[r-1],n[r-2]).add(n[r-1]),h=eh),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(l.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),rl.initNonuniformCatmullRom(l.x,u.x,d.x,h.x,g,_,m),al.initNonuniformCatmullRom(l.y,u.y,d.y,h.y,g,_,m),ol.initNonuniformCatmullRom(l.z,u.z,d.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&(rl.initCatmullRom(l.x,u.x,d.x,h.x,this.tension),al.initCatmullRom(l.y,u.y,d.y,h.y,this.tension),ol.initCatmullRom(l.z,u.z,d.z,h.z,this.tension));return i.set(rl.calc(c),al.calc(c),ol.calc(c)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(n.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let n=this.points[e];t.points.push(n.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let n=t.points[e];this.points.push(new U().fromArray(n))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};var cn=class s extends je{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let r=t/2,a=e/2,o=Math.floor(i),c=Math.floor(n),l=o+1,h=c+1,u=t/o,d=e/c,f=[],g=[],_=[],m=[];for(let p=0;p<h;p++){let y=p*d-a;for(let b=0;b<l;b++){let v=b*u-r;g.push(v,-y,0),_.push(0,0,1),m.push(b/o),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let y=0;y<o;y++){let b=y+l*p,v=y+l*(p+1),T=y+1+l*(p+1),E=y+1+l*p;f.push(b,v,E),f.push(v,T,E)}this.setIndex(f),this.setAttribute("position",new ue(g,3)),this.setAttribute("normal",new ue(_,3)),this.setAttribute("uv",new ue(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}};var hn=class s extends je{constructor(t=1,e=32,i=16,n=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let c=Math.min(a+o,Math.PI),l=0,h=[],u=new U,d=new U,f=[],g=[],_=[],m=[];for(let p=0;p<=i;p++){let y=[],b=p/i,v=a+b*o,T=t*Math.cos(v),E=Math.sqrt(t*t-T*T),x=0;p===0&&a===0?x=.5/e:p===i&&c===Math.PI&&(x=-.5/e);for(let S=0;S<=e;S++){let C=S/e,R=n+C*r;u.x=-E*Math.cos(R),u.y=T,u.z=E*Math.sin(R),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),m.push(C+x,1-b),y.push(l++)}h.push(y)}for(let p=0;p<i;p++)for(let y=0;y<e;y++){let b=h[p][y+1],v=h[p][y],T=h[p+1][y],E=h[p+1][y+1];(p!==0||a>0)&&f.push(b,v,E),(p!==i-1||c<Math.PI)&&f.push(v,T,E)}this.setIndex(f),this.setAttribute("position",new ue(g,3)),this.setAttribute("normal",new ue(_,3)),this.setAttribute("uv",new ue(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var js=class s extends je{constructor(t=1,e=.4,i=12,n=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),n=Math.floor(n);let c=[],l=[],h=[],u=[],d=new U,f=new U,g=new U;for(let _=0;_<=i;_++){let m=a+_/i*o;for(let p=0;p<=n;p++){let y=p/n*r;f.x=(t+e*Math.cos(m))*Math.cos(y),f.y=(t+e*Math.cos(m))*Math.sin(y),f.z=e*Math.sin(m),l.push(f.x,f.y,f.z),d.x=t*Math.cos(y),d.y=t*Math.sin(y),g.subVectors(f,d).normalize(),h.push(g.x,g.y,g.z),u.push(p/n),u.push(_/i)}}for(let _=1;_<=i;_++)for(let m=1;m<=n;m++){let p=(n+1)*_+m-1,y=(n+1)*(_-1)+m-1,b=(n+1)*(_-1)+m,v=(n+1)*_+m;c.push(p,y,v),c.push(y,b,v)}this.setIndex(c),this.setAttribute("position",new ue(l,3)),this.setAttribute("normal",new ue(h,3)),this.setAttribute("uv",new ue(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Un(s){let t={};for(let e in s){t[e]={};for(let i in s[e]){let n=s[e][i];if(nh(n))n.isRenderTargetTexture?(Lt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(nh(n[0])){let r=[];for(let a=0,o=n.length;a<o;a++)r[a]=n[a].clone();t[e][i]=r}else t[e][i]=n.slice();else t[e][i]=n}}return t}function ti(s){let t={};for(let e=0;e<s.length;e++){let i=Un(s[e]);for(let n in i)t[n]=i[n]}return t}function nh(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Pd(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Wl(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ee.workingColorSpace}var Kh={clone:Un,merge:ti},Id=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ld=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,hi=class extends Li{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Id,this.fragmentShader=Ld,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Un(t.uniforms),this.uniformsGroups=Pd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let a=this.uniforms[n].value;a&&a.isTexture?e.uniforms[n]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[n]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[n]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[n]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[n]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[n]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[n]={type:"m4",value:a.toArray()}:e.uniforms[n]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new vt().setHex(n.value);break;case"v2":this.uniforms[i].value=new Xt().fromArray(n.value);break;case"v3":this.uniforms[i].value=new U().fromArray(n.value);break;case"v4":this.uniforms[i].value=new pe().fromArray(n.value);break;case"m3":this.uniforms[i].value=new zt().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Zt().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},va=class extends hi{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},ai=class extends Li{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new vt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=gr,this.normalScale=new Xt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Cn=class extends ai{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Xt(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Jt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new vt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new vt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new vt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(t){this._diffuseRoughness>0!=t>0&&this.version++,this._diffuseRoughness=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}get iridescenceThicknessRange(){return wn('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(t){wn('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=t[0],this.iridescenceThicknessMaximum=t[1]}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.diffuseRoughness=t.diffuseRoughness,this.diffuseRoughnessMap=t.diffuseRoughnessMap,this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessMinimum=t.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=t.iridescenceThicknessMaximum,this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var tr=class extends Li{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new vt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new vt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=gr,this.normalScale=new Xt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.combine=Na,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ma=class extends Li{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Uh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Sa=class extends Li{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Kn(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function Kr(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var un=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],r=e[i-1];i:{t:{let a;e:{n:if(!(t<n)){for(let o=i+2;;){if(n===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=n,n=e[++i],t<n)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(i=2,r=o);for(let c=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(n=r,r=e[--i-1],t>=r)break t}a=i,i=0;break e}break i}for(;i<a;){let o=i+a>>>1;t<e[o]?a=o:i=o+1}if(n=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=t*n;for(let a=0;a!==n;++a)e[a]=i[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ba=class extends un{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ul,endingEnd:ul}}intervalChanged_(t,e,i){let n=this.parameterPositions,r=t-2,a=t+1,o=n[r],c=n[a];if(o===void 0)switch(this.getSettings_().endingStart){case dl:r=t,o=2*e-i;break;case fl:r=n.length-2,o=e+n[r]-n[r+1];break;default:r=t,o=i}if(c===void 0)switch(this.getSettings_().endingEnd){case dl:a=t,c=2*i-e;break;case fl:a=1,c=i+n[1]-n[0];break;default:a=t-1,c=e}let l=(i-e)*.5,h=this.valueSize;this._weightPrev=l/(e-o),this._weightNext=l/(c-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(i-e)/(n-e),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,y=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,b=(-1-f)*m+(1.5+f)*_+.5*g,v=f*m-f*_;for(let T=0;T!==o;++T)r[T]=p*a[h+T]+y*a[l+T]+b*a[c+T]+v*a[u+T];return r}},wa=class extends un{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,h=(i-e)/(n-e),u=1-h;for(let d=0;d!==o;++d)r[d]=a[l+d]*u+a[c+d]*h;return r}},Ta=class extends un{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},Ea=class extends un{interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,l=c-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(i-e)/(n-e),_=1-g;for(let m=0;m!==o;++m)r[m]=a[l+m]*_+a[c+m]*g;return r}let d=o*2,f=t-1;for(let g=0;g!==o;++g){let _=a[l+g],m=a[c+g],p=f*d+g*2,y=u[p],b=u[p+1],v=t*d+g*2,T=h[v],E=h[v+1],x=Nd(i,e,y,T,n);r[g]=Jh(x,_,b,E,m)}return r}};function Jh(s,t,e,i,n){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*i+s*s*s*n}function Dd(s,t,e,i,n){let r=1-s;return 3*r*r*(e-t)+6*r*s*(i-e)+3*s*s*(n-i)}function Nd(s,t,e,i,n){let r=(s-t)/(n-t);for(let a=0;a<8;a++){let o=Jh(r,t,e,i,n)-s;if(Math.abs(o)<1e-10)break;let c=Dd(r,t,e,i,n);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var ui=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Kn(e,this.TimeBufferType),this.values=Kn(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:Kn(t.times,Array),values:Kn(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),Kr(t.settings)&&(i.settings={inTangents:Kn(t.settings.inTangents,Array),outTangents:Kn(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Ta(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new wa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ba(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Ea(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Bs:e=this.InterpolantFactoryMethodDiscrete;break;case ha:e=this.InterpolantFactoryMethodLinear;break;case jr:e=this.InterpolantFactoryMethodSmooth;break;case hl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Lt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Bs;case this.InterpolantFactoryMethodLinear:return ha;case this.InterpolantFactoryMethodSmooth:return jr;case this.InterpolantFactoryMethodBezier:return hl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t;Kr(this.settings)&&(sh(this.settings.inTangents,t),sh(this.settings.outTangents,t))}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;Kr(this.settings)&&(rh(this.settings.inTangents,t),rh(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,r=0,a=n-1;for(;r!==n&&i[r]<t;)++r;for(;a!==-1&&i[a]>e;)--a;if(++a,r!==0||a!==n){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(kt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,r=i.length;r===0&&(kt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let c=i[o];if(typeof c=="number"&&isNaN(c)){kt("KeyframeTrack: Time is not a valid number.",this,o,c),t=!1;break}if(a!==null&&a>c){kt("KeyframeTrack: Out of order keys.",this,o,c,a),t=!1;break}a=c}if(n!==void 0&&rd(n))for(let o=0,c=n.length;o!==c;++o){let l=n[o];if(isNaN(l)){kt("KeyframeTrack: Value is not a valid number.",this,o,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===jr,r=t.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=t[o],h=t[o+1];if(l!==h&&(o!==1||l!==t[0]))if(n)c=!0;else{let u=o*i,d=u-i,f=u+i;for(let g=0;g!==i;++g){let _=e[u+g];if(_!==e[d+g]||_!==e[f+g]){c=!0;break}}}if(c){if(o!==a){t[a]=t[o];let u=o*i,d=a*i;for(let f=0;f!==i;++f)e[d+f]=e[u+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*i,c=a*i,l=0;l!==i;++l)e[c+l]=e[o+l];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,Kr(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function sh(s,t){for(let e=0,i=s.length;e!==i;e+=2)s[e]+=t}function rh(s,t){for(let e=0,i=s.length;e!==i;e+=2)s[e]*=t}ui.prototype.ValueTypeName="";ui.prototype.TimeBufferType=Float32Array;ui.prototype.ValueBufferType=Float32Array;ui.prototype.DefaultInterpolation=ha;var dn=class extends ui{constructor(t,e,i){super(t,e,i)}};dn.prototype.ValueTypeName="bool";dn.prototype.ValueBufferType=Array;dn.prototype.DefaultInterpolation=Bs;dn.prototype.InterpolantFactoryMethodLinear=void 0;dn.prototype.InterpolantFactoryMethodSmooth=void 0;var Aa=class extends ui{constructor(t,e,i,n){super(t,e,i,n)}};Aa.prototype.ValueTypeName="color";var Ra=class extends ui{constructor(t,e,i,n){super(t,e,i,n)}};Ra.prototype.ValueTypeName="number";var Ca=class extends un{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(i-e)/(n-e),l=t*o;for(let h=l+o;l!==h;l+=4)Ie.slerpFlat(r,0,a,l-o,a,l,c);return r}},er=class extends ui{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new Ca(this.times,this.values,this.getValueSize(),t)}};er.prototype.ValueTypeName="quaternion";er.prototype.InterpolantFactoryMethodSmooth=void 0;var fn=class extends ui{constructor(t,e,i){super(t,e,i)}};fn.prototype.ValueTypeName="string";fn.prototype.ValueBufferType=Array;fn.prototype.DefaultInterpolation=Bs;fn.prototype.InterpolantFactoryMethodLinear=void 0;fn.prototype.InterpolantFactoryMethodSmooth=void 0;var Pa=class extends ui{constructor(t,e,i,n){super(t,e,i,n)}};Pa.prototype.ValueTypeName="vector";var Ia=class{constructor(t,e,i){let n=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&n.onStart!==void 0&&n.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,n.onProgress!==void 0&&n.onProgress(h,a,o),a===o&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){let f=l[u],g=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Qh=new Ia,La=class{constructor(t){this.manager=t!==void 0?t:Qh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,r){i.load(t,n,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}setPriority(t){return this.priority=t,this}setCache(t){return this.cache=t,this}abort(){return this}};La.DEFAULT_MATERIAL_NAME="__DEFAULT";var hs=class extends we{static registerNode(t){this.prototype._lightNode=t}constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new vt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},ir=class extends hs{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(we.DEFAULT_UP),this.updateMatrix(),this.groundColor=new vt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},ll=new Zt,ah=new U,oh=new U,nr=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Xt(512,512),this.mapType=oi,this.map=null,this.mapPass=null,this.matrix=new Zt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new on,this._frameExtents=new Xt(1,1),this._viewportCount=1,this._viewports=[new pe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;ah.setFromMatrixPosition(t.matrixWorld),e.position.copy(ah),oh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(oh),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){ll.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(ll,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=n?n.z/r.x:1,o=n?n.w/r.y:1,c=n?n.x/r.x:0,l=n?n.y/r.y:0;t.coordinateSystem===es||t.reversedDepth?e.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,.5,.5,0,0,0,1),e.multiply(ll)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.mapType=t.mapType,this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.mapType=this.mapType,t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Jr=new U,Qr=new Ie,Ri=new U,sr=class extends we{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Zt,this.projectionMatrix=new Zt,this.projectionMatrixInverse=new Zt,this.coordinateSystem=pi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Jr,Qr,Ri),Ri.x===1&&Ri.y===1&&Ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Jr,Qr,Ri.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(Jr,Qr,Ri),Ri.x===1&&Ri.y===1&&Ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Jr,Qr,Ri.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},rn=new U,lh=new Xt,ch=new Xt,si=class extends sr{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=ua*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Uo*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return ua*2*Math.atan(Math.tan(Uo*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){rn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(rn.x,rn.y).multiplyScalar(-t/rn.z),rn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(rn.x,rn.y).multiplyScalar(-t/rn.z)}getViewSize(t,e){return this.getViewBounds(t,lh,ch),e.subVectors(ch,lh)}setViewOffset(t,e,i,n,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Uo*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,r=-.5*n,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*n/c,e-=a.offsetY*i/l,n*=a.width/c,i*=a.height/l}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var pl=class extends nr{constructor(){super(new si(90,1,.5,500)),this.isPointLightShadow=!0}},rr=class extends hs{constructor(t,e,i=0,n=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=n,this.shadow=new pl}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},pn=class extends sr{constructor(t=-1,e=1,i=1,n=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,r=i-t,a=i+t,o=n+e,c=n-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},ml=class extends nr{constructor(){super(new pn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Pn=class extends hs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(we.DEFAULT_UP),this.updateMatrix(),this.target=new we,this.shadow=new ml}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var ar=class extends je{constructor(){super(),this.isInstancedBufferGeometry=!0,this.type="InstancedBufferGeometry",this.instanceCount=1/0}copy(t){return super.copy(t),this.instanceCount=t.instanceCount,this}toJSON(){let t=super.toJSON();return t.instanceCount=this.instanceCount,t.isInstancedBufferGeometry=!0,t}};var Jn=-90,Qn=1,us=class extends we{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new si(Jn,Qn,t,e);n.layers=this.layers,this.add(n);let r=new si(Jn,Qn,t,e);r.layers=this.layers,this.add(r);let a=new si(Jn,Qn,t,e);a.layers=this.layers,this.add(a);let o=new si(Jn,Qn,t,e);o.layers=this.layers,this.add(o);let c=new si(Jn,Qn,t,e);c.layers=this.layers,this.add(c);let l=new si(Jn,Qn,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,r,a,o,c]=e;for(let l of e)this.remove(l);if(t===pi)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===es)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=i.texture.mipmapsAutoUpdate;i.texture.mipmapsAutoUpdate=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,2,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,3,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(i,4,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),i.texture.mipmapsAutoUpdate=_,t.setRenderTarget(i,5,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Da=class extends si{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t,this.perCameraFrustumCulled=!1}};var Xl="\\[\\]\\.:\\/",Ud=new RegExp("["+Xl+"]","g"),ql="[^"+Xl+"]",Fd="[^"+Xl.replace("\\.","")+"]",Od=/((?:WC+[\/:])*)/.source.replace("WC",ql),Bd=/(WCOD+)?/.source.replace("WCOD",Fd),kd=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ql),zd=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ql),Hd=new RegExp("^"+Od+Bd+kd+zd+"$"),Gd=["material","materials","bones","map"],gl=class{constructor(t,e,i){let n=i||Me.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Me=class s{constructor(t,e,i){this.path=e,this.parsedPath=i||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,i):new s(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Ud,"")}static parseTrackName(t){let e=Hd.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let r=i.nodeName.substring(n+1);Gd.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let c=i(o.children);if(c)return c}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Lt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=e.objectIndex;switch(i){case"materials":if(!t.material){kt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){kt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){kt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===l){l=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){kt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){kt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){kt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(l!==void 0){if(t[l]===void 0){kt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let a=t[n];if(a===void 0){let l=e.nodeName;kt("PropertyBinding: Trying to update property for track: "+l+"."+n+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){kt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){kt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=n;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Me.Composite=gl;Me.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Me.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Me.prototype.GetterByBindingType=[Me.prototype._getValue_direct,Me.prototype._getValue_array,Me.prototype._getValue_arrayElement,Me.prototype._getValue_toArray];Me.prototype.SetterByBindingTypeAndVersioning=[[Me.prototype._setValue_direct,Me.prototype._setValue_direct_setNeedsUpdate,Me.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_array,Me.prototype._setValue_array_setNeedsUpdate,Me.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_arrayElement,Me.prototype._setValue_arrayElement_setNeedsUpdate,Me.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_fromArray,Me.prototype._setValue_fromArray_setNeedsUpdate,Me.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var gx=new Float32Array(1);var xl=class{static{this.prototype.isMatrix2=!0}constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=n,this}};function Yl(s,t,e,i){let n=Vd(i);switch(e){case Ul:return s*t;case Ha:return s*t/n.components*n.byteLength;case Ga:return s*t/n.components*n.byteLength;case gn:return s*t*2/n.components*n.byteLength;case Va:return s*t*2/n.components*n.byteLength;case Fl:return s*t*3/n.components*n.byteLength;case xi:return s*t*4/n.components*n.byteLength;case Wa:return s*t*4/n.components*n.byteLength;case hr:case ur:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case dr:case fr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case qa:case Za:return Math.max(s,16)*Math.max(t,8)/4;case Xa:case Ya:return Math.max(s,8)*Math.max(t,8)/2;case $a:case Ka:case Qa:case ja:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Ja:case pr:case to:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case eo:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case io:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case no:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case so:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case ro:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case ao:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case oo:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case lo:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case co:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case ho:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case uo:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case fo:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case po:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case mo:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case go:case xo:case _o:return Math.ceil(s/4)*Math.ceil(t/4)*16;case yo:case vo:return Math.ceil(s/4)*Math.ceil(t/4)*8;case mr:case Mo:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Vd(s){switch(s){case oi:case Il:return{byteLength:1,components:1};case ms:case Ll:case Ai:return{byteLength:2,components:1};case ka:case za:return{byteLength:2,components:4};case Ei:case Ba:case di:return{byteLength:4,components:1};case Dl:case Nl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"187"}}));typeof window<"u"&&(window.__THREE__?Lt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="187");function vu(){let s=null,t=!1,e=null,i=null;function n(r,a){i=s.requestAnimationFrame(n),e(r,a)}return{start:function(){t!==!0&&e!==null&&s!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Xd(s){let t=new WeakMap;function e(o,c){let l=o.array,h=o.usage,u=l.byteLength,d=s.createBuffer();s.bindBuffer(c,d),s.bufferData(c,l,h),o.onUploadCallback();let f;if(l instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=s.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=s.SHORT;else if(l instanceof Uint32Array)f=s.UNSIGNED_INT;else if(l instanceof Int32Array)f=s.INT;else if(l instanceof Int8Array)f=s.BYTE;else if(l instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,c,l){let h=c.array,u=c.updateRanges;if(s.bindBuffer(l,o),u.length===0)s.bufferSubData(l,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let _=u[f];s.bufferSubData(l,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}c.clearUpdateRanges()}c.onUploadCallback()}function n(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=t.get(o);c&&(s.deleteBuffer(c.buffer),t.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=t.get(o);if(l===void 0)t.set(o,e(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:n,remove:r,update:a}}var qd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Yd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Zd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,$d=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Kd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Jd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Qd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,jd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,tf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,ef=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,nf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,sf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,rf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,af=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,of=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,lf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,cf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,hf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,uf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,df=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ff=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,pf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,mf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,gf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,xf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,_f=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,vf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Mf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Sf="gl_FragColor = linearToOutputTexel( gl_FragColor );",bf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,wf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Tf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Ef=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Af=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Rf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Cf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Pf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,If=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Lf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Df=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Nf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Uf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ff=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Of=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Bf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,kf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,zf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Hf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Gf=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Vf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Wf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Xf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,qf=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Yf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Zf=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,$f=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Kf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Jf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Qf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,jf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,tp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ep=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,ip=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,np=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,sp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,rp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ap=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,op=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,cp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,up=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,dp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,mp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,gp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,xp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,_p=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,yp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,vp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Mp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Sp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,bp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,wp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Tp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Ep=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ap=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Rp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Cp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Pp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Ip=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Lp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Dp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Np=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Up=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Fp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Op=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Bp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,kp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,zp=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Hp=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Gp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Vp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Wp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Xp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,qp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Yp=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,$p=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qp=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,jp=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,tm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,em=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,im=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,nm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,rm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,am=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,om=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hm=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,um=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,fm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,pm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,xm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_m=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ym=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Mm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,wm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Tm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,qt={alphahash_fragment:qd,alphahash_pars_fragment:Yd,alphamap_fragment:Zd,alphamap_pars_fragment:$d,alphatest_fragment:Kd,alphatest_pars_fragment:Jd,aomap_fragment:Qd,aomap_pars_fragment:jd,batching_pars_vertex:tf,batching_vertex:ef,begin_vertex:nf,beginnormal_vertex:sf,bsdfs:rf,iridescence_fragment:af,bumpmap_pars_fragment:of,clipping_planes_fragment:lf,clipping_planes_pars_fragment:cf,clipping_planes_pars_vertex:hf,clipping_planes_vertex:uf,color_fragment:df,color_pars_fragment:ff,color_pars_vertex:pf,color_vertex:mf,common:gf,defaultnormal_vertex:xf,displacementmap_pars_vertex:_f,displacementmap_vertex:yf,emissivemap_fragment:vf,emissivemap_pars_fragment:Mf,colorspace_fragment:Sf,colorspace_pars_fragment:bf,envmap_fragment:wf,envmap_common_pars_fragment:Tf,envmap_pars_fragment:Ef,envmap_pars_vertex:Af,envmap_physical_pars_fragment:Bf,envmap_vertex:Rf,fog_vertex:Cf,fog_pars_vertex:Pf,fog_fragment:If,fog_pars_fragment:Lf,gradientmap_pars_fragment:Df,lightmap_pars_fragment:Nf,lights_lambert_fragment:Uf,lights_lambert_pars_fragment:Ff,lights_pars_begin:Of,lights_toon_fragment:kf,lights_toon_pars_fragment:zf,lights_phong_fragment:Hf,lights_phong_pars_fragment:Gf,lights_physical_fragment:Vf,lights_physical_pars_fragment:Wf,lights_fragment_begin:Xf,lights_fragment_maps:qf,lights_fragment_end:Yf,lightprobes_pars_fragment:Zf,logdepthbuf_fragment:$f,logdepthbuf_pars_fragment:Kf,logdepthbuf_pars_vertex:Jf,logdepthbuf_vertex:Qf,map_fragment:jf,map_pars_fragment:tp,map_particle_fragment:ep,map_particle_pars_fragment:ip,metalnessmap_fragment:np,metalnessmap_pars_fragment:sp,morphinstance_vertex:rp,morphcolor_vertex:ap,morphnormal_vertex:op,morphtarget_pars_vertex:lp,morphtarget_vertex:cp,normal_fragment_begin:hp,normal_fragment_maps:up,normal_pars_fragment:dp,normal_pars_vertex:fp,normal_vertex:pp,normalmap_pars_fragment:mp,clearcoat_normal_fragment_begin:gp,clearcoat_normal_fragment_maps:xp,clearcoat_pars_fragment:_p,iridescence_pars_fragment:yp,opaque_fragment:vp,packing:Mp,premultiplied_alpha_fragment:Sp,project_vertex:bp,dithering_fragment:wp,dithering_pars_fragment:Tp,roughnessmap_fragment:Ep,roughnessmap_pars_fragment:Ap,shadowmap_pars_fragment:Rp,shadowmap_pars_vertex:Cp,shadowmap_vertex:Pp,shadowmask_pars_fragment:Ip,skinbase_vertex:Lp,skinning_pars_vertex:Dp,skinning_vertex:Np,skinnormal_vertex:Up,specularmap_fragment:Fp,specularmap_pars_fragment:Op,tonemapping_fragment:Bp,tonemapping_pars_fragment:kp,transmission_fragment:zp,transmission_pars_fragment:Hp,uv_pars_fragment:Gp,uv_pars_vertex:Vp,uv_vertex:Wp,worldpos_vertex:Xp,background_vert:qp,background_frag:Yp,backgroundCube_vert:Zp,backgroundCube_frag:$p,cube_vert:Kp,cube_frag:Jp,depth_vert:Qp,depth_frag:jp,distance_vert:tm,distance_frag:em,equirect_vert:im,equirect_frag:nm,linedashed_vert:sm,linedashed_frag:rm,meshbasic_vert:am,meshbasic_frag:om,meshlambert_vert:lm,meshlambert_frag:cm,meshmatcap_vert:hm,meshmatcap_frag:um,meshnormal_vert:dm,meshnormal_frag:fm,meshphong_vert:pm,meshphong_frag:mm,meshphysical_vert:gm,meshphysical_frag:xm,meshtoon_vert:_m,meshtoon_frag:ym,points_vert:vm,points_frag:Mm,shadow_vert:Sm,shadow_frag:bm,sprite_vert:wm,sprite_frag:Tm},xt={common:{diffuse:{value:new vt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new zt}},envmap:{envMap:{value:null},envMapRotation:{value:new zt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new zt},normalScale:{value:new Xt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new vt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new vt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0},uvTransform:{value:new zt}},sprite:{diffuse:{value:new vt(16777215)},opacity:{value:1},center:{value:new Xt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}}},Ui={basic:{uniforms:ti([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:ti([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,xt.lights,{emissive:{value:new vt(0)},envMapIntensity:{value:1}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:ti([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,xt.lights,{emissive:{value:new vt(0)},specular:{value:new vt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:ti([xt.common,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.roughnessmap,xt.metalnessmap,xt.fog,xt.lights,{emissive:{value:new vt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:ti([xt.common,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.gradientmap,xt.fog,xt.lights,{emissive:{value:new vt(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:ti([xt.common,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:ti([xt.points,xt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:ti([xt.common,xt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:ti([xt.common,xt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:ti([xt.common,xt.bumpmap,xt.normalmap,xt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:ti([xt.sprite,xt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new zt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distance:{uniforms:ti([xt.common,xt.displacementmap,{referencePosition:{value:new U},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distance_vert,fragmentShader:qt.distance_frag},shadow:{uniforms:ti([xt.lights,xt.fog,{color:{value:new vt(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};Ui.physical={uniforms:ti([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new zt},clearcoatNormalScale:{value:new Xt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new zt},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new zt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new zt},sheen:{value:0},sheenColor:{value:new vt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new zt},transmissionSamplerSize:{value:new Xt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new zt},attenuationDistance:{value:0},attenuationColor:{value:new vt(0)},specularColor:{value:new vt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new zt},anisotropyVector:{value:new Xt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new zt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};var So={r:0,b:0,g:0},Em=new Zt,Mu=new zt;Mu.set(-1,0,0,0,1,0,0,0,1);function Am(s,t,e,i,n,r){let a=new vt(0),o=n===!0?0:1,c,l,h=null,u=0,d=null;function f(y){let b=y.isScene===!0?y.background:null;if(b&&b.isTexture){let v=y.backgroundBlurriness>0;b=t.get(b,v)}return b}function g(y){let b=!1,v=f(y);v===null?m(a,o):v&&v.isColor&&(m(v,1),b=!0);let T=s.xr.getEnvironmentBlendMode();T==="additive"?e.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||b)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(y,b){let v=f(b);v&&v.isCubeTexture?(l===void 0&&(l=new ce(new ln(1,1,1),new hi({name:"BackgroundCubeMaterial",uniforms:Un(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:Xe,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,E,x){this.matrixWorld.copyPosition(x.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=v,l.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Em.makeRotationFromEuler(b.backgroundRotation)).transpose(),v.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Mu),l.material.toneMapped=ee.getTransfer(v.colorSpace)!==de,(h!==v||u!==v.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,h=v,u=v.version,d=s.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new ce(new cn(2,2),new hi({name:"BackgroundMaterial",uniforms:Un(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:mn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=ee.getTransfer(v.colorSpace)!==de,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||u!==v.version||d!==s.toneMapping)&&(c.material.needsUpdate=!0,h=v,u=v.version,d=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function m(y,b){y.getRGB(So,Wl(s)),e.buffers.color.setClear(So.r,So.g,So.b,b,r)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,b=1){a.set(y),o=b,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(y){o=y,m(a,o)},render:g,addToRenderList:_,dispose:p}}function Rm(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=d(null),r=n,a=!1;function o(D,I,F,P,B){let z=!1,k=u(D,P,F,I);r!==k&&(r=k,l(r.object)),z=f(D,P,F,B),z&&g(D,P,F,B),B!==null&&t.update(B,s.ELEMENT_ARRAY_BUFFER),(z||a)&&(a=!1,v(D,I,F,P),B!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(B).buffer))}function c(){return s.createVertexArray()}function l(D){return s.bindVertexArray(D)}function h(D){return s.deleteVertexArray(D)}function u(D,I,F,P){let B=P.wireframe===!0,z=i[I.id];z===void 0&&(z={},i[I.id]=z);let k=D.isInstancedMesh===!0?D.id:0,J=z[k];J===void 0&&(J={},z[k]=J);let H=J[F.id];H===void 0&&(H={},J[F.id]=H);let Z=H[B];return Z===void 0&&(Z=d(c()),H[B]=Z),Z}function d(D){let I=[],F=[],P=[];for(let B=0;B<e;B++)I[B]=0,F[B]=0,P[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:F,attributeDivisors:P,object:D,attributes:{},index:null}}function f(D,I,F,P){let B=r.attributes,z=I.attributes,k=0,J=F.getAttributes();for(let H in J)if(J[H].location>=0){let tt=B[H],St=z[H];if(St===void 0&&(H==="instanceMatrix"&&D.instanceMatrix&&(St=D.instanceMatrix),H==="instanceColor"&&D.instanceColor&&(St=D.instanceColor)),tt===void 0||tt.attribute!==St||St&&tt.data!==St.data)return!0;k++}return r.attributesNum!==k||r.index!==P}function g(D,I,F,P){let B={},z=I.attributes,k=0,J=F.getAttributes();for(let H in J)if(J[H].location>=0){let tt=z[H];tt===void 0&&(H==="instanceMatrix"&&D.instanceMatrix&&(tt=D.instanceMatrix),H==="instanceColor"&&D.instanceColor&&(tt=D.instanceColor));let St={};St.attribute=tt,tt&&tt.data&&(St.data=tt.data),B[H]=St,k++}r.attributes=B,r.attributesNum=k,r.index=P}function _(){let D=r.newAttributes;for(let I=0,F=D.length;I<F;I++)D[I]=0}function m(D){p(D,0)}function p(D,I){let F=r.newAttributes,P=r.enabledAttributes,B=r.attributeDivisors;F[D]=1,P[D]===0&&(s.enableVertexAttribArray(D),P[D]=1),B[D]!==I&&(s.vertexAttribDivisor(D,I),B[D]=I)}function y(){let D=r.newAttributes,I=r.enabledAttributes;for(let F=0,P=I.length;F<P;F++)I[F]!==D[F]&&(s.disableVertexAttribArray(F),I[F]=0)}function b(D,I,F,P,B,z,k){k===!0?s.vertexAttribIPointer(D,I,F,B,z):s.vertexAttribPointer(D,I,F,P,B,z)}function v(D,I,F,P){_();let B=P.attributes,z=F.getAttributes(),k=I.defaultAttributeValues;for(let J in z){let H=z[J];if(H.location>=0){let Z=B[J];if(Z===void 0&&(J==="instanceMatrix"&&D.instanceMatrix&&(Z=D.instanceMatrix),J==="instanceColor"&&D.instanceColor&&(Z=D.instanceColor)),Z!==void 0){let tt=Z.normalized,St=Z.itemSize,Ft=t.get(Z);if(Ft===void 0)continue;let $=Ft.buffer,pt=Ft.type,yt=Ft.bytesPerElement,It=pt===s.INT||pt===s.UNSIGNED_INT||Z.gpuType===Ba;if(Z.isInterleavedBufferAttribute){let mt=Z.data,Ht=mt.isInterleavedBuffer===!0?mt.stride:mt.itemSize,Ee=Z.offset;if(mt.isInstancedInterleavedBuffer||mt.isInstancedBufferAttribute){for(let ct=0;ct<H.locationSize;ct++)p(H.location+ct,mt.meshPerAttribute);D.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=mt.meshPerAttribute*mt.count)}else for(let ct=0;ct<H.locationSize;ct++)m(H.location+ct);s.bindBuffer(s.ARRAY_BUFFER,$);for(let ct=0;ct<H.locationSize;ct++)b(H.location+ct,St/H.locationSize,pt,tt,Ht*yt,(Ee+St/H.locationSize*ct)*yt,It)}else{if(Z.isInstancedBufferAttribute){for(let mt=0;mt<H.locationSize;mt++)p(H.location+mt,Z.meshPerAttribute);D.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let mt=0;mt<H.locationSize;mt++)m(H.location+mt);s.bindBuffer(s.ARRAY_BUFFER,$);for(let mt=0;mt<H.locationSize;mt++)b(H.location+mt,St/H.locationSize,pt,tt,St*yt,St/H.locationSize*mt*yt,It)}}else if(k!==void 0){let tt=k[J];if(tt!==void 0)switch(tt.length){case 2:s.vertexAttrib2fv(H.location,tt);break;case 3:s.vertexAttrib3fv(H.location,tt);break;case 4:s.vertexAttrib4fv(H.location,tt);break;default:s.vertexAttrib1fv(H.location,tt)}}}}y()}function T(){C();for(let D in i){let I=i[D];for(let F in I){let P=I[F];for(let B in P){let z=P[B];for(let k in z)h(z[k].object),delete z[k];delete P[B]}}delete i[D]}}function E(D){if(i[D.id]===void 0)return;let I=i[D.id];for(let F in I){let P=I[F];for(let B in P){let z=P[B];for(let k in z)h(z[k].object),delete z[k];delete P[B]}}delete i[D.id]}function x(D){for(let I in i){let F=i[I];for(let P in F){let B=F[P];if(B[D.id]===void 0)continue;let z=B[D.id];for(let k in z)h(z[k].object),delete z[k];delete B[D.id]}}}function S(D){for(let I in i){let F=i[I],P=D.isInstancedMesh===!0?D.id:0,B=F[P];if(B!==void 0){for(let z in B){let k=B[z];for(let J in k)h(k[J].object),delete k[J];delete B[z]}delete F[P],Object.keys(F).length===0&&delete i[I]}}}function C(){R(),a=!0,r!==n&&(r=n,l(r.object))}function R(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:o,reset:C,resetDefaultState:R,dispose:T,releaseStatesOfGeometry:E,releaseStatesOfObject:S,releaseStatesOfProgram:x,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function Cm(s,t,e){let i;function n(c){i=c}function r(c,l){s.drawArrays(i,c,l),e.update(l,i,1)}function a(c,l,h){h!==0&&(s.drawArraysInstanced(i,c,l,h),e.update(l,i,h))}function o(c,l,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,h);let d=0;for(let f=0;f<h;f++)d+=l[f];e.update(d,i,1)}this.setMode=n,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Pm(s,t,e,i){let n;function r(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let x=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(x.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function a(x){return!(x!==xi&&i.convert(x)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(x){let S=x===Ai&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(x!==oi&&x!==di&&!S&&i.convert(x)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function c(x){if(x==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";x="mediump"}return x==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp",h=c(l);h!==l&&(Lt("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),d=e.logarithmicDepthBuffer===!0&&u===!1;e.reversedDepthBuffer===!0&&u===!1&&Lt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),e.logarithmicDepthBuffer===!0&&u===!0&&Lt("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),y=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),b=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),T=s.getParameter(s.MAX_SAMPLES),E=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:b,maxFragmentUniforms:v,maxSamples:T,samples:E}}function Im(s){let t=this,e=null,i=0,n=!1,r=!1,a=new bi,o=new zt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||n;return n=d,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,p=s.get(u);if(!n||g===null||g.length===0||r&&!m)r?h(null):l();else{let y=r?0:i,b=y*4,v=p.clippingState||null;c.value=v,v=h(g,d,b,f);for(let T=0;T!==b;++T)v[T]=e[T];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,d,f,g){let _=u!==null?u.length:0,m=null;if(_!==0){if(m=c.value,g!==!0||m===null){let p=f+_*4,y=d.matrixWorldInverse;o.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,v=f;b!==_;++b,v+=4)a.copy(u[b]).applyMatrix4(y,o),a.normal.toArray(m,v),m[v+3]=a.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}var yr=class extends Qe{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new Zs(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},n=new ln(5,5,5),r=new hi({name:"CubemapFromEquirect",uniforms:Un(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Xe,blending:In});r.uniforms.tEquirect.value=e;let a=new ce(n,r),o=e.minFilter;return e.minFilter===Yi&&(e.minFilter=ii),new us(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,n);t.setRenderTarget(r)}},jh=256,Lm=3,Dm=20,Su=256,bu=16,Nm=3,Um=new U,Fm=new vt,_s=class s{constructor(t){this._renderer=t,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new us(1,10,null),this._boxMesh=new ce(new ln(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(t,e=0,i=.1,n=100,r={}){let{size:a=256,position:o=Um}=r,c=this._renderer;this._setSize(a);let l=this._allocateTarget(),h=this._getSourceTarget(!0);e>0&&(h.texture.mipmapsAutoUpdate=!1);let u=c.autoClear,d=c.autoClearColor,f=c.autoClearDepth,g=c.autoClearStencil,_=t.background;c.autoClear=!0,c.autoClearColor=!0,c.autoClearDepth=!0,c.autoClearStencil=!0,_===null&&(t.background=c.getClearColor(Fm));let m=new us(i,n,h);return m.position.copy(o),m.update(c,t),c.autoClear=u,c.autoClearColor=d,c.autoClearDepth=f,c.autoClearStencil=g,t.background=_,e>0&&(h.texture.mipmapsAutoUpdate=!0,this._blur(l,e)),this._applyPMREM(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=iu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=eu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(t,e){return e>0?1-Math.sqrt(1-t/e):0}_setSize(t){this._cubeSize=Math.max(jh,Zh(t))}_fromTexture(t,e){t.mapping===Dn||t.mapping===ps?this._setSize(t.image.length===0?jh:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4);let i=e||this._allocateTarget();return this._textureToCubemap(t),this._applyPMREM(i),i}_allocateTarget(){let t=this._cubeSize,e=tu(t,!1,!1),i=Math.log2(t)-Lm;for(let n=0;n<=i;n++)e.texture.mipmaps.push({width:t>>n,height:t>>n});return e.texture.name="PMREM",e.texture.isPMREMTexture=!0,e}_getSourceTarget(t=!1){let e=this._cubeSize,i=this._sourceTarget;return(i===null||i.width!==e||t&&i.depthBuffer===!1)&&(i!==null&&i.dispose(),this._sourceTarget=tu(e,!0,t)),this._sourceTarget}_compileMaterial(t){this._boxMesh.material=t,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(t,e,i){let n=this._boxMesh,r=this._cubeCamera;n.material=i,r.renderTarget=t,r.activeMipmapLevel=e;let a=t.width>>e;t.viewport.set(0,0,a,a),r.update(this._renderer,n),t.viewport.set(0,0,t.width,t.height)}_textureToCubemap(t){let e;t.mapping===Dn||t.mapping===ps?(this._cubemapMaterial===null&&(this._cubemapMaterial=iu()),e=this._cubemapMaterial,e.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=eu()),e=this._equirectMaterial),e.uniforms.envMap.value=t,this._renderCube(this._getSourceTarget(),0,e)}_applyPMREM(t){this._ggxMaterial===null&&(this._ggxMaterial=Om(),this._integrationMaterial=Bm());let e=this._cubeSize,i=t.texture.mipmaps.length-1,n=this._ggxMaterial.uniforms;n.envMap.value=this._sourceTarget.texture;let r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(e/bu);for(let a=0;a<=i;a++){let o=s.lodToRoughness(a,i);if(a>i-Nm)r.roughness.value=o,this._renderCube(t,a,this._integrationMaterial);else{let c=o>0?Math.log2(e)+.5*Math.log2(6/(Su*Math.pow(o,4)))+.5:0;n.roughness.value=o,n.lodBias.value=c,this._renderCube(t,a,this._ggxMaterial)}}}_blur(t,e){this._blurMaterial===null&&(this._blurMaterial=km());let i=this._blurMaterial,n=i.uniforms,r=this._sourceTarget;n.sigma.value=Math.min(e,Math.PI)/Math.SQRT2,n.envMap.value=r.texture,this._renderCube(t,0,i),n.envMap.value=t.texture,this._renderCube(r,0,i)}};function tu(s,t,e){return new yr(s,{minFilter:Yi,generateMipmaps:t,type:Ai,colorSpace:ks,depthBuffer:e})}function vr(s,t,e){return new hi({name:s,uniforms:t,vertexShader:qt.cube_vert,fragmentShader:e,side:Xe,blending:In,depthTest:!1,depthWrite:!1})}function Om(){return vr("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Su}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Bm(){return vr("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:bu}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function km(){return vr("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Dm}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function eu(){return vr("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function iu(){return vr("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function zm(s){let t=new WeakMap,e=new WeakMap,i=null;function n(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Ua||f===Fa)if(t.has(d)){let g=t.get(d).texture;return o(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let _=new yr(g.height);return _.fromEquirectangularTexture(s,d),t.set(d,_),d.addEventListener("dispose",l),o(_.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture&&d.isPMREMTexture!==!0){let f=d.mapping,g=f===Ua||f===Fa,_=f===Dn||f===ps;if(g||_){let m=e.get(d),p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return i===null&&(i=new _s(s)),m=g?i.fromEquirectangular(d,m):i.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),m.texture;if(m!==void 0)return m.texture;{let y=d.image;return g&&y&&y.height>0||_&&y&&c(y)?(i===null&&(i=new _s(s)),m=g?i.fromEquirectangular(d):i.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function o(d,f){return f===Ua?d.mapping=Dn:f===Fa&&(d.mapping=ps),d}function c(d){let f=0,g=6;for(let _=0;_<g;_++)d[_]!==void 0&&f++;return f===g}function l(d){let f=d.target;f.removeEventListener("dispose",l);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:u}}function Hm(s){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=s.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&wn("WebGLRenderer: "+i+" extension not supported."),n}}}function Gm(s,t,e,i){let n={},r=new WeakMap,a=new FinalizationRegistry(g=>delete n[g]);function o(g){c(g.target)}function c(g){g.index!==null&&t.remove(g.index);for(let m in g.attributes)t.remove(g.attributes[m]);g.removeEventListener("dispose",o),delete n[g.id],a.unregister(g);let _=r.get(g);_&&(t.remove(_),r.delete(g)),i.releaseStatesOfGeometry(g),g.isInstancedBufferGeometry===!0&&delete g._maxInstanceCount,e.memory.geometries--}function l(g,_){return n[_.id]!==void 0||(_.addEventListener("dispose",o),n[_.id]=new WeakRef(_),a.register(_,_.id,_),e.memory.geometries++),_}function h(g){let _=g.attributes;for(let m in _)t.update(_[m],s.ARRAY_BUFFER)}function u(g){let _=g.index,m=g.attributes.position,p=0;if(m===void 0)return;let y=_!==null?_.array.length:m.array.length/3-1,b=m.count>=65535?Ws:Tn,v=new b(Math.ceil(y/3)*6,1),T=v.array;if(_!==null){let x=_.array;p=_.version;for(let S=0,C=0;S<y;S+=3){let R=x[S+0],D=x[S+1],I=x[S+2];T[C++]=R,T[C++]=D,T[C++]=D,T[C++]=I,T[C++]=I,T[C++]=R}}else{p=m.version;for(let x=0,S=0;x<y;x+=3){let C=x+0,R=x+1,D=x+2;T[S++]=C,T[S++]=R,T[S++]=R,T[S++]=D,T[S++]=D,T[S++]=C}}v.version=p;let E=r.get(g);E&&t.remove(E),r.set(g,v)}function d(g){let _=r.get(g);if(_){let m=g.index;m!==null&&_.version<m.version&&u(g)}else u(g);return r.get(g)}function f(){for(let g in n){let _=n[g].deref();_!==void 0&&c(_)}}return{get:l,update:h,getWireframeAttribute:d,dispose:f}}function Vm(s,t,e){let i;function n(u){i=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function c(u,d){s.drawElements(i,d,r,u*a),e.update(d,i,1)}function l(u,d,f){f!==0&&(s.drawElementsInstanced(i,d,r,u*a,f),e.update(d,i,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,f);let _=0;for(let m=0;m<f;m++)_+=d[m];e.update(_,i,1)}this.setMode=n,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function Wm(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(e.calls++,a){case s.TRIANGLES:e.triangles+=o*(r/3);break;case s.LINES:e.lines+=o*(r/2);break;case s.LINE_STRIP:e.lines+=o*(r-1);break;case s.LINE_LOOP:e.lines+=o*r;break;case s.POINTS:e.points+=o*r;break;default:kt("WebGLInfo: Unknown draw mode:",a);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function Xm(s,t,e){let i=new WeakMap,n=new pe;function r(a,o,c){let l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(o);if(d===void 0||d.count!==u){let C=function(){x.dispose(),i.delete(o),o.removeEventListener("dispose",C)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],y=o.morphAttributes.color||[],b=0;f===!0&&(b=1),g===!0&&(b=2),_===!0&&(b=3);let v=o.attributes.position.count*b,T=1;v>t.maxTextureSize&&(T=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let E=new Float32Array(v*T*4*u),x=new Gs(E,v,T,u);x.type=di,x.needsUpdate=!0;let S=b*4;for(let R=0;R<u;R++){let D=m[R],I=p[R],F=y[R],P=v*T*4*R;for(let B=0;B<D.count;B++){let z=B*S;f===!0&&(n.fromBufferAttribute(D,B),E[P+z+0]=n.x,E[P+z+1]=n.y,E[P+z+2]=n.z,E[P+z+3]=0),g===!0&&(n.fromBufferAttribute(I,B),E[P+z+4]=n.x,E[P+z+5]=n.y,E[P+z+6]=n.z,E[P+z+7]=0),_===!0&&(n.fromBufferAttribute(F,B),E[P+z+8]=n.x,E[P+z+9]=n.y,E[P+z+10]=n.z,E[P+z+11]=F.itemSize===4?n.w:1)}}d={count:u,texture:x,size:new Xt(v,T)},i.set(o,d),o.addEventListener("dispose",C)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",a.morphTexture,e);else{let f=0;for(let _=0;_<l.length;_++)f+=l[_];let g=o.morphTargetsRelative?1:1-f;c.getUniforms().setValue(s,"morphTargetBaseInfluence",g),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",d.texture,e),c.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function qm(s,t,e,i,n){let r=new WeakMap;function a(l){let h=n.render.frame,u=l.geometry,d=t.get(l,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function o(){r=new WeakMap}function c(l){let h=l.target;h.removeEventListener("dispose",c),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var Ym={[wl]:"LINEAR_TONE_MAPPING",[Tl]:"REINHARD_TONE_MAPPING",[El]:"CINEON_TONE_MAPPING",[Al]:"ACES_FILMIC_TONE_MAPPING",[lr]:"AGX_TONE_MAPPING",[Cl]:"NEUTRAL_TONE_MAPPING",[Rl]:"CUSTOM_TONE_MAPPING"};function Zm(s,t,e,i,n,r){let a=new Qe(t,e,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,l=null,h=new je;h.setAttribute("position",new ue([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new ue([0,2,0,0,2,0],2));let u=new va({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new ce(h,u),f=new pn(-1,1,1,-1,0,1),g=null,_=null,m=!1,p,y=null,b=[],v=!1;this.setSize=function(T,E){a.setSize(T,E),o!==null&&o.setSize(T,E),c!==null&&c.setSize(T,E);for(let x=0;x<b.length;x++){let S=b[x];S.setSize&&S.setSize(T,E)}},this.setEffects=function(T){b=T,v=b.length>0&&b[0].isRenderPass===!0;let E=a.width,x=a.height;b.length>0&&o===null&&(o=new Qe(E,x,{type:Ai,depthBuffer:!1,stencilBuffer:!1}),c=new Qe(E,x,{type:Ai,depthBuffer:!1,stencilBuffer:!1}));let S=n===!0&&b.some(C=>C.needsDepthTexture===!0);S!==(a.depthTexture!==null)&&(S===!0&&l===null&&(l=new qi(E,x),r===!0&&(l.format=Zi,l.type=Nn)),a.dispose(),a.depthTexture=S?l:null,a.resolveDepthBuffer=S,a.storeMultisampledDepthBuffer=S);for(let C=0;C<b.length;C++){let R=b[C];R.setSize&&R.setSize(E,x),S&&R.needsDepthTexture===!0&&R.setDepthTexture&&R.setDepthTexture(l)}},this.begin=function(T,E){if(m||T.toneMapping===Di&&b.length===0)return!1;if(y=E,E!==null){let x=E.width,S=E.height;(a.width!==x||a.height!==S)&&this.setSize(x,S)}return v===!1&&T.setRenderTarget(a),p=T.toneMapping,T.toneMapping=Di,!0},this.hasRenderPass=function(){return v},this.end=function(T,E){T.toneMapping=p,m=!0;let x=a,S=o;for(let C=0;C<b.length;C++){let R=b[C];R.enabled!==!1&&(R.render(T,S,x,E),R.needsSwap!==!1&&(x=S,S=S===o?c:o))}if(g!==T.outputColorSpace||_!==T.toneMapping){g=T.outputColorSpace,_=T.toneMapping,u.defines={},ee.getTransfer(g)===de&&(u.defines.SRGB_TRANSFER="");let C=Ym[_];C&&(u.defines[C]=""),u.needsUpdate=!0}u.uniforms.tDiffuse.value=x.texture,T.setRenderTarget(y),T.render(d,f),y=null,m=!1},this.isCompositing=function(){return m},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),h.dispose(),u.dispose()}}var wu=new ni,Tu=new qi(1,1),Eu=new $s(1),Au=new Gs,Ru=new pa,Cu=new Zs,nu=[],su=[],ru=new Float32Array(16),au=new Float32Array(9),ou=new Float32Array(4);function ys(s,t,e){let i=s[0];if(i<=0||i>0)return s;let n=t*e,r=nu[n];if(r===void 0&&(r=new Float32Array(n),nu[n]=r),t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,s[a].toArray(r,o)}return r}function Ne(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function Ue(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function To(s,t){let e=su[t];e===void 0&&(e=new Int32Array(t),su[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function $m(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function Km(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ne(e,t))return;s.uniform2fv(this.addr,t),Ue(e,t)}}function Jm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ne(e,t))return;s.uniform3fv(this.addr,t),Ue(e,t)}}function Qm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ne(e,t))return;s.uniform4fv(this.addr,t),Ue(e,t)}}function jm(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Ne(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Ue(e,t)}else{if(Ne(e,i))return;ou.set(i),s.uniformMatrix2fv(this.addr,!1,ou),Ue(e,i)}}function t0(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Ne(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Ue(e,t)}else{if(Ne(e,i))return;au.set(i),s.uniformMatrix3fv(this.addr,!1,au),Ue(e,i)}}function e0(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Ne(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Ue(e,t)}else{if(Ne(e,i))return;ru.set(i),s.uniformMatrix4fv(this.addr,!1,ru),Ue(e,i)}}function i0(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function n0(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ne(e,t))return;s.uniform2iv(this.addr,t),Ue(e,t)}}function s0(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ne(e,t))return;s.uniform3iv(this.addr,t),Ue(e,t)}}function r0(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ne(e,t))return;s.uniform4iv(this.addr,t),Ue(e,t)}}function a0(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function o0(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ne(e,t))return;s.uniform2uiv(this.addr,t),Ue(e,t)}}function l0(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ne(e,t))return;s.uniform3uiv(this.addr,t),Ue(e,t)}}function c0(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ne(e,t))return;s.uniform4uiv(this.addr,t),Ue(e,t)}}function Eo(s){return s.version===0&&(s.compareFunction=kl,s.needsUpdate=!0),s}function h0(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?r=Eo(Tu):r=wu,e.setTexture2D(t||r,n)}function u0(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||Ru,n)}function d0(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_CUBE_SHADOW?r=Eo(Eu):r=Cu,e.setTextureCube(t||r,n)}function f0(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Au,n)}function p0(s){switch(s){case 5126:return $m;case 35664:return Km;case 35665:return Jm;case 35666:return Qm;case 35674:return jm;case 35675:return t0;case 35676:return e0;case 5124:case 35670:return i0;case 35667:case 35671:return n0;case 35668:case 35672:return s0;case 35669:case 35673:return r0;case 5125:return a0;case 36294:return o0;case 36295:return l0;case 36296:return c0;case 35678:case 36198:case 36298:case 36306:case 35682:return h0;case 35679:case 36299:case 36307:return u0;case 35680:case 36300:case 36308:case 36293:return d0;case 36289:case 36303:case 36311:case 36292:return f0}}function m0(s,t){s.uniform1fv(this.addr,t)}function g0(s,t){let e=ys(t,this.size,2);s.uniform2fv(this.addr,e)}function x0(s,t){let e=ys(t,this.size,3);s.uniform3fv(this.addr,e)}function _0(s,t){let e=ys(t,this.size,4);s.uniform4fv(this.addr,e)}function y0(s,t){let e=ys(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function v0(s,t){let e=ys(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function M0(s,t){let e=ys(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function S0(s,t){s.uniform1iv(this.addr,t)}function b0(s,t){s.uniform2iv(this.addr,t)}function w0(s,t){s.uniform3iv(this.addr,t)}function T0(s,t){s.uniform4iv(this.addr,t)}function E0(s,t){s.uniform1uiv(this.addr,t)}function A0(s,t){s.uniform2uiv(this.addr,t)}function R0(s,t){s.uniform3uiv(this.addr,t)}function C0(s,t){s.uniform4uiv(this.addr,t)}function P0(s,t,e){let i=this.cache,n=t.length,r=To(e,n);Ne(i,r)||(s.uniform1iv(this.addr,r),Ue(i,r));let a;this.type===s.SAMPLER_2D_SHADOW?a=Eo(Tu):a=wu;for(let o=0;o!==n;++o)e.setTexture2D(t[o]||a,r[o])}function I0(s,t,e){let i=this.cache,n=t.length,r=To(e,n);Ne(i,r)||(s.uniform1iv(this.addr,r),Ue(i,r));for(let a=0;a!==n;++a)e.setTexture3D(t[a]||Ru,r[a])}function L0(s,t,e){let i=this.cache,n=t.length,r=To(e,n);Ne(i,r)||(s.uniform1iv(this.addr,r),Ue(i,r));let a;this.type===s.SAMPLER_CUBE_SHADOW?a=Eo(Eu):a=Cu;for(let o=0;o!==n;++o)e.setTextureCube(t[o]||a,r[o])}function D0(s,t,e){let i=this.cache,n=t.length,r=To(e,n);Ne(i,r)||(s.uniform1iv(this.addr,r),Ue(i,r));for(let a=0;a!==n;++a)e.setTexture2DArray(t[a]||Au,r[a])}function N0(s){switch(s){case 5126:return m0;case 35664:return g0;case 35665:return x0;case 35666:return _0;case 35674:return y0;case 35675:return v0;case 35676:return M0;case 5124:case 35670:return S0;case 35667:case 35671:return b0;case 35668:case 35672:return w0;case 35669:case 35673:return T0;case 5125:return E0;case 36294:return A0;case 36295:return R0;case 36296:return C0;case 35678:case 36198:case 36298:case 36306:case 35682:return P0;case 35679:case 36299:case 36307:return I0;case 35680:case 36300:case 36308:case 36293:return L0;case 36289:case 36303:case 36311:case 36292:return D0}}var Kl=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=p0(e.type)}},Jl=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=N0(e.type)}},Ql=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let r=0,a=n.length;r!==a;++r){let o=n[r];o.setValue(t,e[o.id],i)}}},Zl=/(\w+)(\])?(\[|\.)?/g;function lu(s,t){s.seq.push(t),s.map[t.id]=t}function U0(s,t,e){let i=s.name,n=i.length;for(Zl.lastIndex=0;;){let r=Zl.exec(i),a=Zl.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===n){lu(e,l===void 0?new Kl(o,s,t):new Jl(o,s,t));break}else{let u=e.map[o];u===void 0&&(u=new Ql(o),lu(e,u)),e=u}}}var xs=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=t.getActiveUniform(e,a),c=t.getUniformLocation(e,o.name);U0(o,c,this)}let n=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(a):r.push(a);n.length>0&&(this.seq=n.concat(r))}setValue(t,e,i,n){let r=this.map[e];r!==void 0&&r.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let r=0,a=e.length;r!==a;++r){let o=e[r],c=i[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,r=t.length;n!==r;++n){let a=t[n];a.id in e&&i.push(a)}return i}};function cu(s,t,e){let i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}var F0=37297,O0=0;function B0(s,t){let e=s.split(`
`),i=[],n=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=n;a<r;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}var hu=new zt;function k0(s){ee._getMatrix(hu,ee.workingColorSpace,s);let t=`mat3( ${hu.elements.map(e=>e.toFixed(4))} )`;switch(ee.getTransfer(s)){case zs:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return Lt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function uu(s,t,e){let i=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+B0(s.getShaderSource(t),o)}else return r}function z0(s,t){let e=k0(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( ${e[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}var H0={[wl]:"Linear",[Tl]:"Reinhard",[El]:"Cineon",[Al]:"ACESFilmic",[lr]:"AgX",[Cl]:"Neutral",[Rl]:"Custom"};function G0(s,t){let e=H0[t];return e===void 0?(Lt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var bo=new U;function V0(){ee.getLuminanceCoefficients(bo);let s=bo.x.toFixed(4),t=bo.y.toFixed(4),e=bo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function W0(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(_r).join(`
`)}function X0(s){let t=[];for(let e in s){let i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function q0(s,t){let e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let r=s.getActiveAttrib(t,n),a=r.name,o=1;r.type===s.FLOAT_MAT2&&(o=2),r.type===s.FLOAT_MAT3&&(o=3),r.type===s.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:s.getAttribLocation(t,a),locationSize:o}}return e}function _r(s){return s!==""}function du(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,t.numLightProbeGrids)}function fu(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Y0=/^[ \t]*#include +<([\w\d./]+)>/gm;function jl(s){return s.replace(Y0,Z0)}function Z0(s,t){let e=qt[t];if(e===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">");return jl(e)}var $0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function pu(s){return s.replace($0,K0)}function K0(s,t,e,i){let n="";for(let r=parseInt(t);r<parseInt(e);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function mu(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var J0={[or]:"SHADOWMAP_TYPE_PCF",[ds]:"SHADOWMAP_TYPE_VSM"};function Q0(s){return J0[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var j0={[ps]:"ENVMAP_MODE_REFRACTION"};function tg(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":j0[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var eg={[Na]:"ENVMAP_BLENDING_MULTIPLY",[Ih]:"ENVMAP_BLENDING_MIX",[Lh]:"ENVMAP_BLENDING_ADD"};function ig(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":eg[s.combine]||"ENVMAP_BLENDING_NONE"}function ng(s,t,e,i){let n=s.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,c=Q0(e),l=e.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",h=tg(e),u=ig(e),d=W0(e),f=X0(r),g=n.createProgram(),_,m,p=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(_=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f].filter(_r).join(`
`),_.length>0&&(_+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f].filter(_r).join(`
`),m.length>0&&(m+=`
`)):(_=[mu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+e.diffuseRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(_r).join(`
`),m=[mu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,f,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",e.envMapPMREM?"#define ENVMAP_MAX_LOD "+e.envMapMaxLod+".0":"",e.envMapPMREM?"#define ENVMAP_SIZE "+e.envMapSize+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",e.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Di?"#define TONE_MAPPING":"",e.toneMapping!==Di?qt.tonemapping_pars_fragment:"",e.toneMapping!==Di?G0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,z0("linearToOutputTexel",e.outputColorSpace),V0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(_r).join(`
`)),a=jl(a),a=du(a,e),a=fu(a,e),o=jl(o),o=du(o,e),o=fu(o,e),a=pu(a),o=pu(o),e.isRawShaderMaterial!==!0&&(p=`#version 300 es
`,_=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,m=["#define varying in",e.glslVersion===zl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===zl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let y=p+_+a,b=p+m+o,v=cu(n,n.VERTEX_SHADER,y),T=cu(n,n.FRAGMENT_SHADER,b);n.attachShader(g,v),n.attachShader(g,T),e.index0AttributeName!==void 0?n.bindAttribLocation(g,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(g,0,"position"),n.linkProgram(g);function E(R){if(s.debug.checkShaderErrors){let D=n.getProgramInfoLog(g)||"",I=n.getShaderInfoLog(v)||"",F=n.getShaderInfoLog(T)||"",P=D.trim(),B=I.trim(),z=F.trim(),k=!0,J=!0;if(n.getProgramParameter(g,n.LINK_STATUS)===!1)if(k=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,g,v,T);else{let H=uu(n,v,"vertex"),Z=uu(n,T,"fragment");kt("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(g,n.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+P+`
`+H+`
`+Z)}else P!==""?Lt("WebGLProgram: Program Info Log:",P):(B===""||z==="")&&(J=!1);J&&(R.diagnostics={runnable:k,programLog:P,vertexShader:{log:B,prefix:_},fragmentShader:{log:z,prefix:m}})}n.deleteShader(v),n.deleteShader(T),x=new xs(n,g),S=q0(n,g)}let x;this.getUniforms=function(){return x===void 0&&E(this),x};let S;this.getAttributes=function(){return S===void 0&&E(this),S};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=n.getProgramParameter(g,F0)),C},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(g),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=O0++,this.cacheKey=t,this.usedTimes=1,this.program=g,this.vertexShader=v,this.fragmentShader=T,this}var sg=0,tc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new ec(t),e.set(t,i)),i}},ec=class{constructor(t){this.id=sg++,this.code=t,this.usedTimes=0}};function rg(s){return s===gn||s===pr||s===mr}function ag(s,t,e,i,n,r){let a=new Vs,o=new tc,c=new Set,l=[],h=new Map,u=i.logarithmicDepthBuffer,d={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(x){return c.add(x),x===0?"uv":`uv${x}`}function g(x,S,C,R,D,I){let F=R.fog,P=D.geometry,B=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?R.environment:null,z=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,k=t.get(x.envMap||B,z),J=d[x.type],H=i.precision;x.precision!==null&&(H=i.getMaxPrecision(x.precision),H!==x.precision&&Lt("WebGLProgram.getParameters:",x.precision,"not supported, using",H,"instead."));let Z=P.morphAttributes.position||P.morphAttributes.normal||P.morphAttributes.color,tt=Z!==void 0?Z.length:0,St=0;P.morphAttributes.position!==void 0&&(St=1),P.morphAttributes.normal!==void 0&&(St=2),P.morphAttributes.color!==void 0&&(St=3);let Ft,$,pt,yt;if(J){let gt=Ui[J];Ft=gt.vertexShader,$=gt.fragmentShader}else{Ft=x.vertexShader,$=x.fragmentShader;let gt=o.getVertexShaderStage(x),fe=o.getFragmentShaderStage(x);o.update(x,gt,fe),pt=gt.id,yt=fe.id}let It=s.getRenderTarget(),mt=s.state.buffers.depth.getReversed(),Ht=D.isInstancedMesh===!0,Ee=D.isBatchedMesh===!0,ct=!!x.map,at=!!x.matcap,Ut=!!k,Wt=Ut&&k.isPMREMTexture===!0,be=!!x.aoMap,le=!!x.lightMap,ve=!!x.bumpMap&&x.wireframe===!1,se=!!x.normalMap,Gt=!!x.displacementMap,Qt=!!x.emissiveMap,ae=!!x.metalnessMap,Ae=!!x.roughnessMap,Re=x.anisotropy>0,O=x.clearcoat>0,me=x.diffuseRoughness>0,Kt=x.dispersion>0,ie=x.retroreflectivity>0,it=x.iridescence>0,re=x.sheen>0,At=x.transmission>0,Pt=Re&&!!x.anisotropyMap,A=O&&!!x.clearcoatMap,M=O&&!!x.clearcoatNormalMap,G=O&&!!x.clearcoatRoughnessMap,et=me&&!!x.diffuseRoughnessMap,j=it&&!!x.iridescenceMap,ot=it&&!!x.iridescenceThicknessMap,rt=re&&!!x.sheenColorMap,Y=re&&!!x.sheenRoughnessMap,K=!!x.specularMap,lt=!!x.specularColorMap,L=!!x.specularIntensityMap,Q=At&&!!x.transmissionMap,q=At&&!!x.thicknessMap,ut=!!x.gradientMap,st=!!x.alphaMap,ht=x.alphaTest>0,Ct=!!x.alphaHash,$t=!!x.extensions,nt=Di;x.toneMapped&&(It===null||It.isXRRenderTarget===!0)&&(nt=s.toneMapping);let Dt=Wt?k.isCompressedCubeTexture?k.image[0].mipmaps:k.mipmaps:null,Yt={shaderID:J,shaderType:x.type,shaderName:x.name,vertexShader:Ft,fragmentShader:$,defines:x.defines,customVertexShaderID:pt,customFragmentShaderID:yt,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:H,batching:Ee,batchingColor:Ee&&D._colorsTexture!==null,instancing:Ht,instancingColor:Ht&&D.instanceColor!==null,instancingMorph:Ht&&D.morphTexture!==null,outputColorSpace:It===null?s.outputColorSpace:It.isXRRenderTarget===!0?It.texture.colorSpace:ee.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:ct,matcap:at,envMap:Ut,envMapMode:Ut&&k.mapping,envMapPMREM:Wt,envMapMaxLod:Wt?Dt.length-1:null,envMapSize:Wt?Dt[0].width:null,aoMap:be,lightMap:le,bumpMap:ve,normalMap:se,displacementMap:Gt,emissiveMap:Qt,normalMapObjectSpace:se&&x.normalMapType===Fh,normalMapTangentSpace:se&&x.normalMapType===gr,packedNormalMap:se&&x.normalMapType===gr&&rg(x.normalMap.format),metalnessMap:ae,roughnessMap:Ae,anisotropy:Re,anisotropyMap:Pt,clearcoat:O,clearcoatMap:A,clearcoatNormalMap:M,clearcoatRoughnessMap:G,diffuseRoughness:me,diffuseRoughnessMap:et,dispersion:Kt,retroreflection:ie,iridescence:it,iridescenceMap:j,iridescenceThicknessMap:ot,sheen:re,sheenColorMap:rt,sheenRoughnessMap:Y,specularMap:K,specularColorMap:lt,specularIntensityMap:L,transmission:At,transmissionMap:Q,thicknessMap:q,gradientMap:ut,opaque:x.transparent===!1&&x.blending===fs&&x.alphaToCoverage===!1,alphaMap:st,alphaTest:ht,alphaHash:Ct,combine:x.combine,mapUv:ct&&f(x.map.channel),aoMapUv:be&&f(x.aoMap.channel),lightMapUv:le&&f(x.lightMap.channel),bumpMapUv:ve&&f(x.bumpMap.channel),normalMapUv:se&&f(x.normalMap.channel),displacementMapUv:Gt&&f(x.displacementMap.channel),emissiveMapUv:Qt&&f(x.emissiveMap.channel),metalnessMapUv:ae&&f(x.metalnessMap.channel),roughnessMapUv:Ae&&f(x.roughnessMap.channel),anisotropyMapUv:Pt&&f(x.anisotropyMap.channel),clearcoatMapUv:A&&f(x.clearcoatMap.channel),clearcoatNormalMapUv:M&&f(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:G&&f(x.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:et&&f(x.diffuseRoughnessMap.channel),iridescenceMapUv:j&&f(x.iridescenceMap.channel),iridescenceThicknessMapUv:ot&&f(x.iridescenceThicknessMap.channel),sheenColorMapUv:rt&&f(x.sheenColorMap.channel),sheenRoughnessMapUv:Y&&f(x.sheenRoughnessMap.channel),specularMapUv:K&&f(x.specularMap.channel),specularColorMapUv:lt&&f(x.specularColorMap.channel),specularIntensityMapUv:L&&f(x.specularIntensityMap.channel),transmissionMapUv:Q&&f(x.transmissionMap.channel),thicknessMapUv:q&&f(x.thicknessMap.channel),alphaMapUv:st&&f(x.alphaMap.channel),vertexTangents:!!P.attributes.tangent&&(se||Re),vertexNormals:!!P.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!P.attributes.color&&P.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!P.attributes.uv&&(ct||st),fog:!!F,useFog:x.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||P.attributes.normal===void 0&&se===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:mt,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:P.attributes.position!==void 0,morphTargets:P.morphAttributes.position!==void 0,morphNormals:P.morphAttributes.normal!==void 0,morphColors:P.morphAttributes.color!==void 0,morphTargetsCount:tt,morphTextureStride:St,numSunLights:S.sun.length,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numSunLightShadows:S.sunShadowMap.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numLightProbeGrids:I.filter(gt=>gt.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:s.shadowMap.enabled&&C.length>0,shadowMapType:s.shadowMap.type,toneMapping:nt,decodeVideoTexture:ct&&x.map.isVideoTexture===!0&&ee.getTransfer(x.map.colorSpace)===de,decodeVideoTextureEmissive:Qt&&x.emissiveMap.isVideoTexture===!0&&ee.getTransfer(x.emissiveMap.colorSpace)===de,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===gi,flipSided:x.side===Xe,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:$t&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:($t&&x.extensions.multiDraw===!0||Ee)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Yt.vertexUv1s=c.has(1),Yt.vertexUv2s=c.has(2),Yt.vertexUv3s=c.has(3),c.clear(),Yt}function _(x){let S=[];if(x.shaderID?S.push(x.shaderID):(S.push(x.customVertexShaderID),S.push(x.customFragmentShaderID)),x.defines!==void 0)for(let C in x.defines)S.push(C),S.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(m(S,x),p(S,x),S.push(s.outputColorSpace)),S.push(x.customProgramCacheKey),S.join()}function m(x,S){x.push(S.precision),x.push(S.outputColorSpace),x.push(S.envMapMode),x.push(S.envMapPMREM),x.push(S.envMapMaxLod),x.push(S.envMapSize),x.push(S.mapUv),x.push(S.alphaMapUv),x.push(S.lightMapUv),x.push(S.aoMapUv),x.push(S.bumpMapUv),x.push(S.normalMapUv),x.push(S.displacementMapUv),x.push(S.emissiveMapUv),x.push(S.metalnessMapUv),x.push(S.roughnessMapUv),x.push(S.anisotropyMapUv),x.push(S.clearcoatMapUv),x.push(S.clearcoatNormalMapUv),x.push(S.clearcoatRoughnessMapUv),x.push(S.diffuseRoughnessMapUv),x.push(S.iridescenceMapUv),x.push(S.iridescenceThicknessMapUv),x.push(S.sheenColorMapUv),x.push(S.sheenRoughnessMapUv),x.push(S.specularMapUv),x.push(S.specularColorMapUv),x.push(S.specularIntensityMapUv),x.push(S.transmissionMapUv),x.push(S.thicknessMapUv),x.push(S.combine),x.push(S.fogExp2),x.push(S.sizeAttenuation),x.push(S.morphTargetsCount),x.push(S.numSunLights),x.push(S.numDirLights),x.push(S.numPointLights),x.push(S.numSpotLights),x.push(S.numSpotLightMaps),x.push(S.numHemiLights),x.push(S.numRectAreaLights),x.push(S.numSunLightShadows),x.push(S.numDirLightShadows),x.push(S.numPointLightShadows),x.push(S.numSpotLightShadows),x.push(S.numSpotLightShadowsWithMaps),x.push(S.numLightProbes),x.push(S.numLightProbeGrids),x.push(S.shadowMapType),x.push(S.toneMapping),x.push(S.numClippingPlanes),x.push(S.numClipIntersection),x.push(S.depthPacking)}function p(x,S){a.disableAll(),S.instancing&&a.enable(0),S.instancingColor&&a.enable(1),S.instancingMorph&&a.enable(2),S.matcap&&a.enable(3),S.envMap&&a.enable(4),S.normalMapObjectSpace&&a.enable(5),S.normalMapTangentSpace&&a.enable(6),S.clearcoat&&a.enable(7),S.iridescence&&a.enable(8),S.alphaTest&&a.enable(9),S.vertexColors&&a.enable(10),S.vertexAlphas&&a.enable(11),S.vertexUv1s&&a.enable(12),S.vertexUv2s&&a.enable(13),S.vertexUv3s&&a.enable(14),S.vertexTangents&&a.enable(15),S.anisotropy&&a.enable(16),S.alphaHash&&a.enable(17),S.batching&&a.enable(18),S.dispersion&&a.enable(19),S.retroreflection&&a.enable(24),S.diffuseRoughness&&a.enable(25),S.batchingColor&&a.enable(20),S.gradientMap&&a.enable(21),S.packedNormalMap&&a.enable(22),S.vertexNormals&&a.enable(23),x.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),S.numLightProbeGrids>0&&a.enable(22),S.hasPositionAttribute&&a.enable(23),x.push(a.mask)}function y(x){let S=d[x.type],C;if(S){let R=Ui[S];C=Kh.clone(R.uniforms)}else C=x.uniforms;return C}function b(x,S){let C=h.get(S);return C!==void 0?++C.usedTimes:(C=new ng(s,S,x,n),l.push(C),h.set(S,C)),C}function v(x){if(--x.usedTimes===0){let S=l.indexOf(x);l[S]=l[l.length-1],l.pop(),h.delete(x.cacheKey),x.destroy()}}function T(x){o.remove(x)}function E(){o.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:y,acquireProgram:b,releaseProgram:v,releaseShaderCache:T,programs:l,dispose:E}}function og(){let s=new WeakMap;function t(a){return s.has(a)}function e(a){let o=s.get(a);return o===void 0&&(o={},s.set(a,o)),o}function i(a){s.delete(a)}function n(a,o,c){s.get(a)[o]=c}function r(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:r}}function lg(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function gu(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function xu(){let s=[],t=0,e=[],i=[],n=[];function r(){t=0,e.length=0,i.length=0,n.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,g,_,m,p){let y=s[t];return y===void 0?(y={id:d.id,object:d,geometry:f,material:g,materialVariant:a(d),groupOrder:_,renderOrder:d.renderOrder,z:m,group:p},s[t]=y):(y.id=d.id,y.object=d,y.geometry=f,y.material=g,y.materialVariant=a(d),y.groupOrder=_,y.renderOrder=d.renderOrder,y.z=m,y.group=p),t++,y}function c(d,f,g,_,m,p,y){y.reversedDepth===!0&&(m=-m);let b=o(d,f,g,_,m,p);g.transmission>0?i.push(b):g.transparent===!0?n.push(b):e.push(b)}function l(d,f,g,_,m,p){let y=o(d,f,g,_,m,p);g.transmission>0?i.unshift(y):g.transparent===!0?n.unshift(y):e.unshift(y)}function h(d,f){e.length>1&&e.sort(d||lg),i.length>1&&i.sort(f||gu),n.length>1&&n.sort(f||gu)}function u(){for(let d=t,f=s.length;d<f;d++){let g=s[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:i,transparent:n,init:r,push:c,unshift:l,finish:u,sort:h}}function cg(){let s=new WeakMap;function t(i,n){let r=s.get(i),a;return r===void 0?(a=new xu,s.set(i,[a])):n>=r.length?(a=new xu,r.push(a)):a=r[n],a}function e(){s=new WeakMap}return{get:t,dispose:e}}function hg(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new U,color:new vt};break;case"SpotLight":e={position:new U,direction:new U,color:new vt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new U,color:new vt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new U,skyColor:new vt,groundColor:new vt};break;case"RectAreaLight":e={color:new vt,position:new U,halfWidth:new U,halfHeight:new U};break}return s[t.id]=e,e}}}function ug(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Xt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Xt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Xt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var dg=0;function fg(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function pg(s){let t=new hg,e=ug(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new U);let n=new U,r=new Zt,a=new Zt;function o(l){let h=0,u=0,d=0;for(let I=0;I<9;I++)i.probe[I].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,y=0,b=0,v=0,T=0,E=0,x=0,S=0,C=0,R=0;l.sort(fg);for(let I=0,F=l.length;I<F;I++){let P=l[I],B=P.color,z=P.intensity,k=P.distance,J=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===gn?J=P.shadow.map.texture:J=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)h+=B.r*z,u+=B.g*z,d+=B.b*z;else if(P.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(P.sh.coefficients[H],z);R++}else if(P.isSunLight){let H=t.get(P);if(H.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let Z=P.shadow,tt=e.get(P);tt.shadowIntensity=Z.intensity,tt.shadowBias=Z.bias,tt.shadowNormalBias=Z.normalBias,tt.shadowRadius=Z.radius,tt.shadowMapSize.copy(Z.mapSize).multiply(Z.getFrameExtents()),i.sunShadow[g]=tt,i.sunShadowMap[g]=J;let St=Z.getViewportCount();for(let Ft=0;Ft<St;Ft++)i.sunShadowMatrix[_+Ft]=Z.getMatrix(Ft),i.sunShadowCascade[_+Ft]=Z._cascadeData[Ft];_+=St,g++}i.sun[f]=H,f++}else if(P.isDirectionalLight){let H=t.get(P);if(H.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let Z=P.shadow,tt=e.get(P);tt.shadowIntensity=Z.intensity,tt.shadowBias=Z.bias,tt.shadowNormalBias=Z.normalBias,tt.shadowRadius=Z.radius,tt.shadowMapSize=Z.mapSize,i.directionalShadow[m]=tt,i.directionalShadowMap[m]=J,i.directionalShadowMatrix[m]=P.shadow.matrix,T++}i.directional[m]=H,m++}else if(P.isSpotLight){let H=t.get(P);H.position.setFromMatrixPosition(P.matrixWorld),H.color.copy(B).multiplyScalar(z),H.distance=k,H.coneCos=Math.cos(P.angle),H.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),H.decay=P.decay,i.spot[y]=H;let Z=P.shadow;if(P.map&&(i.spotLightMap[S]=P.map,S++,Z.updateMatrices(P),P.castShadow&&C++),i.spotLightMatrix[y]=Z.matrix,P.castShadow){let tt=e.get(P);tt.shadowIntensity=Z.intensity,tt.shadowBias=Z.bias,tt.shadowNormalBias=Z.normalBias,tt.shadowRadius=Z.radius,tt.shadowMapSize=Z.mapSize,i.spotShadow[y]=tt,i.spotShadowMap[y]=J,x++}y++}else if(P.isRectAreaLight){let H=t.get(P);H.color.copy(B).multiplyScalar(z),H.halfWidth.set(P.width*.5,0,0),H.halfHeight.set(0,P.height*.5,0),i.rectArea[b]=H,b++}else if(P.isPointLight){let H=t.get(P);if(H.color.copy(P.color).multiplyScalar(P.intensity),H.distance=P.distance,H.decay=P.decay,P.castShadow){let Z=P.shadow,tt=e.get(P);tt.shadowIntensity=Z.intensity,tt.shadowBias=Z.bias,tt.shadowNormalBias=Z.normalBias,tt.shadowRadius=Z.radius,tt.shadowMapSize=Z.mapSize,tt.shadowCameraNear=Z.camera.near,tt.shadowCameraFar=Z.camera.far,i.pointShadow[p]=tt,i.pointShadowMap[p]=J,i.pointShadowMatrix[p]=P.shadow.matrix,E++}i.point[p]=H,p++}else if(P.isHemisphereLight){let H=t.get(P);H.skyColor.copy(P.color).multiplyScalar(z),H.groundColor.copy(P.groundColor).multiplyScalar(z),i.hemi[v]=H,v++}}b>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=xt.LTC_FLOAT_1,i.rectAreaLTC2=xt.LTC_FLOAT_2):(i.rectAreaLTC1=xt.LTC_HALF_1,i.rectAreaLTC2=xt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let D=i.hash;(D.sunLength!==f||D.directionalLength!==m||D.pointLength!==p||D.spotLength!==y||D.rectAreaLength!==b||D.hemiLength!==v||D.numSunShadows!==g||D.numDirectionalShadows!==T||D.numPointShadows!==E||D.numSpotShadows!==x||D.numSpotMaps!==S||D.numLightProbes!==R)&&(i.sun.length=f,i.directional.length=m,i.spot.length=y,i.rectArea.length=b,i.point.length=p,i.hemi.length=v,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.directionalShadowMatrix.length=T,i.pointShadow.length=E,i.pointShadowMap.length=E,i.pointShadowMatrix.length=E,i.spotShadow.length=x,i.spotShadowMap.length=x,i.spotLightMatrix.length=x+S-C,i.spotLightMap.length=S,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=R,D.sunLength=f,D.directionalLength=m,D.pointLength=p,D.spotLength=y,D.rectAreaLength=b,D.hemiLength=v,D.numSunShadows=g,D.numDirectionalShadows=T,D.numPointShadows=E,D.numSpotShadows=x,D.numSpotMaps=S,D.numLightProbes=R,i.version=dg++)}function c(l,h){let u=0,d=0,f=0,g=0,_=0,m=0,p=h.matrixWorldInverse;for(let y=0,b=l.length;y<b;y++){let v=l[y];if(v.isSunLight){let T=i.sun[u];T.direction.setFromMatrixPosition(v.matrixWorld),T.direction.transformDirection(p),u++}else if(v.isDirectionalLight){let T=i.directional[d];T.direction.setFromMatrixPosition(v.matrixWorld),n.setFromMatrixPosition(v.target.matrixWorld),T.direction.sub(n),T.direction.transformDirection(p),d++}else if(v.isSpotLight){let T=i.spot[g];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(p),T.direction.setFromMatrixPosition(v.matrixWorld),n.setFromMatrixPosition(v.target.matrixWorld),T.direction.sub(n),T.direction.transformDirection(p),g++}else if(v.isRectAreaLight){let T=i.rectArea[_];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(p),a.identity(),r.copy(v.matrixWorld),r.premultiply(p),a.extractRotation(r),T.halfWidth.set(v.width*.5,0,0),T.halfHeight.set(0,v.height*.5,0),T.halfWidth.applyMatrix4(a),T.halfHeight.applyMatrix4(a),_++}else if(v.isPointLight){let T=i.point[f];T.position.setFromMatrixPosition(v.matrixWorld),T.position.applyMatrix4(p),f++}else if(v.isHemisphereLight){let T=i.hemi[m];T.direction.setFromMatrixPosition(v.matrixWorld),T.direction.transformDirection(p),m++}}}return{setup:o,setupView:c,state:i}}function _u(s){let t=new pg(s),e=[],i=[],n=[];function r(u){h.camera=u,e.length=0,i.length=0,n.length=0}function a(u){u.isLightProbeGrid?n.push(u):e.push(u)}function o(u){i.push(u)}function c(){t.setup(e),n.sort((u,d)=>u.priority-d.priority||u.id-d.id)}function l(u){t.setupView(e,u)}let h={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:h,setupLights:c,setupLightsView:l,pushLight:a,pushShadow:o}}function mg(s){let t=new WeakMap;function e(n,r=0){let a=t.get(n),o;return a===void 0?(o=new _u(s),t.set(n,[o])):r>=a.length?(o=new _u(s),a.push(o)):o=a[r],o}function i(){t=new WeakMap}return{get:e,dispose:i}}var gg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xg=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,_g=[new U(1,0,0),new U(-1,0,0),new U(0,1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1)],yg=[new U(0,-1,0),new U(0,-1,0),new U(0,0,1),new U(0,0,-1),new U(0,-1,0),new U(0,-1,0)],yu=new Zt,xr=new U,$l=new U;function vg(s,t,e){let i=new on,n=new Xt,r=new Xt,a=new pe,o=new Ma,c=new Sa,l={},h=e.maxTextureSize,u={[mn]:Xe,[Xe]:mn,[gi]:gi},d=new hi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Xt},radius:{value:4}},vertexShader:gg,fragmentShader:xg}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new je;g.setAttribute("position",new ri(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new ce(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=or;let p=this.type;this.render=function(E,x,S){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===dh&&(Lt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=or);let C=s.getRenderTarget(),R=s.getActiveCubeFace(),D=s.getActiveMipmapLevel(),I=s.state;I.setBlending(In),I.buffers.depth.getReversed()===!0?I.buffers.color.setClear(0,0,0,0):I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);let F=p!==this.type;F&&x.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(B=>B.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,B=E.length;P<B;P++){let z=E[P],k=z.shadow;if(k===void 0){Lt("WebGLShadowMap:",z,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;n.copy(k.mapSize);let J=k.getFrameExtents();n.multiply(J),r.copy(k.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/J.x),n.x=r.x*J.x,k.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/J.y),n.y=r.y*J.y,k.mapSize.y=r.y));let H=s.state.buffers.depth.getReversed();if(k.camera._reversedDepth=H,k.map===null||F===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===ds){if(z.isPointLight){Lt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new Qe(n.x,n.y,{format:gn,type:Ai,minFilter:ii,magFilter:ii,generateMipmaps:!1}),k.map.texture.name=z.name+".shadowMap",k.map.depthTexture=new qi(n.x,n.y,di),k.map.depthTexture.name=z.name+".shadowMapDepth",k.map.depthTexture.format=Wi,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=He,k.map.depthTexture.magFilter=He}else z.isPointLight?(k.map=new yr(n.x),k.map.depthTexture=new $s(n.x,Ei)):(k.map=new Qe(n.x,n.y),k.map.depthTexture=new qi(n.x,n.y,Ei)),k.map.depthTexture.name=z.name+".shadowMap",k.map.depthTexture.format=Wi,this.type===or?(k.map.depthTexture.compareFunction=H?Bl:Ol,k.map.depthTexture.minFilter=ii,k.map.depthTexture.magFilter=ii):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=He,k.map.depthTexture.magFilter=He);k.camera.updateProjectionMatrix()}k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==n.x||k.map.height!==n.y)&&k.map.setSize(n.x,n.y);let Z=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();z.isPointLight!==!0&&k.updateMatrices(z,S);let tt=(k.camera.layers.mask&4294967294)!==0?k.camera.layers:S.layers;for(let St=0;St<Z;St++){let Ft=k.getCamera(St);if(z.isPointLight){let $=k.camera,pt=k.matrix,yt=z.distance||$.far;yt!==$.far&&($.far=yt,$.updateProjectionMatrix()),xr.setFromMatrixPosition(z.matrixWorld),$.position.copy(xr),$l.copy($.position),$l.add(_g[St]),$.up.copy(yg[St]),$.lookAt($l),$.updateMatrixWorld(),pt.makeTranslation(-xr.x,-xr.y,-xr.z),yu.multiplyMatrices($.projectionMatrix,$.matrixWorldInverse),k._frustum.setFromProjectionMatrix(yu,$.coordinateSystem,$.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)s.setRenderTarget(k.map,St),s.clear();else{St===0&&(s.setRenderTarget(k.map),s.clear());let $=k.getViewport(St);a.set(r.x*$.x,r.y*$.y,r.x*$.z,r.y*$.w),I.viewport(a)}i=k.getFrustum(St),v(x,S,Ft,z,tt,this.type)}k.isPointLightShadow!==!0&&this.type===ds&&y(k,S),k.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(C,R,D)};function y(E,x){let S=t.update(_);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new Qe(n.x,n.y,{format:gn,type:Ai}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,s.setRenderTarget(E.mapPass),s.clear(),s.renderBufferDirect(x,null,S,d,_,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,s.setRenderTarget(E.map),s.clear(),s.renderBufferDirect(x,null,S,f,_,null)}function b(E,x,S,C){let R=null,D=S.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(D!==void 0)R=D;else if(R=S.isPointLight===!0?c:o,s.localClippingEnabled&&x.clipShadows===!0&&Array.isArray(x.clippingPlanes)&&x.clippingPlanes.length!==0||x.displacementMap&&x.displacementScale!==0||x.alphaMap&&x.alphaTest>0||x.map&&x.alphaTest>0||x.alphaToCoverage===!0){let I=R.uuid,F=x.uuid,P=l[I];P===void 0&&(P={},l[I]=P);let B=P[F];B===void 0&&(B=R.clone(),P[F]=B,x.addEventListener("dispose",T)),R=B}if(R.visible=x.visible,R.wireframe=x.wireframe,C===ds?R.side=x.shadowSide!==null?x.shadowSide:x.side:R.side=x.shadowSide!==null?x.shadowSide:u[x.side],R.alphaMap=x.alphaMap,R.alphaTest=x.alphaToCoverage===!0?.5:x.alphaTest,R.map=x.map,R.clipShadows=x.clipShadows,R.clippingPlanes=x.clippingPlanes,R.clipIntersection=x.clipIntersection,R.displacementMap=x.displacementMap,R.displacementScale=x.displacementScale,R.displacementBias=x.displacementBias,R.wireframeLinewidth=x.wireframeLinewidth,R.linewidth=x.linewidth,S.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let I=s.properties.get(R);I.light=S}return R}function v(E,x,S,C,R,D){if(E.visible===!1)return;if(E.layers.test(R)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&D===ds)&&(!E.frustumCulled||E.intersectsFrustum(i))){E.modelViewMatrix.multiplyMatrices(S.matrixWorldInverse,E.matrixWorld);let P=t.update(E),B=E.material;if(Array.isArray(B)){let z=P.groups;for(let k=0,J=z.length;k<J;k++){let H=z[k],Z=B[H.materialIndex];if(Z&&Z.visible){let tt=b(E,Z,C,D);E.onBeforeShadow(s,E,x,S,P,tt,H),s.renderBufferDirect(S,null,P,tt,E,H),E.onAfterShadow(s,E,x,S,P,tt,H)}}}else if(B.visible){let z=b(E,B,C,D);E.onBeforeShadow(s,E,x,S,P,z,null),s.renderBufferDirect(S,null,P,z,E,null),E.onAfterShadow(s,E,x,S,P,z,null)}}let F=E.children;for(let P=0,B=F.length;P<B;P++)v(F[P],x,S,C,R,D)}function T(E){E.target.removeEventListener("dispose",T);for(let S in l){let C=l[S],R=E.target.uuid;R in C&&(C[R].dispose(),delete C[R])}}}function Mg(s,t){function e(){let L=!1,Q=new pe,q=null,ut=new pe(0,0,0,0);return{setMask:function(st){q!==st&&!L&&(s.colorMask(st,st,st,st),q=st)},setLocked:function(st){L=st},setClear:function(st,ht,Ct,$t,nt){nt===!0&&(st*=$t,ht*=$t,Ct*=$t),Q.set(st,ht,Ct,$t),ut.equals(Q)===!1&&(s.clearColor(st,ht,Ct,$t),ut.copy(Q))},reset:function(){L=!1,q=null,ut.set(-1,0,0,0)}}}function i(){let L=!1,Q=!1,q=null,ut=null,st=null;return{setReversed:function(ht){if(Q!==ht){let Ct=t.get("EXT_clip_control");ht?Ct.clipControlEXT(Ct.LOWER_LEFT_EXT,Ct.ZERO_TO_ONE_EXT):Ct.clipControlEXT(Ct.LOWER_LEFT_EXT,Ct.NEGATIVE_ONE_TO_ONE_EXT),Q=ht;let $t=st;st=null,this.setClear($t)}},getReversed:function(){return Q},setTest:function(ht){ht?mt(s.DEPTH_TEST):Ht(s.DEPTH_TEST)},setMask:function(ht){q!==ht&&!L&&(s.depthMask(ht),q=ht)},setFunc:function(ht){if(Q&&(ht=Yh[ht]),ut!==ht){switch(ht){case ea:s.depthFunc(s.NEVER);break;case ia:s.depthFunc(s.ALWAYS);break;case na:s.depthFunc(s.LESS);break;case ts:s.depthFunc(s.LEQUAL);break;case sa:s.depthFunc(s.EQUAL);break;case ra:s.depthFunc(s.GEQUAL);break;case aa:s.depthFunc(s.GREATER);break;case oa:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ut=ht}},setLocked:function(ht){L=ht},setClear:function(ht){st!==ht&&(st=ht,Q&&(ht=1-ht),s.clearDepth(ht))},reset:function(){L=!1,q=null,ut=null,st=null,Q=!1}}}function n(){let L=!1,Q=null,q=null,ut=null,st=null,ht=null,Ct=null,$t=null,nt=null;return{setTest:function(Dt){L||(Dt?mt(s.STENCIL_TEST):Ht(s.STENCIL_TEST))},setMask:function(Dt){Q!==Dt&&!L&&(s.stencilMask(Dt),Q=Dt)},setFunc:function(Dt,Yt,gt){(q!==Dt||ut!==Yt||st!==gt)&&(s.stencilFunc(Dt,Yt,gt),q=Dt,ut=Yt,st=gt)},setOp:function(Dt,Yt,gt){(ht!==Dt||Ct!==Yt||$t!==gt)&&(s.stencilOp(Dt,Yt,gt),ht=Dt,Ct=Yt,$t=gt)},setLocked:function(Dt){L=Dt},setClear:function(Dt){nt!==Dt&&(s.clearStencil(Dt),nt=Dt)},reset:function(){L=!1,Q=null,q=null,ut=null,st=null,ht=null,Ct=null,$t=null,nt=null}}}let r=new e,a=new i,o=new n,c={},l=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],_=null,m=!1,p=null,y=null,b=null,v=null,T=null,E=null,x=null,S=new vt(0,0,0),C=0,R=!1,D=null,I=null,F=null,P=null,B=null,z=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,J=0,H=s.getParameter(s.VERSION);H.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(H)[1]),k=J>=1):H.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),k=J>=2);let Z=null,tt={},St=s.getParameter(s.SCISSOR_BOX),Ft=s.getParameter(s.VIEWPORT),$=new pe().fromArray(St),pt=new pe().fromArray(Ft);function yt(L,Q,q,ut){let st=new Uint8Array(4),ht=s.createTexture();s.bindTexture(L,ht),s.texParameteri(L,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(L,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ct=0;Ct<q;Ct++)L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY?s.texImage3D(Q,0,s.RGBA,1,1,ut,0,s.RGBA,s.UNSIGNED_BYTE,st):s.texImage2D(Q+Ct,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,st);return ht}let It={};It[s.TEXTURE_2D]=yt(s.TEXTURE_2D,s.TEXTURE_2D,1),It[s.TEXTURE_CUBE_MAP]=yt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),It[s.TEXTURE_2D_ARRAY]=yt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),It[s.TEXTURE_3D]=yt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),mt(s.DEPTH_TEST),a.setFunc(ts),ve(!1),se(_l),mt(s.CULL_FACE),be(In);function mt(L){h[L]!==!0&&(s.enable(L),h[L]=!0)}function Ht(L){h[L]!==!1&&(s.disable(L),h[L]=!1)}function Ee(L,Q){return d[L]!==Q?(s.bindFramebuffer(L,Q),d[L]=Q,L===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=Q),L===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=Q),!0):!1}function ct(L,Q){let q=g,ut=!1;if(L){q=f.get(Q),q===void 0&&(q=[],f.set(Q,q));let st=L.textures;if(q.length!==st.length||q[0]!==s.COLOR_ATTACHMENT0){for(let ht=0,Ct=st.length;ht<Ct;ht++)q[ht]=s.COLOR_ATTACHMENT0+ht;q.length=st.length,ut=!0}}else q[0]!==s.BACK&&(q[0]=s.BACK,ut=!0);ut&&s.drawBuffers(q)}function at(L){return _!==L?(s.useProgram(L),_=L,!0):!1}let Ut={[Ln]:s.FUNC_ADD,[ph]:s.FUNC_SUBTRACT,[mh]:s.FUNC_REVERSE_SUBTRACT};Ut[gh]=s.MIN,Ut[xh]=s.MAX;let Wt={[_h]:s.ZERO,[yh]:s.ONE,[vh]:s.SRC_COLOR,[Sl]:s.SRC_ALPHA,[Eh]:s.SRC_ALPHA_SATURATE,[wh]:s.DST_COLOR,[Sh]:s.DST_ALPHA,[Mh]:s.ONE_MINUS_SRC_COLOR,[bl]:s.ONE_MINUS_SRC_ALPHA,[Th]:s.ONE_MINUS_DST_COLOR,[bh]:s.ONE_MINUS_DST_ALPHA,[Ah]:s.CONSTANT_COLOR,[Rh]:s.ONE_MINUS_CONSTANT_COLOR,[Ch]:s.CONSTANT_ALPHA,[Ph]:s.ONE_MINUS_CONSTANT_ALPHA};function be(L,Q,q,ut,st,ht,Ct,$t,nt,Dt){if(L===In){m===!0&&(Ht(s.BLEND),m=!1);return}if(m===!1&&(mt(s.BLEND),m=!0),L!==fh){if(L!==p||Dt!==R){if((y!==Ln||T!==Ln)&&(s.blendEquation(s.FUNC_ADD),y=Ln,T=Ln),Dt)switch(L){case fs:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case yl:s.blendFunc(s.ONE,s.ONE);break;case vl:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Ml:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:kt("WebGLState: Invalid blending: ",L);break}else switch(L){case fs:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case yl:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case vl:kt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ml:kt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:kt("WebGLState: Invalid blending: ",L);break}b=null,v=null,E=null,x=null,S.set(0,0,0),C=0,p=L,R=Dt}return}st=st||Q,ht=ht||q,Ct=Ct||ut,(Q!==y||st!==T)&&(s.blendEquationSeparate(Ut[Q],Ut[st]),y=Q,T=st),(q!==b||ut!==v||ht!==E||Ct!==x)&&(s.blendFuncSeparate(Wt[q],Wt[ut],Wt[ht],Wt[Ct]),b=q,v=ut,E=ht,x=Ct),($t.equals(S)===!1||nt!==C)&&(s.blendColor($t.r,$t.g,$t.b,nt),S.copy($t),C=nt),p=L,R=!1}function le(L,Q){L.side===gi?Ht(s.CULL_FACE):mt(s.CULL_FACE);let q=L.side===Xe;Q&&(q=!q),ve(q),L.blending===fs&&L.transparent===!1?be(In):be(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),r.setMask(L.colorWrite);let ut=L.stencilWrite;o.setTest(ut),ut&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),Qt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?mt(s.SAMPLE_ALPHA_TO_COVERAGE):Ht(s.SAMPLE_ALPHA_TO_COVERAGE)}function ve(L){D!==L&&(L?s.frontFace(s.CW):s.frontFace(s.CCW),D=L)}function se(L){L!==hh?(mt(s.CULL_FACE),L!==I&&(L===_l?s.cullFace(s.BACK):L===uh?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Ht(s.CULL_FACE),I=L}function Gt(L){L!==F&&(k&&s.lineWidth(L),F=L)}function Qt(L,Q,q){L?(mt(s.POLYGON_OFFSET_FILL),(P!==Q||B!==q)&&(P=Q,B=q,a.getReversed()&&(Q=-Q,q=-q),s.polygonOffset(Q,q))):Ht(s.POLYGON_OFFSET_FILL)}function ae(L){L?mt(s.SCISSOR_TEST):Ht(s.SCISSOR_TEST)}function Ae(L){L===void 0&&(L=s.TEXTURE0+z-1),Z!==L&&(s.activeTexture(L),Z=L)}function Re(L,Q,q){q===void 0&&(Z===null?q=s.TEXTURE0+z-1:q=Z);let ut=tt[q];ut===void 0&&(ut={type:void 0,texture:void 0},tt[q]=ut),(ut.type!==L||ut.texture!==Q)&&(Z!==q&&(s.activeTexture(q),Z=q),s.bindTexture(L,Q||It[L]),ut.type=L,ut.texture=Q)}function O(){let L=tt[Z];L!==void 0&&L.type!==void 0&&(s.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function me(){try{s.compressedTexImage2D(...arguments)}catch(L){kt("WebGLState:",L)}}function Kt(){try{s.compressedTexImage3D(...arguments)}catch(L){kt("WebGLState:",L)}}function ie(){try{s.texSubImage2D(...arguments)}catch(L){kt("WebGLState:",L)}}function it(){try{s.texSubImage3D(...arguments)}catch(L){kt("WebGLState:",L)}}function re(){try{s.compressedTexSubImage2D(...arguments)}catch(L){kt("WebGLState:",L)}}function At(){try{s.compressedTexSubImage3D(...arguments)}catch(L){kt("WebGLState:",L)}}function Pt(){try{s.texStorage2D(...arguments)}catch(L){kt("WebGLState:",L)}}function A(){try{s.texStorage3D(...arguments)}catch(L){kt("WebGLState:",L)}}function M(){try{s.texImage2D(...arguments)}catch(L){kt("WebGLState:",L)}}function G(){try{s.texImage3D(...arguments)}catch(L){kt("WebGLState:",L)}}function et(L){return u[L]!==void 0?u[L]:s.getParameter(L)}function j(L,Q){u[L]!==Q&&(s.pixelStorei(L,Q),u[L]=Q)}function ot(L){$.equals(L)===!1&&(s.scissor(L.x,L.y,L.z,L.w),$.copy(L))}function rt(L){pt.equals(L)===!1&&(s.viewport(L.x,L.y,L.z,L.w),pt.copy(L))}function Y(L,Q){let q=l.get(Q);q===void 0&&(q=new WeakMap,l.set(Q,q));let ut=q.get(L);ut===void 0&&(ut=s.getUniformBlockIndex(Q,L.name),s.uniformBlockBinding(Q,ut,ut),q.set(L,ut))}function K(L,Q,q){let st=l.get(Q).get(L);c[st]!==q&&(s.bindBufferBase(s.UNIFORM_BUFFER,st,q),c[st]=q)}function lt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),a.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},u={},Z=null,tt={},d={},c={},f=new WeakMap,g=[],_=null,m=!1,p=null,y=null,b=null,v=null,T=null,E=null,x=null,S=new vt(0,0,0),C=0,R=!1,D=null,I=null,F=null,P=null,B=null,$.set(0,0,s.canvas.width,s.canvas.height),pt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:mt,disable:Ht,bindFramebuffer:Ee,drawBuffers:ct,useProgram:at,setBlending:be,setMaterial:le,setFlipSided:ve,setCullFace:se,setLineWidth:Gt,setPolygonOffset:Qt,setScissorTest:ae,activeTexture:Ae,bindTexture:Re,unbindTexture:O,compressedTexImage2D:me,compressedTexImage3D:Kt,texImage2D:M,texImage3D:G,pixelStorei:j,getParameter:et,updateUBOMapping:Y,uniformBlockBinding:K,texStorage2D:Pt,texStorage3D:A,texSubImage2D:ie,texSubImage3D:it,compressedTexSubImage2D:re,compressedTexSubImage3D:At,scissor:ot,viewport:rt,reset:lt}}function Sg(s,t,e,i,n,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Xt,h=new WeakMap,u=new Set,d,f=new WeakMap,g=new Set,_=new FinalizationRegistry(A=>g.delete(A)),m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function p(A,M){return m?new OffscreenCanvas(A,M):Hs("canvas")}function y(A,M,G){let et=1,j=Pt(A);if((j.width>G||j.height>G)&&(et=G/Math.max(j.width,j.height)),et<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let ot=Math.floor(et*j.width),rt=Math.floor(et*j.height);d===void 0&&(d=p(ot,rt));let Y=M?p(ot,rt):d;return Y.width=ot,Y.height=rt,Y.getContext("2d").drawImage(A,0,0,ot,rt),Lt("WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+ot+"x"+rt+")."),Y}else return"data"in A&&Lt("WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),A;return A}function b(A){return A.generateMipmaps}function v(A){s.generateMipmap(A)}function T(A){return A.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?s.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function E(A,M,G,et,j,ot=!1){if(A!==null){if(s[A]!==void 0)return s[A];Lt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let rt;et&&(rt=t.get("EXT_texture_norm16"),rt||Lt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=M;if(M===s.RED&&(G===s.FLOAT&&(Y=s.R32F),G===s.HALF_FLOAT&&(Y=s.R16F),G===s.UNSIGNED_BYTE&&(Y=s.R8),G===s.UNSIGNED_SHORT&&rt&&(Y=rt.R16_EXT),G===s.SHORT&&rt&&(Y=rt.R16_SNORM_EXT)),M===s.RED_INTEGER&&(G===s.UNSIGNED_BYTE&&(Y=s.R8UI),G===s.UNSIGNED_SHORT&&(Y=s.R16UI),G===s.UNSIGNED_INT&&(Y=s.R32UI),G===s.BYTE&&(Y=s.R8I),G===s.SHORT&&(Y=s.R16I),G===s.INT&&(Y=s.R32I)),M===s.RG&&(G===s.FLOAT&&(Y=s.RG32F),G===s.HALF_FLOAT&&(Y=s.RG16F),G===s.UNSIGNED_BYTE&&(Y=s.RG8),G===s.UNSIGNED_SHORT&&rt&&(Y=rt.RG16_EXT),G===s.SHORT&&rt&&(Y=rt.RG16_SNORM_EXT)),M===s.RG_INTEGER&&(G===s.UNSIGNED_BYTE&&(Y=s.RG8UI),G===s.UNSIGNED_SHORT&&(Y=s.RG16UI),G===s.UNSIGNED_INT&&(Y=s.RG32UI),G===s.BYTE&&(Y=s.RG8I),G===s.SHORT&&(Y=s.RG16I),G===s.INT&&(Y=s.RG32I)),M===s.RGB_INTEGER&&(G===s.UNSIGNED_BYTE&&(Y=s.RGB8UI),G===s.UNSIGNED_SHORT&&(Y=s.RGB16UI),G===s.UNSIGNED_INT&&(Y=s.RGB32UI),G===s.BYTE&&(Y=s.RGB8I),G===s.SHORT&&(Y=s.RGB16I),G===s.INT&&(Y=s.RGB32I)),M===s.RGBA_INTEGER&&(G===s.UNSIGNED_BYTE&&(Y=s.RGBA8UI),G===s.UNSIGNED_SHORT&&(Y=s.RGBA16UI),G===s.UNSIGNED_INT&&(Y=s.RGBA32UI),G===s.BYTE&&(Y=s.RGBA8I),G===s.SHORT&&(Y=s.RGBA16I),G===s.INT&&(Y=s.RGBA32I)),M===s.RGB&&(G===s.UNSIGNED_SHORT&&rt&&(Y=rt.RGB16_EXT),G===s.SHORT&&rt&&(Y=rt.RGB16_SNORM_EXT),G===s.UNSIGNED_INT_5_9_9_9_REV&&(Y=s.RGB9_E5),G===s.UNSIGNED_INT_10F_11F_11F_REV&&(Y=s.R11F_G11F_B10F)),M===s.RGBA){let K=ot?zs:ee.getTransfer(j);G===s.FLOAT&&(Y=s.RGBA32F),G===s.HALF_FLOAT&&(Y=s.RGBA16F),G===s.UNSIGNED_BYTE&&(Y=K===de?s.SRGB8_ALPHA8:s.RGBA8),G===s.UNSIGNED_SHORT&&rt&&(Y=rt.RGBA16_EXT),G===s.SHORT&&rt&&(Y=rt.RGBA16_SNORM_EXT),G===s.UNSIGNED_SHORT_4_4_4_4&&(Y=s.RGBA4),G===s.UNSIGNED_SHORT_5_5_5_1&&(Y=s.RGB5_A1)}return(Y===s.R16F||Y===s.R32F||Y===s.RG16F||Y===s.RG32F||Y===s.RGBA16F||Y===s.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function x(A,M){let G;return A?M===null||M===Ei||M===Nn?G=s.DEPTH24_STENCIL8:M===di?G=s.DEPTH32F_STENCIL8:M===ms&&(G=s.DEPTH24_STENCIL8,Lt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Ei||M===Nn?G=s.DEPTH_COMPONENT24:M===di?G=s.DEPTH_COMPONENT32F:M===ms&&(G=s.DEPTH_COMPONENT16),G}function S(A,M){return b(A)===!0||A.isFramebufferTexture&&A.minFilter!==He&&A.minFilter!==ii?Math.log2(Math.max(M.width,M.height))+1:A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?M.mipmaps.length:1}function C(A){let M=new WeakRef(A);i.get(A).__ref=M,g.add(M),_.register(A,M,M)}function R(A){let M=i.get(A).__ref;M!==void 0&&(g.delete(M),_.unregister(M))}function D(A){F(A.target)}function I(A){P(A.target)}function F(A){A.removeEventListener("dispose",D),R(A),z(A),A.isVideoTexture&&h.delete(A),A.isHTMLTexture&&u.delete(A)}function P(A){A.removeEventListener("dispose",I),R(A),J(A)}function B(){for(let A of g){let M=A.deref();M!==void 0&&(M.isRenderTarget===!0?P(M):F(M))}g.clear(),u.clear()}function z(A){let M=i.get(A);if(M.__webglInit===void 0)return;let G=A.source,et=f.get(G);if(et){let j=et[M.__cacheKey];j.usedTimes--,j.usedTimes===0&&k(A),Object.keys(et).length===0&&f.delete(G)}i.remove(A)}function k(A){let M=i.get(A);s.deleteTexture(M.__webglTexture);let G=A.source,et=f.get(G);delete et[M.__cacheKey],a.memory.textures--}function J(A){let M=i.get(A);M.__depthDisposeCallback&&M.__depthDisposeCallback();let G=A.depthTexture;if(G&&G.renderTarget===A&&F(G),A.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(M.__webglFramebuffer[j]))for(let ot=0;ot<M.__webglFramebuffer[j].length;ot++)s.deleteFramebuffer(M.__webglFramebuffer[j][ot]);else s.deleteFramebuffer(M.__webglFramebuffer[j]);M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer[j])}else{if(Array.isArray(M.__webglFramebuffer))for(let j=0;j<M.__webglFramebuffer.length;j++)s.deleteFramebuffer(M.__webglFramebuffer[j]);else s.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&s.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let j=0;j<M.__webglColorRenderbuffer.length;j++)M.__webglColorRenderbuffer[j]&&s.deleteRenderbuffer(M.__webglColorRenderbuffer[j]);M.__webglDepthRenderbuffer&&s.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let et=A.textures;for(let j=0,ot=et.length;j<ot;j++){let rt=i.get(et[j]);rt.__webglTexture&&(s.deleteTexture(rt.__webglTexture),a.memory.textures--),i.remove(et[j])}i.remove(A)}let H=0;function Z(){H=0}function tt(){return H}function St(A){H=A}function Ft(){let A=H;return A>=n.maxTextures&&Lt("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+n.maxTextures),H+=1,A}function $(A){let M=[];return M.push(A.wrapS),M.push(A.wrapT),M.push(A.wrapR||0),M.push(A.magFilter),M.push(A.minFilter),M.push(A.anisotropy),M.push(A.internalFormat),M.push(A.format),M.push(A.type),M.push(A.generateMipmaps),M.push(A.mipmapsAutoUpdate),M.push(A.premultiplyAlpha),M.push(A.flipY),M.push(A.unpackAlignment),M.push(A.colorSpace),M.join()}function pt(A,M){let G=i.get(A);if(A.isVideoTexture&&re(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&G.__version!==A.version){let et=A.image;if(et===null)Lt("WebGLRenderer: Texture marked for update but no image data found.");else if(et.complete===!1)Lt("WebGLRenderer: Texture marked for update but image is incomplete");else{le(G,A,M);return}}else A.isExternalTexture&&(G.__webglTexture=A.sourceTexture?A.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,G.__webglTexture,s.TEXTURE0+M)}function yt(A,M){let G=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&G.__version!==A.version){le(G,A,M);return}else A.isExternalTexture&&(G.__webglTexture=A.sourceTexture?A.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,G.__webglTexture,s.TEXTURE0+M)}function It(A,M){let G=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&G.__version!==A.version){le(G,A,M);return}e.bindTexture(s.TEXTURE_3D,G.__webglTexture,s.TEXTURE0+M)}function mt(A,M){let G=i.get(A);if(A.version>0&&G.__version!==A.version){ve(G,A,M);return}e.bindTexture(s.TEXTURE_CUBE_MAP,G.__webglTexture,s.TEXTURE0+M)}let Ht={[la]:s.REPEAT,[Ci]:s.CLAMP_TO_EDGE,[ca]:s.MIRRORED_REPEAT},Ee={[He]:s.NEAREST,[Nh]:s.NEAREST_MIPMAP_NEAREST,[cr]:s.NEAREST_MIPMAP_LINEAR,[ii]:s.LINEAR,[Oa]:s.LINEAR_MIPMAP_NEAREST,[Yi]:s.LINEAR_MIPMAP_LINEAR},ct={[Bh]:s.NEVER,[kl]:s.ALWAYS,[kh]:s.LESS,[Ol]:s.LEQUAL,[zh]:s.EQUAL,[Bl]:s.GEQUAL,[Hh]:s.GREATER,[Gh]:s.NOTEQUAL};function at(A,M){if(M.type===di&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===ii||M.magFilter===Oa||M.magFilter===cr||M.magFilter===Yi||M.minFilter===ii||M.minFilter===Oa||M.minFilter===cr||M.minFilter===Yi)&&Lt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(A,s.TEXTURE_WRAP_S,Ht[M.wrapS]),s.texParameteri(A,s.TEXTURE_WRAP_T,Ht[M.wrapT]),(A===s.TEXTURE_3D||A===s.TEXTURE_2D_ARRAY)&&s.texParameteri(A,s.TEXTURE_WRAP_R,Ht[M.wrapR]),s.texParameteri(A,s.TEXTURE_MAG_FILTER,Ee[M.magFilter]),s.texParameteri(A,s.TEXTURE_MIN_FILTER,Ee[M.minFilter]),M.compareFunction&&(s.texParameteri(A,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(A,s.TEXTURE_COMPARE_FUNC,ct[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===He||M.minFilter!==cr&&M.minFilter!==Yi||M.type===di&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||i.get(M).__currentAnisotropy){let G=t.get("EXT_texture_filter_anisotropic");s.texParameterf(A,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,n.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy}}}function Ut(A,M){let G=!1;A.__webglInit===void 0&&(A.__webglInit=!0,M.addEventListener("dispose",D),C(M));let et=M.source,j=f.get(et);j===void 0&&(j={},f.set(et,j));let ot=$(M);if(ot!==A.__cacheKey){j[ot]===void 0&&(j[ot]={texture:s.createTexture(),usedTimes:0},a.memory.textures++,G=!0),j[ot].usedTimes++;let rt=j[A.__cacheKey];rt!==void 0&&(j[A.__cacheKey].usedTimes--,rt.usedTimes===0&&k(M)),A.__cacheKey=ot,A.__webglTexture=j[ot].texture}return G}function Wt(A,M,G){return Math.floor(Math.floor(A/G)/M)}function be(A,M,G,et){let ot=A.updateRanges;if(ot.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,M.width,M.height,G,et,M.data);else{ot.sort((L,Q)=>L.start-Q.start);let rt=0;for(let L=1;L<ot.length;L++){let Q=ot[rt],q=ot[L],ut=Q.start+Q.count,st=Wt(q.start,M.width,4),ht=Wt(Q.start,M.width,4);q.start<=ut+1&&st===ht&&Wt(q.start+q.count-1,M.width,4)===st?Q.count=Math.max(Q.count,q.start+q.count-Q.start):(++rt,ot[rt]=q)}ot.length=rt+1;let Y=e.getParameter(s.UNPACK_ROW_LENGTH),K=e.getParameter(s.UNPACK_SKIP_PIXELS),lt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,M.width);for(let L=0,Q=ot.length;L<Q;L++){let q=ot[L],ut=Math.floor(q.start/4),st=Math.ceil(q.count/4),ht=ut%M.width,Ct=Math.floor(ut/M.width),$t=st,nt=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,ht),e.pixelStorei(s.UNPACK_SKIP_ROWS,Ct),e.texSubImage2D(s.TEXTURE_2D,0,ht,Ct,$t,nt,G,et,M.data)}A.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,Y),e.pixelStorei(s.UNPACK_SKIP_PIXELS,K),e.pixelStorei(s.UNPACK_SKIP_ROWS,lt)}}function le(A,M,G){let et=s.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(et=s.TEXTURE_2D_ARRAY),M.isData3DTexture&&(et=s.TEXTURE_3D);let j=Ut(A,M),ot=M.source;e.bindTexture(et,A.__webglTexture,s.TEXTURE0+G);let rt=i.get(ot);if(ot.version!==rt.__version||j===!0){if(e.activeTexture(s.TEXTURE0+G),(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)===!1){let nt=ee.getPrimaries(ee.workingColorSpace),Dt=M.colorSpace===$i?null:ee.getPrimaries(M.colorSpace),Yt=M.colorSpace===$i||nt===Dt?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Yt)}e.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment);let K=y(M.image,!1,n.maxTextureSize);K=At(M,K);let lt=r.convert(M.format,M.colorSpace),L=r.convert(M.type),Q=E(M.internalFormat,lt,L,M.normalized,M.colorSpace,M.isVideoTexture);at(et,M);let q,ut=M.mipmaps,st=M.isVideoTexture!==!0,ht=rt.__version===void 0||j===!0,Ct=ot.dataReady,$t=S(M,K);if(M.isDepthTexture)Q=x(M.format===Zi,M.type),ht&&(st?e.texStorage2D(s.TEXTURE_2D,1,Q,K.width,K.height):e.texImage2D(s.TEXTURE_2D,0,Q,K.width,K.height,0,lt,L,null));else if(M.isDataTexture)if(ut.length>0){st&&ht&&e.texStorage2D(s.TEXTURE_2D,$t,Q,ut[0].width,ut[0].height);for(let nt=0,Dt=ut.length;nt<Dt;nt++)q=ut[nt],st?Ct&&e.texSubImage2D(s.TEXTURE_2D,nt,0,0,q.width,q.height,lt,L,q.data):e.texImage2D(s.TEXTURE_2D,nt,Q,q.width,q.height,0,lt,L,q.data);M.generateMipmaps=!1}else st?(ht&&e.texStorage2D(s.TEXTURE_2D,$t,Q,K.width,K.height),Ct&&be(M,K,lt,L)):e.texImage2D(s.TEXTURE_2D,0,Q,K.width,K.height,0,lt,L,K.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){st&&ht&&e.texStorage3D(s.TEXTURE_2D_ARRAY,$t,Q,ut[0].width,ut[0].height,K.depth);for(let nt=0,Dt=ut.length;nt<Dt;nt++)if(q=ut[nt],M.format!==xi)if(lt!==null)if(st){if(Ct)if(M.layerUpdates.size>0){let Yt=Yl(q.width,q.height,M.format,M.type);for(let gt of M.layerUpdates){let fe=q.data.subarray(gt*Yt/q.data.BYTES_PER_ELEMENT,(gt+1)*Yt/q.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,nt,0,0,gt,q.width,q.height,1,lt,fe)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,nt,0,0,0,q.width,q.height,K.depth,lt,q.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,nt,Q,q.width,q.height,K.depth,0,q.data,0,0);else Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else st?Ct&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,nt,0,0,0,q.width,q.height,K.depth,lt,L,q.data):e.texImage3D(s.TEXTURE_2D_ARRAY,nt,Q,q.width,q.height,K.depth,0,lt,L,q.data);M.layerUpdates.size>0&&M.clearLayerUpdates()}else{st&&ht&&e.texStorage2D(s.TEXTURE_2D,$t,Q,ut[0].width,ut[0].height);for(let nt=0,Dt=ut.length;nt<Dt;nt++)q=ut[nt],M.format!==xi?lt!==null?st?Ct&&e.compressedTexSubImage2D(s.TEXTURE_2D,nt,0,0,q.width,q.height,lt,q.data):e.compressedTexImage2D(s.TEXTURE_2D,nt,Q,q.width,q.height,0,q.data):Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):st?Ct&&e.texSubImage2D(s.TEXTURE_2D,nt,0,0,q.width,q.height,lt,L,q.data):e.texImage2D(s.TEXTURE_2D,nt,Q,q.width,q.height,0,lt,L,q.data)}else if(M.isDataArrayTexture)if(st){if(ht&&e.texStorage3D(s.TEXTURE_2D_ARRAY,$t,Q,K.width,K.height,K.depth),Ct)if(M.layerUpdates.size>0){let nt=Yl(K.width,K.height,M.format,M.type);for(let Dt of M.layerUpdates){let Yt=K.data.subarray(Dt*nt/K.data.BYTES_PER_ELEMENT,(Dt+1)*nt/K.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,Dt,K.width,K.height,1,lt,L,Yt)}M.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,lt,L,K.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Q,K.width,K.height,K.depth,0,lt,L,K.data);else if(M.isData3DTexture)st?(ht&&e.texStorage3D(s.TEXTURE_3D,$t,Q,K.width,K.height,K.depth),Ct&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,lt,L,K.data)):e.texImage3D(s.TEXTURE_3D,0,Q,K.width,K.height,K.depth,0,lt,L,K.data);else if(M.isFramebufferTexture){if(ht)if(st)e.texStorage2D(s.TEXTURE_2D,$t,Q,K.width,K.height);else{let nt=K.width,Dt=K.height;for(let Yt=0;Yt<$t;Yt++)e.texImage2D(s.TEXTURE_2D,Yt,Q,nt,Dt,0,lt,L,null),nt>>=1,Dt>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in s){let nt=s.canvas;if(nt.hasAttribute("layoutsubtree")||nt.setAttribute("layoutsubtree","true"),K.parentNode!==nt){nt.appendChild(K),u.add(M),nt.onpaint=Dt=>{let Yt=Dt.changedElements;for(let gt of u)Yt.includes(gt.image)&&(gt.needsUpdate=!0)},nt.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,K);else{let Yt=s.RGBA,gt=s.RGBA,fe=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,Yt,gt,fe,K)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(ut.length>0){if(st&&ht){let nt=Pt(ut[0]);e.texStorage2D(s.TEXTURE_2D,$t,Q,nt.width,nt.height)}for(let nt=0,Dt=ut.length;nt<Dt;nt++)q=ut[nt],st?Ct&&e.texSubImage2D(s.TEXTURE_2D,nt,0,0,lt,L,q):e.texImage2D(s.TEXTURE_2D,nt,Q,lt,L,q);M.generateMipmaps=!1}else if(st){if(ht){let nt=Pt(K);e.texStorage2D(s.TEXTURE_2D,$t,Q,nt.width,nt.height)}Ct&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,lt,L,K)}else e.texImage2D(s.TEXTURE_2D,0,Q,lt,L,K);b(M)&&M.mipmapsAutoUpdate===!0&&v(et),rt.__version=ot.version,M.onUpdate&&M.onUpdate(M)}A.__version=M.version}function ve(A,M,G){if(M.image.length!==6)return;let et=Ut(A,M),j=M.source;e.bindTexture(s.TEXTURE_CUBE_MAP,A.__webglTexture,s.TEXTURE0+G);let ot=i.get(j);if(j.version!==ot.__version||et===!0){e.activeTexture(s.TEXTURE0+G);let rt=ee.getPrimaries(ee.workingColorSpace),Y=M.colorSpace===$i?null:ee.getPrimaries(M.colorSpace),K=M.colorSpace===$i||rt===Y?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,K);let lt=M.isCompressedTexture||M.image[0].isCompressedTexture,L=M.image[0]&&M.image[0].isDataTexture,Q=[];for(let gt=0;gt<6;gt++)!lt&&!L?Q[gt]=y(M.image[gt],!0,n.maxCubemapSize):Q[gt]=L?M.image[gt].image:M.image[gt],Q[gt]=At(M,Q[gt]);let q=Q[0],ut=r.convert(M.format,M.colorSpace),st=r.convert(M.type),ht=E(M.internalFormat,ut,st,M.normalized,M.colorSpace),Ct=M.isVideoTexture!==!0,$t=ot.__version===void 0||et===!0,nt=j.dataReady,Dt=S(M,q);at(s.TEXTURE_CUBE_MAP,M);let Yt;if(M.isDepthTexture){if(ht=x(M.format===Zi,M.type),$t)if(Ct)e.texStorage2D(s.TEXTURE_CUBE_MAP,1,ht,q.width,q.height);else for(let gt=0;gt<6;gt++)e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,ht,q.width,q.height,0,ut,st,null)}else if(lt){Ct&&$t&&e.texStorage2D(s.TEXTURE_CUBE_MAP,Dt,ht,q.width,q.height);for(let gt=0;gt<6;gt++){Yt=Q[gt].mipmaps;for(let fe=0;fe<Yt.length;fe++){let Be=Yt[fe];M.format!==xi?ut!==null?Ct?nt&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,fe,0,0,Be.width,Be.height,ut,Be.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,fe,ht,Be.width,Be.height,0,Be.data):Lt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ct?nt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,fe,0,0,Be.width,Be.height,ut,st,Be.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,fe,ht,Be.width,Be.height,0,ut,st,Be.data)}}}else{if(Yt=M.mipmaps,Ct&&$t){Yt.length>0&&Dt++;let gt=Pt(Q[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,Dt,ht,gt.width,gt.height)}for(let gt=0;gt<6;gt++)if(L){Ct?nt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,0,0,Q[gt].width,Q[gt].height,ut,st,Q[gt].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,ht,Q[gt].width,Q[gt].height,0,ut,st,Q[gt].data);for(let fe=0;fe<Yt.length;fe++){let Qi=Yt[fe].image[gt].image;Ct?nt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,fe+1,0,0,Qi.width,Qi.height,ut,st,Qi.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,fe+1,ht,Qi.width,Qi.height,0,ut,st,Qi.data)}}else{Ct?nt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,0,0,ut,st,Q[gt]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,ht,ut,st,Q[gt]);for(let fe=0;fe<Yt.length;fe++){let Be=Yt[fe];Ct?nt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,fe+1,0,0,ut,st,Be.image[gt]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+gt,fe+1,ht,ut,st,Be.image[gt])}}}b(M)&&M.mipmapsAutoUpdate===!0&&v(s.TEXTURE_CUBE_MAP),ot.__version=j.version,M.onUpdate&&M.onUpdate(M)}A.__version=M.version}function se(A,M,G,et,j,ot){let rt=r.convert(G.format,G.colorSpace),Y=r.convert(G.type),K=E(G.internalFormat,rt,Y,G.normalized,G.colorSpace),lt=i.get(M),L=i.get(G);if(L.__renderTarget=M,!lt.__hasExternalTextures){let Q=Math.max(1,M.width>>ot),q=Math.max(1,M.height>>ot);j===s.TEXTURE_3D||j===s.TEXTURE_2D_ARRAY?e.texImage3D(j,ot,K,Q,q,M.depth,0,rt,Y,null):e.texImage2D(j,ot,K,Q,q,0,rt,Y,null)}e.bindFramebuffer(s.FRAMEBUFFER,A),it(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,et,j,L.__webglTexture,0,ie(M)):(j===s.TEXTURE_2D||j>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,et,j,L.__webglTexture,ot),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Gt(A,M,G){if(s.bindRenderbuffer(s.RENDERBUFFER,A),M.depthBuffer){let et=M.depthTexture,j=et&&et.isDepthTexture?et.type:null,ot=x(M.stencilBuffer,j),rt=M.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;it(M)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ie(M),ot,M.width,M.height):G?s.renderbufferStorageMultisample(s.RENDERBUFFER,ie(M),ot,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,ot,M.width,M.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,rt,s.RENDERBUFFER,A)}else{let et=M.textures;for(let j=0;j<et.length;j++){let ot=et[j],rt=r.convert(ot.format,ot.colorSpace),Y=r.convert(ot.type),K=E(ot.internalFormat,rt,Y,ot.normalized,ot.colorSpace);it(M)?o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ie(M),K,M.width,M.height):G?s.renderbufferStorageMultisample(s.RENDERBUFFER,ie(M),K,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,K,M.width,M.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Qt(A,M,G){let et=M.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,A),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let j=i.get(M.depthTexture);j.__renderTarget=M;let ot=et?M.depthTexture.image[0]:M.depthTexture.image;(!j.__webglTexture||ot.width!==M.width||ot.height!==M.height)&&(ot.width=M.width,ot.height=M.height,M.depthTexture.needsUpdate=!0),et?mt(M.depthTexture,0):pt(M.depthTexture,0);let rt=j.__webglTexture,Y=ie(M),K=et?s.TEXTURE_CUBE_MAP_POSITIVE_X+G:s.TEXTURE_2D,lt=M.depthTexture.format===Zi?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(M.depthTexture.format===Wi)it(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,lt,K,rt,0,Y):s.framebufferTexture2D(s.FRAMEBUFFER,lt,K,rt,0);else if(M.depthTexture.format===Zi)it(M)?o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,lt,K,rt,0,Y):s.framebufferTexture2D(s.FRAMEBUFFER,lt,K,rt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ae(A){let M=i.get(A),G=A.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==A.depthTexture){let et=A.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),et){let j=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,et.removeEventListener("dispose",j)};et.addEventListener("dispose",j),M.__depthDisposeCallback=j}M.__boundDepthTexture=et}if(A.depthTexture&&!M.__autoAllocateDepthBuffer)if(G)for(let et=0;et<6;et++)Qt(M.__webglFramebuffer[et],A,et);else A.texture.mipmaps.length>0?Qt(M.__webglFramebuffer[0],A,0):Qt(M.__webglFramebuffer,A,0);else if(G){M.__webglDepthbuffer=[];for(let et=0;et<6;et++)if(e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[et]),M.__webglDepthbuffer[et]===void 0)M.__webglDepthbuffer[et]=s.createRenderbuffer(),Gt(M.__webglDepthbuffer[et],A,!1);else{let j=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ot=M.__webglDepthbuffer[et];s.bindRenderbuffer(s.RENDERBUFFER,ot),s.framebufferRenderbuffer(s.FRAMEBUFFER,j,s.RENDERBUFFER,ot)}}else if(A.texture.mipmaps.length>0?e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=s.createRenderbuffer(),Gt(M.__webglDepthbuffer,A,!1);else{let j=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ot=M.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ot),s.framebufferRenderbuffer(s.FRAMEBUFFER,j,s.RENDERBUFFER,ot)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Ae(A,M,G){let et=i.get(A);M!==void 0&&se(et.__webglFramebuffer,A,A.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),G!==void 0&&ae(A)}function Re(A){let M=A.texture,G=i.get(A),et=i.get(M);A.addEventListener("dispose",I),C(A);let j=A.textures,ot=A.isWebGLCubeRenderTarget===!0,rt=j.length>1;if(rt||(et.__webglTexture===void 0&&(et.__webglTexture=s.createTexture()),et.__version=M.version,a.memory.textures++),ot){G.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(M.mipmaps.length>0){G.__webglFramebuffer[Y]=[];for(let K=0;K<M.mipmaps.length;K++)G.__webglFramebuffer[Y][K]=s.createFramebuffer()}else G.__webglFramebuffer[Y]=s.createFramebuffer()}else{if(M.mipmaps.length>0){G.__webglFramebuffer=[];for(let Y=0;Y<M.mipmaps.length;Y++)G.__webglFramebuffer[Y]=s.createFramebuffer()}else G.__webglFramebuffer=s.createFramebuffer();if(rt)for(let Y=0,K=j.length;Y<K;Y++){let lt=i.get(j[Y]);lt.__webglTexture===void 0&&(lt.__webglTexture=s.createTexture(),a.memory.textures++)}if(A.samples>0&&it(A)===!1){G.__webglMultisampledFramebuffer=s.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let Y=0;Y<j.length;Y++){let K=j[Y];G.__webglColorRenderbuffer[Y]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,G.__webglColorRenderbuffer[Y]);let lt=r.convert(K.format,K.colorSpace),L=r.convert(K.type),Q=E(K.internalFormat,lt,L,K.normalized,K.colorSpace,A.isXRRenderTarget===!0),q=ie(A);s.renderbufferStorageMultisample(s.RENDERBUFFER,q,Q,A.width,A.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Y,s.RENDERBUFFER,G.__webglColorRenderbuffer[Y])}s.bindRenderbuffer(s.RENDERBUFFER,null),A.depthBuffer&&(G.__webglDepthRenderbuffer=s.createRenderbuffer(),Gt(G.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ot){e.bindTexture(s.TEXTURE_CUBE_MAP,et.__webglTexture),at(s.TEXTURE_CUBE_MAP,M);for(let Y=0;Y<6;Y++)if(M.mipmaps.length>0)for(let K=0;K<M.mipmaps.length;K++)se(G.__webglFramebuffer[Y][K],A,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Y,K);else se(G.__webglFramebuffer[Y],A,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);b(M)?v(s.TEXTURE_CUBE_MAP):M.mipmaps.length>0&&s.texParameteri(s.TEXTURE_CUBE_MAP,s.TEXTURE_MAX_LEVEL,M.mipmaps.length-1),e.unbindTexture()}else if(rt){for(let Y=0,K=j.length;Y<K;Y++){let lt=j[Y],L=i.get(lt),Q=s.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(Q=A.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(Q,L.__webglTexture),at(Q,lt),se(G.__webglFramebuffer,A,lt,s.COLOR_ATTACHMENT0+Y,Q,0),b(lt)&&v(Q)}e.unbindTexture()}else{let Y=s.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(Y=A.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(Y,et.__webglTexture),at(Y,M),M.mipmaps.length>0)for(let K=0;K<M.mipmaps.length;K++)se(G.__webglFramebuffer[K],A,M,s.COLOR_ATTACHMENT0,Y,K);else se(G.__webglFramebuffer,A,M,s.COLOR_ATTACHMENT0,Y,0);b(M)?v(Y):M.mipmaps.length>0&&s.texParameteri(Y,s.TEXTURE_MAX_LEVEL,M.mipmaps.length-1),e.unbindTexture()}A.depthBuffer&&ae(A)}function O(A){let M=A.textures;for(let G=0,et=M.length;G<et;G++){let j=M[G];if(b(j)&&j.mipmapsAutoUpdate===!0){let ot=T(A),rt=i.get(j).__webglTexture;e.bindTexture(ot,rt),v(ot),e.unbindTexture()}}}let me=[];function Kt(A){if(A.samples>0){if(it(A)===!1){let M=A.textures,G=A.width,et=A.height,j=s.COLOR_BUFFER_BIT,ot=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,rt=i.get(A),Y=M.length>1;if(Y)for(let lt=0;lt<M.length;lt++)e.bindFramebuffer(s.FRAMEBUFFER,rt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,rt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,rt.__webglMultisampledFramebuffer),A.texture.mipmaps.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,rt.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,rt.__webglFramebuffer);for(let lt=0;lt<M.length;lt++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(j|=s.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(j|=s.STENCIL_BUFFER_BIT)),Y){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,rt.__webglColorRenderbuffer[lt]);let L=i.get(M[lt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,L,0)}s.blitFramebuffer(0,0,G,et,0,0,G,et,j,s.NEAREST),c===!0&&(me.length=0,me.push(s.COLOR_ATTACHMENT0+lt),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&me.push(ot),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,me))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Y)for(let lt=0;lt<M.length;lt++){e.bindFramebuffer(s.FRAMEBUFFER,rt.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.RENDERBUFFER,rt.__webglColorRenderbuffer[lt]);let L=i.get(M[lt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,rt.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.TEXTURE_2D,L,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,rt.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&c){let M=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[M])}}}function ie(A){return Math.min(n.maxSamples,A.samples)}function it(A){let M=i.get(A);return A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function re(A){let M=a.render.frame;h.get(A)!==M&&(h.set(A,M),A.update())}function At(A,M){let G=A.colorSpace,et=A.format,j=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||G!==ks&&G!==$i&&(ee.getTransfer(G)===de?(et!==xi||j!==oi)&&Lt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):kt("WebGLTextures: Unsupported texture color space:",G)),M}function Pt(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(l.width=A.naturalWidth||A.width,l.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(l.width=A.displayWidth,l.height=A.displayHeight):(l.width=A.width,l.height=A.height),l}this.allocateTextureUnit=Ft,this.resetTextureUnits=Z,this.getTextureUnits=tt,this.setTextureUnits=St,this.setTexture2D=pt,this.setTexture2DArray=yt,this.setTexture3D=It,this.setTextureCube=mt,this.rebindTextures=Ae,this.setupRenderTarget=Re,this.updateRenderTargetMipmap=O,this.updateMultisampleRenderTarget=Kt,this.setupDepthRenderbuffer=ae,this.setupFrameBufferTexture=se,this.useMultisampledRTT=it,this.dispose=B}function bg(s,t){function e(i,n=$i){let r,a=ee.getTransfer(n);if(i===oi)return s.UNSIGNED_BYTE;if(i===ka)return s.UNSIGNED_SHORT_4_4_4_4;if(i===za)return s.UNSIGNED_SHORT_5_5_5_1;if(i===Dl)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===Nl)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===Il)return s.BYTE;if(i===Ll)return s.SHORT;if(i===ms)return s.UNSIGNED_SHORT;if(i===Ba)return s.INT;if(i===Ei)return s.UNSIGNED_INT;if(i===di)return s.FLOAT;if(i===Ai)return s.HALF_FLOAT;if(i===Ul)return s.ALPHA;if(i===Fl)return s.RGB;if(i===xi)return s.RGBA;if(i===Wi)return s.DEPTH_COMPONENT;if(i===Zi)return s.DEPTH_STENCIL;if(i===Ha)return s.RED;if(i===Ga)return s.RED_INTEGER;if(i===gn)return s.RG;if(i===Va)return s.RG_INTEGER;if(i===Wa)return s.RGBA_INTEGER;if(i===hr||i===ur||i===dr||i===fr)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===hr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===dr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===fr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===hr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ur)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===dr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===fr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Xa||i===qa||i===Ya||i===Za)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Xa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===qa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Ya)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Za)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===$a||i===Ka||i===Ja||i===Qa||i===ja||i===pr||i===to)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===$a||i===Ka)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ja)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Qa)return r.COMPRESSED_R11_EAC;if(i===ja)return r.COMPRESSED_SIGNED_R11_EAC;if(i===pr)return r.COMPRESSED_RG11_EAC;if(i===to)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===eo||i===io||i===no||i===so||i===ro||i===ao||i===oo||i===lo||i===co||i===ho||i===uo||i===fo||i===po||i===mo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===eo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===io)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===no)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===so)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===ro)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ao)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===oo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===lo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===co)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ho)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===uo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===fo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===po)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===mo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===go||i===xo||i===_o)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===go)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===xo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===_o)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===yo||i===vo||i===mr||i===Mo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===yo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===vo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===mr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Mo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Nn?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}var wg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Tg=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ic=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Ks(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new hi({vertexShader:wg,fragmentShader:Tg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ce(new cn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},nc=class extends Pi{constructor(t,e){super();let i=this,n=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,g=null,_=typeof XRWebGLBinding<"u",m=new ic,p={},y=e.getContextAttributes(),b=null,v=null,T=[],E=[],x=new Xt,S=null,C=null,R=new si;R.viewport=new pe;let D=new si;D.viewport=new pe;let I=[R,D],F=new Da,P=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let pt=T[$];return pt===void 0&&(pt=new ss,T[$]=pt),pt.getTargetRaySpace()},this.getControllerGrip=function($){let pt=T[$];return pt===void 0&&(pt=new ss,T[$]=pt),pt.getGripSpace()},this.getHand=function($){let pt=T[$];return pt===void 0&&(pt=new ss,T[$]=pt),pt.getHandSpace()};function z($){let pt=E.indexOf($.inputSource);if(pt===-1)return;let yt=T[pt];yt!==void 0&&(yt.update($.inputSource,$.frame,l||a),yt.dispatchEvent({type:$.type,data:$.inputSource}))}function k(){n.removeEventListener("select",z),n.removeEventListener("selectstart",z),n.removeEventListener("selectend",z),n.removeEventListener("squeeze",z),n.removeEventListener("squeezestart",z),n.removeEventListener("squeezeend",z),n.removeEventListener("end",k),n.removeEventListener("inputsourceschange",J);for(let $=0;$<T.length;$++){let pt=E[$];pt!==null&&(E[$]=null,T[$].disconnect(pt))}P=null,B=null,m.reset();for(let $ in p)delete p[$];if(t.setRenderTarget(b),f=null,d=null,u=null,n=null,v=null,Ft.stop(),i.isPresenting=!1,t.setPixelRatio(S),t.setSize(x.width,x.height,!1),C!==null){let $=C.camera;$.fov=C.fov,$.zoom=C.zoom,$.updateProjectionMatrix(),C=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,i.isPresenting===!0&&Lt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){o=$,i.isPresenting===!0&&Lt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function($){l=$},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(n,e)),u},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function($){if(n=$,n!==null){if(b=t.getRenderTarget(),n.addEventListener("select",z),n.addEventListener("selectstart",z),n.addEventListener("selectend",z),n.addEventListener("squeeze",z),n.addEventListener("squeezestart",z),n.addEventListener("squeezeend",z),n.addEventListener("end",k),n.addEventListener("inputsourceschange",J),y.xrCompatible!==!0&&await e.makeXRCompatible(),S=t.getPixelRatio(),t.getSize(x),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let yt=null,It=null,mt=null;y.depth&&(mt=y.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,yt=y.stencil?Zi:Wi,It=y.stencil?Nn:Ei);let Ht={colorFormat:e.RGBA8,depthFormat:mt,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Ht),n.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),v=new Qe(d.textureWidth,d.textureHeight,{format:xi,type:oi,depthTexture:new qi(d.textureWidth,d.textureHeight,It,void 0,void 0,void 0,void 0,void 0,void 0,yt),stencilBuffer:y.stencil,colorSpace:t.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let yt={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(n,e,yt),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Qe(f.framebufferWidth,f.framebufferHeight,{format:xi,type:oi,colorSpace:t.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await n.requestReferenceSpace(o),Ft.setContext(n),Ft.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function J($){for(let pt=0;pt<$.removed.length;pt++){let yt=$.removed[pt],It=E.indexOf(yt);It>=0&&(E[It]=null,T[It].disconnect(yt))}for(let pt=0;pt<$.added.length;pt++){let yt=$.added[pt],It=E.indexOf(yt);if(It===-1){for(let Ht=0;Ht<T.length;Ht++)if(Ht>=E.length){E.push(yt),It=Ht;break}else if(E[Ht]===null){E[Ht]=yt,It=Ht;break}if(It===-1)break}let mt=T[It];mt&&mt.connect(yt)}}function H($,pt){pt===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(pt.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(n===null)return;let pt=$.near,yt=$.far;m.texture!==null&&(m.depthNear>0&&(pt=m.depthNear),m.depthFar>0&&(yt=m.depthFar)),F.near=D.near=R.near=pt,F.far=D.far=R.far=yt,(P!==F.near||B!==F.far)&&(n.updateRenderState({depthNear:F.near,depthFar:F.far}),P=F.near,B=F.far),F.layers.mask=$.layers.mask|6,R.layers.mask=F.layers.mask&-5,D.layers.mask=F.layers.mask&-3;let It=$.parent,mt=F.cameras;H(F,It);for(let Ht=0;Ht<mt.length;Ht++)H(mt[Ht],It);F.projectionMatrix.copy(R.projectionMatrix),F.projectionMatrixInverse.copy(R.projectionMatrixInverse),C===null&&$.isPerspectiveCamera&&(C={camera:$,fov:$.fov,zoom:$.zoom}),Z($,F,It)};function Z($,pt,yt){yt===null?$.matrix.copy(pt.matrixWorld):($.matrix.copy(yt.matrixWorld),$.matrix.invert(),$.matrix.multiply(pt.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(pt.projectionMatrix),$.projectionMatrixInverse.copy(pt.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=ua*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function($){c=$,d!==null&&(d.fixedFoveation=$),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=$)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(F)},this.getCameraTexture=function($){return p[$]};let tt=null;function St($,pt){if(h=pt.getViewerPose(l||a),g=pt,h!==null){let yt=h.views;f!==null&&(t.setRenderTargetFramebuffer(v,f.framebuffer),t.setRenderTarget(v));let It=!1;yt.length!==F.cameras.length&&(F.cameras.length=0,It=!0);for(let ct=0;ct<yt.length;ct++){let at=yt[ct],Ut=null;if(f!==null)Ut=f.getViewport(at);else{let be=u.getViewSubImage(d,at);Ut=be.viewport,ct===0&&(t.setRenderTargetTextures(v,be.colorTexture,be.depthStencilTexture),t.setRenderTarget(v))}let Wt=I[ct];Wt===void 0&&(Wt=new si,Wt.layers.enable(ct),Wt.viewport=new pe,I[ct]=Wt),Wt.matrix.fromArray(at.transform.matrix),Wt.matrix.decompose(Wt.position,Wt.quaternion,Wt.scale),Wt.projectionMatrix.fromArray(at.projectionMatrix),Wt.projectionMatrixInverse.copy(Wt.projectionMatrix).invert(),Wt.viewport.set(Ut.x,Ut.y,Ut.width,Ut.height),ct===0&&(F.matrix.copy(Wt.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),It===!0&&F.cameras.push(Wt)}let mt=n.enabledFeatures;if(mt&&mt.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&_){u=i.getBinding();let ct=u.getDepthInformation(yt[0]);ct&&ct.isValid&&ct.texture&&m.init(ct,n.renderState)}if(mt&&mt.includes("camera-access")&&_){t.state.unbindTexture(),u=i.getBinding();for(let ct=0;ct<yt.length;ct++){let at=yt[ct].camera;if(at){let Ut=p[at];Ut||(Ut=new Ks,p[at]=Ut);let Wt=u.getCameraImage(at);Ut.sourceTexture=Wt}}}}for(let yt=0;yt<T.length;yt++){let It=E[yt],mt=T[yt];It!==null&&mt!==void 0&&mt.update(It,pt,l||a)}tt&&tt($,pt),pt.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:pt}),g=null}let Ft=new vu;Ft.setAnimationLoop(St),this.setAnimationLoop=function($){tt=$},this.dispose=function(){}}},Eg=new Zt,Pu=new zt;Pu.set(-1,0,0,0,1,0,0,0,1);function Ag(s,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Wl(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function n(m,p,y,b,v){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?c(m,p,y,b):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Xe&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Xe&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let y=t.get(p),b=y.envMap,v=y.envMapRotation;b&&(m.envMap.value=b,m.envMapRotation.value.setFromMatrix4(Eg.makeRotationFromEuler(v)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Pu),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,y,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=b*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,y){m.ior.value=p.ior,p.diffuseRoughness>0&&(m.diffuseRoughness.value=p.diffuseRoughness,p.diffuseRoughnessMap&&(m.diffuseRoughnessMap.value=p.diffuseRoughnessMap,e(p.diffuseRoughnessMap,m.diffuseRoughnessMapTransform))),p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Xe&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessMinimum,m.iridescenceThicknessMaximum.value=p.iridescenceThicknessMaximum,p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let y=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function Rg(s,t,e,i){let n={},r={};function a(y,b){let v=b.program;i.uniformBlockBinding(y,v,n[y.id])}function o(y,b){let v=n[y.id];v===void 0&&(g(y),v=c(y),n[y.id]=v,y.addEventListener("dispose",m));let T=b.program;i.updateUBOMapping(y,T);let E=t.render.frame;r[y.id]!==E&&(l(y),r[y.id]=E)}function c(y){let b=s.createBuffer(),v=y.__size,T=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,b),s.bufferData(s.UNIFORM_BUFFER,v,T),s.bindBuffer(s.UNIFORM_BUFFER,null),b}function l(y){let b=n[y.id],v=y.uniforms,T=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let E=0,x=v.length;E<x;E++){let S=v[E];if(Array.isArray(S))for(let C=0,R=S.length;C<R;C++)h(S[C],E,C,T);else h(S,E,0,T)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function h(y,b,v,T){if(d(y,b,v,T)===!0){let E=y.__offset,x=y.value;if(Array.isArray(x)){let S=0;for(let C=0;C<x.length;C++){let R=x[C],D=_(R,!0);u(R,y.__data,S),S+=D.storage/Float32Array.BYTES_PER_ELEMENT}}else u(x,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,E,y.__data)}}function u(y,b,v){typeof y=="number"||typeof y=="boolean"?b[v]=y:y.isMatrix3?(b[v]=y.elements[0],b[v+1]=y.elements[1],b[v+2]=y.elements[2],b[v+3]=0,b[v+4]=y.elements[3],b[v+5]=y.elements[4],b[v+6]=y.elements[5],b[v+7]=0,b[v+8]=y.elements[6],b[v+9]=y.elements[7],b[v+10]=y.elements[8],b[v+11]=0):ArrayBuffer.isView(y)?b.set(y.subarray(0,b.length-v),v):y.toArray(b,v)}function d(y,b,v,T){let E=y.value,x=b+"_"+v;if(Array.isArray(E)){T[x]===void 0&&(T[x]=[]);let S=T[x],C=!1;for(let R=0;R<E.length;R++)f(E[R],S,R)===!0&&(C=!0);return C}return f(E,T,x)}function f(y,b,v){if(b[v]===void 0)return typeof y=="number"||typeof y=="boolean"?b[v]=y:ArrayBuffer.isView(y)?b[v]=y.slice():b[v]=y.clone(),!0;{let T=b[v];if(typeof y=="number"||typeof y=="boolean"){if(T!==y)return b[v]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(T.equals(y)===!1)return T.copy(y),!0}}return!1}function g(y){let b=y.uniforms,v=0,T=16;for(let x=0,S=b.length;x<S;x++){let C=Array.isArray(b[x])?b[x]:[b[x]];for(let R=0,D=C.length;R<D;R++){let I=C[R],F=Array.isArray(I.value)?I.value:[I.value],P=Array.isArray(b[x])||Array.isArray(I.value),B=v;for(let k=0,J=F.length;k<J;k++){let H=F[k],Z=_(H,P),tt=v%T,St=tt%Z.boundary,Ft=tt+St;v+=St,Ft!==0&&T-Ft<Z.storage&&(v+=T-Ft),k===0&&(B=v),v+=Z.storage}let z=I.type==="int"?Int32Array:I.type==="uint"?Uint32Array:Float32Array;I.__data=new z((v-B)/Float32Array.BYTES_PER_ELEMENT),I.__offset=B}}let E=v%T;return E>0&&(v+=T-E),y.__size=v,y.__cache={},this}function _(y,b){let v={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(v.boundary=4,v.storage=4):y.isVector2?(v.boundary=8,v.storage=8):y.isVector3||y.isColor?(v.boundary=16,v.storage=12):y.isVector4?(v.boundary=16,v.storage=16):y.isMatrix3?(v.boundary=16,v.storage=48):y.isMatrix4?(v.boundary=16,v.storage=64):y.isTexture?Lt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(v.boundary=16,v.storage=y.byteLength):Lt("WebGLRenderer: Unsupported uniform value type.",y),b===!0&&(v.boundary=16,v.storage=Math.ceil(v.storage/16)*16),v}function m(y){let b=y.target;b.removeEventListener("dispose",m),s.deleteBuffer(n[b.id]),delete n[b.id],delete r[b.id]}function p(){for(let y in n)s.deleteBuffer(n[y]);n={},r={}}return{bind:a,update:o,dispose:p}}var Cg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ni=null;function Pg(){return Ni===null&&(Ni=new ls(Cg,16,16,gn,Ai),Ni.name="DFG_LUT",Ni.minFilter=ii,Ni.magFilter=ii,Ni.wrapS=Ci,Ni.wrapT=Ci,Ni.generateMipmaps=!1,Ni.needsUpdate=!0),Ni}var wo=class{constructor(t={}){let{canvas:e=Wh(),context:i=null,depth:n=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=oi}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=a;let _=f,m=new Set([Wa,Va,Ga]),p=new Set([oi,Ei,ms,Nn,ka,za]),y=new Uint32Array(4),b=new Int32Array(4),v={textures:[],min:[],max:[],resolution:[]},T=null,E=null,x=[],S=[],C=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Di,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,D=!1,I=null,F=null,P=null,B=null;this._outputColorSpace=We;let z=0,k=0,J=null,H=-1,Z=null,tt=new pe,St=new pe,Ft=null,$=new vt(0),pt=0,yt=e.width,It=e.height,mt=1,Ht=null,Ee=null,ct=new pe(0,0,yt,It),at=new pe(0,0,yt,It),Ut=!1,Wt=new on,be=new ma,le=!1,ve=!1,se=new Zt,Gt=new U,Qt=new pe,ae={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ae=!1;function Re(){return J===null?mt:1}let O=i;function me(w,N){return e.getContext(w,N)}let Kt,ie,it,re,At,Pt,A,M,G,et,j,ot,rt,Y,K,lt,L,Q,q,ut,st,ht,Ct;try{let w={alpha:!0,depth:n,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"187"}`),e.addEventListener("webglcontextlost",Dt,!1),e.addEventListener("webglcontextrestored",Yt,!1),e.addEventListener("webglcontextcreationerror",gt,!1),O===null){let N="webgl2";if(O=me(N,w),O===null)throw me(N)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}$t()}catch(w){throw e.removeEventListener("webglcontextlost",Dt,!1),e.removeEventListener("webglcontextrestored",Yt,!1),e.removeEventListener("webglcontextcreationerror",gt,!1),kt("WebGLRenderer: "+w.message),w}function $t(){Kt=new Hm(O),Kt.init(),st=new bg(O,Kt),ie=new Pm(O,Kt,t,st),it=new Mg(O,Kt),ie.reversedDepthBuffer&&d&&it.buffers.depth.setReversed(!0),F=O.createFramebuffer(),P=O.createFramebuffer(),B=O.createFramebuffer(),re=new Wm(O),At=new og,Pt=new Sg(O,Kt,it,At,ie,st,re),A=new zm(R),M=new Xd(O),ht=new Rm(O,M),G=new Gm(O,M,re,ht),et=new qm(O,G,M,ht,re),Q=new Xm(O,ie,Pt),K=new Im(At),j=new ag(R,A,Kt,ie,ht,K),ot=new Ag(R,At),rt=new cg,Y=new mg(Kt),L=new Am(R,A,it,et,g,c),lt=new vg(R,et,ie),Ct=new Rg(O,re,ie,it),q=new Cm(O,Kt,re),ut=new Vm(O,Kt,re),re.programs=j.programs,R.capabilities=ie,R.extensions=Kt,R.properties=At,R.renderLists=rt,R.shadowMap=lt,R.state=it,R.info=re}_!==oi&&(C=new Zm(_,e.width,e.height,o,n,r));let nt=new nc(R,O);this.xr=nt,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let w=Kt.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=Kt.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return mt},this.setPixelRatio=function(w){w!==void 0&&(mt=w,this.setSize(yt,It,!1))},this.getSize=function(w){return w.set(yt,It)},this.setSize=function(w,N,X=!0){if(nt.isPresenting){Lt("WebGLRenderer: Can't change size while VR device is presenting.");return}yt=w,It=N,e.width=Math.floor(w*mt),e.height=Math.floor(N*mt),X===!0&&(e.style.width=w+"px",e.style.height=N+"px"),C!==null&&C.setSize(e.width,e.height),this.setViewport(0,0,w,N)},this.getDrawingBufferSize=function(w){return w.set(yt*mt,It*mt).floor()},this.setDrawingBufferSize=function(w,N,X){yt=w,It=N,mt=X,e.width=Math.floor(w*X),e.height=Math.floor(N*X),this.setViewport(0,0,w,N)},this.setEffects=function(w){if(_===oi){kt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let N=0;N<w.length;N++)if(w[N].isOutputPass===!0){Lt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}C.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(tt)},this.getViewport=function(w){return w.copy(ct)},this.setViewport=function(w,N,X,V){w.isVector4?ct.set(w.x,w.y,w.z,w.w):ct.set(w,N,X,V),it.viewport(tt.copy(ct).multiplyScalar(Re()).round())},this.getScissor=function(w){return w.copy(at)},this.setScissor=function(w,N,X,V){w.isVector4?at.set(w.x,w.y,w.z,w.w):at.set(w,N,X,V),it.scissor(St.copy(at).multiplyScalar(Re()).round())},this.getScissorTest=function(){return Ut},this.setScissorTest=function(w){it.setScissorTest(Ut=w)},this.setOpaqueSort=function(w){Ht=w},this.setTransparentSort=function(w){Ee=w},this.getClearColor=function(w){return w.copy(L.getClearColor())},this.setClearColor=function(){L.setClearColor(...arguments)},this.getClearAlpha=function(){return L.getClearAlpha()},this.setClearAlpha=function(){L.setClearAlpha(...arguments)},this.clear=function(w=!0,N=!0,X=!0){let V=0;if(w){let W=!1;if(J!==null){let ft=J.texture.format;W=m.has(ft)}if(W){let ft=J.texture.type,bt=p.has(ft),dt=L.getClearColor(),_t=L.getClearAlpha(),Et=dt.r,Vt=dt.g,jt=dt.b;bt?(y[0]=Et,y[1]=Vt,y[2]=jt,y[3]=_t,O.clearBufferuiv(O.COLOR,0,y)):(b[0]=Et,b[1]=Vt,b[2]=jt,b[3]=_t,O.clearBufferiv(O.COLOR,0,b))}else V|=O.COLOR_BUFFER_BIT}N&&(V|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(V|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&O.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),I=w},this.dispose=function(){e.removeEventListener("webglcontextlost",Dt,!1),e.removeEventListener("webglcontextrestored",Yt,!1),e.removeEventListener("webglcontextcreationerror",gt,!1),L.dispose(),rt.dispose(),Y.dispose(),Pt.dispose(),At.dispose(),A.dispose(),et.dispose(),G.dispose(),ht.dispose(),Ct.dispose(),j.dispose(),nt.dispose(),nt.removeEventListener("sessionstart",_c),nt.removeEventListener("sessionend",yc),xn.stop()};function Dt(w){w.preventDefault(),Hl("WebGLRenderer: Context Lost."),D=!0}function Yt(){Hl("WebGLRenderer: Context Restored."),D=!1;let w=re.autoReset,N=lt.enabled,X=lt.autoUpdate,V=lt.needsUpdate,W=lt.type;$t(),re.autoReset=w,lt.enabled=N,lt.autoUpdate=X,lt.needsUpdate=V,lt.type=W}function gt(w){kt("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function fe(w){let N=w.target;N.removeEventListener("dispose",fe),Be(N)}function Be(w){Qi(w),At.remove(w)}function Qi(w){let N=At.get(w).programs;N!==void 0&&(N.forEach(function(X){j.releaseProgram(X)}),w.isShaderMaterial&&j.releaseShaderCache(w))}this.renderBufferDirect=function(w,N,X,V,W,ft){N===null&&(N=ae);let bt=W.isMesh&&W.matrixWorld.determinantAffine()<0,dt=ed(w,N,X,V,W);it.setMaterial(V,bt);let _t=X.index,Et=1;if(V.wireframe===!0){if(_t=G.getWireframeAttribute(X),_t===void 0)return;Et=2}let Vt=X.drawRange,jt=X.attributes.position,wt=Vt.start*Et,te=(Vt.start+Vt.count)*Et;ft!==null&&(wt=Math.max(wt,ft.start*Et),te=Math.min(te,(ft.start+ft.count)*Et)),_t!==null?(wt=Math.max(wt,0),te=Math.min(te,_t.count)):jt!=null&&(wt=Math.max(wt,0),te=Math.min(te,jt.count));let Ce=te-wt;if(Ce<0||Ce===1/0)return;ht.setup(W,V,dt,X,_t);let _e,ge=q;if(_t!==null&&(_e=M.get(_t),ge=ut,ge.setIndex(_e)),W.isMesh)V.wireframe===!0?(it.setLineWidth(V.wireframeLinewidth*Re()),ge.setMode(O.LINES)):ge.setMode(O.TRIANGLES);else if(W.isLine){let Ze=V.linewidth;Ze===void 0&&(Ze=1),it.setLineWidth(Ze*Re()),W.isLineSegments?ge.setMode(O.LINES):W.isLineLoop?ge.setMode(O.LINE_LOOP):ge.setMode(O.LINE_STRIP)}else W.isPoints?ge.setMode(O.POINTS):W.isSprite&&ge.setMode(O.TRIANGLES);if(W.isBatchedMesh)if(Kt.get("WEBGL_multi_draw"))ge.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let Ze=W._multiDrawStarts,Tt=W._multiDrawCounts,ei=W._multiDrawCount,he=_t?M.get(_t).bytesPerElement:1,_n=At.get(V).currentProgram.getUniforms();for(let $e=0;$e<ei;$e++)_n.setValue(O,"_gl_DrawID",$e),ge.render(Ze[$e]/he,Tt[$e])}else if(W.isInstancedMesh)ge.renderInstances(wt,Ce,W.count);else if(X.isInstancedBufferGeometry){let Ze=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,Tt=Math.min(X.instanceCount,Ze);ge.renderInstances(wt,Ce,Tt)}else ge.render(wt,Ce)};function xc(w,N,X,V){I!==null&&w.isNodeMaterial&&I.setObject(V,w),le===!0&&K.setState(w,X,!1),w.transparent===!0&&w.side===gi&&w.forceSinglePass===!1?(w.side=Xe,w.needsUpdate=!0,Cs(w,N,V),w.side=mn,w.needsUpdate=!0,Cs(w,N,V),w.side=gi):Cs(w,N,V)}this.compile=function(w,N,X=null){X===null&&(X=w),I!==null&&I.renderStart(w,N,X),E=Y.get(X),E.init(N),S.push(E),X.traverseVisible(function(W){W.isLight&&W.layers.test(N.layers)&&(E.pushLight(W),W.castShadow&&E.pushShadow(W))}),w!==X&&w.traverseVisible(function(W){W.isLight&&W.layers.test(N.layers)&&(E.pushLight(W),W.castShadow&&E.pushShadow(W))}),E.setupLights(),I!==null&&I.updateLights(E.state.lightsArray),ve=this.localClippingEnabled,le=K.init(this.clippingPlanes,ve),le===!0&&K.setGlobalState(this.clippingPlanes,N),I!==null&&lt.render(E.state.shadowsArray,X,N);let V=new Set;return w.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let ft=W.material;if(ft)if(Array.isArray(ft))for(let bt=0;bt<ft.length;bt++){let dt=ft[bt];xc(dt,X,N,W),V.add(dt)}else xc(ft,X,N,W),V.add(ft)}),E=S.pop(),I!==null&&I.renderEnd(),V},this.compileAsync=function(w,N,X=null){let V=this.compile(w,N,X);return new Promise(W=>{function ft(){if(V.forEach(function(bt){let _t=At.get(bt).currentProgram;(_t===void 0||_t.isReady())&&V.delete(bt)}),V.size===0){W(w);return}setTimeout(ft,10)}Kt.get("KHR_parallel_shader_compile")!==null?ft():setTimeout(ft,10)})};let Do=null;function ju(w){Do&&Do(w)}function _c(){xn.stop()}function yc(){xn.start()}let xn=new vu;xn.setAnimationLoop(ju),typeof self<"u"&&xn.setContext(self),this.setAnimationLoop=function(w){Do=w,nt.setAnimationLoop(w),w===null?xn.stop():xn.start()},nt.addEventListener("sessionstart",_c),nt.addEventListener("sessionend",yc),this.render=function(w,N){if(N!==void 0&&N.isCamera!==!0){kt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;I!==null&&I.renderStart(w,N);let X=nt.enabled===!0&&nt.isPresenting===!0,V=C!==null&&(J===null||X)&&C.begin(R,J);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),nt.enabled===!0&&nt.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(nt.cameraAutoUpdate===!0&&nt.updateCamera(N),N=nt.getCamera()),w.isScene===!0&&w.onBeforeRender(R,w,N,J),E=Y.get(w,S.length),E.init(N),E.state.textureUnits=Pt.getTextureUnits(),S.push(E),se.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),N.isArrayCamera?be.setFromArrayCamera(N):Wt.setFromProjectionMatrix(se,pi,N.reversedDepth),ve=this.localClippingEnabled,le=K.init(this.clippingPlanes,ve),T=rt.get(w,x.length),T.init(),x.push(T),this.info.render.frame++,nt.enabled===!0&&nt.isPresenting===!0){let bt=R.xr.getDepthSensingMesh();bt!==null&&No(bt,N,-1/0,R.sortObjects)}No(w,N,0,R.sortObjects),T.finish(),I!==null&&I.updateLights(E.state.lightsArray),R.sortObjects===!0&&T.sort(Ht,Ee),Ae=nt.enabled===!1||nt.isPresenting===!1||nt.hasDepthSensing()===!1,Ae&&L.addToRenderList(T,w),this.info.autoReset===!0&&this.info.reset(),le===!0&&K.beginShadows();let W=E.state.shadowsArray;if(lt.render(W,w,N),le===!0&&K.endShadows(),(V&&C.hasRenderPass())===!1){let bt=T.opaque,dt=T.transmissive;if(E.setupLights(),N.isArrayCamera){let _t=N.cameras;if(dt.length>0)for(let Et=0,Vt=_t.length;Et<Vt;Et++){let jt=_t[Et];Mc(bt,dt,w,jt)}Ae&&L.render(w);for(let Et=0,Vt=_t.length;Et<Vt;Et++){let jt=_t[Et];vc(T,w,jt,jt.viewport)}}else dt.length>0&&Mc(bt,dt,w,N),Ae&&L.render(w),vc(T,w,N)}J!==null&&k===0&&(Pt.updateMultisampleRenderTarget(J),Pt.updateRenderTargetMipmap(J)),V&&C.end(R),w.isScene===!0&&w.onAfterRender(R,w,N),ht.resetDefaultState(),H=-1,Z=null,S.pop(),S.length>0?(E=S[S.length-1],Pt.setTextureUnits(E.state.textureUnits),le===!0&&K.setGlobalState(R.clippingPlanes,E.state.camera)):E=null,x.pop(),x.length>0?T=x[x.length-1]:T=null,I!==null&&I.renderEnd()};function No(w,N,X,V){if(w.visible===!1)return;if(w.layers.test(N.layers)){if(w.isGroup)X=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(N);else if(w.isLight)E.pushLight(w),w.castShadow&&E.pushShadow(w);else if(w.isSprite){let bt=N.isArrayCamera?be:Wt;if(!w.frustumCulled||w.intersectsFrustum(bt)){V&&Qt.setFromMatrixPosition(w.matrixWorld).applyMatrix4(se);let dt=et.update(w),_t=w.material;_t.visible&&T.push(w,dt,_t,X,Qt.z,null,N)}}else if(w.isMesh||w.isLine||w.isPoints){let bt=N.isArrayCamera?be:Wt;if(!w.frustumCulled||w.intersectsFrustum(bt)){let dt=et.update(w),_t=w.material;if(V&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Qt.copy(w.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),Qt.copy(dt.boundingSphere.center)),Qt.applyMatrix4(w.matrixWorld).applyMatrix4(se)),Array.isArray(_t)){let Et=dt.groups;for(let Vt=0,jt=Et.length;Vt<jt;Vt++){let wt=Et[Vt],te=_t[wt.materialIndex];te&&te.visible&&T.push(w,dt,te,X,Qt.z,wt,N)}}else _t.visible&&T.push(w,dt,_t,X,Qt.z,null,N)}}}let ft=w.children;for(let bt=0,dt=ft.length;bt<dt;bt++)No(ft[bt],N,X,V)}function vc(w,N,X,V){let{opaque:W,transmissive:ft,transparent:bt}=w;E.setupLightsView(X),le===!0&&K.setGlobalState(R.clippingPlanes,X),V&&it.viewport(tt.copy(V)),W.length>0&&Ar(W,N,X),ft.length>0&&Ar(ft,N,X),bt.length>0&&Ar(bt,N,X),it.buffers.depth.setTest(!0),it.buffers.depth.setMask(!0),it.buffers.color.setMask(!0),it.setPolygonOffset(!1)}function Mc(w,N,X,V){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[V.id]===void 0){let wt=Kt.has("EXT_color_buffer_half_float")||Kt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[V.id]=new Qe(1,1,{generateMipmaps:!0,type:wt?Ai:oi,minFilter:Yi,samples:Math.max(4,ie.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ee.workingColorSpace})}let ft=E.state.transmissionRenderTarget[V.id],bt=V.viewport||tt;ft.setSize(bt.z*R.transmissionResolutionScale,bt.w*R.transmissionResolutionScale);let dt=R.getRenderTarget(),_t=R.getActiveCubeFace(),Et=R.getActiveMipmapLevel();R.setRenderTarget(ft),R.getClearColor($),pt=R.getClearAlpha(),pt<1&&R.setClearColor(16777215,.5),R.clear(),Ae&&L.render(X);let Vt=R.toneMapping;R.toneMapping=Di;let jt=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),E.setupLightsView(V),le===!0&&K.setGlobalState(R.clippingPlanes,V),Ar(w,X,V),Pt.updateMultisampleRenderTarget(ft),Pt.updateRenderTargetMipmap(ft),Kt.has("WEBGL_multisampled_render_to_texture")===!1){let wt=!1;for(let te=0,Ce=N.length;te<Ce;te++){let _e=N[te],{object:ge,geometry:Ze,material:Tt,group:ei}=_e;if(Tt.side===gi&&ge.layers.test(V.layers)){let he=Tt.side;Tt.side=Xe,Tt.needsUpdate=!0,Sc(ge,X,V,Ze,Tt,ei),Tt.side=he,Tt.needsUpdate=!0,wt=!0}}wt===!0&&(Pt.updateMultisampleRenderTarget(ft),Pt.updateRenderTargetMipmap(ft))}R.setRenderTarget(dt,_t,Et),R.setClearColor($,pt),jt!==void 0&&(V.viewport=jt),R.toneMapping=Vt}function Ar(w,N,X){let V=N.isScene===!0?N.overrideMaterial:null;for(let W=0,ft=w.length;W<ft;W++){let bt=w[W],{object:dt,geometry:_t,group:Et}=bt,Vt=bt.material;Vt.allowOverride===!0&&V!==null&&(Vt=V),dt.layers.test(X.layers)&&Sc(dt,N,X,_t,Vt,Et)}}function Sc(w,N,X,V,W,ft){I!==null&&W.isNodeMaterial&&I.setObject(w,W),w.onBeforeRender(R,N,X,V,W,ft),w.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),W.onBeforeRender(R,N,X,V,w,ft),W.transparent===!0&&W.side===gi&&W.forceSinglePass===!1?(W.side=Xe,W.needsUpdate=!0,R.renderBufferDirect(X,N,V,W,w,ft),W.side=mn,W.needsUpdate=!0,R.renderBufferDirect(X,N,V,W,w,ft),W.side=gi):R.renderBufferDirect(X,N,V,W,w,ft),w.onAfterRender(R,N,X,V,W,ft)}function bc(w){let N=0;for(let X of w)X.texture!==null&&N++;return N}function Cs(w,N,X){N.isScene!==!0&&(N=ae);let V=At.get(w),W=E.state.lights,ft=E.state.shadowsArray,bt=W.state.version,dt=j.getParameters(w,W.state,ft,N,X,E.state.lightProbeGridArray),_t=j.getProgramCacheKey(dt),Et=V.programs;V.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?N.environment:null,V.fog=N.fog;let Vt=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;V.envMap=A.get(w.envMap||V.environment,Vt),V.envMapRotation=V.environment!==null&&w.envMap===null?N.environmentRotation:w.envMapRotation,Et===void 0&&(w.addEventListener("dispose",fe),Et=new Map,V.programs=Et,V.programVariants=new Map);let jt=Et.get(_t);if(jt!==void 0){if(V.currentProgram===jt&&V.lightsStateVersion===bt)return Tc(w,dt),jt}else dt.uniforms=j.getUniforms(w),I!==null&&w.isNodeMaterial&&I.build(w,X,dt),w.onBeforeCompile(dt,R),jt=j.acquireProgram(dt,_t),Et.set(_t,jt),V.uniforms=dt.uniforms;let wt=V.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(wt.clippingPlanes=K.uniform),Tc(w,dt),V.needsLights=nd(w),V.lightsStateVersion=bt,V.needsLights&&(wt.ambientLightColor.value=W.state.ambient,wt.lightProbe.value=W.state.probe,wt.sunLights.value=W.state.sun,wt.sunLightShadows.value=W.state.sunShadow,wt.directionalLights.value=W.state.directional,wt.directionalLightShadows.value=W.state.directionalShadow,wt.spotLights.value=W.state.spot,wt.spotLightShadows.value=W.state.spotShadow,wt.rectAreaLights.value=W.state.rectArea,wt.ltc_1.value=W.state.rectAreaLTC1,wt.ltc_2.value=W.state.rectAreaLTC2,wt.pointLights.value=W.state.point,wt.pointLightShadows.value=W.state.pointShadow,wt.hemisphereLights.value=W.state.hemi,wt.sunShadowMatrix.value=W.state.sunShadowMatrix,wt.sunShadowCascade.value=W.state.sunShadowCascade,wt.directionalShadowMatrix.value=W.state.directionalShadowMatrix,wt.spotLightMatrix.value=W.state.spotLightMatrix,wt.spotLightMap.value=W.state.spotLightMap,wt.pointShadowMatrix.value=W.state.pointShadowMatrix),V.numLightProbeGrids=bc(E.state.lightProbeGridArray),V.currentProgram=jt,V.uniformsList=null,jt}function td(w,N,X,V,W){let ft=At.get(w),bt=ft.currentProgram.id+","+V+","+W,dt=ft.programVariants.get(bt);return dt===void 0?(dt=Cs(w,N,X),ft.programVariants.set(bt,dt)):(ft.currentProgram=dt,ft.uniformsList=null,ft.outputColorSpace=V,ft.toneMapping=W),dt}function wc(w){if(w.uniformsList===null){let N=w.currentProgram.getUniforms();w.uniformsList=xs.seqWithValue(N.seq,w.uniforms)}return w.uniformsList}function Tc(w,N){let X=At.get(w);X.outputColorSpace=N.outputColorSpace,X.batching=N.batching,X.batchingColor=N.batchingColor,X.instancing=N.instancing,X.instancingColor=N.instancingColor,X.instancingMorph=N.instancingMorph,X.skinning=N.skinning,X.morphTargets=N.morphTargets,X.morphNormals=N.morphNormals,X.morphColors=N.morphColors,X.morphTargetsCount=N.morphTargetsCount,X.numClippingPlanes=N.numClippingPlanes,X.numIntersection=N.numClipIntersection,X.vertexAlphas=N.vertexAlphas,X.vertexTangents=N.vertexTangents,X.toneMapping=N.toneMapping}function ed(w,N,X,V,W){N.isScene!==!0&&(N=ae),Pt.resetTextureUnits();let ft=N.fog,bt=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?N.environment:null,dt=J===null?R.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:ee.workingColorSpace,_t=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Et=A.get(V.envMap||bt,_t),Vt=V.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,jt=!!X.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),wt=!!X.morphAttributes.position,te=!!X.morphAttributes.normal,Ce=!!X.morphAttributes.color,_e=Di;V.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(_e=R.toneMapping);let ge=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,Ze=ge!==void 0?ge.length:0,Tt=At.get(V),ei=E.state.lights;if(le===!0&&(ve===!0||w!==Z)){let Te=w===Z&&V.id===H;K.setState(V,w,Te)}let he=!1,_n=!1;V.version===Tt.__version?Tt.needsLights&&Tt.lightsStateVersion!==ei.state.version||W.isBatchedMesh&&Tt.batching===!1||!W.isBatchedMesh&&Tt.batching===!0||W.isBatchedMesh&&Tt.batchingColor===!0&&W._colorsTexture===null||W.isBatchedMesh&&Tt.batchingColor===!1&&W._colorsTexture!==null||W.isInstancedMesh&&Tt.instancing===!1||!W.isInstancedMesh&&Tt.instancing===!0||W.isSkinnedMesh&&Tt.skinning===!1||!W.isSkinnedMesh&&Tt.skinning===!0||W.isInstancedMesh&&Tt.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Tt.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Tt.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Tt.instancingMorph===!1&&W.morphTexture!==null||Tt.envMap!==Et||V.fog===!0&&Tt.fog!==ft||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==K.numPlanes||Tt.numIntersection!==K.numIntersection)||Tt.vertexAlphas!==Vt||Tt.vertexTangents!==jt||Tt.morphTargets!==wt||Tt.morphNormals!==te||Tt.morphColors!==Ce||Tt.morphTargetsCount!==Ze||Tt.numLightProbeGrids!==bc(E.state.lightProbeGridArray)?he=!0:(Tt.outputColorSpace!==dt||Tt.toneMapping!==_e)&&(_n=!0):(he=!0,Tt.__version=V.version);let $e=Tt.currentProgram;(he===!0||_n===!0)&&($e=_n===!0?td(V,N,W,dt,_e):Cs(V,N,W),I&&V.isNodeMaterial&&I.onUpdateProgram(V,$e,Tt));let Rr=!1,ji=!1,yn=!1,oe=$e.getUniforms(),Ve=Tt.uniforms;if(it.useProgram($e.program)&&(Rr=!0,ji=!0,yn=!0),V.id!==H&&(H=V.id,ji=!0),Rr||Z!==w){it.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),oe.setValue(O,"projectionMatrix",w.projectionMatrix),oe.setValue(O,"viewMatrix",w.matrixWorldInverse);let ke=oe.map.cameraPosition;ke!==void 0&&ke.setValue(O,Gt.setFromMatrixPosition(w.matrixWorld)),ie.logarithmicDepthBuffer&&oe.setValue(O,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&oe.setValue(O,"isOrthographic",w.isOrthographicCamera===!0),Z!==w&&(Z=w,ji=!0,yn=!0)}if(Tt.needsLights&&(ei.state.sunShadowMap.length>0&&oe.setValue(O,"sunShadowMap",ei.state.sunShadowMap,Pt),ei.state.directionalShadowMap.length>0&&oe.setValue(O,"directionalShadowMap",ei.state.directionalShadowMap,Pt),ei.state.spotShadowMap.length>0&&oe.setValue(O,"spotShadowMap",ei.state.spotShadowMap,Pt),ei.state.pointShadowMap.length>0&&oe.setValue(O,"pointShadowMap",ei.state.pointShadowMap,Pt)),W.isSkinnedMesh){oe.setOptional(O,W,"bindMatrix"),oe.setOptional(O,W,"bindMatrixInverse");let Te=W.skeleton;Te&&(Te.boneTexture===null&&Te.computeBoneTexture(),oe.setValue(O,"boneTexture",Te.boneTexture,Pt))}W.isBatchedMesh&&(oe.setOptional(O,W,"batchingTexture"),oe.setValue(O,"batchingTexture",W._matricesTexture,Pt),oe.setOptional(O,W,"batchingIdTexture"),oe.setValue(O,"batchingIdTexture",W._indirectTexture,Pt),oe.setOptional(O,W,"batchingColorTexture"),W._colorsTexture!==null&&oe.setValue(O,"batchingColorTexture",W._colorsTexture,Pt));let yi=X.morphAttributes;if((yi.position!==void 0||yi.normal!==void 0||yi.color!==void 0)&&Q.update(W,X,$e),(ji||Tt.receiveShadow!==W.receiveShadow)&&(Tt.receiveShadow=W.receiveShadow,oe.setValue(O,"receiveShadow",W.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&N.environment!==null&&(Ve.envMapIntensity.value=N.environmentIntensity),Ve.dfgLUT!==void 0&&(Ve.dfgLUT.value=Pg()),ji){if(oe.setValue(O,"toneMappingExposure",R.toneMappingExposure),Tt.needsLights&&id(Ve,yn),ft&&V.fog===!0&&ot.refreshFogUniforms(Ve,ft),ot.refreshMaterialUniforms(Ve,V,mt,It,E.state.transmissionRenderTarget[w.id]),Tt.needsLights&&Tt.numLightProbeGrids>0){let Te=v,ke=0;for(let Oi of E.state.lightProbeGridArray)Oi.texture!==null&&(Te.textures[ke]=Oi.texture,Te.min[ke]=Oi.boundingBox.min,Te.max[ke]=Oi.boundingBox.max,Te.resolution[ke]=Oi.resolution,ke++);for(let Oi in Te)Te[Oi].length=ke;Ve.probesSH.value=Te.textures,Ve.probesMin.value=Te.min,Ve.probesMax.value=Te.max,Ve.probesResolution.value=Te.resolution}xs.upload(O,wc(Tt),Ve,Pt)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(xs.upload(O,wc(Tt),Ve,Pt),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&oe.setValue(O,"center",W.center),oe.setValue(O,"modelViewMatrix",W.modelViewMatrix),oe.setValue(O,"normalMatrix",W.normalMatrix),oe.setValue(O,"modelMatrix",W.matrixWorld),V.uniformsGroups!==void 0){let Te=V.uniformsGroups;for(let ke=0,Oi=Te.length;ke<Oi;ke++){let Ac=Te[ke];Ct.update(Ac,$e),Ct.bind(Ac,$e)}}return $e}function id(w,N){w.ambientLightColor.needsUpdate=N,w.lightProbe.needsUpdate=N,w.sunLights.needsUpdate=N,w.sunLightShadows.needsUpdate=N,w.directionalLights.needsUpdate=N,w.directionalLightShadows.needsUpdate=N,w.pointLights.needsUpdate=N,w.pointLightShadows.needsUpdate=N,w.spotLights.needsUpdate=N,w.spotLightShadows.needsUpdate=N,w.rectAreaLights.needsUpdate=N,w.hemisphereLights.needsUpdate=N}function nd(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return z},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return J},this.setRenderTargetTextures=function(w,N,X){let V=At.get(w);V.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),At.get(w.texture).__webglTexture=N,At.get(w.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:X,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,N){let X=At.get(w);X.__webglFramebuffer=N,X.__useDefaultFramebuffer=N===void 0},this.setRenderTarget=function(w,N=0,X=0){J=w,z=N,k=X;let V=null,W=!1,ft=!1;if(w){let dt=At.get(w);if(dt.__useDefaultFramebuffer!==void 0){it.bindFramebuffer(O.FRAMEBUFFER,dt.__webglFramebuffer),tt.copy(w.viewport),St.copy(w.scissor),Ft=w.scissorTest,it.viewport(tt),it.scissor(St),it.setScissorTest(Ft),H=-1;return}else if(dt.__webglFramebuffer===void 0)Pt.setupRenderTarget(w);else if(dt.__hasExternalTextures)Pt.rebindTextures(w,At.get(w.texture).__webglTexture,At.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let Vt=w.depthTexture;if(dt.__boundDepthTexture!==Vt){if(Vt!==null&&At.has(Vt)&&(w.width!==Vt.image.width||w.height!==Vt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Pt.setupDepthRenderbuffer(w)}}let _t=w.texture;(_t.isData3DTexture||_t.isDataArrayTexture||_t.isCompressedArrayTexture)&&(ft=!0);let Et=At.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Et[N])?V=Et[N][X]:V=Et[N],W=!0):w.samples>0&&Pt.useMultisampledRTT(w)===!1?V=At.get(w).__webglMultisampledFramebuffer:Array.isArray(Et)?V=Et[X]:V=Et,tt.copy(w.viewport),St.copy(w.scissor),Ft=w.scissorTest}else tt.copy(ct).multiplyScalar(mt).floor(),St.copy(at).multiplyScalar(mt).floor(),Ft=Ut;if(X!==0&&(V=F),it.bindFramebuffer(O.FRAMEBUFFER,V)&&it.drawBuffers(w,V),it.viewport(tt),it.scissor(St),it.setScissorTest(Ft),W){let dt=At.get(w.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+N,dt.__webglTexture,X)}else if(ft){let dt=N;for(let _t=0;_t<w.textures.length;_t++){let Et=At.get(w.textures[_t]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+_t,Et.__webglTexture,X,dt)}}else if(w!==null&&X!==0){let dt=At.get(w.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,dt.__webglTexture,X)}H=-1};function Ec(w){let N=At.get(w);return(N.__readFormat!==w.format||N.__readType!==w.type)&&(N.__readFormat=w.format,N.__readType=w.type,N.__formatReadable=ie.textureFormatReadable(w.format),N.__typeReadable=ie.textureTypeReadable(w.type)),N}this.readRenderTargetPixels=function(w,N,X,V,W,ft,bt,dt=0){if(!(w&&w.isWebGLRenderTarget)){kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _t=At.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&bt!==void 0&&(_t=_t[bt],Array.isArray(_t)&&(_t=_t[0])),_t){it.bindFramebuffer(O.FRAMEBUFFER,_t);try{let Et=w.textures[dt],Vt=Et.format,jt=Et.type;w.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+dt);let wt=Ec(Et);if(wt.__formatReadable===!1){kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(wt.__typeReadable===!1){kt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=w.width-V&&X>=0&&X<=w.height-W&&O.readPixels(N,X,V,W,st.convert(Vt),st.convert(jt),ft)}finally{let Et=J!==null?At.get(J).__webglFramebuffer:null;it.bindFramebuffer(O.FRAMEBUFFER,Et)}}},this.readRenderTargetPixelsAsync=async function(w,N,X,V,W,ft,bt,dt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _t=At.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&bt!==void 0&&(_t=_t[bt],Array.isArray(_t)&&(_t=_t[0])),_t)if(N>=0&&N<=w.width-V&&X>=0&&X<=w.height-W){it.bindFramebuffer(O.FRAMEBUFFER,_t);let Et=w.textures[dt],Vt=Et.format,jt=Et.type;w.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+dt);let wt=Ec(Et);if(wt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(wt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let te=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,te),O.bufferData(O.PIXEL_PACK_BUFFER,ft.byteLength,O.STREAM_READ),O.readPixels(N,X,V,W,st.convert(Vt),st.convert(jt),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let Ce=J!==null?At.get(J).__webglFramebuffer:null;it.bindFramebuffer(O.FRAMEBUFFER,Ce);let _e=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await qh(O,_e,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,te),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,ft),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(te),O.deleteSync(_e),ft}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,N=null,X=0){let V=Math.pow(2,-X),W=Math.floor(w.image.width*V),ft=Math.floor(w.image.height*V),bt=N!==null?N.x:0,dt=N!==null?N.y:0;Pt.setTexture2D(w,0),O.copyTexSubImage2D(O.TEXTURE_2D,X,0,0,bt,dt,W,ft),it.unbindTexture()},this.copyTextureToTexture=function(w,N,X=null,V=null,W=0,ft=0){let bt,dt,_t,Et,Vt,jt,wt,te,Ce,_e=w.isCompressedTexture?w.mipmaps[ft]:w.image;if(X!==null)bt=X.max.x-X.min.x,dt=X.max.y-X.min.y,_t=X.isBox3?X.max.z-X.min.z:1,Et=X.min.x,Vt=X.min.y,jt=X.isBox3?X.min.z:0;else{let oe=Math.pow(2,-W);bt=Math.floor(_e.width*oe),dt=Math.floor(_e.height*oe),w.isDataArrayTexture?_t=_e.depth:w.isData3DTexture?_t=Math.floor(_e.depth*oe):_t=1,Et=0,Vt=0,jt=0}V!==null?(wt=V.x,te=V.y,Ce=V.z):(wt=0,te=0,Ce=0);let ge=st.convert(N.format),Ze=st.convert(N.type),Tt;N.isData3DTexture?(Pt.setTexture3D(N,0),Tt=O.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(Pt.setTexture2DArray(N,0),Tt=O.TEXTURE_2D_ARRAY):(Pt.setTexture2D(N,0),Tt=O.TEXTURE_2D),it.activeTexture(O.TEXTURE0),it.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,N.flipY),it.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),it.pixelStorei(O.UNPACK_ALIGNMENT,N.unpackAlignment);let ei=it.getParameter(O.UNPACK_ROW_LENGTH),he=it.getParameter(O.UNPACK_IMAGE_HEIGHT),_n=it.getParameter(O.UNPACK_SKIP_PIXELS),$e=it.getParameter(O.UNPACK_SKIP_ROWS),Rr=it.getParameter(O.UNPACK_SKIP_IMAGES);it.pixelStorei(O.UNPACK_ROW_LENGTH,_e.width),it.pixelStorei(O.UNPACK_IMAGE_HEIGHT,_e.height),it.pixelStorei(O.UNPACK_SKIP_PIXELS,Et),it.pixelStorei(O.UNPACK_SKIP_ROWS,Vt),it.pixelStorei(O.UNPACK_SKIP_IMAGES,jt);let ji=w.isDataArrayTexture||w.isData3DTexture,yn=N.isDataArrayTexture||N.isData3DTexture;if(w.isDepthTexture){let oe=At.get(w),Ve=At.get(N),yi=At.get(oe.__renderTarget),Te=At.get(Ve.__renderTarget);it.bindFramebuffer(O.READ_FRAMEBUFFER,yi.__webglFramebuffer),it.bindFramebuffer(O.DRAW_FRAMEBUFFER,Te.__webglFramebuffer);for(let ke=0;ke<_t;ke++)ji&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,At.get(w).__webglTexture,W,jt+ke),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,At.get(N).__webglTexture,ft,Ce+ke)),O.blitFramebuffer(Et,Vt,Et+bt,Vt+dt,wt,te,wt+bt,te+dt,O.DEPTH_BUFFER_BIT,O.NEAREST);it.bindFramebuffer(O.READ_FRAMEBUFFER,null),it.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(W!==0||w.isRenderTargetTexture||At.has(w)){let oe=At.get(w),Ve=At.get(N);it.bindFramebuffer(O.READ_FRAMEBUFFER,P),it.bindFramebuffer(O.DRAW_FRAMEBUFFER,B);for(let yi=0;yi<_t;yi++)ji?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,oe.__webglTexture,W,jt+yi):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,oe.__webglTexture,W),yn?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ve.__webglTexture,ft,Ce+yi):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Ve.__webglTexture,ft),W!==0?O.blitFramebuffer(Et,Vt,Et+bt,Vt+dt,wt,te,wt+bt,te+dt,O.COLOR_BUFFER_BIT,O.NEAREST):yn?O.copyTexSubImage3D(Tt,ft,wt,te,Ce+yi,Et,Vt,bt,dt):O.copyTexSubImage2D(Tt,ft,wt,te,Et,Vt,bt,dt);it.bindFramebuffer(O.READ_FRAMEBUFFER,null),it.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else yn?w.isDataTexture||w.isData3DTexture?O.texSubImage3D(Tt,ft,wt,te,Ce,bt,dt,_t,ge,Ze,_e.data):N.isCompressedArrayTexture?O.compressedTexSubImage3D(Tt,ft,wt,te,Ce,bt,dt,_t,ge,_e.data):O.texSubImage3D(Tt,ft,wt,te,Ce,bt,dt,_t,ge,Ze,_e):w.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,ft,wt,te,bt,dt,ge,Ze,_e.data):w.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,ft,wt,te,_e.width,_e.height,ge,_e.data):O.texSubImage2D(O.TEXTURE_2D,ft,wt,te,bt,dt,ge,Ze,_e);it.pixelStorei(O.UNPACK_ROW_LENGTH,ei),it.pixelStorei(O.UNPACK_IMAGE_HEIGHT,he),it.pixelStorei(O.UNPACK_SKIP_PIXELS,_n),it.pixelStorei(O.UNPACK_SKIP_ROWS,$e),it.pixelStorei(O.UNPACK_SKIP_IMAGES,Rr),ft===0&&N.generateMipmaps===!0&&N.mipmapsAutoUpdate===!0&&O.generateMipmap(Tt),it.unbindTexture()},this.initRenderTarget=function(w){At.get(w).__webglFramebuffer===void 0&&Pt.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?Pt.setTextureCube(w,0):w.isData3DTexture?Pt.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?Pt.setTexture2DArray(w,0):Pt.setTexture2D(w,0),it.unbindTexture()},this.resetState=function(){z=0,k=0,J=null,it.reset(),ht.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return pi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ee._getDrawingBufferColorSpace(t),e.unpackColorSpace=ee._getUnpackColorSpace()}};var Iu=[{id:"induk",label:"Induk belang tiga",size:.96,sx:1,sy:1.05,sz:.95,girth:.9,head:.95,ear:1.18,tail:1.05,fur:.55,base:"#8b7964",stripe:"#3a3028",belly:"#c9bba6",white:"#f3f0ea",patch:"#cf8a4c",patchStripe:"#a6612d",patchAmt:.5,stripeAmt:.85,whiteAmt:.56,lip:"#3e302a",nose:"#d9958a",earInner:"#e3a69a",eye:"#b8b14a",eye2:"#b8b14a",pupil:.42,lids:.92,seed:3.7,temper:"calm"},{id:"belang",label:"Anak belang abu",size:.6,sx:.9,sy:.9,sz:.95,girth:.98,head:1.26,ear:1.22,tail:.72,fur:.95,kitten:!0,base:"#8d8270",stripe:"#2d2924",belly:"#b9ae9b",white:"#f2efe9",patch:"#000000",patchStripe:"#000000",patchAmt:0,stripeAmt:.9,whiteAmt:.38,lip:"#3a302a",nose:"#d29890",earInner:"#e8aaa0",eye:"#8fa3a6",eye2:"#8fa3a6",pupil:.5,lids:1,seed:11.2,temper:"playful"},{id:"oranye",label:"Anak oranye",size:.6,sx:.9,sy:.9,sz:.97,girth:1,head:1.26,ear:1.2,tail:.72,fur:.95,kitten:!0,base:"#df9f62",stripe:"#bd7034",belly:"#f0cfa6",white:"#f6efe5",patch:"#000000",patchStripe:"#000000",patchAmt:0,stripeAmt:.75,whiteAmt:.36,lip:"#6e4a3c",nose:"#e6a49c",earInner:"#ecaea4",eye:"#93a6a8",eye2:"#93a6a8",pupil:.5,lids:1,seed:5.9,temper:"playful"},{id:"aktif",label:"Belang abu si aktif",size:.82,sx:.98,sy:1,sz:.95,girth:1,paunch:1.15,head:1.04,ear:1.12,tail:.24,bobtail:!0,fur:.68,base:"#8a8274",stripe:"#29251f",belly:"#c4b7a1",white:"#ece6dc",patch:"#000000",patchStripe:"#000000",patchAmt:0,stripeAmt:.95,stripeP:2.5,whiteAmt:.04,lip:"#3a302a",nose:"#c98e84",earInner:"#d9a59a",eye:"#a3ad4c",eye2:"#a3ad4c",pupil:.5,lids:1,seed:33.7,temper:"hyper"},{id:"putih",label:"Anak putih oranye",size:.58,sx:.88,sy:.92,sz:.94,girth:.95,head:1.27,ear:1.24,tail:.74,fur:.95,kitten:!0,base:"#e2a468",stripe:"#c7813f",belly:"#f2d6b4",white:"#f6f2ec",patch:"#000000",patchStripe:"#000000",patchAmt:0,stripeAmt:.45,whiteAmt:.86,lip:"#c58d86",nose:"#efb1ab",earInner:"#efb2a8",eye:"#a8a68a",eye2:"#a8a68a",pupil:.48,lids:1,seed:8.4,temper:"curious"},{id:"oyen",label:"Oyen",size:1,sx:1.02,sy:1,sz:1.06,girth:1.12,head:1.1,ear:1,tail:1,fur:.6,base:"#d4894b",stripe:"#b0622b",belly:"#e9b787",white:"#f1e2cd",patch:"#000000",patchStripe:"#000000",patchAmt:0,stripeAmt:.5,whiteAmt:0,stripeP:3.4,lip:"#7f5442",nose:"#d78676",earInner:"#e7a68e",eye:"#c4a443",eye2:"#c4a443",pupil:.42,lids:.55,seed:1.3,temper:"lazy",pees:!0},{id:"cuan",label:"Putih berkalung",size:.95,sx:.98,sy:1,sz:.97,girth:.98,head:1,ear:1.02,tail:1,fur:.7,base:"#f1eee7",stripe:"#f1eee7",belly:"#f4f1eb",white:"#f2efe8",patch:"#000000",patchStripe:"#000000",patchAmt:0,stripeAmt:0,whiteAmt:1,lip:"#d49893",nose:"#e8a4a0",earInner:"#f0b2ac",eye:"#b98a2f",eye2:"#d6ae3a",pupil:.42,lids:.82,seed:7.7,temper:"aloof",collar:"#d98ca2"},{id:"gendut",label:"Si gendut belang tiga",size:1.1,sx:1.03,sy:.95,sz:1.2,girth:1.32,paunch:1.6,head:1.06,ear:.94,tail:.95,fur:.8,base:"#6e695f",stripe:"#1e1b17",belly:"#c6bba9",white:"#f5f2ed",legT:1.22,patchScale:1.5,patch:"#b9783f",patchStripe:"#8e5427",patchAmt:.36,stripeAmt:.95,stripeP:3.3,whiteAmt:.24,blaze:.6,lip:"#3a2d27",nose:"#cf8f83",earInner:"#dba89b",eye:"#b5b148",eye2:"#b5b148",pupil:.62,lids:1,seed:21.3,temper:"shy"}];function sc(s,t,e=0,i=0){let n=Math.cos(-e),r=Math.sin(-e),a=Math.cos(-i),o=Math.sin(-i);return(c,l,h)=>{let u=c-s[0],d=l-s[1],f=h-s[2];if(i){let E=u*a+f*o;f=-u*o+f*a,u=E}if(e){let E=u*n-d*r;d=u*r+d*n,u=E}let g=u/t[0],_=d/t[1],m=f/t[2],p=Math.sqrt(g*g+_*_+m*m),y=u/(t[0]*t[0]),b=d/(t[1]*t[1]),v=f/(t[2]*t[2]),T=Math.sqrt(y*y+b*b+v*v);return T<1e-9?-Math.min(t[0],t[1],t[2]):p*(p-1)/T}}function Lu(s,t){return(e,i,n)=>Math.hypot(e-s[0],i-s[1],n-s[2])-t}function Du(s,t,e,i=e){let n=t[0]-s[0],r=t[1]-s[1],a=t[2]-s[2],o=n*n+r*r+a*a;return(c,l,h)=>{let u=c-s[0],d=l-s[1],f=h-s[2],g=(u*n+d*r+f*a)/o;g=g<0?0:g>1?1:g;let _=u-n*g,m=d-r*g,p=f-a*g;return Math.sqrt(_*_+m*m+p*p)-(e+(i-e)*g)}}function Nu(s,t,e){if(e<=0)return Math.min(s,t);let i=Math.max(e-Math.abs(s-t),0)/e;return Math.min(s,t)-i*i*e*.25}function Ig(s,t,e){return-Nu(-s,-t,e)}function rc(s){return(t,e,i)=>{let n=1e9;for(let r=0;r<s.length;r++){let a=s[r],o=a.f(t,e,i);a.sub?n=Ig(n,-o,a.k||0):n=r===0?o:Nu(n,o,a.k||0)}return n}}function ac(s,t,e,i,n=.03){let r=s(t+n,e,i)-s(t-n,e,i),a=s(t,e+n,i)-s(t,e-n,i),o=s(t,e,i+n)-s(t,e,i-n),c=Math.hypot(r,a,o)||1;return[r/c,a/c,o/c]}function Fn(s,t,e,i){let n=i,r=s(t[0]+e[0]*n,t[1]+e[1]*n,t[2]+e[2]*n);if(r<=0)return i;let a=0;for(;n>0&&a++<200;){let o=Math.max(r*.72,.04),c=n-o,l=s(t[0]+e[0]*c,t[1]+e[1]*c,t[2]+e[2]*c);if(l<=0){let h=c,u=n;for(let d=0;d<12;d++){let f=(h+u)*.5;s(t[0]+e[0]*f,t[1]+e[1]*f,t[2]+e[2]*f)<=0?h=f:u=f}return(h+u)*.5}n=c,r=l}return-1}var Uu=`
varying vec3 vRest;
varying vec2 vLoc;
varying float vShell;
varying float vPart;
varying float vAO;
varying vec3 vTan;
varying vec3 vCombR;
`,Lg=`
float hash13(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 p) {
  vec3 i = floor(p); vec3 f = fract(p); f = f * f * (3.0 - 2.0 * f);
  float a = hash13(i), b = hash13(i + vec3(1,0,0)), c = hash13(i + vec3(0,1,0)), d = hash13(i + vec3(1,1,0));
  float e = hash13(i + vec3(0,0,1)), g = hash13(i + vec3(1,0,1)), h = hash13(i + vec3(0,1,1)), k = hash13(i + vec3(1,1,1));
  return mix(mix(mix(a,b,f.x), mix(c,d,f.x), f.y), mix(mix(e,g,f.x), mix(h,k,f.x), f.y), f.z);
}
float fbm(vec3 p) { return vnoise(p) * 0.55 + vnoise(p * 2.03 + 7.1) * 0.3 + vnoise(p * 4.1 + 2.3) * 0.15; }
`,Dg=`
uniform vec3 uBase, uStripe, uBelly, uWhite, uPatch, uPatchStripe, uLip;
uniform float uPatchS, uBlaze, uStripeP, uStripeAmt, uWhiteAmt, uPatchAmt, uSeed, uHeadS, uSpineLen, uTailLen, uDensity, uKitten;
uniform vec3 uHeadC;
uniform vec3 uKeyDir, uKeyCol;

float band(float x, float c, float w) { return 1.0 - smoothstep(0.0, w, abs(x - c)); }

float vLocBlaze = 0.0;
vec3 coatColor(out float faceShort) {
  vec3 p = vRest;
  float part = vPart;
  float n1 = fbm(p * 0.21 + uSeed);
  float n2 = fbm(p * 0.55 + uSeed * 1.7);
  float stripeM = 0.0, whiteM = 0.0, bellyM = 0.0, lipM = 0.0, capKeep = 0.0;
  float W = uWhiteAmt;
  faceShort = 0.0;
  if (part < 0.5) {
    // torso: vLoc.x = distance along the spine from the rump, vLoc.y = dorsality (1 top, -1 belly)
    float s = vLoc.x, dors = vLoc.y;
    float st = sin((s + (n1 - 0.5) * 7.0 + dors * 1.4) * 6.2831853 / uStripeP);
    stripeM = smoothstep(-0.25, 0.95, st) * smoothstep(-0.55, 0.3, dors) * (0.55 + 0.65 * n2);
    stripeM = max(stripeM, smoothstep(0.78, 0.97, dors) * 0.85);
    bellyM = smoothstep(-0.05, -0.75, dors);
    float front = smoothstep(uSpineLen * 0.6, uSpineLen * 0.86, s);
    float wt = mix(-1.25, 0.8, W) + front * 0.5 * step(0.05, W) + (n2 - 0.5) * 0.7;
    whiteM = smoothstep(wt + 0.07, wt - 0.07, dors);
    if (W > 0.75) whiteM = max(whiteM, smoothstep(0.62, 0.55, n1 + (W - 0.86) * 0.8));
  } else if (part < 1.5 || part > 4.5) {
    // head (1) and ear backs (5) in canonical head coordinates
    vec3 h = (p - uHeadC) / uHeadS;
    float az = abs(h.z);
    if (part > 4.5) {
      stripeM = 0.35 + 0.4 * smoothstep(5.0, 7.5, h.y);
      capKeep = 1.0;
    } else {
      float fore = smoothstep(0.9, 1.6, h.y) * smoothstep(3.1, 2.1, h.x) * smoothstep(2.4, 1.6, az);
      float fl = smoothstep(0.25, 0.85, sin((az + (n1 - 0.5) * 0.6) * 6.2831853 / 0.95 + 1.2));
      stripeM = fore * fl;
      float crown = smoothstep(-0.2, -1.4, h.x) * smoothstep(-0.5, 1.2, h.y);
      stripeM = max(stripeM, crown * smoothstep(0.2, 0.8, sin((h.x + (n1 - 0.5) * 1.5) * 6.2831853 / 1.5)));
      float cheek = smoothstep(1.7, 2.3, az) * band(h.y, -0.35, 1.0) * smoothstep(2.4, 1.0, h.x);
      stripeM = max(stripeM, cheek * smoothstep(0.3, 0.8, sin((h.y + 0.3 * h.x + (n1 - 0.5) * 0.5) * 6.2831853 / 0.95)));
      float muzzle = smoothstep(2.0, 2.8, h.x) * smoothstep(0.25, -0.55, h.y);
      float chin = smoothstep(-1.6, -2.1, h.y) * smoothstep(1.2, 2.2, h.x);
      bellyM = max(muzzle, chin) * 0.9 + smoothstep(-1.2, -2.6, h.y) * 0.6;
      stripeM *= 1.0 - muzzle;
      // white face for bicolours: muzzle and chin first, then a blaze, then all but the cap
      float faceW = 0.0;
      if (W > 0.2) faceW = max(muzzle, chin) * smoothstep(0.2, 0.35, W);
      if (W > 0.2) faceW = max(faceW, smoothstep(-1.0, -1.8, h.y) * smoothstep(0.2, 0.35, W));
      float blazeW = clamp((W - 0.42) * 2.2, 0.0, 1.2);
      faceW = max(faceW, smoothstep(blazeW * 0.75 + 0.05, blazeW * 0.75 - 0.05, az) * smoothstep(1.6, 2.4, h.x) * smoothstep(2.6, 1.8, h.y) * step(0.45, W));
      if (W > 0.8) faceW = max(faceW, smoothstep(1.25 + (n2 - 0.5) * 0.8, 0.85 + (n2 - 0.5) * 0.8, h.y) * smoothstep(-2.2, -0.6, h.x + h.y * 0.2));
      whiteM = faceW;
      capKeep = 0.0;
      float blz = smoothstep(0.75 - h.y * 0.12, 0.2, az) * smoothstep(1.6, 2.7, h.x) * smoothstep(2.2, 1.2, h.y) * smoothstep(-0.9, -0.3, h.y) * (0.7 + 0.5 * n2);
      faceShort = max(faceShort, 0.0);
      vLocBlaze = blz * uBlaze;
      if (W > 0.97) whiteM = 1.0;
      // eye rims, nose bridge leather line, philtrum and mouth
      vec3 e = vec3(2.2, 0.88, 1.75);
      float de = length(vec3(h.x, h.y, az) - e) - 1.14;
      lipM = smoothstep(0.32, 0.06, de) * 0.85;
      faceShort = smoothstep(0.9, 0.2, de);
      float phil = smoothstep(0.08, 0.03, az) * smoothstep(3.7, 4.1, h.x) * band(h.y, -0.92, 0.3);
      float my = -1.22 - 0.2 * az + 0.24 * az * az;
      float mouth = band(h.y, my, 0.05) * smoothstep(1.25, 0.95, az) * smoothstep(3.0, 3.6, h.x + az * 0.45);
      lipM = max(lipM, max(phil, mouth) * 0.55);
      
    }
  } else if (part < 3.5) {
    // legs: vLoc.y = outerness, rings on the outside, white socks from the paw up
    float y = p.y;
    float st = sin((y + (n1 - 0.5) * 2.5) * 6.2831853 / 2.3);
    stripeM = smoothstep(0.2, 0.8, st) * smoothstep(-0.6, 0.4, vLoc.y) * smoothstep(1.5, 4.0, y);
    bellyM = smoothstep(0.0, -0.8, vLoc.y) * 0.6;
    float pawH = mix(-1.5, 16.0, pow(W, 1.25)) + (part > 2.5 ? -0.5 : 0.8);
    whiteM = smoothstep(pawH + 0.7, pawH - 0.7, y + (n2 - 0.5) * 2.4);
    faceShort = smoothstep(2.6, 0.5, y) * 0.6;
  } else {
    // tail: rings, dark tip
    float s = vLoc.x;
    float st = sin((s + (n1 - 0.5) * 2.0) * 6.2831853 / 2.9);
    stripeM = smoothstep(0.05, 0.7, st) * (0.65 + 0.35 * vLoc.y);
    stripeM = max(stripeM, smoothstep(uTailLen - 4.0, uTailLen - 1.5, s) * step(9.0, uTailLen));
    capKeep = 1.0;
    whiteM = W > 0.97 ? 1.0 : 0.0;
  }
  if (capKeep > 0.5 && W < 0.97) whiteM = 0.0;
  vec3 non = mix(uBase, uStripe, clamp(stripeM, 0.0, 1.0) * uStripeAmt);
  non = mix(non, mix(uPatch, uPatchStripe, 0.25), clamp(vLocBlaze, 0.0, 1.0));
  if (uPatchAmt > 0.0) {
    float pm = smoothstep(0.48, 0.56, fbm(p * 0.12 * uPatchS + uSeed * 3.1) + (uPatchAmt - 0.5) * 0.35);
    vec3 ot = mix(uPatch, uPatchStripe, clamp(stripeM, 0.0, 1.0) * uStripeAmt * 0.7);
    non = mix(non, ot, pm);
  }
  non = mix(non, uBelly, clamp(bellyM, 0.0, 1.0) * 0.8 * (1.0 - step(0.97, W)));
  vec3 col = mix(non, uWhite, clamp(whiteM, 0.0, 1.0));
  col = mix(col, uLip, clamp(lipM, 0.0, 1.0));
  col *= 0.93 + 0.14 * n2;
  float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
  col = max(vec3(0.0), mix(vec3(lum), col, 1.14));
  return col;
}
`;function Fu(s,t){let e=r=>new vt(r),i={uBase:{value:e(s.base)},uStripe:{value:e(s.stripe)},uBelly:{value:e(s.belly)},uWhite:{value:e(s.white)},uPatch:{value:e(s.patch)},uPatchStripe:{value:e(s.patchStripe)},uLip:{value:e(s.lip)},uStripeAmt:{value:s.stripeAmt},uStripeP:{value:s.stripeP||2.8},uBlaze:{value:s.blaze||0},uPatchS:{value:s.patchScale||1},uWhiteAmt:{value:s.whiteAmt},uPatchAmt:{value:s.patchAmt},uSeed:{value:s.seed},uHeadS:{value:t.headS},uHeadC:{value:new U().fromArray(t.headC)},uSpineLen:{value:t.spineLen},uTailLen:{value:t.tailLen},uFurLen:{value:t.furLen},uDensity:{value:2},uPuff:{value:1},uKeyDir:{value:new U(-.55,1,.85).normalize()},uKeyCol:{value:new vt(1,.94,.86)},uKitten:{value:s.kitten?1:0}},n=new Cn({roughness:.88,metalness:0,envMapIntensity:.5,sheen:.55,sheenRoughness:.55,sheenColor:16777215});return n.alphaTest=.5,n.alphaToCoverage=!0,n.onBeforeCompile=r=>{Object.assign(r.uniforms,i),r.vertexShader=Uu+`
attribute float aShell; attribute vec2 aLoc; attribute vec3 aComb; attribute float aPart; attribute float aFurL; attribute float aAO;
uniform float uFurLen, uPuff;
`+r.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vRest = position; vLoc = aLoc; vShell = aShell; vPart = aPart; vAO = aAO; vCombR = aComb;
#ifdef USE_SKINNING
vTan = normalize(normalMatrix * (skinMatrix * vec4(aComb, 0.0)).xyz);
#else
vTan = normalize(normalMatrix * aComb);
#endif
float furL = uFurLen * uPuff * aFurL * aShell;
transformed += normal * furL + aComb * (furL * aShell * 0.9);
`),r.fragmentShader=Uu+Lg+Dg+r.fragmentShader.replace("#include <color_fragment>",`
float faceShort;
vec3 coat = coatColor(faceShort);
float sh = vShell;
float ao = mix(0.84, 1.03, pow(sh, 0.7));
diffuseColor.rgb = coat * ao * mix(vAO, 1.0, sh * 0.55);
diffuseColor.a = 1.0;
if (sh > 0.001) {
  vec3 cr = normalize(vCombR + 1e-4);
  vec3 q = vRest * uDensity;
  q -= cr * dot(q, cr) * 0.62;
  vec3 ci = floor(q); vec3 f = fract(q);
  float hgt = 0.35 + 0.65 * hash13(ci);
  vec3 jit = vec3(hash13(ci + 7.1), hash13(ci + 3.3), hash13(ci + 1.7)) * 0.6 + 0.2;
  float d = length(f - jit);
  float rad = 0.62 * (1.0 - sh / hgt);
  diffuseColor.a = clamp((rad - d) * 4.0 + 0.5, 0.0, 1.0);
  diffuseColor.rgb *= 0.985 + 0.03 * hash13(ci + 9.4);
  diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.1, 1.07, 1.02) + 0.035, smoothstep(0.5, 0.95, sh) * uStripeAmt * 0.6 * (1.0 - step(0.97, uWhiteAmt)));
}
`).replace("#include <lights_physical_fragment>",qt.lights_physical_fragment.replace("material.sheenColor = sheenColor;","material.sheenColor = sheenColor * mix(diffuseColor.rgb, vec3(1.0), 0.12);")).replace("#include <opaque_fragment>",`{
  vec3 T = normalize(vTan);
  vec3 Nf = normalize(normal);
  vec3 Lk = normalize(uKeyDir);
  vec3 Hk = normalize(Lk + vec3(0.0, 0.0, 1.0));
  vec3 T1 = normalize(T + Nf * 0.2), T2 = normalize(T - Nf * 0.14);
  float th1 = dot(T1, Hk), th2 = dot(T2, Hk);
  float s1 = pow(sqrt(max(0.0, 1.0 - th1 * th1)), 110.0);
  float s2 = pow(sqrt(max(0.0, 1.0 - th2 * th2)), 26.0);
  float lit = clamp(dot(Nf, Lk) * 0.65 + 0.35, 0.0, 1.0);
  outgoingLight += uKeyCol * lit * (s1 * 0.09 + s2 * 0.11 * diffuseColor.rgb) * (0.3 + 0.7 * vShell);
  float rim = pow(1.0 - clamp(Nf.z, 0.0, 1.0), 2.6);
  outgoingLight += diffuseColor.rgb * uKeyCol * rim * 0.16 * (0.25 + 0.75 * vShell);
}
#include <opaque_fragment>
	gl_FragColor.a = 1.0;`)},n.userData.uniforms=i,n}var vs=Math.PI/180,ne=(s,t)=>[s[0]+t[0],s[1]+t[1],s[2]+t[2]],Se=(s,t)=>[s[0]-t[0],s[1]-t[1],s[2]-t[2]],Ot=(s,t)=>[s[0]*t,s[1]*t,s[2]*t],Ms=(s,t)=>s[0]*t[0]+s[1]*t[1]+s[2]*t[2],Sr=(s,t)=>[s[1]*t[2]-s[2]*t[1],s[2]*t[0]-s[0]*t[2],s[0]*t[1]-s[1]*t[0]],_i=s=>Math.hypot(s[0],s[1],s[2]),Le=s=>{let t=_i(s)||1;return[s[0]/t,s[1]/t,s[2]/t]},Ss=(s,t,e)=>[s[0]+(t[0]-s[0])*e,s[1]+(t[1]-s[1])*e,s[2]+(t[2]-s[2])*e],bs=(s,t,e)=>s<t?t:s>e?e:s,qe=(s,t,e)=>{let i=bs((e-s)/(t-s),0,1);return i*i*(3-2*i)};function Ng(s,t,e){let i=Se(e,t),n=Se(s,t),r=bs(Ms(n,i)/Ms(i,i),0,1);return _i(Se(n,Ot(i,r)))}function Ug(s){let t=(n,r,a=0)=>[n*s.sx*.87,r*s.sy*.95,a*s.sz],e=s.head*1.22,i={};i.pelvis=t(-13,23),i.spine1=t(-3,23.2),i.spine2=t(7,22.8),i.neck=t(13.3,23.8),i.head=t(18.4,27.9),i.headC=ne(i.head,[3.2*e,1.7*e,0]),i.tail0=t(-19.5,24.5),i.tailDir=Le([-1,-.18,0]),i.tailSeg=3.5*s.tail;for(let n of[1,-1]){let r=n>0?"R":"L";i["shoulder"+r]=t(12,19.8,3.6*n),i["elbow"+r]=t(10,12.6,3.6*n),i["wrist"+r]=t(10.8,2.9,3.5*n),i["ftoe"+r]=[i["wrist"+r][0]+2.15*s.sx,1,3.45*n*s.sz],i["hip"+r]=t(-14,20.5,4*n),i["knee"+r]=t(-8.8,13.2,4.1*n),i["hock"+r]=t(-15.5,6.2,3.9*n),i["ankle"+r]=[i["hock"+r][0]+.85*s.sx,2.2,3.8*n*s.sz],i["htoe"+r]=[i["ankle"+r][0]+2.35*s.sx,1,3.75*n*s.sz]}for(let n of[1,-1]){let r=n>0?"R":"L";i["ear"+r]=ne(i.headC,Ot([-.8,2.95,2.3*n],e))}return i}function Fg(s){let t=[],e={},i=(h,u,d)=>{let f=new os;f.name=h;let g=d?d.userData.bindPos:[0,0,0];return f.position.fromArray(Se(u,g)),f.userData.bindPos=u.slice(),d&&d.add(f),f.userData.index=t.length,t.push(f),e[h]=f,f},n=i("pelvis",s.pelvis,null),r=i("spine1",s.spine1,n),a=i("spine2",s.spine2,r),o=i("neck",s.neck,a),c=i("head",s.head,o);i("earR",s.earR,c),i("earL",s.earL,c);let l=n;for(let h=0;h<8;h++)l=i("tail"+h,ne(s.tail0,Ot(s.tailDir,s.tailSeg*h)),l);for(let h of["R","L"]){let u=i("upperF"+h,s["shoulder"+h],a),d=i("lowerF"+h,s["elbow"+h],u);i("pawF"+h,s["wrist"+h],d);let f=i("thigh"+h,s["hip"+h],n),g=i("shin"+h,s["knee"+h],f),_=i("meta"+h,s["hock"+h],g);i("pawH"+h,s["ankle"+h],_)}return{bones:t,byName:e}}var oc=class{constructor(){this.pos=[],this.nor=[],this.si=[],this.sw=[],this.loc=[],this.comb=[],this.part=[],this.furl=[],this.idx=[],this.n=0}v(t,e,i,n,r,a,o){this.pos.push(t[0],t[1],t[2]),this.nor.push(e[0],e[1],e[2]);let c=i.slice().sort((h,u)=>u[1]-h[1]).slice(0,4),l=0;for(let h of c)l+=h[1];for(let h=0;h<4;h++)this.si.push(c[h]?c[h][0]:0),this.sw.push(c[h]?c[h][1]/l:0);return this.loc.push(n[0],n[1]),this.comb.push(r[0],r[1],r[2]),this.part.push(a),this.furl.push(o),this.n++}t(t,e,i){this.idx.push(t,e,i)}};function lc(s,t,e){for(let i=0;i<t.length-1;i++){let n=t[i],r=t[i+1],a=n.length;for(let o=0;o<a;o++){let c=(o+1)%a;e?(s.t(n[o],n[c],r[o]),s.t(n[c],r[c],r[o])):(s.t(n[o],r[o],n[c]),s.t(n[c],r[o],r[c]))}}}function Ao(s,t,e,i){let n=t.length;for(let r=0;r<n;r++){let a=(r+1)%n;i?s.t(t[r],t[a],e):s.t(t[a],t[r],e)}}function Og(s,t){let e=s.girth,i=(c,l,h=0)=>[c*s.sx*.87,l*s.sy*.95,h*s.sz],n=(c,l,h=0)=>sc(i(c[0],c[1],c[2]),[l[0]*s.sx*.9,l[1]*s.sy*e,l[2]*s.sz*e],h*vs),r=[{f:n([-13,22.6,0],[7.8,5.2,5.4])},{f:n([-4,22.3,0],[9,5,5.1]),k:3},{f:n([5.5,21.6,0],[9.2,6,5.8]),k:3},{f:n([11.8,19.6,0],[4.6,5.8,4.8]),k:2.5},{f:n([-5,18-((s.paunch||1)-1)*2.4,0],[8*(1+((s.paunch||1)-1)*.35),3.4*(s.paunch||1),4.8*(1+((s.paunch||1)-1)*.6)]),k:2.8+((s.paunch||1)-1)*2},{f:n([-18.5,23.4,0],[4,4.4,4.4]),k:2}];for(let c of[1,-1])r.push({f:n([-11.8,17.8,3.9*c],[5.2,7,3],36),k:2.4}),r.push({f:n([11.2,16.8,3.5*c],[3.2,5,2.3],-16),k:2}),r.push({f:n([10.6,23.6,3*c],[4.2,2.6,2],-28),k:2});let a=s.head*1.22,o=ne(t.head,Ot([.9,.6,0],a));return r.push({f:Du(i(13.2,23.4),o,3.9*e*s.sz,3.4*e*s.sz*Math.max(1,a*.8)),k:2.5}),rc(r)}function*Bg(s,t,e,i){let n=Og(t,e),r=(I,F)=>new U(I*t.sx*.87,F*t.sy*.95,0),a=e.neck,o=e.head,c=[r(-20.6,23.2),r(-18,23.3),r(-13,22.8),r(-6,22.4),r(1,22),r(7,22.2),r(11.8,22.8),r(14.8,24.6),new U().fromArray(Ss(a,o,.7)),new U().fromArray(ne(o,Ot([1,.9,0],t.head*1.22)))],l=new Qs(c,!1,"centripetal"),h=l.getLength(),u=Math.round(h/.72),d=36,f=15*Math.max(t.sx,t.sy,t.sz)*Math.max(1,t.girth),g=[[i.pelvis,e.pelvis,e.spine1,13],[i.spine1,e.spine1,e.spine2,13],[i.spine2,e.spine2,e.neck,13],[i.neck,e.neck,e.head,9],[i.head,e.head,e.headC,6],[i.tail0,e.tail0,ne(e.tail0,Ot(e.tailDir,e.tailSeg)),4],[i.thighR,e.hipR,e.kneeR,5.6],[i.thighL,e.hipL,e.kneeL,5.6],[i.upperFR,e.shoulderR,e.elbowR,4.6],[i.upperFL,e.shoulderL,e.elbowL,4.6]],_=I=>{let F=[],P=null,B=1e9;for(let[z,k,J,H]of g){let Z=Ng(I,k,J),tt=Math.pow(Math.max(0,1-Z/H),3);tt>1e-4&&F.push([z.userData.index,tt]),Z/H<B&&(B=Z/H,P=z)}return F.length||F.push([P.userData.index,1]),F},m=[0,1,0],p=[],y=[];for(let I=0;I<=u;I++){let F=I/u,P=l.getPointAt(F).toArray(),B=Le(l.getTangentAt(F).toArray()),z=Le(Se(m,Ot(B,Ms(m,B)))),k=Sr(B,z);y.push({c:P,T:B,N:z,B:k,s:F*h})}let b=(I,F,P)=>{let B=ac(n,I[0],I[1],I[2]),z=B[1],k=qe(h*.7,h*.85,F)*qe(.2,-.6,z),J=1+.15*qe(-.3,-.8,z)+.35*k;return s.v(I,B,_(I),[F,z],P,0,J)},v=I=>Le(ne(Ot(I,-1),[0,-.35,0])),T=6,E=y[0],x=E.c,S=[];for(let I=T;I>=1;I--){let F=I/T*(Math.PI/2)*.96,P=[];for(let B=0;B<d;B++){let z=B/d*Math.PI*2,k=ne(Ot(E.N,Math.cos(z)),Ot(E.B,Math.sin(z))),J=Le(ne(Ot(k,Math.cos(F)),Ot(E.T,-Math.sin(F)))),H=Fn(n,x,J,f);H<0&&(H=.5),P.push(b(ne(x,Ot(J,H)),-H*Math.sin(F),v(E.T)))}S.push(P)}{let I=Fn(n,x,Ot(E.T,-1),f);I<0&&(I=.5);let F=b(ne(x,Ot(E.T,-I)),-I,v(E.T));Ao(s,S[0],F,!1)}let C=0;for(let I of y){++C%6===0&&(yield);let F=[];for(let P=0;P<d;P++){let B=P/d*Math.PI*2,z=ne(Ot(I.N,Math.cos(B)),Ot(I.B,Math.sin(B))),k=Fn(n,I.c,z,f);k<0&&(k=1),F.push(b(ne(I.c,Ot(z,k)),I.s,v(I.T)))}p.push(F)}let R=y[y.length-1],D=[];for(let I=1;I<=T;I++){let F=I/T*(Math.PI/2)*.96,P=[];for(let B=0;B<d;B++){let z=B/d*Math.PI*2,k=ne(Ot(R.N,Math.cos(z)),Ot(R.B,Math.sin(z))),J=Le(ne(Ot(k,Math.cos(F)),Ot(R.T,Math.sin(F)))),H=Fn(n,R.c,J,f);H<0&&(H=.5),P.push(b(ne(R.c,Ot(J,H)),h+H*Math.sin(F),v(R.T)))}D.push(P)}{let I=Fn(n,R.c,R.T,f);I<0&&(I=.5);let F=b(ne(R.c,Ot(R.T,I)),h+I,v(R.T));lc(s,[...S,...p,...D],!0),Ao(s,D[D.length-1],F,!0)}return{spineLen:h,field:n}}function cc(s,t,e,i,n){let r=[],a=[0];for(let S=0;S<t.length-1;S++)r.push(_i(Se(t[S+1],t[S]))),a.push(a[S]+r[S]);let o=a[a.length-1],c=S=>{S=bs(S,0,o);let C=0;for(;C<r.length-1&&S>a[C+1];)C++;let R=(S-a[C])/r[C];return{p:Ss(t[C],t[C+1],R),k:C,t:R,d0:S-a[C],d1:a[C+1]-S}},l=S=>Le(Se(c(S+.6).p,c(S-.6).p)),h=n.blend||.9,u=S=>{let C=c(S),R=C.k,D=[[e[R],1]];if(C.d0<h&&R>0){let I=.5+.5*(C.d0/h);D[0][1]=I,D.push([e[R-1],1-I])}else if(C.d1<h&&R<e.length-1){let I=.5+.5*(C.d1/h);D[0][1]=I,D.push([e[R+1],1-I])}return D},d=n.M||14,f=n.step||.5,g=Math.max(4,Math.round(o/f)),_=Le(Se(n.n0,Ot(l(0),Ms(n.n0,l(0))))),m=l(0),p=[],y=null;for(let S=0;S<=g;S++){let C=S/g*o,R=l(C),D=Sr(m,R),I=_i(D);if(I>1e-6){let Z=Math.atan2(I,Ms(m,R));_=new U().fromArray(_).applyAxisAngle(new U().fromArray(Le(D)),Z).toArray()}_=Le(Se(_,Ot(R,Ms(_,R)))),m=R;let F=Sr(R,_),P=c(C).p,[B,z,k]=i(C,o),J=[],H=u(C);for(let Z=0;Z<d;Z++){let tt=Z/d*Math.PI*2,St=Math.cos(tt),Ft=Math.sin(tt),$=St*B;k&&St<0&&($*=1-k);let pt=ne(P,ne(Ot(_,$),Ot(F,Ft*z))),yt=Le(ne(Ot(_,St/B*(k&&St<0?1/(1-k):1)),Ot(F,Ft/z)));J.push(s.v(pt,yt,H,[C,n.q(yt)],n.comb(R),n.part,n.furl(C,o)))}p.push(J),y={c:P,T:R,N:_,B:F,rN:B,rB:z,flat:k,w:H,s:C}}lc(s,p,!0);let b=c(0).p,v=s.v(b,Ot(l(0),-1),u(0),[0,0],n.comb(l(0)),n.part,.2);Ao(s,p[0],v,!1);let T=4,E=p[p.length-1],x=y;for(let S=1;S<=T;S++){let C=S/T*Math.PI/2*1;if(S===T){let P=ne(x.c,Ot(x.T,Math.min(x.rN,x.rB)*.95)),B=s.v(P,x.T,x.w,[o+1,0],n.comb(x.T),n.part,n.furl(o,o));Ao(s,E,B,!0);break}let R=Math.cos(C),D=Math.sin(C)*Math.min(x.rN,x.rB)*.95,I=ne(x.c,Ot(x.T,D)),F=[];for(let P=0;P<d;P++){let B=P/d*Math.PI*2,z=Math.cos(B),k=Math.sin(B),J=z*x.rN*R;x.flat&&z<0&&(J*=1-x.flat);let H=ne(I,ne(Ot(x.N,J),Ot(x.B,k*x.rB*R))),Z=Le(ne(Ot(ne(Ot(x.N,z),Ot(x.B,k)),R),Ot(x.T,Math.sin(C))));F.push(s.v(H,Z,x.w,[o+D,n.q(Z)],n.comb(x.T),n.part,n.furl(o,o)))}lc(s,[E,F],!0),E=F}return o}function kg(s,t,e,i){let n=t.sz*(.9+.1*t.girth)*1.14*(t.legT||1);for(let r of["R","L"]){let a=r==="R"?1:-1,o=c=>c[2]*a;{let c=e["shoulder"+r],l=e["elbow"+r],h=e["wrist"+r],u=e["ftoe"+r],d=[Ss(c,l,.22),l,h,u],f=_i(Se(l,d[0])),g=_i(Se(h,l)),_=_i(Se(u,h));cc(s,d,[i["upperF"+r].userData.index,i["lowerF"+r].userData.index,i["pawF"+r].userData.index],m=>{let p,y,b=0;if(m<f)p=y=2.6-.6*(m/f);else if(m<f+g)p=y=1.95-.5*((m-f)/g);else{let v=(m-f-g)/_;y=1.45+.25*Math.sin(Math.min(1,v*1.6)*Math.PI/2),p=1.42-.08*v,b=.26*Math.min(1,v*1.5)}return[p*n,y*n,b]},{n0:[1,0,0],M:14,step:.5,part:2,q:o,comb:m=>m,furl:(m,p)=>.75-.4*(m/p)})}{let c=e["hip"+r],l=e["knee"+r],h=e["hock"+r],u=e["ankle"+r],d=e["htoe"+r],f=[Ss(c,l,.42),l,h,u,d],g=_i(Se(l,f[0])),_=_i(Se(h,l)),m=_i(Se(u,h)),p=_i(Se(d,u));cc(s,f,[i["thigh"+r].userData.index,i["shin"+r].userData.index,i["meta"+r].userData.index,i["pawH"+r].userData.index],y=>{let b,v,T=0;if(y<g){let E=y/g;b=3.8-1.3*E,v=3.1-.8*E}else if(y<g+_){let E=(y-g)/_;b=2.3-.9*E,v=2-.65*E}else if(y<g+_+m){let E=(y-g-_)/m;b=1.35-.08*E,v=1.3-0*E}else{let E=(y-g-_-m)/p;v=1.35+.3*Math.sin(Math.min(1,E*1.6)*Math.PI/2),b=1.38-.06*E,T=.26*Math.min(1,E*1.5)}return[b*n,v*n,T]},{n0:[1,0,0],M:14,step:.5,part:3,q:o,comb:y=>y,furl:(y,b)=>.85-.5*(y/b)})}}}function zg(s,t,e,i){let n=[ne(e.tail0,Ot(e.tailDir,-2.2))];for(let c=0;c<=8;c++)n.push(ne(e.tail0,Ot(e.tailDir,e.tailSeg*c)));let r=[i.pelvis.userData.index];for(let c=0;c<8;c++)r.push(i["tail"+c].userData.index);let a=!!t.bobtail,o=1.55*Math.min(1.1,t.girth)*(t.kitten?.95:1)*(a?1.45:1);return cc(s,n,r,(c,l)=>{let h=c/l,u=a?o*(.92+.12*Math.sin(Math.PI*h)):o*(1-.32*h)*(h>.85?1-(h-.85)*1.2:1);return[u,u,0]},{n0:[0,1,0],M:12,step:a?.35:.55,part:4,q:c=>c[1],comb:c=>c,furl:(c,l)=>a?1.5+1.1*(c/l):1.3,blend:1.2})}function Hg(s){let t=s.kitten?1:0,e=t?.86:1,i=(o,c)=>sc(o,c),n=s.id==="oyen"?1.1:1,r=[{f:i([-.3,.6,0],[4.2,3.5,4])},{f:i([-1,-1.4,0],[2.6,1.9,2.6]),k:1.4}];for(let o of[1,-1])r.push({f:i([.6,-.5,2.2*o*n],[2.9,2.1,2.2*n]),k:1.4});for(let o of[1,-1])r.push({f:i([3.25*e,-1.05,.92*o],[1.45*e,1.08,1.22]),k:.7});r.push({f:i([2.9*e,.25,0],[1.9*e,1,1.2]),k:.9}),r.push({f:i([2.75*e,-2.15,0],[1.2*e,.7,1]),k:.6}),r.push({f:i([4.35*e+(t?.1:0),-.3,0],[.7,.6,.78]),k:.4});let a=t?1.1:1;for(let o of[1,-1])r.push({f:Lu([2.6-(t?.1:0),.9,1.78*o],1.1*a),k:.35,sub:!0});return rc(r)}function Gg(s){let t=(1+Math.sqrt(5))/2,e=[[-1,t,0],[1,t,0],[-1,-t,0],[1,-t,0],[0,-1,t],[0,1,t],[0,-1,-t],[0,1,-t],[t,0,-1],[t,0,1],[-t,0,-1],[-t,0,1]].map(Le),i=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];for(let n=0;n<s;n++){let r=new Map,a=[],o=(c,l)=>{let h=c<l?c+"_"+l:l+"_"+c;return r.has(h)?r.get(h):(e.push(Le(Ss(e[c],e[l],.5))),r.set(h,e.length-1),e.length-1)};for(let[c,l,h]of i){let u=o(c,l),d=o(l,h),f=o(h,c);a.push([c,u,f],[l,d,u],[h,f,d],[u,d,f])}i=a}return{verts:e,faces:i}}function*Vg(s,t,e,i){let n=Hg(t),r=t.head*1.22,a=e.headC,o=(g,_,m)=>n((g-a[0])/r,(_-a[1])/r,(m-a[2])/r)*r,c=ne(a,Ot([.6,-.2,0],r)),{verts:l,faces:h}=Gg(4),u=[],d=[2.25,.88,1.75],f=0;for(let g of l){++f%400===0&&(yield);let _=Fn(o,c,g,8.5*r);_<0&&(_=3*r);let m=ne(c,Ot(g,_)),p=ac(o,m[0],m[1],m[2],.02*r),y=Ot(Se(m,a),1/r),b=_i(Se([y[0],y[1],Math.abs(y[2])],d)),v=.6;v=Math.min(v,.12+.5*qe(1.1,2.2,b)),v=Math.min(v,.12+.6*(1-qe(2.4,3.6,y[0])*qe(.8,-.4,y[1]))),v+=.35*qe(1.8,2.8,Math.abs(y[2]))*qe(1,3,3.2-y[0])*qe(-2.4,-.8,y[1]),v+=.25*qe(-.5,-2.5,y[0]);let T=Le([-1,-.15,0]);u.push(s.v(m,p,[[i.head.userData.index,1]],[0,0],T,1,v))}for(let[g,_,m]of h)s.t(u[g],u[_],u[m]);return o}function zu(s,t,e){let i=s.head*1.22*s.ear;return{q:new Ie().setFromAxisAngle(new U(0,1,0),-e*24*vs).multiply(new Ie().setFromAxisAngle(new U(1,0,0),e*17*vs)).multiply(new Ie().setFromAxisAngle(new U(0,0,1),6*vs)),s:i,base:t[e>0?"earR":"earL"]}}function Fi(s,t,e,i,n){let r=e*.5*Math.pow(1-t,.72)*(1-.18*t)+.04,a=e*.34*Math.pow(1-t,.75),o=s*r,c=-a*(1-s*s);n&&(c-=(.16+.28*(1-t))*Math.sqrt(Math.max(0,1-s*s))+a*.08*(1-s*s));let l=t*i*(1-.08*s*s);return[c,l,o]}function Wg(s,t,e,i){for(let n of[1,-1]){let{q:r,s:a,base:o}=zu(t,e,n),c=i[n>0?"earR":"earL"].userData.index,l=4*a,h=4.4*a,u=10,d=9,f=[],g=_=>new U(_[0],_[1],_[2]*n).applyQuaternion(r).add(new U().fromArray(o)).toArray();for(let _=0;_<=d;_++){let m=_/d*.985,p=[];for(let y=0;y<=u;y++){let b=-1+2*y/u,v=Fi(b,m,l,h,!0),T=Se(Fi(Math.min(1,b+.03),m,l,h,!0),Fi(Math.max(-1,b-.03),m,l,h,!0)),E=Se(Fi(b,Math.min(.995,m+.03),l,h,!0),Fi(b,Math.max(0,m-.03),l,h,!0)),x=Le(Sr(E,T));x[0]>.2&&(x=Ot(x,-1));let S=g(v),C=new U(x[0],x[1],x[2]*n).applyQuaternion(r).toArray();p.push(s.v(S,C,[[c,1]],[m,0],[0,1,0],5,.32-.15*m))}f.push(p)}for(let _=0;_<d;_++)for(let m=0;m<u;m++){let p=f[_][m],y=f[_][m+1],b=f[_+1][m],v=f[_+1][m+1];n>0?(s.t(p,y,b),s.t(y,v,b)):(s.t(p,b,y),s.t(y,b,v))}}}function Xg(s,t,e,i,n){let r=[],a=[],o=[],c=[],l=[],h=[],u=new vt(i).lerp(new vt(n),.2),d=new vt(n).lerp(new vt("#f3eee6"),.45),f=new vt;for(let _ of[1,-1]){let{q:m,s:p,base:y}=zu(s,t,_),b=e[_>0?"earR":"earL"].userData.index,v=4*p,T=4.4*p,E=12,x=10,S=r.length/3;for(let C=0;C<=x;C++){let R=C/x*.98;for(let D=0;D<=E;D++){let I=-1+2*D/E,F=Fi(I*.97,R,v,T,!1),P=Se(Fi(Math.min(1,I+.03),R,v,T,!1),Fi(Math.max(-1,I-.03),R,v,T,!1)),B=Se(Fi(I,Math.min(.995,R+.03),v,T,!1),Fi(I,Math.max(0,R-.03),v,T,!1)),z=Le(Sr(P,B));z[0]<0&&(z=Ot(z,-1));let k=new U(F[0]+.02,F[1],F[2]*_).applyQuaternion(m).add(new U().fromArray(y)),J=new U(z[0],z[1],z[2]*_).applyQuaternion(m);r.push(k.x,k.y,k.z),a.push(J.x,J.y,J.z);let H=Math.pow(Math.abs(I),2.5),Z=qe(.6,0,R)*(.35+.65*Math.abs(I)),tt=(1-Math.abs(I))*(1-R*.8);f.copy(u).lerp(d,Math.min(1,H*.95+Z*.8)).multiplyScalar(1-tt*.5),o.push(f.r,f.g,f.b),c.push(b,0,0,0),l.push(1,0,0,0)}}for(let C=0;C<x;C++)for(let R=0;R<E;R++){let D=S+C*(E+1)+R,I=D+1,F=D+E+1,P=F+1;_>0?h.push(D,F,I,I,F,P):h.push(D,I,F,I,P,F)}}let g=new je;return g.setAttribute("position",new ue(r,3)),g.setAttribute("normal",new ue(a,3)),g.setAttribute("color",new ue(o,3)),g.setAttribute("skinIndex",new Tn(c,4)),g.setAttribute("skinWeight",new ue(l,4)),g.setIndex(h),g}function Ou(s,t){let i=document.createElement("canvas");i.width=i.height=128;let n=i.getContext("2d"),r=new vt(s),a=(l,h=1)=>`rgba(${Math.round(Math.min(255,r.r*255*l))},${Math.round(Math.min(255,r.g*255*l))},${Math.round(Math.min(255,r.b*255*l))},${h})`;n.fillStyle=a(.35),n.fillRect(0,0,128,128);let o=n.createRadialGradient(128/2,128/2,4,128/2,128/2,128*.46);o.addColorStop(0,a(1.25)),o.addColorStop(.45,a(1.08)),o.addColorStop(.85,a(.85)),o.addColorStop(1,a(.45)),n.fillStyle=o,n.beginPath(),n.arc(128/2,128/2,128*.46,0,Math.PI*2),n.fill();for(let l=0;l<160;l++){let h=Math.random()*Math.PI*2,u=128*(.1+Math.random()*.1),d=128*(.28+Math.random()*.17);n.strokeStyle=Math.random()<.5?a(1.3,.09):a(.65,.1),n.lineWidth=1,n.beginPath(),n.moveTo(128/2+Math.cos(h)*u,128/2+Math.sin(h)*u),n.lineTo(128/2+Math.cos(h)*d,128/2+Math.sin(h)*d),n.stroke()}n.strokeStyle="rgba(20,14,8,0.55)",n.lineWidth=128*.035,n.beginPath(),n.arc(128/2,128/2,128*.455,0,Math.PI*2),n.stroke();let c=new Rn(i);return c.colorSpace=We,c.anisotropy=4,c}function Bu(s,t){let e=new Cn({map:s,roughness:.2,clearcoat:1,clearcoatRoughness:.02,envMapIntensity:1.3});return e.onBeforeCompile=i=>{i.uniforms.uPupil=t,i.fragmentShader=`uniform float uPupil;
`+i.fragmentShader.replace("#include <map_fragment>",`#include <map_fragment>
  {
    vec2 pd = (vMapUv - 0.5) / vec2(max(0.04, uPupil) * 0.3, 0.3);
    float pm = 1.0 - smoothstep(0.8, 1.0, length(pd));
    diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.012, 0.009, 0.007), pm);
  }`)},e.customProgramCacheKey=()=>"cat-eye",e}function qg(s,t,e){let i=new Float32Array(s.n),n=s.pos,r=s.nor;for(let a=0;a<s.n;a++){let o=n[a*3],c=n[a*3+1],l=n[a*3+2],h=r[a*3],u=r[a*3+1],d=r[a*3+2],f=s.part[a],g=1;if(f===0){let _=t(o+h*1.4,c+u*1.4,l+d*1.4)/1.4,m=t(o+h*3,c+u*3,l+d*3)/3;g=.5+.5*bs((_+m)*.5,0,1),g*=.8+.2*qe(-.85,.15,u)}else if(f===2||f===3)g=.58+.42*qe(-.3,3.5,t(o,c,l)),c<2.2&&u<-.2&&(g*=.85);else if(f===1){g=.66+.34*qe(0,3,t(o,c,l));let _=e(o+h*.9,c+u*.9,l+d*.9)/.9;g*=.62+.38*bs(_,0,1),g*=.86+.14*qe(-.85,.1,u)}else f===4&&(g=.66+.34*qe(0,3,t(o,c,l)));i[a]=g}return i}function Yg(s){let t=new hn(s,28,20),e=t.attributes.position,i=t.attributes.uv;for(let n=0;n<e.count;n++){let r=e.getX(n),a=e.getY(n),o=e.getZ(n);r>0?i.setXY(n,.5+o/(2*s)*1,.5+a/(2*s)):i.setXY(n,.02,.02)}return t}function ku(s,t,e,i){let n=new hn(s,28,10,0,Math.PI*2,0,t),r=n.attributes.position,a=[],o=new vt(e),c=new vt(i),l=new vt;for(let h=0;h<r.count;h++){let u=r.getY(h)/s,d=Math.acos(bs(u,-1,1)),f=qe(t-.22,t-.02,d);l.copy(o).lerp(c,f),a.push(l.r,l.g,l.b)}return n.setAttribute("color",new ue(a,3)),n}function Zg(s,t,e,i){let n=e.head,r=s.head*1.22,a=t.headC,o=!!s.kitten,c=b=>Se(ne(a,Ot(b,r)),t.head),l=(o?1.24:1.12)*r,h=[];for(let b of[1,-1]){let v=new we;v.position.fromArray(c([2.2-(o?.1:0),.88,1.75*b])),v.quaternion.setFromAxisAngle(new U(0,1,0),-b*14*vs),n.add(v);let T=new ce(i.eyeGeo,b>0?i.eyeMatR:i.eyeMatL);v.add(T);let E=new ce(i.lidUpGeo,i.lidMat),x=new ce(i.lidLoGeo,i.lidMat),S=new we,C=new we;S.add(E),C.add(x),x.rotation.x=Math.PI,v.add(S),v.add(C),h.push({pivot:v,ball:T,upP:S,loP:C,side:b,rest:v.quaternion.clone()})}let u=new ce(i.noseGeo,i.noseMat);u.position.fromArray(c([4.86-(o?.42:0),-.18,0])),u.scale.set(r*.72,r*.95,r*1),n.add(u);let d=[],f=[],g=o?2.35:3.2,_=new vt("#f7f5ef"),m=(b,v)=>{for(let T=1;T<b.length;T++){d.push(...c(b[T-1]),...c(b[T]));let E=(T-1)/(b.length-1),x=T/(b.length-1);f.push(_.r,_.g,_.b,v*(1-E),_.r,_.g,_.b,v*(1-x))}};for(let b of[1,-1]){[[-.8,-12,0],[-1,0,0],[-1.2,11,0],[-.9,-5,1],[-1.1,6,1]].forEach(([T,E,x],S)=>{let C=[3.5-(o?.45:0)-x*.3,T,b*(1.02+x*.22)],R=E*vs,D=Le([.42,Math.sin(R)*.55,b*.9]),I=g*(1-x*.2)*(.92+.16*(S*37%10)/10),F=[];for(let P=0;P<=4;P++){let B=P/4;F.push(ne(C,ne(Ot(D,I*B),[0,-.45*B*B,0])))}m(F,.72)});for(let T=0;T<2;T++){let E=[2.45,1.95,b*(1.05+T*.35)],x=Le([.45,.8,b*.4]),S=[];for(let C=0;C<=3;C++){let R=C/3;S.push(ne(E,ne(Ot(x,1.6*R),[0,-.2*R*R,0])))}m(S,.45)}}let p=new je;p.setAttribute("position",new ue(d,3)),p.setAttribute("color",new ue(f,4));let y=new Ys(p,i.whiskerMat);return n.add(y),{eyes:h,nose:u,whiskers:y}}function $g(s,t,e,i){let n=e.neck,r=t.neck,a=t.head,o=Ss(r,a,.42),c=new U().fromArray(Le(Se(a,r))),l=new mi;l.position.fromArray(Se(o,r)),l.quaternion.setFromUnitVectors(new U(0,0,1),c);let h=l.quaternion.clone().invert(),u=4*s.girth*s.sz+.55,d=new ce(new js(u,.32,8,44),new ai({color:i,roughness:.55}));l.add(d);let f=new ai({color:"#dcdcd8",metalness:1,roughness:.25}),g=new ai({color:"#e3c27a",metalness:1,roughness:.3}),_=new U(0,-1,0),p=_.clone().sub(c.clone().multiplyScalar(_.dot(c))).normalize().clone().applyQuaternion(h),y=new U(1,.2,0).normalize().applyQuaternion(h),b=new ce(new Js(1,1,.14,24),f);b.quaternion.setFromUnitVectors(new U(0,1,0),y),b.position.copy(p).multiplyScalar(u+1.1).add(y.clone().multiplyScalar(.25));let v=new ce(new hn(.6,16,12),g),T=new U(0,0,1).applyQuaternion(h);return v.position.copy(p).multiplyScalar(u+.5).add(T.multiplyScalar(1.1)).add(y.clone().multiplyScalar(.4)),l.add(b),l.add(v),n.add(l),{group:l,tag:b}}function*Hu(s,t={}){let e=t.shells||6,i=Ug(s),{bones:n,byName:r}=Fg(i),a=new oc,{spineLen:o,field:c}=yield*Bg(a,s,i,r);yield,kg(a,s,i,r);let l=zg(a,s,i,r);yield;let h=yield*Vg(a,s,i,r);Wg(a,s,i,r),yield;let u=a.n,d=a.idx.length,f=e+1,g=(k,J,H=Float32Array)=>new ri(new H(k),J),_=new ar;_.setAttribute("position",g(a.pos,3)),_.setAttribute("normal",g(a.nor,3)),_.setAttribute("skinIndex",g(a.si,4,Uint16Array)),_.setAttribute("skinWeight",g(a.sw,4)),_.setAttribute("aLoc",g(a.loc,2)),_.setAttribute("aComb",g(a.comb,3)),_.setAttribute("aPart",g(a.part,1)),_.setAttribute("aFurL",g(a.furl,1)),_.setAttribute("aAO",g(qg(a,c,h),1));let m=new Float32Array(f);for(let k=0;k<f;k++)m[k]=k/e;_.setAttribute("aShell",new An(m,1)),_.instanceCount=f,_.setIndex(new ri(new Uint32Array(a.idx),1)),_.computeBoundingSphere();let p=Fu(s,{headS:s.head*1.22,headC:i.headC,spineLen:o,tailLen:l,furLen:s.fur}),y=new mi;y.add(n[0]),y.updateMatrixWorld(!0);let b=new Xs(n),v=new as(_,p);v.frustumCulled=!1,y.add(v),v.bind(b,new Zt);let T=s.whiteAmt>.97?s.white:s.base,E=new as(Xg(s,i,r,s.earInner,T),new ai({vertexColors:!0,roughness:.9,side:gi,emissive:new vt("#6a2a1e"),emissiveIntensity:.32}));E.frustumCulled=!1,y.add(E),E.bind(b,new Zt);let x=(s.kitten?1.24:1.12)*s.head*1.22,S=new vt(s.lip).multiplyScalar(.7).getStyle(),C=new vt(s.base).lerp(new vt(s.stripe),.25*s.stripeAmt),R=s.whiteAmt>.97?new vt(s.white):C,D=s.whiteAmt>.97?new vt(s.white):s.whiteAmt>.33?new vt(s.white).lerp(C,.25):new vt(s.belly).lerp(C,.4),I=new ai({vertexColors:!0,roughness:.85}),F={value:s.pupil},P={eyeGeo:Yg(x),eyeMatR:Bu(Ou(s.eye,s.pupil),F),eyeMatL:Bu(Ou(s.eye2,s.pupil),F),lidUpGeo:ku(x*1.024,1.25,R.getStyle(),S),lidLoGeo:ku(x*1.02,1.25,D.getStyle(),S),lidMat:I,noseGeo:(()=>{let k=new hn(.52,20,14),J=k.attributes.position;for(let H=0;H<J.count;H++){let Z=J.getY(H);J.setZ(H,J.getZ(H)*(1.15+.5*Z)),J.setY(H,Z*.78),J.setX(H,J.getX(H)*.8)}return k.computeVertexNormals(),k})(),noseMat:new ai({color:new vt(s.nose).lerp(new vt(s.lip),.14),roughness:.62}),whiskerMat:new cs({vertexColors:!0,transparent:!0,depthWrite:!1})},B=Zg(s,i,r,P),z=null;return s.collar&&(z=$g(s,i,r,s.collar)),{P:s,J:i,bones:n,B:r,skeleton:b,model:y,body:v,earIn:E,face:B,collar:z,furMat:p,spineLen:o,tailLen:l,eyeR:x,pupilU:F,layers:f,shells:e}}var xe=U,dc=Ie,Rt=Math.PI/180,hc=new xe(1,0,0),On=new xe(0,1,0),ws=new xe(0,0,1),Ki=(s,t,e)=>s<t?t:s>e?e:s,Fe=(s,t,e)=>s+(t-s)*e,Kg=s=>s*s*(3-2*s),Ji=new dc,Gu=new dc,Vu=new xe,Jg=new xe,uc=new xe;function De(s){return new xe(s[0],s[1],s[2])}var Ro=class{constructor(t){this.cat=t;let e=t.B,i=t.J;this.B=e,this.J=i,this.bind={};for(let r of t.bones)this.bind[r.name]={pos:r.position.clone(),world:De(r.userData.bindPos)};let n=(r,a)=>De(r).distanceTo(De(a));this.legs={};for(let r of["R","L"]){let a=r==="R"?1:-1;this.legs["F"+r]={front:!0,side:a,k:r,l1:n(i["shoulder"+r],i["elbow"+r]),l2:n(i["elbow"+r],i["wrist"+r]),l3:n(i["wrist"+r],i["ftoe"+r]),bindDirs:[De(i["elbow"+r]).sub(De(i["shoulder"+r])).normalize(),De(i["wrist"+r]).sub(De(i["elbow"+r])).normalize(),De(i["ftoe"+r]).sub(De(i["wrist"+r])).normalize()],toe0:De(i["ftoe"+r]),pawAng0:Math.atan2(i["ftoe"+r][1]-i["wrist"+r][1],i["ftoe"+r][0]-i["wrist"+r][0])},this.legs["H"+r]={front:!1,side:a,k:r,l1:n(i["hip"+r],i["knee"+r]),l2:n(i["knee"+r],i["hock"+r]),l3:n(i["hock"+r],i["ankle"+r]),l4:n(i["ankle"+r],i["htoe"+r]),bindDirs:[De(i["knee"+r]).sub(De(i["hip"+r])).normalize(),De(i["hock"+r]).sub(De(i["knee"+r])).normalize(),De(i["ankle"+r]).sub(De(i["hock"+r])).normalize(),De(i["htoe"+r]).sub(De(i["ankle"+r])).normalize()],toe0:De(i["htoe"+r]),pawAng0:Math.atan2(i["htoe"+r][1]-i["ankle"+r][1],i["htoe"+r][0]-i["ankle"+r][0]),metaAng0:Math.atan2(i["ankle"+r][0]-i["hock"+r][0],i["hock"+r][1]-i["ankle"+r][1])}}this.tailBind=De(i.tailDir),this.sy=t.P.sy,this.sx=t.P.sx,this.m={};for(let r of t.bones)this.m[r.name]={p:new xe,q:new dc};this.foot={},this.time=0}fk(t,e){let i=this.B[t],n=this.m[t];if(!e){n.p.copy(i.position),n.q.copy(i.quaternion);return}let r=this.m[e];n.p.copy(i.position).applyQuaternion(r.q).add(r.p),n.q.copy(r.q).multiply(i.quaternion)}setChain(t,e,i,n){let r=this.B[t],a=Ji.setFromUnitVectors(n,i),o=Gu.copy(this.m[e].q).invert();r.quaternion.copy(o.multiply(a)),this.fk(t,e)}ik2(t,e,i,n,r,a){let o=Vu.copy(e).sub(t),c=o.length(),l=(i+n)*.999,h=Math.abs(i-n)*1.02+.01;c>l&&(o.multiplyScalar(l/c),c=l),c<h&&(o.multiplyScalar(h/Math.max(c,1e-4)),c=h);let u=o.clone().normalize(),d=(i*i-n*n+c*c)/(2*c),f=Math.sqrt(Math.max(0,i*i-d*d)),g=Jg.copy(r).sub(uc.copy(u).multiplyScalar(r.dot(u))).normalize();return a.copy(t).addScaledVector(u,d).addScaledVector(g,f),t.clone().add(o)}apply(t){let e=this.B,i=this.J,n=this.sy,r=t.time,a=t.sit||0,o=t.loaf||0,c=t.crouch||0,l=t.air||0,h=t.land||0,u=t.hang||0,d=t.wiggle||0,f=t.arch||0,g=t.rear||0,_=t.struggle||0,m=t.squat||0,p=t.angry||0,y=Ki(1-a-o,0,1),b=t.move||0,v=t.trot||0,T=t.phase||0,x=-(b*(.35+.35*v)*Math.cos(T*Math.PI*4)*n)+a*(-12.6*n)+o*(-12.2*n)+c*(-4.8*n)+h*(-3.2*n),S=a*-3.2+o*-.8+c*-1.2,C=a*44*Rt+c*(-2*Rt)+l*Ki(t.airPitch||0,-.5,.5)+b*.6*Rt*Math.sin(T*Math.PI*4);C+=(t.pitchBias||0)+u*80*Rt+g*62*Rt,x+=g*(-8.8*n)+(t.belly||0)*o*3.2-m*8.4*n,C+=m*17*Rt,S+=g*-1.5,x+=p*4.4*n,C-=p*5*Rt,x+=d*.45*Math.sin(r*26)*n;let R=t.breath||1;x+=(1-b)*Math.sin(r*2.3*R)*.17*n;let D=b*2.2*Rt*Math.sin(T*Math.PI*2)+d*10*Rt*Math.sin(r*13),I=this.bind.pelvis;e.pelvis.position.set(I.pos.x+S,I.pos.y+x,I.pos.z),e.pelvis.quaternion.setFromAxisAngle(ws,C).multiply(Ji.setFromAxisAngle(On,D)),t.twist&&e.pelvis.quaternion.multiply(Ji.setFromAxisAngle(hc,t.twist)),this.fk("pelvis");let F=a*(-6*Rt)+o*(2*Rt)+c*(4*Rt)+u*7*Rt-g*4*Rt+(1-b)*Math.sin(r*2.3*R+.6)*.5*Rt,P=t.spineYaw||0;e.spine1.quaternion.setFromAxisAngle(ws,F*.5+f*7*Rt+p*30*Rt).multiply(Ji.setFromAxisAngle(On,-D*.6+P*.3)),this.fk("spine1","pelvis"),e.spine2.quaternion.setFromAxisAngle(ws,F*.5+a*4*Rt-f*7*Rt-p*27*Rt).multiply(Ji.setFromAxisAngle(On,-D*.6+P*.3)),this.fk("spine2","spine1");let B=C+F+a*4*Rt+p*2*Rt,z=Ki(t.lookYaw||0,-80*Rt,80*Rt)+P*.4,J=Ki(t.lookPitch||0,-45*Rt,50*Rt)+b*(-7*Rt)+o*6*Rt+c*(-10*Rt)-B;e.neck.quaternion.setFromAxisAngle(On,-z*.4).multiply(Ji.setFromAxisAngle(ws,J*.5)),this.fk("neck","spine2"),e.head.quaternion.setFromAxisAngle(On,-z*.6).multiply(Ji.setFromAxisAngle(ws,J*.5)).multiply(Gu.setFromAxisAngle(hc,t.headTilt||0)),this.fk("head","neck");let H={FL:.25,FR:.75,HL:0,HR:.5},Z={FL:.5,FR:0,HL:0,HR:.5},tt=Fe(.62,.42,v),St=t.stride||20;for(let ct of["FR","FL","HR","HL"]){let at=this.legs[ct],Ut=at.k,Wt=Fe(H[ct],Z[ct],v),be=((T+Wt)%1+1)%1,le=0,ve=0,se=0;if(be<tt)le=St*(.5-be/tt);else{let Qt=(be-tt)/(1-tt);le=St*(-.5+Kg(Qt)),ve=(at.front?Fe(3,4.6,v):Fe(2.5,4,v))*Math.pow(Math.sin(Math.PI*Qt),.85)*n,se=Math.sin(Math.PI*Math.min(1,Qt*1.15))}le*=b,ve*=b,se*=b;let Gt=at.toe0.clone();if(Gt.x+=le,Gt.y+=ve,at.front){let Qt=this.m["upperF"+Ut],ae=uc.copy(e["upperF"+Ut].position).applyQuaternion(this.m.spine2.q).add(this.m.spine2.p).clone(),Ae=new xe(ae.x+1.2,.95,at.toe0.z*.9),Re=new xe(ae.x+6.8*this.sx,.95,at.toe0.z*.95),O=new xe(ae.x+5.5,ae.y-10.5*n,at.toe0.z);Gt.multiplyScalar(y).addScaledVector(Ae,a).addScaledVector(Re,o),Gt.lerp(O,l),t.extra&&t.extra[ct]&&Gt.add(t.extra[ct]);let me=at.pawAng0-se*75*Rt+o*30*Rt+a*5*Rt-l*25*Rt;if(y>.5&&b<.05&&(me=Fe(me,at.pawAng0,1)),u>0){let Pt=(at.l1+at.l2+at.l3)*.93,A=r*(6+9*_)+(at.side>0?0:Math.PI),M=.6+2.8*_,G=new xe(ae.x+1.2+(t.swing||0)*2.5+Math.cos(A)*M,ae.y-Pt*(.92-.12*_)+Math.sin(A)*M,at.toe0.z*.9);Gt.lerp(G,u),me=Fe(me,-82*Rt+Math.sin(A)*.5*_,u)}if(g>0){let Pt=t.scratch?t.scratch[ct]||0:.5,A=new xe(ae.x+5*this.sx,ae.y+(-2+11*(1-Pt))*n,at.toe0.z*.7);Gt.lerp(A,g),me=Fe(me,55*Rt,g)}let Kt=t.bat;if(Kt&&Kt.leg===ct&&Kt.k>0){let Pt=(at.l1+at.l2+at.l3)*.92,A=new xe(ae.x+Kt.dir[0]*Pt,ae.y+Kt.dir[1]*Pt,at.toe0.z*.6+Kt.dir[2]*Pt*.5);Gt.lerp(A,Kt.k),me=Fe(me,25*Rt,Kt.k)}let ie=new xe(Math.cos(me),Math.sin(me),0),it=Gt.clone().addScaledVector(ie,-at.l3),re=new xe,At=this.ik2(ae,it,at.l1,at.l2,new xe(-1,-.15-o*.6,0),re);this.setChain("upperF"+Ut,"spine2",re.clone().sub(ae).normalize(),at.bindDirs[0]),this.setChain("lowerF"+Ut,"upperF"+Ut,At.clone().sub(re).normalize(),at.bindDirs[1]),this.setChain("pawF"+Ut,"lowerF"+Ut,ie,at.bindDirs[2])}else{let Qt=uc.copy(e["thigh"+Ut].position).applyQuaternion(this.m.pelvis.q).add(this.m.pelvis.p).clone(),ae=at.l3,Ae=at.l4,Re=84*Rt,O=Qt.x+1.4+ae*Math.sin(Re)+Ae*.95,me=new xe(O,.95,at.toe0.z*1.05),Kt=new xe(O+.8,.95,at.toe0.z*1.15),ie=new xe(Qt.x-6.5,Qt.y-12.5*n,at.toe0.z);Gt.multiplyScalar(y).addScaledVector(me,a).addScaledVector(Kt,o),Gt.lerp(ie,l),t.extra&&t.extra[ct]&&Gt.add(t.extra[ct]);let it=at.pawAng0-se*40*Rt-l*30*Rt+(a+o)*12*Rt,re=at.metaAng0+se*22*Rt+(a+o)*(Re-at.metaAng0)+l*40*Rt+c*10*Rt;Gt.x-=m*2.6*this.sx;let At=t.kick&&t.kick[ct]||0;if(At>0&&(Gt.x-=10.5*At*this.sx,Gt.y+=3.2*At*n,re+=34*Rt*At,it-=22*Rt*At),d>0&&(Gt.y+=d*Math.max(0,Math.sin(r*13+(at.side>0?0:Math.PI)))*1.2*n),u>0){let rt=(t.tuck||0)*(1-_*.7),Y=r*(5+8*_)+(at.side>0?Math.PI*.5:Math.PI*1.5),K=.5+3.6*_,lt=(at.l1+at.l2+ae+Ae)*(.9-rt*.3),L=new xe(Qt.x+1.5+rt*5+(t.swing||0)*2+Math.sin(Y)*K,Qt.y-lt+Math.max(0,Math.cos(Y))*K*1.2,at.toe0.z);Gt.lerp(L,u),it=Fe(it,-75*Rt,u),re=Fe(re,(12+rt*30+Math.sin(Y)*20*_)*Rt,u)}if(g>0){let rt=new xe(Qt.x+5*this.sx,.95,at.toe0.z);Gt.lerp(rt,g),re=Fe(re,58*Rt,g),it=Fe(it,at.pawAng0,g)}let Pt=new xe(Math.cos(it),Math.sin(it),0),A=Gt.clone().addScaledVector(Pt,-Ae),M=new xe(Math.sin(re),-Math.cos(re),0),G=A.clone().addScaledVector(M,-ae),et=new xe,j=this.ik2(Qt,G,at.l1,at.l2,new xe(1,.1,0),et),ot=j.clone().addScaledVector(M,ae);this.setChain("thigh"+Ut,"pelvis",et.clone().sub(Qt).normalize(),at.bindDirs[0]),this.setChain("shin"+Ut,"thigh"+Ut,j.clone().sub(et).normalize(),at.bindDirs[1]),this.setChain("meta"+Ut,"shin"+Ut,ot.clone().sub(j).normalize(),at.bindDirs[2]),this.setChain("pawH"+Ut,"meta"+Ut,Pt,at.bindDirs[3])}}let Ft=t.viewerSide||1,$=t.tailUp!=null?t.tailUp:.3,pt=t.tailWave!=null?t.tailWave:.3,yt=Ki(a+o,0,1),It="pelvis";for(let ct=0;ct<8;ct++){let at="tail"+ct,Ut=ct/7,Wt=ct===0?-($*78*Rt):ct<3?-$*6*Rt:$*(ct>5?14:4)*Rt,be=pt*(.5+Ut)*.22*Math.sin(r*(1.6+pt*2.2)-ct*.55),le=Wt+(t.tailCurl||0)*Ut*.25,ve=be;if(yt>0){let ie=ct===0?34*Rt:ct<3?14*Rt:-3*Rt,it=ct<2?0:Ft*-22*Rt*(o>a?.8:1);le=Fe(le,ie,yt),ve=Fe(ve,it+be*.25,yt)}l>0&&(le=Fe(le,ct===0?-15*Rt:3*Rt,l),ve=Fe(ve,0,l));let se=Math.min(t.dt||1/60,1/30);this.tailS||(this.tailS=[]);let Gt=this.tailS[ct]||(this.tailS[ct]={z:le,vz:0,y:ve,vy:0}),Qt=260-ct*24,ae=2*Math.sqrt(Qt)*.42,Ae=t.acc||[0,0,0];Gt.vz+=(Qt*(le-Gt.z)-ae*Gt.vz+Ki(Ae[1]*.012+Ae[0]*.004,-60,60)*(.4+Ut))*se,Gt.z+=Gt.vz*se,Gt.vy+=(Qt*(ve-Gt.y)-ae*Gt.vy-Ki(Ae[2]*2.5,-60,60)*(.3+Ut))*se,Gt.y+=Gt.vy*se,(u>.5||l>.5)&&(Gt.z=Fe(Gt.z,le,.15)),e[at].quaternion.setFromAxisAngle(ws,Gt.z).multiply(Ji.setFromAxisAngle(On,Gt.y)),this.fk(at,It);let Re=this.m[at],O=Vu.copy(this.tailBind).applyQuaternion(Re.q),me=this.J.tailSeg,Kt=1.5;if(!t.noGround&&Re.p.y+O.y*me<Kt){let ie=Ki((Kt-Re.p.y)/me,-1,1),it=Math.sqrt(1-ie*ie),re=Math.hypot(O.x,O.z)||1;this.setChain(at,It,new xe(O.x/re*it,ie,O.z/re*it),this.tailBind)}It=at}for(let ct of["R","L"]){let at=ct==="R"?1:-1,Ut=t.earTwitch&&t.earTwitch[ct]||0,Wt=(t.earSwivel||0)*at;e["ear"+ct].quaternion.setFromAxisAngle(On,-at*(Wt+Ut*.5)).multiply(Ji.setFromAxisAngle(hc,at*(Ut*.35+(t.earFlat||0)*.6)))}let mt=Ki(t.lids!=null?t.lids:1,0,1),Ht=Fe(33,-17,mt)*Rt,Ee=Fe(6,-22,mt)*Rt;for(let ct of this.cat.face.eyes)ct.upP.rotation.z=-Ht,ct.loP.rotation.z=Ee,ct.ball.rotation.set(0,-(t.gazeYaw||0)*.9*1,(t.gazePitch||0)*.8)}};var Co=class extends Xi{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let t=new ln;t.deleteAttribute("uv");let e=new ai({side:Xe}),i=new ai,n=new rr(16777215,900,28,2);n.position.set(.418,16.199,.3),this.add(n);let r=new ce(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let a=new qs(t,i,6),o=new we;o.position.set(-10.906,2.009,1.846),o.rotation.set(0,-.195,0),o.scale.set(2.328,7.905,4.651),o.updateMatrix(),a.setMatrixAt(0,o.matrix),o.position.set(-5.607,-.754,-.758),o.rotation.set(0,.994,0),o.scale.set(1.97,1.534,3.955),o.updateMatrix(),a.setMatrixAt(1,o.matrix),o.position.set(6.167,.857,7.803),o.rotation.set(0,.561,0),o.scale.set(3.927,6.285,3.687),o.updateMatrix(),a.setMatrixAt(2,o.matrix),o.position.set(-2.017,.018,6.124),o.rotation.set(0,.333,0),o.scale.set(2.002,4.566,2.064),o.updateMatrix(),a.setMatrixAt(3,o.matrix),o.position.set(2.291,-.756,-2.621),o.rotation.set(0,-.286,0),o.scale.set(1.546,1.552,1.496),o.updateMatrix(),a.setMatrixAt(4,o.matrix),o.position.set(-2.193,-.369,-5.547),o.rotation.set(0,.516,0),o.scale.set(3.875,3.487,2.986),o.updateMatrix(),a.setMatrixAt(5,o.matrix),this.add(a);let c=new ce(t,Ts(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new ce(t,Ts(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let h=new ce(t,Ts(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new ce(t,Ts(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new ce(t,Ts(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new ce(t,Ts(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(let e of t)e.dispose()}};function Ts(s){return new tr({color:0,emissive:16777215,emissiveIntensity:s})}function Wu(s){let t=new Xi,i=new _s(s).fromScene(new Co,.04).texture;t.environment=i,t.environmentIntensity=.55;let n=new ir(16774374,6181444,.85);t.add(n);let r=new Pn(16773340,2.75);r.position.set(-.55,1,.85),t.add(r);let a=new Pn(14673919,.55);a.position.set(.8,.25,.6),t.add(a);let o=new Pn(16777215,1.4);return o.position.set(.3,.6,-1),t.add(o),{scene:t,env:i,lights:{hemi:n,key:r,fill:a,rim:o}}}var Qg={BUTTON:1,IMG:1,INPUT:1,SELECT:1,TEXTAREA:1,TABLE:1,VIDEO:1,CANVAS:1};function Xu(s){if(!s||s==="transparent")return 0;let t=s.match(/rgba?\(([^)]+)\)/);if(!t)return 1;let e=t[1].split(/[ ,/]+/).filter(Boolean);return e.length>3?parseFloat(e[3]):1}var Po=class{constructor(t,e,i){this.root=t||document.body,this.topbarSel=i||".topbar",this.ignore=e,this.plats=[],this.dirty=!0,this.last=0,this.W=innerWidth,this.H=innerHeight,this.topbarBottom=0,this.floor={floor:!0,x1:-4e3,x2:8e3,y:this.H-3,id:"floor"};let n=()=>{this.dirty=!0};this._mark=n,addEventListener("scroll",n,{passive:!0,capture:!0}),addEventListener("resize",n,{passive:!0}),this.mo=new MutationObserver(n),this.mo.observe(this.root,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["class","hidden","style"]}),this.seq=0}dispose(){removeEventListener("scroll",this._mark,{capture:!0}),removeEventListener("resize",this._mark),this.mo.disconnect()}maybeScan(t){return!this.dirty&&t-this.last<1500||t-this.last<220?!1:(this.scan(),this.last=t,this.dirty=!1,!0)}scan(){let t=this.W=innerWidth,e=this.H=innerHeight;this.floor.y=e-3,this.floor.x2=t+4e3;let i=[],n=this.root.querySelector(this.topbarSel),r=0;if(n){let l=n.getBoundingClientRect();l.bottom>0&&l.bottom<e*.5&&(r=l.bottom,i.push({el:n,edge:"bottom",x1:Math.max(0,l.left),x2:Math.min(t,l.right),y:l.bottom,topbar:!0}))}this.topbarBottom=r;let a=this.root.querySelectorAll("*"),o=Math.min(a.length,6e3);for(let l=0;l<o;l++){let h=a[l];if(h===n||n&&n.contains(h)||h===this.ignore)continue;let u=h.getBoundingClientRect();if(u.width<64||u.height<18||u.top<r+30||u.top>e-24||u.right<30||u.left>t-30)continue;let d=!!Qg[h.tagName],f=getComputedStyle(h);if(f.visibility==="hidden"||f.display==="contents"||parseFloat(f.opacity)<.3||(d||(d=Xu(f.backgroundColor)>.12||parseFloat(f.borderTopWidth)>=1&&Xu(f.borderTopColor)>.15||f.boxShadow!=="none"||f.backgroundImage!=="none"),!d)||u.width>t*.92&&u.height>e*.6)continue;let g=Math.min(Math.max(u.left+Math.min(24,u.width/2),2),t-2),_=document.elementFromPoint(g,u.top+3);if(_&&_!==h&&!h.contains(_)&&!_.contains(h)){let m=document.elementFromPoint(Math.min(Math.max(u.right-24,2),t-2),u.top+3);if(m&&m!==h&&!h.contains(m)&&!m.contains(h))continue}i.push({el:h,edge:"top",x1:Math.max(0,u.left),x2:Math.min(t,u.right),y:u.top})}i.sort((l,h)=>l.y-h.y||l.x1-h.x1);let c=[];for(let l of i){let h=c.find(u=>!u.topbar&&!l.topbar&&Math.abs(u.y-l.y)<=2&&l.x1<=u.x2+14&&l.x2>=u.x1-14);if(h){h.x1=Math.min(h.x1,l.x1),h.x2=Math.max(h.x2,l.x2),h.els.push(l.el);continue}c.push({el:l.el,els:[l.el],edge:l.edge,x1:l.x1,x2:l.x2,y:l.y,topbar:!!l.topbar,id:++this.seq})}for(let l of c){l.dx1=l.x1,l.dx2=l.x2,l.y0=l.y;let h=l.el.getBoundingClientRect();l.ref=l.edge==="bottom"?h.bottom:h.top,l.refX=h.left}this.plats=c,this.scans=(this.scans||0)+1}live(t){if(!t||t.floor)return t&&(t.y=innerHeight-3),t;if(!t.el.isConnected)return null;let e=t.el.getBoundingClientRect();if(e.width===0&&e.height===0)return null;let n=(t.edge==="bottom"?e.bottom:e.top)-t.ref,r=e.left-t.refX;return t.y=t.y0+n,t.x1=t.dx1+r,t.x2=t.dx2+r,t}find(t,e,i){let n=null,r=i;for(let a of this.plats){if(t<a.x1||t>a.x2)continue;let o=Math.abs(a.y-e);o<=r&&(r=o,n=a)}return!n&&Math.abs(e-this.floor.y)<=i&&(n=this.floor),n}landing(t,e,i){let n=null;for(let r of this.plats)t<r.x1+6||t>r.x2-6||r.y>=e-.5&&r.y<=i&&(!n||r.y<n.y)&&(n=r);return!n&&i>=this.floor.y&&(n=this.floor),n}};var Nt=(s,t)=>s+Math.random()*(t-s),Bn=(s,t,e)=>s<t?t:s>e?e:s;function qu(s){for(;s&&s.nodeType===1;){let t=getComputedStyle(s).backgroundColor,e=t&&t.match(/rgba?\(([^)]+)\)/);if(e){let i=e[1].split(/[ ,/]+/).filter(Boolean).map(Number);if(i.length<4||i[3]>.6)return[i[0],i[1],i[2]]}s=s.parentElement}return document.documentElement.getAttribute("data-scheme")==="dark"?[20,24,32]:[255,255,255]}var br=(s,t=1)=>`rgba(${s[0]|0},${s[1]|0},${s[2]|0},${t})`,fc=(s,t)=>s.map(e=>Bn(e*t,0,255)),jg=()=>`polygon(${Nt(0,28)}% 0, 100% ${Nt(0,32)}%, ${Nt(72,100)}% 100%, ${Nt(0,18)}% ${Nt(70,100)}%, 0 ${Nt(20,50)}%)`,tx="svg, img, button, .btn, .chip, .chip-btn, .tag, .hp-tag, .hp-save, .badge-count, .face, .itile, .ring, .price, .eyebrow, h1, h2, h3, .hb-tile, .logo-full",Io=class{constructor(t){this.app=t;let e=this.box=document.createElement("div");e.className="apd-cat-marks",e.setAttribute("aria-hidden","true"),Object.assign(e.style,{position:"absolute",left:"0",top:"0",width:"0",height:"0",overflow:"visible",pointerEvents:"none",zIndex:"57"}),document.body.appendChild(e),this.marks=[],this.bits=[],this.puddles=[],this.knocked=new Set,this.cand=null,this.candSeq=-1,this.lastCheck=0}newMark(t,e,i,n){for(;this.marks.length>=28;)this.removeMark(this.marks[0],!0);let r=Math.min(window.devicePixelRatio||1,2),a=document.createElement("canvas"),o=t-i/2,c=e-n/2;n*=1.45,a.width=Math.ceil(i*r),a.height=Math.ceil(n*r),Object.assign(a.style,{position:"absolute",left:o+scrollX+"px",top:c+scrollY+"px",width:i+"px",height:n+"px",transition:"opacity 1.6s ease"}),this.box.appendChild(a);let l=this.elementUnder(t,e),h=document.documentElement.getAttribute("data-scheme")==="dark",u={cv:a,ctx:a.getContext("2d"),dpr:r,x0:o,y0:c,sx:scrollX,sy:scrollY,w:i,h:n,strokes:[],under:l,born:performance.now(),dirty:!1,dark:h,seed:Math.random()*1e3};return this.marks.push(u),u}elementUnder(t,e){let i=document.elementFromPoint(Bn(t,1,innerWidth-2),Bn(e,1,innerHeight-2));return i&&i!==document.body&&i!==document.documentElement?i:null}startStroke(t,e,i){let n={claws:e,spread:i,pts:[]};return t.strokes.push(n),n}addPoint(t,e,i,n){let r=i-t.x0-t.sx+scrollX,a=n-t.y0-t.sy+scrollY,o=e.pts[e.pts.length-1];o&&Math.hypot(r-o[0],a-o[1])<1.2||(e.pts.push([r,a]),t.dirty=!0)}flecks(t,e,i,n){for(let r=0;r<n;r++){let a=document.createElement("div"),o=Nt(1.5,3.2);Object.assign(a.style,{position:"absolute",left:e+scrollX+Nt(-6,6)+"px",top:i+scrollY+Nt(-3,3)+"px",pointerEvents:"none",width:o+"px",height:o*Nt(.6,1.4)+"px",background:t.dark?"rgba(230,224,210,.85)":"rgba(255,253,246,.95)",boxShadow:"0 0 0.5px rgba(0,0,0,.35)",borderRadius:"1px"}),this.box.appendChild(a);let c=Nt(-14,14),l=Nt(22,46),h=Nt(-200,200),u=a.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${c}px,${l}px) rotate(${h}deg)`,opacity:0}],{duration:Nt(500,900),easing:"cubic-bezier(.3,.1,.7,1)",fill:"forwards"});u.onfinish=()=>a.remove()}}draw(t){let e=t.ctx,i=t.dpr;e.setTransform(i,0,0,i,0,0),e.clearRect(0,0,t.w,t.h);let n=t.seed,r=()=>(n=(n*9301+49297)%233280,n/233280);for(let a of t.strokes)if(!(a.pts.length<2))for(let o=0;o<a.claws;o++){let c=(o-(a.claws-1)/2)*a.spread,l=(o-(a.claws-1)/2)*.12,h=a.pts.map((u,d)=>[u[0]+c+l*d+(r()-.5)*.6,u[1]+Math.abs(o-(a.claws-1)/2)*1.2]);this.gash(e,h,a.spread*(.4+r()*.14),r,t.dark)}t.dirty=!1}gash(t,e,i,n,r){let a=0,o=[0];for(let y=1;y<e.length;y++)a+=Math.hypot(e[y][0]-e[y-1][0],e[y][1]-e[y-1][1]),o.push(a);if(a<4)return;let c=Math.max(8,Math.round(a/1.6)),l=y=>{let b=1;for(;b<o.length-1&&o[b]<y;)b++;let v=(y-o[b-1])/Math.max(1e-6,o[b]-o[b-1]);return[e[b-1][0]+(e[b][0]-e[b-1][0])*v,e[b-1][1]+(e[b][1]-e[b-1][1])*v]},h=[],u=[],d=[];for(let y=0;y<=c;y++){let b=y/c,v=b*a,T=l(v),E=l(Math.min(a,v+1)),x=l(Math.max(0,v-1)),S=E[0]-x[0],C=E[1]-x[1],R=Math.hypot(S,C)||1;S/=R,C/=R;let D=-C,I=S,F=i*Math.pow(Math.sin(Math.PI*Math.min(1,b*1.08)),.55)*(.75+n()*.5);h.push([T[0]+D*F*(.9+n()*.5),T[1]+I*F*(.9+n()*.5)]),u.push([T[0]-D*F*(.55+n()*.35),T[1]-I*F*(.55+n()*.35)]),d.push(T)}t.beginPath(),t.moveTo(h[0][0],h[0][1]);for(let y of h)t.lineTo(y[0],y[1]);for(let y=u.length-1;y>=0;y--)t.lineTo(u[y][0],u[y][1]);t.closePath(),t.fillStyle=r?"rgba(6,10,20,0.72)":"rgba(78,58,40,0.55)",t.fill(),t.beginPath(),t.moveTo(d[1][0],d[1][1]);for(let y=2;y<d.length-1;y++)t.lineTo(d[y][0],d[y][1]);t.lineWidth=Math.max(.6,i*.55),t.lineCap="round",t.strokeStyle=r?"rgba(0,0,0,0.55)":"rgba(40,26,16,0.45)",t.stroke(),t.save(),t.shadowColor="rgba(0,0,0,0.28)",t.shadowBlur=1.2,t.shadowOffsetX=.4,t.shadowOffsetY=.6,t.beginPath(),t.moveTo(h[0][0],h[0][1]);for(let y=1;y<h.length;y++)t.lineTo(h[y][0]+(n()-.5)*.5,h[y][1]);t.lineWidth=1.1,t.strokeStyle=r?"rgba(225,220,205,0.75)":"rgba(255,254,250,0.95)",t.stroke(),t.restore(),t.strokeStyle=r?"rgba(220,214,200,0.45)":"rgba(255,255,255,0.7)",t.lineWidth=.6;for(let y=2;y<u.length-2;y+=2){if(n()<.5)continue;let b=u[y],v=n()*Math.PI*2;t.beginPath(),t.moveTo(b[0],b[1]),t.lineTo(b[0]+Math.cos(v)*1.6,b[1]+Math.sin(v)*1.6),t.stroke()}let f=d[d.length-1],g=d[Math.max(0,d.length-4)],_=f[0]-g[0],m=f[1]-g[1],p=Math.hypot(_,m)||1;if(t.beginPath(),t.moveTo(f[0]-m/p*i,f[1]+_/p*i),t.lineTo(f[0]+_/p*i*2.2+(n()-.5)*1.5,f[1]+m/p*i*2.2),t.lineTo(f[0]+m/p*i*.6,f[1]-_/p*i*.6),t.closePath(),t.fillStyle=r?"rgba(210,205,190,0.7)":"rgba(250,247,240,0.95)",t.shadowColor="rgba(0,0,0,0.25)",t.shadowBlur=1,t.fill(),t.shadowBlur=0,n()<.55&&a>10){let y=i*(4+n()*5),b=i*(1.1+n()*.6),v=(n()-.5)*b*2.2,T=f[0]+(n()-.5)*2,E=f[1]-i*.3;t.save(),t.shadowColor="rgba(0,0,0,0.3)",t.shadowBlur=2,t.shadowOffsetX=.8,t.shadowOffsetY=1.4,t.beginPath(),t.moveTo(T-b/2,E),t.quadraticCurveTo(T-b*.4+v*.4,E+y*.55,T-b*.25+v,E+y),t.lineTo(T+b*.2+v+(n()-.5),E+y*(.9+n()*.12)),t.quadraticCurveTo(T+b*.45+v*.4,E+y*.5,T+b/2,E),t.closePath();let x=t.createLinearGradient(T-b,E,T+b,E);x.addColorStop(0,r?"rgba(170,165,150,0.85)":"rgba(226,220,206,0.98)"),x.addColorStop(.5,r?"rgba(215,210,195,0.85)":"rgba(255,253,248,0.98)"),x.addColorStop(1,r?"rgba(160,155,140,0.85)":"rgba(214,207,192,0.98)"),t.fillStyle=x,t.fill(),t.restore(),t.beginPath(),t.moveTo(T-b/2,E),t.lineTo(T+b/2,E),t.lineWidth=1,t.strokeStyle=r?"rgba(0,0,0,0.6)":"rgba(70,50,32,0.45)",t.stroke()}}paper(){return document.documentElement.getAttribute("data-scheme")==="dark"?"rgba(226,220,206,.92)":"rgba(255,253,247,.98)"}debris(t,e,i,n,r,a={}){let o=i>=innerHeight-6,c=o?0:scrollX,l=o?0:scrollY;for(let h=0;h<n;h++){for(;this.bits.length>=180;){let S=this.bits.shift();clearTimeout(S._t),S.remove()}let u=document.createElement("div"),d=a.w?Nt(a.w[0],a.w[1]):Nt(2,4.6),f=a.h?Nt(a.h[0],a.h[1]):d*Nt(.55,1.3),g=t+Nt(-5,5),_=e+Nt(-3,3),m=a.flat||f>d*1.6,p=i-(m?Math.min(d,f):f)*.5-Nt(0,.8);Object.assign(u.style,{position:o?"fixed":"absolute",left:g+c-d/2+"px",top:_+l-f/2+"px",width:d+"px",height:f+"px",background:r,boxShadow:"0 .7px .9px rgba(0,0,0,.3)",borderRadius:"1px",clipPath:a.clean?"none":jg(),transition:"opacity 2s ease",pointerEvents:"none",zIndex:o?"57":""}),(o?document.body:this.box).appendChild(u),this.bits.push(u);let y=Nt(-16,16)*(a.spread||1),b=Math.max(0,p-_),v=Nt(-300,300),T=m?Math.round(v/180)*180+90+Nt(-14,14):v+Nt(-50,50),E=360+Math.sqrt(b)*40*Nt(.9,1.2),x=Math.min(5,b*.06);u.animate([{transform:"translate(0,0) rotate(0deg)",easing:"cubic-bezier(.42,0,1,1)"},{transform:`translate(${y*.92}px,${b}px) rotate(${v*.9+T*.1}deg)`,offset:.84,easing:"ease-out"},{transform:`translate(${y*.97}px,${b-x}px) rotate(${(v+T)/2}deg)`,offset:.92,easing:"ease-in"},{transform:`translate(${y}px,${b}px) rotate(${T}deg)`}],{duration:E,fill:"forwards"}),u._t=setTimeout(()=>{u.style.opacity="0",setTimeout(()=>{u.remove();let S=this.bits.indexOf(u);S>=0&&this.bits.splice(S,1)},2100)},Nt(36e3,46e3))}}shred(t,e,i,n,r){if(!i||!i.isConnected)return;let a=Bn(n/1.7,.8,1.5),o=qu(i),c=qu(i.parentElement),l=Math.abs(o[0]-c[0])+Math.abs(o[1]-c[1])+Math.abs(o[2]-c[2]),h=document.documentElement.getAttribute("data-scheme")==="dark",u=Nt(14,24)*a,d=Nt(6,13)*a,f=Math.random()<.6?Nt(8,16)*a:0,g=u+12,_=d+10+f,m=this.newMark(t,e-3+_*.5/1.45,g,_/1.45);m.under=i,m.strokes=null;let p=m.ctx,y=m.dpr;p.setTransform(y,0,0,y,0,0);let b=g/2,v=3+(e-(m.y0+3))-3,T=[],E=7+Math.floor(Nt(0,4));for(let S=0;S<=E;S++){let C=S/E,R=b-u/2+u*C,D=d*Math.pow(Math.sin(Math.PI*C),.6)*Nt(.6,1.15);T.push([R+Nt(-.8,.8),v+D])}p.beginPath(),p.moveTo(T[0][0]-.6,v-2.2);for(let S of T)p.lineTo(S[0],S[1]);if(p.lineTo(T[E][0]+.6,v-2.2),p.closePath(),l<22){let S=p.createLinearGradient(0,v-2,0,v+d);S.addColorStop(0,h?"rgba(0,0,0,0.55)":"rgba(60,44,30,0.26)"),S.addColorStop(1,h?"rgba(0,0,0,0.3)":"rgba(60,44,30,0.1)"),p.fillStyle=br(c),p.fill(),p.fillStyle=S,p.fill()}else p.fillStyle=br(c),p.fill();p.save(),p.shadowColor="rgba(0,0,0,0.3)",p.shadowBlur=1.2,p.shadowOffsetY=.8,p.beginPath(),p.moveTo(T[0][0],T[0][1]);for(let S of T)p.lineTo(S[0],S[1]);p.lineWidth=1.2,p.strokeStyle=br(fc(o,h?1.35:1.04),.95),p.stroke(),p.restore(),p.strokeStyle=h?"rgba(235,230,220,0.45)":"rgba(255,255,255,0.8)",p.lineWidth=.5;for(let S=1;S<E;S++){if(Math.random()<.4)continue;let C=T[S],R=Math.PI/2+Nt(-.9,.9);p.beginPath(),p.moveTo(C[0],C[1]),p.lineTo(C[0]+Math.cos(R)*1.8,C[1]-Math.sin(R)*1.8),p.stroke()}if(f){let S=Math.random()<.5?0:E,C=T[S],R=T[S?E-2:2],D=Math.abs(R[0]-C[0])+2,I=S?-1:1;p.save(),p.shadowColor="rgba(0,0,0,0.32)",p.shadowBlur=1.8,p.shadowOffsetX=I*.6,p.shadowOffsetY=1.2,p.beginPath(),p.moveTo(C[0],C[1]-.5),p.lineTo(C[0]+I*D,R[1]-.5),p.lineTo(C[0]+I*D*.8+Nt(-1,1),R[1]+f),p.lineTo(C[0]+I*D*.15,C[1]+f*Nt(.75,1)),p.closePath(),p.fillStyle=br(fc(o,h?1.08:.97)),p.fill(),p.restore()}let x=br(fc(o,Nt(.94,1)));this.debris(t,e+d*.5,r,1,x,{w:[2.8*a,4.4*a],h:[u*.8,u*1.25],spread:1.6,flat:!0}),this.debris(t,e+d*.5,r,1+(Math.random()<.5?1:0),x,{w:[1.6,3.2]})}puddle(t,e,i){let n=Bn(i/1.7,.8,1.5),r=!!e.floor,a=Nt(20,27)*n*(r?1.25:1),o=e.y,c=Math.ceil(a*2.6+24),l=Math.ceil(a*.5+14+(r?0:74*n)),h=t-c/2,u=o-a*.3-8,d=Math.min(window.devicePixelRatio||1,2),f=document.createElement("canvas");f.width=Math.ceil(c*d),f.height=Math.ceil(l*d);let g=r?0:scrollX,_=r?0:scrollY;Object.assign(f.style,{position:r?"fixed":"absolute",left:h+g+"px",top:u+_+"px",width:c+"px",height:l+"px",transition:"opacity 2.5s ease",pointerEvents:"none",zIndex:r?"57":""}),(r?document.body:this.box).appendChild(f);let m={cv:f,ctx:f.getContext("2d"),dpr:d,W:c,H:l,cx:t-h,ey:o-u,R:a,k:n,r:0,floor:r,x1:r?-1e9:e.x1-h,x2:r?1e9:e.x2-h,drips:[],x0:h,y0:u,plat:e,born:performance.now(),last:performance.now(),el:e.el,dirty:!0,dark:document.documentElement.getAttribute("data-scheme")==="dark"};for(this.puddles.push(m);this.puddles.length>6;)this.removePuddle(this.puddles[0],!0);return m}growPuddle(t,e){e=Bn(e,0,1);let i=t.R*Math.sqrt(e);if(i<=t.r+.05||(t.r=i,t.dirty=!0,t.floor))return;let n=t.k;t.want||(t.want=Math.random()<.35?1:2);let r=i>t.R*.75?t.want:i>t.R*.4?1:0,a=o=>{let c=o+t.x0;for(let l of t.plat&&t.plat.els||[]){if(!l.isConnected)continue;let h=l.getBoundingClientRect();if(c>=h.left-1&&c<=h.right+1)return Math.max(0,h.bottom-t.plat.y-3)}return 30};for(;t.drips.filter(o=>!o.side).length<r;){let o=Math.max(t.cx-i*.5,t.x1+3),c=Math.min(t.cx+i*.5,t.x2-3);if(c<=o)break;let l=Nt(o,c);t.drips.push({x:l,len:0,max:Math.min(Nt(5,20)*n,a(l)-2,t.H-t.ey-6),w:Nt(1.5,2.4)*n,v:Nt(5,11)*n,ph:Nt(0,6)})}for(let[o,c]of[[t.x1+1,t.cx-i<t.x1+3],[t.x2-1,t.cx+i>t.x2-3]])c&&!t.drips.some(l=>l.side&&l.x===o)&&t.drips.push({x:o,side:!0,len:0,max:Math.min(Nt(14,34)*n,a(o)+4,t.H-t.ey-6),w:1.9*n,v:Nt(7,12)*n,ph:Nt(0,6)})}drawPuddle(t){let e=t.ctx,i=t.dpr;if(e.setTransform(i,0,0,i,0,0),e.clearRect(0,0,t.W,t.H),t.r<.5)return;let n=t.dark?.85:1,r=t.k,a=t.r,o=Math.max(1.3,a*.12),c=t.ey-o*.45;if(!t.floor&&a>t.R*.3){let u=Math.max(t.cx-a*.85,t.x1),d=Math.min(t.cx+a*.85,t.x2),f=Math.min(1,(a-t.R*.3)/(t.R*.5)),g=18,_=[];for(let m=0;m<=g;m++){let p=m/g;_.push([u+(d-u)*p,t.ey+Math.max(.5,Math.pow(Math.sin(Math.PI*p),.7)*(2.4+1.8*Math.sin(p*13+t.R))*r*f)])}e.beginPath(),e.moveTo(u,t.ey-.6);for(let m of _)e.lineTo(m[0],m[1]);e.lineTo(d,t.ey-.6),e.closePath(),e.fillStyle=`rgba(230,206,110,${.4*n})`,e.fill(),e.beginPath(),e.moveTo(_[0][0],_[0][1]);for(let m of _)e.lineTo(m[0],m[1]);e.strokeStyle=`rgba(150,118,34,${.3*n})`,e.lineWidth=.6,e.stroke()}for(let u of t.drips){if(u.len<1)continue;let d=t.ey+1,f=t.ey+2+u.len,g=u.w,_=v=>u.x+Math.sin((v-d)*.25+u.ph)*.45,m=Math.max(3,Math.ceil(u.len/3)),p=[],y=[];for(let v=0;v<=m;v++){let T=d+(f-g-d)*(v/m),E=v/m,x=g*(.42+.6*Math.pow(1-Math.min(1,E*2.5),2));p.push([_(T)-x,T]),y.push([_(T)+x,T])}e.beginPath(),e.moveTo(p[0][0],p[0][1]);for(let v of p)e.lineTo(v[0],v[1]);let b=_(f-g);e.arc(b,f-g*.7,g*.72,Math.PI,0,!0);for(let v=y.length-1;v>=0;v--)e.lineTo(y[v][0],y[v][1]);e.closePath(),e.fillStyle=`rgba(228,200,98,${.48*n})`,e.fill(),e.strokeStyle=`rgba(150,118,34,${.24*n})`,e.lineWidth=.5,e.stroke(),e.beginPath(),e.arc(b-g*.25,f-g*.9,g*.22,0,Math.PI*2),e.fillStyle=`rgba(255,255,245,${.7*n})`,e.fill()}e.save(),t.floor||(e.beginPath(),e.rect(t.x1,0,t.x2-t.x1,t.H),e.clip()),(()=>{e.beginPath();for(let u=0;u<=48;u++){let d=u/48*Math.PI*2,f=1+Math.sin(d*3+t.R)*.07+Math.sin(d*5+t.R*2)*.05,g=t.cx+Math.cos(d)*a*f,_=c+Math.sin(d)*o*f;u?e.lineTo(g,_):e.moveTo(g,_)}e.closePath()})();let h=e.createLinearGradient(0,c-o,0,c+o);h.addColorStop(0,`rgba(248,236,180,${.5*n})`),h.addColorStop(1,`rgba(214,184,84,${.46*n})`),e.fillStyle=h,e.fill(),e.strokeStyle=`rgba(128,100,30,${.3*n})`,e.lineWidth=.6,e.stroke(),e.beginPath(),e.ellipse(t.cx-a*.08,c-o*.1,a*.82,o*.7,0,Math.PI*1.12,Math.PI*1.88),e.strokeStyle=`rgba(255,255,250,${.75*n})`,e.lineWidth=Math.max(.7,o*.45),e.lineCap="round",e.stroke(),e.restore(),t.dirty=!1}removePuddle(t,e){let i=this.puddles.indexOf(t);if(i>=0&&this.puddles.splice(i,1),e){t.cv.remove();return}t.cv.style.opacity="0",setTimeout(()=>t.cv.remove(),2600)}removeMark(t,e){let i=this.marks.indexOf(t);if(i>=0&&this.marks.splice(i,1),e){t.cv.remove();return}t.cv.style.opacity="0",setTimeout(()=>t.cv.remove(),1700)}candidates(t){if(this.cand&&this.candSeq===t)return this.cand;let e=this.app.world.root,i=[],n=innerHeight,r=innerWidth;for(let a of e.querySelectorAll(tx)){if(this.knocked.has(a))continue;let o=a.getBoundingClientRect();o.width<10||o.height<10||o.width>300||o.height>140||o.bottom<0||o.top>n||o.right<0||o.left>r||a.closest("svg")&&a.tagName.toLowerCase()!=="svg"||a.parentElement&&a.parentElement.closest("button, .btn, .chip, .chip-btn")&&a.tagName.toLowerCase()==="svg"||i.push(a)}return this.cand=i,this.candSeq=t,i}knock(t,e,i){if(!t||!t.isConnected||this.knocked.has(t))return!1;let n=getComputedStyle(t);if(n.display==="inline")return!1;let a={composite:n.transform&&n.transform!=="none"?"add":"replace"};if(i==="wobble"){let f=e*Nt(5,10);return t.animate([{transform:"translate(0,0) rotate(0deg)"},{transform:`translate(${e*4}px,-2px) rotate(${f}deg)`,offset:.3},{transform:`translate(0,0) rotate(${-f*.4}deg)`,offset:.65},{transform:"translate(0,0) rotate(0deg)"}],{duration:560,easing:"ease-out",...a}),!0}if(this.knocked.add(t),i==="askew"){let f=e*Nt(6,14),g=e*Nt(5,13),_=t.animate([{transform:"translate(0,0) rotate(0deg)"},{transform:`translate(${g*1.5}px,-4px) rotate(${f*1.5}deg)`,offset:.35},{transform:`translate(${g}px,0) rotate(${f}deg)`}],{duration:700,easing:"ease-out",fill:"forwards",...a}),p=setTimeout(()=>{if(!t.isConnected){this.knocked.delete(t);return}let y=t.animate([{transform:`translate(${g}px,0) rotate(${f}deg)`},{transform:"translate(0,0) rotate(0deg)"}],{duration:800,easing:"ease-in-out",...a});_.cancel(),y.onfinish=()=>this.knocked.delete(t)},Nt(8e3,13e3));return t._apdKnock={undo:()=>{clearTimeout(p),_.cancel(),this.knocked.delete(t)}},!0}let o=t.getBoundingClientRect(),c=Bn(innerHeight-o.top+60,120,900),l=e*Nt(20,60),h=t.animate([{transform:"translate(0,0) rotate(0deg)",opacity:1},{transform:`translate(${l*.3}px,-10px) rotate(${e*12}deg)`,opacity:1,offset:.18},{transform:`translate(${l}px,${c}px) rotate(${e*Nt(70,160)}deg)`,opacity:0}],{duration:950,easing:"cubic-bezier(.45,0,.9,.55)",fill:"forwards",...a}),d=setTimeout(()=>{if(h.cancel(),!t.isConnected){this.knocked.delete(t);return}let f=t.animate([{opacity:0,transform:"translate(0,-6px) scale(.85)"},{opacity:1,transform:"translate(0,0) scale(1)"}],{duration:520,easing:"ease-out",...a});f.onfinish=()=>this.knocked.delete(t)},Nt(3500,5500));return t._apdKnock={undo:()=>{clearTimeout(d),h.cancel(),this.knocked.delete(t)}},!0}update(t){for(let e of this.marks)e.dirty&&this.draw(e);for(let e of this.puddles){let i=Math.min(.1,(t-e.last)/1e3);e.last=t;for(let n of e.drips)n.len<n.max&&(n.len=Math.min(n.max,n.len+n.v*i*(1-n.len/(n.max*1.15))),e.dirty=!0);e.dirty&&this.drawPuddle(e)}if(!(t-this.lastCheck<1e3)){this.lastCheck=t;for(let e of this.marks.slice())(t-e.born>55e3||e.under&&!e.under.isConnected)&&this.removeMark(e);for(let e of this.puddles.slice())(t-e.born>45e3||e.el&&!e.el.isConnected)&&this.removePuddle(e)}}clear(){for(let t of this.marks.slice())this.removeMark(t);for(let t of this.puddles.slice())this.removePuddle(t);for(let t of this.bits)clearTimeout(t._t),t.style.opacity="0",setTimeout(()=>t.remove(),2100);this.bits=[];for(let t of this.knocked)t._apdKnock&&t._apdKnock.undo();this.knocked.clear(),setTimeout(()=>this.box.remove(),1800)}};var Yu=.2,Er=.36,pc=-Er,ex=-(Math.PI-Er),ix=-.95,nx=-(Math.PI-.95),sx=1.1,rx=-(Math.PI+1.1),Es=Math.PI*2,Mt=(s,t)=>s+Math.random()*(t-s),Bt=(s,t,e)=>s<t?t:s>e?e:s,As=(s,t,e,i)=>s+(t-s)*(1-Math.exp(-e*i)),ax=s=>{let t=0;for(let i in s)t+=s[i];let e=Math.random()*t;for(let i in s)if(e-=s[i],e<=0)return i;return Object.keys(s)[0]},Oe=(s,t,e,i)=>{let n=s.x-t,r=s.v,a=Math.exp(-e*i);return s.x=t+(n+(r+e*n)*i)*a,s.v=(r-e*i*(r+e*n))*a,s.x},Ye=(s=0)=>({x:s,v:0}),wr=(s,t)=>Math.sin(s*1.31+t)*.5+Math.sin(s*2.77+t*1.7)*.3+Math.sin(s*4.13+t*2.3)*.2,Zu={lazy:{travel:.22,wander:.09,sit:.16,loaf:.34,idle:.09,scratch:.08,knock:.08,shred:.04,zoom:0},calm:{travel:.29,wander:.11,sit:.15,loaf:.08,idle:.13,scratch:.13,knock:.13,shred:.07,zoom:.02},playful:{travel:.34,wander:.12,sit:.06,loaf:.03,idle:.09,scratch:.12,knock:.18,shred:.09,zoom:.07},curious:{travel:.32,wander:.1,sit:.1,loaf:.03,idle:.11,scratch:.12,knock:.2,shred:.08,zoom:.04},aloof:{travel:.23,wander:.08,sit:.22,loaf:.08,idle:.11,scratch:.15,knock:.18,shred:.09,zoom:.01},shy:{travel:.28,wander:.1,sit:.2,loaf:.22,idle:.2,scratch:.02,knock:.01,shred:.01,zoom:0},hyper:{travel:.34,wander:.12,sit:.04,loaf:.02,idle:.05,scratch:.14,knock:.18,shred:.11,zoom:.13}},ox={lazy:.17,calm:.22,playful:.13,curious:.17,aloof:.3,shy:.55,hyper:.34},ye=new U,$u=new Ie,lx=new Ie,cx=new Ie,Ju=[["tail0","pelvis",6.2],["pelvis","spine1",7.2],["spine1","spine2",7.4],["spine2","neck",6.4],["neck","head",5.2],["upperFR","lowerFR",2.6],["lowerFR","pawFR",2.2],["upperFL","lowerFL",2.6],["lowerFL","pawFL",2.2],["thighR","shinR",3.4],["shinR","metaR",2.4],["metaR","pawHR",2],["thighL","shinL",3.4],["shinL","metaL",2.4],["metaL","pawHL",2]],hx=[...new Set(Ju.flat().filter(s=>typeof s=="string"))],ux=new U(1,0,0),dx=new U(0,1,0),fx=new U(0,0,1),Lo=["sit","loaf","crouch","air","hang","wiggle","arch","rear","squat","angry"],px={sit:5.5,loaf:4.5,crouch:11,air:14,hang:13,wiggle:10,arch:6,rear:9,squat:4.5,angry:9},Rs=null;function Ku(){if(Rs)return Rs;try{Rs=JSON.parse(localStorage.getItem("apd-cats-trust")||"{}")}catch{Rs={}}return Rs}function mx(){try{localStorage.setItem("apd-cats-trust",JSON.stringify(Rs||{}))}catch{}}var mc=class{constructor(t,e,i,n){this.app=t,this.P=e,this.i=i,this.c=n,this.rig=new Ro(this.c),this.group=new mi,this.group.add(this.c.model),this.z=100+i*26,t.scene.add(this.group),this.shadow=new ce(t.shadowGeo,t.shadowMat.clone()),t.scene.add(this.shadow),this.setScale(t.basePx),this.applyLayers(t.layers);let r=t.world.W;this.x=-this.len*.8,this.y=t.world.floor.y,this.plat=t.world.floor,this.facing=1,this.yawT=pc,this.state="enter",this.tx=Mt(70,Math.min(420,r*.5))+i*18,this.timer=0,this.phase=Math.random(),this.hurry=!1,this.sp={};for(let a of Lo)this.sp[a]=Ye();Object.assign(this.sp,{land:Ye(),speed:Ye(),move:Ye(),trot:Ye(),yaw:Ye(pc),spineYaw:Ye(),lookYaw:Ye(),lookPitch:Ye(),tailUp:Ye(.8),tailWave:Ye(.2),headTilt:Ye(),airPitch:Ye(),pupil:Ye(e.pupil),struggle:Ye(),earFlat:Ye(),puff:Ye(1)}),this.wt={};for(let a of Lo)this.wt[a]=0;if(this.petLeft=0,this.batT=0,this.batDur=0,this.cool=Mt(1,3),this.hp=null,this.lookTimer=.5,this.lookMode="ahead",this.headTiltT=0,this.blinkT=Mt(1,4),this.blink=0,this.blinkDur=.13,this.earT=Mt(2,6),this.earK="R",this.earPh=1,this.plan=null,this.time=Math.random()*10,this.alive=!0,this.visited=[],this.vx=0,this.vy=0,this.fear=0,this.seed=Math.random()*100,this.shy=e.temper==="shy",this.shy){let a=Ku();this.trust=a[e.id]!=null?a[e.id]:.05,this.saveT=0}else this.trust=1;this.hyper=e.temper==="hyper",this.annoy=0,this.grumpyUntil=0,this.lastInteract=0,this.peeCool=e.pees?Mt(16,26):1e9,this.accS=[0,0,0],this.prevP=null}grumpy(){return this.time<this.grumpyUntil}playMood(){let t=this.app.pointer;return!!t&&performance.now()-t.moveT<2500&&!this.grumpy()&&this.annoy<.85}get yaw(){return this.sp.yaw.x}get w(){let t={};for(let e of Lo)t[e]=this.sp[e].x;return t.land=this.sp.land.x,t}setYaw(t){let e=this.sp.yaw.x;for(;t-e>Math.PI;)t-=Es;for(;t-e<-Math.PI;)t+=Es;this.yawT=t}faceYaw(t,e){if(e==="away")return this.setYaw(t>0?sx:rx);if(e==="34")return this.setYaw(t>0?ix:nx);this.setYaw(t>0?pc:ex)}setScale(t){let e=this.P;this.s=t*e.size,this.c.model.scale.setScalar(this.s);let i=this.s*e.sx*Math.cos(Er);this.front=26.5*i,this.back=18*i,this.len=this.front+this.back,this.feet=11.5*i,this.standH=36*e.sy*this.s,this.loafH=26*e.sy*this.s,this.maxUp=Bt(150*this.s*(this.shy?.8:1),110,320),this.maxDX=Bt(160*this.s,110,340),this.c.furMat.userData.uniforms.uDensity.value=Bt(this.s*this.app.dpr/1.2,1.6,8)}applyLayers(t){let e=this.c;e.body.geometry.instanceCount=Math.min(t,e.layers-1)+1}dispose(){this.shy&&this.persistTrust(),this.app.scene.remove(this.group),this.app.scene.remove(this.shadow),this.group.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&(Array.isArray(t.material)?t.material:[t.material]).forEach(e=>{e.map&&e.map.dispose(),e.dispose()})}),this.shadow.material.dispose()}persistTrust(){let t=Ku();t[this.P.id]=Math.round(this.trust*1e3)/1e3,mx()}bounds(t){let e=this.app.world.W,i=this.feet+4;return t?t.floor?[this.len*.55,e-this.len*.55]:[Math.max(t.x1+i,this.len*.55),Math.min(t.x2-i,e-this.len*.55)]:[this.x,this.x-1]}fits(t,e){if(t.floor)return!0;let[i,n]=this.bounds(t);return n-i<4?!1:t.y>=(e?this.loafH:this.standH)+4&&t.y<=this.app.world.H-6}crowd(t,e){let i=1e9;for(let n of this.app.cats){if(n===this||!n.alive||n.state==="exit"||(n.plat||n.jump&&n.jump.p)!==e)continue;let a=n.state==="walk"?n.tx:(n.state==="crouch"||n.state==="jump")&&n.jump?n.jump.lx:n.x;i=Math.min(i,Math.abs(a-t))}return i}freeSpot(t,e,i,n=7){let r=Mt(e,i),a=-1;for(let o=0;o<n;o++){let c=Mt(e,i),l=this.crowd(c,t);l>a&&(a=l,r=c)}return r}loafOnly(t){return!!t&&!t.floor&&!this.fits(t,!1)&&this.fits(t,!0)}hop(t,e){if(!this.fits(e,!1)&&!(e===this.loafTarget&&this.fits(e,!0)))return null;let[i,n]=this.bounds(t),[r,a]=this.bounds(e);if(n<i||a<r)return null;let o=e.y-t.y;if(o<-this.maxUp||o>560||Math.abs(o)<6)return null;let c,l;if(r<=n&&a>=i){let h=Math.max(i,r),u=Math.min(n,a);l=Bt(this.x+Mt(-60,60),h,u);let d=l>=this.x?1:-1;c=Bt(l-d*Math.min(36,Math.abs(o)*.25),i,n)}else r>n?(c=n,l=r+Math.min(26,(a-r)*.5)):(c=i,l=a-Math.min(26,(a-r)*.5));return this.loafOnly(t)&&(c=Bt(this.x,i,n),l=Bt(c,r,a)),Math.abs(l-c)>this.maxDX+Math.max(0,o)*.4?null:{tx:c,lx:l}}pathTo(t){let e=this.app.world,i=[e.floor,...e.plats],n=this.plat,r=new Map([[n,null]]),a=[n];for(let o=0;o<5&&a.length;o++){let c=[];for(let l of a)for(let h of i)if(!r.has(h)&&!(h!==t&&this.loafOnly(h))&&this.hop(l,h)&&(r.set(h,l),c.push(h),h===t)){let u=[],d=h;for(;d&&d!==n;)u.unshift(d),d=r.get(d);return u}a=c}return null}chooseTarget(t){let e=this.app.world,i=e.W,n=e.H,r=[];for(let a of[e.floor,...e.plats]){if(a===this.plat||!this.fits(a,!1)&&!this.loafOnly(a))continue;let o=a.floor?Mt(0,i):(a.x1+a.x2)/2,c;if(t){let l=Math.hypot(o-t.x,a.y-t.y);if(l<220)continue;c=Math.random()*.3+l/(i+n)}else{let l=Math.hypot(o-this.x,a.y-this.y);c=Math.random()*(.3+l/(i+n)),a.topbar&&(c*=this.shy?.5:2.6),a.floor&&(c*=this.plat&&!this.plat.floor?.8:.3),this.visited.includes(a.id)&&(c*=.35);let h=this.app.pointer;this.shy&&h&&this.trust<.6&&(c*=Bt(Math.hypot(o-h.x,a.y-h.y)/500,.15,1.5))}if(!a.floor){let l=0;for(let h of this.app.cats)h!==this&&h.alive&&(h.plat===a||h.plan&&h.plan.target===a)&&l++;if(l&&a.x2-a.x1<(l+1)*this.len*1.1)continue;c/=1+l*1.5}r.push([c,a])}if(!t&&this.P.kitten&&Math.random()<.35){let a=this.app.cats.find(o=>o.P.id==="induk"&&o.plat&&o.state!=="exit");a&&a.plat!==this.plat&&r.push([9,a.plat])}r.sort((a,o)=>o[0]-a[0]);for(let a=0;a<Math.min(7,r.length);a++){this.loafTarget=this.loafOnly(r[a][1])?r[a][1]:null;let o=this.pathTo(r[a][1]);if(o&&o.length)return{target:r[a][1],path:o}}return null}clearAct(){this.wt.rear=0,this.wt.arch=0,this.wt.wiggle=0,this.wt.crouch=0,this.wt.squat=0,this.wt.angry=0,this.batTarget=null,this.scr=null,this.zoom=0,this.then=null,this.shr=null,this.pee=null,this.kick=null,this.ang=null,this.chasing=!1,this.stomping=!1,this.proud=!1}think(){let t=this.app.world;if(!this.plat){this.startFall(0);return}if(this.clearAct(),this.wt.sit=0,this.wt.loaf=0,this.hurry=!1,this.loafOnly(this.plat)){if(this.sp.loaf.x<.5&&!this.didLoaf){this.didLoaf=!0,this.startPosture("loaf",Mt(7,14));return}this.didLoaf=!1}let e=Object.assign({},Zu[this.P.temper]||Zu.calm);this.shy&&this.trust>.5&&(e.scratch=.05,e.knock=.05);let i=performance.now();if(i-(this.app.lastScratch||0)<3e3&&(e.scratch=0),i-(this.app.lastKnock||0)<1500&&(e.knock=0),i-(this.app.lastShred||0)<3500&&(e.shred=0),this.P.pees&&this.peeCool<=0&&Math.random()<.6&&this.startPee()||this.hyper&&this.playMood()&&Math.random()<.7&&this.chase())return;let n=ax(e);if(this.plat&&!this.plat.floor&&this.plat.y<this.standH+4&&(n="travel"),!(n==="scratch"&&this.startScratch())&&!(n==="knock"&&this.goKnock(!0))&&!(n==="shred"&&this.startShred())&&!(n==="zoom"&&this.startZoom())){if((n==="scratch"||n==="knock"||n==="zoom"||n==="shred")&&(n="travel"),n==="travel"){let r=this.chooseTarget();if(r){this.plan=r,this.hurry=this.P.kitten&&Math.random()<.5,this.nextHop();return}n="wander"}if(n==="wander"){let[r,a]=this.bounds(this.plat);if(a-r>30){this.walkTo(this.freeSpot(this.plat,r,a));return}n="idle"}if(this.crowd(this.x,this.plat)<this.len*.55){let[r,a]=this.bounds(this.plat);if(a-r>this.len){this.walkTo(this.freeSpot(this.plat,r,a));return}}if(n==="sit")return this.startPosture("sit",Mt(4,10));if(n==="loaf")return this.startPosture("loaf",Mt(8,18));this.state="idle",this.timer=Mt(1.5,4)}}startPosture(t,e){this.state=t,this.timer=e,this.wt.sit=t==="sit"?1:0,this.wt.loaf=t==="loaf"?1:0,this.faceYaw(this.facing,"34")}nextHop(){let t=this.plan;if(!t||!t.path.length)return this.plan=null,this.settle();let e=t.path[0],i=this.app.world;if(!e.floor&&!i.plats.includes(e))return this.plan=null,this.think();let n=this.hop(this.plat,e);if(!n)return this.plan=null,this.think();if(!this.loafOnly(this.plat)){let[a,o]=this.bounds(e);if(this.crowd(n.lx,e)<this.len*.7)for(let c=0;c<6;c++){let l=Bt(n.lx+Mt(-1,1)*this.maxDX*.6,a,o);if(Math.abs(l-n.tx)<=this.maxDX&&this.crowd(l,e)>this.len*.7){n.lx=l;break}}}let r=this.hurry;this.walkTo(n.tx,()=>this.startJump(e,n.lx)),this.hurry=r}settle(){if(this.plat&&this.plat.id&&(this.visited.push(this.plat.id),this.visited.length>4&&this.visited.shift()),this.loafOnly(this.plat))return this.startPosture("loaf",Mt(7,14));if(Math.random()<.3)return this.startPosture("sit",Mt(3,8));this.state="idle",this.timer=Mt(.8,2.5),this.lookMode="viewer",this.lookTimer=Mt(1,2)}walkTo(t,e){this.state="walk",this.tx=t,this.then=e||null,this.wt.sit=0,this.wt.loaf=0,this.wt.crouch=0,this.wt.rear=0,this.wt.arch=0}startJump(t,e){Math.abs(e-this.x)>6&&(this.facing=e>this.x?1:-1),this.faceYaw(this.facing);let i=t.y-this.y;this.state="crouch",this.timer=.32+Math.min(.35,Math.abs(i)*.0012)+Mt(0,.15),this.wt.crouch=1,this.jump={p:t,lx:e},this.lookMode="point",this.lookPt=[e,t.y-this.standH*.3]}launch(){let t=this.jump,e=t&&this.app.world.live(t.p);if(!e)return this.wt.crouch=0,this.think();t.x0=this.x,t.y0=this.y;let i=e.y-this.y,n=t.lx-this.x,r=Math.hypot(n,i);t.T=.32+r*.0011+Math.max(0,-i)*8e-4,t.A=i<0?24+-i*.32:12+Math.abs(n)*.08,t.s=0,this.state="jump",this.wt.crouch=0,this.wt.air=1,this.sp.crouch.v-=4,this.plat=null}startFall(t=0){this.state="fall",this.plat=null,this.vy=-60,this.vx=t,this.wt.air=1,this.wt.sit=0,this.wt.loaf=0,this.wt.crouch=0,this.wt.rear=0}land(t){this.plat=t,this.y=t.y,this.wt.air=0,this.sp.land.v+=22+Math.min(14,Math.abs(this.vy||0)/150),this.vy=0,this.state="land",this.timer=.24}exit(){this.state!=="gone"&&(this.state==="held"&&this.release(0,0),this.exiting=!0,this.plan=null,this.clearAct(),!(this.state==="jump"||this.state==="fall")&&(this.state="exit",this.wt.sit=0,this.wt.loaf=0))}startScratch(){let t=this.app.world;return!this.plat||this.y-this.standH*1.35<t.topbarBottom+6||this.crowd(this.x,this.plat)<this.len*.6?!1:(this.clearAct(),this.wt.sit=0,this.wt.loaf=0,this.state="scratch",this.scr={phase:"turn",t:0,dur:Mt(2.4,3.8),mark:null,cyc:-1,stroke:null},this.faceYaw(this.facing,"away"),this.app.lastScratch=performance.now(),!0)}findKnockTarget(){let t=this.app,e=t.world;if(!this.plat)return null;let i=t.mischief.candidates(e.scans),n=this.y,r=this.s,[a,o]=this.bounds(this.plat),c=null;for(let l of i){let h=l.getBoundingClientRect(),u=h.left+h.width/2,d=h.top+h.height/2;if(h.bottom>n+2||d>n-6||d<n-52*r*this.P.sy)continue;let f=u-this.x;if(Math.abs(f)>520)continue;let g=f>=0?1:-1,_=Bt(u-g*14*r,a,o);if(Math.abs(_+g*14*r-u)>26*r)continue;let m=Math.abs(_-this.x)+Math.random()*80;(!c||m<c.sc)&&(c={el:l,cx:u,cy:d,dir:g,tx:_,sc:m,high:d<n-27*r*this.P.sy})}return c}goKnock(t){let e=this.findKnockTarget();return e?(t&&(this.knockLeft=Math.random()<(this.hyper||this.P.temper==="playful"||this.P.temper==="curious"?.75:.5)?1+Math.floor(Math.random()*2):0),this.app.lastKnock=performance.now(),Math.abs(e.tx-this.x)>10?this.walkTo(e.tx,()=>this.startKnock(e)):this.startKnock(e),!0):!1}startKnock(t){if(!t.el.isConnected)return this.think();this.clearAct(),this.state="knock",this.facing=t.dir,this.faceYaw(t.dir,"34"),this.knockHigh=!!t.high,this.wt.sit=t.high?0:1,this.wt.rear=t.high?1:0,this.wt.loaf=0,this.batTarget={el:t.el},this.batT=0,this.hits=1+Math.floor(Math.random()*3),this.hitIdx=0,this.batDur=99,this.batPrev=0,this.lookMode="el",this.lookTimer=4}startZoom(){if(!this.plat)return!1;let[t,e]=this.bounds(this.plat);if(e-t<this.len*3)return!1;this.clearAct();let i=this.x-t>e-this.x?t:e,n=i===t?e:t;return this.zoom=1,this.walkTo(i,()=>{this.zoom=1,this.walkTo(Bt(n+(i-n)*Mt(.2,.5),t,e),()=>{this.zoom=0,this.state="idle",this.timer=Mt(.8,1.6),this.lookMode="viewer",this.lookTimer=2}),this.zoom=1}),this.zoom=1,!0}startShred(){let t=this.plat;return!t||t.floor||t.topbar||t.edge!=="top"||this.loafOnly(t)||this.crowd(this.x,t)<this.len*.6?!1:(this.clearAct(),this.wt.sit=0,this.wt.loaf=0,this.wt.crouch=.75,this.state="shred",this.plan=null,this.shr={t:0,dur:Mt(2.4,3.8),prev:0,n:0},this.faceYaw(this.facing,"34"),this.app.lastShred=performance.now(),!0)}updateShred(t){let e=this.shr,i=this.plat,n=this.app;if(!e||!i){this.wt.crouch=0,this.state="idle",this.timer=1;return}let r=this.x+this.facing*this.front*.8,a=i.y+4*this.s;if(this.batTarget={pt:[r,a]},this.lookMode="point",this.lookPt=[r,a],this.sp.crouch.x<.5||Math.abs(this.yaw-this.yawT)>.3)return;e.t+=t,this.batT=e.t;let o=e.t*1.9%1;if(e.prev<.34&&o>=.34){let c=this.hp&&this.hp["tipF"+(this.viewerLeg()==="upperFR"?"R":"L")],l=Bt(c?c[0]:r,i.x1+6,i.x2-6),h=null;for(let d of i.els||[i.el]){let f=d.getBoundingClientRect();if(l>=f.left&&l<=f.right&&Math.abs(f.top-i.y)<3){h=d;break}}let u=n.world.landing(l,i.y+6,n.world.H+50);n.mischief.shred(l,i.y,h||i.el,this.s,u?u.y:n.world.floor.y),e.n++}e.prev=o,e.t>=e.dur&&(this.shr=null,this.batTarget=null,this.wt.crouch=0,this.state="idle",this.timer=Mt(.8,1.6),this.lookMode="viewer",this.lookTimer=2)}startPee(){let t=this.plat;if(!t||t.topbar||this.loafOnly(t)||this.crowd(this.x,t)<this.len*.7)return!1;let[e,i]=this.bounds(t);return i-e<this.len*.6?!1:(this.clearAct(),this.plan=null,this.wt.sit=0,this.wt.loaf=0,this.state="pee",this.pee={phase:"sniff",t:0,dur:Mt(1.4,2.4),pd:null},this.peeCool=Mt(42,58),this.faceYaw(this.facing),!0)}updatePee(t){let e=this.pee,i=this.plat,n=this.app;if(!e||!i){this.wt.squat=0,this.kick=null,this.state="idle",this.timer=1;return}if(e.t+=t,e.phase==="sniff"){this.lookMode="point",this.lookPt=[this.x+this.facing*this.front*1.1,i.y+2],e.t>=e.dur&&(e.phase="squat",e.t=0,e.dur=Mt(2.6,3.6),this.wt.squat=1);return}if(e.phase==="squat"){if(this.sp.squat.x<.6){e.t=Math.min(e.t,.01);return}if(!e.pd){let r=this.hp?this.hp.tail0[0]*.65+this.hp.pelvis[0]*.35:this.x-this.facing*this.back*.7;e.pd=n.mischief.puddle(Bt(r,i.floor?10:i.x1+4,i.floor?n.world.W-10:i.x2-4),i,this.s)}if(n.mischief.growPuddle(e.pd,e.t/e.dur),e.t>=e.dur){this.wt.squat=0,e.phase="step",e.t=0;let[r,a]=this.bounds(i);e.kx=Bt(this.x+this.facing*this.len*.45,r,a),Math.sign(e.kx-this.x)!==this.facing&&(e.kx=this.x)}return}if(e.phase==="step"){if(this.sp.squat.x>.25)return;if(Math.abs(e.kx-this.x)>3){this.x+=Math.sign(e.kx-this.x)*Math.min(Math.abs(e.kx-this.x),40*this.s*t),this.walkStep=!0;return}e.phase="cover",e.t=0,e.dur=Mt(1.6,2.2);return}if(e.phase==="cover"){let a=Math.floor(e.t/.36),o=e.t%.36/.36,c=Math.pow(Math.sin(Math.PI*o),.7);if(this.kick=a%2?{HL:c}:{HR:c},this.lookMode="point",this.lookPt=[this.x-this.facing*this.len,i.y],e.t>=e.dur){this.kick=null,this.pee=null;let[l,h]=this.bounds(i),u=Bt(this.x+this.facing*Mt(160,300),l,h);Math.abs(u-this.x)<60&&(u=Bt(this.x-this.facing*Mt(160,300),l,h)),this.walkTo(u,()=>{this.proud=!1,this.startPosture("sit",Mt(4,8)),this.lookMode="viewer",this.lookTimer=3}),this.proud=!0}}}chase(){let t=this.app,e=t.world,i=t.pointer;if(!i||!this.plat||this.busy()||this.grumpy())return!1;let n=null;for(let c of[e.floor,...e.plats]){if(c.topbar||!this.fits(c,!1)||!c.floor&&(i.x<c.x1+this.feet||i.x>c.x2-this.feet))continue;let l=c.y-i.y;l<-10||l>300||(!n||l<n.below)&&(n={p:c,below:l})}if(!n)return!1;let r=n.p,a=r===this.plat||r.floor&&this.plat.floor;if(this.clearAct(),this.wt.sit=0,this.wt.loaf=0,a||Math.abs(i.x-this.x)<this.maxDX*.8&&n.below<160&&this.hop(this.plat,r)){if(Math.abs(i.x-this.x)<300)return this.stalk(),!0;let[l,h]=this.bounds(this.plat);return this.walkTo(Bt(i.x-Math.sign(i.x-this.x)*180,l,h),()=>this.endChase()),this.hurry=!0,this.chasing=!0,!0}let o=this.pathTo(r);return!o||!o.length?!1:(this.plan={target:r,path:o},this.hurry=!0,this.nextHop(),this.hurry=!0,this.chasing=!0,!0)}endChase(){this.chasing=!1;let t=this.app.pointer;if(t&&this.playMood()&&Math.abs(t.x-this.x)<420&&t.y>this.y-260&&t.y<this.y+30)return this.stalk();this.state="idle",this.timer=Mt(.5,1.2),this.lookMode="pointer",this.lookTimer=2}interact(t){return this.hyper?(this.lastInteract=this.time,this.annoy=Math.min(1,this.annoy+t),this.annoy>=1&&!this.grumpy()?(this.getAngry(),!0):!1):!1}getAngry(t){if(this.annoy=.35,this.grumpyUntil=this.time+Mt(15,20),!t&&this.busy()&&this.state!=="stalk"&&this.state!=="land"){this.angerOnLand=!0;return}this.clearAct(),this.plan=null,this.fleeing=!1,this.wt.sit=0,this.wt.loaf=0,this.wt.crouch=0;let e=this.app.pointer;e&&Math.abs(e.x-this.x)>10&&(this.facing=e.x>this.x?1:-1),this.faceYaw(this.facing),this.state="angry",this.ang={phase:"puff",t:0,swats:0,prev:0},this.wt.angry=1,this.lookMode="pointer",this.lookTimer=4}angrySwat(){if(this.state==="angry"&&this.ang&&this.ang.phase==="swat"||this.busy())return;this.clearAct(),this.plan=null,this.wt.sit=0,this.wt.loaf=0;let t=this.app.pointer;t&&Math.abs(t.x-this.x)>10&&(this.facing=t.x>this.x?1:-1),this.faceYaw(this.facing,"34"),this.state="angry",this.ang={phase:"swat",t:0,swats:0,prev:0,n:1+Math.floor(Math.random()*2)},this.wt.angry=.6,this.batTarget={pointer:!0},this.batT=0}updateAngry(t){let e=this.ang,i=this.app.pointer;if(!e){this.wt.angry=0,this.state="idle",this.timer=1;return}if(e.t+=t,e.phase==="puff"){if(i&&Math.abs(i.x-this.x)>30){let c=i.x>this.x?1:-1;c!==this.facing&&(this.facing=c,this.faceYaw(c))}if(e.t>1.25){let c=this.headPos||[this.x,this.y-this.standH];i&&Math.hypot(i.x-c[0],i.y-c[1])<this.len*1.5?(e.phase="swat",e.t=0,e.n=2+Math.floor(Math.random()*2),this.faceYaw(this.facing,"34"),this.batTarget={pointer:!0},this.batT=0):e.phase="stomp"}return}if(e.phase==="swat"){this.batT=e.t;let c=e.t*3.6%1;e.prev<.3&&c>=.3&&e.swats++,e.prev=c,e.swats>=e.n&&c>.8&&(e.phase="stomp");return}this.batTarget=null,this.wt.angry=0,this.ang=null;let[n,r]=this.bounds(this.plat||this.app.world.floor),a=i?i.x<this.x?1:-1:-this.facing,o=Bt(this.x+a*Mt(200,360),n,r);Math.abs(o-this.x)<80&&(o=Bt(this.x-a*Mt(200,360),n,r)),this.walkTo(o,()=>{this.stomping=!1,this.startPosture("sit",Mt(6,10));let c=this.app.pointer;this.faceYaw(c?c.x>this.x?1:-1:this.facing,"away")}),this.stomping=!0,this.hurry=!0}hit(t,e){let i=this.hp;if(!i||this.state==="gone")return!1;let n=this.s,r=(a,o)=>{let c=o[0]-a[0],l=o[1]-a[1],h=t-a[0],u=e-a[1],d=Bt((h*c+u*l)/(c*c+l*l||1),0,1);return Math.hypot(h-c*d,u-l*d)};for(let[a,o,c]of Ju)if(r(i[a],i[o])<c*n*(this.P.girth||1))return!0;return Math.hypot(t-i.headC[0],e-i.headC[1])<5.2*n*this.P.head*1.22}busy(){return["held","jump","fall","crouch","land","exit","gone","stalk"].includes(this.state)}get puffT(){return this.state==="angry"?2.25:this.stomping?1.8:this.grumpy()?1.15:1}grab(t,e){if(this.state==="gone"||this.exiting)return!1;this.clearAct(),this.state="held",this.plan=null,this.jump=null,this.plat=null,this.fleeing=!1;for(let i of["sit","loaf","crouch","air"])this.wt[i]=0;return this.wt.hang=1,this.hold={x:t,y:e,ax:t,ay:e,vx:0,vy:0,acc:0},this.pend={th:0,om:0},this.strug=this.P.kitten?-.1:0,this.burst=!1,this.burstT=Mt(.6,1.2),this.hyper&&(this.lastInteract=this.time,this.grumpy()&&(this.strug=.6,this.burstT=.1)),this.lookMode="viewer",this.lookTimer=99,this.faceYaw(this.facing,"34"),this.shy&&(this.trust=Math.max(0,this.trust-.1)),!0}release(t,e,i){if(this.state!=="held")return;let n=this.c.J;this.pelvisPos&&(this.x=this.pelvisPos[0]-n.pelvis[0]*this.s*Math.cos(this.yaw),this.y=this.pelvisPos[1]+n.pelvis[1]*this.s*Math.cos(Yu)),this.wt.hang=0,this.lookTimer=.5,this.startFall(Bt(t*(i?1:.55),-650,650)),this.vy=Bt(e*(i?1:.55),-900,500),this.cool=Mt(2,4),this.afterEscape=!!i,this.pend&&(this.spinOut=this.pend.th),this.chasing=!1}breakFree(){let t=this.app;t.press&&t.press.cat===this&&(t.press=null,t.pendingUp=!0,t.eatClick=!0,t.setCursor(null));let e=this.pend&&Math.abs(this.pend.om)>.3?Math.sign(this.pend.om):Math.random()<.5?-1:1;this.release(e*Mt(170,320),-Mt(200,360),!0)}pet(){if(this.busy())return;if(this.hyper){if(this.grumpy()||this.state==="angry")return this.lastInteract=this.time,this.angrySwat();if(this.interact(.075))return}if(this.shy){if(this.trust<.35){this.trust=Math.max(0,this.trust-.01),this.flee();return}this.trust=Math.min(1,this.trust+(this.trust<.7?.06:.03))}if(this.P.kitten&&this.state!=="petted"&&this.state!=="bat"&&Math.random()<.4)return this.startBat();let t=this.state==="petted";this.clearAct(),t||(this.petLeft=0),this.state="petted",this.plan=null,this.petShy=this.shy&&this.trust<.7,this.petLeft=Math.min(5,this.petLeft+(this.petShy?1.3:2.2)),this.wt.arch=this.sp.sit.x>.5||this.sp.loaf.x>.5||this.petShy?0:1,this.petShy&&(this.wt.crouch=.35),this.lookMode="pointer",this.lookTimer=3,this.faceYaw(this.facing,"34")}startBat(){this.interact(.02)||(this.clearAct(),this.state="bat",this.batT=0,this.batDur=Mt(1.2,2.2),this.plan=null,this.wt.loaf=0,this.wt.sit=1,this.lookMode="pointer",this.lookTimer=3,this.batTarget={pointer:!0},this.faceYaw(this.facing,"34"))}stalk(){this.clearAct(),this.state="stalk",this.timer=Mt(.7,1.3),this.plan=null,this.wt.sit=0,this.wt.loaf=0,this.wt.crouch=1,this.wt.wiggle=1,this.lookMode="pointer",this.lookTimer=3,this.cool=99}pounce(){let t=this.app.world,e=this.app.pointer;if(this.wt.wiggle=0,this.interact(.05))return;if(!e||!this.plat){this.wt.crouch=0,this.state="idle",this.timer=1;return}let i=this.plat,n=null;for(let c of[t.floor,...t.plats]){if(!this.fits(c,!1)||!c.floor&&(e.x<c.x1+this.feet||e.x>c.x2-this.feet))continue;let l=c.y-e.y;l<-12||l>170||c!==this.plat&&!this.hop(this.plat,c)||(!n||l<n.below)&&(n={p:c,below:l})}n&&(i=n.p);let[r,a]=this.bounds(i),o=Bt(e.x-this.facing*this.front*.45,r,a);Math.abs(o-this.x)>this.maxDX&&(o=Bt(this.x+Math.sign(o-this.x)*this.maxDX,r,a)),this.jump={p:i,lx:o},this.afterPounce=!0,this.launch(),this.jump&&(this.jump.A=Math.max(this.jump.A,10*this.s)),this.cool=this.hyper?Mt(.8,1.8):Mt(4,7)}approach(t){let[e,i]=this.bounds(this.plat);if(i<e)return;let n=Bt(t,e,i),r=()=>{this.startPosture("sit",Mt(4,8)),this.lookMode="pointer",this.lookTimer=5};if(this.plan=null,this.clearAct(),Math.abs(n-this.x)<10)return r();this.walkTo(n,r),this.hurry=!!this.P.kitten||Math.abs(n-this.x)>260}flee(t){let e=this.app.pointer;if(!e||!this.plat||!t&&this.busy())return;this.clearAct(),this.wt.sit=0,this.wt.loaf=0;let[i,n]=this.bounds(this.plat),r=e.x<this.x?1:-1,a=Bt(this.x+r*Mt(260,440),i,n);if(Math.abs(a-this.x)<130){let o=this.chooseTarget(e);if(o){this.plan=o,this.hurry=!0,this.fleeing=!0,this.nextHop(),this.hurry=!0;return}a=Bt(this.x-r*Mt(220,380),i,n)}this.plan=null,this.fleeing=!0,this.walkTo(a,()=>{this.fleeing=!1,this.startWary()}),this.hurry=!0}startWary(){this.clearAct(),this.state="wary",this.timer=Mt(3,6),this.wt.sit=0,this.wt.loaf=0,this.wt.crouch=.55,this.lookMode="pointer",this.lookTimer=4,this.faceYaw(this.facing,"34")}updateShy(t){let e=this.app,i=e.pointer;if(this.fear=0,!i)return;let n=performance.now(),r=this.headPos||[this.x,this.y-this.standH*.6],a=Math.hypot(i.x-r[0],i.y-r[1]),o=n-i.moveT<2500,c=300*(1-this.trust*.72);o&&a<c&&(this.fear=Bt(1-a/c,0,1)*(1-this.trust)),a<420&&i.speed<140&&!this.fleeing&&this.state!=="held"&&(this.trust=Math.min(1,this.trust+t*.011*(a<250?1.5:1))),o&&a<260&&i.speed>700&&(this.trust=Math.max(0,this.trust-t*.12)),this.trust<.7&&o&&!this.fleeing&&!this.busy()&&["idle","sit","loaf","walk","wary","petted","scratch","knock"].includes(this.state)&&(a<c*.42||i.speed>380&&a<c||e.hoverCat===this&&this.trust<.35?this.flee():a<c&&!["wary","walk","petted"].includes(this.state)&&this.startWary()),this.saveT+=t,this.saveT>5&&(this.saveT=0,this.persistTrust())}update(t){let e=this.app,i=e.world,n=i.W,r=i.H;if(this.time+=t,this.cool-=t,this.shy&&this.updateShy(t),this.hyper&&this.time-this.lastInteract>4&&(this.annoy=Math.max(0,this.annoy-t*.03)),this.P.pees&&(this.peeCool-=t),this.plat&&this.state!=="jump"&&this.state!=="fall"&&this.state!=="held"){let u=i.live(this.plat);if(u){if(this.y=u.y,!u.floor){let d=this.state==="loaf"?this.loafH*.8:this.standH*.75;u.y<d?(this.y=Math.max(u.y,d),this.startFall(0)):u.y>r-4?(this.plat=i.floor,this.y=i.floor.y):this.state!=="exit"&&(this.x<u.x1-2||this.x>u.x2+2)&&this.startFall(0)}}else{let d=i.find(this.x,this.y,8);d?(this.plat=d,this.y=d.y):this.startFall()}}let a=!1,o=0,c=Math.abs(this.yaw-this.yawT)<.25;switch(this.state){case"enter":case"walk":{let u=this.tx-this.x;if(Math.abs(u)<3){if(this.state==="enter"){this.state="idle",this.timer=Mt(.6,1.4),this.lookMode="viewer",this.lookTimer=1.2;break}this.x=this.tx;let _=this.then;this.then=null,_?_():this.plan?this.nextHop():this.think();break}if(this.state==="walk"&&e.hoverCat===this&&!this.hurry&&!this.zoom&&!this.shy&&!this.proud&&!this.stomping){this.state="idle",this.timer=Mt(1.2,2.2),this.lookMode="pointer",this.lookTimer=2;break}let d=u>0?1:-1;if(this.facing=d,this.faceYaw(d),Math.abs(this.yaw-this.yawT)>.5&&this.sp.sit.x<.3&&this.sp.loaf.x<.3){a=!0,o=0;break}if(this.sp.sit.x>.3||this.sp.loaf.x>.3||this.sp.rear.x>.3)break;a=!0;let f=this.hurry||Math.abs(u)>n*.45;o=this.zoom?128:f?72:30,this.fleeing&&(o=95),this.chasing&&(o=118),this.stomping&&(o=84),this.proud&&(o=24),this.state==="enter"&&(o=34);let g=Bt(Math.abs(u)/(o*this.s*.35+1),.25,1);o*=g;break}case"idle":this.timer-=t,this.timer<=0&&(this.plan?this.nextHop():this.think());break;case"sit":case"loaf":this.timer-=t,this.timer<=0&&(this.wt.sit=0,this.wt.loaf=0,this.state="idle",this.timer=.7,this.faceYaw(this.facing));break;case"wary":{let u=e.pointer,d=!u||performance.now()-u.moveT>2500||this.fear<.05;this.timer-=t*(d?2:.6),this.timer<=0&&(this.wt.crouch=0,this.think());break}case"crouch":this.timer-=t,this.timer<=0&&c&&this.launch();break;case"held":this.updateHeld(t);break;case"petted":this.petLeft-=t,this.petLeft<=0&&(this.wt.arch=0,this.wt.crouch=0,this.sp.loaf.x>.5?(this.state="loaf",this.timer=Mt(4,8)):this.sp.sit.x>.5||Math.random()<.5?this.startPosture("sit",Mt(4,8)):(this.state="idle",this.timer=Mt(.8,1.6)));break;case"bat":this.batT+=t,this.batT>=this.batDur&&(this.batTarget=null,this.state="idle",this.timer=Mt(.6,1.4),this.wt.sit=Math.random()<.5?1:0);break;case"knock":{this.batT+=t;let u=this.batTarget&&this.batTarget.el;if(!u||!u.isConnected){this.batTarget=null,this.state="idle",this.timer=.8;break}if(this.knockHigh?this.sp.rear.x>.7:this.sp.sit.x>.55){let d=this.batT*2.3,f=d%1;if(this.batPrev<.3&&f>=.3&&this.hitIdx<this.hits){this.hitIdx++;let g=this.hitIdx>=this.hits;e.mischief.knock(u,this.facing,g?Math.random()<.62?"fall":"askew":"wobble"),g&&(this.batDur=this.batT+.45)}this.batPrev=f}else this.batT=0;if(this.batT>=this.batDur){if(this.batTarget=null,this.wt.rear=0,this.knockLeft>0&&(this.knockLeft--,this.wt.sit=0,this.goKnock(!1)))break;this.wt.sit=1,this.state="sit",this.timer=Mt(2,4),this.lookMode="viewer",this.lookTimer=2.5}break}case"scratch":this.updateScratch(t);break;case"shred":this.updateShred(t);break;case"angry":this.updateAngry(t);break;case"pee":this.updatePee(t),this.walkStep&&(this.walkStep=!1,a=!0,o=20);break;case"stalk":{let u=e.pointer;if(this.timer-=t,!u||Math.abs(u.x-this.x)>560||!this.plat){this.wt.crouch=0,this.wt.wiggle=0,this.state="idle",this.timer=1,this.cool=3;break}let d=u.x>this.x?1:-1;Math.abs(u.x-this.x)>24&&d!==this.facing&&(this.facing=d,this.faceYaw(d)),this.timer<=0&&c&&this.pounce();break}case"jump":{let u=this.jump,d=i.live(u.p);d&&(u.y1=d.y),u.s=Math.min(1,u.s+t/u.T);let f=u.s,g=u.x0+(u.lx-u.x0)*f,_=u.y0+(u.y1-u.y0)*f-4*u.A*f*(1-f),m=(g-this.x)/Math.max(t,1e-4),p=(_-this.y)/Math.max(t,1e-4);this.x=g,this.y=_,this.vy=p,Oe(this.sp.airPitch,Bt(-p/(Math.abs(m)+260),-.55,.55),12,t),f>=1&&(d&&this.x>=d.x1-4&&this.x<=d.x2+4?this.land(d):this.startFall(m*.3));break}case"fall":{let u=this.y;this.vy+=2600*t,this.y+=this.vy*t,this.x+=this.vx*t,this.exiting||(this.x<this.len*.55&&(this.x=this.len*.55,this.vx=Math.abs(this.vx)*.2),this.x>n-this.len*.55&&(this.x=n-this.len*.55,this.vx=-Math.abs(this.vx)*.2)),Oe(this.sp.airPitch,-.28,7,t);let d=i.landing(this.x,u,this.y);d&&this.land(d);break}case"land":if(this.timer-=t,this.timer<=0){if(this.exiting){this.state="exit";break}if(this.angerOnLand){this.angerOnLand=!1,this.afterEscape=!1,this.afterPounce=!1,this.getAngry(!0);break}if(this.afterEscape){this.afterEscape=!1;let u=e.pointer;if(u&&this.P.kitten&&Math.random()<.5){this.stalk();break}if(u&&(this.flee(!0),this.state==="walk"))break}if(this.afterPounce){this.afterPounce=!1;let u=e.pointer,d=u&&Math.hypot(u.x-this.x,u.y-(this.y-this.standH*.6))<this.len*1.6;this.hyper&&u?d&&Math.random()<.55?this.startBat():this.chase()||(this.state="idle",this.timer=Mt(.3,.8),this.lookMode="pointer",this.lookTimer=2):u&&this.P.kitten&&d?this.startBat():(this.state="idle",this.timer=Mt(1,2),this.lookMode="pointer",this.lookTimer=2);break}this.plan?((this.plan.path[0]===this.plat||this.plan.path[0]&&this.plan.path[0].floor&&this.plat.floor)&&this.plan.path.shift(),this.plan.path.length?this.nextHop():(this.plan=null,this.fleeing?(this.fleeing=!1,this.startWary()):this.chasing?this.endChase():this.settle())):this.settle()}break;case"exit":{if(this.facing=-1,this.faceYaw(-1),this.sp.sit.x>.3||this.sp.loaf.x>.3||this.sp.rear.x>.3)break;if(Math.abs(this.yaw-this.yawT)>.5){a=!0;break}a=!0,o=Bt(250/(this.s*Math.cos(Er)),60,170),this.plat&&!this.plat.floor&&this.x<this.plat.x1-this.feet*.3&&this.startFall(-120),this.x<-this.len*1.2&&(this.state="gone",this.alive=!1);break}}let l=this.sp;Oe(l.speed,o,6,t),Oe(l.move,a?o>0?1:.4:0,9,t),Oe(l.trot,o>50?1:0,5,t);let h=(l.trot.x>.5?40:26)*this.P.sy;a&&(this.phase=(this.phase+(Math.max(0,l.speed.x)+6*l.move.x)*t/h)%1),(this.state==="walk"||this.state==="enter"||this.state==="exit")&&(this.x+=this.facing*Math.max(0,l.speed.x)*this.s*Math.cos(Er)*t,this.state==="walk"&&(this.facing>0&&this.x>this.tx||this.facing<0&&this.x<this.tx)&&(this.x=this.tx));for(let u of Lo)Oe(l[u],this.wt[u],px[u],t);Oe(l.land,0,11,t),Oe(l.yaw,this.yawT,this.state==="exit"||this.fleeing?8:5.5,t),l.yaw.x>Math.PI*1.5?(l.yaw.x-=Es,this.yawT-=Es):l.yaw.x<-Math.PI*2.5&&(l.yaw.x+=Es,this.yawT+=Es),Oe(l.spineYaw,Bt((this.yawT-l.yaw.x)*.5,-.4,.4),7,t),this.state!=="jump"&&this.state!=="fall"&&Oe(l.airPitch,0,8,t),this.updateFace(t)}updateHeld(t){let e=this.hold,i=this.sp,n=e.ax,r=e.ay;e.ax=As(e.ax,e.x,32,t),e.ay=As(e.ay,e.y,32,t);let a=(e.ax-n)/t,o=(e.ay-r)/t;e.acc=As(e.acc,(a-e.vx)/t,20,t),e.vx=a,e.vy=o;let c=this.pend,l=24*this.s,h=-(2600/l)*Math.sin(c.th)-3.4*c.om-Bt(e.acc,-4e4,4e4)/l*Math.cos(c.th);this.burst&&(h+=Math.sin(this.time*17+this.seed)*26*i.struggle.x),c.om+=h*t,c.th=Bt(c.th+c.om*t,-.85,.85),Math.abs(c.th)>=.85&&(c.om*=.5);let u=Math.hypot(a,o);this.strug+=t*((ox[this.P.temper]||.2)+Bt(u/600,0,2.5)*.38+(this.shy?(1-this.trust)*.9:0)+(this.hyper&&this.grumpy()?.9:0)),this.hyper&&(this.lastInteract=this.time,this.annoy=Math.min(1,this.annoy+t*.35),this.annoy>=1&&!this.grumpy()&&(this.angerOnLand=!0,this.grumpyUntil=this.time+Mt(15,20),this.annoy=.35,this.strug=1)),this.burstT-=t,this.burstT<=0&&(this.burst=this.strug>.25&&!this.burst,this.burstT=this.burst?Mt(.45,.9):Mt(.3,1)*(1.4-Math.min(1,this.strug)));let d=this.burst?Bt(.55+this.strug*.5,0,1):u>900?.5:.12;Oe(i.struggle,d,9,t),this.strug>=1&&this.breakFree()}updateScratch(t){let e=this.scr,i=this.app;if(!e){this.state="idle",this.timer=1;return}if(e.t+=t,e.phase==="turn"){Math.abs(this.yaw-this.yawT)<.3&&(e.phase="rear",e.t=0,this.wt.rear=1);return}if(e.phase==="rear"){if(this.sp.rear.x>.8){e.phase="scratch",e.t=0;let n=this.hp&&(this.hp.tipFR||this.hp.pawFR),r=n?n[0]:this.x,a=n?n[1]+4*this.s:this.y-this.standH;e.mark=i.mischief.newMark(r,a,50*this.s,58*this.s)}return}if(e.phase==="scratch"){let r=Math.floor(e.t/.56),a=e.t%.56/.56,o=r%2===0?"FR":"FL",c=a<.62?a/.62:1-(a-.62)/.38;e.k={FR:o==="FR"?c:0,FL:o==="FL"?c:0},r!==e.cyc&&(e.stroke&&e.mark&&e.lastTip&&(i.mischief.flecks(e.mark,e.lastTip[0],e.lastTip[1],2+Math.floor(Math.random()*3)),i.mischief.debris(e.lastTip[0],e.lastTip[1],this.y,1+Math.floor(Math.random()*3),i.mischief.paper())),e.cyc=r,e.stroke=e.mark?i.mischief.startStroke(e.mark,4,1.7*this.s):null);let l=this.hp&&this.hp["tip"+o];l&&e.stroke&&a<.62&&(i.mischief.addPoint(e.mark,e.stroke,l[0],l[1]),e.lastTip=l.slice()),e.t>=e.dur&&(e.phase="down",e.t=0,this.wt.rear=0,e.k=null);return}e.phase==="down"&&this.sp.rear.x<.25&&(this.scr=null,this.faceYaw(this.facing,"34"),this.state="idle",this.timer=Mt(1.2,2.2),this.lookMode="viewer",this.lookTimer=2)}updateFace(t){let e=this.app,i=this.sp;this.lookTimer-=t;let n=e.pointer,r=this.lookMode,a=this.headPos||[this.x,this.y-this.standH*.7],o=n&&performance.now()-n.t<4e3&&Math.hypot(n.x-a[0],n.y-a[1])<170+this.len*.5,c=this.state==="pee"&&this.pee?this.pee.phase:null;if(n&&(this.state==="petted"||this.state==="bat"||this.state==="stalk"||this.state==="wary"||this.state==="angry"||this.fleeing))r="pointer";else if((this.state==="shred"||c==="sniff"||c==="cover")&&this.lookPt)r="point";else if(c==="squat")r="viewer";else if(this.stomping||this.proud)r="ahead";else if(this.state==="knock"&&this.batTarget)r="el";else if(this.state==="scratch")r="wall";else if(o&&!["jump","fall","crouch","held"].includes(this.state))r="pointer";else if(this.lookTimer<=0&&this.state!=="crouch"){this.lookTimer=Mt(1.2,3.8);let p=Math.random();this.lookMode=p<.35?"viewer":p<.75?"random":"ahead",this.lookRand=[Mt(-1,1),Mt(-.3,.45)],this.headTiltT=Math.random()<.25?Mt(-.25,.25):0,r=this.lookMode}let l=0,h=0,u=(p,y,b)=>(ye.set(p,y,b).normalize().applyQuaternion($u.copy(this.group.quaternion).invert()),[Math.atan2(ye.z,ye.x),Math.atan2(ye.y,Math.hypot(ye.x,ye.z))]);if((this.state==="walk"||this.state==="exit"||this.state==="enter")&&r!=="pointer"&&(r=r==="viewer"&&this.lookTimer>0?"viewer":"ahead"),r==="pointer"&&!n&&(r="viewer"),r==="viewer")[l,h]=u(0,.12,1);else if(r==="pointer")[l,h]=u(n.x-a[0],-(n.y-a[1]),90),this.state==="petted"&&(h+=.25);else if(r==="point"&&this.lookPt)[l,h]=u(this.lookPt[0]-a[0],-(this.lookPt[1]-a[1]),30);else if(r==="el"&&this.batTarget&&this.batTarget.el){let p=this.batTarget.el.getBoundingClientRect();[l,h]=u(p.left+p.width/2-a[0],-(p.top+p.height/2-a[1]),30)}else r==="wall"?(l=0,h=.35):r==="random"&&([l,h]=this.lookRand);if(this.proud&&(h+=.25),this.state==="held"&&(l+=wr(this.time*.9,this.seed)*.5+Math.sin(this.time*5)*.45*i.struggle.x,h+=wr(this.time*.7,this.seed+3)*.2),l+=wr(this.time*.8,this.seed)*.06,h+=wr(this.time*.6,this.seed+7)*.04,l=Bt(l,-1.35,1.35),h=Bt(h,-.7,.75),Oe(i.lookYaw,l,8,t),Oe(i.lookPitch,h,8,t),this.gaze=[Bt(l-i.lookYaw.x,-.35,.35),Bt(h-i.lookPitch.x,-.25,.25)],Oe(i.headTilt,this.headTiltT,4,t),this.blinkT-=t,this.blinkT<=0){let p=(r==="viewer"||r==="pointer")&&["sit","loaf","idle"].includes(this.state)&&Math.random()<.45;this.blinkDur=p?.9:.13,this.blink=this.blinkDur,this.blinkT=Mt(2.2,6.5)+this.blinkDur}this.blink=Math.max(0,this.blink-t),this.earT-=t,this.earT<=0&&(this.earT=Mt(1.5,6),this.earK=Math.random()<.5?"R":"L",this.earPh=0),this.earPh=Math.min(1,this.earPh+t/.28);let d=0;this.state==="held"?d=.3+i.struggle.x*.6:this.state==="wary"||this.fleeing?d=.75:this.zoom?d=.45:this.petShy&&this.state==="petted"&&(d=.4),this.state==="angry"?d=1:this.stomping?d=Math.max(d,.65):this.grumpy()&&(d=Math.max(d,.32)),d=Math.max(d,this.fear*.9),Oe(i.earFlat,d,8,t);let f=.45,g=.45;this.state==="walk"||this.state==="enter"?(f=this.zoom?.95:this.fleeing?.15:i.trot.x>.5?.6:.88,g=this.zoom?.5:.18):this.state==="exit"?(f=.55,g=.1):this.state==="crouch"?(f=.15,g=1):this.state==="sit"||this.state==="loaf"?(f=.2,g=.18):this.state==="petted"?(f=this.petShy?.3:.98,g=.1):this.state==="stalk"?(f=.08,g=1.3):this.state==="bat"||this.state==="knock"?(f=.35,g=.9):this.state==="wary"?(f=.02,g=.6):this.state==="scratch"?(f=.7,g=.55):this.state==="held"?(f=-.3+i.struggle.x*.25,g=.35+i.struggle.x*1.1):this.state==="shred"?(f=.6,g=.75):this.state==="angry"?(f=.55,g=1.9):c&&(f=c==="squat"?.97:c==="sniff"?.4:.75,g=c==="squat"?.03:.2),this.stomping?(f=.6,g=1.4):this.proud?(f=1,g=.06):this.chasing&&this.state==="walk"?(f=.78,g=.4):this.grumpy()&&(this.state==="sit"||this.state==="idle")&&(g=Math.max(g,.95)),Oe(i.tailUp,f,4,t),Oe(i.tailWave,g,4,t);let _=this.P.pupil;["stalk","bat","knock","held","wary"].includes(this.state)||this.fleeing||this.zoom||this.chasing?_=.95:this.state==="shred"?_=.85:this.state==="loaf"&&(_*=.75),_=Math.max(_,this.fear),this.state==="angry"&&(_=.2),Oe(i.pupil,_,5,t);let m=this.puffT;Oe(i.puff,m,m>i.puff.x?7:.9,t)}pose(){let t=this.P,e=this.sp,i=this.w,n=this.state==="held"&&this.hold;this.group.position.set(this.x,-this.y,this.z),this.group.quaternion.setFromAxisAngle(ux,Yu).multiply(lx.setFromAxisAngle(dx,this.yaw)),n&&this.group.quaternion.premultiply(cx.setFromAxisAngle(fx,this.pend.th));let r=t.lids;if(this.state==="loaf"?r*=.55:this.state==="sit"?r*=.85:this.state==="petted"?r=this.petShy?.6:.16:["stalk","bat","knock","wary","shred"].includes(this.state)||this.fleeing||this.chasing?r=1:this.state==="angry"?r=.6:this.state==="pee"&&this.pee&&this.pee.phase==="squat"&&(r=.42),this.proud?r=Math.min(r,.7):n&&(r=Math.max(r,.85)-e.struggle.x*.25),this.blink>0){let b=this.blinkDur>.5?Math.sin(Math.PI*(1-this.blink/this.blinkDur)):1;r=r*(1-b)+.02*b}let a={R:0,L:0};a[this.earK]=Math.sin(Math.PI*this.earPh)*.9;let o=null,c=this.state==="angry"&&this.ang&&this.ang.phase==="swat"||this.state==="shred"&&e.crouch.x>.5;if(((this.state==="bat"||this.state==="knock")&&(e.sit.x>.55||e.rear.x>.7)||c)&&this.hp&&this.batTarget){let b,v;if(this.batTarget.el){let T=this.batTarget.el.getBoundingClientRect();b=T.left+T.width/2,v=T.top+T.height/2}else this.batTarget.pt?(b=this.batTarget.pt[0],v=this.batTarget.pt[1]):this.app.pointer&&(b=this.app.pointer.x,v=this.app.pointer.y);if(b!=null){let T=this.hp[this.viewerLeg()]||this.hp.spine2;ye.set(b-T[0],-(v-T[1]),40).normalize().applyQuaternion($u.copy(this.group.quaternion).invert());let E=Bt(Math.atan2(ye.z,ye.x),-.8,.8),x=Bt(Math.atan2(ye.y,Math.hypot(ye.x,ye.z)),this.state==="shred"?-1.15:-.15,1.1),S=this.batT*(this.state==="knock"?2.3:this.state==="angry"?3.6:this.state==="shred"?1.9:2.4)%1,C=Math.pow(Math.sin(Math.PI*Math.min(1,S*1.7)),.8);o={leg:this.viewerLeg()==="upperFR"?"FR":"FL",k:C,dir:[Math.cos(x)*Math.cos(E),Math.sin(x),Math.cos(x)*Math.sin(E)]}}}let l=this.state==="petted",h=e.headTilt.x;l&&!this.petShy&&(h+=Math.sin(this.time*3.2)*.2);let u=0,d=0;n&&(u=Bt(-this.pend.om*.25,-1.6,1.6),d=e.struggle.x*(Math.sin(this.time*9.5+this.seed)*.45+Math.sin(this.time*15.3)*.15)+wr(this.time*.8,this.seed)*.12),this.c.pupilU.value=e.pupil.x,this.c.furMat.userData.uniforms.uPuff.value=e.puff.x;let f=this.app.lastDt||1/60,g=this.accS;if(this.prevP){let b=(this.x-this.prevP[0])/f,v=-(this.y-this.prevP[1])/f,T=Bt((b-this.prevP[2])/f,-9e3,9e3),E=Bt((v-this.prevP[3])/f,-9e3,9e3),x=Bt((e.yaw.v-this.prevP[4])/f,-60,60);g[0]=As(g[0],T*this.facing,18,f),g[1]=As(g[1],E,18,f),g[2]=As(g[2],x,18,f),this.prevP[0]=this.x,this.prevP[1]=this.y,this.prevP[2]=b,this.prevP[3]=v,this.prevP[4]=e.yaw.v}else this.prevP=[this.x,this.y,0,0,e.yaw.v];if(this.rig.apply({time:this.time,phase:this.phase,move:e.move.x,trot:e.trot.x,stride:(e.trot.x>.5?40:26)*t.sy,sit:i.sit,loaf:i.loaf,crouch:i.crouch,air:i.air,land:i.land,airPitch:e.airPitch.x,lookYaw:e.lookYaw.x,lookPitch:e.lookPitch.x,gazeYaw:this.gaze?this.gaze[0]:0,gazePitch:this.gaze?this.gaze[1]:0,headTilt:h,lids:r,earTwitch:a,earSwivel:e.lookYaw.x*.25+(l&&!this.petShy?.35:0),earFlat:e.earFlat.x,tailUp:e.tailUp.x,tailWave:e.tailWave.x,viewerSide:Math.cos(this.yaw)>0?1:-1,spineYaw:e.spineYaw.x,hang:i.hang,wiggle:i.wiggle,arch:i.arch,rear:i.rear,scratch:this.scr&&this.scr.k,bat:o,swing:u,twist:d,struggle:n?e.struggle.x:0,tuck:t.kitten?1:.2,noGround:i.hang>.2,belly:(t.paunch||1)-1,squat:i.squat,angry:i.angry,kick:this.kick,dt:f,acc:g,breath:n?1.6+e.struggle.x:this.fleeing||this.zoom?1.8:1}),n){let b=this.rig.m;ye.copy(b.neck.p).add(b.head.p).multiplyScalar(.5),ye.y+=3.2*t.sy,ye.multiplyScalar(this.s).applyQuaternion(this.group.quaternion),this.group.position.set(this.hold.ax-ye.x,-this.hold.ay-ye.y,this.z+300),this.x=this.group.position.x,this.y=-this.group.position.y}let _=this.shadow,m=this.plat?1:0,p=this.plat?this.plat.y:this.y,y=this.x+this.facing*(this.front-this.back)*.25-i.sit*this.back*.35*this.facing;_.position.set(y,-p+1.2,this.z-14),_.scale.set(this.len*(.78-i.sit*.25)*(t.girth>1.2?1.12:1),Math.max(4,7*this.s*.5),1),_.material.opacity=.32*Math.max(0,1-i.air*1.2)*m*(1-i.hang)}viewerLeg(){return Math.cos(this.yaw)>0?"upperFR":"upperFL"}afterRender(){let t=this.c.B,e=this.c.J;this.hp||(this.hp={});for(let i of hx){ye.setFromMatrixPosition(t[i].matrixWorld);let n=this.hp[i]||(this.hp[i]=[0,0]);n[0]=ye.x,n[1]=-ye.y}ye.fromArray(this.headOff||(this.headOff=[e.headC[0]-e.head[0],e.headC[1]-e.head[1],0])).applyMatrix4(t.head.matrixWorld),this.hp.headC=[ye.x,-ye.y];for(let i of["R","L"]){let n=this["toeOff"+i]||(this["toeOff"+i]=[e["ftoe"+i][0]-e["wrist"+i][0],e["ftoe"+i][1]-e["wrist"+i][1],e["ftoe"+i][2]-e["wrist"+i][2]]);ye.fromArray(n).applyMatrix4(t["pawF"+i].matrixWorld),this.hp["tipF"+i]=[ye.x,-ye.y]}this.headPos=this.hp.headC,this.pelvisPos=this.hp.pelvis}},Tr=[{dpr:2,layers:12,shadow:!0},{dpr:1.6,layers:8,shadow:!0},{dpr:1.3,layers:5,shadow:!1},{dpr:1,layers:3,shadow:!1}],gc=class{constructor(t){this.opts=t||{},this.lowPower=window.matchMedia&&matchMedia("(pointer: coarse)").matches||innerWidth<700,this.maxDpr=Math.min(window.devicePixelRatio||1,this.lowPower?1.5:2),this.qLevel=this.lowPower?1:0,window.__catQuality!=null&&(this.qLevel=window.__catQuality),this.dpr=Math.min(this.maxDpr,Tr[this.qLevel].dpr),this.layers=Tr[this.qLevel].layers,this.qStat={acc:0,n:0,t0:performance.now(),good:0,hold:performance.now()+4e3};let e=this.canvas=document.createElement("canvas");e.className="apd-cats",e.setAttribute("aria-hidden","true"),Object.assign(e.style,{position:"fixed",left:"0",top:"0",width:"100vw",height:"100vh",pointerEvents:"none",zIndex:"58",opacity:"1",transition:"opacity .6s ease"}),document.body.appendChild(e);let i=this.renderer=new wo({canvas:e,antialias:!0,alpha:!0,premultipliedAlpha:!0});i.setPixelRatio(this.dpr),i.setClearColor(0,0),i.toneMapping=lr,i.toneMappingExposure=1.15,i.outputColorSpace=We;let n=Wu(i);this.scene=n.scene,this.lights=n.lights,this.initShadow(),this.camera=new pn(0,100,0,-100,-2e3,2e3),this.camera.position.set(0,0,1e3),this.resize();let r=document.createElement("canvas");r.width=128,r.height=32;let a=r.getContext("2d"),o=a.createRadialGradient(64,16,2,64,16,62);o.addColorStop(0,"rgba(0,0,0,0.85)"),o.addColorStop(.5,"rgba(0,0,0,0.35)"),o.addColorStop(1,"rgba(0,0,0,0)"),a.setTransform(1,0,0,.25,0,12),a.fillStyle=o,a.fillRect(0,-64,128,192);let c=new Rn(r);this.shadowGeo=new cn(1,1),this.shadowMat=new En({map:c,transparent:!0,depthWrite:!1,opacity:.3,color:2760724});let l=this.opts,h=typeof l.root=="string"?document.querySelector(l.root):l.root;this.world=new Po(h||document.getElementById("app")||document.body,e,l.topbar),this.world.scan(),this.mischief=new Io(this),this.cats=[],this.queue=Iu.slice(),innerWidth<520&&(this.queue=this.queue.filter(u=>["induk","belang","aktif","oyen","gendut"].includes(u.id))),this.maxCats=this.queue.length,this.spawnT=.35,this.pointer=null,this.hoverCat=null,this.press=null,this.eatClick=!1,this.lastDt=1/60,this.styleEl=document.createElement("style"),this.styleEl.textContent="html.apd-cat-hover,html.apd-cat-hover *{cursor:grab!important}html.apd-cat-drag,html.apd-cat-drag *{cursor:grabbing!important;user-select:none!important;-webkit-user-select:none!important}",document.head.appendChild(this.styleEl),this._onMove=u=>this.onMove(u),this._onDown=u=>this.onDown(u),this._onUp=u=>this.onUp(u),this._onClick=u=>{this.eatClick&&(u.preventDefault(),u.stopImmediatePropagation(),this.eatClick=!1)},this._onTouch=u=>{let d=u.touches&&u.touches[0];d&&!this.exiting&&this.catAt(d.clientX,d.clientY)&&u.preventDefault()},this._onMouseDown=u=>{this.press&&u.preventDefault()},this._onDrag=u=>{this.press&&u.preventDefault()},this._onBlur=()=>{let u=this.press;this.press=null,u&&u.drag&&u.cat.release(0,0),this.setCursor(null)},addEventListener("pointerdown",this._onDown,{capture:!0,passive:!1}),addEventListener("pointerup",this._onUp,{capture:!0}),addEventListener("pointercancel",this._onUp,{capture:!0}),addEventListener("click",this._onClick,{capture:!0}),addEventListener("touchstart",this._onTouch,{capture:!0,passive:!1}),addEventListener("mousedown",this._onMouseDown,{capture:!0}),addEventListener("dragstart",this._onDrag,{capture:!0}),addEventListener("blur",this._onBlur),this._onResize=()=>this.resize(),this._onVis=()=>{this.last=performance.now(),this.qStat.hold=performance.now()+2e3},addEventListener("pointermove",this._onMove,{passive:!0}),addEventListener("resize",this._onResize,{passive:!0}),document.addEventListener("visibilitychange",this._onVis),this.last=performance.now(),this.running=!0,this.frame=this.frame.bind(this),this.raf=requestAnimationFrame(this.frame)}setCursor(t){let e=document.documentElement.classList;e.toggle("apd-cat-hover",t==="hover"),e.toggle("apd-cat-drag",t==="drag")}catAt(t,e){if(this.exiting)return null;for(let i=this.cats.length-1;i>=0;i--){let n=this.cats[i];if(n.alive&&n.state!=="exit"&&n.hit(t,e))return n}return null}onMove(t){let e=performance.now(),i=t.clientX,n=t.clientY,r=this.pointer;if(r){let o=Math.max(4,e-r.t),c=(i-r.x)/o*1e3,l=(n-r.y)/o*1e3;r.vx=r.vx*.55+c*.45,r.vy=r.vy*.55+l*.45,r.speed=Math.hypot(r.vx,r.vy),Math.hypot(i-r.x,n-r.y)>2&&(r.moveT=e),r.dx=i-r.x,r.dy=n-r.y,r.x=i,r.y=n,r.t=e}else r=this.pointer={x:i,y:n,t:e,vx:0,vy:0,speed:0,moveT:e,dx:0,dy:0};let a=this.press;if(a){!a.drag&&Math.hypot(i-a.x,n-a.y)>6&&(a.drag=a.cat.grab(i,n),a.drag&&this.setCursor("drag")),a.drag&&a.cat.hold&&(a.cat.hold.x=i,a.cat.hold.y=n);return}if(t.pointerType!=="touch"){let o=this.catAt(i,n);o!==this.hoverCat&&(this.hoverCat=o,this.stroke={cat:o,d:0,t:e}),this.setCursor(o?"hover":null),o&&this.stroke&&(e-this.stroke.t>1600&&(this.stroke.d=0,this.stroke.t=e),this.stroke.d+=Math.hypot(r.dx,r.dy),this.stroke.d>110&&(this.stroke.d=0,this.stroke.t=e,o.pet()))}r.speed>650&&e-(this.teaseT||0)>250?(this.teaseT=e,this.tease(!0)):r.speed>240&&e-(this.teaseT2||0)>300&&(this.teaseT2=e,this.tease(!1))}onDown(t){if(this.exiting||t.button!=null&&t.button!==0)return;let e=this.catAt(t.clientX,t.clientY);e&&(t.preventDefault(),t.stopPropagation(),this.press={cat:e,x:t.clientX,y:t.clientY,t:performance.now(),drag:!1},this.eatClick=!0,clearTimeout(this._eatT))}onUp(t){let e=this.press;if(!e){this.pendingUp&&(this.pendingUp=!1,t.preventDefault(),t.stopPropagation(),clearTimeout(this._eatT),this._eatT=setTimeout(()=>{this.eatClick=!1},400));return}if(this.press=null,t.preventDefault(),t.stopPropagation(),e.drag){let i=this.pointer||{vx:0,vy:0};e.cat.release(i.vx,i.vy)}else e.cat.pet();this.setCursor(t.pointerType!=="touch"&&this.catAt(t.clientX,t.clientY)?"hover":null),this._eatT=setTimeout(()=>{this.eatClick=!1},400)}tease(t){let e=this.pointer,i=this.cats.filter(r=>r.state==="stalk").length,n={playful:.55,curious:.45,calm:.2,aloof:.1,lazy:.03,shy:0,hyper:.95};for(let r of this.cats)if(!(!t&&!r.hyper)){if(i>=3)break;if(!(r.cool>0||!r.plat||!["idle","sit","walk","petted","bat","loaf"].includes(r.state))&&!(r.hyper&&(r.grumpy()||r.annoy>.85||r.chasing||r.proud||r.stomping))&&!(r.state==="loaf"&&!r.P.kitten&&!r.hyper)&&!(r.zoom||r.fleeing)){if(Math.abs(e.x-r.x)>330||e.y<r.plat.y-240||e.y>r.plat.y+30){r.hyper&&Math.abs(e.x-r.x)<1200&&Math.random()<.8&&r.chase()&&i++;continue}if(Math.random()>(n[r.P.temper]||0)){r.cool=1.5;continue}r.stalk(),i++}}}invite(){let t=this.pointer,e=null;for(let i of this.cats){if(!i.plat||!["idle","sit","loaf"].includes(i.state)||i.state==="loaf"&&i.P.temper==="lazy"||i.shy&&i.trust<.75||i.hyper&&i.grumpy())continue;let n=i.plat.y-t.y,r=Math.abs(t.x-i.x);n<20||n>280||r>400||!i.plat.floor&&(t.x<i.plat.x1||t.x>i.plat.x2)||(!e||r<e.dx)&&(e={c:i,dx:r})}e&&Math.random()<.8&&e.c.approach(t.x)}get basePx(){return Bt(innerWidth/620,1.4,2.3)}resize(){let t=innerWidth,e=innerHeight;this.renderer.setSize(t,e,!1),this.shA&&this.sizeShadow();let i=this.camera;if(i.left=0,i.right=t,i.top=0,i.bottom=-e,i.updateProjectionMatrix(),this.cats)for(let n of this.cats)n.setScale(this.basePx);this.world&&(this.world.dirty=!0)}setQuality(t){if(t=Bt(t,0,Tr.length-1),t===this.qLevel)return;this.qLevel=t;let e=Tr[t];this.dpr=Math.min(this.maxDpr,e.dpr),this.layers=e.layers,this.renderer.setPixelRatio(this.dpr),this.renderer.setSize(innerWidth,innerHeight,!1);for(let i of this.cats)i.applyLayers(this.layers),i.setScale(this.basePx)}watchQuality(t,e){if(window.__catQuality!=null)return;let i=this.qStat;if(t<i.hold){i.acc=0,i.n=0,i.t0=t;return}if(i.acc+=Math.min(e,100),i.n++,t-i.t0<2e3)return;let n=i.acc/i.n;n>19.5?(this.setQuality(this.qLevel+1),i.good=0,i.hold=t+1500):n<14.5?++i.good>=3&&this.qLevel>(this.lowPower?1:0)&&(this.setQuality(this.qLevel-1),i.good=0):i.good=0,i.acc=0,i.n=0,i.t0=t}building(t){if(!this.pending){if(!this.queue.length||this.cats.length>=this.maxCats)return;let n=this.queue.shift();this.pending={P:n,gen:Hu(n,{shells:this.lowPower?5:12}),ready:null}}let e=this.pending;if(e.ready)return;let i=performance.now();try{for(;performance.now()-i<t;){let n=e.gen.next();if(n.done){e.ready=n.value;break}}}catch(n){console.warn("cat build failed",n),this.pending=null}}spawn(){let t=this.pending;if(!t||!t.ready)return!1;this.pending=null;try{this.cats.push(new mc(this,t.P,this.cats.length,t.ready))}catch(e){console.warn("cat spawn failed",e)}return this.qStat.hold=performance.now()+2500,!0}step(t,e){this.lastDt=t,this.world.maybeScan(e);let i=this.pointer;i&&!this.press&&e-i.moveT>1400&&i.invited!==i.moveT&&e-i.moveT<2e4&&(i.invited=i.moveT,this.invite()),this.exiting||(this.building(5),this.spawnT-=t,this.spawnT<=0&&this.spawn()&&(this.spawnT=this.queue[0]&&this.queue[0].temper==="shy"?Mt(3.5,5):Mt(1.5,2.4)));for(let n of this.cats)n.update(t),n.pose();for(let n=this.cats.length-1;n>=0;n--)this.cats[n].alive||(this.cats[n].dispose(),this.cats.splice(n,1));this.mischief.update(e)}frame(t){if(!this.running)return;if(this.raf=requestAnimationFrame(this.frame),document.hidden||this.paused){this.paused||(this.last=t);return}let e=t-this.last,i=Math.min(.05,Math.max(.001,e/1e3));this.last=t,this.watchQuality(t,e),this.step(i,t),this.render();for(let n of this.cats)n.afterRender();this.exiting&&(!this.cats.length||t-this.exitAt>7e3)&&this.finish()}simulate(t,e=1/30){let i=0;for(;i<t;){let n=this.last+e*1e3;this.last=n,this.step(e,n),this.scene.updateMatrixWorld();for(let r of this.cats)r.afterRender();i+=e}this.render();for(let n of this.cats)n.afterRender()}initShadow(){let t="varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";this.fsCam=new pn(-1,1,1,-1,0,1),this.fsScene=new Xi,this.fsQuad=new ce(new cn(2,2)),this.fsQuad.frustumCulled=!1,this.fsScene.add(this.fsQuad),this.shMat=new En({color:16777215}),this.blurMat=new hi({uniforms:{tMap:{value:null},uDir:{value:new Xt}},vertexShader:t,depthTest:!1,depthWrite:!1,fragmentShader:`uniform sampler2D tMap; uniform vec2 uDir; varying vec2 vUv;
        void main() { float w0 = 0.2, w1 = 0.17, w2 = 0.12, w3 = 0.075, w4 = 0.04, w5 = 0.02;
          float a = texture2D(tMap, vUv).r * w0;
          a += (texture2D(tMap, vUv + uDir).r + texture2D(tMap, vUv - uDir).r) * w1;
          a += (texture2D(tMap, vUv + uDir * 2.0).r + texture2D(tMap, vUv - uDir * 2.0).r) * w2;
          a += (texture2D(tMap, vUv + uDir * 3.0).r + texture2D(tMap, vUv - uDir * 3.0).r) * w3;
          a += (texture2D(tMap, vUv + uDir * 4.0).r + texture2D(tMap, vUv - uDir * 4.0).r) * w4;
          a += (texture2D(tMap, vUv + uDir * 5.0).r + texture2D(tMap, vUv - uDir * 5.0).r) * w5;
          gl_FragColor = vec4(vec3(a / 0.97), 1.0); }`}),this.compMat=new hi({uniforms:{tMap:{value:null},uOff:{value:new Xt},uOpacity:{value:.3},uCol:{value:new vt(.08,.06,.04)}},vertexShader:t,transparent:!0,premultipliedAlpha:!0,depthTest:!1,depthWrite:!1,fragmentShader:`uniform sampler2D tMap; uniform vec2 uOff; uniform float uOpacity; uniform vec3 uCol; varying vec2 vUv;
        void main() { float a = texture2D(tMap, vUv - uOff).r * 0.75 + texture2D(tMap, vUv - uOff * 0.35).r * 0.25; a = clamp(a, 0.0, 1.0) * uOpacity; gl_FragColor = vec4(uCol * a, a); }`}),this.sizeShadow()}sizeShadow(){let t=Math.max(64,Math.round(innerWidth/3)),e=Math.max(64,Math.round(innerHeight/3));this.shA&&this.shA.width===t&&this.shA.height===e||(this.shA&&(this.shA.dispose(),this.shB.dispose()),this.shA=new Qe(t,e,{depthBuffer:!0}),this.shB=new Qe(t,e,{depthBuffer:!1}))}render(){let t=this.renderer,e=this.scene;if(this.lightForPage(),!Tr[this.qLevel].shadow||!this.cats.length){t.render(e,this.camera);return}this.sizeShadow();for(let a of this.cats)a.c.body.geometry.instanceCount=1,a.shadow.visible=!1;e.overrideMaterial=this.shMat;let i=e.environment;e.environment=null,t.setRenderTarget(this.shA),t.setClearColor(0,1),t.clear(),t.render(e,this.camera),e.overrideMaterial=null,e.environment=i;for(let a of this.cats)a.applyLayers(this.layers),a.shadow.visible=!0;let n=this.fsQuad;n.material=this.blurMat,this.blurMat.uniforms.tMap.value=this.shA.texture,this.blurMat.uniforms.uDir.value.set(1.5/this.shA.width,0),t.setRenderTarget(this.shB),t.render(this.fsScene,this.fsCam),this.blurMat.uniforms.tMap.value=this.shB.texture,this.blurMat.uniforms.uDir.value.set(0,1.5/this.shA.height),t.setRenderTarget(this.shA),t.render(this.fsScene,this.fsCam),t.setRenderTarget(null),t.setClearColor(0,0),t.clear(),n.material=this.compMat;let r=this.dark;this.compMat.uniforms.tMap.value=this.shA.texture,this.compMat.uniforms.uOff.value.set(11/innerWidth,-16/innerHeight),this.compMat.uniforms.uOpacity.value=r?.42:.3,t.autoClear=!1,t.render(this.fsScene,this.fsCam),t.render(e,this.camera),t.autoClear=!0}lightForPage(){let t=document.documentElement.getAttribute("data-scheme")==="dark";if(t===this.dark)return;this.dark=t;let e=this.lights;e.hemi.groundColor.set(t?1909811:6970700),e.hemi.intensity=t?.7:.85,e.fill.color.set(t?10465496:14673919),e.rim.intensity=t?1.8:1.4}exit(t){if(!this.exiting){if(this.exiting=!0,this.exitAt=performance.now(),this.onDone=t,this.press){let e=this.press;this.press=null,e.drag&&e.cat.release(0,0)}this.setCursor(null),this.queue.length=0,this.pending=null;for(let e of this.cats)e.exit();this.mischief.clear()}}finish(){this.running&&(this.canvas.style.opacity="0",this.running=!1,setTimeout(()=>this.dispose(),650))}dispose(){cancelAnimationFrame(this.raf),removeEventListener("pointerdown",this._onDown,{capture:!0}),removeEventListener("pointerup",this._onUp,{capture:!0}),removeEventListener("pointercancel",this._onUp,{capture:!0}),removeEventListener("click",this._onClick,{capture:!0}),removeEventListener("touchstart",this._onTouch,{capture:!0}),removeEventListener("mousedown",this._onMouseDown,{capture:!0}),removeEventListener("dragstart",this._onDrag,{capture:!0}),removeEventListener("blur",this._onBlur),this.setCursor(null),this.styleEl.remove(),removeEventListener("pointermove",this._onMove),removeEventListener("resize",this._onResize),document.removeEventListener("visibilitychange",this._onVis),this.world.dispose(),this.exiting||this.mischief.clear();for(let t of this.cats)t.dispose();this.cats=[],this.shA&&(this.shA.dispose(),this.shB.dispose()),this.renderer.dispose(),this.renderer.forceContextLoss&&this.renderer.forceContextLoss(),this.canvas.remove(),this.onDone&&this.onDone()}},Ge=null,Qu={start(s){if(!(Ge&&!Ge.exiting)){Ge&&Ge.exiting&&(Ge.dispose(),Ge=null);try{Ge=new gc(s)}catch(t){return console.warn("Kucing tidak bisa dimulai",t),Ge=null,!1}return!0}},stop(){if(!Ge)return;let s=Ge;s.exit(()=>{Ge===s&&(Ge=null)})},running(){return!!Ge&&!Ge.exiting},_app(){return Ge},_ff(s){Ge&&(Ge.paused=!0,Ge.simulate(s))}};window.AttentiveCats=Qu;var tM=Qu;})();
