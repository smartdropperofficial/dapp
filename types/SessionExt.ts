import { Session } from 'next-auth';

export interface SessionExt extends Session { 
    id:string | null;
    address?: string | null;
    userid?: number | null;
    email?: string | null;
    plan?: string | null;
    verified?: boolean;
    isPromoter?: boolean | null;
    is_promoter_active?: boolean | null;
    isAdmin?: boolean | null;
    config_db: boolean;
}
