import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axiosInstance from "../api/axiosInstance";

function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", description: "" });
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axiosInstance.get("/projects");
            setProjects(response.data.data);
        } catch (err) {
            setError("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        if (!newProject.name.trim()) {
            setCreateError("Project name is required");
            return;
        }
        setCreating(true);
        setCreateError("");
        try {
            await axiosInstance.post("/projects", newProject);
            setShowModal(false);
            setNewProject({ name: "", description: "" });
            fetchProjects();
        } catch (err) {
            setCreateError(err.response?.data?.message || "Something went wrong");
        } finally {
            setCreating(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const getRoleBadgeStyle = (role) => {
        switch (role) {
            case "admin": return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
            case "project_admin": return "bg-purple-500/10 text-purple-400 border border-purple-500/20";
            default: return "bg-gray-500/10 text-gray-400 border border-gray-500/20";
        }
    };

    return (
        <div className="min-h-screen bg-gray-950">

            {/* Navbar */}
            <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <h1 className="text-white font-bold text-lg">Project Camp</h1>
                    <div className="flex items-center gap-4">
                        <span className="text-gray-400 text-sm">Hey, {user?.username}</span>
                        <button
                            onClick={handleLogout}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-6 py-8">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-white text-2xl font-bold">Your Projects</h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {projects.length} project{projects.length !== 1 ? "s" : ""} total
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        + New Project
                    </button>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <p className="text-gray-400 text-sm">Loading projects...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && projects.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                            <span className="text-3xl">📁</span>
                        </div>
                        <h3 className="text-white font-medium mb-2">No projects yet</h3>
                        <p className="text-gray-400 text-sm mb-6">Create your first project to get started</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                            + New Project
                        </button>
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map((item) => (
                            <div
                                key={item.project._id}
                                onClick={() => navigate(`/projects/${item.project._id}`)}
                                className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-gray-600 transition-colors"
                            >
                                {/* Project Name + Role */}
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-white font-medium text-base leading-tight">
                                        {item.project.name}
                                    </h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ml-2 shrink-0 ${getRoleBadgeStyle(item.role)}`}>
                                        {item.role.replace("_", " ")}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                                    {item.project.description || "No description provided"}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>👥 {item.project.members} member{item.project.members !== 1 ? "s" : ""}</span>
                                    <span>{new Date(item.project.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Create Project Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
                    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800">

                        <h3 className="text-white font-semibold text-lg mb-5">Create New Project</h3>

                        {createError && (
                            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {createError}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Project Name</label>
                                <input
                                    type="text"
                                    value={newProject.name}
                                    onChange={(e) => setNewProject((prev) => ({ ...prev, name: e.target.value }))}
                                    placeholder="My awesome project"
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">Description</label>
                                <textarea
                                    value={newProject.description}
                                    onChange={(e) => setNewProject((prev) => ({ ...prev, description: e.target.value }))}
                                    placeholder="What's this project about?"
                                    rows={3}
                                    className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600 resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setCreateError("");
                                    setNewProject({ name: "", description: "" });
                                }}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium py-2.5 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateProject}
                                disabled={creating}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                            >
                                {creating ? "Creating..." : "Create Project"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Dashboard;