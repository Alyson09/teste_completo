import { Request, Response } from 'express';
import { UserDatabase } from '../data/userDatabase';
import { CustomError } from '../errors/CustomError';
import { User } from '../model/User';

class getUserID {
    constructor(private userDatabase: UserDatabase) {} 

    public async getUserById(id: string) {
        const user = await this.userDatabase.getUserById(id);
        if (!user) {
            throw new CustomError(404, "User not found");
        }
        return {
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail(),
            role: user.getRole(),
        };
    }
}

export { getUserID };

class allGetUsers {
    constructor(private userDatabase: UserDatabase) {}

    public async getAllUsers(req: Request, res: Response){
        try {
            const isAdmin = req.body.role
            if (!isAdmin) {
                throw new CustomError(403, 'Precisa de acesso de admin');
            }
            const allUsers = await this.userDatabase.getAllUsers();
            const formattedUsers = allUsers.map((user: User) => ({
                id: user.getId(),
                name: user.getName(),
                email: user.getEmail(),
                role: user.getRole(),
            }));
            res.status(200).send(formattedUsers);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                console.error( error);
                res.status(500).send("erro no servidor");
            }
        }
    }
}

export { allGetUsers };


class getProfile {
    constructor(private userDatabase: UserDatabase) {}

    public async getUserProfile(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.id;
            const user = await this.userDatabase.getUserById(userId);
            if (!user) {
                throw new CustomError(404, 'not found');
            }
            const userProfile = {
                id: user.getId(),
                name: user.getName(),
                email: user.getEmail(),
                role: user.getRole(),
            };
            res.status(200).json(userProfile);
        } catch (error) {
            if (error instanceof CustomError) {
                res.status(error.statusCode).json({ message: error.message });
            } else {
                console.error(error);
                res.status(500).send('Erro no servidor');
            }
        }
    }
}

export { getProfile };
