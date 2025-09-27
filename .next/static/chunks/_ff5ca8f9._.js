(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/maps/gps-tracker.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GPSTracker",
    ()=>GPSTracker,
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Marker.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Popup.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-leaflet/lib/Circle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/navigation.js [app-client] (ecmascript) <export default as Navigation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-geospatial.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
// GPS position marker with direction indicator
const createGPSIcon = function() {
    let isCurrentUser = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false, heading = arguments.length > 1 ? arguments[1] : void 0;
    const color = isCurrentUser ? "#ef4444" : "#3b82f6";
    const size = isCurrentUser ? 16 : 12;
    let transform = "";
    if (heading !== undefined) {
        transform = "rotate(".concat(heading, "deg)");
    }
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].divIcon({
        html: '\n      <div style="\n        background-color: '.concat(color, ";\n        width: ").concat(size, "px;\n        height: ").concat(size, "px;\n        border: 3px solid white;\n        border-radius: 50%;\n        box-shadow: 0 2px 6px rgba(0,0,0,0.3);\n        position: relative;\n        transform: ").concat(transform, ';\n      ">\n        ').concat(heading !== undefined ? '\n          <div style="\n            position: absolute;\n            top: -8px;\n            left: 50%;\n            transform: translateX(-50%);\n            width: 0;\n            height: 0;\n            border-left: 4px solid transparent;\n            border-right: 4px solid transparent;\n            border-bottom: 8px solid '.concat(color, ';\n          "></div>\n        ') : "", "\n      </div>\n    "),
        className: "gps-marker",
        iconSize: [
            size + 6,
            size + 6
        ],
        iconAnchor: [
            (size + 6) / 2,
            (size + 6) / 2
        ]
    });
};
function GPSTracker(param) {
    let { trackCurrentUser = true, trackUsers = [], enableTracking = false, showAccuracy = true, onLocationUpdate } = param;
    _s();
    var _s1 = __turbopack_context__.k.signature();
    const { user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [currentLocation, setCurrentLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [watchId, setWatchId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [heading, setHeading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const updateGPSLocation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUpdateGPSLocation"])();
    // Track current user's location
    const { data: userGPSData } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGPSTracking"])(user === null || user === void 0 ? void 0 : user.id);
    // Track other users' locations
    const trackedUsersData = trackUsers.map(_s1((userId)=>{
        _s1();
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGPSTracking"])(userId);
    }, "mYGTBxER5LjZxqrp3k2yft2ERhU=", false, function() {
        return [
            __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGPSTracking"]
        ];
    }));
    // Start GPS tracking
    const startTracking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GPSTracker.useCallback[startTracking]": ()=>{
            if (!navigator.geolocation || !enableTracking) return;
            const options = {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            };
            const successCallback = {
                "GPSTracker.useCallback[startTracking].successCallback": (position)=>{
                    const location = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    };
                    setCurrentLocation(location);
                    // Update heading if available
                    if (position.coords.heading !== null && position.coords.heading !== undefined) {
                        setHeading(position.coords.heading);
                    }
                    // Send location to server
                    if ((user === null || user === void 0 ? void 0 : user.id) && enableTracking) {
                        updateGPSLocation.mutate({
                            userId: user.id,
                            location
                        });
                    }
                    // Notify parent component
                    if (onLocationUpdate) {
                        onLocationUpdate(location);
                    }
                }
            }["GPSTracker.useCallback[startTracking].successCallback"];
            const errorCallback = {
                "GPSTracker.useCallback[startTracking].errorCallback": (error)=>{
                    console.error("GPS tracking error:", error);
                }
            }["GPSTracker.useCallback[startTracking].errorCallback"];
            const id = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
            setWatchId(id);
        }
    }["GPSTracker.useCallback[startTracking]"], [
        enableTracking,
        user === null || user === void 0 ? void 0 : user.id,
        updateGPSLocation,
        onLocationUpdate
    ]);
    // Stop GPS tracking
    const stopTracking = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "GPSTracker.useCallback[stopTracking]": ()=>{
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                setWatchId(null);
            }
        }
    }["GPSTracker.useCallback[stopTracking]"], [
        watchId
    ]);
    // Start/stop tracking based on enableTracking prop
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GPSTracker.useEffect": ()=>{
            if (enableTracking && trackCurrentUser) {
                startTracking();
            } else {
                stopTracking();
            }
            return ({
                "GPSTracker.useEffect": ()=>stopTracking()
            })["GPSTracker.useEffect"];
        }
    }["GPSTracker.useEffect"], [
        enableTracking,
        trackCurrentUser,
        startTracking,
        stopTracking
    ]);
    // Cleanup on unmount
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "GPSTracker.useEffect": ()=>{
            return ({
                "GPSTracker.useEffect": ()=>stopTracking()
            })["GPSTracker.useEffect"];
        }
    }["GPSTracker.useEffect"], [
        stopTracking
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            currentLocation && trackCurrentUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                        position: [
                            currentLocation.latitude,
                            currentLocation.longitude
                        ],
                        icon: createGPSIcon(true, heading),
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                                className: "w-4 h-4 text-red-500"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                lineNumber: 178,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-semibold",
                                                children: "Your Location"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                lineNumber: 179,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                        lineNumber: 177,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs space-y-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    "Lat: ",
                                                    currentLocation.latitude.toFixed(6)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                lineNumber: 182,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    "Lng: ",
                                                    currentLocation.longitude.toFixed(6)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                lineNumber: 183,
                                                columnNumber: 19
                                            }, this),
                                            currentLocation.accuracy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    "Accuracy: ±",
                                                    Math.round(currentLocation.accuracy),
                                                    "m"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                lineNumber: 185,
                                                columnNumber: 21
                                            }, this),
                                            heading !== undefined && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Navigation$3e$__["Navigation"], {
                                                        className: "w-3 h-3"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                        lineNumber: 189,
                                                        columnNumber: 23
                                                    }, this),
                                                    "Heading: ",
                                                    Math.round(heading),
                                                    "°"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                lineNumber: 188,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                        lineNumber: 181,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                lineNumber: 176,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/maps/gps-tracker.tsx",
                            lineNumber: 175,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                        lineNumber: 171,
                        columnNumber: 11
                    }, this),
                    showAccuracy && currentLocation.accuracy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                        center: [
                            currentLocation.latitude,
                            currentLocation.longitude
                        ],
                        radius: currentLocation.accuracy,
                        color: "#ef4444",
                        fillOpacity: 0.1,
                        weight: 1
                    }, void 0, false, {
                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                        lineNumber: 200,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true),
            (userGPSData === null || userGPSData === void 0 ? void 0 : userGPSData.data) && trackCurrentUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                position: [
                    userGPSData.data.latitude,
                    userGPSData.data.longitude
                ],
                icon: createGPSIcon(true),
                opacity: currentLocation ? 0.5 : 1,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"], {
                                        className: "w-4 h-4 text-red-500"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                        lineNumber: 221,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold",
                                        children: "Last Known Location"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                        lineNumber: 222,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                lineNumber: 220,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Lat: ",
                                            userGPSData.data.latitude.toFixed(6)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                        lineNumber: 225,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Lng: ",
                                            userGPSData.data.longitude.toFixed(6)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                        lineNumber: 226,
                                        columnNumber: 17
                                    }, this),
                                    userGPSData.data.accuracy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Accuracy: ±",
                                            Math.round(userGPSData.data.accuracy),
                                            "m"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                        lineNumber: 228,
                                        columnNumber: 19
                                    }, this),
                                    userGPSData.data.timestamp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            "Updated: ",
                                            new Date(userGPSData.data.timestamp).toLocaleTimeString()
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                        lineNumber: 231,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                lineNumber: 224,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/maps/gps-tracker.tsx",
                        lineNumber: 219,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                    lineNumber: 218,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                lineNumber: 213,
                columnNumber: 9
            }, this),
            trackedUsersData.map((userData, index)=>{
                if (!(userData === null || userData === void 0 ? void 0 : userData.data)) return null;
                const userId = trackUsers[index];
                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].Fragment, {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Marker$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Marker"], {
                            position: [
                                userData.data.latitude,
                                userData.data.longitude
                            ],
                            icon: createGPSIcon(false),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Popup$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popup"], {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                                                    className: "w-4 h-4 text-blue-500"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                    lineNumber: 253,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "font-semibold",
                                                    children: "Team Member"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                    lineNumber: 254,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                            lineNumber: 252,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs space-y-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Lat: ",
                                                        userData.data.latitude.toFixed(6)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                    lineNumber: 257,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Lng: ",
                                                        userData.data.longitude.toFixed(6)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                    lineNumber: 258,
                                                    columnNumber: 21
                                                }, this),
                                                userData.data.accuracy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Accuracy: ±",
                                                        Math.round(userData.data.accuracy),
                                                        "m"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                    lineNumber: 260,
                                                    columnNumber: 23
                                                }, this),
                                                userData.data.timestamp && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        "Updated: ",
                                                        new Date(userData.data.timestamp).toLocaleTimeString()
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                                    lineNumber: 263,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                            lineNumber: 256,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                    lineNumber: 251,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/maps/gps-tracker.tsx",
                                lineNumber: 250,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/maps/gps-tracker.tsx",
                            lineNumber: 246,
                            columnNumber: 13
                        }, this),
                        showAccuracy && userData.data.accuracy && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$leaflet$2f$lib$2f$Circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"], {
                            center: [
                                userData.data.latitude,
                                userData.data.longitude
                            ],
                            radius: userData.data.accuracy,
                            color: "#3b82f6",
                            fillOpacity: 0.1,
                            weight: 1
                        }, void 0, false, {
                            fileName: "[project]/src/components/maps/gps-tracker.tsx",
                            lineNumber: 272,
                            columnNumber: 15
                        }, this)
                    ]
                }, userId, true, {
                    fileName: "[project]/src/components/maps/gps-tracker.tsx",
                    lineNumber: 245,
                    columnNumber: 11
                }, this);
            })
        ]
    }, void 0, true);
}
_s(GPSTracker, "5fflm8kDuCdxQHzjEL/qQPiwF7U=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useUpdateGPSLocation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$geospatial$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useGPSTracking"]
    ];
});
_c = GPSTracker;
const __TURBOPACK__default__export__ = GPSTracker;
var _c;
__turbopack_context__.k.register(_c, "GPSTracker");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/maps/gps-tracker.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/maps/gps-tracker.tsx [app-client] (ecmascript)"));
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
"[project]/node_modules/@react-leaflet/core/lib/circle.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "updateCircle",
    ()=>updateCircle
]);
function updateCircle(layer, props, prevProps) {
    if (props.center !== prevProps.center) {
        layer.setLatLng(props.center);
    }
    if (props.radius != null && props.radius !== prevProps.radius) {
        layer.setRadius(props.radius);
    }
}
}),
"[project]/node_modules/react-leaflet/lib/Circle.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Circle",
    ()=>Circle
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/element.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/generic.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/context.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@react-leaflet/core/lib/circle.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/leaflet/dist/leaflet-src.js [app-client] (ecmascript)");
;
;
const Circle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$generic$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPathComponent"])(function createCircle(param, ctx) {
    let { center, children: _c, ...options } = param;
    const circle = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$leaflet$2f$dist$2f$leaflet$2d$src$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Circle"](center, options);
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$element$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElementObject"])(circle, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$context$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["extendContext"])(ctx, {
        overlayContainer: circle
    }));
}, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$react$2d$leaflet$2f$core$2f$lib$2f$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["updateCircle"]);
}),
]);

//# sourceMappingURL=_ff5ca8f9._.js.map