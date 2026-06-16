import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

const STATUS_STYLES = {
    todo: "bg-gray-500/10 text-gray-400 border border-gray-500/20",
    in_progress: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
    done: "bg-green-500/10 text-green-400 border border-green-500/20",
};

const STATUS_LABELS = {
    todo: "Todo",
    in_progress: "In Progress",
    done: "Done",
};

function ProjectDetail() {
    const { projectId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [isEditingTask, setIsEditingTask] = useState(false);
    const [editTaskForm, setEditTaskForm] = useState({ title: "", description: "", assignedTo: "" });
    const [updatingTask, setUpdatingTask] = useState(false);
    const [editTaskError, setEditTaskError] = useState("");

    // Project state
    const [project, setProject] = useState(null);
    const [projectLoading, setProjectLoading] = useState(true);

    // Tasks state
    const [tasks, setTasks] = useState([]);
    const [tasksLoading, setTasksLoading] = useState(true);

    // Members state
    const [members, setMembers] = useState([]);
    const [showMembersPanel, setShowMembersPanel] = useState(false);

    // My role in this project
    const [myRole, setMyRole] = useState(null);

    // Create task modal
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: "",
        description: "",
        assignedTo: "",
        status: "todo",
    });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // Add member modal
    const [showAddMember, setShowAddMember] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("member");
    const [addingMember, setAddingMember] = useState(false);
    const [addMemberError, setAddMemberError] = useState("");

    // Task detail modal
    const [selectedTask, setSelectedTask] = useState(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        fetchProject();
        fetchTasks();
        fetchMembers();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const response = await axiosInstance.get(`/projects/${projectId}`);
            setProject(response.data.data);
        } catch (err) {
            setError("Failed to load project");
        } finally {
            setProjectLoading(false);
        }
    };

    const fetchTasks = async () => {
        try {
            const response = await axiosInstance.get(`/tasks/${projectId}`);
            setTasks(response.data.data);
        } catch (err) {
            setError("Failed to load tasks");
        } finally {
            setTasksLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await axiosInstance.get(`/projects/${projectId}/members`);
            const memberList = response.data.data;
            setMembers(memberList);

            // Find current user's role in this project
            const me = memberList.find((m) => m.user._id === user._id);
            if (me) setMyRole(me.role);
        } catch (err) {
            // silent fail
        }
    };

    const handleCreateTask = async () => {
        if (!newTask.title.trim()) {
            setCreateError("Task title is required");
            return;
        }
        setCreating(true);
        setCreateError("");
        try {
            await axiosInstance.post(`/tasks/${projectId}`, newTask);
            setShowTaskModal(false);
            setNewTask({ title: "", description: "", assignedTo: "", status: "todo" });
            fetchTasks();
        } catch (err) {
            setCreateError(err.response?.data?.message || "Something went wrong");
        } finally {
            setCreating(false);
        }
    };

    const handleAddMember = async () => {
        if (!newMemberEmail.trim()) {
            setAddMemberError("Email is required");
            return;
        }
        setAddingMember(true);
        setAddMemberError("");
        try {
            await axiosInstance.post(`/projects/${projectId}/members`, {
                email: newMemberEmail,
                role: newMemberRole,
            });
            setShowAddMember(false);
            setNewMemberEmail("");
            setNewMemberRole("member");
            fetchMembers();
        } catch (err) {
            setAddMemberError(err.response?.data?.message || "Something went wrong");
        } finally {
            setAddingMember(false);
        }
    };

    const handleUpdateStatus = async (taskId, newStatus) => {
        setUpdatingStatus(true);
        try {
            await axiosInstance.put(`/tasks/${projectId}/t/${taskId}`, {
                status: newStatus,
            });
            fetchTasks();
            if (selectedTask?._id === taskId) {
                setSelectedTask((prev) => ({ ...prev, status: newStatus }));
            }
        } catch (err) {
            // silent fail
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await axiosInstance.delete(`/tasks/${projectId}/t/${taskId}`);
            setSelectedTask(null);
            fetchTasks();
        } catch (err) {
            // silent fail
        }
    };

    const handleRemoveMember = async (userId) => {
        try {
            await axiosInstance.delete(`/projects/${projectId}/members/${userId}`);
            fetchMembers();
        } catch (err) {
            // silent fail
        }
    };

    const canManageTasks = myRole === "admin" || myRole === "project_admin";
    const isAdmin = myRole === "admin";

    if (projectLoading) return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
            <p className="text-gray-400 text-sm">Loading project...</p>
        </div>
    );


    const handleUpdateTask = async () => {
    if (!editTaskForm.title.trim()) {
        setEditTaskError("Title is required");
        return;
    }
    setUpdatingTask(true);
    setEditTaskError("");
    try {
        await axiosInstance.put(`/tasks/${projectId}/t/${selectedTask._id}`, editTaskForm);
        setIsEditingTask(false);
        fetchTasks();
        // update selectedTask locally so modal reflects changes
        setSelectedTask((prev) => ({ ...prev, ...editTaskForm }));
    } catch (err) {
        setEditTaskError(err.response?.data?.message || "Something went wrong");
    } finally {
        setUpdatingTask(false);
    }
};

    const handleUpdateMemberRole = async (userId, newRole) => {
    try {
        await axiosInstance.put(`/projects/${projectId}/members/${userId}`, {
            newRole,
        });
        fetchMembers();
    } catch (err) {
        // silent fail
    }
}

    return (
        <div className="min-h-screen bg-gray-950">

            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                        >
                            ← Back
                        </button>
                        <span className="text-gray-600">|</span>
                        <h1 className="text-white font-bold text-lg">
                            {project?.name}
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowMembersPanel(!showMembersPanel)}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            👥 Members ({members.length})
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8 flex gap-6">

                {/* Main — Tasks */}
                <div className="flex-1">

                    {/* Tasks Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-white text-xl font-bold">Tasks</h2>
                            <p className="text-gray-400 text-sm mt-0.5">{project?.description}</p>
                        </div>
                        {canManageTasks && (
                            <button
                                onClick={() => setShowTaskModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                + New Task
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Task columns */}
                    {tasksLoading ? (
                        <p className="text-gray-400 text-sm">Loading tasks...</p>
                    ) : tasks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                                <span className="text-3xl">✅</span>
                            </div>
                            <h3 className="text-white font-medium mb-2">No tasks yet</h3>
                            <p className="text-gray-400 text-sm">
                                {canManageTasks ? "Create your first task to get started" : "No tasks have been assigned yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {["todo", "in_progress", "done"].map((status) => (
                                <div key={status} className="bg-gray-900 rounded-xl p-4 border border-gray-800">
                                    <h3 className="text-sm font-medium text-gray-400 mb-3">
                                        {STATUS_LABELS[status]} ({tasks.filter(t => t.status === status).length})
                                    </h3>
                                    <div className="space-y-3">
                                        {tasks
                                            .filter((t) => t.status === status)
                                            .map((task) => (
                                                <div
                                                    key={task._id}
                                                    onClick={() => setSelectedTask(task)}
                                                    className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors"
                                                >
                                                    <p className="text-white text-sm font-medium mb-1">{task.title}</p>
                                                    {task.description && (
                                                        <p className="text-gray-400 text-xs line-clamp-2 mb-2">{task.description}</p>
                                                    )}
                                                    {task.assignedTo && (
                                                        <p className="text-gray-500 text-xs">
                                                            👤 {task.assignedTo.username}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        {tasks.filter(t => t.status === status).length === 0 && (
                                            <p className="text-gray-600 text-xs text-center py-4">No tasks</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Members Sidebar */}
                {showMembersPanel && (
                    <div className="w-72 bg-gray-900 border border-gray-800 rounded-xl p-4 h-fit">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-medium text-sm">Members</h3>
                            {isAdmin && (
                                <button
                                    onClick={() => setShowAddMember(true)}
                                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    + Add
                                </button>
                            )}
                        </div>
                        <div className="space-y-3">
                            {members.map((member) => (
    <div key={member.user._id} className="flex flex-col gap-2 pb-3 border-b border-gray-800 last:border-0 last:pb-0">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <img
                    src={member.user.avatar?.url}
                    alt={member.user.username}
                    className="w-7 h-7 rounded-full object-cover"
                />
                <p className="text-white text-xs font-medium">{member.user.username}</p>
            </div>
            {isAdmin && member.user._id !== user._id && (
                <button
                    onClick={() => handleRemoveMember(member.user._id)}
                    className="text-red-400 hover:text-red-300 text-xs transition-colors"
                >
                    Remove
                </button>
            )}
        </div>
        {isAdmin && member.user._id !== user._id ? (
            <select
                value={member.role}
                onChange={(e) => handleUpdateMemberRole(member.user._id, e.target.value)}
                className="w-full bg-gray-800 text-gray-400 text-xs rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
            >
                <option value="member">Member</option>
                <option value="project_admin">Project Admin</option>
                <option value="admin">Admin</option>
            </select>
        ) : (
            <p className="text-gray-500 text-xs">{member.role.replace("_", " ")}</p>
        )}
    </div>
))}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Detail Modal */}
{selectedTask && (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
        <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">

            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">
                    {isEditingTask ? "Edit Task" : selectedTask.title}
                </h3>
                <button
                    onClick={() => {
                        setSelectedTask(null);
                        setIsEditingTask(false);
                        setEditTaskError("");
                    }}
                    className="text-gray-500 hover:text-white transition-colors text-xl leading-none"
                >
                    ×
                </button>
            </div>

            {/* View Mode */}
            {!isEditingTask && (
                <>
                    {selectedTask.description && (
                        <p className="text-gray-400 text-sm mb-4">{selectedTask.description}</p>
                    )}

                    {/* Status */}
                    <div className="mb-4">
                        <p className="text-gray-500 text-xs mb-2">Status</p>
                        <div className="flex gap-2">
                            {["todo", "in_progress", "done"].map((s) => (
                                <button
                                    key={s}
                                    disabled={updatingStatus}
                                    onClick={() => handleUpdateStatus(selectedTask._id, s)}
                                    className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                                        selectedTask.status === s
                                            ? STATUS_STYLES[s]
                                            : "bg-gray-800 text-gray-500 border-gray-700 hover:border-gray-500"
                                    }`}
                                >
                                    {STATUS_LABELS[s]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Assigned to */}
                    {selectedTask.assignedTo && (
                        <div className="mb-4">
                            <p className="text-gray-500 text-xs mb-1">Assigned to</p>
                            <p className="text-white text-sm">{selectedTask.assignedTo.username}</p>
                        </div>
                    )}

                    {/* Edit + Delete buttons */}
                    {canManageTasks && (
                        <div className="flex gap-3 mt-2">
                            <button
                                onClick={() => {
                                    setIsEditingTask(true);
                                    setEditTaskForm({
                                        title: selectedTask.title,
                                        description: selectedTask.description || "",
                                        assignedTo: selectedTask.assignedTo?._id || "",
                                    });
                                }}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2 rounded-lg transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteTask(selectedTask._id)}
                                className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium py-2 rounded-lg transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Edit Mode */}
            {isEditingTask && (
                <>
                    {editTaskError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                            {editTaskError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Title</label>
                            <input
                                type="text"
                                value={editTaskForm.title}
                                onChange={(e) => setEditTaskForm((prev) => ({ ...prev, title: e.target.value }))}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                            <textarea
                                value={editTaskForm.description}
                                onChange={(e) => setEditTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1.5">Assign To</label>
                            <select
                                value={editTaskForm.assignedTo}
                                onChange={(e) => setEditTaskForm((prev) => ({ ...prev, assignedTo: e.target.value }))}
                                className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">Unassigned</option>
                                {members.map((m) => (
                                    <option key={m.user._id} value={m.user._id}>
                                        {m.user.username}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={() => {
                                setIsEditingTask(false);
                                setEditTaskError("");
                            }}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdateTask}
                            disabled={updatingTask}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                        >
                            {updatingTask ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </>
            )}
        </div>
    </div>
)}
           

            {/* Create Task Modal */}
            {showTaskModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
                        <h3 className="text-white font-semibold text-lg mb-5">Create New Task</h3>

                        {createError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {createError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                                    placeholder="Task title"
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                                <textarea
                                    value={newTask.description}
                                    onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="Task description"
                                    rows={3}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Assign To</label>
                                <select
                                    value={newTask.assignedTo}
                                    onChange={(e) => setNewTask((prev) => ({ ...prev, assignedTo: e.target.value }))}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="">Unassigned</option>
                                    {members.map((m) => (
                                        <option key={m.user._id} value={m.user._id}>
                                            {m.user.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Status</label>
                                <select
                                    value={newTask.status}
                                    onChange={(e) => setNewTask((prev) => ({ ...prev, status: e.target.value }))}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="todo">Todo</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowTaskModal(false);
                                    setCreateError("");
                                    setNewTask({ title: "", description: "", assignedTo: "", status: "todo" });
                                }}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateTask}
                                disabled={creating}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                            >
                                {creating ? "Creating..." : "Create Task"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">
                        <h3 className="text-white font-semibold text-lg mb-5">Add Member</h3>

                        {addMemberError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {addMemberError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    placeholder="member@example.com"
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                                <select
                                    value={newMemberRole}
                                    onChange={(e) => setNewMemberRole(e.target.value)}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                                >
                                    <option value="member">Member</option>
                                    <option value="project_admin">Project Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowAddMember(false);
                                    setAddMemberError("");
                                    setNewMemberEmail("");
                                }}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMember}
                                disabled={addingMember}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                            >
                                {addingMember ? "Adding..." : "Add Member"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ProjectDetail;