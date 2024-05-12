import { User } from '../model/User'; 

class UserDatabase {
    private users: Map<string, User>; 
    constructor() {
        this.users = new Map();
    }

    public async getUserById(id: string): Promise<User | null> {
        const user = this.users.get(id);
        if (!user) {
            return null;
        }
        return user;
    }
    public async addUser(user: User): Promise<void> {
        this.users.set(user.getId(), user);
    }
    public async getAllUsers(): Promise<User[]> {
        return Array.from(this.users.values());
    }
}

export { UserDatabase };



