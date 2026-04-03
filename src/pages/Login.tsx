import { useState } from "react";
import { Bus, Mail, Lock } from "lucide-react";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useNavigate } from "react-router-dom";

export default function LoginScreen() {
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.email || !form.password) return;
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            navigate("/dashboard");
        }, 1000);
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 bg-gradient-to-br from-slate-900 to-emerald-900">

            <div className="w-full max-w-md">

                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Bus size={36} className="text-white" />
                    </div>

                    <h1 className="text-2xl font-bold text-white tracking-widest">
                        CAMPUSTRANSIT
                    </h1>

                    <p className="text-emerald-300 text-sm mt-2">
                        Admin Dashboard Access
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl p-6 shadow-xl space-y-5"
                >

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="admin@school.edu"
                        value={form.email}
                        onChange={handleChange}
                        leftIcon={<Mail size={18} />}
                    />

                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                        leftIcon={<Lock size={18} />}
                    />

                    <Button
                        type="submit"
                        className="w-full mt-2"
                        isLoading={loading}
                    >
                        Login to Dashboard
                    </Button>
                </form>

                <p className="text-center text-xs text-white/30 mt-8">
                    © 2026 UNIPH Transport Services
                </p>
            </div>
        </div>
    );
}