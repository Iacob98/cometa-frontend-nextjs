(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/maps/measurement-tools.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MeasurementTools",
    ()=>MeasurementTools,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Polyline.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Popup.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/hooks.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ruler.js [app-client] (ecmascript) <export default as Ruler>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-geospatial.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2)=>{
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000; // Return distance in meters
};
// Calculate polygon area using shoelace formula
const calculatePolygonArea = (points)=>{
    if (points.length < 3) return 0;
    let area = 0;
    const n = points.length;
    for(let i = 0; i < n; i++){
        const j = (i + 1) % n;
        const lat1 = points[i].lat * (Math.PI / 180);
        const lng1 = points[i].lng * (Math.PI / 180);
        const lat2 = points[j].lat * (Math.PI / 180);
        const lng2 = points[j].lng * (Math.PI / 180);
        area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
    }
    area = Math.abs(area) * 6378137 * 6378137 / 2; // Earth's radius squared
    return area; // Return area in square meters
};
// Format measurement value with appropriate units
const formatMeasurement = (value, type)=>{
    if (type === "distance") {
        if (value < 1000) {
            return {
                value: value.toFixed(1),
                unit: "m"
            };
        } else {
            return {
                value: (value / 1000).toFixed(2),
                unit: "km"
            };
        }
    } else {
        if (value < 10000) {
            return {
                value: value.toFixed(1),
                unit: "m²"
            };
        } else {
            return {
                value: (value / 10000).toFixed(2),
                unit: "ha"
            };
        }
    }
};
function MeasurementTools(param) {
    let { projectId, onMeasurementSave, className } = param;
    _s();
    const [measurementMode, setMeasurementMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentPoints, setCurrentPoints] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [measurements, setMeasurements] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isDrawing, setIsDrawing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const pointIdRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(0);
    const createGeoMeasurement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCreateGeoMeasurement"])();
    // Handle map clicks for measurement
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMapEvents"])({
        click: {
            "MeasurementTools.useMapEvents": (e)=>{
                if (!measurementMode) return;
                const newPoint = {
                    id: "point-".concat(pointIdRef.current++),
                    lat: e.latlng.lat,
                    lng: e.latlng.lng
                };
                setCurrentPoints({
                    "MeasurementTools.useMapEvents": (prev)=>{
                        const updated = [
                            ...prev,
                            newPoint
                        ];
                        // For distance measurement, limit to 2 points
                        if (measurementMode === "distance" && updated.length === 2) {
                            completeMeasurement(updated, "distance");
                            return [];
                        }
                        return updated;
                    }
                }["MeasurementTools.useMapEvents"]);
                setIsDrawing(true);
            }
        }["MeasurementTools.useMapEvents"],
        dblclick: {
            "MeasurementTools.useMapEvents": (e)=>{
                if (measurementMode === "area" && currentPoints.length >= 3) {
                    completeMeasurement(currentPoints, "area");
                    setCurrentPoints([]);
                    setIsDrawing(false);
                }
            }
        }["MeasurementTools.useMapEvents"]
    });
    const completeMeasurement = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "MeasurementTools.useCallback[completeMeasurement]": (points, type)=>{
            let value = 0;
            if (type === "distance" && points.length >= 2) {
                // Calculate total distance for polyline
                for(let i = 0; i < points.length - 1; i++){
                    value += calculateDistance(points[i].lat, points[i].lng, points[i + 1].lat, points[i + 1].lng);
                }
            } else if (type === "area" && points.length >= 3) {
                value = calculatePolygonArea(points);
            }
            const formatted = formatMeasurement(value, type);
            const measurement = {
                id: "measurement-".concat(Date.now()),
                type,
                points: [
                    ...points
                ],
                value,
                unit: formatted.unit,
                label: "".concat(formatted.value, " ").concat(formatted.unit)
            };
            setMeasurements({
                "MeasurementTools.useCallback[completeMeasurement]": (prev)=>[
                        ...prev,
                        measurement
                    ]
            }["MeasurementTools.useCallback[completeMeasurement]"]);
            if (onMeasurementSave) {
                onMeasurementSave(measurement);
            }
        }
    }["MeasurementTools.useCallback[completeMeasurement]"], [
        onMeasurementSave
    ]);
    const startDistanceMeasurement = ()=>{
        setMeasurementMode("distance");
        setCurrentPoints([]);
        setIsDrawing(false);
    };
    const startAreaMeasurement = ()=>{
        setMeasurementMode("area");
        setCurrentPoints([]);
        setIsDrawing(false);
    };
    const stopMeasurement = ()=>{
        setMeasurementMode(null);
        setCurrentPoints([]);
        setIsDrawing(false);
    };
    const clearMeasurements = ()=>{
        setMeasurements([]);
        setCurrentPoints([]);
        setIsDrawing(false);
    };
    const deleteMeasurement = (id)=>{
        setMeasurements((prev)=>prev.filter((m)=>m.id !== id));
    };
    const saveMeasurementToServer = async (measurement)=>{
        if (!projectId) return;
        try {
            const geometry = measurement.type === "distance" ? {
                type: "LineString",
                coordinates: measurement.points.map((p)=>[
                        p.lng,
                        p.lat
                    ])
            } : {
                type: "Polygon",
                coordinates: [
                    measurement.points.map((p)=>[
                            p.lng,
                            p.lat
                        ])
                ]
            };
            const request = {
                project_id: projectId,
                measurement_type: measurement.type,
                geometry,
                value: measurement.value,
                unit: measurement.unit,
                description: measurement.label
            };
            await createGeoMeasurement.mutateAsync(request);
        } catch (error) {
            console.error("Failed to save measurement:", error);
        }
    };
    const getCurrentMeasurementValue = ()=>{
        if (currentPoints.length < 2) return null;
        if (measurementMode === "distance") {
            let totalDistance = 0;
            for(let i = 0; i < currentPoints.length - 1; i++){
                totalDistance += calculateDistance(currentPoints[i].lat, currentPoints[i].lng, currentPoints[i + 1].lat, currentPoints[i + 1].lng);
            }
            return formatMeasurement(totalDistance, "distance");
        } else if (measurementMode === "area" && currentPoints.length >= 3) {
            const area = calculatePolygonArea(currentPoints);
            return formatMeasurement(area, "area");
        }
        return null;
    };
    const currentValue = getCurrentMeasurementValue();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "absolute top-4 left-4 z-[1000] ".concat(className),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardHeader"], {
                        className: "pb-2",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardTitle"], {
                            className: "text-sm flex items-center gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                    lineNumber: 251,
                                    columnNumber: 13
                                }, this),
                                "Measurement Tools"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                            lineNumber: 250,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                        lineNumber: 249,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        variant: measurementMode === "distance" ? "default" : "outline",
                                        onClick: startDistanceMeasurement,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ruler$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Ruler$3e$__["Ruler"], {
                                                className: "w-3 h-3 mr-1"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                lineNumber: 262,
                                                columnNumber: 15
                                            }, this),
                                            "Distance"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                        lineNumber: 257,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        variant: measurementMode === "area" ? "default" : "outline",
                                        onClick: startAreaMeasurement,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Square$3e$__["Square"], {
                                                className: "w-3 h-3 mr-1"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                lineNumber: 270,
                                                columnNumber: 15
                                            }, this),
                                            "Area"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                        lineNumber: 265,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                lineNumber: 256,
                                columnNumber: 11
                            }, this),
                            measurementMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "secondary",
                                        className: "text-xs",
                                        children: measurementMode === "distance" ? "Click two points to measure distance" : "Click points to draw area (double-click to finish)"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                        lineNumber: 277,
                                        columnNumber: 15
                                    }, this),
                                    currentValue && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "default",
                                        className: "text-xs",
                                        children: [
                                            currentValue.value,
                                            " ",
                                            currentValue.unit
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                        lineNumber: 284,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        variant: "outline",
                                        onClick: stopMeasurement,
                                        className: "w-full",
                                        children: "Cancel"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                        lineNumber: 289,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                lineNumber: 276,
                                columnNumber: 13
                            }, this),
                            measurements.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs font-medium",
                                                children: "Measurements"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                lineNumber: 298,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                size: "sm",
                                                variant: "ghost",
                                                onClick: clearMeasurements,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                    className: "w-3 h-3"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                    lineNumber: 300,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                lineNumber: 299,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                        lineNumber: 297,
                                        columnNumber: 15
                                    }, this),
                                    measurements.map((measurement, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: [
                                                        index + 1,
                                                        ". ",
                                                        measurement.label
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                    lineNumber: 305,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex gap-1",
                                                    children: [
                                                        projectId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            size: "sm",
                                                            variant: "ghost",
                                                            onClick: ()=>saveMeasurementToServer(measurement),
                                                            disabled: createGeoMeasurement.isPending,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Save$3e$__["Save"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                                lineNumber: 316,
                                                                columnNumber: 25
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                            lineNumber: 310,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            size: "sm",
                                                            variant: "ghost",
                                                            onClick: ()=>deleteMeasurement(measurement.id),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                className: "w-3 h-3"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                                lineNumber: 324,
                                                                columnNumber: 23
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                            lineNumber: 319,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                    lineNumber: 308,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, measurement.id, true, {
                                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                            lineNumber: 304,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                lineNumber: 296,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                        lineNumber: 255,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                lineNumber: 248,
                columnNumber: 7
            }, this),
            currentPoints.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    currentPoints.map((point)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                            position: [
                                point.lat,
                                point.lng
                            ],
                            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
                                html: '<div style="\n                  background-color: #ef4444;\n                  width: 8px;\n                  height: 8px;\n                  border: 2px solid white;\n                  border-radius: 50%;\n                  box-shadow: 0 1px 3px rgba(0,0,0,0.3);\n                "></div>',
                                className: "measurement-point",
                                iconSize: [
                                    12,
                                    12
                                ],
                                iconAnchor: [
                                    6,
                                    6
                                ]
                            })
                        }, point.id, false, {
                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                            lineNumber: 339,
                            columnNumber: 13
                        }, this)),
                    currentPoints.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                        positions: currentPoints.map((p)=>[
                                p.lat,
                                p.lng
                            ]),
                        color: "#ef4444",
                        weight: 2,
                        dashArray: "5, 5",
                        opacity: 0.8
                    }, void 0, false, {
                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                        lineNumber: 360,
                        columnNumber: 13
                    }, this),
                    measurementMode === "area" && currentPoints.length >= 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                        positions: [
                            currentPoints[currentPoints.length - 1],
                            currentPoints[0]
                        ].map((p)=>[
                                p.lat,
                                p.lng
                            ]),
                        color: "#ef4444",
                        weight: 2,
                        dashArray: "5, 5",
                        opacity: 0.5
                    }, void 0, false, {
                        fileName: "[project]/src/components/maps/measurement-tools.tsx",
                        lineNumber: 371,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true),
            measurements.map((measurement)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                    children: [
                        measurement.points.map((point)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                                position: [
                                    point.lat,
                                    point.lng
                                ],
                                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
                                    html: '<div style="\n                  background-color: #3b82f6;\n                  width: 6px;\n                  height: 6px;\n                  border: 2px solid white;\n                  border-radius: 50%;\n                  box-shadow: 0 1px 3px rgba(0,0,0,0.3);\n                "></div>',
                                    className: "measurement-point-completed",
                                    iconSize: [
                                        10,
                                        10
                                    ],
                                    iconAnchor: [
                                        5,
                                        5
                                    ]
                                })
                            }, point.id, false, {
                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                lineNumber: 390,
                                columnNumber: 13
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                            positions: measurement.points.map((p)=>[
                                    p.lat,
                                    p.lng
                                ]),
                            color: "#3b82f6",
                            weight: 2,
                            opacity: 0.8,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "font-semibold text-sm",
                                            children: [
                                                measurement.type === "distance" ? "Distance" : "Area",
                                                " Measurement"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                            lineNumber: 418,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm",
                                            children: measurement.label
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                            lineNumber: 421,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    variant: "outline",
                                                    onClick: ()=>deleteMeasurement(measurement.id),
                                                    children: "Delete"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                    lineNumber: 423,
                                                    columnNumber: 19
                                                }, this),
                                                projectId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    size: "sm",
                                                    onClick: ()=>saveMeasurementToServer(measurement),
                                                    disabled: createGeoMeasurement.isPending,
                                                    children: "Save"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                                    lineNumber: 431,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                            lineNumber: 422,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                    lineNumber: 417,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/maps/measurement-tools.tsx",
                                lineNumber: 416,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                            lineNumber: 410,
                            columnNumber: 11
                        }, this),
                        measurement.type === "area" && measurement.points.length >= 3 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Polyline$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Polyline"], {
                            positions: [
                                measurement.points[measurement.points.length - 1],
                                measurement.points[0]
                            ].map((p)=>[
                                    p.lat,
                                    p.lng
                                ]),
                            color: "#3b82f6",
                            weight: 2,
                            opacity: 0.8
                        }, void 0, false, {
                            fileName: "[project]/src/components/maps/measurement-tools.tsx",
                            lineNumber: 446,
                            columnNumber: 13
                        }, this)
                    ]
                }, measurement.id, true, {
                    fileName: "[project]/src/components/maps/measurement-tools.tsx",
                    lineNumber: 387,
                    columnNumber: 9
                }, this))
        ]
    }, void 0, true);
}
_s(MeasurementTools, "VE0PCOO8tm48HIMAgvCf6DD9eE0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCreateGeoMeasurement"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$hooks$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMapEvents"]
    ];
});
_c = MeasurementTools;
const __TURBOPACK__default__export__ = MeasurementTools;
var _c;
__turbopack_context__.k.register(_c, "MeasurementTools");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/maps/measurement-tools.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/maps/measurement-tools.tsx [app-client] (ecmascript)"));
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
"[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Square
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "rect",
        {
            width: "18",
            height: "18",
            x: "3",
            y: "3",
            rx: "2",
            key: "afitv7"
        }
    ]
];
const Square = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("square", __iconNode);
;
 //# sourceMappingURL=square.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript) <export default as Square>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Square",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/square.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Save
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
            key: "1c8476"
        }
    ],
    [
        "path",
        {
            d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",
            key: "1ydtos"
        }
    ],
    [
        "path",
        {
            d: "M7 3v4a1 1 0 0 0 1 1h7",
            key: "t51u73"
        }
    ]
];
const Save = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("save", __iconNode);
;
 //# sourceMappingURL=save.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript) <export default as Save>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Save",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$save$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/save.js [app-client] (ecmascript)");
}),
"[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * @license lucide-react v0.544.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */ __turbopack_context__.s([
    "__iconNode",
    ()=>__iconNode,
    "default",
    ()=>Trash2
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/createLucideIcon.js [app-client] (ecmascript)");
;
const __iconNode = [
    [
        "path",
        {
            d: "M10 11v6",
            key: "nco0om"
        }
    ],
    [
        "path",
        {
            d: "M14 11v6",
            key: "outv1u"
        }
    ],
    [
        "path",
        {
            d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6",
            key: "miytrc"
        }
    ],
    [
        "path",
        {
            d: "M3 6h18",
            key: "d0wm0j"
        }
    ],
    [
        "path",
        {
            d: "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2",
            key: "e791ji"
        }
    ]
];
const Trash2 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$createLucideIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])("trash-2", __iconNode);
;
 //# sourceMappingURL=trash-2.js.map
}),
"[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Trash2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript)");
}),
]);

//# sourceMappingURL=_4a1bcaf4._.js.map