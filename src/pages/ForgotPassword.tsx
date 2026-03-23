import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccess(true);
                toast.success("Email envoyé ! Vérifiez votre boîte mail pour réinitialiser votre mot de passe.");
            } else {
                toast.error(data.message || "Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Impossible de se connecter au serveur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Background image */}
            <div className="absolute inset-0 bg-building"></div>

            {/* Right sidebar with blur effect */}
            <div className="right-sidebar">
                {/* Forgot Password card */}
                <div className="login-card animate-in fade-in zoom-in duration-500">
                    {/* Back button */}
                    <button
                        onClick={() => navigate("/login")}
                        className="flex items-center gap-2 text-gray-500 hover:text-orange-custom mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase">Retour</span>
                    </button>

                    {/* Sonatel logo */}
                    <div className="login-logo">
                        <span>sonatel</span>
                        <div className="bg-orange-custom w-8 h-8 rounded-sm ml-2"></div>
                    </div>

                    {/* Welcome text */}
                    <div className="mb-8">
                        <p className="text-sm text-gray-600">Bienvenue sur <span className="text-orange-custom font-bold">G-SECU</span></p>
                        <h1 className="text-3xl font-black mt-2 text-gray-900 tracking-tight">Mot de passe oublié</h1>
                        <p className="text-sm text-gray-500 mt-2">
                            Entrez votre adresse email pour recevoir un lien de réinitialisation
                        </p>
                    </div>

                    {/* Form */}
                    {success ? (
                        <div className="mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                                <div className="text-green-600 font-semibold mb-2">✓ Email envoyé</div>
                                <p className="text-sm text-green-700">
                                    Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
                                    <br />Vérifiez votre boîte mail (et vos spams).
                                </p>
                            </div>
                            <div className="text-center mt-6">
                                <Link to="/login" className="text-orange-custom text-sm font-bold hover:underline">
                                    ← Retour à la connexion
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 ml-1">
                                    Adresse email
                                </label>
                                <input
                                    type="email"
                                    className="w-full h-12 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#F5821F]/20 focus:border-[#F5821F] outline-none transition-all bg-gray-50/50"
                                    placeholder="prenom.nom@sonatel.sn"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loading}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn-login flex justify-center items-center shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="loader"></div>
                                ) : (
                                    "ENVOYER LE LIEN"
                                )}
                            </button>

                            <div className="text-center mt-6">
                                <Link to="/login" className="text-orange-custom text-xs font-bold hover:underline">
                                    ← Retour à la connexion
                                </Link>
                            </div>
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

export default ForgotPassword;
