

export interface SessionData {
    authenticated: boolean;
    user: {
        id: string;
        email: string | null;
        name: string | null;
        role: string;
        beneficiary?: {
            id: number;
        } | null;
    } | null;
}