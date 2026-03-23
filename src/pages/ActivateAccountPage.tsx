import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "@/services/AuthService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, User, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function ActivateAccountPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Les mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);
        try {
            const res = await authService.activateAccount(token || "", name, password);

            if (res.data) {
                setIsSuccess(true);
                toast.success("Compte activé avec succès !");
                setTimeout(() => navigate("/login"), 3000);
            } else {
                toast.error(res.error || "Erreur d'activation");
            }
        } catch (error: any) {
            toast.error(error.message || "Lien invalide ou expiré");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <Card className="max-w-md w-full border-2 border-emerald-100 rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in duration-500">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-black mb-2">Activation Réussie !</CardTitle>
                    <CardDescription className="text-gray-500 font-medium text-base mb-8">
                        Votre compte est désormais actif. Vous allez être redirigé vers la page de connexion dans quelques secondes...
                    </CardDescription>
                    <Button
                        onClick={() => navigate("/login")}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-14 rounded-2xl font-black tracking-widest"
                    >
                        SE CONNECTER MAINTENANT
                    </Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 bg-[radial-gradient(#E85D04_0.5px,transparent_0.5px)] [background-size:24px_24px] [background-position:0_0] bg-opacity-[0.03]">
            <div className="max-w-md w-full space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-4">
                    <img src="/logo-sonatel.png" alt="Sonatel" className="h-16 mx-auto drop-shadow-sm" />
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bienvenue sur</h1>
                        <p className="text-xs font-black text-sonatel-orange uppercase tracking-[0.3em] mt-1">SmartAudit DG-SECU/Sonatel Activation</p>
                    </div>
                </div>

                <Card className="border-2 border-white shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                    <CardHeader className="pt-10 pb-2 px-8">
                        <CardTitle className="text-xl font-black flex items-center gap-3">
                            <div className="p-2 bg-sonatel-orange/10 rounded-xl text-sonatel-orange">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            Finaliser votre compte
                        </CardTitle>
                        <CardDescription className="font-medium text-gray-500">
                            Définissez vos informations pour activer votre accès.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Votre Nom Complet</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-sonatel-orange transition-colors" />
                                    <Input
                                        placeholder="Prénom Nom"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-sonatel-orange/20 transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-sonatel-orange transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-sonatel-orange/20 transition-all font-bold"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirmer mot de passe</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-sonatel-orange transition-colors" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-12 h-14 rounded-2xl border-gray-100 bg-gray-50/30 focus:bg-white focus:ring-sonatel-orange/20 transition-all font-bold"
                                        required
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 font-medium ml-1">Minimum 8 caractères, un chiffre et une majuscule.</p>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 bg-sonatel-orange hover:bg-sonatel-orange/90 text-white rounded-2xl font-black tracking-widest shadow-lg shadow-orange-500/20 group transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isLoading}
                            >
                                {isLoading ? "ACTIVATION EN COURS..." : (
                                    <span className="flex items-center gap-3">
                                        ACTIVER MON COMPTE <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
