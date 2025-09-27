module.exports=[18622,(e,t,n)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,n)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,n)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(e,t,n)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,t,n)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,n)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,n)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},61724,(e,t,n)=>{t.exports=e.x("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js"))},92003,e=>{"use strict";e.s(["deleteDocument",()=>i,"getDocument",()=>a,"getFile",()=>s,"getUserDocuments",()=>l,"storeDocument",()=>r,"storeFile",()=>o]);let t={},n={};function r(e,n){t[e]||(t[e]=[]),t[e].push(n),console.log("📝 Document stored:",{userId:e,documentId:n.id,fileName:n.file_name,totalUserDocs:t[e].length})}function o(e,t){n[e]=t,console.log("💾 File stored:",{documentId:e,fileSize:t.length,totalFiles:Object.keys(n).length})}function a(e,n){let r=t[e]||[],o=r.find(e=>e.id===n);return console.log("🔍 Get document:",{userId:e,documentId:n,totalUserDocs:r.length,found:!!o,fileName:o?.file_name}),o}function s(e){let t=n[e];return console.log("🔍 Get file:",{documentId:e,totalFiles:Object.keys(n).length,found:!!t,fileSize:t?.length}),t}function i(e,r){let o=t[e]||[],a=o.findIndex(e=>e.id===r);if(-1!==a){let e=o.splice(a,1)[0];return delete n[r],e}return null}function l(e){return t[e]||[]}},43896,(e,t,n)=>{},70473,e=>{"use strict";e.s(["handler",()=>T,"patchFetch",()=>j,"routeModule",()=>y,"serverHooks",()=>b,"workAsyncStorage",()=>C,"workUnitAsyncStorage",()=>E],70473);var t=e.i(47909),n=e.i(74017),r=e.i(96250),o=e.i(59756),a=e.i(61916),s=e.i(69741),i=e.i(16795),l=e.i(87718),d=e.i(95169),u=e.i(47587),c=e.i(66012),p=e.i(70101),m=e.i(26937),x=e.i(10372),h=e.i(93695);e.i(52474);var f=e.i(220);e.s(["GET",()=>v],16686);var g=e.i(89171),R=e.i(92003);async function v(e,{params:t}){try{let{id:e,documentId:n}=await t;if(!e||!n)return g.NextResponse.json({error:"User ID and Document ID are required"},{status:400});let r=(0,R.getFile)(n),o=(0,R.getDocument)(e,n);if(console.log("🔍 Download Debug:",{userId:e,documentId:n,hasFileContent:!!r,hasDocument:!!o,documentFileName:o?.file_name}),r&&o)return new Response(r,{status:200,headers:{"Content-Type":o.file_type||"application/octet-stream","Content-Disposition":`attachment; filename="${o.file_name}"`,"Content-Length":r.length.toString()}});let a=`%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/ProcSet [/PDF /Text]
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
100 700 Td
(Mock Document Content) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000053 00000 n
0000000110 00000 n
0000000297 00000 n
0000000389 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;return new Response(a,{status:200,headers:{"Content-Type":"application/pdf","Content-Disposition":`attachment; filename="document-${n}.pdf"`,"Content-Length":a.length.toString()}})}catch(e){return console.error("Document download API error:",e),g.NextResponse.json({error:"Failed to download document"},{status:500})}}var w=e.i(16686);let y=new t.AppRouteRouteModule({definition:{kind:n.RouteKind.APP_ROUTE,page:"/api/users/[id]/documents/[documentId]/download/route",pathname:"/api/users/[id]/documents/[documentId]/download",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/users/[id]/documents/[documentId]/download/route.ts",nextConfigOutput:"",userland:w}),{workAsyncStorage:C,workUnitAsyncStorage:E,serverHooks:b}=y;function j(){return(0,r.patchFetch)({workAsyncStorage:C,workUnitAsyncStorage:E})}async function T(e,t,r){var g;let R="/api/users/[id]/documents/[documentId]/download/route";R=R.replace(/\/index$/,"")||"/";let v=await y.prepare(e,t,{srcPage:R,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==r.waitUntil||r.waitUntil.call(r,Promise.resolve()),null;let{buildId:w,params:C,nextConfig:E,isDraftMode:b,prerenderManifest:j,routerServerContext:T,isOnDemandRevalidate:D,revalidateOnlyGenerated:A,resolvedPathname:P}=v,N=(0,s.normalizeAppPath)(R),F=!!(j.dynamicRoutes[N]||j.routes[P]);if(F&&!b){let e=!!j.routes[P],t=j.dynamicRoutes[N];if(t&&!1===t.fallback&&!e)throw new h.NoFallbackError}let S=null;!F||y.isDev||b||(S="/index"===(S=P)?"/":S);let _=!0===y.isDev||!F,k=F&&!_,I=e.method||"GET",O=(0,a.getTracer)(),q=O.getActiveScopeSpan(),U={params:C,prerenderManifest:j,renderOpts:{experimental:{cacheComponents:!!E.experimental.cacheComponents,authInterrupts:!!E.experimental.authInterrupts},supportsDynamicResponse:_,incrementalCache:(0,o.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:null==(g=E.experimental)?void 0:g.cacheLife,isRevalidate:k,waitUntil:r.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,n,r)=>y.onRequestError(e,t,r,T)},sharedContext:{buildId:w}},H=new i.NodeNextRequest(e),M=new i.NodeNextResponse(t),$=l.NextRequestAdapter.fromNodeNextRequest(H,(0,l.signalFromNodeResponse)(t));try{let s=async n=>y.handle($,U).finally(()=>{if(!n)return;n.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=O.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==d.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let o=r.get("next.route");if(o){let e=`${I} ${o}`;n.setAttributes({"next.route":o,"http.route":o,"next.span_name":e}),n.updateName(e)}else n.updateName(`${I} ${e.url}`)}),i=async a=>{var i,l;let d=async({previousCacheEntry:n})=>{try{if(!(0,o.getRequestMeta)(e,"minimalMode")&&D&&A&&!n)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(a);e.fetchMetrics=U.renderOpts.fetchMetrics;let l=U.renderOpts.pendingWaitUntil;l&&r.waitUntil&&(r.waitUntil(l),l=void 0);let d=U.renderOpts.collectedTags;if(!F)return await (0,c.sendResponse)(H,M,i,U.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(i.headers);d&&(t[x.NEXT_CACHE_TAGS_HEADER]=d),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let n=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=x.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,r=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=x.INFINITE_CACHE?void 0:U.renderOpts.collectedExpire;return{value:{kind:f.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:n,expire:r}}}}catch(t){throw(null==n?void 0:n.isStale)&&await y.onRequestError(e,t,{routerKind:"App Router",routePath:R,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isRevalidate:k,isOnDemandRevalidate:D})},T),t}},h=await y.handleResponse({req:e,nextConfig:E,cacheKey:S,routeKind:n.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:j,isRoutePPREnabled:!1,isOnDemandRevalidate:D,revalidateOnlyGenerated:A,responseGenerator:d,waitUntil:r.waitUntil});if(!F)return null;if((null==h||null==(i=h.value)?void 0:i.kind)!==f.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==h||null==(l=h.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,o.getRequestMeta)(e,"minimalMode")||t.setHeader("x-nextjs-cache",D?"REVALIDATED":h.isMiss?"MISS":h.isStale?"STALE":"HIT"),b&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let g=(0,p.fromNodeOutgoingHttpHeaders)(h.value.headers);return(0,o.getRequestMeta)(e,"minimalMode")&&F||g.delete(x.NEXT_CACHE_TAGS_HEADER),!h.cacheControl||t.getHeader("Cache-Control")||g.get("Cache-Control")||g.set("Cache-Control",(0,m.getCacheControlHeader)(h.cacheControl)),await (0,c.sendResponse)(H,M,new Response(h.value.body,{headers:g,status:h.value.status||200})),null};q?await i(q):await O.withPropagatedContext(e.headers,()=>O.trace(d.BaseServerSpan.handleRequest,{spanName:`${I} ${e.url}`,kind:a.SpanKind.SERVER,attributes:{"http.method":I,"http.target":e.url}},i))}catch(t){if(q||t instanceof h.NoFallbackError||await y.onRequestError(e,t,{routerKind:"App Router",routePath:N,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isRevalidate:k,isOnDemandRevalidate:D})}),F)throw t;return await (0,c.sendResponse)(H,M,new Response(null,{status:500})),null}}}];

//# sourceMappingURL=%5Broot-of-the-server%5D__0473b4ac._.js.map