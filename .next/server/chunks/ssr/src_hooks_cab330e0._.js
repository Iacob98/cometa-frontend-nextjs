module.exports = [
"[project]/src/hooks/use-projects.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: projectKeys.list(filters || {}),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["projectsApi"].getProjects(filters),
        staleTime: 5 * 60 * 1000
    });
}
function useProject(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: projectKeys.detail(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["projectsApi"].getProject(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}
function useCreateProject() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["projectsApi"].createProject(data),
        onSuccess: (newProject)=>{
            // Invalidate and refetch projects list
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists()
            });
            // Add the new project to the cache
            queryClient.setQueryData(projectKeys.detail(newProject.id), newProject);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Project created successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create project: ${error.message}`);
        }
    });
}
function useUpdateProject() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["projectsApi"].updateProject(id, data),
        onMutate: async ({ id, data })=>{
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: projectKeys.detail(id)
            });
            // Snapshot the previous value
            const previousProject = queryClient.getQueryData(projectKeys.detail(id));
            // Optimistically update to the new value
            queryClient.setQueryData(projectKeys.detail(id), (old)=>{
                if (!old) return old;
                return {
                    ...old,
                    ...data
                };
            });
            // Return a context object with the snapshotted value
            return {
                previousProject
            };
        },
        onError: (error, { id }, context)=>{
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousProject) {
                queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update project: ${error.message}`);
        },
        onSuccess: (updatedProject)=>{
            // Invalidate and refetch projects list
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Project updated successfully");
        },
        onSettled: (data, error, { id })=>{
            // Always refetch after error or success
            queryClient.invalidateQueries({
                queryKey: projectKeys.detail(id)
            });
        }
    });
}
function useDeleteProject() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["projectsApi"].deleteProject(id),
        onSuccess: (_, deletedId)=>{
            // Remove from cache
            queryClient.removeQueries({
                queryKey: projectKeys.detail(deletedId)
            });
            // Invalidate projects list
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Project deleted successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to delete project: ${error.message}`);
        }
    });
}
function useOptimisticProjectUpdate() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["projectsApi"].updateProject(id, data),
        onMutate: async ({ id, data })=>{
            await queryClient.cancelQueries({
                queryKey: projectKeys.detail(id)
            });
            const previousProject = queryClient.getQueryData(projectKeys.detail(id));
            queryClient.setQueryData(projectKeys.detail(id), (old)=>{
                if (!old) return old;
                return {
                    ...old,
                    ...data
                };
            });
            // Also update in lists if present
            queryClient.setQueriesData({
                queryKey: projectKeys.lists()
            }, (old)=>{
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((project)=>project.id === id ? {
                            ...project,
                            ...data
                        } : project)
                };
            });
            return {
                previousProject
            };
        },
        onError: (error, { id }, context)=>{
            if (context?.previousProject) {
                queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
            }
            // Invalidate lists to revert optimistic updates
            queryClient.invalidateQueries({
                queryKey: projectKeys.lists()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update project: ${error.message}`);
        },
        onSuccess: ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Project updated successfully");
        }
    });
}
function useProjectStats(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...projectKeys.detail(projectId),
            "stats"
        ],
        queryFn: async ()=>{
            const response = await fetch(`/api/projects/${projectId}/stats`);
            if (!response.ok) {
                throw new Error('Failed to fetch project statistics');
            }
            return response.json();
        },
        staleTime: 2 * 60 * 1000,
        enabled: !!projectId
    });
}
}),
"[project]/src/hooks/use-project-preparation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
;
;
const api = {
    getProjectPreparation: async (projectId)=>{
        const response = await fetch(`/api/project-preparation?project_id=${projectId}`);
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
        const response = await fetch(`/api/project-preparation/utility-contacts?project_id=${projectId}`);
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
        const response = await fetch(`/api/project-preparation/facilities?project_id=${projectId}`);
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
        const response = await fetch(`/api/project-preparation/housing?project_id=${projectId}`);
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
        const response = await fetch(`/api/project-preparation/utility-contacts/${data.id}`, {
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
        const response = await fetch(`/api/project-preparation/facilities/${data.id}`, {
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
        const response = await fetch(`/api/project-preparation/housing/${data.id}`, {
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
        const response = await fetch(`/api/project-preparation/utility-contacts/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete utility contact');
        }
        return response.json();
    },
    deleteFacility: async (id)=>{
        const response = await fetch(`/api/project-preparation/facilities/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete facility');
        }
        return response.json();
    },
    deleteHousingUnit: async (id)=>{
        const response = await fetch(`/api/project-preparation/housing/${id}`, {
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
        const response = await fetch(`/api/project-preparation/plans?project_id=${projectId}`);
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
        const response = await fetch(`/api/project-preparation/plans/${id}`, {
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-preparation',
            projectId
        ],
        queryFn: ()=>api.getProjectPreparation(projectId),
        enabled: !!projectId
    });
}
function useUpdateProjectStatus() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateProjectStatus,
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Project status updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useUtilityContacts(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'utility-contacts',
            projectId
        ],
        queryFn: ()=>api.getUtilityContacts(projectId),
        enabled: !!projectId
    });
}
function useCreateUtilityContact() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createUtilityContact,
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Utility contact created successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useFacilities(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'facilities',
            projectId
        ],
        queryFn: ()=>api.getFacilities(projectId),
        enabled: !!projectId
    });
}
function useCreateFacility() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createFacility,
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Facility created successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useHousingUnits(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'housing-units',
            projectId
        ],
        queryFn: ()=>api.getHousingUnits(projectId),
        enabled: !!projectId
    });
}
function useCreateHousingUnit() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createHousingUnit,
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit created successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useUpdateUtilityContact() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateUtilityContact,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Utility contact updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useUpdateFacility() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateFacility,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Facility updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useUpdateHousingUnit() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateHousingUnit,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useDeleteUtilityContact() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteUtilityContact,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Utility contact deleted successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useDeleteFacility() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteFacility,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Facility deleted successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useDeleteHousingUnit() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteHousingUnit,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit deleted successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useProjectPlans(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-plans',
            projectId
        ],
        queryFn: ()=>api.getProjectPlans(projectId),
        enabled: !!projectId
    });
}
function useCreateProjectPlan() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createProjectPlan,
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Plan uploaded successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useDeleteProjectPlan() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteProjectPlan,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Plan deleted successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
}),
"[project]/src/hooks/use-zone-layout.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
;
;
const api = {
    getCabinets: async (projectId)=>{
        const response = await fetch(`/api/zone-layout/cabinets?project_id=${projectId}`);
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
        const response = await fetch(`/api/zone-layout/cabinets/${data.id}`, {
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
        const response = await fetch(`/api/zone-layout/cabinets/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete cabinet');
        }
        return response.json();
    },
    getSegments: async (projectId)=>{
        const response = await fetch(`/api/zone-layout/segments?project_id=${projectId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch segments');
        }
        return response.json();
    }
};
function useCabinets(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'cabinets',
            projectId
        ],
        queryFn: ()=>api.getCabinets(projectId),
        enabled: !!projectId
    });
}
function useCreateCabinet() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createCabinet,
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Cabinet created successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useUpdateCabinet() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateCabinet,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Cabinet updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useDeleteCabinet() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteCabinet,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Cabinet deleted successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useSegments(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'segments',
            projectId
        ],
        queryFn: ()=>api.getSegments(projectId),
        enabled: !!projectId
    });
}
}),
"[project]/src/hooks/use-housing-units.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
;
;
const api = {
    getHousingUnits: async (projectId)=>{
        const response = await fetch(`/api/housing-units?project_id=${projectId}`);
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
        const response = await fetch(`/api/housing-units/${data.id}`, {
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
        const response = await fetch(`/api/housing-units/${id}`, {
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'housing-units',
            projectId
        ],
        queryFn: ()=>api.getHousingUnits(projectId),
        enabled: !!projectId
    });
}
function useCreateHousingUnit() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.createHousingUnit,
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit created successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useUpdateHousingUnit() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.updateHousingUnit,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useDeleteHousingUnit() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: api.deleteHousingUnit,
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Housing unit deleted successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
}),
"[project]/src/hooks/use-houses.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: houseKeys.list(filters || {}),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].getHouses(filters),
        staleTime: 3 * 60 * 1000
    });
}
function useHouse(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: houseKeys.detail(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].getHouse(id),
        enabled: !!id,
        staleTime: 3 * 60 * 1000
    });
}
function useProjectHouses(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: houseKeys.project(projectId),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].getProjectHouses(projectId),
        enabled: !!projectId,
        staleTime: 3 * 60 * 1000
    });
}
function useTeamHouses(teamId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: houseKeys.team(teamId),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].getTeamHouses(teamId),
        enabled: !!teamId,
        staleTime: 3 * 60 * 1000
    });
}
function useCreateHouse() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].createHouse(data),
        onSuccess: (newHouse)=>{
            queryClient.invalidateQueries({
                queryKey: houseKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: houseKeys.project(newHouse.project_id)
            });
            queryClient.setQueryData(houseKeys.detail(newHouse.id), newHouse);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("House created successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create house: ${error.message}`);
        }
    });
}
function useUpdateHouse() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].updateHouse(id, data),
        onMutate: async ({ id, data })=>{
            await queryClient.cancelQueries({
                queryKey: houseKeys.detail(id)
            });
            const previousHouse = queryClient.getQueryData(houseKeys.detail(id));
            queryClient.setQueryData(houseKeys.detail(id), (old)=>{
                if (!old) return old;
                return {
                    ...old,
                    ...data
                };
            });
            return {
                previousHouse
            };
        },
        onError: (error, { id }, context)=>{
            if (context?.previousHouse) {
                queryClient.setQueryData(houseKeys.detail(id), context.previousHouse);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update house: ${error.message}`);
        },
        onSuccess: (updatedHouse)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("House updated successfully");
        },
        onSettled: (data, error, { id })=>{
            queryClient.invalidateQueries({
                queryKey: houseKeys.detail(id)
            });
        }
    });
}
function useDeleteHouse() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].deleteHouse(id),
        onSuccess: (_, deletedId)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("House deleted successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to delete house: ${error.message}`);
        }
    });
}
function useStartConnection() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].startConnection(data),
        onSuccess: (updatedHouse)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Connection work started successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to start connection: ${error.message}`);
        }
    });
}
function useCompleteConnection() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].completeConnection(data),
        onSuccess: (updatedHouse)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Connection completed successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to complete connection: ${error.message}`);
        }
    });
}
function useAppointments(filters) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: appointmentKeys.list(filters || {}),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentsApi"].getAppointments(filters),
        staleTime: 2 * 60 * 1000
    });
}
function useAppointment(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: appointmentKeys.detail(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentsApi"].getAppointment(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000
    });
}
function useScheduleAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["housesApi"].scheduleAppointment(data),
        onSuccess: (newAppointment)=>{
            queryClient.invalidateQueries({
                queryKey: appointmentKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: houseKeys.detail(newAppointment.house_id)
            });
            queryClient.setQueryData(appointmentKeys.detail(newAppointment.id), newAppointment);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Appointment scheduled successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to schedule appointment: ${error.message}`);
        }
    });
}
function useUpdateAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentsApi"].updateAppointment(id, data),
        onSuccess: (updatedAppointment)=>{
            queryClient.setQueryData(appointmentKeys.detail(updatedAppointment.id), updatedAppointment);
            queryClient.invalidateQueries({
                queryKey: appointmentKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: houseKeys.detail(updatedAppointment.house_id)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Appointment updated successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update appointment: ${error.message}`);
        }
    });
}
function useCancelAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, reason })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentsApi"].cancelAppointment(id, reason),
        onSuccess: (cancelledAppointment)=>{
            queryClient.setQueryData(appointmentKeys.detail(cancelledAppointment.id), cancelledAppointment);
            queryClient.invalidateQueries({
                queryKey: appointmentKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: houseKeys.detail(cancelledAppointment.house_id)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Appointment cancelled");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to cancel appointment: ${error.message}`);
        }
    });
}
function useRescheduleAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, newDate })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentsApi"].rescheduleAppointment(id, newDate),
        onSuccess: (rescheduledAppointment)=>{
            queryClient.setQueryData(appointmentKeys.detail(rescheduledAppointment.id), rescheduledAppointment);
            queryClient.invalidateQueries({
                queryKey: appointmentKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: houseKeys.detail(rescheduledAppointment.house_id)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Appointment rescheduled successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to reschedule appointment: ${error.message}`);
        }
    });
}
function useConfirmAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentsApi"].confirmAppointment(id),
        onSuccess: (confirmedAppointment)=>{
            queryClient.setQueryData(appointmentKeys.detail(confirmedAppointment.id), confirmedAppointment);
            queryClient.invalidateQueries({
                queryKey: appointmentKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: houseKeys.detail(confirmedAppointment.house_id)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Appointment confirmed");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to confirm appointment: ${error.message}`);
        }
    });
}
function useStartAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentsApi"].startAppointment(id),
        onSuccess: (startedAppointment)=>{
            queryClient.setQueryData(appointmentKeys.detail(startedAppointment.id), startedAppointment);
            queryClient.invalidateQueries({
                queryKey: appointmentKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: houseKeys.detail(startedAppointment.house_id)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Appointment started");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to start appointment: ${error.message}`);
        }
    });
}
function useCompleteAppointment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, notes })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["appointmentsApi"].completeAppointment(id, notes),
        onSuccess: (completedAppointment)=>{
            queryClient.setQueryData(appointmentKeys.detail(completedAppointment.id), completedAppointment);
            queryClient.invalidateQueries({
                queryKey: appointmentKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: houseKeys.detail(completedAppointment.house_id)
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Appointment completed");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to complete appointment: ${error.message}`);
        }
    });
}
function usePendingConnections() {
    return useHouses({
        status: "not_assigned",
        page: 1,
        per_page: 50
    });
}
function useScheduledAppointments() {
    return useAppointments({
        status: "scheduled",
        page: 1,
        per_page: 20
    });
}
function useInProgressConnections() {
    return useHouses({
        status: "in_progress",
        page: 1,
        per_page: 20
    });
}
function useCompletedConnections() {
    return useHouses({
        status: "connected",
        page: 1,
        per_page: 20
    });
}
function useTodaysAppointments() {
    const today = new Date().toISOString().split('T')[0];
    return useAppointments({
        scheduled_date_from: today,
        scheduled_date_to: today,
        page: 1,
        per_page: 50
    });
}
}),
"[project]/src/hooks/use-teams.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: teamKeys.crews(),
        queryFn: async ()=>{
            const response = await fetch('/api/crews');
            if (!response.ok) {
                throw new Error('Failed to fetch crews');
            }
            const data = await response.json();
            return data.crews || [];
        },
        staleTime: 30 * 1000
    });
}
function useCrew(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: teamKeys.crew(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["teamsApi"].getCrew(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}
function useCreateCrew() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["teamsApi"].createCrew(data),
        onSuccess: (newCrew)=>{
            // Invalidate and refetch crews list
            queryClient.invalidateQueries({
                queryKey: teamKeys.crews()
            });
            // Add the new crew to the cache
            queryClient.setQueryData(teamKeys.crew(newCrew.id), newCrew);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Team created successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create team: ${error.message}`);
        }
    });
}
function useUpdateCrew() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["teamsApi"].updateCrew(id, data),
        onMutate: async ({ id, data })=>{
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({
                queryKey: teamKeys.crew(id)
            });
            // Snapshot the previous value
            const previousCrew = queryClient.getQueryData(teamKeys.crew(id));
            // Optimistically update to the new value
            queryClient.setQueryData(teamKeys.crew(id), (old)=>{
                if (!old) return old;
                return {
                    ...old,
                    ...data
                };
            });
            // Return a context object with the snapshotted value
            return {
                previousCrew
            };
        },
        onError: (error, { id }, context)=>{
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousCrew) {
                queryClient.setQueryData(teamKeys.crew(id), context.previousCrew);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update team: ${error.message}`);
        },
        onSuccess: ()=>{
            // Invalidate and refetch crews list
            queryClient.invalidateQueries({
                queryKey: teamKeys.crews()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Team updated successfully");
        },
        onSettled: (data, error, { id })=>{
            // Always refetch after error or success
            queryClient.invalidateQueries({
                queryKey: teamKeys.crew(id)
            });
        }
    });
}
function useDeleteCrew() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["teamsApi"].deleteCrew(id),
        onSuccess: (_, deletedId)=>{
            // Remove from cache
            queryClient.removeQueries({
                queryKey: teamKeys.crew(deletedId)
            });
            // Invalidate crews list
            queryClient.invalidateQueries({
                queryKey: teamKeys.crews()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Team deleted successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to delete team: ${error.message}`);
        }
    });
}
function useGlobalTeams() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'global-teams'
        ],
        queryFn: async ()=>{
            const response = await fetch('/api/crews');
            if (!response.ok) {
                throw new Error('Failed to fetch global teams');
            }
            const data = await response.json();
            const crews = data.crews || [];
            // Transform to GlobalTeam format and count projects per team
            const projectCounts = {};
            crews.forEach((crew)=>{
                if (crew.project_id) {
                    projectCounts[crew.name] = (projectCounts[crew.name] || 0) + 1;
                }
            });
            return crews.map((crew)=>({
                    id: crew.id,
                    name: crew.name,
                    foreman_name: crew.foreman?.full_name || crew.foreman_name,
                    is_active: crew.status === 'active',
                    project_count: projectCounts[crew.name] || 0,
                    specialization: 'mixed'
                }));
        }
    });
}
function useProjectUsers(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-users',
            projectId
        ],
        queryFn: async ()=>{
            try {
                const response = await fetch(`/api/projects/${projectId}/users`);
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
        },
        enabled: !!projectId
    });
}
function useForemenUsers() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'foremen-users'
        ],
        queryFn: async ()=>{
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
                return (allData.items || []).filter((user)=>user.role === 'foreman' || user.role === 'pm');
            }
            return data.items || [];
        }
    });
}
function useCreateTeam() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
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
        },
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Team created successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useProjectTeams(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-teams',
            projectId
        ],
        queryFn: async ()=>{
            const response = await fetch(`/api/crews?project_id=${projectId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch project teams');
            }
            const data = await response.json();
            return data.crews || [];
        },
        enabled: !!projectId
    });
}
function useAvailableTeams() {
    const { data: crews, ...rest } = useTeams();
    return {
        ...rest,
        data: crews?.filter((crew)=>!crew.project_id) || []
    };
}
function useUpdateTeam() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async ({ id, data })=>{
            const response = await fetch(`/api/crews/${id}`, {
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
        },
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Team updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
function useDeleteTeam() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (id)=>{
            const response = await fetch(`/api/crews/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete team');
            }
            return response.json();
        },
        onSuccess: (data)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(data.message || 'Team deleted successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message);
        }
    });
}
}),
"[project]/src/hooks/use-resources.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: resourceKeys.projectResources(projectId),
        queryFn: async ()=>{
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
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000
    });
}
function useAvailableVehicles() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: resourceKeys.availableVehicles(),
        queryFn: async ()=>{
            // TODO: Implement proper available vehicles API
            return [];
        },
        staleTime: 2 * 60 * 1000
    });
}
function useAvailableEquipment() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: resourceKeys.availableEquipment(),
        queryFn: async ()=>{
            // TODO: Implement proper available equipment API
            return [];
        },
        staleTime: 2 * 60 * 1000
    });
}
function useCreateVehicleAssignment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
            // TODO: Implement proper vehicle assignment API
            throw new Error('Vehicle assignment feature is not yet implemented');
        },
        onSuccess: (data, variables)=>{
            // Invalidate and refetch project resources
            queryClient.invalidateQueries({
                queryKey: resourceKeys.projectResources(variables.project_id)
            });
            // Invalidate available vehicles list
            queryClient.invalidateQueries({
                queryKey: resourceKeys.availableVehicles()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Vehicle assigned successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to assign vehicle: ${error.message}`);
        }
    });
}
function useCreateEquipmentAssignment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
            // TODO: Implement proper equipment assignment API
            throw new Error('Equipment assignment feature is not yet implemented');
        },
        onSuccess: (data, variables)=>{
            // Invalidate and refetch project resources
            queryClient.invalidateQueries({
                queryKey: resourceKeys.projectResources(variables.project_id)
            });
            // Invalidate available equipment list
            queryClient.invalidateQueries({
                queryKey: resourceKeys.availableEquipment()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Equipment assigned successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to assign equipment: ${error.message}`);
        }
    });
}
function useCreateRentalVehicle() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
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
        },
        onSuccess: (data, variables)=>{
            // Invalidate and refetch project resources
            queryClient.invalidateQueries({
                queryKey: resourceKeys.projectResources(variables.project_id)
            });
            // Invalidate available vehicles list
            queryClient.invalidateQueries({
                queryKey: resourceKeys.availableVehicles()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Rental vehicle created and assigned successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create rental vehicle: ${error.message}`);
        }
    });
}
function useCreateRentalEquipment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
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
        },
        onSuccess: (data, variables)=>{
            // Invalidate and refetch project resources
            queryClient.invalidateQueries({
                queryKey: resourceKeys.projectResources(variables.project_id)
            });
            // Invalidate available equipment list
            queryClient.invalidateQueries({
                queryKey: resourceKeys.availableEquipment()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Rental equipment created and assigned successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create rental equipment: ${error.message}`);
        }
    });
}
function useRemoveResourceAssignment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async ({ projectId, resourceId, resourceType })=>{
            // TODO: Implement proper resource assignment removal API
            throw new Error('Resource assignment removal feature is not yet implemented');
        },
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Resource assignment removed successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to remove resource assignment: ${error.message}`);
        }
    });
}
}),
"[project]/src/hooks/use-materials.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/api-client.ts [app-ssr] (ecmascript)");
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
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialKeys.list(filters || {}),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialsApi"].getMaterials(filters),
        staleTime: 2 * 60 * 1000
    });
}
function useMaterial(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialKeys.detail(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialsApi"].getMaterial(id),
        enabled: !!id,
        staleTime: 5 * 60 * 1000
    });
}
function useLowStockMaterials() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialKeys.lowStock(),
        queryFn: async ()=>{
            const response = await fetch('/api/materials/low-stock');
            if (!response.ok) {
                throw new Error('Failed to fetch low stock materials');
            }
            const data = await response.json();
            return data.materials || []; // Extract materials array from API response
        },
        staleTime: 2 * 60 * 1000
    });
}
function useUnifiedWarehouseMaterials() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...materialKeys.all,
            "unified-warehouse"
        ],
        queryFn: async ()=>{
            const response = await fetch('/api/materials/unified?view=warehouse');
            if (!response.ok) {
                throw new Error('Failed to fetch warehouse materials');
            }
            const data = await response.json();
            return data.materials || [];
        },
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
        refetchOnWindowFocus: true,
        refetchInterval: 60 * 1000
    });
}
function useUnifiedProjectMaterials(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...allocationKeys.all,
            "project",
            projectId,
            "unified"
        ],
        queryFn: async ()=>{
            const response = await fetch(`/api/materials/unified?view=project_allocations&project_id=${projectId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch project materials');
            }
            const data = await response.json();
            return {
                materials: data.materials || [],
                summary: data.allocation_summary
            };
        },
        enabled: !!projectId,
        staleTime: 1 * 60 * 1000,
        gcTime: 5 * 60 * 1000
    });
}
function useMaterialAllocationTargets() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...materialKeys.all,
            "allocation-targets"
        ],
        queryFn: async ()=>{
            const response = await fetch('/api/materials/unified?view=allocation_targets');
            if (!response.ok) {
                throw new Error('Failed to fetch allocation targets');
            }
            const data = await response.json();
            return data.materials || [];
        },
        staleTime: 30 * 1000,
        refetchOnWindowFocus: true
    });
}
function useCreateMaterial() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialsApi"].createMaterial(data),
        onSuccess: (newMaterial)=>{
            queryClient.invalidateQueries({
                queryKey: materialKeys.lists()
            });
            queryClient.setQueryData(materialKeys.detail(newMaterial.id), newMaterial);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Material created successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create material: ${error.message}`);
        }
    });
}
function useUpdateMaterial() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialsApi"].updateMaterial(id, data),
        onMutate: async ({ id, data })=>{
            await queryClient.cancelQueries({
                queryKey: materialKeys.detail(id)
            });
            const previousMaterial = queryClient.getQueryData(materialKeys.detail(id));
            queryClient.setQueryData(materialKeys.detail(id), (old)=>{
                if (!old) return old;
                return {
                    ...old,
                    ...data
                };
            });
            return {
                previousMaterial
            };
        },
        onError: (error, { id }, context)=>{
            if (context?.previousMaterial) {
                queryClient.setQueryData(materialKeys.detail(id), context.previousMaterial);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update material: ${error.message}`);
        },
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: materialKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: materialKeys.lowStock()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Material updated successfully");
        },
        onSettled: (data, error, { id })=>{
            queryClient.invalidateQueries({
                queryKey: materialKeys.detail(id)
            });
        }
    });
}
function useDeleteMaterial() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialsApi"].deleteMaterial(id),
        onSuccess: (_, deletedId)=>{
            queryClient.removeQueries({
                queryKey: materialKeys.detail(deletedId)
            });
            queryClient.invalidateQueries({
                queryKey: materialKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: materialKeys.lowStock()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Material deleted successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to delete material: ${error.message}`);
        }
    });
}
function useAdjustStock() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, adjustment })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialsApi"].adjustStock(id, adjustment),
        onSuccess: (updatedMaterial)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Stock adjusted successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to adjust stock: ${error.message}`);
        }
    });
}
function useConsumeMaterial() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>{
            return fetch('/api/materials/consume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then((response)=>{
                if (!response.ok) {
                    return response.json().then((err)=>Promise.reject(new Error(err.error || 'Failed to consume material')));
                }
                return response.json();
            });
        },
        onSuccess: (result, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(result.message || "Material consumed successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to consume material: ${error.message}`);
        }
    });
}
function useSuppliers() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: supplierKeys.lists(),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliersApi"].getSuppliers(),
        staleTime: 10 * 60 * 1000
    });
}
function useSupplier(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: supplierKeys.detail(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliersApi"].getSupplier(id),
        enabled: !!id,
        staleTime: 10 * 60 * 1000
    });
}
function useCreateSupplier() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliersApi"].createSupplier(data),
        onSuccess: (newSupplier)=>{
            queryClient.invalidateQueries({
                queryKey: supplierKeys.lists()
            });
            queryClient.setQueryData(supplierKeys.detail(newSupplier.id), newSupplier);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Supplier created successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create supplier: ${error.message}`);
        }
    });
}
function useUpdateSupplier() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliersApi"].updateSupplier(id, data),
        onSuccess: ()=>{
            queryClient.invalidateQueries({
                queryKey: supplierKeys.lists()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Supplier updated successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update supplier: ${error.message}`);
        }
    });
}
function useDeleteSupplier() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (id)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["suppliersApi"].deleteSupplier(id),
        onSuccess: (_, deletedId)=>{
            queryClient.removeQueries({
                queryKey: supplierKeys.detail(deletedId)
            });
            queryClient.invalidateQueries({
                queryKey: supplierKeys.lists()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Supplier deleted successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to delete supplier: ${error.message}`);
        }
    });
}
function useAllocations(filters) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: allocationKeys.list(filters || {}),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialAllocationsApi"].getAllocations(filters),
        staleTime: 2 * 60 * 1000
    });
}
function useAllocation(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: allocationKeys.detail(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialAllocationsApi"].getAllocation(id),
        enabled: !!id,
        staleTime: 2 * 60 * 1000
    });
}
function useCreateAllocation() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialAllocationsApi"].createAllocation(data),
        onSuccess: (newAllocation)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Material allocated successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to allocate material: ${error.message}`);
        }
    });
}
function useRecordUsage() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, usage })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialAllocationsApi"].recordUsage(id, usage),
        onSuccess: (updatedAllocation)=>{
            queryClient.setQueryData(allocationKeys.detail(updatedAllocation.id), updatedAllocation);
            queryClient.invalidateQueries({
                queryKey: allocationKeys.lists()
            });
            queryClient.invalidateQueries({
                queryKey: materialKeys.lists()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Usage recorded successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to record usage: ${error.message}`);
        }
    });
}
function useOrders(filters) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: orderKeys.list(filters || {}),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialOrdersApi"].getOrders(filters),
        staleTime: 3 * 60 * 1000
    });
}
function useOrder(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: orderKeys.detail(id),
        queryFn: ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialOrdersApi"].getOrder(id),
        enabled: !!id,
        staleTime: 3 * 60 * 1000
    });
}
function useCreateOrder() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: (data)=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialOrdersApi"].createOrder(data),
        onSuccess: (newOrder)=>{
            queryClient.invalidateQueries({
                queryKey: orderKeys.lists()
            });
            queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Order created successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create order: ${error.message}`);
        }
    });
}
function useUpdateOrderStatus() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, status })=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["materialOrdersApi"].updateOrderStatus(id, status),
        onSuccess: (updatedOrder)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Order status updated successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update order status: ${error.message}`);
        }
    });
}
function useProjectAllocations(projectId) {
    return useAllocations({
        project_id: projectId
    });
}
function useTeamAllocations(teamId) {
    return useAllocations({
        team_id: teamId
    });
}
function usePendingOrders() {
    return useOrders({
        status: "pending"
    });
}
function useSupplierOrders(supplierId) {
    return useOrders({
        supplier_id: supplierId
    });
}
function useProjectMaterials(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...materialKeys.all,
            "project",
            projectId
        ],
        queryFn: async ()=>{
            const response = await fetch(`/api/materials/project/${projectId}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch project materials');
            }
            return response.json();
        },
        enabled: !!projectId,
        staleTime: 0,
        gcTime: 0
    });
}
function useWarehouseMaterials() {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            ...materialKeys.all,
            "warehouse"
        ],
        queryFn: async ()=>{
            const response = await fetch('/api/materials/warehouse');
            if (!response.ok) {
                throw new Error('Failed to fetch warehouse materials');
            }
            return response.json();
        },
        staleTime: 2 * 60 * 1000
    });
}
function useAssignMaterialToProject() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
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
        },
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Material assigned successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to assign material: ${error.message}`);
        }
    });
}
function useUpdateMaterialAssignment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
            const { assignment_id, ...updateData } = data;
            const response = await fetch(`/api/materials/assignments/${assignment_id}`, {
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
        },
        onSuccess: (data, variables)=>{
            // Invalidate legacy project materials queries
            queryClient.invalidateQueries({
                predicate: (query)=>{
                    return query.queryKey[0] === "materials" && query.queryKey[1] === "project";
                }
            });
            // Invalidate unified project materials queries
            queryClient.invalidateQueries({
                predicate: (query)=>{
                    return query.queryKey.includes("unified");
                }
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Material assignment updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update material assignment: ${error.message}`);
        }
    });
}
function useDeleteMaterialAssignment() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (assignmentId)=>{
            const response = await fetch(`/api/materials/assignments/${assignmentId}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to delete material assignment');
            }
            return response.json();
        },
        onSuccess: (data, assignmentId)=>{
            // Invalidate all legacy project materials queries
            queryClient.invalidateQueries({
                predicate: (query)=>{
                    return query.queryKey[0] === "materials" && query.queryKey[1] === "project";
                }
            });
            // Invalidate all unified queries
            queryClient.invalidateQueries({
                predicate: (query)=>{
                    return query.queryKey.includes("unified");
                }
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Material assignment deleted successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to delete material assignment: ${error.message}`);
        }
    });
}
}),
"[project]/src/hooks/use-material-order-budget.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAutoBudgetDeduction",
    ()=>useAutoBudgetDeduction,
    "useCreateBudgetTransaction",
    ()=>useCreateBudgetTransaction,
    "useMaterialOrderBudgetImpact",
    ()=>useMaterialOrderBudgetImpact
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
;
;
function useMaterialOrderBudgetImpact(orderId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'material-order-budget',
            orderId
        ],
        queryFn: async ()=>{
            const response = await fetch(`/api/materials/orders/${orderId}/budget`);
            if (!response.ok) {
                throw new Error('Failed to fetch budget impact');
            }
            return response.json();
        },
        enabled: !!orderId
    });
}
function useCreateBudgetTransaction() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async ({ orderId, data })=>{
            const response = await fetch(`/api/materials/orders/${orderId}/budget`, {
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
        },
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(`Budget transaction created: €${data.amount_deducted.toFixed(2)} deducted`);
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(error.message || 'Failed to create budget transaction');
        }
    });
}
function useAutoBudgetDeduction() {
    const createBudgetTransaction = useCreateBudgetTransaction();
    const deductFromBudget = async (orderId, deduct = true)=>{
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
}),
"[project]/src/hooks/use-material-orders.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$material$2d$order$2d$budget$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/hooks/use-material-order-budget.ts [app-ssr] (ecmascript)");
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
    if (filters?.project_id) params.set('project_id', filters.project_id);
    if (filters?.supplier_id) params.set('supplier_id', filters.supplier_id);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', filters.page.toString());
    if (filters?.per_page) params.set('per_page', filters.per_page.toString());
    const response = await fetch(`/api/materials/orders?${params.toString()}`);
    if (!response.ok) {
        throw new Error("Failed to fetch material orders");
    }
    return response.json();
}
// Fetch single material order
async function fetchMaterialOrder(id) {
    const response = await fetch(`/api/materials/orders/${id}`);
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
    const response = await fetch(`/api/materials/orders/${id}`, {
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
    const response = await fetch(`/api/materials/orders/${id}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete material order");
    }
}
function useMaterialOrders(filters) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialOrderKeys.list(filters || {}),
        queryFn: ()=>fetchMaterialOrders(filters),
        staleTime: 1000 * 60 * 5
    });
}
function useMaterialOrder(id) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: materialOrderKeys.detail(id),
        queryFn: ()=>fetchMaterialOrder(id),
        enabled: !!id,
        staleTime: 1000 * 60 * 5
    });
}
function useCreateMaterialOrder() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: createMaterialOrder,
        onSuccess: (newOrder)=>{
            // Invalidate orders lists
            queryClient.invalidateQueries({
                queryKey: materialOrderKeys.lists()
            });
            // Add the new order to cache
            queryClient.setQueryData(materialOrderKeys.detail(newOrder.id), newOrder);
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Material order created successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create order: ${error.message}`);
        }
    });
}
function useCreateMaterialOrderWithBudget() {
    const createOrder = useCreateMaterialOrder();
    const { deductFromBudget } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$hooks$2f$use$2d$material$2d$order$2d$budget$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAutoBudgetDeduction"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
            const { deduct_from_budget = true, ...orderData } = data;
            // Create the order first
            const newOrder = await createOrder.mutateAsync(orderData);
            // Then deduct from budget if requested
            if (deduct_from_budget && newOrder.project_id) {
                try {
                    await deductFromBudget(newOrder.id, true);
                } catch (budgetError) {
                    console.warn('Budget deduction failed, but order was created:', budgetError);
                    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].warning('Order created but budget deduction failed. Please manage manually.');
                }
            }
            return newOrder;
        },
        onSuccess: (newOrder)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success(`Order created and €${newOrder.total_cost_eur.toFixed(2)} deducted from project budget`);
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create order: ${error.message}`);
        }
    });
}
function useUpdateMaterialOrder() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: ({ id, data })=>updateMaterialOrder(id, data),
        onSuccess: (updatedOrder)=>{
            // Update individual order cache
            queryClient.setQueryData(materialOrderKeys.detail(updatedOrder.id), updatedOrder);
            // Invalidate orders lists
            queryClient.invalidateQueries({
                queryKey: materialOrderKeys.lists()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Order updated successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update order: ${error.message}`);
        }
    });
}
function useDeleteMaterialOrder() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: deleteMaterialOrder,
        onSuccess: (_, deletedId)=>{
            // Remove from cache
            queryClient.removeQueries({
                queryKey: materialOrderKeys.detail(deletedId)
            });
            // Invalidate orders lists
            queryClient.invalidateQueries({
                queryKey: materialOrderKeys.lists()
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success("Order deleted successfully");
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to delete order: ${error.message}`);
        }
    });
}
function useProjectMaterialOrders(projectId) {
    return useMaterialOrders({
        project_id: projectId
    });
}
function useSupplierMaterialOrders(supplierId) {
    return useMaterialOrders({
        supplier_id: supplierId
    });
}
}),
"[project]/src/hooks/use-project-readiness.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
;
;
function useProjectReadiness(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-readiness',
            projectId
        ],
        queryFn: async ()=>{
            const response = await fetch(`/api/project-readiness/${projectId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch project readiness data');
            }
            return response.json();
        },
        enabled: !!projectId,
        staleTime: 2 * 60 * 1000
    });
}
function useProjectChecklist(projectId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            'project-checklist',
            projectId
        ],
        queryFn: async ()=>{
            const response = await fetch(`/api/project-readiness/${projectId}/checklist`);
            if (!response.ok) {
                throw new Error('Failed to fetch project checklist');
            }
            return response.json();
        },
        enabled: !!projectId,
        staleTime: 5 * 60 * 1000
    });
}
function useUpdateProjectStatus() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
            const response = await fetch(`/api/project-readiness/${data.project_id}/status`, {
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
        },
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Project status updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update project status: ${error.message}`);
        }
    });
}
function useCreateProjectActivation() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async (data)=>{
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
        },
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Project activation created successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to create project activation: ${error.message}`);
        }
    });
}
function useUpdateChecklistItem() {
    const queryClient = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useQueryClient"])();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: async ({ projectId, itemId, completed })=>{
            const response = await fetch(`/api/project-readiness/${projectId}/checklist/${itemId}`, {
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
        },
        onSuccess: (data, variables)=>{
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
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].success('Checklist item updated successfully');
        },
        onError: (error)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["toast"].error(`Failed to update checklist item: ${error.message}`);
        }
    });
}
}),
];

//# sourceMappingURL=src_hooks_cab330e0._.js.map