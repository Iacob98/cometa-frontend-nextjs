(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/maps/feature-layer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FeatureLayer",
    ()=>FeatureLayer,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Popup.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Polyline.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polygon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Polygon.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
// Custom marker icons for different entity types
const createCustomIcon = function(entityType) {
    let isSelected = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    const color = isSelected ? "#ef4444" : getEntityColor(entityType);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        html: '<div style="\n      background-color: '.concat(color, ';\n      width: 12px;\n      height: 12px;\n      border: 2px solid white;\n      border-radius: 50%;\n      box-shadow: 0 1px 3px rgba(0,0,0,0.3);\n    "></div>'),
        className: "custom-marker",
        iconSize: [
            16,
            16
        ],
        iconAnchor: [
            8,
            8
        ]
    });
};
const getEntityColor = (entityType)=>{
    switch(entityType){
        case "project":
            return "#3b82f6"; // blue
        case "cabinet":
            return "#10b981"; // green
        case "segment":
            return "#f59e0b"; // orange
        case "cut":
            return "#ef4444"; // red
        case "work_entry":
            return "#8b5cf6"; // purple
        case "house":
            return "#06b6d4"; // cyan
        case "measurement":
            return "#84cc16"; // lime
        default:
            return "#6b7280"; // gray
    }
};
function FeatureLayer(param) {
    let { features, onFeatureClick, onFeatureEdit, editable = false, selectedFeatureId } = param;
    var _groupedFeatures_Point, _groupedFeatures_LineString, _groupedFeatures_Polygon;
    _s();
    const map = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"])();
    // Group features by geometry type for better performance
    const groupedFeatures = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FeatureLayer.useMemo[groupedFeatures]": ()=>{
            return features.reduce({
                "FeatureLayer.useMemo[groupedFeatures]": (acc, feature)=>{
                    const type = feature.geometry.type;
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(feature);
                    return acc;
                }
            }["FeatureLayer.useMemo[groupedFeatures]"], {});
        }
    }["FeatureLayer.useMemo[groupedFeatures]"], [
        features
    ]);
    // Auto-fit map to features bounds
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "FeatureLayer.useEffect": ()=>{
            if (features.length > 0) {
                const bounds = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].latLngBounds([]);
                features.forEach({
                    "FeatureLayer.useEffect": (feature)=>{
                        const { geometry } = feature;
                        if (geometry.type === "Point") {
                            const point = geometry;
                            bounds.extend([
                                point.coordinates[1],
                                point.coordinates[0]
                            ]);
                        } else if (geometry.type === "LineString") {
                            const line = geometry;
                            line.coordinates.forEach({
                                "FeatureLayer.useEffect": (param)=>{
                                    let [lng, lat] = param;
                                    bounds.extend([
                                        lat,
                                        lng
                                    ]);
                                }
                            }["FeatureLayer.useEffect"]);
                        } else if (geometry.type === "Polygon") {
                            const polygon = geometry;
                            polygon.coordinates[0].forEach({
                                "FeatureLayer.useEffect": (param)=>{
                                    let [lng, lat] = param;
                                    bounds.extend([
                                        lat,
                                        lng
                                    ]);
                                }
                            }["FeatureLayer.useEffect"]);
                        }
                    }
                }["FeatureLayer.useEffect"]);
                if (bounds.isValid()) {
                    map.fitBounds(bounds, {
                        padding: [
                            20,
                            20
                        ]
                    });
                }
            }
        }
    }["FeatureLayer.useEffect"], [
        features,
        map
    ]);
    const handleFeatureClick = (feature)=>{
        if (onFeatureClick) {
            onFeatureClick(feature);
        }
    };
    const renderFeaturePopup = (feature)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "font-semibold text-sm",
                        children: feature.entity_type.charAt(0).toUpperCase() + feature.entity_type.slice(1)
                    }, void 0, false, {
                        fileName: "[project]/src/components/maps/feature-layer.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    feature.properties && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-xs space-y-1",
                        children: Object.entries(feature.properties).map((param)=>{
                            let [key, value] = param;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-medium",
                                        children: [
                                            key,
                                            ":"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/feature-layer.tsx",
                                        lineNumber: 121,
                                        columnNumber: 17
                                    }, this),
                                    " ",
                                    String(value)
                                ]
                            }, key, true, {
                                fileName: "[project]/src/components/maps/feature-layer.tsx",
                                lineNumber: 120,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/maps/feature-layer.tsx",
                        lineNumber: 118,
                        columnNumber: 11
                    }, this),
                    editable && onFeatureEdit && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>onFeatureEdit(feature),
                        className: "text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600",
                        children: "Edit"
                    }, void 0, false, {
                        fileName: "[project]/src/components/maps/feature-layer.tsx",
                        lineNumber: 127,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/maps/feature-layer.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/maps/feature-layer.tsx",
            lineNumber: 112,
            columnNumber: 5
        }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            (_groupedFeatures_Point = groupedFeatures.Point) === null || _groupedFeatures_Point === void 0 ? void 0 : _groupedFeatures_Point.map((feature)=>{
                const point = feature.geometry;
                const [lng, lat] = point.coordinates;
                const isSelected = feature.id === selectedFeatureId;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                    position: [
                        lat,
                        lng
                    ],
                    icon: createCustomIcon(feature.entity_type, isSelected),
                    eventHandlers: {
                        click: ()=>handleFeatureClick(feature)
                    },
                    children: renderFeaturePopup(feature)
                }, feature.id, false, {
                    fileName: "[project]/src/components/maps/feature-layer.tsx",
                    lineNumber: 147,
                    columnNumber: 11
                }, this);
            }),
            (_groupedFeatures_LineString = groupedFeatures.LineString) === null || _groupedFeatures_LineString === void 0 ? void 0 : _groupedFeatures_LineString.map((feature)=>{
                const line = feature.geometry;
                const positions = line.coordinates.map((param)=>{
                    let [lng, lat] = param;
                    return [
                        lat,
                        lng
                    ];
                });
                const isSelected = feature.id === selectedFeatureId;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                    positions: positions,
                    color: getEntityColor(feature.entity_type),
                    weight: isSelected ? 5 : 3,
                    opacity: 0.8,
                    eventHandlers: {
                        click: ()=>handleFeatureClick(feature)
                    },
                    children: renderFeaturePopup(feature)
                }, feature.id, false, {
                    fileName: "[project]/src/components/maps/feature-layer.tsx",
                    lineNumber: 167,
                    columnNumber: 11
                }, this);
            }),
            (_groupedFeatures_Polygon = groupedFeatures.Polygon) === null || _groupedFeatures_Polygon === void 0 ? void 0 : _groupedFeatures_Polygon.map((feature)=>{
                const polygon = feature.geometry;
                const positions = polygon.coordinates[0].map((param)=>{
                    let [lng, lat] = param;
                    return [
                        lat,
                        lng
                    ];
                });
                const isSelected = feature.id === selectedFeatureId;
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polygon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polygon"], {
                    positions: positions,
                    color: getEntityColor(feature.entity_type),
                    weight: isSelected ? 3 : 2,
                    fillOpacity: 0.3,
                    eventHandlers: {
                        click: ()=>handleFeatureClick(feature)
                    },
                    children: renderFeaturePopup(feature)
                }, feature.id, false, {
                    fileName: "[project]/src/components/maps/feature-layer.tsx",
                    lineNumber: 189,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true);
}
_s(FeatureLayer, "2C4r5vtwtSkj+PcFE74G/A7iljw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMap"]
    ];
});
_c = FeatureLayer;
const __TURBOPACK__default__export__ = FeatureLayer;
var _c;
__turbopack_context__.k.register(_c, "FeatureLayer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/maps/feature-layer.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/maps/feature-layer.tsx [app-client] (ecmascript)"));
}),
"[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Marker",
    ()=>Marker
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/element.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/generic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
;
const Marker = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createLayerComponent"])(function createMarker(param, ctx) {
    let { position, ...options } = param;
    const marker = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"](position, options);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElementObject"])(marker, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extendContext"])(ctx, {
        overlayContainer: marker
    }));
}, function updateMarker(marker, props, prevProps) {
    if (props.position !== prevProps.position) {
        marker.setLatLng(props.position);
    }
    if (props.icon != null && props.icon !== prevProps.icon) {
        marker.setIcon(props.icon);
    }
    if (props.zIndexOffset != null && props.zIndexOffset !== prevProps.zIndexOffset) {
        marker.setZIndexOffset(props.zIndexOffset);
    }
    if (props.opacity != null && props.opacity !== prevProps.opacity) {
        marker.setOpacity(props.opacity);
    }
    if (marker.dragging != null && props.draggable !== prevProps.draggable) {
        if (props.draggable === true) {
            marker.dragging.enable();
        } else {
            marker.dragging.disable();
        }
    }
});
}),
"[project]/node_modules/react-leaflet/lib/Popup.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Popup",
    ()=>Popup
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/element.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/generic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
;
;
const Popup = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createOverlayComponent"])(function createPopup(props, context) {
    const popup = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"](props, context.overlayContainer);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElementObject"])(popup, context);
}, function usePopupLifecycle(element, context, param, setOpen) {
    let { position } = param;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(function addPopup() {
        const { instance } = element;
        function onPopupOpen(event) {
            if (event.popup === instance) {
                instance.update();
                setOpen(true);
            }
        }
        function onPopupClose(event) {
            if (event.popup === instance) {
                setOpen(false);
            }
        }
        context.map.on({
            popupopen: onPopupOpen,
            popupclose: onPopupClose
        });
        if (context.overlayContainer == null) {
            // Attach to a Map
            if (position != null) {
                instance.setLatLng(position);
            }
            instance.openOn(context.map);
        } else {
            // Attach to container component
            context.overlayContainer.bindPopup(instance);
        }
        return function removePopup() {
            var _context_overlayContainer;
            context.map.off({
                popupopen: onPopupOpen,
                popupclose: onPopupClose
            });
            (_context_overlayContainer = context.overlayContainer) === null || _context_overlayContainer === void 0 ? void 0 : _context_overlayContainer.unbindPopup();
            context.map.removeLayer(instance);
        };
    }, [
        element,
        context,
        setOpen,
        position
    ]);
});
}),
"[project]/node_modules/react-leaflet/lib/Polyline.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Polyline",
    ()=>Polyline
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/element.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/generic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
;
const Polyline = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPathComponent"])(function createPolyline(param, ctx) {
    let { positions, ...options } = param;
    const polyline = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"](positions, options);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElementObject"])(polyline, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extendContext"])(ctx, {
        overlayContainer: polyline
    }));
}, function updatePolyline(layer, props, prevProps) {
    if (props.positions !== prevProps.positions) {
        layer.setLatLngs(props.positions);
    }
});
}),
"[project]/node_modules/react-leaflet/lib/Polygon.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Polygon",
    ()=>Polygon
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/element.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/generic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
;
const Polygon = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPathComponent"])(function createPolygon(param, ctx) {
    let { positions, ...options } = param;
    const polygon = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polygon"](positions, options);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElementObject"])(polygon, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extendContext"])(ctx, {
        overlayContainer: polygon
    }));
}, function updatePolygon(layer, props, prevProps) {
    if (props.positions !== prevProps.positions) {
        layer.setLatLngs(props.positions);
    }
});
}),
"[project]/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useMap",
    ()=>useMap,
    "useMapEvent",
    ()=>useMapEvent,
    "useMapEvents",
    ()=>useMapEvents
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
;
function useMap() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLeafletContext"])().map;
}
function useMapEvent(type, handler) {
    const map = useMap();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(function addMapEventHandler() {
        // @ts-ignore event type
        map.on(type, handler);
        return function removeMapEventHandler() {
            // @ts-ignore event type
            map.off(type, handler);
        };
    }, [
        map,
        type,
        handler
    ]);
    return map;
}
function useMapEvents(handlers) {
    const map = useMap();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])(function addMapEventHandlers() {
        map.on(handlers);
        return function removeMapEventHandlers() {
            map.off(handlers);
        };
    }, [
        map,
        handlers
    ]);
    return map;
}
}),
]);

//# sourceMappingURL=_c11dc8d0._.js.map