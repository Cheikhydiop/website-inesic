export interface ApiResponse<T> {
    data: T | null;
    error?: string;
    pagination?: {
        total: number;
        page?: number;
        limit?: number;
        pages?: number;
    };
}

/** Timeout par défaut pour les requêtes API (15 secondes) */
const DEFAULT_TIMEOUT_MS = 60_000;

/** Cache des headers pour éviter de recréer l'objet à chaque requête */
const BASE_HEADERS: Record<string, string> = {
    'Content-Type': 'application/json',
};

export class BaseService {
    protected baseURL: string;
    protected basePath: string;

    constructor(basePath: string = '') {
        const base = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        this.baseURL = base.endsWith('/api') ? base : `${base}/api`;
        this.basePath = basePath;
    }

    private getFullURL(endpoint: string): string {
        if (endpoint.startsWith('http')) return endpoint;

        const cleanBase = this.baseURL.endsWith('/')
            ? this.baseURL.slice(0, -1)
            : this.baseURL;
        const cleanPath = this.basePath.startsWith('/')
            ? this.basePath
            : `/${this.basePath}`;
        const cleanEndpoint = endpoint.startsWith('/')
            ? endpoint
            : endpoint
                ? `/${endpoint}`
                : '';

        return `${cleanBase}${cleanPath}${cleanEndpoint}`;
    }

    private getToken(): string | null {
        return localStorage.getItem('auth_token') || localStorage.getItem('token');
    }

    private static refreshingPromise: Promise<string | null> | null = null;
    private static isRefreshing = false;

    private async refreshToken(): Promise<string | null> {
        // Si un rafraîchissement est déjà en cours, retourner la promesse existante
        if (BaseService.isRefreshing && BaseService.refreshingPromise) {
            return BaseService.refreshingPromise;
        }

        BaseService.isRefreshing = true;
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
            BaseService.isRefreshing = false;
            return null;
        }

        BaseService.refreshingPromise = (async () => {
            try {
                const cleanBase = this.baseURL.endsWith('/')
                    ? this.baseURL.slice(0, -1)
                    : this.baseURL;

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 10_000); // Augmenté à 10s

                const response = await fetch(`${cleanBase}/auth/refresh`, {
                    method: 'POST',
                    headers: BASE_HEADERS,
                    body: JSON.stringify({ refreshToken }),
                    signal: controller.signal,
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    throw new Error('Impossible de rafraîchir le token');
                }

                const resObj = await response.json();
                const data = resObj.data || resObj;

                if (data.token) {
                    localStorage.setItem('auth_token', data.token);
                    if (data.refreshToken) {
                        localStorage.setItem('refresh_token', data.refreshToken);
                    }
                    return data.token;
                }

                return null;
            } catch (error) {
                // Nettoyer les tokens invalides
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('user_data');
                localStorage.removeItem('wallet_data');
                return null;
            } finally {
                BaseService.isRefreshing = false;
                BaseService.refreshingPromise = null;
            }
        })();

        return BaseService.refreshingPromise;
    }

    protected async request<T>(
        endpoint: string,
        options: RequestInit = {},
        timeoutMs: number = DEFAULT_TIMEOUT_MS
    ): Promise<ApiResponse<T>> {
        const url = this.getFullURL(endpoint);
        const token = this.getToken();

        const isFormData = options.body instanceof FormData;
        const headers: Record<string, string> = { ...BASE_HEADERS, ...(options.headers as Record<string, string> || {}) };

        if (isFormData) {
            delete headers['Content-Type'];
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // AbortController pour le timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            let response = await fetch(url, {
                ...options,
                headers,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            // Token expiré (401) → tenter de le rafraîchir
            if (response.status === 401 && token) {
                const newToken = await this.refreshToken();

                if (newToken) {
                    const newHeaders = { ...headers };
                    newHeaders['Authorization'] = `Bearer ${newToken}`;
                    response = await fetch(url, { ...options, headers: newHeaders });
                } else {
                    if (!window.location.pathname.startsWith('/login')) {
                        window.location.href = '/login';
                    }
                    return {
                        data: null,
                        error: 'Session expirée, veuillez vous reconnecter',
                    };
                }
            }

            // Erreurs HTTP
            if (!response.ok) {
                let errorMessage = 'Une erreur est survenue';
                try {
                    const errorData = await response.json();
                    if (errorData.error && typeof errorData.error === 'object' && errorData.error.message) {
                        errorMessage = errorData.error.message;
                    } else {
                        const err = errorData.error;
                        if (typeof err === 'string') {
                            errorMessage = err;
                        } else if (err && typeof err === 'object') {
                            if ('isTrusted' in err && Object.keys(err).length === 1) {
                                errorMessage = 'Une erreur est survenue (détails techniques masqués)';
                            } else {
                                errorMessage = errorData.message || JSON.stringify(err);
                            }
                        } else {
                            errorMessage = errorData.message || errorMessage;
                        }
                    }
                } catch {
                    errorMessage = `Erreur ${response.status}: ${response.statusText}`;
                }
                return { data: null, error: errorMessage };
            }

            // Pas de contenu (204)
            if (response.status === 204) {
                return { data: null };
            }

            const resObj = await response.json();

            if (resObj.success === false) {
                return {
                    data: null,
                    error: resObj.message || 'Une erreur est survenue',
                };
            }

            return {
                data: resObj.data !== undefined ? resObj.data : resObj,
                pagination: resObj.pagination,
            };
        } catch (error: any) {
            clearTimeout(timeoutId);

            // Erreur de timeout
            if (error?.name === 'AbortError') {
                return {
                    data: null,
                    error: 'Délai dépassé — vérifiez votre connexion réseau',
                };
            }

            return {
                data: null,
                error: error.message || 'Erreur de connexion au serveur',
            };
        }
    }

    protected async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    protected async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
        });
    }

    protected async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
        });
    }

    protected async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: data instanceof FormData ? data : (data ? JSON.stringify(data) : undefined),
        });
    }

    protected async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}