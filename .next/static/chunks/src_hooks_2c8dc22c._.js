(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/hooks/use-projects.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "projectKeys",
    ()=>projectKeys,
    "useCreateProject",
    ()=>useCreateProject,
    "useDeleteProject",
    ()=>useDeleteProject,
    "useOptimisticProjectUpdate",
    ()=>useOptimisticProjectUpdate,
    "useProject",
    ()=>useProject,
    "useProjectStats",
    ()=>useProjectStats,
    "useProjects",
    ()=>useProjects,
    "useUpdateProject",
    ()=>useUpdateProject
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature();
;
;
;
const projectKeys = {
    all: [
        "projects"
    ],
    lists: ()=>[
            ...projectKeys.all,
            "list"
        ],
    list: (filters)=>[
            ...projectKeys.lists(),
            filters
        ],
    details: ()=>[
            ...projectKeys.all,
            "detail"
        ],
    detail: (id)=>[
            ...projectKeys.details(),
            id
        ]
};
function useProjects(filters) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: projectKeys.list(filters || {}),
        queryFn: {
            "useProjects.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["projectsApi"].getProjects(filters)
        }["useProjects.useQuery"],
        staleTime: 5 * 60 * 1000
    });
}
_s(useProjects, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useProject(id) {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: projectKeys.detail(id),
        queryFn: {
            "useProject.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["projectsApi"].getProject(id)
        }["useProject.useQuery"],
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}
_s1(useProject, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateProject() {
    _s2();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateProject.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["projectsApi"].createProject(data)
        }["useCreateProject.useMutation"],
        onSuccess: {
            "useCreateProject.useMutation": (newProject)=>{
                // Invalidate and refetch projects list
                queryClient.invalidateQueries({
                    queryKey: projectKeys.lists()
                });
                // Add the new project to the cache
                queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Project created successfully");
            }
        }["useCreateProject.useMutation"],
        onError: {
            "useCreateProject.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create project: ".concat(error.message));
            }
        }["useCreateProject.useMutation"]
    });
}
_s2(useCreateProject, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateProject() {
    _s3();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateProject.useMutation": (param)=>{
                let { id, data } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["projectsApi"].updateProject(id, data);
            }
        }["useUpdateProject.useMutation"],
        onMutate: {
            "useUpdateProject.useMutation": async (param)=>{
                let { id, data } = param;
                // Cancel any outgoing refetches
                await queryClient.cancelQueries({
                    queryKey: projectKeys.detail(id)
                });
                // Snapshot the previous value
                const previousProject = queryClient.getQueryData(projectKeys.detail(id));
                // Optimistically update to the new value
                queryClient.setQueryData(projectKeys.detail(id), {
                    "useUpdateProject.useMutation": (old)=>{
                        if (!old) return old;
                        return {
                            ...old,
                            ...data
                        };
                    }
                }["useUpdateProject.useMutation"]);
                // Return a context object with the snapshotted value
                return {
                    previousProject
                };
            }
        }["useUpdateProject.useMutation"],
        onError: {
            "useUpdateProject.useMutation": (error, param, context)=>{
                let { id } = param;
                // If the mutation fails, use the context returned from onMutate to roll back
                if (context === null || context === void 0 ? void 0 : context.previousProject) {
                    queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update project: ".concat(error.message));
            }
        }["useUpdateProject.useMutation"],
        onSuccess: {
            "useUpdateProject.useMutation": (updatedProject)=>{
                // Invalidate and refetch projects list
                queryClient.invalidateQueries({
                    queryKey: projectKeys.lists()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Project updated successfully");
            }
        }["useUpdateProject.useMutation"],
        onSettled: {
            "useUpdateProject.useMutation": (data, error, param)=>{
                let { id } = param;
                // Always refetch after error or success
                queryClient.invalidateQueries({
                    queryKey: projectKeys.detail(id)
                });
            }
        }["useUpdateProject.useMutation"]
    });
}
_s3(useUpdateProject, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteProject() {
    _s4();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteProject.useMutation": (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["projectsApi"].deleteProject(id)
        }["useDeleteProject.useMutation"],
        onSuccess: {
            "useDeleteProject.useMutation": (_, deletedId)=>{
                // Remove from cache
                queryClient.removeQueries({
                    queryKey: projectKeys.detail(deletedId)
                });
                // Invalidate projects list
                queryClient.invalidateQueries({
                    queryKey: projectKeys.lists()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Project deleted successfully");
            }
        }["useDeleteProject.useMutation"],
        onError: {
            "useDeleteProject.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to delete project: ".concat(error.message));
            }
        }["useDeleteProject.useMutation"]
    });
}
_s4(useDeleteProject, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useOptimisticProjectUpdate() {
    _s5();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useOptimisticProjectUpdate.useMutation": (param)=>{
                let { id, data } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["projectsApi"].updateProject(id, data);
            }
        }["useOptimisticProjectUpdate.useMutation"],
        onMutate: {
            "useOptimisticProjectUpdate.useMutation": async (param)=>{
                let { id, data } = param;
                await queryClient.cancelQueries({
                    queryKey: projectKeys.detail(id)
                });
                const previousProject = queryClient.getQueryData(projectKeys.detail(id));
                queryClient.setQueryData(projectKeys.detail(id), {
                    "useOptimisticProjectUpdate.useMutation": (old)=>{
                        if (!old) return old;
                        return {
                            ...old,
                            ...data
                        };
                    }
                }["useOptimisticProjectUpdate.useMutation"]);
                // Also update in lists if present
                queryClient.setQueriesData({
                    queryKey: projectKeys.lists()
                }, {
                    "useOptimisticProjectUpdate.useMutation": (old)=>{
                        if (!old) return old;
                        return {
                            ...old,
                            items: old.items.map({
                                "useOptimisticProjectUpdate.useMutation": (project)=>project.id === id ? {
                                        ...project,
                                        ...data
                                    } : project
                            }["useOptimisticProjectUpdate.useMutation"])
                        };
                    }
                }["useOptimisticProjectUpdate.useMutation"]);
                return {
                    previousProject
                };
            }
        }["useOptimisticProjectUpdate.useMutation"],
        onError: {
            "useOptimisticProjectUpdate.useMutation": (error, param, context)=>{
                let { id } = param;
                if (context === null || context === void 0 ? void 0 : context.previousProject) {
                    queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
                }
                // Invalidate lists to revert optimistic updates
                queryClient.invalidateQueries({
                    queryKey: projectKeys.lists()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update project: ".concat(error.message));
            }
        }["useOptimisticProjectUpdate.useMutation"],
        onSuccess: {
            "useOptimisticProjectUpdate.useMutation": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Project updated successfully");
            }
        }["useOptimisticProjectUpdate.useMutation"]
    });
}
_s5(useOptimisticProjectUpdate, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useProjectStats(projectId) {
    _s6();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...projectKeys.detail(projectId),
            "stats"
        ],
        queryFn: {
            "useProjectStats.useQuery": async ()=>{
                const response = await fetch("/api/projects/".concat(projectId, "/stats"));
                if (!response.ok) {
                    throw new Error('Failed to fetch project statistics');
                }
                return response.json();
            }
        }["useProjectStats.useQuery"],
        staleTime: 2 * 60 * 1000,
        enabled: !!projectId
    });
}
_s6(useProjectStats, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-project-preparation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCreateFacility",
    ()=>useCreateFacility,
    "useCreateHousingUnit",
    ()=>useCreateHousingUnit,
    "useCreateProjectPlan",
    ()=>useCreateProjectPlan,
    "useCreateUtilityContact",
    ()=>useCreateUtilityContact,
    "useDeleteFacility",
    ()=>useDeleteFacility,
    "useDeleteHousingUnit",
    ()=>useDeleteHousingUnit,
    "useDeleteProjectPlan",
    ()=>useDeleteProjectPlan,
    "useDeleteUtilityContact",
    ()=>useDeleteUtilityContact,
    "useFacilities",
    ()=>useFacilities,
    "useHousingUnits",
    ()=>useHousingUnits,
    "useProjectPlans",
    ()=>useProjectPlans,
    "useProjectPreparation",
    ()=>useProjectPreparation,
    "useUpdateFacility",
    ()=>useUpdateFacility,
    "useUpdateHousingUnit",
    ()=>useUpdateHousingUnit,
    "useUpdateProjectStatus",
    ()=>useUpdateProjectStatus,
    "useUpdateUtilityContact",
    ()=>useUpdateUtilityContact,
    "useUtilityContacts",
    ()=>useUtilityContacts
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature(), _s10 = __turbopack_context__.k.signature(), _s11 = __turbopack_context__.k.signature(), _s12 = __turbopack_context__.k.signature(), _s13 = __turbopack_context__.k.signature(), _s14 = __turbopack_context__.k.signature(), _s15 = __turbopack_context__.k.signature(), _s16 = __turbopack_context__.k.signature();
;
;
const api = {
    getProjectPreparation: async (projectId)=>{
        const response = await fetch("/api/project-preparation?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch project preparation data');
        }
        return response.json();
    },
    updateProjectStatus: async (data)=>{
        const response = await fetch('/api/project-preparation', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update project status');
        }
        return response.json();
    },
    getUtilityContacts: async (projectId)=>{
        const response = await fetch("/api/project-preparation/utility-contacts?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch utility contacts');
        }
        return response.json();
    },
    createUtilityContact: async (data)=>{
        const response = await fetch('/api/project-preparation/utility-contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create utility contact');
        }
        return response.json();
    },
    getFacilities: async (projectId)=>{
        const response = await fetch("/api/project-preparation/facilities?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch facilities');
        }
        return response.json();
    },
    createFacility: async (data)=>{
        const response = await fetch('/api/project-preparation/facilities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create facility');
        }
        return response.json();
    },
    getHousingUnits: async (projectId)=>{
        const response = await fetch("/api/project-preparation/housing?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch housing units');
        }
        return response.json();
    },
    createHousingUnit: async (data)=>{
        const response = await fetch('/api/project-preparation/housing', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create housing unit');
        }
        return response.json();
    },
    // UPDATE methods
    updateUtilityContact: async (data)=>{
        const response = await fetch("/api/project-preparation/utility-contacts/".concat(data.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update utility contact');
        }
        return response.json();
    },
    updateFacility: async (data)=>{
        const response = await fetch("/api/project-preparation/facilities/".concat(data.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update facility');
        }
        return response.json();
    },
    updateHousingUnit: async (data)=>{
        const response = await fetch("/api/project-preparation/housing/".concat(data.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update housing unit');
        }
        return response.json();
    },
    // DELETE methods
    deleteUtilityContact: async (id)=>{
        const response = await fetch("/api/project-preparation/utility-contacts/".concat(id), {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete utility contact');
        }
        return response.json();
    },
    deleteFacility: async (id)=>{
        const response = await fetch("/api/project-preparation/facilities/".concat(id), {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete facility');
        }
        return response.json();
    },
    deleteHousingUnit: async (id)=>{
        const response = await fetch("/api/project-preparation/housing/".concat(id), {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete housing unit');
        }
        return response.json();
    },
    // Project Plans API
    getProjectPlans: async (projectId)=>{
        const response = await fetch("/api/project-preparation/plans?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch project plans');
        }
        return response.json();
    },
    createProjectPlan: async (data)=>{
        const formData = new FormData();
        formData.append('file', data.file);
        formData.append('title', data.title);
        formData.append('description', data.description || '');
        formData.append('plan_type', data.plan_type);
        formData.append('project_id', data.project_id);
        const response = await fetch('/api/project-preparation/plans', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to upload plan');
        }
        return response.json();
    },
    deleteProjectPlan: async (id)=>{
        const response = await fetch("/api/project-preparation/plans/".concat(id), {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete plan');
        }
        return response.json();
    }
};
function useProjectPreparation(projectId) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-preparation',
            projectId
        ],
        queryFn: {
            "useProjectPreparation.useQuery": ()=>api.getProjectPreparation(projectId)
        }["useProjectPreparation.useQuery"],
        enabled: !!projectId
    });
}
_s(useProjectPreparation, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useUpdateProjectStatus() {
    _s1();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateProjectStatus,
        onSuccess: {
            "useUpdateProjectStatus.useMutation": (data, variables)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation',
                        variables.project_id
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'projects'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Project status updated successfully');
            }
        }["useUpdateProjectStatus.useMutation"],
        onError: {
            "useUpdateProjectStatus.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useUpdateProjectStatus.useMutation"]
    });
}
_s1(useUpdateProjectStatus, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUtilityContacts(projectId) {
    _s2();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'utility-contacts',
            projectId
        ],
        queryFn: {
            "useUtilityContacts.useQuery": ()=>api.getUtilityContacts(projectId)
        }["useUtilityContacts.useQuery"],
        enabled: !!projectId
    });
}
_s2(useUtilityContacts, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateUtilityContact() {
    _s3();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createUtilityContact,
        onSuccess: {
            "useCreateUtilityContact.useMutation": (data, variables)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'utility-contacts',
                        variables.project_id
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation',
                        variables.project_id
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Utility contact created successfully');
            }
        }["useCreateUtilityContact.useMutation"],
        onError: {
            "useCreateUtilityContact.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useCreateUtilityContact.useMutation"]
    });
}
_s3(useCreateUtilityContact, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useFacilities(projectId) {
    _s4();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'facilities',
            projectId
        ],
        queryFn: {
            "useFacilities.useQuery": ()=>api.getFacilities(projectId)
        }["useFacilities.useQuery"],
        enabled: !!projectId
    });
}
_s4(useFacilities, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateFacility() {
    _s5();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createFacility,
        onSuccess: {
            "useCreateFacility.useMutation": (data, variables)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'facilities',
                        variables.project_id
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation',
                        variables.project_id
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Facility created successfully');
            }
        }["useCreateFacility.useMutation"],
        onError: {
            "useCreateFacility.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useCreateFacility.useMutation"]
    });
}
_s5(useCreateFacility, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useHousingUnits(projectId) {
    _s6();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'housing-units',
            projectId
        ],
        queryFn: {
            "useHousingUnits.useQuery": ()=>api.getHousingUnits(projectId)
        }["useHousingUnits.useQuery"],
        enabled: !!projectId
    });
}
_s6(useHousingUnits, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateHousingUnit() {
    _s7();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createHousingUnit,
        onSuccess: {
            "useCreateHousingUnit.useMutation": (data, variables)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'housing-units',
                        variables.project_id
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation',
                        variables.project_id
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit created successfully');
            }
        }["useCreateHousingUnit.useMutation"],
        onError: {
            "useCreateHousingUnit.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useCreateHousingUnit.useMutation"]
    });
}
_s7(useCreateHousingUnit, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateUtilityContact() {
    _s8();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateUtilityContact,
        onSuccess: {
            "useUpdateUtilityContact.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'utility-contacts'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Utility contact updated successfully');
            }
        }["useUpdateUtilityContact.useMutation"],
        onError: {
            "useUpdateUtilityContact.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useUpdateUtilityContact.useMutation"]
    });
}
_s8(useUpdateUtilityContact, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateFacility() {
    _s9();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateFacility,
        onSuccess: {
            "useUpdateFacility.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'facilities'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Facility updated successfully');
            }
        }["useUpdateFacility.useMutation"],
        onError: {
            "useUpdateFacility.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useUpdateFacility.useMutation"]
    });
}
_s9(useUpdateFacility, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateHousingUnit() {
    _s10();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateHousingUnit,
        onSuccess: {
            "useUpdateHousingUnit.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'housing-units'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit updated successfully');
            }
        }["useUpdateHousingUnit.useMutation"],
        onError: {
            "useUpdateHousingUnit.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useUpdateHousingUnit.useMutation"]
    });
}
_s10(useUpdateHousingUnit, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteUtilityContact() {
    _s11();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteUtilityContact,
        onSuccess: {
            "useDeleteUtilityContact.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'utility-contacts'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Utility contact deleted successfully');
            }
        }["useDeleteUtilityContact.useMutation"],
        onError: {
            "useDeleteUtilityContact.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useDeleteUtilityContact.useMutation"]
    });
}
_s11(useDeleteUtilityContact, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteFacility() {
    _s12();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteFacility,
        onSuccess: {
            "useDeleteFacility.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'facilities'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Facility deleted successfully');
            }
        }["useDeleteFacility.useMutation"],
        onError: {
            "useDeleteFacility.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useDeleteFacility.useMutation"]
    });
}
_s12(useDeleteFacility, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteHousingUnit() {
    _s13();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteHousingUnit,
        onSuccess: {
            "useDeleteHousingUnit.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'housing-units'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit deleted successfully');
            }
        }["useDeleteHousingUnit.useMutation"],
        onError: {
            "useDeleteHousingUnit.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useDeleteHousingUnit.useMutation"]
    });
}
_s13(useDeleteHousingUnit, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useProjectPlans(projectId) {
    _s14();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-plans',
            projectId
        ],
        queryFn: {
            "useProjectPlans.useQuery": ()=>api.getProjectPlans(projectId)
        }["useProjectPlans.useQuery"],
        enabled: !!projectId
    });
}
_s14(useProjectPlans, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateProjectPlan() {
    _s15();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createProjectPlan,
        onSuccess: {
            "useCreateProjectPlan.useMutation": (data, variables)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-plans',
                        variables.project_id
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation',
                        variables.project_id
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Plan uploaded successfully');
            }
        }["useCreateProjectPlan.useMutation"],
        onError: {
            "useCreateProjectPlan.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useCreateProjectPlan.useMutation"]
    });
}
_s15(useCreateProjectPlan, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteProjectPlan() {
    _s16();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteProjectPlan,
        onSuccess: {
            "useDeleteProjectPlan.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-plans'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Plan deleted successfully');
            }
        }["useDeleteProjectPlan.useMutation"],
        onError: {
            "useDeleteProjectPlan.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useDeleteProjectPlan.useMutation"]
    });
}
_s16(useDeleteProjectPlan, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-zone-layout.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCabinets",
    ()=>useCabinets,
    "useCreateCabinet",
    ()=>useCreateCabinet,
    "useDeleteCabinet",
    ()=>useDeleteCabinet,
    "useSegments",
    ()=>useSegments,
    "useUpdateCabinet",
    ()=>useUpdateCabinet
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
;
;
const api = {
    getCabinets: async (projectId)=>{
        const response = await fetch("/api/zone-layout/cabinets?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch cabinets');
        }
        return response.json();
    },
    createCabinet: async (data)=>{
        const response = await fetch('/api/zone-layout/cabinets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create cabinet');
        }
        return response.json();
    },
    updateCabinet: async (data)=>{
        const response = await fetch("/api/zone-layout/cabinets/".concat(data.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update cabinet');
        }
        return response.json();
    },
    deleteCabinet: async (id)=>{
        const response = await fetch("/api/zone-layout/cabinets/".concat(id), {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete cabinet');
        }
        return response.json();
    },
    getSegments: async (projectId)=>{
        const response = await fetch("/api/zone-layout/segments?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch segments');
        }
        return response.json();
    }
};
function useCabinets(projectId) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'cabinets',
            projectId
        ],
        queryFn: {
            "useCabinets.useQuery": ()=>api.getCabinets(projectId)
        }["useCabinets.useQuery"],
        enabled: !!projectId
    });
}
_s(useCabinets, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateCabinet() {
    _s1();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createCabinet,
        onSuccess: {
            "useCreateCabinet.useMutation": (data, variables)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'cabinets',
                        variables.project_id
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation',
                        variables.project_id
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Cabinet created successfully');
            }
        }["useCreateCabinet.useMutation"],
        onError: {
            "useCreateCabinet.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useCreateCabinet.useMutation"]
    });
}
_s1(useCreateCabinet, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateCabinet() {
    _s2();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateCabinet,
        onSuccess: {
            "useUpdateCabinet.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'cabinets'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Cabinet updated successfully');
            }
        }["useUpdateCabinet.useMutation"],
        onError: {
            "useUpdateCabinet.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useUpdateCabinet.useMutation"]
    });
}
_s2(useUpdateCabinet, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteCabinet() {
    _s3();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteCabinet,
        onSuccess: {
            "useDeleteCabinet.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'cabinets'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Cabinet deleted successfully');
            }
        }["useDeleteCabinet.useMutation"],
        onError: {
            "useDeleteCabinet.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useDeleteCabinet.useMutation"]
    });
}
_s3(useDeleteCabinet, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useSegments(projectId) {
    _s4();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'segments',
            projectId
        ],
        queryFn: {
            "useSegments.useQuery": ()=>api.getSegments(projectId)
        }["useSegments.useQuery"],
        enabled: !!projectId
    });
}
_s4(useSegments, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-housing-units.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCreateHousingUnit",
    ()=>useCreateHousingUnit,
    "useDeleteHousingUnit",
    ()=>useDeleteHousingUnit,
    "useHousingUnits",
    ()=>useHousingUnits,
    "useUpdateHousingUnit",
    ()=>useUpdateHousingUnit
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
;
;
const api = {
    getHousingUnits: async (projectId)=>{
        const response = await fetch("/api/housing-units?project_id=".concat(projectId));
        if (!response.ok) {
            throw new Error('Failed to fetch housing units');
        }
        const data = await response.json();
        return data.items || [];
    },
    createHousingUnit: async (data)=>{
        const response = await fetch('/api/housing-units', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create housing unit');
        }
        return response.json();
    },
    updateHousingUnit: async (data)=>{
        const response = await fetch("/api/housing-units/".concat(data.id), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update housing unit');
        }
        return response.json();
    },
    deleteHousingUnit: async (id)=>{
        const response = await fetch("/api/housing-units/".concat(id), {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete housing unit');
        }
        return response.json();
    }
};
function useHousingUnits(projectId) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'housing-units',
            projectId
        ],
        queryFn: {
            "useHousingUnits.useQuery": ()=>api.getHousingUnits(projectId)
        }["useHousingUnits.useQuery"],
        enabled: !!projectId
    });
}
_s(useHousingUnits, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateHousingUnit() {
    _s1();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createHousingUnit,
        onSuccess: {
            "useCreateHousingUnit.useMutation": (data, variables)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'housing-units',
                        variables.project_id
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation',
                        variables.project_id
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit created successfully');
            }
        }["useCreateHousingUnit.useMutation"],
        onError: {
            "useCreateHousingUnit.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useCreateHousingUnit.useMutation"]
    });
}
_s1(useCreateHousingUnit, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateHousingUnit() {
    _s2();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateHousingUnit,
        onSuccess: {
            "useUpdateHousingUnit.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'housing-units'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit updated successfully');
            }
        }["useUpdateHousingUnit.useMutation"],
        onError: {
            "useUpdateHousingUnit.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useUpdateHousingUnit.useMutation"]
    });
}
_s2(useUpdateHousingUnit, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteHousingUnit() {
    _s3();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteHousingUnit,
        onSuccess: {
            "useDeleteHousingUnit.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'housing-units'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit deleted successfully');
            }
        }["useDeleteHousingUnit.useMutation"],
        onError: {
            "useDeleteHousingUnit.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useDeleteHousingUnit.useMutation"]
    });
}
_s3(useDeleteHousingUnit, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-houses.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appointmentKeys",
    ()=>appointmentKeys,
    "houseKeys",
    ()=>houseKeys,
    "useAppointment",
    ()=>useAppointment,
    "useAppointments",
    ()=>useAppointments,
    "useCancelAppointment",
    ()=>useCancelAppointment,
    "useCompleteAppointment",
    ()=>useCompleteAppointment,
    "useCompleteConnection",
    ()=>useCompleteConnection,
    "useCompletedConnections",
    ()=>useCompletedConnections,
    "useConfirmAppointment",
    ()=>useConfirmAppointment,
    "useCreateHouse",
    ()=>useCreateHouse,
    "useDeleteHouse",
    ()=>useDeleteHouse,
    "useHouse",
    ()=>useHouse,
    "useHouses",
    ()=>useHouses,
    "useInProgressConnections",
    ()=>useInProgressConnections,
    "usePendingConnections",
    ()=>usePendingConnections,
    "useProjectHouses",
    ()=>useProjectHouses,
    "useRescheduleAppointment",
    ()=>useRescheduleAppointment,
    "useScheduleAppointment",
    ()=>useScheduleAppointment,
    "useScheduledAppointments",
    ()=>useScheduledAppointments,
    "useStartAppointment",
    ()=>useStartAppointment,
    "useStartConnection",
    ()=>useStartConnection,
    "useTeamHouses",
    ()=>useTeamHouses,
    "useTodaysAppointments",
    ()=>useTodaysAppointments,
    "useUpdateAppointment",
    ()=>useUpdateAppointment,
    "useUpdateHouse",
    ()=>useUpdateHouse
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature(), _s10 = __turbopack_context__.k.signature(), _s11 = __turbopack_context__.k.signature(), _s12 = __turbopack_context__.k.signature(), _s13 = __turbopack_context__.k.signature(), _s14 = __turbopack_context__.k.signature(), _s15 = __turbopack_context__.k.signature(), _s16 = __turbopack_context__.k.signature(), _s17 = __turbopack_context__.k.signature(), _s18 = __turbopack_context__.k.signature(), _s19 = __turbopack_context__.k.signature(), _s20 = __turbopack_context__.k.signature(), _s21 = __turbopack_context__.k.signature(), _s22 = __turbopack_context__.k.signature();
;
;
;
const houseKeys = {
    all: [
        "houses"
    ],
    lists: ()=>[
            ...houseKeys.all,
            "list"
        ],
    list: (filters)=>[
            ...houseKeys.lists(),
            filters
        ],
    details: ()=>[
            ...houseKeys.all,
            "detail"
        ],
    detail: (id)=>[
            ...houseKeys.details(),
            id
        ],
    project: (projectId)=>[
            ...houseKeys.all,
            "project",
            projectId
        ],
    team: (teamId)=>[
            ...houseKeys.all,
            "team",
            teamId
        ]
};
const appointmentKeys = {
    all: [
        "appointments"
    ],
    lists: ()=>[
            ...appointmentKeys.all,
            "list"
        ],
    list: (filters)=>[
            ...appointmentKeys.lists(),
            filters
        ],
    details: ()=>[
            ...appointmentKeys.all,
            "detail"
        ],
    detail: (id)=>[
            ...appointmentKeys.details(),
            id
        ]
};
function useHouses(filters) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: houseKeys.list(filters || {}),
        queryFn: {
            "useHouses.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].getHouses(filters)
        }["useHouses.useQuery"],
        staleTime: 3 * 60 * 1000
    });
}
_s(useHouses, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useHouse(id) {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: houseKeys.detail(id),
        queryFn: {
            "useHouse.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].getHouse(id)
        }["useHouse.useQuery"],
        enabled: !!id,
        staleTime: 3 * 60 * 1000
    });
}
_s1(useHouse, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useProjectHouses(projectId) {
    _s2();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: houseKeys.project(projectId),
        queryFn: {
            "useProjectHouses.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].getProjectHouses(projectId)
        }["useProjectHouses.useQuery"],
        enabled: !!projectId,
        staleTime: 3 * 60 * 1000
    });
}
_s2(useProjectHouses, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useTeamHouses(teamId) {
    _s3();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: houseKeys.team(teamId),
        queryFn: {
            "useTeamHouses.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].getTeamHouses(teamId)
        }["useTeamHouses.useQuery"],
        enabled: !!teamId,
        staleTime: 3 * 60 * 1000
    });
}
_s3(useTeamHouses, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateHouse() {
    _s4();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateHouse.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].createHouse(data)
        }["useCreateHouse.useMutation"],
        onSuccess: {
            "useCreateHouse.useMutation": (newHouse)=>{
                queryClient.invalidateQueries({
                    queryKey: houseKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.project(newHouse.project_id)
                });
                queryClient.setQueryData(houseKeys.detail(newHouse.id), newHouse);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("House created successfully");
            }
        }["useCreateHouse.useMutation"],
        onError: {
            "useCreateHouse.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create house: ".concat(error.message));
            }
        }["useCreateHouse.useMutation"]
    });
}
_s4(useCreateHouse, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateHouse() {
    _s5();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateHouse.useMutation": (param)=>{
                let { id, data } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].updateHouse(id, data);
            }
        }["useUpdateHouse.useMutation"],
        onMutate: {
            "useUpdateHouse.useMutation": async (param)=>{
                let { id, data } = param;
                await queryClient.cancelQueries({
                    queryKey: houseKeys.detail(id)
                });
                const previousHouse = queryClient.getQueryData(houseKeys.detail(id));
                queryClient.setQueryData(houseKeys.detail(id), {
                    "useUpdateHouse.useMutation": (old)=>{
                        if (!old) return old;
                        return {
                            ...old,
                            ...data
                        };
                    }
                }["useUpdateHouse.useMutation"]);
                return {
                    previousHouse
                };
            }
        }["useUpdateHouse.useMutation"],
        onError: {
            "useUpdateHouse.useMutation": (error, param, context)=>{
                let { id } = param;
                if (context === null || context === void 0 ? void 0 : context.previousHouse) {
                    queryClient.setQueryData(houseKeys.detail(id), context.previousHouse);
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update house: ".concat(error.message));
            }
        }["useUpdateHouse.useMutation"],
        onSuccess: {
            "useUpdateHouse.useMutation": (updatedHouse)=>{
                queryClient.invalidateQueries({
                    queryKey: houseKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.project(updatedHouse.project_id)
                });
                if (updatedHouse.assigned_team_id) {
                    queryClient.invalidateQueries({
                        queryKey: houseKeys.team(updatedHouse.assigned_team_id)
                    });
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("House updated successfully");
            }
        }["useUpdateHouse.useMutation"],
        onSettled: {
            "useUpdateHouse.useMutation": (data, error, param)=>{
                let { id } = param;
                queryClient.invalidateQueries({
                    queryKey: houseKeys.detail(id)
                });
            }
        }["useUpdateHouse.useMutation"]
    });
}
_s5(useUpdateHouse, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteHouse() {
    _s6();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteHouse.useMutation": (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].deleteHouse(id)
        }["useDeleteHouse.useMutation"],
        onSuccess: {
            "useDeleteHouse.useMutation": (_, deletedId)=>{
                queryClient.removeQueries({
                    queryKey: houseKeys.detail(deletedId)
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.lists()
                });
                // Also invalidate project and team queries
                queryClient.invalidateQueries({
                    queryKey: houseKeys.all
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("House deleted successfully");
            }
        }["useDeleteHouse.useMutation"],
        onError: {
            "useDeleteHouse.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to delete house: ".concat(error.message));
            }
        }["useDeleteHouse.useMutation"]
    });
}
_s6(useDeleteHouse, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useStartConnection() {
    _s7();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useStartConnection.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].startConnection(data)
        }["useStartConnection.useMutation"],
        onSuccess: {
            "useStartConnection.useMutation": (updatedHouse)=>{
                queryClient.setQueryData(houseKeys.detail(updatedHouse.id), updatedHouse);
                queryClient.invalidateQueries({
                    queryKey: houseKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.project(updatedHouse.project_id)
                });
                if (updatedHouse.assigned_team_id) {
                    queryClient.invalidateQueries({
                        queryKey: houseKeys.team(updatedHouse.assigned_team_id)
                    });
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Connection work started successfully");
            }
        }["useStartConnection.useMutation"],
        onError: {
            "useStartConnection.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to start connection: ".concat(error.message));
            }
        }["useStartConnection.useMutation"]
    });
}
_s7(useStartConnection, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useCompleteConnection() {
    _s8();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCompleteConnection.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].completeConnection(data)
        }["useCompleteConnection.useMutation"],
        onSuccess: {
            "useCompleteConnection.useMutation": (updatedHouse)=>{
                queryClient.setQueryData(houseKeys.detail(updatedHouse.id), updatedHouse);
                queryClient.invalidateQueries({
                    queryKey: houseKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.project(updatedHouse.project_id)
                });
                if (updatedHouse.assigned_team_id) {
                    queryClient.invalidateQueries({
                        queryKey: houseKeys.team(updatedHouse.assigned_team_id)
                    });
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Connection completed successfully");
            }
        }["useCompleteConnection.useMutation"],
        onError: {
            "useCompleteConnection.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to complete connection: ".concat(error.message));
            }
        }["useCompleteConnection.useMutation"]
    });
}
_s8(useCompleteConnection, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useAppointments(filters) {
    _s9();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: appointmentKeys.list(filters || {}),
        queryFn: {
            "useAppointments.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentsApi"].getAppointments(filters)
        }["useAppointments.useQuery"],
        staleTime: 2 * 60 * 1000
    });
}
_s9(useAppointments, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useAppointment(id) {
    _s10();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: appointmentKeys.detail(id),
        queryFn: {
            "useAppointment.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentsApi"].getAppointment(id)
        }["useAppointment.useQuery"],
        enabled: !!id,
        staleTime: 2 * 60 * 1000
    });
}
_s10(useAppointment, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useScheduleAppointment() {
    _s11();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useScheduleAppointment.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["housesApi"].scheduleAppointment(data)
        }["useScheduleAppointment.useMutation"],
        onSuccess: {
            "useScheduleAppointment.useMutation": (newAppointment)=>{
                queryClient.invalidateQueries({
                    queryKey: appointmentKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.detail(newAppointment.house_id)
                });
                queryClient.setQueryData(appointmentKeys.detail(newAppointment.id), newAppointment);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Appointment scheduled successfully");
            }
        }["useScheduleAppointment.useMutation"],
        onError: {
            "useScheduleAppointment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to schedule appointment: ".concat(error.message));
            }
        }["useScheduleAppointment.useMutation"]
    });
}
_s11(useScheduleAppointment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateAppointment() {
    _s12();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateAppointment.useMutation": (param)=>{
                let { id, data } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentsApi"].updateAppointment(id, data);
            }
        }["useUpdateAppointment.useMutation"],
        onSuccess: {
            "useUpdateAppointment.useMutation": (updatedAppointment)=>{
                queryClient.setQueryData(appointmentKeys.detail(updatedAppointment.id), updatedAppointment);
                queryClient.invalidateQueries({
                    queryKey: appointmentKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.detail(updatedAppointment.house_id)
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Appointment updated successfully");
            }
        }["useUpdateAppointment.useMutation"],
        onError: {
            "useUpdateAppointment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update appointment: ".concat(error.message));
            }
        }["useUpdateAppointment.useMutation"]
    });
}
_s12(useUpdateAppointment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useCancelAppointment() {
    _s13();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCancelAppointment.useMutation": (param)=>{
                let { id, reason } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentsApi"].cancelAppointment(id, reason);
            }
        }["useCancelAppointment.useMutation"],
        onSuccess: {
            "useCancelAppointment.useMutation": (cancelledAppointment)=>{
                queryClient.setQueryData(appointmentKeys.detail(cancelledAppointment.id), cancelledAppointment);
                queryClient.invalidateQueries({
                    queryKey: appointmentKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.detail(cancelledAppointment.house_id)
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Appointment cancelled");
            }
        }["useCancelAppointment.useMutation"],
        onError: {
            "useCancelAppointment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to cancel appointment: ".concat(error.message));
            }
        }["useCancelAppointment.useMutation"]
    });
}
_s13(useCancelAppointment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useRescheduleAppointment() {
    _s14();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useRescheduleAppointment.useMutation": (param)=>{
                let { id, newDate } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentsApi"].rescheduleAppointment(id, newDate);
            }
        }["useRescheduleAppointment.useMutation"],
        onSuccess: {
            "useRescheduleAppointment.useMutation": (rescheduledAppointment)=>{
                queryClient.setQueryData(appointmentKeys.detail(rescheduledAppointment.id), rescheduledAppointment);
                queryClient.invalidateQueries({
                    queryKey: appointmentKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.detail(rescheduledAppointment.house_id)
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Appointment rescheduled successfully");
            }
        }["useRescheduleAppointment.useMutation"],
        onError: {
            "useRescheduleAppointment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to reschedule appointment: ".concat(error.message));
            }
        }["useRescheduleAppointment.useMutation"]
    });
}
_s14(useRescheduleAppointment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useConfirmAppointment() {
    _s15();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useConfirmAppointment.useMutation": (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentsApi"].confirmAppointment(id)
        }["useConfirmAppointment.useMutation"],
        onSuccess: {
            "useConfirmAppointment.useMutation": (confirmedAppointment)=>{
                queryClient.setQueryData(appointmentKeys.detail(confirmedAppointment.id), confirmedAppointment);
                queryClient.invalidateQueries({
                    queryKey: appointmentKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.detail(confirmedAppointment.house_id)
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Appointment confirmed");
            }
        }["useConfirmAppointment.useMutation"],
        onError: {
            "useConfirmAppointment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to confirm appointment: ".concat(error.message));
            }
        }["useConfirmAppointment.useMutation"]
    });
}
_s15(useConfirmAppointment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useStartAppointment() {
    _s16();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useStartAppointment.useMutation": (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentsApi"].startAppointment(id)
        }["useStartAppointment.useMutation"],
        onSuccess: {
            "useStartAppointment.useMutation": (startedAppointment)=>{
                queryClient.setQueryData(appointmentKeys.detail(startedAppointment.id), startedAppointment);
                queryClient.invalidateQueries({
                    queryKey: appointmentKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.detail(startedAppointment.house_id)
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Appointment started");
            }
        }["useStartAppointment.useMutation"],
        onError: {
            "useStartAppointment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to start appointment: ".concat(error.message));
            }
        }["useStartAppointment.useMutation"]
    });
}
_s16(useStartAppointment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useCompleteAppointment() {
    _s17();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCompleteAppointment.useMutation": (param)=>{
                let { id, notes } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["appointmentsApi"].completeAppointment(id, notes);
            }
        }["useCompleteAppointment.useMutation"],
        onSuccess: {
            "useCompleteAppointment.useMutation": (completedAppointment)=>{
                queryClient.setQueryData(appointmentKeys.detail(completedAppointment.id), completedAppointment);
                queryClient.invalidateQueries({
                    queryKey: appointmentKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: houseKeys.detail(completedAppointment.house_id)
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Appointment completed");
            }
        }["useCompleteAppointment.useMutation"],
        onError: {
            "useCompleteAppointment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to complete appointment: ".concat(error.message));
            }
        }["useCompleteAppointment.useMutation"]
    });
}
_s17(useCompleteAppointment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function usePendingConnections() {
    _s18();
    return useHouses({
        status: "not_assigned",
        page: 1,
        per_page: 50
    });
}
_s18(usePendingConnections, "4oELnQLfyxKBMahFNE/naLNZJO8=", false, function() {
    return [
        useHouses
    ];
});
function useScheduledAppointments() {
    _s19();
    return useAppointments({
        status: "scheduled",
        page: 1,
        per_page: 20
    });
}
_s19(useScheduledAppointments, "9M11ENqSj9CQzSfeu5FT0sRhTXo=", false, function() {
    return [
        useAppointments
    ];
});
function useInProgressConnections() {
    _s20();
    return useHouses({
        status: "in_progress",
        page: 1,
        per_page: 20
    });
}
_s20(useInProgressConnections, "4oELnQLfyxKBMahFNE/naLNZJO8=", false, function() {
    return [
        useHouses
    ];
});
function useCompletedConnections() {
    _s21();
    return useHouses({
        status: "connected",
        page: 1,
        per_page: 20
    });
}
_s21(useCompletedConnections, "4oELnQLfyxKBMahFNE/naLNZJO8=", false, function() {
    return [
        useHouses
    ];
});
function useTodaysAppointments() {
    _s22();
    const today = new Date().toISOString().split('T')[0];
    return useAppointments({
        scheduled_date_from: today,
        scheduled_date_to: today,
        page: 1,
        per_page: 50
    });
}
_s22(useTodaysAppointments, "9M11ENqSj9CQzSfeu5FT0sRhTXo=", false, function() {
    return [
        useAppointments
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-teams.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "teamKeys",
    ()=>teamKeys,
    "useAvailableTeams",
    ()=>useAvailableTeams,
    "useCreateCrew",
    ()=>useCreateCrew,
    "useCreateTeam",
    ()=>useCreateTeam,
    "useCrew",
    ()=>useCrew,
    "useDeleteCrew",
    ()=>useDeleteCrew,
    "useDeleteTeam",
    ()=>useDeleteTeam,
    "useForemenUsers",
    ()=>useForemenUsers,
    "useGlobalTeams",
    ()=>useGlobalTeams,
    "useProjectTeams",
    ()=>useProjectTeams,
    "useProjectUsers",
    ()=>useProjectUsers,
    "useTeams",
    ()=>useTeams,
    "useUpdateCrew",
    ()=>useUpdateCrew,
    "useUpdateTeam",
    ()=>useUpdateTeam
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature(), _s10 = __turbopack_context__.k.signature(), _s11 = __turbopack_context__.k.signature(), _s12 = __turbopack_context__.k.signature();
;
;
;
const teamKeys = {
    all: [
        "teams"
    ],
    crews: ()=>[
            ...teamKeys.all,
            "crews"
        ],
    crew: (id)=>[
            ...teamKeys.all,
            "crew",
            id
        ]
};
function useTeams() {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: teamKeys.crews(),
        queryFn: {
            "useTeams.useQuery": async ()=>{
                const response = await fetch('/api/crews');
                if (!response.ok) {
                    throw new Error('Failed to fetch crews');
                }
                const data = await response.json();
                return data.crews || [];
            }
        }["useTeams.useQuery"],
        staleTime: 30 * 1000
    });
}
_s(useTeams, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCrew(id) {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: teamKeys.crew(id),
        queryFn: {
            "useCrew.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["teamsApi"].getCrew(id)
        }["useCrew.useQuery"],
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}
_s1(useCrew, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateCrew() {
    _s2();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateCrew.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["teamsApi"].createCrew(data)
        }["useCreateCrew.useMutation"],
        onSuccess: {
            "useCreateCrew.useMutation": (newCrew)=>{
                // Invalidate and refetch crews list
                queryClient.invalidateQueries({
                    queryKey: teamKeys.crews()
                });
                // Add the new crew to the cache
                queryClient.setQueryData(teamKeys.crew(newCrew.id), newCrew);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Team created successfully");
            }
        }["useCreateCrew.useMutation"],
        onError: {
            "useCreateCrew.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create team: ".concat(error.message));
            }
        }["useCreateCrew.useMutation"]
    });
}
_s2(useCreateCrew, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateCrew() {
    _s3();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateCrew.useMutation": (param)=>{
                let { id, data } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["teamsApi"].updateCrew(id, data);
            }
        }["useUpdateCrew.useMutation"],
        onMutate: {
            "useUpdateCrew.useMutation": async (param)=>{
                let { id, data } = param;
                // Cancel any outgoing refetches
                await queryClient.cancelQueries({
                    queryKey: teamKeys.crew(id)
                });
                // Snapshot the previous value
                const previousCrew = queryClient.getQueryData(teamKeys.crew(id));
                // Optimistically update to the new value
                queryClient.setQueryData(teamKeys.crew(id), {
                    "useUpdateCrew.useMutation": (old)=>{
                        if (!old) return old;
                        return {
                            ...old,
                            ...data
                        };
                    }
                }["useUpdateCrew.useMutation"]);
                // Return a context object with the snapshotted value
                return {
                    previousCrew
                };
            }
        }["useUpdateCrew.useMutation"],
        onError: {
            "useUpdateCrew.useMutation": (error, param, context)=>{
                let { id } = param;
                // If the mutation fails, use the context returned from onMutate to roll back
                if (context === null || context === void 0 ? void 0 : context.previousCrew) {
                    queryClient.setQueryData(teamKeys.crew(id), context.previousCrew);
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update team: ".concat(error.message));
            }
        }["useUpdateCrew.useMutation"],
        onSuccess: {
            "useUpdateCrew.useMutation": ()=>{
                // Invalidate and refetch crews list
                queryClient.invalidateQueries({
                    queryKey: teamKeys.crews()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Team updated successfully");
            }
        }["useUpdateCrew.useMutation"],
        onSettled: {
            "useUpdateCrew.useMutation": (data, error, param)=>{
                let { id } = param;
                // Always refetch after error or success
                queryClient.invalidateQueries({
                    queryKey: teamKeys.crew(id)
                });
            }
        }["useUpdateCrew.useMutation"]
    });
}
_s3(useUpdateCrew, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteCrew() {
    _s4();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteCrew.useMutation": (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["teamsApi"].deleteCrew(id)
        }["useDeleteCrew.useMutation"],
        onSuccess: {
            "useDeleteCrew.useMutation": (_, deletedId)=>{
                // Remove from cache
                queryClient.removeQueries({
                    queryKey: teamKeys.crew(deletedId)
                });
                // Invalidate crews list
                queryClient.invalidateQueries({
                    queryKey: teamKeys.crews()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Team deleted successfully");
            }
        }["useDeleteCrew.useMutation"],
        onError: {
            "useDeleteCrew.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to delete team: ".concat(error.message));
            }
        }["useDeleteCrew.useMutation"]
    });
}
_s4(useDeleteCrew, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useGlobalTeams() {
    _s5();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'global-teams'
        ],
        queryFn: {
            "useGlobalTeams.useQuery": async ()=>{
                const response = await fetch('/api/crews');
                if (!response.ok) {
                    throw new Error('Failed to fetch global teams');
                }
                const data = await response.json();
                const crews = data.crews || [];
                // Transform to GlobalTeam format and count projects per team
                const projectCounts = {};
                crews.forEach({
                    "useGlobalTeams.useQuery": (crew)=>{
                        if (crew.project_id) {
                            projectCounts[crew.name] = (projectCounts[crew.name] || 0) + 1;
                        }
                    }
                }["useGlobalTeams.useQuery"]);
                return crews.map({
                    "useGlobalTeams.useQuery": (crew)=>{
                        var _crew_foreman;
                        return {
                            id: crew.id,
                            name: crew.name,
                            foreman_name: ((_crew_foreman = crew.foreman) === null || _crew_foreman === void 0 ? void 0 : _crew_foreman.full_name) || crew.foreman_name,
                            is_active: crew.status === 'active',
                            project_count: projectCounts[crew.name] || 0,
                            specialization: 'mixed'
                        };
                    }
                }["useGlobalTeams.useQuery"]);
            }
        }["useGlobalTeams.useQuery"]
    });
}
_s5(useGlobalTeams, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useProjectUsers(projectId) {
    _s6();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-users',
            projectId
        ],
        queryFn: {
            "useProjectUsers.useQuery": async ()=>{
                try {
                    const response = await fetch("/api/projects/".concat(projectId, "/users"));
                    if (!response.ok) {
                        if (response.status === 404) {
                            return []; // No users assigned yet
                        }
                        throw new Error('Failed to fetch project users');
                    }
                    const data = await response.json();
                    return data.users || [];
                } catch (error) {
                    console.warn('Project users not available:', error);
                    return []; // Return empty array instead of mock data
                }
            }
        }["useProjectUsers.useQuery"],
        enabled: !!projectId
    });
}
_s6(useProjectUsers, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useForemenUsers() {
    _s7();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'foremen-users'
        ],
        queryFn: {
            "useForemenUsers.useQuery": async ()=>{
                const response = await fetch('/api/users?role=foreman&is_active=true');
                if (!response.ok) {
                    // Try to get PM users as well if no foremen
                    const pmResponse = await fetch('/api/users?role=pm&is_active=true');
                    if (!pmResponse.ok) {
                        throw new Error('Failed to fetch users');
                    }
                    const pmData = await pmResponse.json();
                    return pmData.items || [];
                }
                const data = await response.json();
                // If no foremen, get both foremen and PMs
                if (data.items.length === 0) {
                    const allResponse = await fetch('/api/users?is_active=true');
                    if (!allResponse.ok) {
                        throw new Error('Failed to fetch users');
                    }
                    const allData = await allResponse.json();
                    return (allData.items || []).filter({
                        "useForemenUsers.useQuery": (user)=>user.role === 'foreman' || user.role === 'pm'
                    }["useForemenUsers.useQuery"]);
                }
                return data.items || [];
            }
        }["useForemenUsers.useQuery"]
    });
}
_s7(useForemenUsers, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateTeam() {
    _s8();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateTeam.useMutation": async (data)=>{
                const response = await fetch('/api/crews', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create team');
                }
                return response.json();
            }
        }["useCreateTeam.useMutation"],
        onSuccess: {
            "useCreateTeam.useMutation": (data, variables)=>{
                if (variables.project_id) {
                    queryClient.invalidateQueries({
                        queryKey: [
                            'project-teams',
                            variables.project_id
                        ]
                    });
                    queryClient.invalidateQueries({
                        queryKey: [
                            'project-preparation',
                            variables.project_id
                        ]
                    });
                }
                queryClient.invalidateQueries({
                    queryKey: [
                        'global-teams'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: teamKeys.crews()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Team created successfully');
            }
        }["useCreateTeam.useMutation"],
        onError: {
            "useCreateTeam.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useCreateTeam.useMutation"]
    });
}
_s8(useCreateTeam, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useProjectTeams(projectId) {
    _s9();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-teams',
            projectId
        ],
        queryFn: {
            "useProjectTeams.useQuery": async ()=>{
                const response = await fetch("/api/crews?project_id=".concat(projectId));
                if (!response.ok) {
                    throw new Error('Failed to fetch project teams');
                }
                const data = await response.json();
                return data.crews || [];
            }
        }["useProjectTeams.useQuery"],
        enabled: !!projectId
    });
}
_s9(useProjectTeams, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useAvailableTeams() {
    _s10();
    const { data: crews, ...rest } = useTeams();
    return {
        ...rest,
        data: (crews === null || crews === void 0 ? void 0 : crews.filter((crew)=>!crew.project_id)) || []
    };
}
_s10(useAvailableTeams, "n9BWRtOU43sZmkS331gjrDy+CSQ=", false, function() {
    return [
        useTeams
    ];
});
function useUpdateTeam() {
    _s11();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateTeam.useMutation": async (param)=>{
                let { id, data } = param;
                const response = await fetch("/api/crews/".concat(id), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to update team');
                }
                return response.json();
            }
        }["useUpdateTeam.useMutation"],
        onSuccess: {
            "useUpdateTeam.useMutation": (data, variables)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-teams'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'global-teams'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: teamKeys.crews()
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Team updated successfully');
            }
        }["useUpdateTeam.useMutation"],
        onError: {
            "useUpdateTeam.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useUpdateTeam.useMutation"]
    });
}
_s11(useUpdateTeam, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteTeam() {
    _s12();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteTeam.useMutation": async (id)=>{
                const response = await fetch("/api/crews/".concat(id), {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to delete team');
                }
                return response.json();
            }
        }["useDeleteTeam.useMutation"],
        onSuccess: {
            "useDeleteTeam.useMutation": (data)=>{
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-teams'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'global-teams'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: teamKeys.crews()
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-preparation'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Team deleted successfully');
            }
        }["useDeleteTeam.useMutation"],
        onError: {
            "useDeleteTeam.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message);
            }
        }["useDeleteTeam.useMutation"]
    });
}
_s12(useDeleteTeam, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-resources.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "resourceKeys",
    ()=>resourceKeys,
    "useAvailableEquipment",
    ()=>useAvailableEquipment,
    "useAvailableVehicles",
    ()=>useAvailableVehicles,
    "useCreateEquipmentAssignment",
    ()=>useCreateEquipmentAssignment,
    "useCreateRentalEquipment",
    ()=>useCreateRentalEquipment,
    "useCreateRentalVehicle",
    ()=>useCreateRentalVehicle,
    "useCreateVehicleAssignment",
    ()=>useCreateVehicleAssignment,
    "useProjectResources",
    ()=>useProjectResources,
    "useRemoveResourceAssignment",
    ()=>useRemoveResourceAssignment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature();
;
;
const resourceKeys = {
    all: [
        "resources"
    ],
    projectResources: (projectId)=>[
            ...resourceKeys.all,
            "project",
            projectId
        ],
    availableVehicles: ()=>[
            ...resourceKeys.all,
            "available-vehicles"
        ],
    availableEquipment: ()=>[
            ...resourceKeys.all,
            "available-equipment"
        ]
};
function useProjectResources(projectId) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: resourceKeys.projectResources(projectId),
        queryFn: {
            "useProjectResources.useQuery": async ()=>{
                // TODO: Implement proper project resources API
                return {
                    vehicles: [],
                    equipment: [],
                    summary: {
                        total_resources: 0,
                        total_vehicles: 0,
                        total_equipment: 0,
                        total_cost: 0
                    }
                };
            }
        }["useProjectResources.useQuery"],
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000
    });
}
_s(useProjectResources, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useAvailableVehicles() {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: resourceKeys.availableVehicles(),
        queryFn: {
            "useAvailableVehicles.useQuery": async ()=>{
                // TODO: Implement proper available vehicles API
                return [];
            }
        }["useAvailableVehicles.useQuery"],
        staleTime: 2 * 60 * 1000
    });
}
_s1(useAvailableVehicles, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useAvailableEquipment() {
    _s2();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: resourceKeys.availableEquipment(),
        queryFn: {
            "useAvailableEquipment.useQuery": async ()=>{
                // TODO: Implement proper available equipment API
                return [];
            }
        }["useAvailableEquipment.useQuery"],
        staleTime: 2 * 60 * 1000
    });
}
_s2(useAvailableEquipment, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateVehicleAssignment() {
    _s3();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateVehicleAssignment.useMutation": async (data)=>{
                // TODO: Implement proper vehicle assignment API
                throw new Error('Vehicle assignment feature is not yet implemented');
            }
        }["useCreateVehicleAssignment.useMutation"],
        onSuccess: {
            "useCreateVehicleAssignment.useMutation": (data, variables)=>{
                // Invalidate and refetch project resources
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.projectResources(variables.project_id)
                });
                // Invalidate available vehicles list
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.availableVehicles()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Vehicle assigned successfully');
            }
        }["useCreateVehicleAssignment.useMutation"],
        onError: {
            "useCreateVehicleAssignment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to assign vehicle: ".concat(error.message));
            }
        }["useCreateVehicleAssignment.useMutation"]
    });
}
_s3(useCreateVehicleAssignment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useCreateEquipmentAssignment() {
    _s4();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateEquipmentAssignment.useMutation": async (data)=>{
                // TODO: Implement proper equipment assignment API
                throw new Error('Equipment assignment feature is not yet implemented');
            }
        }["useCreateEquipmentAssignment.useMutation"],
        onSuccess: {
            "useCreateEquipmentAssignment.useMutation": (data, variables)=>{
                // Invalidate and refetch project resources
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.projectResources(variables.project_id)
                });
                // Invalidate available equipment list
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.availableEquipment()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Equipment assigned successfully');
            }
        }["useCreateEquipmentAssignment.useMutation"],
        onError: {
            "useCreateEquipmentAssignment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to assign equipment: ".concat(error.message));
            }
        }["useCreateEquipmentAssignment.useMutation"]
    });
}
_s4(useCreateEquipmentAssignment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useCreateRentalVehicle() {
    _s5();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateRentalVehicle.useMutation": async (data)=>{
                const response = await fetch('/api/resources/rental-vehicles', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create rental vehicle');
                }
                return response.json();
            }
        }["useCreateRentalVehicle.useMutation"],
        onSuccess: {
            "useCreateRentalVehicle.useMutation": (data, variables)=>{
                // Invalidate and refetch project resources
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.projectResources(variables.project_id)
                });
                // Invalidate available vehicles list
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.availableVehicles()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Rental vehicle created and assigned successfully');
            }
        }["useCreateRentalVehicle.useMutation"],
        onError: {
            "useCreateRentalVehicle.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create rental vehicle: ".concat(error.message));
            }
        }["useCreateRentalVehicle.useMutation"]
    });
}
_s5(useCreateRentalVehicle, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useCreateRentalEquipment() {
    _s6();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateRentalEquipment.useMutation": async (data)=>{
                const response = await fetch('/api/resources/rental-equipment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create rental equipment');
                }
                return response.json();
            }
        }["useCreateRentalEquipment.useMutation"],
        onSuccess: {
            "useCreateRentalEquipment.useMutation": (data, variables)=>{
                // Invalidate and refetch project resources
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.projectResources(variables.project_id)
                });
                // Invalidate available equipment list
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.availableEquipment()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Rental equipment created and assigned successfully');
            }
        }["useCreateRentalEquipment.useMutation"],
        onError: {
            "useCreateRentalEquipment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create rental equipment: ".concat(error.message));
            }
        }["useCreateRentalEquipment.useMutation"]
    });
}
_s6(useCreateRentalEquipment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useRemoveResourceAssignment() {
    _s7();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useRemoveResourceAssignment.useMutation": async (param)=>{
                let { projectId, resourceId, resourceType } = param;
                // TODO: Implement proper resource assignment removal API
                throw new Error('Resource assignment removal feature is not yet implemented');
            }
        }["useRemoveResourceAssignment.useMutation"],
        onSuccess: {
            "useRemoveResourceAssignment.useMutation": (data, variables)=>{
                // Invalidate and refetch project resources
                queryClient.invalidateQueries({
                    queryKey: resourceKeys.projectResources(variables.projectId)
                });
                // Invalidate available resources lists
                if (variables.resourceType === 'vehicle') {
                    queryClient.invalidateQueries({
                        queryKey: resourceKeys.availableVehicles()
                    });
                } else {
                    queryClient.invalidateQueries({
                        queryKey: resourceKeys.availableEquipment()
                    });
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Resource assignment removed successfully');
            }
        }["useRemoveResourceAssignment.useMutation"],
        onError: {
            "useRemoveResourceAssignment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to remove resource assignment: ".concat(error.message));
            }
        }["useRemoveResourceAssignment.useMutation"]
    });
}
_s7(useRemoveResourceAssignment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-materials.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "allocationKeys",
    ()=>allocationKeys,
    "invalidateAllMaterialQueries",
    ()=>invalidateAllMaterialQueries,
    "materialKeys",
    ()=>materialKeys,
    "orderKeys",
    ()=>orderKeys,
    "supplierKeys",
    ()=>supplierKeys,
    "useAdjustStock",
    ()=>useAdjustStock,
    "useAllocation",
    ()=>useAllocation,
    "useAllocations",
    ()=>useAllocations,
    "useAssignMaterialToProject",
    ()=>useAssignMaterialToProject,
    "useConsumeMaterial",
    ()=>useConsumeMaterial,
    "useCreateAllocation",
    ()=>useCreateAllocation,
    "useCreateMaterial",
    ()=>useCreateMaterial,
    "useCreateOrder",
    ()=>useCreateOrder,
    "useCreateSupplier",
    ()=>useCreateSupplier,
    "useDeleteMaterial",
    ()=>useDeleteMaterial,
    "useDeleteMaterialAssignment",
    ()=>useDeleteMaterialAssignment,
    "useDeleteSupplier",
    ()=>useDeleteSupplier,
    "useLowStockMaterials",
    ()=>useLowStockMaterials,
    "useMaterial",
    ()=>useMaterial,
    "useMaterialAllocationTargets",
    ()=>useMaterialAllocationTargets,
    "useMaterials",
    ()=>useMaterials,
    "useOrder",
    ()=>useOrder,
    "useOrders",
    ()=>useOrders,
    "usePendingOrders",
    ()=>usePendingOrders,
    "useProjectAllocations",
    ()=>useProjectAllocations,
    "useProjectMaterials",
    ()=>useProjectMaterials,
    "useRecordUsage",
    ()=>useRecordUsage,
    "useSupplier",
    ()=>useSupplier,
    "useSupplierOrders",
    ()=>useSupplierOrders,
    "useSuppliers",
    ()=>useSuppliers,
    "useTeamAllocations",
    ()=>useTeamAllocations,
    "useUnifiedProjectMaterials",
    ()=>useUnifiedProjectMaterials,
    "useUnifiedWarehouseMaterials",
    ()=>useUnifiedWarehouseMaterials,
    "useUpdateMaterial",
    ()=>useUpdateMaterial,
    "useUpdateMaterialAssignment",
    ()=>useUpdateMaterialAssignment,
    "useUpdateOrderStatus",
    ()=>useUpdateOrderStatus,
    "useUpdateSupplier",
    ()=>useUpdateSupplier,
    "useWarehouseMaterials",
    ()=>useWarehouseMaterials
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature(), _s8 = __turbopack_context__.k.signature(), _s9 = __turbopack_context__.k.signature(), _s10 = __turbopack_context__.k.signature(), _s11 = __turbopack_context__.k.signature(), _s12 = __turbopack_context__.k.signature(), _s13 = __turbopack_context__.k.signature(), _s14 = __turbopack_context__.k.signature(), _s15 = __turbopack_context__.k.signature(), _s16 = __turbopack_context__.k.signature(), _s17 = __turbopack_context__.k.signature(), _s18 = __turbopack_context__.k.signature(), _s19 = __turbopack_context__.k.signature(), _s20 = __turbopack_context__.k.signature(), _s21 = __turbopack_context__.k.signature(), _s22 = __turbopack_context__.k.signature(), _s23 = __turbopack_context__.k.signature(), _s24 = __turbopack_context__.k.signature(), _s25 = __turbopack_context__.k.signature(), _s26 = __turbopack_context__.k.signature(), _s27 = __turbopack_context__.k.signature(), _s28 = __turbopack_context__.k.signature(), _s29 = __turbopack_context__.k.signature(), _s30 = __turbopack_context__.k.signature(), _s31 = __turbopack_context__.k.signature(), _s32 = __turbopack_context__.k.signature();
;
;
;
const materialKeys = {
    all: [
        "materials"
    ],
    lists: ()=>[
            ...materialKeys.all,
            "list"
        ],
    list: (filters)=>[
            ...materialKeys.lists(),
            filters
        ],
    details: ()=>[
            ...materialKeys.all,
            "detail"
        ],
    detail: (id)=>[
            ...materialKeys.details(),
            id
        ],
    lowStock: ()=>[
            ...materialKeys.all,
            "low-stock"
        ]
};
const supplierKeys = {
    all: [
        "suppliers"
    ],
    lists: ()=>[
            ...supplierKeys.all,
            "list"
        ],
    details: ()=>[
            ...supplierKeys.all,
            "detail"
        ],
    detail: (id)=>[
            ...supplierKeys.details(),
            id
        ]
};
const allocationKeys = {
    all: [
        "allocations"
    ],
    lists: ()=>[
            ...allocationKeys.all,
            "list"
        ],
    list: (filters)=>[
            ...allocationKeys.lists(),
            filters
        ],
    details: ()=>[
            ...allocationKeys.all,
            "detail"
        ],
    detail: (id)=>[
            ...allocationKeys.details(),
            id
        ]
};
const orderKeys = {
    all: [
        "orders"
    ],
    lists: ()=>[
            ...orderKeys.all,
            "list"
        ],
    list: (filters)=>[
            ...orderKeys.lists(),
            filters
        ],
    details: ()=>[
            ...orderKeys.all,
            "detail"
        ],
    detail: (id)=>[
            ...orderKeys.details(),
            id
        ]
};
function invalidateAllMaterialQueries(queryClient) {
    // Invalidate all material queries
    queryClient.invalidateQueries({
        queryKey: materialKeys.all
    });
    queryClient.invalidateQueries({
        queryKey: allocationKeys.all
    });
    queryClient.invalidateQueries({
        queryKey: orderKeys.all
    });
    // Invalidate unified material views
    queryClient.invalidateQueries({
        queryKey: [
            ...materialKeys.all,
            "unified-warehouse"
        ]
    });
    queryClient.invalidateQueries({
        queryKey: [
            ...materialKeys.all,
            "allocation-targets"
        ]
    });
    // Force refetch critical queries
    queryClient.refetchQueries({
        queryKey: [
            ...materialKeys.all,
            "unified-warehouse"
        ],
        type: 'active'
    });
}
function useMaterials(filters) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialKeys.list(filters || {}),
        queryFn: {
            "useMaterials.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialsApi"].getMaterials(filters)
        }["useMaterials.useQuery"],
        staleTime: 2 * 60 * 1000
    });
}
_s(useMaterials, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useMaterial(id) {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialKeys.detail(id),
        queryFn: {
            "useMaterial.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialsApi"].getMaterial(id)
        }["useMaterial.useQuery"],
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}
_s1(useMaterial, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useLowStockMaterials() {
    _s2();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialKeys.lowStock(),
        queryFn: {
            "useLowStockMaterials.useQuery": async ()=>{
                const response = await fetch('/api/materials/low-stock');
                if (!response.ok) {
                    throw new Error('Failed to fetch low stock materials');
                }
                const data = await response.json();
                return data.materials || []; // Extract materials array from API response
            }
        }["useLowStockMaterials.useQuery"],
        staleTime: 2 * 60 * 1000
    });
}
_s2(useLowStockMaterials, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useUnifiedWarehouseMaterials() {
    _s3();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...materialKeys.all,
            "unified-warehouse"
        ],
        queryFn: {
            "useUnifiedWarehouseMaterials.useQuery": async ()=>{
                const response = await fetch('/api/materials/unified?view=warehouse');
                if (!response.ok) {
                    throw new Error('Failed to fetch warehouse materials');
                }
                const data = await response.json();
                return data.materials || [];
            }
        }["useUnifiedWarehouseMaterials.useQuery"],
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchInterval: 60 * 1000
    });
}
_s3(useUnifiedWarehouseMaterials, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useUnifiedProjectMaterials(projectId) {
    _s4();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...allocationKeys.all,
            "project",
            projectId,
            "unified"
        ],
        queryFn: {
            "useUnifiedProjectMaterials.useQuery": async ()=>{
                const response = await fetch("/api/materials/unified?view=project_allocations&project_id=".concat(projectId));
                if (!response.ok) {
                    throw new Error('Failed to fetch project materials');
                }
                const data = await response.json();
                return {
                    materials: data.materials || [],
                    summary: data.allocation_summary
                };
            }
        }["useUnifiedProjectMaterials.useQuery"],
        enabled: !!projectId,
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}
_s4(useUnifiedProjectMaterials, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useMaterialAllocationTargets() {
    _s5();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...materialKeys.all,
            "allocation-targets"
        ],
        queryFn: {
            "useMaterialAllocationTargets.useQuery": async ()=>{
                const response = await fetch('/api/materials/unified?view=allocation_targets');
                if (!response.ok) {
                    throw new Error('Failed to fetch allocation targets');
                }
                const data = await response.json();
                return data.materials || [];
            }
        }["useMaterialAllocationTargets.useQuery"],
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true
    });
}
_s5(useMaterialAllocationTargets, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateMaterial() {
    _s6();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateMaterial.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialsApi"].createMaterial(data)
        }["useCreateMaterial.useMutation"],
        onSuccess: {
            "useCreateMaterial.useMutation": (newMaterial)=>{
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lists()
                });
                queryClient.setQueryData(materialKeys.detail(newMaterial.id), newMaterial);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Material created successfully");
            }
        }["useCreateMaterial.useMutation"],
        onError: {
            "useCreateMaterial.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create material: ".concat(error.message));
            }
        }["useCreateMaterial.useMutation"]
    });
}
_s6(useCreateMaterial, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateMaterial() {
    _s7();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateMaterial.useMutation": (param)=>{
                let { id, data } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialsApi"].updateMaterial(id, data);
            }
        }["useUpdateMaterial.useMutation"],
        onMutate: {
            "useUpdateMaterial.useMutation": async (param)=>{
                let { id, data } = param;
                await queryClient.cancelQueries({
                    queryKey: materialKeys.detail(id)
                });
                const previousMaterial = queryClient.getQueryData(materialKeys.detail(id));
                queryClient.setQueryData(materialKeys.detail(id), {
                    "useUpdateMaterial.useMutation": (old)=>{
                        if (!old) return old;
                        return {
                            ...old,
                            ...data
                        };
                    }
                }["useUpdateMaterial.useMutation"]);
                return {
                    previousMaterial
                };
            }
        }["useUpdateMaterial.useMutation"],
        onError: {
            "useUpdateMaterial.useMutation": (error, param, context)=>{
                let { id } = param;
                if (context === null || context === void 0 ? void 0 : context.previousMaterial) {
                    queryClient.setQueryData(materialKeys.detail(id), context.previousMaterial);
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update material: ".concat(error.message));
            }
        }["useUpdateMaterial.useMutation"],
        onSuccess: {
            "useUpdateMaterial.useMutation": ()=>{
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lowStock()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Material updated successfully");
            }
        }["useUpdateMaterial.useMutation"],
        onSettled: {
            "useUpdateMaterial.useMutation": (data, error, param)=>{
                let { id } = param;
                queryClient.invalidateQueries({
                    queryKey: materialKeys.detail(id)
                });
            }
        }["useUpdateMaterial.useMutation"]
    });
}
_s7(useUpdateMaterial, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteMaterial() {
    _s8();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteMaterial.useMutation": (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialsApi"].deleteMaterial(id)
        }["useDeleteMaterial.useMutation"],
        onSuccess: {
            "useDeleteMaterial.useMutation": (_, deletedId)=>{
                queryClient.removeQueries({
                    queryKey: materialKeys.detail(deletedId)
                });
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lowStock()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Material deleted successfully");
            }
        }["useDeleteMaterial.useMutation"],
        onError: {
            "useDeleteMaterial.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to delete material: ".concat(error.message));
            }
        }["useDeleteMaterial.useMutation"]
    });
}
_s8(useDeleteMaterial, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useAdjustStock() {
    _s9();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useAdjustStock.useMutation": (param)=>{
                let { id, adjustment } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialsApi"].adjustStock(id, adjustment);
            }
        }["useAdjustStock.useMutation"],
        onSuccess: {
            "useAdjustStock.useMutation": (updatedMaterial)=>{
                queryClient.setQueryData(materialKeys.detail(updatedMaterial.id), updatedMaterial);
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lowStock()
                });
                // Invalidate unified warehouse and allocation views
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "unified-warehouse"
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "allocation-targets"
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Stock adjusted successfully");
            }
        }["useAdjustStock.useMutation"],
        onError: {
            "useAdjustStock.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to adjust stock: ".concat(error.message));
            }
        }["useAdjustStock.useMutation"]
    });
}
_s9(useAdjustStock, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useConsumeMaterial() {
    _s10();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useConsumeMaterial.useMutation": (data)=>{
                return fetch('/api/materials/consume', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then({
                    "useConsumeMaterial.useMutation": (response)=>{
                        if (!response.ok) {
                            return response.json().then({
                                "useConsumeMaterial.useMutation": (err)=>Promise.reject(new Error(err.error || 'Failed to consume material'))
                            }["useConsumeMaterial.useMutation"]);
                        }
                        return response.json();
                    }
                }["useConsumeMaterial.useMutation"]);
            }
        }["useConsumeMaterial.useMutation"],
        onSuccess: {
            "useConsumeMaterial.useMutation": (result, variables)=>{
                // Invalidate all material-related queries to ensure consistency
                queryClient.invalidateQueries({
                    queryKey: materialKeys.all
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        ...allocationKeys.all
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "unified-warehouse"
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "allocation-targets"
                    ]
                });
                // If we know the project, invalidate project-specific queries
                if (variables.work_entry_id) {
                    queryClient.invalidateQueries({
                        queryKey: [
                            ...allocationKeys.all,
                            "project"
                        ]
                    });
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(result.message || "Material consumed successfully");
            }
        }["useConsumeMaterial.useMutation"],
        onError: {
            "useConsumeMaterial.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to consume material: ".concat(error.message));
            }
        }["useConsumeMaterial.useMutation"]
    });
}
_s10(useConsumeMaterial, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useSuppliers() {
    _s11();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: supplierKeys.lists(),
        queryFn: {
            "useSuppliers.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suppliersApi"].getSuppliers()
        }["useSuppliers.useQuery"],
        staleTime: 10 * 60 * 1000
    });
}
_s11(useSuppliers, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useSupplier(id) {
    _s12();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: supplierKeys.detail(id),
        queryFn: {
            "useSupplier.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suppliersApi"].getSupplier(id)
        }["useSupplier.useQuery"],
        enabled: !!id,
        staleTime: 10 * 60 * 1000
    });
}
_s12(useSupplier, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateSupplier() {
    _s13();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateSupplier.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suppliersApi"].createSupplier(data)
        }["useCreateSupplier.useMutation"],
        onSuccess: {
            "useCreateSupplier.useMutation": (newSupplier)=>{
                queryClient.invalidateQueries({
                    queryKey: supplierKeys.lists()
                });
                queryClient.setQueryData(supplierKeys.detail(newSupplier.id), newSupplier);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Supplier created successfully");
            }
        }["useCreateSupplier.useMutation"],
        onError: {
            "useCreateSupplier.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create supplier: ".concat(error.message));
            }
        }["useCreateSupplier.useMutation"]
    });
}
_s13(useCreateSupplier, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateSupplier() {
    _s14();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateSupplier.useMutation": (param)=>{
                let { id, data } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suppliersApi"].updateSupplier(id, data);
            }
        }["useUpdateSupplier.useMutation"],
        onSuccess: {
            "useUpdateSupplier.useMutation": ()=>{
                queryClient.invalidateQueries({
                    queryKey: supplierKeys.lists()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Supplier updated successfully");
            }
        }["useUpdateSupplier.useMutation"],
        onError: {
            "useUpdateSupplier.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update supplier: ".concat(error.message));
            }
        }["useUpdateSupplier.useMutation"]
    });
}
_s14(useUpdateSupplier, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteSupplier() {
    _s15();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteSupplier.useMutation": (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["suppliersApi"].deleteSupplier(id)
        }["useDeleteSupplier.useMutation"],
        onSuccess: {
            "useDeleteSupplier.useMutation": (_, deletedId)=>{
                queryClient.removeQueries({
                    queryKey: supplierKeys.detail(deletedId)
                });
                queryClient.invalidateQueries({
                    queryKey: supplierKeys.lists()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Supplier deleted successfully");
            }
        }["useDeleteSupplier.useMutation"],
        onError: {
            "useDeleteSupplier.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to delete supplier: ".concat(error.message));
            }
        }["useDeleteSupplier.useMutation"]
    });
}
_s15(useDeleteSupplier, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useAllocations(filters) {
    _s16();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: allocationKeys.list(filters || {}),
        queryFn: {
            "useAllocations.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialAllocationsApi"].getAllocations(filters)
        }["useAllocations.useQuery"],
        staleTime: 2 * 60 * 1000
    });
}
_s16(useAllocations, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useAllocation(id) {
    _s17();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: allocationKeys.detail(id),
        queryFn: {
            "useAllocation.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialAllocationsApi"].getAllocation(id)
        }["useAllocation.useQuery"],
        enabled: !!id,
        staleTime: 2 * 60 * 1000
    });
}
_s17(useAllocation, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateAllocation() {
    _s18();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateAllocation.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialAllocationsApi"].createAllocation(data)
        }["useCreateAllocation.useMutation"],
        onSuccess: {
            "useCreateAllocation.useMutation": (newAllocation)=>{
                queryClient.invalidateQueries({
                    queryKey: allocationKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lowStock()
                });
                queryClient.setQueryData(allocationKeys.detail(newAllocation.id), newAllocation);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Material allocated successfully");
            }
        }["useCreateAllocation.useMutation"],
        onError: {
            "useCreateAllocation.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to allocate material: ".concat(error.message));
            }
        }["useCreateAllocation.useMutation"]
    });
}
_s18(useCreateAllocation, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useRecordUsage() {
    _s19();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useRecordUsage.useMutation": (param)=>{
                let { id, usage } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialAllocationsApi"].recordUsage(id, usage);
            }
        }["useRecordUsage.useMutation"],
        onSuccess: {
            "useRecordUsage.useMutation": (updatedAllocation)=>{
                queryClient.setQueryData(allocationKeys.detail(updatedAllocation.id), updatedAllocation);
                queryClient.invalidateQueries({
                    queryKey: allocationKeys.lists()
                });
                queryClient.invalidateQueries({
                    queryKey: materialKeys.lists()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Usage recorded successfully");
            }
        }["useRecordUsage.useMutation"],
        onError: {
            "useRecordUsage.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to record usage: ".concat(error.message));
            }
        }["useRecordUsage.useMutation"]
    });
}
_s19(useRecordUsage, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useOrders(filters) {
    _s20();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: orderKeys.list(filters || {}),
        queryFn: {
            "useOrders.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialOrdersApi"].getOrders(filters)
        }["useOrders.useQuery"],
        staleTime: 3 * 60 * 1000
    });
}
_s20(useOrders, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useOrder(id) {
    _s21();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: orderKeys.detail(id),
        queryFn: {
            "useOrder.useQuery": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialOrdersApi"].getOrder(id)
        }["useOrder.useQuery"],
        enabled: !!id,
        staleTime: 3 * 60 * 1000
    });
}
_s21(useOrder, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateOrder() {
    _s22();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateOrder.useMutation": (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialOrdersApi"].createOrder(data)
        }["useCreateOrder.useMutation"],
        onSuccess: {
            "useCreateOrder.useMutation": (newOrder)=>{
                queryClient.invalidateQueries({
                    queryKey: orderKeys.lists()
                });
                queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Order created successfully");
            }
        }["useCreateOrder.useMutation"],
        onError: {
            "useCreateOrder.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create order: ".concat(error.message));
            }
        }["useCreateOrder.useMutation"]
    });
}
_s22(useCreateOrder, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateOrderStatus() {
    _s23();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateOrderStatus.useMutation": (param)=>{
                let { id, status } = param;
                return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["materialOrdersApi"].updateOrderStatus(id, status);
            }
        }["useUpdateOrderStatus.useMutation"],
        onSuccess: {
            "useUpdateOrderStatus.useMutation": (updatedOrder)=>{
                queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
                queryClient.invalidateQueries({
                    queryKey: orderKeys.lists()
                });
                // If order is delivered, update material stock levels
                if (updatedOrder.status === "delivered") {
                    queryClient.invalidateQueries({
                        queryKey: materialKeys.lists()
                    });
                    queryClient.invalidateQueries({
                        queryKey: materialKeys.lowStock()
                    });
                }
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Order status updated successfully");
            }
        }["useUpdateOrderStatus.useMutation"],
        onError: {
            "useUpdateOrderStatus.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update order status: ".concat(error.message));
            }
        }["useUpdateOrderStatus.useMutation"]
    });
}
_s23(useUpdateOrderStatus, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useProjectAllocations(projectId) {
    _s24();
    return useAllocations({
        project_id: projectId
    });
}
_s24(useProjectAllocations, "dtNNsXBz0j28zS2iN14ltzDYMeQ=", false, function() {
    return [
        useAllocations
    ];
});
function useTeamAllocations(teamId) {
    _s25();
    return useAllocations({
        team_id: teamId
    });
}
_s25(useTeamAllocations, "dtNNsXBz0j28zS2iN14ltzDYMeQ=", false, function() {
    return [
        useAllocations
    ];
});
function usePendingOrders() {
    _s26();
    return useOrders({
        status: "pending"
    });
}
_s26(usePendingOrders, "leejNQKkZTBxcCxtN+KCDFPOzsI=", false, function() {
    return [
        useOrders
    ];
});
function useSupplierOrders(supplierId) {
    _s27();
    return useOrders({
        supplier_id: supplierId
    });
}
_s27(useSupplierOrders, "leejNQKkZTBxcCxtN+KCDFPOzsI=", false, function() {
    return [
        useOrders
    ];
});
function useProjectMaterials(projectId) {
    _s28();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...materialKeys.all,
            "project",
            projectId
        ],
        queryFn: {
            "useProjectMaterials.useQuery": async ()=>{
                const response = await fetch("/api/materials/project/".concat(projectId), {
                    headers: {
                        'Cache-Control': 'no-cache',
                        'Pragma': 'no-cache'
                    }
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch project materials');
                }
                return response.json();
            }
        }["useProjectMaterials.useQuery"],
        enabled: !!projectId,
        staleTime: 0,
        gcTime: 0
    });
}
_s28(useProjectMaterials, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useWarehouseMaterials() {
    _s29();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...materialKeys.all,
            "warehouse"
        ],
        queryFn: {
            "useWarehouseMaterials.useQuery": async ()=>{
                const response = await fetch('/api/materials/warehouse');
                if (!response.ok) {
                    throw new Error('Failed to fetch warehouse materials');
                }
                return response.json();
            }
        }["useWarehouseMaterials.useQuery"],
        staleTime: 2 * 60 * 1000
    });
}
_s29(useWarehouseMaterials, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useAssignMaterialToProject() {
    _s30();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useAssignMaterialToProject.useMutation": async (data)=>{
                const response = await fetch('/api/materials/assignments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to assign material');
                }
                return response.json();
            }
        }["useAssignMaterialToProject.useMutation"],
        onSuccess: {
            "useAssignMaterialToProject.useMutation": (data, variables)=>{
                // Invalidate legacy project materials
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "project",
                        variables.project_id
                    ]
                });
                // Invalidate unified project materials
                queryClient.invalidateQueries({
                    queryKey: [
                        ...allocationKeys.all,
                        "project",
                        variables.project_id,
                        "unified"
                    ]
                });
                // Invalidate warehouse materials (stock has changed)
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "warehouse"
                    ]
                });
                // Invalidate unified warehouse materials
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "unified-warehouse"
                    ]
                });
                // Invalidate allocation targets (availability may have changed)
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "allocation-targets"
                    ]
                });
                // Force immediate refetch for real-time updates
                queryClient.refetchQueries({
                    queryKey: [
                        ...allocationKeys.all,
                        "project",
                        variables.project_id,
                        "unified"
                    ]
                });
                queryClient.refetchQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "unified-warehouse"
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Material assigned successfully');
            }
        }["useAssignMaterialToProject.useMutation"],
        onError: {
            "useAssignMaterialToProject.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to assign material: ".concat(error.message));
            }
        }["useAssignMaterialToProject.useMutation"]
    });
}
_s30(useAssignMaterialToProject, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateMaterialAssignment() {
    _s31();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateMaterialAssignment.useMutation": async (data)=>{
                const { assignment_id, ...updateData } = data;
                const response = await fetch("/api/materials/assignments/".concat(assignment_id), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updateData)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update material assignment');
                }
                return response.json();
            }
        }["useUpdateMaterialAssignment.useMutation"],
        onSuccess: {
            "useUpdateMaterialAssignment.useMutation": (data, variables)=>{
                // Invalidate legacy project materials queries
                queryClient.invalidateQueries({
                    predicate: {
                        "useUpdateMaterialAssignment.useMutation": (query)=>{
                            return query.queryKey[0] === "materials" && query.queryKey[1] === "project";
                        }
                    }["useUpdateMaterialAssignment.useMutation"]
                });
                // Invalidate unified project materials queries
                queryClient.invalidateQueries({
                    predicate: {
                        "useUpdateMaterialAssignment.useMutation": (query)=>{
                            return query.queryKey.includes("unified");
                        }
                    }["useUpdateMaterialAssignment.useMutation"]
                });
                // Invalidate warehouse and allocation targets (stock may have changed)
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "warehouse"
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "unified-warehouse"
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "allocation-targets"
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Material assignment updated successfully');
            }
        }["useUpdateMaterialAssignment.useMutation"],
        onError: {
            "useUpdateMaterialAssignment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update material assignment: ".concat(error.message));
            }
        }["useUpdateMaterialAssignment.useMutation"]
    });
}
_s31(useUpdateMaterialAssignment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteMaterialAssignment() {
    _s32();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useDeleteMaterialAssignment.useMutation": async (assignmentId)=>{
                const response = await fetch("/api/materials/assignments/".concat(assignmentId), {
                    method: 'DELETE'
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to delete material assignment');
                }
                return response.json();
            }
        }["useDeleteMaterialAssignment.useMutation"],
        onSuccess: {
            "useDeleteMaterialAssignment.useMutation": (data, assignmentId)=>{
                // Invalidate all legacy project materials queries
                queryClient.invalidateQueries({
                    predicate: {
                        "useDeleteMaterialAssignment.useMutation": (query)=>{
                            return query.queryKey[0] === "materials" && query.queryKey[1] === "project";
                        }
                    }["useDeleteMaterialAssignment.useMutation"]
                });
                // Invalidate all unified queries
                queryClient.invalidateQueries({
                    predicate: {
                        "useDeleteMaterialAssignment.useMutation": (query)=>{
                            return query.queryKey.includes("unified");
                        }
                    }["useDeleteMaterialAssignment.useMutation"]
                });
                // Invalidate warehouse materials (stock has been restored)
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "warehouse"
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "unified-warehouse"
                    ]
                });
                // Invalidate allocation targets (availability increased)
                queryClient.invalidateQueries({
                    queryKey: [
                        ...materialKeys.all,
                        "allocation-targets"
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Material assignment deleted successfully');
            }
        }["useDeleteMaterialAssignment.useMutation"],
        onError: {
            "useDeleteMaterialAssignment.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to delete material assignment: ".concat(error.message));
            }
        }["useDeleteMaterialAssignment.useMutation"]
    });
}
_s32(useDeleteMaterialAssignment, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-material-order-budget.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAutoBudgetDeduction",
    ()=>useAutoBudgetDeduction,
    "useCreateBudgetTransaction",
    ()=>useCreateBudgetTransaction,
    "useMaterialOrderBudgetImpact",
    ()=>useMaterialOrderBudgetImpact
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature();
;
;
function useMaterialOrderBudgetImpact(orderId) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'material-order-budget',
            orderId
        ],
        queryFn: {
            "useMaterialOrderBudgetImpact.useQuery": async ()=>{
                const response = await fetch("/api/materials/orders/".concat(orderId, "/budget"));
                if (!response.ok) {
                    throw new Error('Failed to fetch budget impact');
                }
                return response.json();
            }
        }["useMaterialOrderBudgetImpact.useQuery"],
        enabled: !!orderId
    });
}
_s(useMaterialOrderBudgetImpact, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateBudgetTransaction() {
    _s1();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateBudgetTransaction.useMutation": async (param)=>{
                let { orderId, data } = param;
                const response = await fetch("/api/materials/orders/".concat(orderId, "/budget"), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Failed to create budget transaction');
                }
                return response.json();
            }
        }["useCreateBudgetTransaction.useMutation"],
        onSuccess: {
            "useCreateBudgetTransaction.useMutation": (data, variables)=>{
                // Invalidate related queries
                queryClient.invalidateQueries({
                    queryKey: [
                        'material-order-budget',
                        variables.orderId
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'material-orders'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'financial-summary'
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project',
                        data.project_id
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Budget transaction created: €".concat(data.amount_deducted.toFixed(2), " deducted"));
            }
        }["useCreateBudgetTransaction.useMutation"],
        onError: {
            "useCreateBudgetTransaction.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Failed to create budget transaction');
            }
        }["useCreateBudgetTransaction.useMutation"]
    });
}
_s1(useCreateBudgetTransaction, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useAutoBudgetDeduction() {
    _s2();
    const createBudgetTransaction = useCreateBudgetTransaction();
    const deductFromBudget = async function(orderId) {
        let deduct = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
        if (!deduct) return null;
        try {
            return await createBudgetTransaction.mutateAsync({
                orderId,
                data: {
                    deduct_from_budget: true
                }
            });
        } catch (error) {
            console.error('Auto budget deduction failed:', error);
            return null;
        }
    };
    return {
        deductFromBudget,
        isLoading: createBudgetTransaction.isPending,
        error: createBudgetTransaction.error
    };
}
_s2(useAutoBudgetDeduction, "dhXJpZIcIHHPvIOCofv4JdJ009s=", false, function() {
    return [
        useCreateBudgetTransaction
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-material-orders.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "materialOrderKeys",
    ()=>materialOrderKeys,
    "useCreateMaterialOrder",
    ()=>useCreateMaterialOrder,
    "useCreateMaterialOrderWithBudget",
    ()=>useCreateMaterialOrderWithBudget,
    "useDeleteMaterialOrder",
    ()=>useDeleteMaterialOrder,
    "useMaterialOrder",
    ()=>useMaterialOrder,
    "useMaterialOrders",
    ()=>useMaterialOrders,
    "useProjectMaterialOrders",
    ()=>useProjectMaterialOrders,
    "useSupplierMaterialOrders",
    ()=>useSupplierMaterialOrders,
    "useUpdateMaterialOrder",
    ()=>useUpdateMaterialOrder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$material$2d$order$2d$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-material-order-budget.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature(), _s5 = __turbopack_context__.k.signature(), _s6 = __turbopack_context__.k.signature(), _s7 = __turbopack_context__.k.signature();
;
;
;
const materialOrderKeys = {
    all: [
        "material-orders"
    ],
    lists: ()=>[
            ...materialOrderKeys.all,
            "list"
        ],
    list: (filters)=>[
            ...materialOrderKeys.lists(),
            filters
        ],
    details: ()=>[
            ...materialOrderKeys.all,
            "detail"
        ],
    detail: (id)=>[
            ...materialOrderKeys.details(),
            id
        ]
};
// Fetch material orders
async function fetchMaterialOrders(filters) {
    const params = new URLSearchParams();
    if (filters === null || filters === void 0 ? void 0 : filters.project_id) params.set('project_id', filters.project_id);
    if (filters === null || filters === void 0 ? void 0 : filters.supplier_id) params.set('supplier_id', filters.supplier_id);
    if (filters === null || filters === void 0 ? void 0 : filters.status) params.set('status', filters.status);
    if (filters === null || filters === void 0 ? void 0 : filters.page) params.set('page', filters.page.toString());
    if (filters === null || filters === void 0 ? void 0 : filters.per_page) params.set('per_page', filters.per_page.toString());
    const response = await fetch("/api/materials/orders?".concat(params.toString()));
    if (!response.ok) {
        throw new Error("Failed to fetch material orders");
    }
    return response.json();
}
// Fetch single material order
async function fetchMaterialOrder(id) {
    const response = await fetch("/api/materials/orders/".concat(id));
    if (!response.ok) {
        throw new Error("Failed to fetch material order");
    }
    return response.json();
}
// Create material order
async function createMaterialOrder(data) {
    const response = await fetch("/api/materials/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create material order");
    }
    return response.json();
}
// Update material order
async function updateMaterialOrder(id, data) {
    const response = await fetch("/api/materials/orders/".concat(id), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update material order");
    }
    return response.json();
}
// Delete material order
async function deleteMaterialOrder(id) {
    const response = await fetch("/api/materials/orders/".concat(id), {
        method: "DELETE"
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete material order");
    }
}
function useMaterialOrders(filters) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialOrderKeys.list(filters || {}),
        queryFn: {
            "useMaterialOrders.useQuery": ()=>fetchMaterialOrders(filters)
        }["useMaterialOrders.useQuery"],
        staleTime: 1000 * 60 * 5
    });
}
_s(useMaterialOrders, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useMaterialOrder(id) {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialOrderKeys.detail(id),
        queryFn: {
            "useMaterialOrder.useQuery": ()=>fetchMaterialOrder(id)
        }["useMaterialOrder.useQuery"],
        enabled: !!id,
        staleTime: 1000 * 60 * 5
    });
}
_s1(useMaterialOrder, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useCreateMaterialOrder() {
    _s2();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: createMaterialOrder,
        onSuccess: {
            "useCreateMaterialOrder.useMutation": (newOrder)=>{
                // Invalidate orders lists
                queryClient.invalidateQueries({
                    queryKey: materialOrderKeys.lists()
                });
                // Add the new order to cache
                queryClient.setQueryData(materialOrderKeys.detail(newOrder.id), newOrder);
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Material order created successfully");
            }
        }["useCreateMaterialOrder.useMutation"],
        onError: {
            "useCreateMaterialOrder.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create order: ".concat(error.message));
            }
        }["useCreateMaterialOrder.useMutation"]
    });
}
_s2(useCreateMaterialOrder, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useCreateMaterialOrderWithBudget() {
    _s3();
    const createOrder = useCreateMaterialOrder();
    const { deductFromBudget } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$material$2d$order$2d$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAutoBudgetDeduction"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateMaterialOrderWithBudget.useMutation": async (data)=>{
                const { deduct_from_budget = true, ...orderData } = data;
                // Create the order first
                const newOrder = await createOrder.mutateAsync(orderData);
                // Then deduct from budget if requested
                if (deduct_from_budget && newOrder.project_id) {
                    try {
                        await deductFromBudget(newOrder.id, true);
                    } catch (budgetError) {
                        console.warn('Budget deduction failed, but order was created:', budgetError);
                        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].warning('Order created but budget deduction failed. Please manage manually.');
                    }
                }
                return newOrder;
            }
        }["useCreateMaterialOrderWithBudget.useMutation"],
        onSuccess: {
            "useCreateMaterialOrderWithBudget.useMutation": (newOrder)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Order created and €".concat(newOrder.total_cost_eur.toFixed(2), " deducted from project budget"));
            }
        }["useCreateMaterialOrderWithBudget.useMutation"],
        onError: {
            "useCreateMaterialOrderWithBudget.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create order: ".concat(error.message));
            }
        }["useCreateMaterialOrderWithBudget.useMutation"]
    });
}
_s3(useCreateMaterialOrderWithBudget, "JR5TU+bG05PotvV5TxGXolhniJ0=", false, function() {
    return [
        useCreateMaterialOrder,
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$material$2d$order$2d$budget$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAutoBudgetDeduction"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateMaterialOrder() {
    _s4();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateMaterialOrder.useMutation": (param)=>{
                let { id, data } = param;
                return updateMaterialOrder(id, data);
            }
        }["useUpdateMaterialOrder.useMutation"],
        onSuccess: {
            "useUpdateMaterialOrder.useMutation": (updatedOrder)=>{
                // Update individual order cache
                queryClient.setQueryData(materialOrderKeys.detail(updatedOrder.id), updatedOrder);
                // Invalidate orders lists
                queryClient.invalidateQueries({
                    queryKey: materialOrderKeys.lists()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Order updated successfully");
            }
        }["useUpdateMaterialOrder.useMutation"],
        onError: {
            "useUpdateMaterialOrder.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update order: ".concat(error.message));
            }
        }["useUpdateMaterialOrder.useMutation"]
    });
}
_s4(useUpdateMaterialOrder, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useDeleteMaterialOrder() {
    _s5();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: deleteMaterialOrder,
        onSuccess: {
            "useDeleteMaterialOrder.useMutation": (_, deletedId)=>{
                // Remove from cache
                queryClient.removeQueries({
                    queryKey: materialOrderKeys.detail(deletedId)
                });
                // Invalidate orders lists
                queryClient.invalidateQueries({
                    queryKey: materialOrderKeys.lists()
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Order deleted successfully");
            }
        }["useDeleteMaterialOrder.useMutation"],
        onError: {
            "useDeleteMaterialOrder.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to delete order: ".concat(error.message));
            }
        }["useDeleteMaterialOrder.useMutation"]
    });
}
_s5(useDeleteMaterialOrder, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useProjectMaterialOrders(projectId) {
    _s6();
    return useMaterialOrders({
        project_id: projectId
    });
}
_s6(useProjectMaterialOrders, "BwkZbVo7roBeX8ddNLE0GWOmVmU=", false, function() {
    return [
        useMaterialOrders
    ];
});
function useSupplierMaterialOrders(supplierId) {
    _s7();
    return useMaterialOrders({
        supplier_id: supplierId
    });
}
_s7(useSupplierMaterialOrders, "BwkZbVo7roBeX8ddNLE0GWOmVmU=", false, function() {
    return [
        useMaterialOrders
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/hooks/use-project-readiness.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useCreateProjectActivation",
    ()=>useCreateProjectActivation,
    "useProjectChecklist",
    ()=>useProjectChecklist,
    "useProjectReadiness",
    ()=>useProjectReadiness,
    "useUpdateChecklistItem",
    ()=>useUpdateChecklistItem,
    "useUpdateProjectStatus",
    ()=>useUpdateProjectStatus
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature(), _s4 = __turbopack_context__.k.signature();
;
;
function useProjectReadiness(projectId) {
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-readiness',
            projectId
        ],
        queryFn: {
            "useProjectReadiness.useQuery": async ()=>{
                const response = await fetch("/api/project-readiness/".concat(projectId));
                if (!response.ok) {
                    throw new Error('Failed to fetch project readiness data');
                }
                return response.json();
            }
        }["useProjectReadiness.useQuery"],
        enabled: !!projectId,
        staleTime: 2 * 60 * 1000
    });
}
_s(useProjectReadiness, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useProjectChecklist(projectId) {
    _s1();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-checklist',
            projectId
        ],
        queryFn: {
            "useProjectChecklist.useQuery": async ()=>{
                const response = await fetch("/api/project-readiness/".concat(projectId, "/checklist"));
                if (!response.ok) {
                    throw new Error('Failed to fetch project checklist');
                }
                return response.json();
            }
        }["useProjectChecklist.useQuery"],
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000
    });
}
_s1(useProjectChecklist, "4ZpngI1uv+Uo3WQHEZmTQ5FNM+k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"]
    ];
});
function useUpdateProjectStatus() {
    _s2();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateProjectStatus.useMutation": async (data)=>{
                const response = await fetch("/api/project-readiness/".concat(data.project_id, "/status"), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: data.status
                    })
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update project status');
                }
                return response.json();
            }
        }["useUpdateProjectStatus.useMutation"],
        onSuccess: {
            "useUpdateProjectStatus.useMutation": (data, variables)=>{
                // Invalidate readiness queries
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-readiness',
                        variables.project_id
                    ]
                });
                // Update any project queries
                queryClient.invalidateQueries({
                    queryKey: [
                        'projects'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Project status updated successfully');
            }
        }["useUpdateProjectStatus.useMutation"],
        onError: {
            "useUpdateProjectStatus.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update project status: ".concat(error.message));
            }
        }["useUpdateProjectStatus.useMutation"]
    });
}
_s2(useUpdateProjectStatus, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useCreateProjectActivation() {
    _s3();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useCreateProjectActivation.useMutation": async (data)=>{
                const response = await fetch('/api/project-activation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to create project activation');
                }
                return response.json();
            }
        }["useCreateProjectActivation.useMutation"],
        onSuccess: {
            "useCreateProjectActivation.useMutation": (data, variables)=>{
                // Invalidate readiness and project queries
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-readiness',
                        variables.project_id
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'projects'
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Project activation created successfully');
            }
        }["useCreateProjectActivation.useMutation"],
        onError: {
            "useCreateProjectActivation.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to create project activation: ".concat(error.message));
            }
        }["useCreateProjectActivation.useMutation"]
    });
}
_s3(useCreateProjectActivation, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
function useUpdateChecklistItem() {
    _s4();
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "useUpdateChecklistItem.useMutation": async (param)=>{
                let { projectId, itemId, completed } = param;
                const response = await fetch("/api/project-readiness/".concat(projectId, "/checklist/").concat(itemId), {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        completed
                    })
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Failed to update checklist item');
                }
                return response.json();
            }
        }["useUpdateChecklistItem.useMutation"],
        onSuccess: {
            "useUpdateChecklistItem.useMutation": (data, variables)=>{
                // Invalidate both checklist and readiness queries
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-checklist',
                        variables.projectId
                    ]
                });
                queryClient.invalidateQueries({
                    queryKey: [
                        'project-readiness',
                        variables.projectId
                    ]
                });
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success('Checklist item updated successfully');
            }
        }["useUpdateChecklistItem.useMutation"],
        onError: {
            "useUpdateChecklistItem.useMutation": (error)=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to update checklist item: ".concat(error.message));
            }
        }["useUpdateChecklistItem.useMutation"]
    });
}
_s4(useUpdateChecklistItem, "YK0wzM21ECnncaq5SECwU+/SVdQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_hooks_2c8dc22c._.js.map