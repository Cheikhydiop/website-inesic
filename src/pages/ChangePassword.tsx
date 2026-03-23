import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Lock, AlertCircle } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import userSettingsService from '@/services/UserSettingsService';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ChangePassword() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
        setError(null);
    };

    const validateForm = () => {
        if (!passwords.oldPassword) {
            setError('Veuillez entrer votre mot de passe actuel');
            return false;
        }

        if (passwords.newPassword.length < 6) {
            setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
            return false;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Les nouveaux mots de passe ne correspondent pas');
            return false;
        }

        if (passwords.oldPassword === passwords.newPassword) {
            setError('Le nouveau mot de passe doit être différent de l\'ancien');
            return false;
        }

        return true;
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSaving(true);
            setError(null);

            await userSettingsService.changePassword({
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword
            });

            toast({
                title: '✅ Succès',
                description: 'Votre mot de passe a été modifié avec succès',
            });

            // Rediriger vers le profil après succès
            setTimeout(() => {
                navigate('/profile');
            }, 1500);

        } catch (error: any) {
            console.error('Erreur changemnet mot de passe:', error);

            // Gestion des messages d'erreur du backend
            const errorMessage = error.response?.data?.message || 'Impossible de modifier le mot de passe. Vérifiez votre mot de passe actuel.';

            setError(errorMessage);

            toast({
                title: '❌ Erreur',
                description: errorMessage,
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AppLayout>
            <div className="safe-top min-h-screen bg-background pb-20">
                {/* Header */}
                <header className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3 border-b bg-background/95 backdrop-blur-sm">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/profile/settings')}>
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold flex-1">Sécurité</h1>
                </header>

                <div className="px-4 py-6 max-w-md mx-auto">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Changer le mot de passe</h2>
                            <p className="text-sm text-muted-foreground">Sécurisez votre compte</p>
                        </div>
                    </div>

                    {error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="oldPassword">Mot de passe actuel</Label>
                            <Input
                                id="oldPassword"
                                name="oldPassword"
                                type="password"
                                placeholder="Votre mot de passe actuel"
                                value={passwords.oldPassword}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                            <Input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                placeholder="Minimum 6 caractères"
                                value={passwords.newPassword}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                placeholder="Confirmez le mot de passe"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                disabled={isSaving}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    Modification...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Mettre à jour le mot de passe
                                </>
                            )}
                        </Button>
                    </form>

                    <p className="mt-8 text-xs text-center text-muted-foreground">
                        Si vous avez oublié votre mot de passe actuel, veuillez vous déconnecter et utiliser la fonction "Mot de passe oublié".
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
