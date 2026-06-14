import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { useAuth } from "../../context/AuthContext";

function Login() {

    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
           const response = await axiosInstance.post("/auth/login", formData);
           const { user, accessToken } = response.data.data;
           login(user, accessToken);
           navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-lg">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-xl font-bold text-white">Welcome back</h1>
                    <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="john@example.com"
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="••••••••"
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                        />
                    </div>

                    <div className="text-right">
                        <Link
                            to="/forgot-password"
                            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                    >
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                </form>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Create one
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Login;