import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                user_id: number;
                role: string;
                username: string;
                full_name?: string;
            };
        }
    }
}
