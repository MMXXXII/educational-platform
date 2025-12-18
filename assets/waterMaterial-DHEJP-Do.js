import{i as h,j as n,s as p,k as d,l as N,m as l,n as D,o as V,C,p as P,q as j,r as ie,t as Z,u as B,v as Y,w as te,x as q,y as c,z as K,B as G,G as se,I as Q,J as z,K as M,N as re,S as w,O as H,Q as A,W,b as Ke,X as Ye,Y as b,Z as $e,$ as qe,a0 as he,T as oe,a1 as fe,V as X,a2 as Qe,a3 as Je,a4 as pe,a5 as ei,a6 as ge,a7 as ii,a8 as de,a9 as ce,aa as Te,ab as le,ac as _e,ad as ti}from"./sceneFragmentDeclaration-CNWtVIbJ.js";const Se="cellPixelShader",si=`precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform sampler2D diffuseSampler;uniform vec2 vDiffuseInfos;
#endif
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
vec3 computeCustomDiffuseLighting(lightingInfo info,vec3 diffuseBase,float shadow)
{diffuseBase=info.diffuse*shadow;
#ifdef CELLBASIC
float level=1.0;if (info.ndl<0.5)
level=0.5;diffuseBase.rgb*vec3(level,level,level);
#else
float ToonThresholds[4];ToonThresholds[0]=0.95;ToonThresholds[1]=0.5;ToonThresholds[2]=0.2;ToonThresholds[3]=0.03;float ToonBrightnessLevels[5];ToonBrightnessLevels[0]=1.0;ToonBrightnessLevels[1]=0.8;ToonBrightnessLevels[2]=0.6;ToonBrightnessLevels[3]=0.35;ToonBrightnessLevels[4]=0.2;if (info.ndl>ToonThresholds[0])
{diffuseBase.rgb*=ToonBrightnessLevels[0];}
else if (info.ndl>ToonThresholds[1])
{diffuseBase.rgb*=ToonBrightnessLevels[1];}
else if (info.ndl>ToonThresholds[2])
{diffuseBase.rgb*=ToonBrightnessLevels[2];}
else if (info.ndl>ToonThresholds[3])
{diffuseBase.rgb*=ToonBrightnessLevels[3];}
else
{diffuseBase.rgb*=ToonBrightnessLevels[4];}
#endif
return max(diffuseBase,vec3(0.2));}
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void)
{
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;
#ifdef DIFFUSE
baseColor=texture2D(diffuseSampler,vDiffuseUV);
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
baseColor.rgb*=vDiffuseInfos.y;
#endif
#ifdef VERTEXCOLOR
baseColor.rgb*=vColor.rgb;
#endif
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
lightingInfo info;vec3 diffuseBase=vec3(0.,0.,0.);float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
vec3 specularBase=vec3(0.,0.,0.);
#endif 
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor,0.0,1.0)*baseColor.rgb;vec4 color=vec4(finalDiffuse,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;h.ShadersStore[Se]||(h.ShadersStore[Se]=si);const Ee="cellVertexShader",ri=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform mat4 diffuseMatrix;uniform vec2 vDiffuseInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef DIFFUSE
if (vDiffuseInfos.x==0.)
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));}
else
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));}
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#include<logDepthVertex>
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[Ee]||(h.ShadersStore[Ee]=ri);class oi extends W{constructor(){super(),this.DIFFUSE=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.POINTSIZE=!1,this.FOG=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.NDOTL=!0,this.CUSTOMUSERLIGHTING=!0,this.CELLBASIC=!0,this.DEPTHPREPASS=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.AREALIGHTSUPPORTED=!0,this.AREALIGHTNOROUGHTNESS=!0,this.rebuild()}}class k extends V{constructor(e,t){super(e,t),this.diffuseColor=new C(1,1,1),this._computeHighLevel=!1,this._disableLighting=!1,this._maxSimultaneousLights=4}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new oi);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(i._areTexturesDirty&&(i._needUVs=!1,r.texturesEnabled&&this._diffuseTexture&&P.DiffuseTextureEnabled))if(this._diffuseTexture.isReady())i._needUVs=!0,i.DIFFUSE=!0;else return!1;if(i.CELLBASIC=!this.computeHighLevel,j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),Z(r,u,this,i,!!o),B(e,i,!0,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a,this.maxSimultaneousLights),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="cell",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vFogInfos","vFogColor","pointSize","vDiffuseInfos","mBones","diffuseMatrix","logarithmicDepthConstant"],S=["diffuseSampler","areaLightsLTC1Sampler","areaLightsLTC2Sampler"],T=[];G(v),se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this.maxSimultaneousLights-1}},u),i,this._materialContext)}if(i.AREALIGHTUSED){for(let a=0;a<e.lightSources.length;a++)if(!e.lightSources[a]._isReady())return!1}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this._diffuseTexture&&P.DiffuseTextureEnabled&&(this._activeEffect.setTexture("diffuseSampler",this._diffuseTexture),this._activeEffect.setFloat2("vDiffuseInfos",this._diffuseTexture.coordinatesIndex,this._diffuseTexture.level),this._activeEffect.setMatrix("diffuseMatrix",this._diffuseTexture.getTextureMatrix())),z(this._activeEffect,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i,this._maxSimultaneousLights),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this._diffuseTexture&&this._diffuseTexture.animations&&this._diffuseTexture.animations.length>0&&e.push(this._diffuseTexture),e}getActiveTextures(){const e=super.getActiveTextures();return this._diffuseTexture&&e.push(this._diffuseTexture),e}hasTexture(e){return super.hasTexture(e)?!0:this._diffuseTexture===e}dispose(e){this._diffuseTexture&&this._diffuseTexture.dispose(),super.dispose(e)}getClassName(){return"CellMaterial"}clone(e){return A.Clone(()=>new k(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.CellMaterial",e}static Parse(e,t,o){return A.Parse(()=>new k(e.name,t),e,t,o)}}n([p("diffuseTexture")],k.prototype,"_diffuseTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],k.prototype,"diffuseTexture",void 0);n([N("diffuse")],k.prototype,"diffuseColor",void 0);n([l("computeHighLevel")],k.prototype,"_computeHighLevel",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],k.prototype,"computeHighLevel",void 0);n([l("disableLighting")],k.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],k.prototype,"disableLighting",void 0);n([l("maxSimultaneousLights")],k.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],k.prototype,"maxSimultaneousLights",void 0);D("BABYLON.CellMaterial",k);class ni{constructor(){}}class ne extends Ke{AttachAfterBind(e,t){if(this._newUniformInstances)for(const o in this._newUniformInstances){const s=o.toString().split("-");s[0]=="vec2"?t.setVector2(s[1],this._newUniformInstances[o]):s[0]=="vec3"?this._newUniformInstances[o]instanceof C?t.setColor3(s[1],this._newUniformInstances[o]):t.setVector3(s[1],this._newUniformInstances[o]):s[0]=="vec4"?(this._newUniformInstances[o]instanceof Ye?t.setDirectColor4(s[1],this._newUniformInstances[o]):t.setVector4(s[1],this._newUniformInstances[o]),t.setVector4(s[1],this._newUniformInstances[o])):s[0]=="mat4"?t.setMatrix(s[1],this._newUniformInstances[o]):s[0]=="float"&&t.setFloat(s[1],this._newUniformInstances[o])}if(this._newSamplerInstances)for(const o in this._newSamplerInstances){const s=o.toString().split("-");s[0]=="sampler2D"&&this._newSamplerInstances[o].isReady&&this._newSamplerInstances[o].isReady()&&t.setTexture(s[1],this._newSamplerInstances[o])}}ReviewUniform(e,t){if(e=="uniform"&&this._newUniforms)for(let o=0;o<this._newUniforms.length;o++)this._customUniform[o].indexOf("sampler")==-1&&t.push(this._newUniforms[o].replace(/\[\d*\]/g,""));if(e=="sampler"&&this._newUniforms)for(let o=0;o<this._newUniforms.length;o++)this._customUniform[o].indexOf("sampler")!=-1&&t.push(this._newUniforms[o].replace(/\[\d*\]/g,""));return t}Builder(e,t,o,s,i,r){r&&this._customAttributes&&this._customAttributes.length>0&&r.push(...this._customAttributes),this.ReviewUniform("uniform",t),this.ReviewUniform("sampler",s);const u=this._createdShaderName;return b.ShadersStore[u+"VertexShader"]&&b.ShadersStore[u+"PixelShader"]||(b.ShadersStore[u+"VertexShader"]=this._injectCustomCode(this.VertexShader,"vertex"),b.ShadersStore[u+"PixelShader"]=this._injectCustomCode(this.FragmentShader,"fragment")),u}_injectCustomCode(e,t){const o=this._getCustomCode(t);for(const s in o){const i=o[s];if(i&&i.length>0){const r="#define "+s;e=e.replace(r,`
`+i+`
`+r)}}return e}_getCustomCode(e){var t,o;return e==="vertex"?{CUSTOM_VERTEX_BEGIN:this.CustomParts.Vertex_Begin,CUSTOM_VERTEX_DEFINITIONS:(((t=this._customUniform)==null?void 0:t.join(`
`))||"")+(this.CustomParts.Vertex_Definitions||""),CUSTOM_VERTEX_MAIN_BEGIN:this.CustomParts.Vertex_MainBegin,CUSTOM_VERTEX_UPDATE_POSITION:this.CustomParts.Vertex_Before_PositionUpdated,CUSTOM_VERTEX_UPDATE_NORMAL:this.CustomParts.Vertex_Before_NormalUpdated,CUSTOM_VERTEX_MAIN_END:this.CustomParts.Vertex_MainEnd,CUSTOM_VERTEX_UPDATE_WORLDPOS:this.CustomParts.Vertex_After_WorldPosComputed}:{CUSTOM_FRAGMENT_BEGIN:this.CustomParts.Fragment_Begin,CUSTOM_FRAGMENT_DEFINITIONS:(((o=this._customUniform)==null?void 0:o.join(`
`))||"")+(this.CustomParts.Fragment_Definitions||""),CUSTOM_FRAGMENT_MAIN_BEGIN:this.CustomParts.Fragment_MainBegin,CUSTOM_FRAGMENT_UPDATE_DIFFUSE:this.CustomParts.Fragment_Custom_Diffuse,CUSTOM_FRAGMENT_UPDATE_ALPHA:this.CustomParts.Fragment_Custom_Alpha,CUSTOM_FRAGMENT_BEFORE_LIGHTS:this.CustomParts.Fragment_Before_Lights,CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR:this.CustomParts.Fragment_Before_FragColor,CUSTOM_FRAGMENT_MAIN_END:this.CustomParts.Fragment_MainEnd,CUSTOM_FRAGMENT_BEFORE_FOG:this.CustomParts.Fragment_Before_Fog}}constructor(e,t){super(e,t,!0),this.CustomParts=new ni,this.customShaderNameResolve=this.Builder,this.FragmentShader=b.ShadersStore.defaultPixelShader,this.VertexShader=b.ShadersStore.defaultVertexShader,ne.ShaderIndexer++,this._createdShaderName="custom_"+ne.ShaderIndexer}_afterBind(e,t=null,o){if(t){this.AttachAfterBind(e,t);try{super._afterBind(e,t,o)}catch{}}}AddUniform(e,t,o){return this._customUniform||(this._customUniform=[],this._newUniforms=[],this._newSamplerInstances={},this._newUniformInstances={}),o&&(t.indexOf("sampler")!=-1?this._newSamplerInstances[t+"-"+e]=o:this._newUniformInstances[t+"-"+e]=o),this._customUniform.push("uniform "+t+" "+e+";"),this._newUniforms.push(e),this}AddAttribute(e){return this._customAttributes||(this._customAttributes=[]),this._customAttributes.push(e),this}Fragment_Begin(e){return this.CustomParts.Fragment_Begin=e,this}Fragment_Definitions(e){return this.CustomParts.Fragment_Definitions=e,this}Fragment_MainBegin(e){return this.CustomParts.Fragment_MainBegin=e,this}Fragment_MainEnd(e){return this.CustomParts.Fragment_MainEnd=e,this}Fragment_Custom_Diffuse(e){return this.CustomParts.Fragment_Custom_Diffuse=e.replace("result","diffuseColor"),this}Fragment_Custom_Alpha(e){return this.CustomParts.Fragment_Custom_Alpha=e.replace("result","alpha"),this}Fragment_Before_Lights(e){return this.CustomParts.Fragment_Before_Lights=e,this}Fragment_Before_Fog(e){return this.CustomParts.Fragment_Before_Fog=e,this}Fragment_Before_FragColor(e){return this.CustomParts.Fragment_Before_FragColor=e.replace("result","color"),this}Vertex_Begin(e){return this.CustomParts.Vertex_Begin=e,this}Vertex_Definitions(e){return this.CustomParts.Vertex_Definitions=e,this}Vertex_MainBegin(e){return this.CustomParts.Vertex_MainBegin=e,this}Vertex_Before_PositionUpdated(e){return this.CustomParts.Vertex_Before_PositionUpdated=e.replace("result","positionUpdated"),this}Vertex_Before_NormalUpdated(e){return this.CustomParts.Vertex_Before_NormalUpdated=e.replace("result","normalUpdated"),this}Vertex_After_WorldPosComputed(e){return this.CustomParts.Vertex_After_WorldPosComputed=e,this}Vertex_MainEnd(e){return this.CustomParts.Vertex_MainEnd=e,this}}ne.ShaderIndexer=1;D("BABYLON.CustomMaterial",ne);class ai{constructor(){}}class ae extends $e{AttachAfterBind(e,t){if(this._newUniformInstances)for(const o in this._newUniformInstances){const s=o.toString().split("-");s[0]=="vec2"?t.setVector2(s[1],this._newUniformInstances[o]):s[0]=="vec3"?this._newUniformInstances[o]instanceof C?t.setColor3(s[1],this._newUniformInstances[o]):t.setVector3(s[1],this._newUniformInstances[o]):s[0]=="vec4"?(this._newUniformInstances[o]instanceof Ye?t.setDirectColor4(s[1],this._newUniformInstances[o]):t.setVector4(s[1],this._newUniformInstances[o]),t.setVector4(s[1],this._newUniformInstances[o])):s[0]=="mat4"?t.setMatrix(s[1],this._newUniformInstances[o]):s[0]=="float"&&t.setFloat(s[1],this._newUniformInstances[o])}if(this._newSamplerInstances)for(const o in this._newSamplerInstances){const s=o.toString().split("-");s[0]=="sampler2D"&&this._newSamplerInstances[o].isReady&&this._newSamplerInstances[o].isReady()&&t.setTexture(s[1],this._newSamplerInstances[o])}}ReviewUniform(e,t){if(e=="uniform"&&this._newUniforms)for(let o=0;o<this._newUniforms.length;o++)this._customUniform[o].indexOf("sampler")==-1&&t.push(this._newUniforms[o].replace(/\[\d*\]/g,""));if(e=="sampler"&&this._newUniforms)for(let o=0;o<this._newUniforms.length;o++)this._customUniform[o].indexOf("sampler")!=-1&&t.push(this._newUniforms[o].replace(/\[\d*\]/g,""));return t}Builder(e,t,o,s,i,r,u){if(u){const f=u.processFinalCode;u.processFinalCode=(m,g)=>{if(m==="vertex")return f?f(m,g):g;const v=new qe(g);return v.inlineToken="#define pbr_inline",v.processCode(),f?f(m,v.code):v.code}}r&&this._customAttributes&&this._customAttributes.length>0&&r.push(...this._customAttributes),this.ReviewUniform("uniform",t),this.ReviewUniform("sampler",s);const a=this._createdShaderName;return b.ShadersStore[a+"VertexShader"]&&b.ShadersStore[a+"PixelShader"]||(b.ShadersStore[a+"VertexShader"]=this._injectCustomCode(this.VertexShader,"vertex"),b.ShadersStore[a+"PixelShader"]=this._injectCustomCode(this.FragmentShader,"fragment")),a}_injectCustomCode(e,t){const o=this._getCustomCode(t);for(const s in o){const i=o[s];if(i&&i.length>0){const r="#define "+s;e=e.replace(r,`
`+i+`
`+r)}}return e}_getCustomCode(e){var t,o;return e==="vertex"?{CUSTOM_VERTEX_BEGIN:this.CustomParts.Vertex_Begin,CUSTOM_VERTEX_DEFINITIONS:(((t=this._customUniform)==null?void 0:t.join(`
`))||"")+(this.CustomParts.Vertex_Definitions||""),CUSTOM_VERTEX_MAIN_BEGIN:this.CustomParts.Vertex_MainBegin,CUSTOM_VERTEX_UPDATE_POSITION:this.CustomParts.Vertex_Before_PositionUpdated,CUSTOM_VERTEX_UPDATE_NORMAL:this.CustomParts.Vertex_Before_NormalUpdated,CUSTOM_VERTEX_MAIN_END:this.CustomParts.Vertex_MainEnd,CUSTOM_VERTEX_UPDATE_WORLDPOS:this.CustomParts.Vertex_After_WorldPosComputed}:{CUSTOM_FRAGMENT_BEGIN:this.CustomParts.Fragment_Begin,CUSTOM_FRAGMENT_MAIN_BEGIN:this.CustomParts.Fragment_MainBegin,CUSTOM_FRAGMENT_DEFINITIONS:(((o=this._customUniform)==null?void 0:o.join(`
`))||"")+(this.CustomParts.Fragment_Definitions||""),CUSTOM_FRAGMENT_UPDATE_ALBEDO:this.CustomParts.Fragment_Custom_Albedo,CUSTOM_FRAGMENT_UPDATE_ALPHA:this.CustomParts.Fragment_Custom_Alpha,CUSTOM_FRAGMENT_BEFORE_LIGHTS:this.CustomParts.Fragment_Before_Lights,CUSTOM_FRAGMENT_UPDATE_METALLICROUGHNESS:this.CustomParts.Fragment_Custom_MetallicRoughness,CUSTOM_FRAGMENT_UPDATE_MICROSURFACE:this.CustomParts.Fragment_Custom_MicroSurface,CUSTOM_FRAGMENT_BEFORE_FINALCOLORCOMPOSITION:this.CustomParts.Fragment_Before_FinalColorComposition,CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR:this.CustomParts.Fragment_Before_FragColor,CUSTOM_FRAGMENT_MAIN_END:this.CustomParts.Fragment_MainEnd,CUSTOM_FRAGMENT_BEFORE_FOG:this.CustomParts.Fragment_Before_Fog}}constructor(e,t){super(e,t,!0),this.CustomParts=new ai,this.customShaderNameResolve=this.Builder,this.FragmentShader=b.ShadersStore.pbrPixelShader,this.VertexShader=b.ShadersStore.pbrVertexShader,this.FragmentShader=this.FragmentShader.replace(/#include<pbrBlockAlbedoOpacity>/g,b.IncludesShadersStore.pbrBlockAlbedoOpacity),this.FragmentShader=this.FragmentShader.replace(/#include<pbrBlockReflectivity>/g,b.IncludesShadersStore.pbrBlockReflectivity),this.FragmentShader=this.FragmentShader.replace(/#include<pbrBlockFinalColorComposition>/g,b.IncludesShadersStore.pbrBlockFinalColorComposition),ae.ShaderIndexer++,this._createdShaderName="custompbr_"+ae.ShaderIndexer}_afterBind(e,t=null,o){if(t){this.AttachAfterBind(e,t);try{super._afterBind(e,t,o)}catch{}}}AddUniform(e,t,o){return this._customUniform||(this._customUniform=[],this._newUniforms=[],this._newSamplerInstances={},this._newUniformInstances={}),o&&(t.indexOf("sampler")!=-1?this._newSamplerInstances[t+"-"+e]=o:this._newUniformInstances[t+"-"+e]=o),this._customUniform.push("uniform "+t+" "+e+";"),this._newUniforms.push(e),this}AddAttribute(e){return this._customAttributes||(this._customAttributes=[]),this._customAttributes.push(e),this}Fragment_Begin(e){return this.CustomParts.Fragment_Begin=e,this}Fragment_Definitions(e){return this.CustomParts.Fragment_Definitions=e,this}Fragment_MainBegin(e){return this.CustomParts.Fragment_MainBegin=e,this}Fragment_Custom_Albedo(e){return this.CustomParts.Fragment_Custom_Albedo=e.replace("result","surfaceAlbedo"),this}Fragment_Custom_Alpha(e){return this.CustomParts.Fragment_Custom_Alpha=e.replace("result","alpha"),this}Fragment_Before_Lights(e){return this.CustomParts.Fragment_Before_Lights=e,this}Fragment_Custom_MetallicRoughness(e){return this.CustomParts.Fragment_Custom_MetallicRoughness=e,this}Fragment_Custom_MicroSurface(e){return this.CustomParts.Fragment_Custom_MicroSurface=e,this}Fragment_Before_Fog(e){return this.CustomParts.Fragment_Before_Fog=e,this}Fragment_Before_FinalColorComposition(e){return this.CustomParts.Fragment_Before_FinalColorComposition=e,this}Fragment_Before_FragColor(e){return this.CustomParts.Fragment_Before_FragColor=e.replace("result","color"),this}Fragment_MainEnd(e){return this.CustomParts.Fragment_MainEnd=e,this}Vertex_Begin(e){return this.CustomParts.Vertex_Begin=e,this}Vertex_Definitions(e){return this.CustomParts.Vertex_Definitions=e,this}Vertex_MainBegin(e){return this.CustomParts.Vertex_MainBegin=e,this}Vertex_Before_PositionUpdated(e){return this.CustomParts.Vertex_Before_PositionUpdated=e.replace("result","positionUpdated"),this}Vertex_Before_NormalUpdated(e){return this.CustomParts.Vertex_Before_NormalUpdated=e.replace("result","normalUpdated"),this}Vertex_After_WorldPosComputed(e){return this.CustomParts.Vertex_After_WorldPosComputed=e,this}Vertex_MainEnd(e){return this.CustomParts.Vertex_MainEnd=e,this}}ae.ShaderIndexer=1;D("BABYLON.PBRCustomMaterial",ae);const xe="firePixelShader",fi=`precision highp float;uniform vec4 vEyePosition;varying vec3 vPositionW;
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform sampler2D diffuseSampler;uniform vec2 vDiffuseInfos;
#endif
uniform sampler2D distortionSampler;uniform sampler2D opacitySampler;
#ifdef DIFFUSE
varying vec2 vDistortionCoords1;varying vec2 vDistortionCoords2;varying vec2 vDistortionCoords3;
#endif
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
vec4 bx2(vec4 x)
{return vec4(2.0)*x-vec4(1.0);}
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);float alpha=1.0;
#ifdef DIFFUSE
const float distortionAmount0 =0.092;const float distortionAmount1 =0.092;const float distortionAmount2 =0.092;vec2 heightAttenuation=vec2(0.3,0.39);vec4 noise0=texture2D(distortionSampler,vDistortionCoords1);vec4 noise1=texture2D(distortionSampler,vDistortionCoords2);vec4 noise2=texture2D(distortionSampler,vDistortionCoords3);vec4 noiseSum=bx2(noise0)*distortionAmount0+bx2(noise1)*distortionAmount1+bx2(noise2)*distortionAmount2;vec4 perturbedBaseCoords=vec4(vDiffuseUV,0.0,1.0)+noiseSum*(vDiffuseUV.y*heightAttenuation.x+heightAttenuation.y);vec4 opacityColor=texture2D(opacitySampler,perturbedBaseCoords.xy);
#ifdef ALPHATEST
if (opacityColor.r<0.1)
discard;
#endif
#include<depthPrePass>
baseColor=texture2D(diffuseSampler,perturbedBaseCoords.xy)*2.0;baseColor*=opacityColor;baseColor.rgb*=vDiffuseInfos.y;
#endif
#ifdef VERTEXCOLOR
baseColor.rgb*=vColor.rgb;
#endif
vec3 diffuseBase=vec3(1.0,1.0,1.0);
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
vec4 color=vec4(baseColor.rgb,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;h.ShadersStore[xe]||(h.ShadersStore[xe]=fi);const Ce="fireVertexShader",li=`precision highp float;attribute vec3 position;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vDiffuseUV;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
uniform float time;uniform float speed;
#ifdef DIFFUSE
varying vec2 vDistortionCoords1;varying vec2 vDistortionCoords2;varying vec2 vDistortionCoords3;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef DIFFUSE
vDiffuseUV=uv;vDiffuseUV.y-=0.2;
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#ifdef DIFFUSE
vec3 layerSpeed=vec3(-0.2,-0.52,-0.1)*speed;vDistortionCoords1.x=uv.x;vDistortionCoords1.y=uv.y+layerSpeed.x*time/1000.0;vDistortionCoords2.x=uv.x;vDistortionCoords2.y=uv.y+layerSpeed.y*time/1000.0;vDistortionCoords3.x=uv.x;vDistortionCoords3.y=uv.y+layerSpeed.z*time/1000.0;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[Ce]||(h.ShadersStore[Ce]=li);class ui extends W{constructor(){super(),this.DIFFUSE=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.UV1=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.BonesPerMesh=0,this.NUM_BONE_INFLUENCERS=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.rebuild()}}class $ extends V{constructor(e,t){super(e,t),this.diffuseColor=new C(1,1,1),this.speed=1,this._scaledDiffuse=new C,this._lastTime=0}needAlphaBlending(){return!1}needAlphaTesting(){return!0}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new ui);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(i._areTexturesDirty&&(i._needUVs=!1,this._diffuseTexture&&P.DiffuseTextureEnabled))if(this._diffuseTexture.isReady())i._needUVs=!0,i.DIFFUSE=!0;else return!1;if(i.ALPHATEST=!!this._opacityTexture,i._areMiscDirty&&(i.POINTSIZE=this.pointsCloud||r.forcePointsCloud,i.FOG=r.fogEnabled&&e.applyFog&&r.fogMode!==w.FOGMODE_NONE&&this.fogEnabled,i.LOGARITHMICDEPTH=this._useLogarithmicDepth),Z(r,u,this,i,!!o),B(e,i,!1,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.UV1&&f.push(c.UVKind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="fire",g=["world","view","viewProjection","vEyePosition","vFogInfos","vFogColor","pointSize","vDiffuseInfos","mBones","diffuseMatrix","logarithmicDepthConstant","time","speed"];G(g);const v=i.toString();t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:g,uniformBuffersNames:[],samplers:["diffuseSampler","distortionSampler","opacitySampler"],defines:v,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:null,maxSimultaneousLights:4,transformFeedbackVaryings:null},u),i,this._materialContext)}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this._diffuseTexture&&P.DiffuseTextureEnabled&&(this._activeEffect.setTexture("diffuseSampler",this._diffuseTexture),this._activeEffect.setFloat2("vDiffuseInfos",this._diffuseTexture.coordinatesIndex,this._diffuseTexture.level),this._activeEffect.setMatrix("diffuseMatrix",this._diffuseTexture.getTextureMatrix()),this._activeEffect.setTexture("distortionSampler",this._distortionTexture),this._activeEffect.setTexture("opacitySampler",this._opacityTexture)),z(this._activeEffect,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this._scaledDiffuse,this.alpha*t.visibility),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._lastTime+=s.getEngine().getDeltaTime(),this._activeEffect.setFloat("time",this._lastTime),this._activeEffect.setFloat("speed",this.speed),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this._diffuseTexture&&this._diffuseTexture.animations&&this._diffuseTexture.animations.length>0&&e.push(this._diffuseTexture),this._distortionTexture&&this._distortionTexture.animations&&this._distortionTexture.animations.length>0&&e.push(this._distortionTexture),this._opacityTexture&&this._opacityTexture.animations&&this._opacityTexture.animations.length>0&&e.push(this._opacityTexture),e}getActiveTextures(){const e=super.getActiveTextures();return this._diffuseTexture&&e.push(this._diffuseTexture),this._distortionTexture&&e.push(this._distortionTexture),this._opacityTexture&&e.push(this._opacityTexture),e}hasTexture(e){return!!(super.hasTexture(e)||this._diffuseTexture===e||this._distortionTexture===e||this._opacityTexture===e)}getClassName(){return"FireMaterial"}dispose(e){this._diffuseTexture&&this._diffuseTexture.dispose(),this._distortionTexture&&this._distortionTexture.dispose(),super.dispose(e)}clone(e){return A.Clone(()=>new $(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.FireMaterial",e.diffuseColor=this.diffuseColor.asArray(),e.speed=this.speed,this._diffuseTexture&&(e._diffuseTexture=this._diffuseTexture.serialize()),this._distortionTexture&&(e._distortionTexture=this._distortionTexture.serialize()),this._opacityTexture&&(e._opacityTexture=this._opacityTexture.serialize()),e}static Parse(e,t,o){const s=new $(e.name,t);return s.diffuseColor=C.FromArray(e.diffuseColor),s.speed=e.speed,s.alpha=e.alpha,s.id=e.id,he.AddTagsTo(s,e.tags),s.backFaceCulling=e.backFaceCulling,s.wireframe=e.wireframe,e._diffuseTexture&&(s._diffuseTexture=oe.Parse(e._diffuseTexture,t,o)),e._distortionTexture&&(s._distortionTexture=oe.Parse(e._distortionTexture,t,o)),e._opacityTexture&&(s._opacityTexture=oe.Parse(e._opacityTexture,t,o)),s}}n([p("diffuseTexture")],$.prototype,"_diffuseTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],$.prototype,"diffuseTexture",void 0);n([p("distortionTexture")],$.prototype,"_distortionTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],$.prototype,"distortionTexture",void 0);n([p("opacityTexture")],$.prototype,"_opacityTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],$.prototype,"opacityTexture",void 0);n([N("diffuse")],$.prototype,"diffuseColor",void 0);n([l()],$.prototype,"speed",void 0);D("BABYLON.FireMaterial",$);const Pe="furPixelShader",di=`precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;uniform vec4 furColor;uniform float furLength;varying vec3 vPositionW;varying float vfur_length;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform sampler2D diffuseSampler;uniform vec2 vDiffuseInfos;
#endif
#ifdef HIGHLEVEL
uniform float furOffset;uniform float furOcclusion;uniform sampler2D furTexture;varying vec2 vFurUV;
#endif
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<fogFragmentDeclaration>
#include<clipPlaneFragmentDeclaration>
float Rand(vec3 rv) {float x=dot(rv,vec3(12.9898,78.233,24.65487));return fract(sin(x)*43758.5453);}
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=furColor;vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;
#ifdef DIFFUSE
baseColor*=texture2D(diffuseSampler,vDiffuseUV);
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
baseColor.rgb*=vDiffuseInfos.y;
#endif
#ifdef VERTEXCOLOR
baseColor.rgb*=vColor.rgb;
#endif
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
#ifdef HIGHLEVEL
vec4 furTextureColor=texture2D(furTexture,vec2(vFurUV.x,vFurUV.y));if (furTextureColor.a<=0.0 || furTextureColor.g<furOffset) {discard;}
float occlusion=mix(0.0,furTextureColor.b*1.2,furOffset);baseColor=vec4(baseColor.xyz*max(occlusion,furOcclusion),1.1-furOffset);
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
vec3 specularBase=vec3(0.,0.,0.);
#endif
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
vec3 finalDiffuse=clamp(diffuseBase.rgb*baseColor.rgb,0.0,1.0);
#ifdef HIGHLEVEL
vec4 color=vec4(finalDiffuse,alpha);
#else
float r=vfur_length/furLength*0.5;vec4 color=vec4(finalDiffuse*(0.5+r),alpha);
#endif
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;h.ShadersStore[Pe]||(h.ShadersStore[Pe]=di);const Ae="furVertexShader",ci=`precision highp float;attribute vec3 position;attribute vec3 normal;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
uniform float furLength;uniform float furAngle;
#ifdef HIGHLEVEL
uniform float furOffset;uniform vec3 furGravity;uniform float furTime;uniform float furSpacing;uniform float furDensity;
#endif
#ifdef HEIGHTMAP
uniform sampler2D heightTexture;
#endif
#ifdef HIGHLEVEL
varying vec2 vFurUV;
#endif
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform mat4 diffuseMatrix;uniform vec2 vDiffuseInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
varying float vfur_length;
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
float Rand(vec3 rv) {float x=dot(rv,vec3(12.9898,78.233,24.65487));return fract(sin(x)*43758.5453);}
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
float r=Rand(position);
#ifdef HEIGHTMAP
#if __VERSION__>100
vfur_length=furLength*texture(heightTexture,uv).x;
#else
vfur_length=furLength*texture2D(heightTexture,uv).r;
#endif
#else 
vfur_length=(furLength*r);
#endif
vec3 tangent1=vec3(normal.y,-normal.x,0);vec3 tangent2=vec3(-normal.z,0,normal.x);r=Rand(tangent1*r);float J=(2.0+4.0*r);r=Rand(tangent2*r);float K=(2.0+2.0*r);tangent1=tangent1*J+tangent2*K;tangent1=normalize(tangent1);vec3 newPosition=position+normal*vfur_length*cos(furAngle)+tangent1*vfur_length*sin(furAngle);
#ifdef HIGHLEVEL
vec3 forceDirection=vec3(0.0,0.0,0.0);forceDirection.x=sin(furTime+position.x*0.05)*0.2;forceDirection.y=cos(furTime*0.7+position.y*0.04)*0.2;forceDirection.z=sin(furTime*0.7+position.z*0.04)*0.2;vec3 displacement=vec3(0.0,0.0,0.0);displacement=furGravity+forceDirection;float displacementFactor=pow(furOffset,3.0);vec3 aNormal=normal;aNormal.xyz+=displacement*displacementFactor;newPosition=vec3(newPosition.x,newPosition.y,newPosition.z)+(normalize(aNormal)*furOffset*furSpacing);
#endif
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
gl_Position=viewProjection*finalWorld*vec4(newPosition,1.0);vec4 worldPos=finalWorld*vec4(newPosition,1.0);vPositionW=vec3(worldPos);
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef DIFFUSE
if (vDiffuseInfos.x==0.)
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));}
else
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));}
#ifdef HIGHLEVEL
vFurUV=vDiffuseUV*furDensity;
#endif
#else
#ifdef HIGHLEVEL
vFurUV=uv*furDensity;
#endif
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[Ae]||(h.ShadersStore[Ae]=ci);class hi extends W{constructor(){super(),this.DIFFUSE=!1,this.HEIGHTMAP=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.HIGHLEVEL=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.AREALIGHTSUPPORTED=!0,this.AREALIGHTNOROUGHTNESS=!0,this.rebuild()}}class x extends V{constructor(e,t){super(e,t),this.diffuseColor=new C(1,1,1),this.furLength=1,this.furAngle=0,this.furColor=new C(.44,.21,.02),this.furOffset=0,this.furSpacing=12,this.furGravity=new X(0,0,0),this.furSpeed=100,this.furDensity=20,this.furOcclusion=0,this._disableLighting=!1,this._maxSimultaneousLights=4,this.highLevelFur=!0,this._furTime=0}get furTime(){return this._furTime}set furTime(e){this._furTime=e}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}updateFur(){for(let e=1;e<this._meshes.length;e++){const t=this._meshes[e].material;t.furLength=this.furLength,t.furAngle=this.furAngle,t.furGravity=this.furGravity,t.furSpacing=this.furSpacing,t.furSpeed=this.furSpeed,t.furColor=this.furColor,t.diffuseTexture=this.diffuseTexture,t.furTexture=this.furTexture,t.highLevelFur=this.highLevelFur,t.furTime=this.furTime,t.furDensity=this.furDensity}}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new hi);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(i._areTexturesDirty&&r.texturesEnabled){if(this.diffuseTexture&&P.DiffuseTextureEnabled)if(this.diffuseTexture.isReady())i._needUVs=!0,i.DIFFUSE=!0;else return!1;if(this.heightTexture&&u.getCaps().maxVertexTextureImageUnits)if(this.heightTexture.isReady())i._needUVs=!0,i.HEIGHTMAP=!0;else return!1}if(this.highLevelFur!==i.HIGHLEVEL&&(i.HIGHLEVEL=!0,i.markAsUnprocessed()),j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),Z(r,u,this,i,!!o),B(e,i,!0,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a,this.maxSimultaneousLights),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="fur",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vFogInfos","vFogColor","pointSize","vDiffuseInfos","mBones","diffuseMatrix","logarithmicDepthConstant","furLength","furAngle","furColor","furOffset","furGravity","furTime","furSpacing","furDensity","furOcclusion"];G(v);const S=["diffuseSampler","heightTexture","furTexture","areaLightsLTC1Sampler","areaLightsLTC2Sampler"],T=[];se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this.maxSimultaneousLights}},u),i,this._materialContext)}if(i.AREALIGHTUSED){for(let a=0;a<e.lightSources.length;a++)if(!e.lightSources[a]._isReady())return!1}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this._diffuseTexture&&P.DiffuseTextureEnabled&&(this._activeEffect.setTexture("diffuseSampler",this._diffuseTexture),this._activeEffect.setFloat2("vDiffuseInfos",this._diffuseTexture.coordinatesIndex,this._diffuseTexture.level),this._activeEffect.setMatrix("diffuseMatrix",this._diffuseTexture.getTextureMatrix())),this._heightTexture&&this._activeEffect.setTexture("heightTexture",this._heightTexture),z(this._activeEffect,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i,this.maxSimultaneousLights),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._activeEffect.setFloat("furLength",this.furLength),this._activeEffect.setFloat("furAngle",this.furAngle),this._activeEffect.setColor4("furColor",this.furColor,1),this.highLevelFur&&(this._activeEffect.setVector3("furGravity",this.furGravity),this._activeEffect.setFloat("furOffset",this.furOffset),this._activeEffect.setFloat("furSpacing",this.furSpacing),this._activeEffect.setFloat("furDensity",this.furDensity),this._activeEffect.setFloat("furOcclusion",this.furOcclusion),this._furTime+=this.getScene().getEngine().getDeltaTime()/this.furSpeed,this._activeEffect.setFloat("furTime",this._furTime),this._activeEffect.setTexture("furTexture",this.furTexture)),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this.diffuseTexture&&this.diffuseTexture.animations&&this.diffuseTexture.animations.length>0&&e.push(this.diffuseTexture),this.heightTexture&&this.heightTexture.animations&&this.heightTexture.animations.length>0&&e.push(this.heightTexture),e}getActiveTextures(){const e=super.getActiveTextures();return this._diffuseTexture&&e.push(this._diffuseTexture),this._heightTexture&&e.push(this._heightTexture),e}hasTexture(e){return!!(super.hasTexture(e)||this.diffuseTexture===e||this._heightTexture===e)}dispose(e){if(this.diffuseTexture&&this.diffuseTexture.dispose(),this._meshes)for(let t=1;t<this._meshes.length;t++){const o=this._meshes[t].material;o&&o.dispose(e),this._meshes[t].dispose()}super.dispose(e)}clone(e){return A.Clone(()=>new x(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.FurMaterial",this._meshes&&(e.sourceMeshName=this._meshes[0].name,e.quality=this._meshes.length),e}getClassName(){return"FurMaterial"}static Parse(e,t,o){const s=A.Parse(()=>new x(e.name,t),e,t,o);return e.sourceMeshName&&s.highLevelFur&&t.executeWhenReady(()=>{const i=t.getMeshByName(e.sourceMeshName);if(i){const r=x.GenerateTexture("Fur Texture",t);s.furTexture=r,x.FurifyMesh(i,e.quality)}}),s}static GenerateTexture(e,t){const o=new Qe("FurTexture "+e,256,t,!0),s=o.getContext();for(let i=0;i<2e4;++i)s.fillStyle="rgba(255, "+Math.floor(Math.random()*255)+", "+Math.floor(Math.random()*255)+", 1)",s.fillRect(Math.random()*o.getSize().width,Math.random()*o.getSize().height,2,2);return o.update(!1),o.wrapU=oe.WRAP_ADDRESSMODE,o.wrapV=oe.WRAP_ADDRESSMODE,o}static FurifyMesh(e,t){const o=[e],s=e.material;let i;if(!(s instanceof x))throw"The material of the source mesh must be a Fur Material";for(i=1;i<t;i++){const r=new x(s.name+i,e.getScene());e.getScene().materials.pop(),he.EnableFor(r),he.AddTagsTo(r,"furShellMaterial"),r.furLength=s.furLength,r.furAngle=s.furAngle,r.furGravity=s.furGravity,r.furSpacing=s.furSpacing,r.furSpeed=s.furSpeed,r.furColor=s.furColor,r.diffuseTexture=s.diffuseTexture,r.furOffset=i/t,r.furTexture=s.furTexture,r.highLevelFur=s.highLevelFur,r.furTime=s.furTime,r.furDensity=s.furDensity;const u=e.clone(e.name+i);u.material=r,u.skeleton=e.skeleton,u.position=X.Zero(),o.push(u)}for(i=1;i<o.length;i++)o[i].parent=e;return e.material._meshes=o,o}}n([p("diffuseTexture")],x.prototype,"_diffuseTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],x.prototype,"diffuseTexture",void 0);n([p("heightTexture")],x.prototype,"_heightTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],x.prototype,"heightTexture",void 0);n([N()],x.prototype,"diffuseColor",void 0);n([l()],x.prototype,"furLength",void 0);n([l()],x.prototype,"furAngle",void 0);n([N()],x.prototype,"furColor",void 0);n([l()],x.prototype,"furOffset",void 0);n([l()],x.prototype,"furSpacing",void 0);n([fe()],x.prototype,"furGravity",void 0);n([l()],x.prototype,"furSpeed",void 0);n([l()],x.prototype,"furDensity",void 0);n([l()],x.prototype,"furOcclusion",void 0);n([l("disableLighting")],x.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],x.prototype,"disableLighting",void 0);n([l("maxSimultaneousLights")],x.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],x.prototype,"maxSimultaneousLights",void 0);n([l()],x.prototype,"highLevelFur",void 0);n([l()],x.prototype,"furTime",null);D("BABYLON.FurMaterial",x);const Le="gradientPixelShader",mi=`precision highp float;uniform vec4 vEyePosition;uniform vec4 topColor;uniform vec4 bottomColor;uniform float offset;uniform float scale;uniform float smoothness;varying vec3 vPositionW;varying vec3 vPosition;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0]
#include<__decl__lightFragment>[1]
#include<__decl__lightFragment>[2]
#include<__decl__lightFragment>[3]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);float h=vPosition.y*scale+offset;float mysmoothness=clamp(smoothness,0.01,max(smoothness,10.));vec4 baseColor=mix(bottomColor,topColor,max(pow(max(h,0.0),mysmoothness),0.0));vec3 diffuseColor=baseColor.rgb;float alpha=baseColor.a;
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
#ifdef VERTEXCOLOR
baseColor.rgb*=vColor.rgb;
#endif
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
#ifdef EMISSIVE
vec3 diffuseBase=baseColor.rgb;
#else
vec3 diffuseBase=vec3(0.,0.,0.);
#endif
lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor,0.0,1.0)*baseColor.rgb;vec4 color=vec4(finalDiffuse,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}
`;h.ShadersStore[Le]||(h.ShadersStore[Le]=mi);const Ie="gradientVertexShader",vi=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;varying vec3 vPosition;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);vPosition=position;
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[Ie]||(h.ShadersStore[Ie]=vi);class pi extends W{constructor(){super(),this.EMISSIVE=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.AREALIGHTSUPPORTED=!0,this.AREALIGHTNOROUGHTNESS=!0,this.rebuild()}}class U extends V{constructor(e,t){super(e,t),this._maxSimultaneousLights=4,this.topColor=new C(1,0,0),this.topColorAlpha=1,this.bottomColor=new C(0,0,1),this.bottomColorAlpha=1,this.offset=0,this.scale=1,this.smoothness=1,this._disableLighting=!1}needAlphaBlending(){return this.alpha<1||this.topColorAlpha<1||this.bottomColorAlpha<1}needAlphaTesting(){return!0}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new pi);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(Z(r,u,this,i,!!o),j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),i.EMISSIVE=this._disableLighting,B(e,i,!1,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="gradient",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vFogInfos","vFogColor","pointSize","mBones","logarithmicDepthConstant","topColor","bottomColor","offset","smoothness","scale"];G(v);const S=["areaLightsLTC1Sampler","areaLightsLTC2Sampler"],T=[];se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:4}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:4}},u),i,this._materialContext)}if(i.AREALIGHTUSED){for(let a=0;a<e.lightSources.length;a++)if(!e.lightSources[a]._isReady())return!1}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,r),this._mustRebind(s,r,o)&&(z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i,this.maxSimultaneousLights),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._activeEffect.setColor4("topColor",this.topColor,this.topColorAlpha),this._activeEffect.setColor4("bottomColor",this.bottomColor,this.bottomColorAlpha),this._activeEffect.setFloat("offset",this.offset),this._activeEffect.setFloat("scale",this.scale),this._activeEffect.setFloat("smoothness",this.smoothness),this._afterBind(t,this._activeEffect,o))}getAnimatables(){return[]}dispose(e){super.dispose(e)}clone(e){return A.Clone(()=>new U(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.GradientMaterial",e}getClassName(){return"GradientMaterial"}static Parse(e,t,o){return A.Parse(()=>new U(e.name,t),e,t,o)}}n([l("maxSimultaneousLights")],U.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],U.prototype,"maxSimultaneousLights",void 0);n([N()],U.prototype,"topColor",void 0);n([l()],U.prototype,"topColorAlpha",void 0);n([N()],U.prototype,"bottomColor",void 0);n([l()],U.prototype,"bottomColorAlpha",void 0);n([l()],U.prototype,"offset",void 0);n([l()],U.prototype,"scale",void 0);n([l()],U.prototype,"smoothness",void 0);n([l("disableLighting")],U.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],U.prototype,"disableLighting",void 0);D("BABYLON.GradientMaterial",U);const Ne="gridPixelShader",gi=`#extension GL_OES_standard_derivatives : enable
#define SQRT2 1.41421356
#define PI 3.14159
precision highp float;uniform float visibility;uniform vec3 mainColor;uniform vec3 lineColor;uniform vec4 gridControl;uniform vec3 gridOffset;varying vec3 vPosition;varying vec3 vNormal;
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#ifdef OPACITY
varying vec2 vOpacityUV;uniform sampler2D opacitySampler;uniform vec2 vOpacityInfos;
#endif
float getDynamicVisibility(float position) {float majorGridFrequency=gridControl.y;if (floor(position+0.5)==floor(position/majorGridFrequency+0.5)*majorGridFrequency)
{return 1.0;}
return gridControl.z;}
float getAnisotropicAttenuation(float differentialLength) {const float maxNumberOfLines=10.0;return clamp(1.0/(differentialLength+1.0)-1.0/maxNumberOfLines,0.0,1.0);}
float isPointOnLine(float position,float differentialLength) {float fractionPartOfPosition=position-floor(position+0.5); 
fractionPartOfPosition/=differentialLength; 
#ifdef ANTIALIAS
fractionPartOfPosition=clamp(fractionPartOfPosition,-1.,1.);float result=0.5+0.5*cos(fractionPartOfPosition*PI); 
return result;
#else
return abs(fractionPartOfPosition)<SQRT2/4. ? 1. : 0.;
#endif
}
float contributionOnAxis(float position) {float differentialLength=length(vec2(dFdx(position),dFdy(position)));differentialLength*=SQRT2; 
float result=isPointOnLine(position,differentialLength);float dynamicVisibility=getDynamicVisibility(position);result*=dynamicVisibility;float anisotropicAttenuation=getAnisotropicAttenuation(differentialLength);result*=anisotropicAttenuation;return result;}
float normalImpactOnAxis(float x) {float normalImpact=clamp(1.0-3.0*abs(x*x*x),0.0,1.0);return normalImpact;}
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
float gridRatio=gridControl.x;vec3 gridPos=(vPosition+gridOffset.xyz)/gridRatio;float x=contributionOnAxis(gridPos.x);float y=contributionOnAxis(gridPos.y);float z=contributionOnAxis(gridPos.z);vec3 normal=normalize(vNormal);x*=normalImpactOnAxis(normal.x);y*=normalImpactOnAxis(normal.y);z*=normalImpactOnAxis(normal.z);
#ifdef MAX_LINE
float grid=clamp(max(max(x,y),z),0.,1.);
#else
float grid=clamp(x+y+z,0.,1.);
#endif
vec3 color=mix(mainColor,lineColor,grid);
#ifdef FOG
#include<fogFragment>
#endif
float opacity=1.0;
#ifdef TRANSPARENT
opacity=clamp(grid,0.08,gridControl.w*grid);
#endif
#ifdef OPACITY
opacity*=texture2D(opacitySampler,vOpacityUV).a;
#endif
gl_FragColor=vec4(color.rgb,opacity*visibility);
#ifdef TRANSPARENT
#ifdef PREMULTIPLYALPHA
gl_FragColor.rgb*=opacity;
#endif
#else
#endif
#include<logDepthFragment>
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}
`;h.ShadersStore[Ne]||(h.ShadersStore[Ne]=gi);const Oe="gridVertexShader",Ti=`precision highp float;attribute vec3 position;attribute vec3 normal;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#include<instancesDeclaration>
#include<__decl__sceneVertex>
varying vec3 vPosition;varying vec3 vNormal;
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#ifdef OPACITY
varying vec2 vOpacityUV;uniform mat4 opacityMatrix;uniform vec2 vOpacityInfos;
#endif
#include<clipPlaneVertexDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
vec4 worldPos=finalWorld*vec4(position,1.0);
#include<fogVertex>
vec4 cameraSpacePosition=view*worldPos;gl_Position=projection*cameraSpacePosition;
#ifdef OPACITY
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
if (vOpacityInfos.x==0.)
{vOpacityUV=vec2(opacityMatrix*vec4(uv,1.0,0.0));}
else
{vOpacityUV=vec2(opacityMatrix*vec4(uv2,1.0,0.0));}
#endif 
#include<clipPlaneVertex>
#include<logDepthVertex>
vPosition=position;vNormal=normal;
#define CUSTOM_VERTEX_MAIN_END
}`;h.ShadersStore[Oe]||(h.ShadersStore[Oe]=Ti);class _i extends W{constructor(){super(),this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.OPACITY=!1,this.ANTIALIAS=!1,this.TRANSPARENT=!1,this.FOG=!1,this.PREMULTIPLYALPHA=!1,this.MAX_LINE=!1,this.UV1=!1,this.UV2=!1,this.INSTANCES=!1,this.THIN_INSTANCES=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.rebuild()}}class y extends V{constructor(e,t){super(e,t),this.mainColor=C.Black(),this.lineColor=C.Teal(),this.gridRatio=1,this.gridOffset=X.Zero(),this.majorUnitFrequency=10,this.minorUnitVisibility=.33,this.opacity=1,this.antialias=!0,this.preMultiplyAlpha=!1,this.useMaxLine=!1,this._gridControl=new Je(this.gridRatio,this.majorUnitFrequency,this.minorUnitVisibility,this.opacity)}needAlphaBlending(){return this.opacity<1||this._opacityTexture&&this._opacityTexture.isReady()}needAlphaBlendingForMesh(e){return e.visibility<1||this.needAlphaBlending()}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new _i);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;if(i.TRANSPARENT!==this.opacity<1&&(i.TRANSPARENT=!i.TRANSPARENT,i.markAsUnprocessed()),i.PREMULTIPLYALPHA!=this.preMultiplyAlpha&&(i.PREMULTIPLYALPHA=!i.PREMULTIPLYALPHA,i.markAsUnprocessed()),i.MAX_LINE!==this.useMaxLine&&(i.MAX_LINE=!i.MAX_LINE,i.markAsUnprocessed()),i.ANTIALIAS!==this.antialias&&(i.ANTIALIAS=!i.ANTIALIAS,i.markAsUnprocessed()),i._areTexturesDirty&&(i._needUVs=!1,r.texturesEnabled&&this._opacityTexture&&P.OpacityTextureEnabled))if(this._opacityTexture.isReady())i._needUVs=!0,i.OPACITY=!0;else return!1;if(j(e,r,this._useLogarithmicDepth,!1,this.fogEnabled,!1,i),Z(r,r.getEngine(),this,i,!!o),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial(),B(e,i,!1,!1);const u=[c.PositionKind,c.NormalKind];i.UV1&&u.push(c.UVKind),i.UV2&&u.push(c.UV2Kind),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess,K(u,i);const a=["projection","mainColor","lineColor","gridControl","gridOffset","vFogInfos","vFogColor","world","view","opacityMatrix","vOpacityInfos","visibility","logarithmicDepthConstant"],f=i.toString();G(a),t.setEffect(r.getEngine().createEffect("grid",{attributes:u,uniformsNames:a,uniformBuffersNames:["Scene"],samplers:["opacitySampler"],defines:f,fallbacks:null,onCompiled:this.onCompiled,onError:this.onError},r.getEngine()),i,this._materialContext)}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this._activeEffect.setFloat("visibility",t.visibility),(!i.INSTANCES||i.THIN_INSTANCE)&&this.bindOnlyWorldMatrix(e),this.bindView(r),this.bindViewProjection(r),this._mustRebind(s,r,o)&&(this._activeEffect.setColor3("mainColor",this.mainColor),this._activeEffect.setColor3("lineColor",this.lineColor),this._activeEffect.setVector3("gridOffset",this.gridOffset),this._gridControl.x=this.gridRatio,this._gridControl.y=Math.round(this.majorUnitFrequency),this._gridControl.z=this.minorUnitVisibility,this._gridControl.w=this.opacity,this._activeEffect.setVector4("gridControl",this._gridControl),this._opacityTexture&&P.OpacityTextureEnabled&&(this._activeEffect.setTexture("opacitySampler",this._opacityTexture),this._activeEffect.setFloat2("vOpacityInfos",this._opacityTexture.coordinatesIndex,this._opacityTexture.level),this._activeEffect.setMatrix("opacityMatrix",this._opacityTexture.getTextureMatrix())),z(r,this,s),this._useLogarithmicDepth&&M(i,r,s)),H(s,t,this._activeEffect),this._afterBind(t,this._activeEffect,o))}dispose(e){super.dispose(e)}clone(e){return A.Clone(()=>new y(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.GridMaterial",e}getClassName(){return"GridMaterial"}static Parse(e,t,o){return A.Parse(()=>new y(e.name,t),e,t,o)}}n([N()],y.prototype,"mainColor",void 0);n([N()],y.prototype,"lineColor",void 0);n([l()],y.prototype,"gridRatio",void 0);n([fe()],y.prototype,"gridOffset",void 0);n([l()],y.prototype,"majorUnitFrequency",void 0);n([l()],y.prototype,"minorUnitVisibility",void 0);n([l()],y.prototype,"opacity",void 0);n([l()],y.prototype,"antialias",void 0);n([l()],y.prototype,"preMultiplyAlpha",void 0);n([l()],y.prototype,"useMaxLine",void 0);n([p("opacityTexture")],y.prototype,"_opacityTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],y.prototype,"opacityTexture",void 0);D("BABYLON.GridMaterial",y);const Re="lavaPixelShader",Si=`precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;varying vec3 vPositionW;uniform float time;uniform float speed;uniform float movingSpeed;uniform vec3 fogColor;uniform sampler2D noiseTexture;uniform float fogDensity;varying float noise;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0]
#include<__decl__lightFragment>[1]
#include<__decl__lightFragment>[2]
#include<__decl__lightFragment>[3]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform sampler2D diffuseSampler;uniform vec2 vDiffuseInfos;
#endif
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
float random( vec3 scale,float seed ){return fract( sin( dot( gl_FragCoord.xyz+seed,scale ) )*43758.5453+seed ) ;}
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;
#ifdef DIFFUSE
vec4 noiseTex=texture2D( noiseTexture,vDiffuseUV );vec2 T1=vDiffuseUV+vec2( 1.5,-1.5 )*time *0.02;vec2 T2=vDiffuseUV+vec2( -0.5,2.0 )*time*0.01*speed;T1.x+=noiseTex.x*2.0;T1.y+=noiseTex.y*2.0;T2.x-=noiseTex.y*0.2+time*0.001*movingSpeed;T2.y+=noiseTex.z*0.2+time*0.002*movingSpeed;float p=texture2D( noiseTexture,T1*3.0 ).a;vec4 lavaColor=texture2D( diffuseSampler,T2*4.0);vec4 temp=lavaColor*( vec4( p,p,p,p )*2. )+( lavaColor*lavaColor-0.1 );baseColor=temp;float depth=gl_FragCoord.z*4.0;const float LOG2=1.442695;float fogFactor=exp2(-fogDensity*fogDensity*depth*depth*LOG2 );fogFactor=1.0-clamp( fogFactor,0.0,1.0 );baseColor=mix( baseColor,vec4( fogColor,baseColor.w ),fogFactor );diffuseColor=baseColor.rgb;
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
baseColor.rgb*=vDiffuseInfos.y;
#endif
#ifdef VERTEXCOLOR
baseColor.rgb*=vColor.rgb;
#endif
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
#ifdef UNLIT
vec3 diffuseBase=vec3(1.,1.,1.);
#else
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#include<lightFragment>[0]
#include<lightFragment>[1]
#include<lightFragment>[2]
#include<lightFragment>[3]
#endif
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor,0.0,1.0)*baseColor.rgb;vec4 color=vec4(finalDiffuse,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;h.ShadersStore[Re]||(h.ShadersStore[Re]=Si);const ye="lavaVertexShader",Ei=`precision highp float;uniform float time;uniform float lowFrequencySpeed;varying float noise;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform mat4 diffuseMatrix;uniform vec2 vDiffuseInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
/* NOISE FUNCTIONS */
vec3 mod289(vec3 x)
{return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x)
{return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x)
{return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r)
{return 1.79284291400159-0.85373472095314*r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float pnoise(vec3 P,vec3 rep)
{vec3 Pi0=mod(floor(P),rep); 
vec3 Pi1=mod(Pi0+vec3(1.0),rep); 
Pi0=mod289(Pi0);Pi1=mod289(Pi1);vec3 Pf0=fract(P); 
vec3 Pf1=Pf0-vec3(1.0); 
vec4 ix=vec4(Pi0.x,Pi1.x,Pi0.x,Pi1.x);vec4 iy=vec4(Pi0.yy,Pi1.yy);vec4 iz0=Pi0.zzzz;vec4 iz1=Pi1.zzzz;vec4 ixy=permute(permute(ix)+iy);vec4 ixy0=permute(ixy+iz0);vec4 ixy1=permute(ixy+iz1);vec4 gx0=ixy0*(1.0/7.0);vec4 gy0=fract(floor(gx0)*(1.0/7.0))-0.5;gx0=fract(gx0);vec4 gz0=vec4(0.5)-abs(gx0)-abs(gy0);vec4 sz0=step(gz0,vec4(0.0));gx0-=sz0*(step(0.0,gx0)-0.5);gy0-=sz0*(step(0.0,gy0)-0.5);vec4 gx1=ixy1*(1.0/7.0);vec4 gy1=fract(floor(gx1)*(1.0/7.0))-0.5;gx1=fract(gx1);vec4 gz1=vec4(0.5)-abs(gx1)-abs(gy1);vec4 sz1=step(gz1,vec4(0.0));gx1-=sz1*(step(0.0,gx1)-0.5);gy1-=sz1*(step(0.0,gy1)-0.5);vec3 g000=vec3(gx0.x,gy0.x,gz0.x);vec3 g100=vec3(gx0.y,gy0.y,gz0.y);vec3 g010=vec3(gx0.z,gy0.z,gz0.z);vec3 g110=vec3(gx0.w,gy0.w,gz0.w);vec3 g001=vec3(gx1.x,gy1.x,gz1.x);vec3 g101=vec3(gx1.y,gy1.y,gz1.y);vec3 g011=vec3(gx1.z,gy1.z,gz1.z);vec3 g111=vec3(gx1.w,gy1.w,gz1.w);vec4 norm0=taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));g000*=norm0.x;g010*=norm0.y;g100*=norm0.z;g110*=norm0.w;vec4 norm1=taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));g001*=norm1.x;g011*=norm1.y;g101*=norm1.z;g111*=norm1.w;float n000=dot(g000,Pf0);float n100=dot(g100,vec3(Pf1.x,Pf0.yz));float n010=dot(g010,vec3(Pf0.x,Pf1.y,Pf0.z));float n110=dot(g110,vec3(Pf1.xy,Pf0.z));float n001=dot(g001,vec3(Pf0.xy,Pf1.z));float n101=dot(g101,vec3(Pf1.x,Pf0.y,Pf1.z));float n011=dot(g011,vec3(Pf0.x,Pf1.yz));float n111=dot(g111,Pf1);vec3 fade_xyz=fade(Pf0);vec4 n_z=mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);vec2 n_yz=mix(n_z.xy,n_z.zw,fade_xyz.y);float n_xyz=mix(n_yz.x,n_yz.y,fade_xyz.x);return 2.2*n_xyz;}
/* END FUNCTION */
float turbulence( vec3 p ) {float w=100.0;float t=-.5;for (float f=1.0 ; f<=10.0 ; f++ ){float power=pow( 2.0,f );t+=abs( pnoise( vec3( power*p ),vec3( 10.0,10.0,10.0 ) )/power );}
return t;}
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
#ifdef NORMAL
noise=10.0* -.10*turbulence( .5*normal+time*1.15 );float b=lowFrequencySpeed*5.0*pnoise( 0.05*position +vec3(time*1.025),vec3( 100.0 ) );float displacement=- 1.5*noise+b;vec3 newPosition=position+normal*displacement;gl_Position=viewProjection*finalWorld*vec4( newPosition,1.0 );vec4 worldPos=finalWorld*vec4(newPosition,1.0);vPositionW=vec3(worldPos);vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef DIFFUSE
if (vDiffuseInfos.x==0.)
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));}
else
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));}
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#include<logDepthVertex>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}`;h.ShadersStore[ye]||(h.ShadersStore[ye]=Ei);class xi extends W{constructor(){super(),this.DIFFUSE=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.LIGHT0=!1,this.LIGHT1=!1,this.LIGHT2=!1,this.LIGHT3=!1,this.SPOTLIGHT0=!1,this.SPOTLIGHT1=!1,this.SPOTLIGHT2=!1,this.SPOTLIGHT3=!1,this.HEMILIGHT0=!1,this.HEMILIGHT1=!1,this.HEMILIGHT2=!1,this.HEMILIGHT3=!1,this.DIRLIGHT0=!1,this.DIRLIGHT1=!1,this.DIRLIGHT2=!1,this.DIRLIGHT3=!1,this.POINTLIGHT0=!1,this.POINTLIGHT1=!1,this.POINTLIGHT2=!1,this.POINTLIGHT3=!1,this.SHADOW0=!1,this.SHADOW1=!1,this.SHADOW2=!1,this.SHADOW3=!1,this.SHADOWS=!1,this.SHADOWESM0=!1,this.SHADOWESM1=!1,this.SHADOWESM2=!1,this.SHADOWESM3=!1,this.SHADOWPOISSON0=!1,this.SHADOWPOISSON1=!1,this.SHADOWPOISSON2=!1,this.SHADOWPOISSON3=!1,this.SHADOWPCF0=!1,this.SHADOWPCF1=!1,this.SHADOWPCF2=!1,this.SHADOWPCF3=!1,this.SHADOWPCSS0=!1,this.SHADOWPCSS1=!1,this.SHADOWPCSS2=!1,this.SHADOWPCSS3=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.UNLIT=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.AREALIGHTSUPPORTED=!0,this.AREALIGHTNOROUGHTNESS=!0,this.rebuild()}}class O extends V{constructor(e,t){super(e,t),this.speed=1,this.movingSpeed=1,this.lowFrequencySpeed=1,this.fogDensity=.15,this._lastTime=0,this.diffuseColor=new C(1,1,1),this._disableLighting=!1,this._unlit=!1,this._maxSimultaneousLights=4,this._scaledDiffuse=new C}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new xi);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(i._areTexturesDirty&&(i._needUVs=!1,r.texturesEnabled&&this._diffuseTexture&&P.DiffuseTextureEnabled))if(this._diffuseTexture.isReady())i._needUVs=!0,i.DIFFUSE=!0;else return!1;if(j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=!0,ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),Z(r,u,this,i,!!o),B(e,i,!0,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="lava",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vFogInfos","vFogColor","pointSize","vDiffuseInfos","mBones","diffuseMatrix","logarithmicDepthConstant","time","speed","movingSpeed","fogColor","fogDensity","lowFrequencySpeed"];G(v);const S=["diffuseSampler","noiseTexture","areaLightsLTC1Sampler","areaLightsLTC2Sampler"],T=[];se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this.maxSimultaneousLights}},u),i,this._materialContext)}if(i.AREALIGHTUSED){for(let a=0;a<e.lightSources.length;a++)if(!e.lightSources[a]._isReady())return!1}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,i.UNLIT=this._unlit,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this.diffuseTexture&&P.DiffuseTextureEnabled&&(this._activeEffect.setTexture("diffuseSampler",this.diffuseTexture),this._activeEffect.setFloat2("vDiffuseInfos",this.diffuseTexture.coordinatesIndex,this.diffuseTexture.level),this._activeEffect.setMatrix("diffuseMatrix",this.diffuseTexture.getTextureMatrix())),this.noiseTexture&&this._activeEffect.setTexture("noiseTexture",this.noiseTexture),z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this._scaledDiffuse,this.alpha*t.visibility),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._lastTime+=s.getEngine().getDeltaTime(),this._activeEffect.setFloat("time",this._lastTime*this.speed/1e3),this.fogColor||(this.fogColor=C.Black()),this._activeEffect.setColor3("fogColor",this.fogColor),this._activeEffect.setFloat("fogDensity",this.fogDensity),this._activeEffect.setFloat("lowFrequencySpeed",this.lowFrequencySpeed),this._activeEffect.setFloat("movingSpeed",this.movingSpeed),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this.diffuseTexture&&this.diffuseTexture.animations&&this.diffuseTexture.animations.length>0&&e.push(this.diffuseTexture),this.noiseTexture&&this.noiseTexture.animations&&this.noiseTexture.animations.length>0&&e.push(this.noiseTexture),e}getActiveTextures(){const e=super.getActiveTextures();return this._diffuseTexture&&e.push(this._diffuseTexture),e}hasTexture(e){return!!(super.hasTexture(e)||this.diffuseTexture===e)}dispose(e){this.diffuseTexture&&this.diffuseTexture.dispose(),this.noiseTexture&&this.noiseTexture.dispose(),super.dispose(e)}clone(e){return A.Clone(()=>new O(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.LavaMaterial",e}getClassName(){return"LavaMaterial"}static Parse(e,t,o){return A.Parse(()=>new O(e.name,t),e,t,o)}}n([p("diffuseTexture")],O.prototype,"_diffuseTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],O.prototype,"diffuseTexture",void 0);n([p()],O.prototype,"noiseTexture",void 0);n([N()],O.prototype,"fogColor",void 0);n([l()],O.prototype,"speed",void 0);n([l()],O.prototype,"movingSpeed",void 0);n([l()],O.prototype,"lowFrequencySpeed",void 0);n([l()],O.prototype,"fogDensity",void 0);n([N()],O.prototype,"diffuseColor",void 0);n([l("disableLighting")],O.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],O.prototype,"disableLighting",void 0);n([l("unlit")],O.prototype,"_unlit",void 0);n([d("_markAllSubMeshesAsLightsDirty")],O.prototype,"unlit",void 0);n([l("maxSimultaneousLights")],O.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],O.prototype,"maxSimultaneousLights",void 0);D("BABYLON.LavaMaterial",O);const De="mixPixelShader",Ci=`precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;
#ifdef SPECULARTERM
uniform vec4 vSpecularColor;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#ifdef DIFFUSE
varying vec2 vTextureUV;uniform sampler2D mixMap1Sampler;uniform vec2 vTextureInfos;
#ifdef MIXMAP2
uniform sampler2D mixMap2Sampler;
#endif
uniform sampler2D diffuse1Sampler;uniform sampler2D diffuse2Sampler;uniform sampler2D diffuse3Sampler;uniform sampler2D diffuse4Sampler;uniform vec2 diffuse1Infos;uniform vec2 diffuse2Infos;uniform vec2 diffuse3Infos;uniform vec2 diffuse4Infos;
#ifdef MIXMAP2
uniform sampler2D diffuse5Sampler;uniform sampler2D diffuse6Sampler;uniform sampler2D diffuse7Sampler;uniform sampler2D diffuse8Sampler;uniform vec2 diffuse5Infos;uniform vec2 diffuse6Infos;uniform vec2 diffuse7Infos;uniform vec2 diffuse8Infos;
#endif
#endif
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 finalMixColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;
#ifdef MIXMAP2
vec4 mixColor2=vec4(1.,1.,1.,1.);
#endif
#ifdef SPECULARTERM
float glossiness=vSpecularColor.a;vec3 specularColor=vSpecularColor.rgb;
#else
float glossiness=0.;
#endif
float alpha=vDiffuseColor.a;
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
#ifdef DIFFUSE
vec4 mixColor=texture2D(mixMap1Sampler,vTextureUV);
#include<depthPrePass>
mixColor.rgb*=vTextureInfos.y;vec4 diffuse1Color=texture2D(diffuse1Sampler,vTextureUV*diffuse1Infos);vec4 diffuse2Color=texture2D(diffuse2Sampler,vTextureUV*diffuse2Infos);vec4 diffuse3Color=texture2D(diffuse3Sampler,vTextureUV*diffuse3Infos);vec4 diffuse4Color=texture2D(diffuse4Sampler,vTextureUV*diffuse4Infos);diffuse1Color.rgb*=mixColor.r;diffuse2Color.rgb=mix(diffuse1Color.rgb,diffuse2Color.rgb,mixColor.g);diffuse3Color.rgb=mix(diffuse2Color.rgb,diffuse3Color.rgb,mixColor.b);finalMixColor.rgb=mix(diffuse3Color.rgb,diffuse4Color.rgb,1.0-mixColor.a);
#ifdef MIXMAP2
mixColor=texture2D(mixMap2Sampler,vTextureUV);mixColor.rgb*=vTextureInfos.y;vec4 diffuse5Color=texture2D(diffuse5Sampler,vTextureUV*diffuse5Infos);vec4 diffuse6Color=texture2D(diffuse6Sampler,vTextureUV*diffuse6Infos);vec4 diffuse7Color=texture2D(diffuse7Sampler,vTextureUV*diffuse7Infos);vec4 diffuse8Color=texture2D(diffuse8Sampler,vTextureUV*diffuse8Infos);diffuse5Color.rgb=mix(finalMixColor.rgb,diffuse5Color.rgb,mixColor.r);diffuse6Color.rgb=mix(diffuse5Color.rgb,diffuse6Color.rgb,mixColor.g);diffuse7Color.rgb=mix(diffuse6Color.rgb,diffuse7Color.rgb,mixColor.b);finalMixColor.rgb=mix(diffuse7Color.rgb,diffuse8Color.rgb,1.0-mixColor.a);
#endif
#endif
#ifdef VERTEXCOLOR
finalMixColor.rgb*=vColor.rgb;
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
vec3 specularBase=vec3(0.,0.,0.);
#endif
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
#ifdef SPECULARTERM
vec3 finalSpecular=specularBase*specularColor;
#else
vec3 finalSpecular=vec3(0.0);
#endif
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor*finalMixColor.rgb,0.0,1.0);vec4 color=vec4(finalDiffuse+finalSpecular,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}
`;h.ShadersStore[De]||(h.ShadersStore[De]=Ci);const Fe="mixVertexShader",Pi=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vTextureUV;uniform mat4 textureMatrix;uniform vec2 vTextureInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef DIFFUSE
if (vTextureInfos.x==0.)
{vTextureUV=vec2(textureMatrix*vec4(uv,1.0,0.0));}
else
{vTextureUV=vec2(textureMatrix*vec4(uv2,1.0,0.0));}
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#include<logDepthVertex>
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[Fe]||(h.ShadersStore[Fe]=Pi);class Ai extends W{constructor(){super(),this.DIFFUSE=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.SPECULARTERM=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.MIXMAP2=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.rebuild()}}class E extends V{constructor(e,t){super(e,t),this.diffuseColor=new C(1,1,1),this.specularColor=new C(0,0,0),this.specularPower=64,this._disableLighting=!1,this._maxSimultaneousLights=4}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new Ai);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(r.texturesEnabled&&(!this._mixTexture1||!this._mixTexture1.isReady()||(i._needUVs=!0,P.DiffuseTextureEnabled&&(!this._diffuseTexture1||!this._diffuseTexture1.isReady()||(i.DIFFUSE=!0,!this._diffuseTexture2||!this._diffuseTexture2.isReady())||!this._diffuseTexture3||!this._diffuseTexture3.isReady()||!this._diffuseTexture4||!this._diffuseTexture4.isReady()||this._mixTexture2&&(!this._mixTexture2.isReady()||(i.MIXMAP2=!0,!this._diffuseTexture5||!this._diffuseTexture5.isReady())||!this._diffuseTexture6||!this._diffuseTexture6.isReady()||!this._diffuseTexture7||!this._diffuseTexture7.isReady()||!this._diffuseTexture8||!this._diffuseTexture8.isReady())))))return!1;if(j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),Z(r,u,this,i,!!o),B(e,i,!0,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a,this.maxSimultaneousLights),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="mix",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vSpecularColor","vFogInfos","vFogColor","pointSize","vTextureInfos","mBones","textureMatrix","logarithmicDepthConstant","diffuse1Infos","diffuse2Infos","diffuse3Infos","diffuse4Infos","diffuse5Infos","diffuse6Infos","diffuse7Infos","diffuse8Infos"],S=["mixMap1Sampler","mixMap2Sampler","diffuse1Sampler","diffuse2Sampler","diffuse3Sampler","diffuse4Sampler","diffuse5Sampler","diffuse6Sampler","diffuse7Sampler","diffuse8Sampler"],T=[];G(v),se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this.maxSimultaneousLights}},u),i,this._materialContext)}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this._mixTexture1&&(this._activeEffect.setTexture("mixMap1Sampler",this._mixTexture1),this._activeEffect.setFloat2("vTextureInfos",this._mixTexture1.coordinatesIndex,this._mixTexture1.level),this._activeEffect.setMatrix("textureMatrix",this._mixTexture1.getTextureMatrix()),P.DiffuseTextureEnabled&&(this._diffuseTexture1&&(this._activeEffect.setTexture("diffuse1Sampler",this._diffuseTexture1),this._activeEffect.setFloat2("diffuse1Infos",this._diffuseTexture1.uScale,this._diffuseTexture1.vScale)),this._diffuseTexture2&&(this._activeEffect.setTexture("diffuse2Sampler",this._diffuseTexture2),this._activeEffect.setFloat2("diffuse2Infos",this._diffuseTexture2.uScale,this._diffuseTexture2.vScale)),this._diffuseTexture3&&(this._activeEffect.setTexture("diffuse3Sampler",this._diffuseTexture3),this._activeEffect.setFloat2("diffuse3Infos",this._diffuseTexture3.uScale,this._diffuseTexture3.vScale)),this._diffuseTexture4&&(this._activeEffect.setTexture("diffuse4Sampler",this._diffuseTexture4),this._activeEffect.setFloat2("diffuse4Infos",this._diffuseTexture4.uScale,this._diffuseTexture4.vScale)))),this._mixTexture2&&(this._activeEffect.setTexture("mixMap2Sampler",this._mixTexture2),P.DiffuseTextureEnabled&&(this._diffuseTexture5&&(this._activeEffect.setTexture("diffuse5Sampler",this._diffuseTexture5),this._activeEffect.setFloat2("diffuse5Infos",this._diffuseTexture5.uScale,this._diffuseTexture5.vScale)),this._diffuseTexture6&&(this._activeEffect.setTexture("diffuse6Sampler",this._diffuseTexture6),this._activeEffect.setFloat2("diffuse6Infos",this._diffuseTexture6.uScale,this._diffuseTexture6.vScale)),this._diffuseTexture7&&(this._activeEffect.setTexture("diffuse7Sampler",this._diffuseTexture7),this._activeEffect.setFloat2("diffuse7Infos",this._diffuseTexture7.uScale,this._diffuseTexture7.vScale)),this._diffuseTexture8&&(this._activeEffect.setTexture("diffuse8Sampler",this._diffuseTexture8),this._activeEffect.setFloat2("diffuse8Infos",this._diffuseTexture8.uScale,this._diffuseTexture8.vScale)))),z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),i.SPECULARTERM&&this._activeEffect.setColor4("vSpecularColor",this.specularColor,this.specularPower),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i,this.maxSimultaneousLights),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this._mixTexture1&&this._mixTexture1.animations&&this._mixTexture1.animations.length>0&&e.push(this._mixTexture1),this._mixTexture2&&this._mixTexture2.animations&&this._mixTexture2.animations.length>0&&e.push(this._mixTexture2),e}getActiveTextures(){const e=super.getActiveTextures();return this._mixTexture1&&e.push(this._mixTexture1),this._diffuseTexture1&&e.push(this._diffuseTexture1),this._diffuseTexture2&&e.push(this._diffuseTexture2),this._diffuseTexture3&&e.push(this._diffuseTexture3),this._diffuseTexture4&&e.push(this._diffuseTexture4),this._mixTexture2&&e.push(this._mixTexture2),this._diffuseTexture5&&e.push(this._diffuseTexture5),this._diffuseTexture6&&e.push(this._diffuseTexture6),this._diffuseTexture7&&e.push(this._diffuseTexture7),this._diffuseTexture8&&e.push(this._diffuseTexture8),e}hasTexture(e){return!!(super.hasTexture(e)||this._mixTexture1===e||this._diffuseTexture1===e||this._diffuseTexture2===e||this._diffuseTexture3===e||this._diffuseTexture4===e||this._mixTexture2===e||this._diffuseTexture5===e||this._diffuseTexture6===e||this._diffuseTexture7===e||this._diffuseTexture8===e)}dispose(e){this._mixTexture1&&this._mixTexture1.dispose(),super.dispose(e)}clone(e){return A.Clone(()=>new E(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.MixMaterial",e}getClassName(){return"MixMaterial"}static Parse(e,t,o){return A.Parse(()=>new E(e.name,t),e,t,o)}}n([p("mixTexture1")],E.prototype,"_mixTexture1",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"mixTexture1",void 0);n([p("mixTexture2")],E.prototype,"_mixTexture2",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"mixTexture2",void 0);n([p("diffuseTexture1")],E.prototype,"_diffuseTexture1",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"diffuseTexture1",void 0);n([p("diffuseTexture2")],E.prototype,"_diffuseTexture2",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"diffuseTexture2",void 0);n([p("diffuseTexture3")],E.prototype,"_diffuseTexture3",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"diffuseTexture3",void 0);n([p("diffuseTexture4")],E.prototype,"_diffuseTexture4",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"diffuseTexture4",void 0);n([p("diffuseTexture1")],E.prototype,"_diffuseTexture5",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"diffuseTexture5",void 0);n([p("diffuseTexture2")],E.prototype,"_diffuseTexture6",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"diffuseTexture6",void 0);n([p("diffuseTexture3")],E.prototype,"_diffuseTexture7",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"diffuseTexture7",void 0);n([p("diffuseTexture4")],E.prototype,"_diffuseTexture8",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],E.prototype,"diffuseTexture8",void 0);n([N()],E.prototype,"diffuseColor",void 0);n([N()],E.prototype,"specularColor",void 0);n([l()],E.prototype,"specularPower",void 0);n([l("disableLighting")],E.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],E.prototype,"disableLighting",void 0);n([l("maxSimultaneousLights")],E.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],E.prototype,"maxSimultaneousLights",void 0);D("BABYLON.MixMaterial",E);const be="normalPixelShader",Li=`precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef LIGHTING
#include<helperFunctions>
#include<__decl__lightFragment>[0]
#include<__decl__lightFragment>[1]
#include<__decl__lightFragment>[2]
#include<__decl__lightFragment>[3]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#endif
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform sampler2D diffuseSampler;uniform vec2 vDiffuseInfos;
#endif
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;
#ifdef DIFFUSE
baseColor=texture2D(diffuseSampler,vDiffuseUV);
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
baseColor.rgb*=vDiffuseInfos.y;
#endif
#ifdef NORMAL
baseColor=mix(baseColor,vec4(vNormalW,1.0),0.5);
#endif
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
#ifdef LIGHTING
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#include<lightFragment>[0]
#include<lightFragment>[1]
#include<lightFragment>[2]
#include<lightFragment>[3]
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor,0.0,1.0)*baseColor.rgb;
#else
vec3 finalDiffuse= baseColor.rgb;
#endif
vec4 color=vec4(finalDiffuse,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;h.ShadersStore[be]||(h.ShadersStore[be]=Li);const Me="normalVertexShader",Ii=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform mat4 diffuseMatrix;uniform vec2 vDiffuseInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef DIFFUSE
if (vDiffuseInfos.x==0.)
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));}
else
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));}
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[Me]||(h.ShadersStore[Me]=Ii);class Ni extends W{constructor(){super(),this.DIFFUSE=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.LIGHT0=!1,this.LIGHT1=!1,this.LIGHT2=!1,this.LIGHT3=!1,this.SPOTLIGHT0=!1,this.SPOTLIGHT1=!1,this.SPOTLIGHT2=!1,this.SPOTLIGHT3=!1,this.HEMILIGHT0=!1,this.HEMILIGHT1=!1,this.HEMILIGHT2=!1,this.HEMILIGHT3=!1,this.DIRLIGHT0=!1,this.DIRLIGHT1=!1,this.DIRLIGHT2=!1,this.DIRLIGHT3=!1,this.POINTLIGHT0=!1,this.POINTLIGHT1=!1,this.POINTLIGHT2=!1,this.POINTLIGHT3=!1,this.SHADOW0=!1,this.SHADOW1=!1,this.SHADOW2=!1,this.SHADOW3=!1,this.SHADOWS=!1,this.SHADOWESM0=!1,this.SHADOWESM1=!1,this.SHADOWESM2=!1,this.SHADOWESM3=!1,this.SHADOWPOISSON0=!1,this.SHADOWPOISSON1=!1,this.SHADOWPOISSON2=!1,this.SHADOWPOISSON3=!1,this.SHADOWPCF0=!1,this.SHADOWPCF1=!1,this.SHADOWPCF2=!1,this.SHADOWPCF3=!1,this.SHADOWPCSS0=!1,this.SHADOWPCSS1=!1,this.SHADOWPCSS2=!1,this.SHADOWPCSS3=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.THIN_INSTANCES=!1,this.LIGHTING=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.AREALIGHTSUPPORTED=!0,this.AREALIGHTNOROUGHTNESS=!0,this.rebuild()}}class J extends V{constructor(e,t){super(e,t),this.diffuseColor=new C(1,1,1),this._disableLighting=!1,this._maxSimultaneousLights=4}needAlphaBlending(){return this.alpha<1}needAlphaBlendingForMesh(e){return this.needAlphaBlending()||e.visibility<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new Ni);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(i._areTexturesDirty&&(i._needUVs=!1,r.texturesEnabled&&this._diffuseTexture&&P.DiffuseTextureEnabled))if(this._diffuseTexture.isReady())i._needUVs=!0,i.DIFFUSE=!0;else return!1;if(j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=!0,ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),Z(r,u,this,i,!!o,null,t.getRenderingMesh().hasThinInstances),i.LIGHTING=!this._disableLighting,B(e,i,!0,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),q(f,e,i,a),K(f,i);const m="normal",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vFogInfos","vFogColor","pointSize","vDiffuseInfos","mBones","diffuseMatrix","logarithmicDepthConstant"],S=["diffuseSampler","areaLightsLTC1Sampler","areaLightsLTC2Sampler"],T=[];G(v),se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:4}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:4}},u),i,this._materialContext)}if(i.AREALIGHTUSED){for(let a=0;a<e.lightSources.length;a++)if(!e.lightSources[a]._isReady())return!1}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this.diffuseTexture&&P.DiffuseTextureEnabled&&(this._activeEffect.setTexture("diffuseSampler",this.diffuseTexture),this._activeEffect.setFloat2("vDiffuseInfos",this.diffuseTexture.coordinatesIndex,this.diffuseTexture.level),this._activeEffect.setMatrix("diffuseMatrix",this.diffuseTexture.getTextureMatrix())),z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this.diffuseTexture&&this.diffuseTexture.animations&&this.diffuseTexture.animations.length>0&&e.push(this.diffuseTexture),e}getActiveTextures(){const e=super.getActiveTextures();return this._diffuseTexture&&e.push(this._diffuseTexture),e}hasTexture(e){return!!(super.hasTexture(e)||this.diffuseTexture===e)}dispose(e){this.diffuseTexture&&this.diffuseTexture.dispose(),super.dispose(e)}clone(e){return A.Clone(()=>new J(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.NormalMaterial",e}getClassName(){return"NormalMaterial"}static Parse(e,t,o){return A.Parse(()=>new J(e.name,t),e,t,o)}}n([p("diffuseTexture")],J.prototype,"_diffuseTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],J.prototype,"diffuseTexture",void 0);n([N()],J.prototype,"diffuseColor",void 0);n([l("disableLighting")],J.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],J.prototype,"disableLighting",void 0);n([l("maxSimultaneousLights")],J.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],J.prototype,"maxSimultaneousLights",void 0);D("BABYLON.NormalMaterial",J);const Ue="shadowOnlyPixelShader",Oi=`precision highp float;
#include<__decl__sceneFragment>
uniform float alpha;uniform vec3 shadowColor;varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#include<lightFragment>[0..1]
vec4 color=vec4(shadowColor,(1.0-clamp(shadow,0.,1.))*alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;h.ShadersStore[Ue]||(h.ShadersStore[Ue]=Oi);const we="shadowOnlyVertexShader",Ri=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
#include<__decl__sceneVertex>
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[we]||(h.ShadersStore[we]=Ri);class yi extends W{constructor(){super(),this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.POINTSIZE=!1,this.FOG=!1,this.NORMAL=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.rebuild()}}class ue extends V{constructor(e,t){super(e,t),this._needAlphaBlending=!0,this.shadowColor=C.Black()}needAlphaBlending(){return this._needAlphaBlending}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}get activeLight(){return this._activeLight}set activeLight(e){this._activeLight=e}_getFirstShadowLightForMesh(e){for(const t of e.lightSources)if(t.shadowEnabled)return t;return null}isReadyForSubMesh(e,t,o){var f;const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new yi);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(this._activeLight){for(const m of e.lightSources)if(m.shadowEnabled){if(this._activeLight===m)break;const g=e.lightSources.indexOf(this._activeLight);g!==-1&&(e.lightSources.splice(g,1),e.lightSources.splice(0,0,this._activeLight));break}}Z(r,u,this,i,!!o),j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=ie(r,e,i,!1,1);const a=(f=this._getFirstShadowLightForMesh(e))==null?void 0:f.getShadowGenerator();if(this._needAlphaBlending=!0,a&&a.getClassName&&a.getClassName()==="CascadedShadowGenerator"){const m=a;this._needAlphaBlending=!m.autoCalcDepthBounds}if(B(e,i,!1,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const m=new Y;i.FOG&&m.addFallback(1,"FOG"),te(i,m,1),i.NUM_BONE_INFLUENCERS>0&&m.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const g=[c.PositionKind];i.NORMAL&&g.push(c.NormalKind),q(g,e,i,m),K(g,i);const v="shadowOnly",S=i.toString(),T=["world","view","viewProjection","vEyePosition","vLightsType","vFogInfos","vFogColor","pointSize","alpha","shadowColor","mBones","logarithmicDepthConstant"],me=[],ve=["Scene"];G(T),se({uniformsNames:T,uniformBuffersNames:ve,samplers:me,defines:i,maxSimultaneousLights:1}),t.setEffect(r.getEngine().createEffect(v,{attributes:g,uniformsNames:T,uniformBuffersNames:ve,samplers:me,defines:S,fallbacks:m,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:1}},u),i,this._materialContext)}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;if(r){if(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this.bindViewProjection(r),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._activeEffect.setFloat("alpha",this.alpha),this._activeEffect.setColor3("shadowColor",this.shadowColor),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),s.lightsEnabled){re(s,t,this._activeEffect,i,1);const u=this._getFirstShadowLightForMesh(t);u&&(u._renderId=-1)}(s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE||i.SHADOWCSM0)&&this.bindView(r),H(s,t,this._activeEffect),this._afterBind(t,this._activeEffect,o)}}clone(e){return A.Clone(()=>new ue(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.ShadowOnlyMaterial",e}getClassName(){return"ShadowOnlyMaterial"}static Parse(e,t,o){return A.Parse(()=>new ue(e.name,t),e,t,o)}}D("BABYLON.ShadowOnlyMaterial",ue);const Ve="simplePixelShader",Di=`precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform sampler2D diffuseSampler;uniform vec2 vDiffuseInfos;
#endif
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;
#ifdef DIFFUSE
baseColor=texture2D(diffuseSampler,vDiffuseUV);
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
baseColor.rgb*=vDiffuseInfos.y;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
baseColor.rgb*=vColor.rgb;
#endif
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float glossiness=0.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
vec3 specularBase=vec3(0.,0.,0.);
#endif 
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor,0.0,1.0)*baseColor.rgb;vec4 color=vec4(finalDiffuse,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}`;h.ShadersStore[Ve]||(h.ShadersStore[Ve]=Di);const Be="simpleVertexShader",Fi=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vDiffuseUV;uniform mat4 diffuseMatrix;uniform vec2 vDiffuseInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef DIFFUSE
if (vDiffuseInfos.x==0.)
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv,1.0,0.0));}
else
{vDiffuseUV=vec2(diffuseMatrix*vec4(uv2,1.0,0.0));}
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[Be]||(h.ShadersStore[Be]=Fi);class bi extends W{constructor(){super(),this.DIFFUSE=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.AREALIGHTSUPPORTED=!0,this.AREALIGHTNOROUGHTNESS=!0,this.rebuild()}}class ee extends V{constructor(e,t){super(e,t),this.diffuseColor=new C(1,1,1),this._disableLighting=!1,this._maxSimultaneousLights=4}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new bi);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(i._areTexturesDirty&&(i._needUVs=!1,r.texturesEnabled&&this._diffuseTexture&&P.DiffuseTextureEnabled))if(this._diffuseTexture.isReady())i._needUVs=!0,i.DIFFUSE=!0;else return!1;if(j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),Z(r,u,this,i,!!o),B(e,i,!0,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a,this.maxSimultaneousLights),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="simple",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vFogInfos","vFogColor","pointSize","vDiffuseInfos","mBones","diffuseMatrix","logarithmicDepthConstant"],S=["diffuseSampler","areaLightsLTC1Sampler","areaLightsLTC2Sampler"],T=[];G(v),se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this._maxSimultaneousLights-1}},u),i,this._materialContext)}if(i.AREALIGHTUSED){for(let a=0;a<e.lightSources.length;a++)if(!e.lightSources[a]._isReady())return!1}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this._diffuseTexture&&P.DiffuseTextureEnabled&&(this._activeEffect.setTexture("diffuseSampler",this._diffuseTexture),this._activeEffect.setFloat2("vDiffuseInfos",this._diffuseTexture.coordinatesIndex,this._diffuseTexture.level),this._activeEffect.setMatrix("diffuseMatrix",this._diffuseTexture.getTextureMatrix())),z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i,this.maxSimultaneousLights),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this._diffuseTexture&&this._diffuseTexture.animations&&this._diffuseTexture.animations.length>0&&e.push(this._diffuseTexture),e}getActiveTextures(){const e=super.getActiveTextures();return this._diffuseTexture&&e.push(this._diffuseTexture),e}hasTexture(e){return!!(super.hasTexture(e)||this.diffuseTexture===e)}dispose(e){this._diffuseTexture&&this._diffuseTexture.dispose(),super.dispose(e)}clone(e){return A.Clone(()=>new ee(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.SimpleMaterial",e}getClassName(){return"SimpleMaterial"}static Parse(e,t,o){return A.Parse(()=>new ee(e.name,t),e,t,o)}}n([p("diffuseTexture")],ee.prototype,"_diffuseTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],ee.prototype,"diffuseTexture",void 0);n([N("diffuse")],ee.prototype,"diffuseColor",void 0);n([l("disableLighting")],ee.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],ee.prototype,"disableLighting",void 0);n([l("maxSimultaneousLights")],ee.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],ee.prototype,"maxSimultaneousLights",void 0);D("BABYLON.SimpleMaterial",ee);const Ge="skyPixelShader",Mi=`precision highp float;varying vec3 vPositionW;
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<clipPlaneFragmentDeclaration>
uniform vec3 cameraPosition;uniform vec3 cameraOffset;uniform vec3 up;uniform float luminance;uniform float turbidity;uniform float rayleigh;uniform float mieCoefficient;uniform float mieDirectionalG;uniform vec3 sunPosition;
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
const float e=2.71828182845904523536028747135266249775724709369995957;const float pi=3.141592653589793238462643383279502884197169;const float n=1.0003;const float N=2.545E25;const float pn=0.035;const vec3 lambda=vec3(680E-9,550E-9,450E-9);const vec3 K=vec3(0.686,0.678,0.666);const float v=4.0;const float rayleighZenithLength=8.4E3;const float mieZenithLength=1.25E3;const float EE=1000.0;const float sunAngularDiameterCos=0.999956676946448443553574619906976478926848692873900859324;const float cutoffAngle=pi/1.95;const float steepness=1.5;vec3 totalRayleigh(vec3 lambda)
{return (8.0*pow(pi,3.0)*pow(pow(n,2.0)-1.0,2.0)*(6.0+3.0*pn))/(3.0*N*pow(lambda,vec3(4.0))*(6.0-7.0*pn));}
vec3 simplifiedRayleigh()
{return 0.0005/vec3(94,40,18);}
float rayleighPhase(float cosTheta)
{ 
return (3.0/(16.0*pi))*(1.0+pow(cosTheta,2.0));}
vec3 totalMie(vec3 lambda,vec3 K,float T)
{float c=(0.2*T )*10E-18;return 0.434*c*pi*pow((2.0*pi)/lambda,vec3(v-2.0))*K;}
float hgPhase(float cosTheta,float g)
{return (1.0/(4.0*pi))*((1.0-pow(g,2.0))/pow(1.0-2.0*g*cosTheta+pow(g,2.0),1.5));}
float sunIntensity(float zenithAngleCos)
{return EE*max(0.0,1.0-exp((-(cutoffAngle-acos(zenithAngleCos))/steepness)));}
float A=0.15;float B=0.50;float C=0.10;float D=0.20;float EEE=0.02;float F=0.30;float W=1000.0;vec3 Uncharted2Tonemap(vec3 x)
{return ((x*(A*x+C*B)+D*EEE)/(x*(A*x+B)+D*F))-EEE/F;}
#if DITHER
#include<helperFunctions>
#endif
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
/**
*--------------------------------------------------------------------------------------------------
* Sky Color
*--------------------------------------------------------------------------------------------------
*/
float sunfade=1.0-clamp(1.0-exp((sunPosition.y/450000.0)),0.0,1.0);float rayleighCoefficient=rayleigh-(1.0*(1.0-sunfade));vec3 sunDirection=normalize(sunPosition);float sunE=sunIntensity(dot(sunDirection,up));vec3 betaR=simplifiedRayleigh()*rayleighCoefficient;vec3 betaM=totalMie(lambda,K,turbidity)*mieCoefficient;float zenithAngle=acos(max(0.0,dot(up,normalize(vPositionW-cameraPosition+cameraOffset))));float sR=rayleighZenithLength/(cos(zenithAngle)+0.15*pow(93.885-((zenithAngle*180.0)/pi),-1.253));float sM=mieZenithLength/(cos(zenithAngle)+0.15*pow(93.885-((zenithAngle*180.0)/pi),-1.253));vec3 Fex=exp(-(betaR*sR+betaM*sM));float cosTheta=dot(normalize(vPositionW-cameraPosition),sunDirection);float rPhase=rayleighPhase(cosTheta*0.5+0.5);vec3 betaRTheta=betaR*rPhase;float mPhase=hgPhase(cosTheta,mieDirectionalG);vec3 betaMTheta=betaM*mPhase;vec3 Lin=pow(sunE*((betaRTheta+betaMTheta)/(betaR+betaM))*(1.0-Fex),vec3(1.5));Lin*=mix(vec3(1.0),pow(sunE*((betaRTheta+betaMTheta)/(betaR+betaM))*Fex,vec3(1.0/2.0)),clamp(pow(1.0-dot(up,sunDirection),5.0),0.0,1.0));vec3 direction=normalize(vPositionW-cameraPosition);float theta=acos(direction.y);float phi=atan(direction.z,direction.x);vec2 uv=vec2(phi,theta)/vec2(2.0*pi,pi)+vec2(0.5,0.0);vec3 L0=vec3(0.1)*Fex;float sundisk=smoothstep(sunAngularDiameterCos,sunAngularDiameterCos+0.00002,cosTheta);L0+=(sunE*19000.0*Fex)*sundisk;vec3 whiteScale=1.0/Uncharted2Tonemap(vec3(W));vec3 texColor=(Lin+L0);texColor*=0.04 ;texColor+=vec3(0.0,0.001,0.0025)*0.3;float g_fMaxLuminance=1.0;float fLumScaled=0.1/luminance; 
float fLumCompressed=(fLumScaled*(1.0+(fLumScaled/(g_fMaxLuminance*g_fMaxLuminance))))/(1.0+fLumScaled); 
float ExposureBias=fLumCompressed;vec3 curr=Uncharted2Tonemap((log2(2.0/pow(luminance,4.0)))*texColor);vec3 retColor=curr*whiteScale;/**
*--------------------------------------------------------------------------------------------------
* Sky Color
*--------------------------------------------------------------------------------------------------
*/
float alpha=1.0;
#ifdef VERTEXCOLOR
retColor.rgb*=vColor.rgb;
#endif
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
#if DITHER
retColor.rgb+=dither(gl_FragCoord.xy,0.5);
#endif
vec4 color=clamp(vec4(retColor.rgb,alpha),0.0,1.0);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}
`;h.ShadersStore[Ge]||(h.ShadersStore[Ge]=Mi);const ze="skyVertexShader",Ui=`precision highp float;attribute vec3 position;
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
uniform mat4 world;uniform mat4 view;uniform mat4 viewProjection;
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef VERTEXCOLOR
varying vec4 vColor;
#endif
#include<logDepthDeclaration>
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
gl_Position=viewProjection*world*vec4(position,1.0);vec4 worldPos=world*vec4(position,1.0);vPositionW=vec3(worldPos);
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#ifdef VERTEXCOLOR
vColor=color;
#endif
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[ze]||(h.ShadersStore[ze]=Ui);class wi extends W{constructor(){super(),this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.POINTSIZE=!1,this.FOG=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.DITHER=!1,this.LOGARITHMICDEPTH=!1,this.rebuild()}}class R extends V{constructor(e,t){super(e,t),this.luminance=1,this.turbidity=10,this.rayleigh=2,this.mieCoefficient=.005,this.mieDirectionalG=.8,this.distance=500,this.inclination=.49,this.azimuth=.25,this.sunPosition=new X(0,100,0),this.useSunPosition=!1,this.cameraOffset=X.Zero(),this.up=X.Up(),this.dithering=!1,this._cameraPosition=X.Zero(),this._skyOrientation=new pe}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t){const o=t._drawWrapper;if(this.isFrozen&&o.effect&&o._wasPreviouslyReady)return!0;t.materialDefines||(t.materialDefines=new wi);const s=t.materialDefines,i=this.getScene();if(this._isReadyForSubMesh(t))return!0;if(j(e,i,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,!1,s),B(e,s,!0,!1),s.IMAGEPROCESSINGPOSTPROCESS!==i.imageProcessingConfiguration.applyByPostProcess&&s.markAsMiscDirty(),s.DITHER!==this.dithering&&s.markAsMiscDirty(),s.isDirty){s.markAsProcessed(),i.resetCachedMaterial();const r=new Y;s.FOG&&r.addFallback(1,"FOG"),s.IMAGEPROCESSINGPOSTPROCESS=i.imageProcessingConfiguration.applyByPostProcess,s.DITHER=this.dithering;const u=[c.PositionKind];s.VERTEXCOLOR&&u.push(c.ColorKind);const a="sky",f=["world","viewProjection","view","vFogInfos","vFogColor","logarithmicDepthConstant","pointSize","luminance","turbidity","rayleigh","mieCoefficient","mieDirectionalG","sunPosition","cameraPosition","cameraOffset","up"];G(f);const m=s.toString();t.setEffect(i.getEngine().createEffect(a,u,f,[],m,r,this.onCompiled,this.onError),s,this._materialContext)}return!t.effect||!t.effect.isReady()?!1:(s._renderId=i.getRenderId(),o._wasPreviouslyReady=!0,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;if(!r)return;this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),this._mustRebind(s,r,o)&&(z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s)),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect);const u=s.activeCamera;if(u){const a=u.getWorldMatrix();this._cameraPosition.x=a.m[12],this._cameraPosition.y=a.m[13],this._cameraPosition.z=a.m[14],this._activeEffect.setVector3("cameraPosition",this._cameraPosition)}if(this._activeEffect.setVector3("cameraOffset",this.cameraOffset),this._activeEffect.setVector3("up",this.up),this.luminance>0&&this._activeEffect.setFloat("luminance",this.luminance),this._activeEffect.setFloat("turbidity",this.turbidity),this._activeEffect.setFloat("rayleigh",this.rayleigh),this._activeEffect.setFloat("mieCoefficient",this.mieCoefficient),this._activeEffect.setFloat("mieDirectionalG",this.mieDirectionalG),!this.useSunPosition){const a=Math.PI*(this.inclination-.5),f=2*Math.PI*(this.azimuth-.5);this.sunPosition.x=this.distance*Math.cos(f)*Math.cos(a),this.sunPosition.y=this.distance*Math.sin(-a),this.sunPosition.z=this.distance*Math.sin(f)*Math.cos(a),pe.FromUnitVectorsToRef(X.UpReadOnly,this.up,this._skyOrientation),this.sunPosition.rotateByQuaternionToRef(this._skyOrientation,this.sunPosition)}this._activeEffect.setVector3("sunPosition",this.sunPosition),this._afterBind(t,this._activeEffect,o)}getAnimatables(){return[]}dispose(e){super.dispose(e)}clone(e){return A.Clone(()=>new R(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.SkyMaterial",e}getClassName(){return"SkyMaterial"}static Parse(e,t,o){return A.Parse(()=>new R(e.name,t),e,t,o)}}n([l()],R.prototype,"luminance",void 0);n([l()],R.prototype,"turbidity",void 0);n([l()],R.prototype,"rayleigh",void 0);n([l()],R.prototype,"mieCoefficient",void 0);n([l()],R.prototype,"mieDirectionalG",void 0);n([l()],R.prototype,"distance",void 0);n([l()],R.prototype,"inclination",void 0);n([l()],R.prototype,"azimuth",void 0);n([fe()],R.prototype,"sunPosition",void 0);n([l()],R.prototype,"useSunPosition",void 0);n([fe()],R.prototype,"cameraOffset",void 0);n([fe()],R.prototype,"up",void 0);n([l()],R.prototype,"dithering",void 0);D("BABYLON.SkyMaterial",R);const He="terrainPixelShader",Vi=`precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;
#ifdef SPECULARTERM
uniform vec4 vSpecularColor;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#ifdef DIFFUSE
varying vec2 vTextureUV;uniform sampler2D textureSampler;uniform vec2 vTextureInfos;uniform sampler2D diffuse1Sampler;uniform sampler2D diffuse2Sampler;uniform sampler2D diffuse3Sampler;uniform vec2 diffuse1Infos;uniform vec2 diffuse2Infos;uniform vec2 diffuse3Infos;
#endif
#ifdef BUMP
uniform sampler2D bump1Sampler;uniform sampler2D bump2Sampler;uniform sampler2D bump3Sampler;
#endif
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#ifdef BUMP
#extension GL_OES_standard_derivatives : enable
mat3 cotangent_frame(vec3 normal,vec3 p,vec2 uv)
{vec3 dp1=dFdx(p);vec3 dp2=dFdy(p);vec2 duv1=dFdx(uv);vec2 duv2=dFdy(uv);vec3 dp2perp=cross(dp2,normal);vec3 dp1perp=cross(normal,dp1);vec3 tangent=dp2perp*duv1.x+dp1perp*duv2.x;vec3 binormal=dp2perp*duv1.y+dp1perp*duv2.y;float invmax=inversesqrt(max(dot(tangent,tangent),dot(binormal,binormal)));return mat3(tangent*invmax,binormal*invmax,normal);}
vec3 perturbNormal(vec3 viewDir,vec3 mixColor)
{vec3 bump1Color=texture2D(bump1Sampler,vTextureUV*diffuse1Infos).xyz;vec3 bump2Color=texture2D(bump2Sampler,vTextureUV*diffuse2Infos).xyz;vec3 bump3Color=texture2D(bump3Sampler,vTextureUV*diffuse3Infos).xyz;bump1Color.rgb*=mixColor.r;bump2Color.rgb=mix(bump1Color.rgb,bump2Color.rgb,mixColor.g);vec3 map=mix(bump2Color.rgb,bump3Color.rgb,mixColor.b);map=map*255./127.-128./127.;mat3 TBN=cotangent_frame(vNormalW*vTextureInfos.y,-viewDir,vTextureUV);return normalize(TBN*map);}
#endif
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;
#ifdef SPECULARTERM
float glossiness=vSpecularColor.a;vec3 specularColor=vSpecularColor.rgb;
#else
float glossiness=0.;
#endif
float alpha=vDiffuseColor.a;
#ifdef NORMAL
vec3 normalW=normalize(vNormalW);
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
#ifdef DIFFUSE
baseColor=texture2D(textureSampler,vTextureUV);
#if defined(BUMP) && defined(DIFFUSE)
normalW=perturbNormal(viewDirectionW,baseColor.rgb);
#endif
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
baseColor.rgb*=vTextureInfos.y;vec4 diffuse1Color=texture2D(diffuse1Sampler,vTextureUV*diffuse1Infos);vec4 diffuse2Color=texture2D(diffuse2Sampler,vTextureUV*diffuse2Infos);vec4 diffuse3Color=texture2D(diffuse3Sampler,vTextureUV*diffuse3Infos);diffuse1Color.rgb*=baseColor.r;diffuse2Color.rgb=mix(diffuse1Color.rgb,diffuse2Color.rgb,baseColor.g);baseColor.rgb=mix(diffuse2Color.rgb,diffuse3Color.rgb,baseColor.b);
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
baseColor.rgb*=vColor.rgb;
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
vec3 specularBase=vec3(0.,0.,0.);
#endif
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
#ifdef SPECULARTERM
vec3 finalSpecular=specularBase*specularColor;
#else
vec3 finalSpecular=vec3(0.0);
#endif
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor*baseColor.rgb,0.0,1.0);vec4 color=vec4(finalDiffuse+finalSpecular,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}
`;h.ShadersStore[He]||(h.ShadersStore[He]=Vi);const We="terrainVertexShader",Bi=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSE
varying vec2 vTextureUV;uniform mat4 textureMatrix;uniform vec2 vTextureInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<logDepthDeclaration>
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef DIFFUSE
if (vTextureInfos.x==0.)
{vTextureUV=vec2(textureMatrix*vec4(uv,1.0,0.0));}
else
{vTextureUV=vec2(textureMatrix*vec4(uv2,1.0,0.0));}
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[We]||(h.ShadersStore[We]=Bi);class Gi extends W{constructor(){super(),this.DIFFUSE=!1,this.BUMP=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.SPECULARTERM=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.LOGARITHMICDEPTH=!1,this.AREALIGHTSUPPORTED=!0,this.AREALIGHTNOROUGHTNESS=!0,this.rebuild()}}class L extends V{constructor(e,t){super(e,t),this.diffuseColor=new C(1,1,1),this.specularColor=new C(0,0,0),this.specularPower=64,this._disableLighting=!1,this._maxSimultaneousLights=4}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new Gi);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(r.texturesEnabled){if(!this.mixTexture||!this.mixTexture.isReady())return!1;if(i._needUVs=!0,P.DiffuseTextureEnabled){if(!this.diffuseTexture1||!this.diffuseTexture1.isReady()||!this.diffuseTexture2||!this.diffuseTexture2.isReady()||!this.diffuseTexture3||!this.diffuseTexture3.isReady())return!1;i.DIFFUSE=!0}if(this.bumpTexture1&&this.bumpTexture2&&this.bumpTexture3&&P.BumpTextureEnabled){if(!this.bumpTexture1.isReady()||!this.bumpTexture2.isReady()||!this.bumpTexture3.isReady())return!1;i._needNormals=!0,i.BUMP=!0}}if(j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),Z(r,u,this,i,!!o),B(e,i,!0,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a,this.maxSimultaneousLights),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="terrain",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vSpecularColor","vFogInfos","vFogColor","pointSize","vTextureInfos","mBones","textureMatrix","diffuse1Infos","diffuse2Infos","diffuse3Infos"],S=["textureSampler","diffuse1Sampler","diffuse2Sampler","diffuse3Sampler","bump1Sampler","bump2Sampler","bump3Sampler","logarithmicDepthConstant","areaLightsLTC1Sampler","areaLightsLTC2Sampler"],T=[];G(v),se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this.maxSimultaneousLights}},u),i,this._materialContext)}if(i.AREALIGHTUSED){for(let a=0;a<e.lightSources.length;a++)if(!e.lightSources[a]._isReady())return!1}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("view",s.getViewMatrix()),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this.mixTexture&&(this._activeEffect.setTexture("textureSampler",this._mixTexture),this._activeEffect.setFloat2("vTextureInfos",this._mixTexture.coordinatesIndex,this._mixTexture.level),this._activeEffect.setMatrix("textureMatrix",this._mixTexture.getTextureMatrix()),P.DiffuseTextureEnabled&&(this._diffuseTexture1&&(this._activeEffect.setTexture("diffuse1Sampler",this._diffuseTexture1),this._activeEffect.setFloat2("diffuse1Infos",this._diffuseTexture1.uScale,this._diffuseTexture1.vScale)),this._diffuseTexture2&&(this._activeEffect.setTexture("diffuse2Sampler",this._diffuseTexture2),this._activeEffect.setFloat2("diffuse2Infos",this._diffuseTexture2.uScale,this._diffuseTexture2.vScale)),this._diffuseTexture3&&(this._activeEffect.setTexture("diffuse3Sampler",this._diffuseTexture3),this._activeEffect.setFloat2("diffuse3Infos",this._diffuseTexture3.uScale,this._diffuseTexture3.vScale))),P.BumpTextureEnabled&&s.getEngine().getCaps().standardDerivatives&&(this._bumpTexture1&&this._activeEffect.setTexture("bump1Sampler",this._bumpTexture1),this._bumpTexture2&&this._activeEffect.setTexture("bump2Sampler",this._bumpTexture2),this._bumpTexture3&&this._activeEffect.setTexture("bump3Sampler",this._bumpTexture3))),z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),i.SPECULARTERM&&this._activeEffect.setColor4("vSpecularColor",this.specularColor,this.specularPower),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i,this.maxSimultaneousLights),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this.mixTexture&&this.mixTexture.animations&&this.mixTexture.animations.length>0&&e.push(this.mixTexture),e}getActiveTextures(){const e=super.getActiveTextures();return this._mixTexture&&e.push(this._mixTexture),this._diffuseTexture1&&e.push(this._diffuseTexture1),this._diffuseTexture2&&e.push(this._diffuseTexture2),this._diffuseTexture3&&e.push(this._diffuseTexture3),this._bumpTexture1&&e.push(this._bumpTexture1),this._bumpTexture2&&e.push(this._bumpTexture2),this._bumpTexture3&&e.push(this._bumpTexture3),e}hasTexture(e){return!!(super.hasTexture(e)||this._mixTexture===e||this._diffuseTexture1===e||this._diffuseTexture2===e||this._diffuseTexture3===e||this._bumpTexture1===e||this._bumpTexture2===e||this._bumpTexture3===e)}dispose(e){this.mixTexture&&this.mixTexture.dispose(),super.dispose(e)}clone(e){return A.Clone(()=>new L(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.TerrainMaterial",e}getClassName(){return"TerrainMaterial"}static Parse(e,t,o){return A.Parse(()=>new L(e.name,t),e,t,o)}}n([p("mixTexture")],L.prototype,"_mixTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],L.prototype,"mixTexture",void 0);n([p("diffuseTexture1")],L.prototype,"_diffuseTexture1",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],L.prototype,"diffuseTexture1",void 0);n([p("diffuseTexture2")],L.prototype,"_diffuseTexture2",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],L.prototype,"diffuseTexture2",void 0);n([p("diffuseTexture3")],L.prototype,"_diffuseTexture3",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],L.prototype,"diffuseTexture3",void 0);n([p("bumpTexture1")],L.prototype,"_bumpTexture1",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],L.prototype,"bumpTexture1",void 0);n([p("bumpTexture2")],L.prototype,"_bumpTexture2",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],L.prototype,"bumpTexture2",void 0);n([p("bumpTexture3")],L.prototype,"_bumpTexture3",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],L.prototype,"bumpTexture3",void 0);n([N()],L.prototype,"diffuseColor",void 0);n([N()],L.prototype,"specularColor",void 0);n([l()],L.prototype,"specularPower",void 0);n([l("disableLighting")],L.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],L.prototype,"disableLighting",void 0);n([l("maxSimultaneousLights")],L.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],L.prototype,"maxSimultaneousLights",void 0);D("BABYLON.TerrainMaterial",L);const Xe="triplanarPixelShader",zi=`precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;
#ifdef SPECULARTERM
uniform vec4 vSpecularColor;
#endif
varying vec3 vPositionW;
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#ifdef DIFFUSEX
varying vec2 vTextureUVX;uniform sampler2D diffuseSamplerX;
#ifdef BUMPX
uniform sampler2D normalSamplerX;
#endif
#endif
#ifdef DIFFUSEY
varying vec2 vTextureUVY;uniform sampler2D diffuseSamplerY;
#ifdef BUMPY
uniform sampler2D normalSamplerY;
#endif
#endif
#ifdef DIFFUSEZ
varying vec2 vTextureUVZ;uniform sampler2D diffuseSamplerZ;
#ifdef BUMPZ
uniform sampler2D normalSamplerZ;
#endif
#endif
#ifdef NORMAL
varying mat3 tangentSpace;
#endif
#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
#include<logDepthDeclaration>
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#include<clipPlaneFragmentDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(0.,0.,0.,1.);vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;
#ifdef NORMAL
vec3 normalW=tangentSpace[2];
#else
vec3 normalW=vec3(1.0,1.0,1.0);
#endif
vec4 baseNormal=vec4(0.0,0.0,0.0,1.0);normalW*=normalW;
#ifdef DIFFUSEX
baseColor+=texture2D(diffuseSamplerX,vTextureUVX)*normalW.x;
#ifdef BUMPX
baseNormal+=texture2D(normalSamplerX,vTextureUVX)*normalW.x;
#endif
#endif
#ifdef DIFFUSEY
baseColor+=texture2D(diffuseSamplerY,vTextureUVY)*normalW.y;
#ifdef BUMPY
baseNormal+=texture2D(normalSamplerY,vTextureUVY)*normalW.y;
#endif
#endif
#ifdef DIFFUSEZ
baseColor+=texture2D(diffuseSamplerZ,vTextureUVZ)*normalW.z;
#ifdef BUMPZ
baseNormal+=texture2D(normalSamplerZ,vTextureUVZ)*normalW.z;
#endif
#endif
#ifdef NORMAL
normalW=normalize((2.0*baseNormal.xyz-1.0)*tangentSpace);
#endif
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
#include<depthPrePass>
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
baseColor.rgb*=vColor.rgb;
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
float glossiness=vSpecularColor.a;vec3 specularBase=vec3(0.,0.,0.);vec3 specularColor=vSpecularColor.rgb;
#else
float glossiness=0.;
#endif
#include<lightFragment>[0..maxSimultaneousLights]
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
#ifdef SPECULARTERM
vec3 finalSpecular=specularBase*specularColor;
#else
vec3 finalSpecular=vec3(0.0);
#endif
vec3 finalDiffuse=clamp(diffuseBase*diffuseColor,0.0,1.0)*baseColor.rgb;vec4 color=vec4(finalDiffuse+finalSpecular,alpha);
#include<logDepthFragment>
#include<fogFragment>
gl_FragColor=color;
#include<imageProcessingCompatibility>
#define CUSTOM_FRAGMENT_MAIN_END
}
`;h.ShadersStore[Xe]||(h.ShadersStore[Xe]=zi);const ke="triplanarVertexShader",Hi=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<helperFunctions>
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef DIFFUSEX
varying vec2 vTextureUVX;
#endif
#ifdef DIFFUSEY
varying vec2 vTextureUVY;
#endif
#ifdef DIFFUSEZ
varying vec2 vTextureUVZ;
#endif
uniform float tileSize;
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying mat3 tangentSpace;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<logDepthDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);gl_Position=viewProjection*worldPos;vPositionW=vec3(worldPos);
#ifdef DIFFUSEX
vTextureUVX=worldPos.zy/tileSize;
#endif
#ifdef DIFFUSEY
vTextureUVY=worldPos.xz/tileSize;
#endif
#ifdef DIFFUSEZ
vTextureUVZ=worldPos.xy/tileSize;
#endif
#ifdef NORMAL
vec3 xtan=vec3(0,0,1);vec3 xbin=vec3(0,1,0);vec3 ytan=vec3(1,0,0);vec3 ybin=vec3(0,0,1);vec3 ztan=vec3(1,0,0);vec3 zbin=vec3(0,1,0);vec3 normalizedNormal=normalize(normal);normalizedNormal*=normalizedNormal;vec3 worldBinormal=normalize(xbin*normalizedNormal.x+ybin*normalizedNormal.y+zbin*normalizedNormal.z);vec3 worldTangent=normalize(xtan*normalizedNormal.x+ytan*normalizedNormal.y+ztan*normalizedNormal.z);mat3 normalWorld=mat3(finalWorld);
#ifdef NONUNIFORMSCALING
normalWorld=transposeMat3(inverseMat3(normalWorld));
#endif
worldTangent=normalize((normalWorld*worldTangent).xyz);worldBinormal=normalize((normalWorld*worldBinormal).xyz);vec3 worldNormal=normalize((normalWorld*normalize(normal)).xyz);tangentSpace[0]=worldTangent;tangentSpace[1]=worldBinormal;tangentSpace[2]=worldNormal;
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[ke]||(h.ShadersStore[ke]=Hi);class Wi extends W{constructor(){super(),this.DIFFUSEX=!1,this.DIFFUSEY=!1,this.DIFFUSEZ=!1,this.BUMPX=!1,this.BUMPY=!1,this.BUMPZ=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.SPECULARTERM=!1,this.NORMAL=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.NONUNIFORMSCALING=!1,this.LOGARITHMICDEPTH=!1,this.AREALIGHTSUPPORTED=!0,this.AREALIGHTNOROUGHTNESS=!0,this.rebuild()}}class I extends V{constructor(e,t){super(e,t),this.tileSize=1,this.diffuseColor=new C(1,1,1),this.specularColor=new C(.2,.2,.2),this.specularPower=64,this._disableLighting=!1,this._maxSimultaneousLights=4}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new Wi);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(i._areTexturesDirty&&r.texturesEnabled){if(P.DiffuseTextureEnabled){const a=[this.diffuseTextureX,this.diffuseTextureY,this.diffuseTextureZ],f=["DIFFUSEX","DIFFUSEY","DIFFUSEZ"];for(let m=0;m<a.length;m++)if(a[m])if(a[m].isReady())i[f[m]]=!0;else return!1}if(P.BumpTextureEnabled){const a=[this.normalTextureX,this.normalTextureY,this.normalTextureZ],f=["BUMPX","BUMPY","BUMPZ"];for(let m=0;m<a.length;m++)if(a[m])if(a[m].isReady())i[f[m]]=!0;else return!1}}if(j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._needNormals=ie(r,e,i,!1,this._maxSimultaneousLights,this._disableLighting),Z(r,u,this,i,!!o),B(e,i,!0,!0),i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),te(i,a,this.maxSimultaneousLights),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e),i.IMAGEPROCESSINGPOSTPROCESS=r.imageProcessingConfiguration.applyByPostProcess;const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="triplanar",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vSpecularColor","vFogInfos","vFogColor","pointSize","mBones","tileSize"],S=["diffuseSamplerX","diffuseSamplerY","diffuseSamplerZ","normalSamplerX","normalSamplerY","normalSamplerZ","logarithmicDepthConstant","areaLightsLTC1Sampler","areaLightsLTC2Sampler"],T=[];G(v),se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this.maxSimultaneousLights}},u),i,this._materialContext)}if(i.AREALIGHTUSED){for(let a=0;a<e.lightSources.length;a++)if(!e.lightSources[a]._isReady())return!1}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;r&&(this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._activeEffect.setFloat("tileSize",this.tileSize),this._mustRebind(s,r,o)&&(this.diffuseTextureX&&this._activeEffect.setTexture("diffuseSamplerX",this.diffuseTextureX),this.diffuseTextureY&&this._activeEffect.setTexture("diffuseSamplerY",this.diffuseTextureY),this.diffuseTextureZ&&this._activeEffect.setTexture("diffuseSamplerZ",this.diffuseTextureZ),this.normalTextureX&&this._activeEffect.setTexture("normalSamplerX",this.normalTextureX),this.normalTextureY&&this._activeEffect.setTexture("normalSamplerY",this.normalTextureY),this.normalTextureZ&&this._activeEffect.setTexture("normalSamplerZ",this.normalTextureZ),z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),i.SPECULARTERM&&this._activeEffect.setColor4("vSpecularColor",this.specularColor,this.specularPower),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i,this.maxSimultaneousLights),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),this._afterBind(t,this._activeEffect,o))}getAnimatables(){const e=[];return this.mixTexture&&this.mixTexture.animations&&this.mixTexture.animations.length>0&&e.push(this.mixTexture),e}getActiveTextures(){const e=super.getActiveTextures();return this._diffuseTextureX&&e.push(this._diffuseTextureX),this._diffuseTextureY&&e.push(this._diffuseTextureY),this._diffuseTextureZ&&e.push(this._diffuseTextureZ),this._normalTextureX&&e.push(this._normalTextureX),this._normalTextureY&&e.push(this._normalTextureY),this._normalTextureZ&&e.push(this._normalTextureZ),e}hasTexture(e){return!!(super.hasTexture(e)||this._diffuseTextureX===e||this._diffuseTextureY===e||this._diffuseTextureZ===e||this._normalTextureX===e||this._normalTextureY===e||this._normalTextureZ===e)}dispose(e){this.mixTexture&&this.mixTexture.dispose(),super.dispose(e)}clone(e){return A.Clone(()=>new I(e,this.getScene()),this)}serialize(){const e=super.serialize();return e.customType="BABYLON.TriPlanarMaterial",e}getClassName(){return"TriPlanarMaterial"}static Parse(e,t,o){return A.Parse(()=>new I(e.name,t),e,t,o)}}n([p()],I.prototype,"mixTexture",void 0);n([p("diffuseTextureX")],I.prototype,"_diffuseTextureX",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],I.prototype,"diffuseTextureX",void 0);n([p("diffuseTexturY")],I.prototype,"_diffuseTextureY",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],I.prototype,"diffuseTextureY",void 0);n([p("diffuseTextureZ")],I.prototype,"_diffuseTextureZ",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],I.prototype,"diffuseTextureZ",void 0);n([p("normalTextureX")],I.prototype,"_normalTextureX",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],I.prototype,"normalTextureX",void 0);n([p("normalTextureY")],I.prototype,"_normalTextureY",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],I.prototype,"normalTextureY",void 0);n([p("normalTextureZ")],I.prototype,"_normalTextureZ",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],I.prototype,"normalTextureZ",void 0);n([l()],I.prototype,"tileSize",void 0);n([N()],I.prototype,"diffuseColor",void 0);n([N()],I.prototype,"specularColor",void 0);n([l()],I.prototype,"specularPower",void 0);n([l("disableLighting")],I.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],I.prototype,"disableLighting",void 0);n([l("maxSimultaneousLights")],I.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],I.prototype,"maxSimultaneousLights",void 0);D("BABYLON.TriPlanarMaterial",I);const je="waterPixelShader",Xi=`#ifdef LOGARITHMICDEPTH
#extension GL_EXT_frag_depth : enable
#endif
precision highp float;uniform vec4 vEyePosition;uniform vec4 vDiffuseColor;
#ifdef SPECULARTERM
uniform vec4 vSpecularColor;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<helperFunctions>
#include<imageProcessingDeclaration>
#include<imageProcessingFunctions>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<lightsFragmentFunctions>
#include<shadowsFragmentFunctions>
#ifdef BUMP
varying vec2 vNormalUV;
#ifdef BUMPSUPERIMPOSE
varying vec2 vNormalUV2;
#endif
uniform sampler2D normalSampler;uniform vec2 vNormalInfos;
#endif
uniform sampler2D refractionSampler;uniform sampler2D reflectionSampler;const float LOG2=1.442695;uniform vec3 cameraPosition;uniform vec4 waterColor;uniform float colorBlendFactor;uniform vec4 waterColor2;uniform float colorBlendFactor2;uniform float bumpHeight;uniform float time;varying vec3 vRefractionMapTexCoord;varying vec3 vReflectionMapTexCoord;
#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec3 viewDirectionW=normalize(vEyePosition.xyz-vPositionW);vec4 baseColor=vec4(1.,1.,1.,1.);vec3 diffuseColor=vDiffuseColor.rgb;float alpha=vDiffuseColor.a;
#ifdef BUMP
#ifdef BUMPSUPERIMPOSE
baseColor=0.6*texture2D(normalSampler,vNormalUV)+0.4*texture2D(normalSampler,vec2(vNormalUV2.x,vNormalUV2.y));
#else
baseColor=texture2D(normalSampler,vNormalUV);
#endif
vec3 bumpColor=baseColor.rgb;
#ifdef ALPHATEST
if (baseColor.a<0.4)
discard;
#endif
baseColor.rgb*=vNormalInfos.y;
#else
vec3 bumpColor=vec3(1.0);
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
baseColor.rgb*=vColor.rgb;
#endif
#ifdef NORMAL
vec2 perturbation=bumpHeight*(baseColor.rg-0.5);
#ifdef BUMPAFFECTSREFLECTION
vec3 normalW=normalize(vNormalW+vec3(perturbation.x*8.0,0.0,perturbation.y*8.0));if (normalW.y<0.0) {normalW.y=-normalW.y;}
#else
vec3 normalW=normalize(vNormalW);
#endif
#else
vec3 normalW=vec3(1.0,1.0,1.0);vec2 perturbation=bumpHeight*(vec2(1.0,1.0)-0.5);
#endif
#ifdef FRESNELSEPARATE
#ifdef REFLECTION
vec2 projectedRefractionTexCoords=clamp(vRefractionMapTexCoord.xy/vRefractionMapTexCoord.z+perturbation*0.5,0.0,1.0);vec4 refractiveColor=texture2D(refractionSampler,projectedRefractionTexCoords);
#ifdef IS_REFRACTION_LINEAR
refractiveColor.rgb=toGammaSpace(refractiveColor.rgb);
#endif
vec2 projectedReflectionTexCoords=clamp(vec2(
vReflectionMapTexCoord.x/vReflectionMapTexCoord.z+perturbation.x*0.3,
vReflectionMapTexCoord.y/vReflectionMapTexCoord.z+perturbation.y
),0.0,1.0);vec4 reflectiveColor=texture2D(reflectionSampler,projectedReflectionTexCoords);
#ifdef IS_REFLECTION_LINEAR
reflectiveColor.rgb=toGammaSpace(reflectiveColor.rgb);
#endif
vec3 upVector=vec3(0.0,1.0,0.0);float fresnelTerm=clamp(abs(pow(dot(viewDirectionW,upVector),3.0)),0.05,0.65);float IfresnelTerm=1.0-fresnelTerm;refractiveColor=colorBlendFactor*waterColor+(1.0-colorBlendFactor)*refractiveColor;reflectiveColor=IfresnelTerm*colorBlendFactor2*waterColor+(1.0-colorBlendFactor2*IfresnelTerm)*reflectiveColor;vec4 combinedColor=refractiveColor*fresnelTerm+reflectiveColor*IfresnelTerm;baseColor=combinedColor;
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
float glossiness=vSpecularColor.a;vec3 specularBase=vec3(0.,0.,0.);vec3 specularColor=vSpecularColor.rgb;
#else
float glossiness=0.;
#endif
#include<lightFragment>[0..maxSimultaneousLights]
vec3 finalDiffuse=clamp(baseColor.rgb,0.0,1.0);
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
#ifdef SPECULARTERM
vec3 finalSpecular=specularBase*specularColor;
#else
vec3 finalSpecular=vec3(0.0);
#endif
#else 
#ifdef REFLECTION
vec2 projectedRefractionTexCoords=clamp(vRefractionMapTexCoord.xy/vRefractionMapTexCoord.z+perturbation,0.0,1.0);vec4 refractiveColor=texture2D(refractionSampler,projectedRefractionTexCoords);
#ifdef IS_REFRACTION_LINEAR
refractiveColor.rgb=toGammaSpace(refractiveColor.rgb);
#endif
vec2 projectedReflectionTexCoords=clamp(vReflectionMapTexCoord.xy/vReflectionMapTexCoord.z+perturbation,0.0,1.0);vec4 reflectiveColor=texture2D(reflectionSampler,projectedReflectionTexCoords);
#ifdef IS_REFLECTION_LINEAR
reflectiveColor.rgb=toGammaSpace(reflectiveColor.rgb);
#endif
vec3 upVector=vec3(0.0,1.0,0.0);float fresnelTerm=max(dot(viewDirectionW,upVector),0.0);vec4 combinedColor=refractiveColor*fresnelTerm+reflectiveColor*(1.0-fresnelTerm);baseColor=colorBlendFactor*waterColor+(1.0-colorBlendFactor)*combinedColor;
#endif
vec3 diffuseBase=vec3(0.,0.,0.);lightingInfo info;float shadow=1.;float aggShadow=0.;float numLights=0.;
#ifdef SPECULARTERM
float glossiness=vSpecularColor.a;vec3 specularBase=vec3(0.,0.,0.);vec3 specularColor=vSpecularColor.rgb;
#else
float glossiness=0.;
#endif
#include<lightFragment>[0..maxSimultaneousLights]
vec3 finalDiffuse=clamp(baseColor.rgb,0.0,1.0);
#if defined(VERTEXALPHA) || defined(INSTANCESCOLOR) && defined(INSTANCES)
alpha*=vColor.a;
#endif
#ifdef SPECULARTERM
vec3 finalSpecular=specularBase*specularColor;
#else
vec3 finalSpecular=vec3(0.0);
#endif
#endif
vec4 color=vec4(finalDiffuse+finalSpecular,alpha);
#include<logDepthFragment>
#include<fogFragment>
#ifdef IMAGEPROCESSINGPOSTPROCESS
color.rgb=toLinearSpace(color.rgb);
#elif defined(IMAGEPROCESSING)
color.rgb=toLinearSpace(color.rgb);color=applyImageProcessing(color);
#endif
gl_FragColor=color;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;h.ShadersStore[je]||(h.ShadersStore[je]=Xi);const Ze="waterVertexShader",ki=`precision highp float;attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef VERTEXCOLOR
attribute vec4 color;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<instancesDeclaration>
uniform mat4 view;uniform mat4 viewProjection;
#ifdef BUMP
varying vec2 vNormalUV;
#ifdef BUMPSUPERIMPOSE
varying vec2 vNormalUV2;
#endif
uniform mat4 normalMatrix;uniform vec2 vNormalInfos;
#endif
#ifdef POINTSIZE
uniform float pointSize;
#endif
varying vec3 vPositionW;
#ifdef NORMAL
varying vec3 vNormalW;
#endif
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vec4 vColor;
#endif
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#include<__decl__lightFragment>[0..maxSimultaneousLights]
#include<logDepthDeclaration>
uniform mat4 reflectionViewProjection;uniform vec2 windDirection;uniform float waveLength;uniform float time;uniform float windForce;uniform float waveHeight;uniform float waveSpeed;uniform float waveCount;varying vec3 vRefractionMapTexCoord;varying vec3 vReflectionMapTexCoord;
#define CUSTOM_VERTEX_DEFINITIONS
void main(void) {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
vec4 colorUpdated=color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(position,1.0);vPositionW=vec3(worldPos);
#ifdef NORMAL
vNormalW=normalize(vec3(finalWorld*vec4(normal,0.0)));
#endif
#ifndef UV1
vec2 uv=vec2(0.,0.);
#endif
#ifndef UV2
vec2 uv2=vec2(0.,0.);
#endif
#ifdef BUMP
if (vNormalInfos.x==0.)
{vNormalUV=vec2(normalMatrix*vec4((uv*1.0)/waveLength+time*windForce*windDirection,1.0,0.0));
#ifdef BUMPSUPERIMPOSE
vNormalUV2=vec2(normalMatrix*vec4((uv*0.721)/waveLength+time*1.2*windForce*windDirection,1.0,0.0));
#endif
}
else
{vNormalUV=vec2(normalMatrix*vec4((uv2*1.0)/waveLength+time*windForce*windDirection ,1.0,0.0));
#ifdef BUMPSUPERIMPOSE
vNormalUV2=vec2(normalMatrix*vec4((uv2*0.721)/waveLength+time*1.2*windForce*windDirection ,1.0,0.0));
#endif
}
#endif
#include<clipPlaneVertex>
#include<fogVertex>
#include<shadowsVertex>[0..maxSimultaneousLights]
#include<vertexColorMixing>
#if defined(POINTSIZE) && !defined(WEBGPU)
gl_PointSize=pointSize;
#endif
float finalWaveCount=1.0/(waveCount*0.5);
#ifdef USE_WORLD_COORDINATES
vec3 p=worldPos.xyz;
#else
vec3 p=position;
#endif
float newY=(sin(((p.x/finalWaveCount)+time*waveSpeed))*waveHeight*windDirection.x*5.0)
+ (cos(((p.z/finalWaveCount)+ time*waveSpeed))*waveHeight*windDirection.y*5.0);p.y+=abs(newY);
#ifdef USE_WORLD_COORDINATES
gl_Position=viewProjection*vec4(p,1.0);
#else
gl_Position=viewProjection*finalWorld*vec4(p,1.0);
#endif
#ifdef REFLECTION
vRefractionMapTexCoord.x=0.5*(gl_Position.w+gl_Position.x);vRefractionMapTexCoord.y=0.5*(gl_Position.w+gl_Position.y);vRefractionMapTexCoord.z=gl_Position.w;worldPos=reflectionViewProjection*finalWorld*vec4(position,1.0);vReflectionMapTexCoord.x=0.5*(worldPos.w+worldPos.x);vReflectionMapTexCoord.y=0.5*(worldPos.w+worldPos.y);vReflectionMapTexCoord.z=worldPos.w;
#endif
#include<logDepthVertex>
#define CUSTOM_VERTEX_MAIN_END
}
`;h.ShadersStore[Ze]||(h.ShadersStore[Ze]=ki);class ji extends W{constructor(){super(),this.BUMP=!1,this.REFLECTION=!1,this.CLIPPLANE=!1,this.CLIPPLANE2=!1,this.CLIPPLANE3=!1,this.CLIPPLANE4=!1,this.CLIPPLANE5=!1,this.CLIPPLANE6=!1,this.ALPHATEST=!1,this.DEPTHPREPASS=!1,this.POINTSIZE=!1,this.FOG=!1,this.NORMAL=!1,this.UV1=!1,this.UV2=!1,this.VERTEXCOLOR=!1,this.VERTEXALPHA=!1,this.NUM_BONE_INFLUENCERS=0,this.BonesPerMesh=0,this.INSTANCES=!1,this.INSTANCESCOLOR=!1,this.SPECULARTERM=!1,this.LOGARITHMICDEPTH=!1,this.USE_REVERSE_DEPTHBUFFER=!1,this.FRESNELSEPARATE=!1,this.BUMPSUPERIMPOSE=!1,this.BUMPAFFECTSREFLECTION=!1,this.USE_WORLD_COORDINATES=!1,this.IMAGEPROCESSING=!1,this.VIGNETTE=!1,this.VIGNETTEBLENDMODEMULTIPLY=!1,this.VIGNETTEBLENDMODEOPAQUE=!1,this.TONEMAPPING=0,this.CONTRAST=!1,this.EXPOSURE=!1,this.COLORCURVES=!1,this.COLORGRADING=!1,this.COLORGRADING3D=!1,this.SAMPLER3DGREENDEPTH=!1,this.SAMPLER3DBGRMAP=!1,this.DITHER=!1,this.IMAGEPROCESSINGPOSTPROCESS=!1,this.SKIPFINALCOLORCLAMP=!1,this.rebuild()}}class _ extends V{get hasRenderTargetTextures(){return!0}constructor(e,t,o=new ge(512,512)){super(e,t),this.renderTargetSize=o,this.diffuseColor=new C(1,1,1),this.specularColor=new C(0,0,0),this.specularPower=64,this._disableLighting=!1,this._maxSimultaneousLights=4,this.windForce=6,this.windDirection=new ge(0,1),this.waveHeight=.4,this.bumpHeight=.4,this._bumpSuperimpose=!1,this._fresnelSeparate=!1,this._bumpAffectsReflection=!1,this.waterColor=new C(.1,.1,.6),this.colorBlendFactor=.2,this.waterColor2=new C(.1,.1,.6),this.colorBlendFactor2=.2,this.waveLength=.1,this.waveSpeed=1,this.waveCount=20,this.disableClipPlane=!1,this._useWorldCoordinatesForWaveDeformation=!1,this._renderTargets=new ii(16),this._mesh=null,this._reflectionTransform=de.Zero(),this._lastTime=0,this._lastDeltaTime=0,this._createRenderTargets(this.getScene(),o),this.getRenderTargetTextures=()=>(this._renderTargets.reset(),this._renderTargets.push(this._reflectionRTT),this._renderTargets.push(this._refractionRTT),this._renderTargets),this._imageProcessingConfiguration=this.getScene().imageProcessingConfiguration,this._imageProcessingConfiguration&&(this._imageProcessingObserver=this._imageProcessingConfiguration.onUpdateParameters.add(()=>{this._markAllSubMeshesAsImageProcessingDirty()}))}get refractionTexture(){return this._refractionRTT}get reflectionTexture(){return this._reflectionRTT}addToRenderList(e){this._refractionRTT&&this._refractionRTT.renderList&&this._refractionRTT.renderList.push(e),this._reflectionRTT&&this._reflectionRTT.renderList&&this._reflectionRTT.renderList.push(e)}removeFromRenderList(e){if(this._refractionRTT&&this._refractionRTT.renderList){const t=this._refractionRTT.renderList.indexOf(e);t!==-1&&this._refractionRTT.renderList.splice(t,1)}if(this._reflectionRTT&&this._reflectionRTT.renderList){const t=this._reflectionRTT.renderList.indexOf(e);t!==-1&&this._reflectionRTT.renderList.splice(t,1)}}enableRenderTargets(e){const t=e?1:0;this._refractionRTT&&(this._refractionRTT.refreshRate=t),this._reflectionRTT&&(this._reflectionRTT.refreshRate=t)}getRenderList(){return this._refractionRTT?this._refractionRTT.renderList:[]}get renderTargetsEnabled(){return!(this._refractionRTT&&this._refractionRTT.refreshRate===0)}needAlphaBlending(){return this.alpha<1}needAlphaTesting(){return!1}getAlphaTestTexture(){return null}isReadyForSubMesh(e,t,o){const s=t._drawWrapper;if(this.isFrozen&&s.effect&&s._wasPreviouslyReady&&s._wasPreviouslyUsingInstances===o)return!0;t.materialDefines||(t.materialDefines=new ji);const i=t.materialDefines,r=this.getScene();if(this._isReadyForSubMesh(t))return!0;const u=r.getEngine();if(i._areTexturesDirty&&(i._needUVs=!1,r.texturesEnabled)){if(this.bumpTexture&&P.BumpTextureEnabled)if(this.bumpTexture.isReady())i._needUVs=!0,i.BUMP=!0;else return!1;P.ReflectionTextureEnabled&&(i.REFLECTION=!0)}if(Z(r,u,this,i,!!o),j(e,r,this._useLogarithmicDepth,this.pointsCloud,this.fogEnabled,this.needAlphaTestingForMesh(e),i),i._areMiscDirty&&(i.FRESNELSEPARATE=this._fresnelSeparate,i.BUMPSUPERIMPOSE=this._bumpSuperimpose,i.BUMPAFFECTSREFLECTION=this._bumpAffectsReflection,i.USE_WORLD_COORDINATES=this._useWorldCoordinatesForWaveDeformation),i._needNormals=ie(r,e,i,!0,this._maxSimultaneousLights,this._disableLighting),i._areImageProcessingDirty&&this._imageProcessingConfiguration){if(!this._imageProcessingConfiguration.isReady())return!1;this._imageProcessingConfiguration.prepareDefines(i),i.IS_REFLECTION_LINEAR=this.reflectionTexture!=null&&!this.reflectionTexture.gammaSpace,i.IS_REFRACTION_LINEAR=this.refractionTexture!=null&&!this.refractionTexture.gammaSpace}if(B(e,i,!0,!0),this._mesh=e,this._waitingRenderList){for(let a=0;a<this._waitingRenderList.length;a++)this.addToRenderList(r.getNodeById(this._waitingRenderList[a]));this._waitingRenderList=null}if(i.isDirty){i.markAsProcessed(),r.resetCachedMaterial();const a=new Y;i.FOG&&a.addFallback(1,"FOG"),i.LOGARITHMICDEPTH&&a.addFallback(0,"LOGARITHMICDEPTH"),te(i,a,this.maxSimultaneousLights),i.NUM_BONE_INFLUENCERS>0&&a.addCPUSkinningFallback(0,e);const f=[c.PositionKind];i.NORMAL&&f.push(c.NormalKind),i.UV1&&f.push(c.UVKind),i.UV2&&f.push(c.UV2Kind),i.VERTEXCOLOR&&f.push(c.ColorKind),q(f,e,i,a),K(f,i);const m="water",g=i.toString(),v=["world","view","viewProjection","vEyePosition","vLightsType","vDiffuseColor","vSpecularColor","vFogInfos","vFogColor","pointSize","vNormalInfos","mBones","normalMatrix","logarithmicDepthConstant","reflectionViewProjection","windDirection","waveLength","time","windForce","cameraPosition","bumpHeight","waveHeight","waterColor","waterColor2","colorBlendFactor","colorBlendFactor2","waveSpeed","waveCount"],S=["normalSampler","refractionSampler","reflectionSampler"],T=[];ce&&(ce.PrepareUniforms(v,i),ce.PrepareSamplers(S,i)),G(v),se({uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:i,maxSimultaneousLights:this.maxSimultaneousLights}),t.setEffect(r.getEngine().createEffect(m,{attributes:f,uniformsNames:v,uniformBuffersNames:T,samplers:S,defines:g,fallbacks:a,onCompiled:this.onCompiled,onError:this.onError,indexParameters:{maxSimultaneousLights:this._maxSimultaneousLights}},u),i,this._materialContext)}return!t.effect||!t.effect.isReady()?!1:(i._renderId=r.getRenderId(),s._wasPreviouslyReady=!0,s._wasPreviouslyUsingInstances=!!o,!0)}bindForSubMesh(e,t,o){const s=this.getScene(),i=o.materialDefines;if(!i)return;const r=o.effect;if(!r||!this._mesh)return;this._activeEffect=r,this.bindOnlyWorldMatrix(e),this._activeEffect.setMatrix("viewProjection",s.getTransformMatrix()),Q(t,this._activeEffect),this._mustRebind(s,r,o)&&(this.bumpTexture&&P.BumpTextureEnabled&&(this._activeEffect.setTexture("normalSampler",this.bumpTexture),this._activeEffect.setFloat2("vNormalInfos",this.bumpTexture.coordinatesIndex,this.bumpTexture.level),this._activeEffect.setMatrix("normalMatrix",this.bumpTexture.getTextureMatrix())),z(r,this,s),this.pointsCloud&&this._activeEffect.setFloat("pointSize",this.pointSize),this._useLogarithmicDepth&&M(i,r,s),s.bindEyePosition(r)),this._activeEffect.setColor4("vDiffuseColor",this.diffuseColor,this.alpha*t.visibility),i.SPECULARTERM&&this._activeEffect.setColor4("vSpecularColor",this.specularColor,this.specularPower),s.lightsEnabled&&!this.disableLighting&&re(s,t,this._activeEffect,i,this.maxSimultaneousLights),s.fogEnabled&&t.applyFog&&s.fogMode!==w.FOGMODE_NONE&&this._activeEffect.setMatrix("view",s.getViewMatrix()),H(s,t,this._activeEffect),M(i,this._activeEffect,s),P.ReflectionTextureEnabled&&(this._activeEffect.setTexture("refractionSampler",this._refractionRTT),this._activeEffect.setTexture("reflectionSampler",this._reflectionRTT));const u=this._reflectionTransform.multiply(s.getProjectionMatrix()),a=s.getEngine().getDeltaTime();a!==this._lastDeltaTime&&(this._lastDeltaTime=a,this._lastTime+=this._lastDeltaTime),this._activeEffect.setMatrix("reflectionViewProjection",u),this._activeEffect.setVector2("windDirection",this.windDirection),this._activeEffect.setFloat("waveLength",this.waveLength),this._activeEffect.setFloat("time",this._lastTime/1e5),this._activeEffect.setFloat("windForce",this.windForce),this._activeEffect.setFloat("waveHeight",this.waveHeight),this._activeEffect.setFloat("bumpHeight",this.bumpHeight),this._activeEffect.setColor4("waterColor",this.waterColor,1),this._activeEffect.setFloat("colorBlendFactor",this.colorBlendFactor),this._activeEffect.setColor4("waterColor2",this.waterColor2,1),this._activeEffect.setFloat("colorBlendFactor2",this.colorBlendFactor2),this._activeEffect.setFloat("waveSpeed",this.waveSpeed),this._activeEffect.setFloat("waveCount",this.waveCount),this._imageProcessingConfiguration&&!this._imageProcessingConfiguration.applyByPostProcess&&this._imageProcessingConfiguration.bind(this._activeEffect),this._afterBind(t,this._activeEffect,o)}_createRenderTargets(e,t){this._refractionRTT=new Te(name+"_refraction",{width:t.x,height:t.y},e,!1,!0),this._refractionRTT.wrapU=le.TEXTURE_MIRROR_ADDRESSMODE,this._refractionRTT.wrapV=le.TEXTURE_MIRROR_ADDRESSMODE,this._refractionRTT.ignoreCameraViewport=!0;let o=!1;this._refractionRTT.onBeforeRenderObservable.add(()=>{o=e.getBoundingBoxRenderer().enabled,e.getBoundingBoxRenderer().enabled=!1}),this._refractionRTT.onAfterRenderObservable.add(()=>{e.getBoundingBoxRenderer().enabled=o}),this._reflectionRTT=new Te(name+"_reflection",{width:t.x,height:t.y},e,!1,!0),this._reflectionRTT.wrapU=le.TEXTURE_MIRROR_ADDRESSMODE,this._reflectionRTT.wrapV=le.TEXTURE_MIRROR_ADDRESSMODE,this._reflectionRTT.ignoreCameraViewport=!0;let s,i=null,r;const u=de.Zero();this._refractionRTT.onBeforeRender=()=>{if(this._mesh&&(s=this._mesh.isVisible,this._mesh.isVisible=!1),!this.disableClipPlane){i=e.clipPlane;const a=this._mesh?this._mesh.absolutePosition.y:0;e.clipPlane=_e.FromPositionAndNormal(new X(0,a+.05,0),new X(0,1,0))}},this._refractionRTT.onAfterRender=()=>{this._mesh&&(this._mesh.isVisible=s),this.disableClipPlane||(e.clipPlane=i)},this._reflectionRTT.onBeforeRender=()=>{if(this._mesh&&(s=this._mesh.isVisible,this._mesh.isVisible=!1),!this.disableClipPlane){i=e.clipPlane;const a=this._mesh?this._mesh.absolutePosition.y:0;e.clipPlane=_e.FromPositionAndNormal(new X(0,a-.05,0),new X(0,-1,0)),de.ReflectionToRef(e.clipPlane,u)}r=e.getViewMatrix(),u.multiplyToRef(r,this._reflectionTransform),e.setTransformMatrix(this._reflectionTransform,e.getProjectionMatrix()),e._mirroredCameraPosition=X.TransformCoordinates(e.activeCamera.position,u)},this._reflectionRTT.onAfterRender=()=>{this._mesh&&(this._mesh.isVisible=s),e.clipPlane=i,e.setTransformMatrix(r,e.getProjectionMatrix()),e._mirroredCameraPosition=null}}getAnimatables(){const e=[];return this.bumpTexture&&this.bumpTexture.animations&&this.bumpTexture.animations.length>0&&e.push(this.bumpTexture),this._reflectionRTT&&this._reflectionRTT.animations&&this._reflectionRTT.animations.length>0&&e.push(this._reflectionRTT),this._refractionRTT&&this._refractionRTT.animations&&this._refractionRTT.animations.length>0&&e.push(this._refractionRTT),e}getActiveTextures(){const e=super.getActiveTextures();return this._bumpTexture&&e.push(this._bumpTexture),e}hasTexture(e){return!!(super.hasTexture(e)||this._bumpTexture===e)}dispose(e){this.bumpTexture&&this.bumpTexture.dispose();let t=this.getScene().customRenderTargets.indexOf(this._refractionRTT);t!=-1&&this.getScene().customRenderTargets.splice(t,1),t=-1,t=this.getScene().customRenderTargets.indexOf(this._reflectionRTT),t!=-1&&this.getScene().customRenderTargets.splice(t,1),this._reflectionRTT&&this._reflectionRTT.dispose(),this._refractionRTT&&this._refractionRTT.dispose(),this._imageProcessingConfiguration&&this._imageProcessingObserver&&this._imageProcessingConfiguration.onUpdateParameters.remove(this._imageProcessingObserver),super.dispose(e)}clone(e){return A.Clone(()=>new _(e,this.getScene()),this)}serialize(){const e=super.serialize();if(e.customType="BABYLON.WaterMaterial",e.renderList=[],this._refractionRTT&&this._refractionRTT.renderList)for(let t=0;t<this._refractionRTT.renderList.length;t++)e.renderList.push(this._refractionRTT.renderList[t].id);return e}getClassName(){return"WaterMaterial"}static Parse(e,t,o){const s=A.Parse(()=>new _(e.name,t),e,t,o);return s._waitingRenderList=e.renderList,s}static CreateDefaultMesh(e,t){return ti(e,{width:512,height:512,subdivisions:32,updatable:!1},t)}}n([p("bumpTexture")],_.prototype,"_bumpTexture",void 0);n([d("_markAllSubMeshesAsTexturesDirty")],_.prototype,"bumpTexture",void 0);n([N()],_.prototype,"diffuseColor",void 0);n([N()],_.prototype,"specularColor",void 0);n([l()],_.prototype,"specularPower",void 0);n([l("disableLighting")],_.prototype,"_disableLighting",void 0);n([d("_markAllSubMeshesAsLightsDirty")],_.prototype,"disableLighting",void 0);n([l("maxSimultaneousLights")],_.prototype,"_maxSimultaneousLights",void 0);n([d("_markAllSubMeshesAsLightsDirty")],_.prototype,"maxSimultaneousLights",void 0);n([l()],_.prototype,"windForce",void 0);n([ei()],_.prototype,"windDirection",void 0);n([l()],_.prototype,"waveHeight",void 0);n([l()],_.prototype,"bumpHeight",void 0);n([l("bumpSuperimpose")],_.prototype,"_bumpSuperimpose",void 0);n([d("_markAllSubMeshesAsMiscDirty")],_.prototype,"bumpSuperimpose",void 0);n([l("fresnelSeparate")],_.prototype,"_fresnelSeparate",void 0);n([d("_markAllSubMeshesAsMiscDirty")],_.prototype,"fresnelSeparate",void 0);n([l("bumpAffectsReflection")],_.prototype,"_bumpAffectsReflection",void 0);n([d("_markAllSubMeshesAsMiscDirty")],_.prototype,"bumpAffectsReflection",void 0);n([N()],_.prototype,"waterColor",void 0);n([l()],_.prototype,"colorBlendFactor",void 0);n([N()],_.prototype,"waterColor2",void 0);n([l()],_.prototype,"colorBlendFactor2",void 0);n([l()],_.prototype,"waveLength",void 0);n([l()],_.prototype,"waveSpeed",void 0);n([l()],_.prototype,"waveCount",void 0);n([l()],_.prototype,"disableClipPlane",void 0);n([l("useWorldCoordinatesForWaveDeformation")],_.prototype,"_useWorldCoordinatesForWaveDeformation",void 0);n([d("_markAllSubMeshesAsMiscDirty")],_.prototype,"useWorldCoordinatesForWaveDeformation",void 0);D("BABYLON.WaterMaterial",_);export{y as G};
