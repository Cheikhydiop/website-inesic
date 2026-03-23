import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Validation du mot de passe
    const validatePassword = (password: string) => {
        const errors = [];
        if (password.length < 8) errors.push("Minimum 8 caractères");
        if (!/[A-Z]/.test(password)) errors.push("Au moins 1 majuscule");
        if (!/[a-z]/.test(password)) errors.push("Au moins 1 minuscule");
        if (!/[0-9]/.test(password)) errors.push("Au moins 1 chiffre");
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push("Au moins 1 caractère spécial");
        }
        return errors;
    };

    const passwordErrors = validatePassword(newPassword);
    const passwordsMatch = newPassword === confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordErrors.length > 0) {
            toast.error("Mot de passe invalide: " + passwordErrors.join(", "));
            return;
        }

        if (!passwordsMatch) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                toast.success("Mot de passe réinitialisé avec succès !");
                setTimeout(() => navigate("/login"), 2000);
            } else {
                toast.error(data.message || "Token invalide ou expiré");
            }
        } catch (error) {
            toast.error("Impossible de se connecter au serveur");
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="relative min-h-screen">
                <div className="absolute inset-0 bg-building"></div>
                <div className="right-sidebar">
                    <div className="login-card animate-in fade-in zoom-in duration-500">
                        <button
                            onClick={() => navigate("/login")}
                            className="flex items-center gap-2 text-gray-500 hover:text-orange-custom mb-6 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase">Retour</span>
                        </button>

                        <div className="login-logo">
                            <span>sonatel</span>
                            <div className="bg-orange-custom w-8 h-8 rounded-sm ml-2"></div>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl font-black mt-2 text-gray-900 tracking-tight">Token manquant</h1>
                            <p className="text-sm text-gray-500 mt-2">
                                Le lien de réinitialisation est invalide ou incomplet.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/forgot-password")}
                            className="btn-login flex justify-center items-center shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Demander un nouveau lien
                        </button>

                        <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                            © 2026 Direction de la sécurité <br /> Sonatel DG/SECU
                        </p>
                    </div>
                </div>
                <style>{`
                    .bg-orange-custom { background-color: #F5821F; }
                    .text-orange-custom { color: #F5821F; }
                    .bg-building {
                        background-image: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP4mWCL7fyetC2zp-AfbxM2q7_haesrAOc3A&s');
                        background-size: cover;
                        background-position: center;
                    }
                    .login-card {
                        background-color: white;
                        border-radius: 24px;
                        box-shadow: 0 25px 50px -12px rgba(245, 130, 31, 0.15);
                        padding: 2.5rem;
                        width: 100%;
                        max-width: 420px;
                        border: 1px solid rgba(245, 130, 31, 0.1);
                    }
                    .login-logo {
                        display: flex;
                        align-items: center;
                        margin-bottom: 2rem;
                    }
                    .login-logo span {
                        color: #429e9d;
                        font-size: 2rem;
                        font-weight: 900;
                        letter-spacing: -0.05em;
                    }
                    .btn-login {
                        background-color: #F5821F;
                        color: white;
                        height: 3.5rem;
                        border-radius: 14px;
                        font-weight: 900;
                        width: 100%;
                        margin-top: 1rem;
                        font-size: 0.875rem;
                        letter-spacing: 0.1em;
                    }
                    .right-sidebar {
                        position: absolute;
                        top: 0;
                        right: 0;
                        width: 100%;
                        height: 100%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 10;
                    }
                    @media (min-width: 768px) {
                        .right-sidebar {
                            width: 50%;
                            background-color: rgba(255, 255, 255, 0.1);
                            backdrop-filter: blur(12px);
                            border-left: 1px solid rgba(255, 255, 255, 0.3);
                        }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen">
            <div className="absolute inset-0 bg-building"></div>
            <div className="right-sidebar">
                <div className="login-card animate-in fade-in zoom-in duration-500">
                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 text-gray-500 hover:text-orange-custom mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Retour</span>
                    </button>

                    <div className="login-logo">
                        <span>sonatel</span>
                        <div className="bg-orange-custom w-8 h-8 rounded-sm ml-2"></div>
                    </div>

                    <div className="mb-8">
                        <p className="text-sm text-gray-600">Bienvenue sur <span className="text-orange-custom font-bold">G-SECU</span></p>
                        <h1 className="text-3xl font-black mt-2 text-gray-900 tracking-tight">Nouveau mot de passe</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Choisissez un mot de passe fort pour sécuriser votre compte
                        </p>
                    </div>

                    {success ? (
                        <div className="mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                <div className="text-green-600 font-semibold mb-2">✓ Mot de passe réinitialisé</div>
                                <p className="text-sm text-green-700">
                                    Redirection vers la connexion...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
                                    Nouveau mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5821F]/20 focus:border-[#F5821F] outline-none transition-all bg-gray-50/50"
                                        placeholder="Nouveau mot de passe"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {newPassword && (
                                    <div className="mt-2 text-xs space-y-1">
                                        {passwordErrors.map((error, i) => (
                                            <div key={i} className="flex items-center gap-1 text-red-500">
                                                <XCircle className="h-3 w-3" />
                                                {error}
                                            </div>
                                        ))}
                                        {passwordErrors.length === 0 && (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="h-3 w-3" />
                                                Mot de passe valide
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        className="w-full h-12 px-4 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5821F]/20 focus:border-[#F5821F] outline-none transition-all bg-gray-50/50"
                                        placeholder="Confirmer le mot de passe"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={loading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                    >
                                        {showConfirm ? (
                                            <EyeOff className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <Eye className="w-5 h-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && (
                                    <div className="mt-2 text-xs">
                                        {passwordsMatch ? (
                                            <div className="flex items-center gap-1 text-green-600">
                                                <CheckCircle className="h-3 w-3" />
                                                Les mots de passe correspondent
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1 text-red-500">
                                                <XCircle className="h-3 w-3" />
                                                Les mots de passe ne correspondent pas
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn-login flex justify-center items-center shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                disabled={loading || passwordErrors.length > 0 || !passwordsMatch}
                            >
                                {loading ? (
                                    <div className="loader"></div>
                                ) : (
                                    "RÉINITIALISER LE MOT DE PASSE"
                                )}
                            </button>
                        </form>
                    )}

                    <p className="mt-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                        © 2026 Direction de la sécurité <br /> Sonatel DG/SECU
                    </p>
                </div>
            </div>

            <style>{`
                .bg-orange-custom {
                    background-color: #F5821F;
                }
                .text-orange-custom {
                    color: #F5821F;
                }
                .bg-building {
                    background-image: url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRP4mWCL7fyetC2zp-AfbxM2q7_haesrAOc3A&s');
                    background-size: cover;
                    background-position: center;
                }
                .login-card {
                    background-color: white;
                    border-radius: 24px;
                    box-shadow: 0 25px 50px -12px rgba(245, 130, 31, 0.15);
                    padding: 2.5rem;
                    width: 100%;
                    max-width: 420px;
                    border: 1px solid rgba(245, 130, 31, 0.1);
                }
                .login-logo {
                    display: flex;
                    align-items: center;
                    margin-bottom: 2rem;
                }
                .login-logo span {
                    color: #429e9d;
                    font-size: 2rem;
                    font-weight: 900;
                    letter-spacing: -0.05em;
                }
                .btn-login {
                    background-color: #F5821F;
                    color: white;
                    height: 3.5rem;
                    border-radius: 14px;
                    font-weight: 900;
                    width: 100%;
                    margin-top: 1rem;
                    font-size: 0.875rem;
                    letter-spacing: 0.1em;
                }
                .right-sidebar {
                    position: absolute;
                    top: 0;
                    right: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 10;
                }
                @media (min-width: 768px) {
                    .right-sidebar {
                        width: 50%;
                        background-color: rgba(255, 255, 255, 0.1);
                        backdrop-filter: blur(12px);
                        border-left: 1px solid rgba(255, 255, 255, 0.3);
                    }
                }
                .loader {
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top: 3px solid white;
                    width: 24px;
                    height: 24px;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default ResetPassword;
