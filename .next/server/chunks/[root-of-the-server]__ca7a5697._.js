module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},61724,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js"))},92449,(e,t,r)=>{},66510,e=>{"use strict";e.s(["handler",()=>b,"patchFetch",()=>C,"routeModule",()=>w,"serverHooks",()=>T,"workAsyncStorage",()=>y,"workUnitAsyncStorage",()=>E],66510);var t=e.i(47909),r=e.i(74017),n=e.i(96250),a=e.i(59756),o=e.i(61916),s=e.i(69741),i=e.i(16795),d=e.i(87718),l=e.i(95169),u=e.i(47587),p=e.i(66012),c=e.i(70101),x=e.i(26937),R=e.i(10372),h=e.i(93695);e.i(52474);var v=e.i(220);e.s(["GET",()=>g],84443);var m=e.i(89171);async function g(e,{params:t}){try{let{id:e,documentId:r}=await t;if(!e||!r)return m.NextResponse.json({error:"User ID and Document ID are required"},{status:400});let n=`%PDF-1.4
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
/Length 110
>>
stream
BT
/F1 16 Tf
100 700 Td
(Документ работника) Tj
0 -30 Td
/F1 12 Tf
(ID документа: ${r}) Tj
0 -20 Td
(ID работника: ${e}) Tj
0 -20 Td
(Режим просмотра) Tj
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
0000000455 00000 n
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
522
%%EOF`;return new Response(n,{status:200,headers:{"Content-Type":"application/pdf","Content-Disposition":`inline; filename="document-${r}-view.pdf"`,"Content-Length":n.length.toString()}})}catch(e){return console.error("Document view API error:",e),m.NextResponse.json({error:"Failed to view document"},{status:500})}}var f=e.i(84443);let w=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/users/[id]/documents/[documentId]/view/route",pathname:"/api/users/[id]/documents/[documentId]/view",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/users/[id]/documents/[documentId]/view/route.ts",nextConfigOutput:"",userland:f}),{workAsyncStorage:y,workUnitAsyncStorage:E,serverHooks:T}=w;function C(){return(0,n.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:E})}async function b(e,t,n){var m;let g="/api/users/[id]/documents/[documentId]/view/route";g=g.replace(/\/index$/,"")||"/";let f=await w.prepare(e,t,{srcPage:g,multiZoneDraftMode:!1});if(!f)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:y,params:E,nextConfig:T,isDraftMode:C,prerenderManifest:b,routerServerContext:j,isOnDemandRevalidate:A,revalidateOnlyGenerated:P,resolvedPathname:N}=f,q=(0,s.normalizeAppPath)(g),I=!!(b.dynamicRoutes[q]||b.routes[N]);if(I&&!C){let e=!!b.routes[N],t=b.dynamicRoutes[q];if(t&&!1===t.fallback&&!e)throw new h.NoFallbackError}let O=null;!I||w.isDev||C||(O="/index"===(O=N)?"/":O);let S=!0===w.isDev||!I,k=I&&!S,D=e.method||"GET",_=(0,o.getTracer)(),F=_.getActiveScopeSpan(),H={params:E,prerenderManifest:b,renderOpts:{experimental:{cacheComponents:!!T.experimental.cacheComponents,authInterrupts:!!T.experimental.authInterrupts},supportsDynamicResponse:S,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:null==(m=T.experimental)?void 0:m.cacheLife,isRevalidate:k,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n)=>w.onRequestError(e,t,n,j)},sharedContext:{buildId:y}},U=new i.NodeNextRequest(e),M=new i.NodeNextResponse(t),$=d.NextRequestAdapter.fromNodeNextRequest(U,(0,d.signalFromNodeResponse)(t));try{let s=async r=>w.handle($,H).finally(()=>{if(!r)return;r.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let n=_.getRootSpanAttributes();if(!n)return;if(n.get("next.span_type")!==l.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${n.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=n.get("next.route");if(a){let e=`${D} ${a}`;r.setAttributes({"next.route":a,"http.route":a,"next.span_name":e}),r.updateName(e)}else r.updateName(`${D} ${e.url}`)}),i=async o=>{var i,d;let l=async({previousCacheEntry:r})=>{try{if(!(0,a.getRequestMeta)(e,"minimalMode")&&A&&P&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(o);e.fetchMetrics=H.renderOpts.fetchMetrics;let d=H.renderOpts.pendingWaitUntil;d&&n.waitUntil&&(n.waitUntil(d),d=void 0);let l=H.renderOpts.collectedTags;if(!I)return await (0,p.sendResponse)(U,M,i,H.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,c.toNodeOutgoingHttpHeaders)(i.headers);l&&(t[R.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==H.renderOpts.collectedRevalidate&&!(H.renderOpts.collectedRevalidate>=R.INFINITE_CACHE)&&H.renderOpts.collectedRevalidate,n=void 0===H.renderOpts.collectedExpire||H.renderOpts.collectedExpire>=R.INFINITE_CACHE?void 0:H.renderOpts.collectedExpire;return{value:{kind:v.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await w.onRequestError(e,t,{routerKind:"App Router",routePath:g,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isRevalidate:k,isOnDemandRevalidate:A})},j),t}},h=await w.handleResponse({req:e,nextConfig:T,cacheKey:O,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:A,revalidateOnlyGenerated:P,responseGenerator:l,waitUntil:n.waitUntil});if(!I)return null;if((null==h||null==(i=h.value)?void 0:i.kind)!==v.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==h||null==(d=h.value)?void 0:d.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,a.getRequestMeta)(e,"minimalMode")||t.setHeader("x-nextjs-cache",A?"REVALIDATED":h.isMiss?"MISS":h.isStale?"STALE":"HIT"),C&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,c.fromNodeOutgoingHttpHeaders)(h.value.headers);return(0,a.getRequestMeta)(e,"minimalMode")&&I||m.delete(R.NEXT_CACHE_TAGS_HEADER),!h.cacheControl||t.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,x.getCacheControlHeader)(h.cacheControl)),await (0,p.sendResponse)(U,M,new Response(h.value.body,{headers:m,status:h.value.status||200})),null};F?await i(F):await _.withPropagatedContext(e.headers,()=>_.trace(l.BaseServerSpan.handleRequest,{spanName:`${D} ${e.url}`,kind:o.SpanKind.SERVER,attributes:{"http.method":D,"http.target":e.url}},i))}catch(t){if(F||t instanceof h.NoFallbackError||await w.onRequestError(e,t,{routerKind:"App Router",routePath:q,routeType:"route",revalidateReason:(0,u.getRevalidateReason)({isRevalidate:k,isOnDemandRevalidate:A})}),I)throw t;return await (0,p.sendResponse)(U,M,new Response(null,{status:500})),null}}}];

//# sourceMappingURL=%5Broot-of-the-server%5D__ca7a5697._.js.map