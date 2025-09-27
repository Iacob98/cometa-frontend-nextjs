module.exports=[18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},20635,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/action-async-storage.external.js",()=>require("next/dist/server/app-render/action-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},61724,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-route-turbo.runtime.prod.js"))},49959,(e,t,r)=>{},70706,e=>{"use strict";e.s(["handler",()=>j,"patchFetch",()=>E,"routeModule",()=>w,"serverHooks",()=>b,"workAsyncStorage",()=>R,"workUnitAsyncStorage",()=>q],70706);var t=e.i(47909),r=e.i(74017),n=e.i(96250),a=e.i(59756),o=e.i(61916),s=e.i(69741),i=e.i(16795),l=e.i(87718),u=e.i(95169),d=e.i(47587),c=e.i(66012),p=e.i(70101),m=e.i(26937),_=e.i(10372),h=e.i(93695);e.i(52474);var x=e.i(220);e.s(["GET",()=>v],87081);var g=e.i(89171);let y=(0,e.i(87464).createClient)("https://oijmohlhdxoawzvctnxx.supabase.co","eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pam1vaGxoZHhvYXd6dmN0bnh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyODUzMjcsImV4cCI6MjA3MDg2MTMyN30.vw9G5hcSfd-m5AZqeGlmzGvqc9ImYioDFR-AsiHoFro");async function v(e){try{let{searchParams:t}=new URL(e.url),r=t.get("project_id"),n=t.get("start_date"),a=t.get("end_date"),o=t.get("period")||"month",{data:s,error:i}=await y.from("equipment").select(`
        id,
        name,
        type,
        inventory_no,
        status,
        rental_cost_per_day,
        purchase_date,
        warranty_until,
        description,
        is_active,
        created_at
      `).eq("is_active",!0);if(i)return console.error("Supabase equipment query error:",i),g.NextResponse.json({error:"Failed to fetch equipment data"},{status:500});let l=y.from("equipment_assignments").select(`
        id,
        equipment_id,
        project_id,
        crew_id,
        user_id,
        from_ts,
        to_ts,
        is_permanent,
        rental_cost_per_day,
        notes,
        created_at,
        equipment:equipment(
          id,
          name,
          type,
          inventory_no,
          rental_cost_per_day
        ),
        project:projects(
          id,
          name,
          city
        ),
        crew:crews(
          id,
          name
        ),
        user:users(
          id,
          first_name,
          last_name,
          email
        )
      `);r&&(l=l.eq("project_id",r)),n&&a?l=l.gte("from_ts",n).lte("from_ts",a):n?l=l.gte("from_ts",n):a&&(l=l.lte("from_ts",a));let{data:u,error:d}=await l;if(d)return console.error("Supabase assignments query error:",d),g.NextResponse.json({error:"Failed to fetch assignments data"},{status:500});let{data:c,error:p}=await y.from("equipment_maintenance").select(`
        id,
        equipment_id,
        maintenance_type,
        description,
        cost,
        date,
        next_maintenance_date,
        performed_by,
        created_at,
        equipment:equipment(
          id,
          name,
          type,
          inventory_no
        )
      `);p&&console.error("Supabase maintenance query error:",p);let m=s?.length||0,_=u?.length||0,h=c?.length||0,x=(s||[]).reduce((e,t)=>{let r=t.status||"available";return e[r]=(e[r]||0)+1,e},{}),v=(s||[]).reduce((e,t)=>{let r=t.type||"other";return e[r]=(e[r]||0)+1,e},{}),f=new Date,w=(u||[]).filter(e=>{let t=new Date(e.from_ts),r=e.to_ts?new Date(e.to_ts):null;return t<=f&&(!r||r>f)}),R=new Set(w.map(e=>e.equipment_id)),q=m>0?(R.size/m*100).toFixed(2):0,b=(s||[]).reduce((e,t)=>e+(Number(t.rental_cost_per_day)||0),0),E=m>0?b/m:0,j=(u||[]).map(e=>{let t=new Date(e.from_ts),r=e.to_ts?new Date(e.to_ts):new Date,n=Math.ceil((r.getTime()-t.getTime())/864e5);return{...e,duration_days:n,daily_cost:Number(e.rental_cost_per_day)||Number(e.equipment?.rental_cost_per_day)||0,total_cost:n*(Number(e.rental_cost_per_day)||Number(e.equipment?.rental_cost_per_day)||0)}}),C=j.reduce((e,t)=>e+t.total_cost,0),N=j.length>0?j.reduce((e,t)=>e+t.duration_days,0)/j.length:0,A={};(u||[]).forEach(e=>{let t=e.project_id;A[t]||(A[t]={project_id:t,project_name:e.project?.name||"Unknown Project",project_city:e.project?.city||"",equipment_count:new Set,assignment_count:0,total_rental_cost:0}),A[t].equipment_count.add(e.equipment_id),A[t].assignment_count+=1,A[t].total_rental_cost+=j.find(t=>t.id===e.id)?.total_cost||0});let I=Object.values(A).map(e=>({...e,equipment_count:e.equipment_count.size})),O={};(u||[]).forEach(e=>{let t=e.equipment_id;O[t]||(O[t]={equipment_id:t,equipment_name:e.equipment?.name||"Unknown Equipment",equipment_type:e.equipment?.type||"",inventory_no:e.equipment?.inventory_no||"",assignment_count:0,total_days:0,total_cost:0});let r=j.find(t=>t.id===e.id);r&&(O[t].assignment_count+=1,O[t].total_days+=r.duration_days,O[t].total_cost+=r.total_cost)});let S=Object.values(O).sort((e,t)=>t.assignment_count-e.assignment_count).slice(0,10),T=new Date().getFullYear(),D=Array.from({length:12},(e,t)=>{let r=t+1,n=(u||[]).filter(e=>{let t=new Date(e.from_ts);return t.getFullYear()===T&&t.getMonth()+1===r}),a=(c||[]).filter(e=>{let t=new Date(e.date);return t.getFullYear()===T&&t.getMonth()+1===r}),o=n.reduce((e,t)=>{let r=j.find(e=>e.id===t.id);return e+(r?.total_cost||0)},0),s=a.reduce((e,t)=>e+(Number(t.cost)||0),0);return{month:r,monthName:new Date(T,t,1).toLocaleString("en",{month:"long"}),assignments:n.length,maintenance_records:a.length,rental_costs:o,maintenance_costs:s,total_costs:o+s}}),M={total_maintenance:h,completed:0,scheduled:h,overdue:(c||[]).filter(e=>new Date(e.date)<f).length,total_maintenance_cost:(c||[]).reduce((e,t)=>e+(Number(t.cost)||0),0)};return g.NextResponse.json({summary:{total_equipment:m,total_assignments:_,active_assignments:w.length,utilization_rate:Number(q),total_rental_value:b,average_rental_cost:Math.round(100*E)/100,total_rental_costs:Math.round(100*C)/100,average_assignment_duration:Math.round(10*N)/10},distributions:{status:Object.entries(x).map(([e,t])=>({status:e,count:t,percentage:m>0?(t/m*100).toFixed(2):0})),type:Object.entries(v).map(([e,t])=>({type:e,count:t,percentage:m>0?(t/m*100).toFixed(2):0}))},project_distribution:I,top_used_equipment:S,monthly_trends:D,maintenance:M,filters:{project_id:r,start_date:n,end_date:a,period:o}})}catch(e){return console.error("Equipment analytics API error:",e),g.NextResponse.json({error:"Internal server error",details:e instanceof Error?e.message:"Unknown error"},{status:500})}}var f=e.i(87081);let w=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/equipment/analytics/route",pathname:"/api/equipment/analytics",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/src/app/api/equipment/analytics/route.ts",nextConfigOutput:"",userland:f}),{workAsyncStorage:R,workUnitAsyncStorage:q,serverHooks:b}=w;function E(){return(0,n.patchFetch)({workAsyncStorage:R,workUnitAsyncStorage:q})}async function j(e,t,n){var g;let y="/api/equipment/analytics/route";y=y.replace(/\/index$/,"")||"/";let v=await w.prepare(e,t,{srcPage:y,multiZoneDraftMode:!1});if(!v)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:f,params:R,nextConfig:q,isDraftMode:b,prerenderManifest:E,routerServerContext:j,isOnDemandRevalidate:C,revalidateOnlyGenerated:N,resolvedPathname:A}=v,I=(0,s.normalizeAppPath)(y),O=!!(E.dynamicRoutes[I]||E.routes[A]);if(O&&!b){let e=!!E.routes[A],t=E.dynamicRoutes[I];if(t&&!1===t.fallback&&!e)throw new h.NoFallbackError}let S=null;!O||w.isDev||b||(S="/index"===(S=A)?"/":S);let T=!0===w.isDev||!O,D=O&&!T,M=e.method||"GET",k=(0,o.getTracer)(),P=k.getActiveScopeSpan(),U={params:R,prerenderManifest:E,renderOpts:{experimental:{cacheComponents:!!q.experimental.cacheComponents,authInterrupts:!!q.experimental.authInterrupts},supportsDynamicResponse:T,incrementalCache:(0,a.getRequestMeta)(e,"incrementalCache"),cacheLifeProfiles:null==(g=q.experimental)?void 0:g.cacheLife,isRevalidate:D,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n)=>w.onRequestError(e,t,n,j)},sharedContext:{buildId:f}},F=new i.NodeNextRequest(e),H=new i.NodeNextResponse(t),z=l.NextRequestAdapter.fromNodeNextRequest(F,(0,l.signalFromNodeResponse)(t));try{let s=async r=>w.handle(z,U).finally(()=>{if(!r)return;r.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let n=k.getRootSpanAttributes();if(!n)return;if(n.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${n.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let a=n.get("next.route");if(a){let e=`${M} ${a}`;r.setAttributes({"next.route":a,"http.route":a,"next.span_name":e}),r.updateName(e)}else r.updateName(`${M} ${e.url}`)}),i=async o=>{var i,l;let u=async({previousCacheEntry:r})=>{try{if(!(0,a.getRequestMeta)(e,"minimalMode")&&C&&N&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let i=await s(o);e.fetchMetrics=U.renderOpts.fetchMetrics;let l=U.renderOpts.pendingWaitUntil;l&&n.waitUntil&&(n.waitUntil(l),l=void 0);let u=U.renderOpts.collectedTags;if(!O)return await (0,c.sendResponse)(F,H,i,U.renderOpts.pendingWaitUntil),null;{let e=await i.blob(),t=(0,p.toNodeOutgoingHttpHeaders)(i.headers);u&&(t[_.NEXT_CACHE_TAGS_HEADER]=u),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==U.renderOpts.collectedRevalidate&&!(U.renderOpts.collectedRevalidate>=_.INFINITE_CACHE)&&U.renderOpts.collectedRevalidate,n=void 0===U.renderOpts.collectedExpire||U.renderOpts.collectedExpire>=_.INFINITE_CACHE?void 0:U.renderOpts.collectedExpire;return{value:{kind:x.CachedRouteKind.APP_ROUTE,status:i.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await w.onRequestError(e,t,{routerKind:"App Router",routePath:y,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isRevalidate:D,isOnDemandRevalidate:C})},j),t}},h=await w.handleResponse({req:e,nextConfig:q,cacheKey:S,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:E,isRoutePPREnabled:!1,isOnDemandRevalidate:C,revalidateOnlyGenerated:N,responseGenerator:u,waitUntil:n.waitUntil});if(!O)return null;if((null==h||null==(i=h.value)?void 0:i.kind)!==x.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==h||null==(l=h.value)?void 0:l.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,a.getRequestMeta)(e,"minimalMode")||t.setHeader("x-nextjs-cache",C?"REVALIDATED":h.isMiss?"MISS":h.isStale?"STALE":"HIT"),b&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let g=(0,p.fromNodeOutgoingHttpHeaders)(h.value.headers);return(0,a.getRequestMeta)(e,"minimalMode")&&O||g.delete(_.NEXT_CACHE_TAGS_HEADER),!h.cacheControl||t.getHeader("Cache-Control")||g.get("Cache-Control")||g.set("Cache-Control",(0,m.getCacheControlHeader)(h.cacheControl)),await (0,c.sendResponse)(F,H,new Response(h.value.body,{headers:g,status:h.value.status||200})),null};P?await i(P):await k.withPropagatedContext(e.headers,()=>k.trace(u.BaseServerSpan.handleRequest,{spanName:`${M} ${e.url}`,kind:o.SpanKind.SERVER,attributes:{"http.method":M,"http.target":e.url}},i))}catch(t){if(P||t instanceof h.NoFallbackError||await w.onRequestError(e,t,{routerKind:"App Router",routePath:I,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isRevalidate:D,isOnDemandRevalidate:C})}),O)throw t;return await (0,c.sendResponse)(F,H,new Response(null,{status:500})),null}}},36145,e=>{e.v(e=>Promise.resolve().then(()=>e(2808)))}];

//# sourceMappingURL=%5Broot-of-the-server%5D__09ffdce2._.js.map