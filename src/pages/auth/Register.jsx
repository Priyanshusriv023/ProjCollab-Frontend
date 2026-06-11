import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });


    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        })); 
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await axiosInstance.post("/auth/register", formData);
            setSuccess(response.data.message);
            setTimeout(() => navigate("/login"), 2000);
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
                    <h1 className="text-2xl font-bold text-white"> Create your account</h1>
                    <p className="text-gray-400 text-sm mt-1">Start managing your projects today</p>
                </div>

                {/* Success Message */}
                {success && (
                    <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                        {success}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm text-gray-400 mb-1.5">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            placeholder="johndoe"
                            className="w-full bg-gray-800 text-white rounded-lg px-4 py-2.5 text-sm border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                        />
                    </div>

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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
                    >
                        {loading ? "Creating account..." : "Create account"}
                    </button>

                </form>

                {/* Footer */}
                <p className="text-center text-gray-500 text-sm mt-6">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    );
}

export default Register;