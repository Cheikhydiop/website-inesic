import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2, Smartphone, Laptop, Tablet, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/AuthService';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

const DeviceVerification = () => {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const { sessionId, existingSessions, deviceInfo, from } = location.state || {};

    useEffect(() => {
        if (!sessionId) {
            navigate('/login');
        }
    }, [sessionId, navigate]);

    useEffect(() => {
        let timer: any;
        if (countdown > 0) {
            timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 6) return;

        setLoading(true);
        try {
            const res = await authService.verifyDevice(sessionId, otp);
            if (res.data?.token) {
                localStorage.setItem('auth_token', res.data.token);
                if (res.data.refreshToken) localStorage.setItem('refresh_token', res.data.refreshToken);
                toast({ title: 'Vérification réussie', description: 'Bienvenue sur votre espace sécurisé' });

                const targetPath = from?.pathname || '/dashboard';
                navigate(targetPath, { replace: true });
            } else {
                toast({ title: 'Erreur', description: res.error || 'Code invalide', variant: 'destructive' });
                setOtp('');
            }
        } catch (error: any) {
            toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        setResending(true);
        try {
            const res = await authService.resendDeviceOTP(sessionId);
            if (!res.error) {
                toast({ title: 'Code renvoyé', description: 'Un nouveau code a été envoyé par email' });
                setCountdown(60);
            } else {
                toast({ title: 'Erreur', description: res.error, variant: 'destructive' });
            }
        } catch (error: any) {
            toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
        } finally {
            setResending(false);
        }
    };

    const getDeviceIcon = (type: string) => {
        switch (type?.toUpperCase()) {
            case 'MOBILE': return <Smartphone className="w-8 h-8" />;
            case 'TABLET': return <Tablet className="w-8 h-8" />;
            default: return <Laptop className="w-8 h-8" />;
        }
    };

    if (!sessionId) return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-6">
            <div className="max-w-md w-full space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                <div className="text-center space-y-2">
                    <img src="/logo-sonatel.png" alt="Sonatel" className="h-12 mx-auto" />
                    <h1 className="text-2xl font-black text-gray-900">Vérification de l'appareil</h1>
                    <p className="text-sm text-gray-500 font-medium">Pour votre sécurité, nous devons confirmer votre identité.</p>
                </div>

                <Card className="border-2 border-white shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
                    <CardHeader className="pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-sonatel-orange/10 rounded-3xl text-sonatel-orange shadow-inner">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                        </div>
                        <CardTitle className="text-center text-xl font-black">Code de sécurité</CardTitle>
                        <CardDescription className="text-center font-medium">
                            Saisissez le code à 6 chiffres envoyé à votre adresse email professionnelle.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="flex justify-center">
                                <InputOTP
                                    maxLength={6}
                                    value={otp}
                                    onChange={(v) => setOtp(v)}
                                >
                                    <InputOTPGroup className="gap-2">
                                        <InputOTPSlot index={0} className="w-12 h-14 rounded-xl border-gray-200 text-lg font-black" />
                                        <InputOTPSlot index={1} className="w-12 h-14 rounded-xl border-gray-200 text-lg font-black" />
                                        <InputOTPSlot index={2} className="w-12 h-14 rounded-xl border-gray-200 text-lg font-black" />
                                        <InputOTPSlot index={3} className="w-12 h-14 rounded-xl border-gray-200 text-lg font-black" />
                                        <InputOTPSlot index={4} className="w-12 h-14 rounded-xl border-gray-200 text-lg font-black" />
                                        <InputOTPSlot index={5} className="w-12 h-14 rounded-xl border-gray-200 text-lg font-black" />
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full h-14 bg-sonatel-orange hover:bg-sonatel-orange/90 text-white rounded-2xl font-black tracking-widest shadow-lg transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "VÉRIFIER L'APPAREIL"}
                            </Button>
                        </form>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending || countdown > 0}
                                className="text-sm font-bold text-sonatel-orange hover:underline disabled:text-gray-400 disabled:no-underline flex items-center justify-center gap-2 mx-auto"
                            >
                                {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                {countdown > 0 ? `Renvoyer le code (${countdown}s)` : "Renvoyer le code"}
                            </button>
                        </div>

                        {deviceInfo && (
                            <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 italic text-xs text-gray-500">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-4 h-4 mt-0.5 text-gray-400" />
                                    <div>
                                        Cet appareil ({deviceInfo.deviceName || 'Inconnu'}) sera désormais reconnu comme appareil de confiance.
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DeviceVerification;
