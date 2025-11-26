import bcrypt from "bcryptjs";
import type { DbStorage } from "./db-storage";
import type { InsertUser, User } from "@shared/schema";

export class AuthService {
  constructor(private storage: DbStorage) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async register(userData: InsertUser): Promise<User> {
    // Check if username already exists
    const existingUser = await this.storage.getUserByUsername(userData.username);
    if (existingUser) {
      throw new Error("Username already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user with hashed password
    const user = await this.storage.createUser({
      ...userData,
      password: hashedPassword
    });

    return user;
  }

  async login(username: string, password: string): Promise<User> {
    // Find user by username
    const user = await this.storage.getUserByUsername(username);
    if (!user) {
      throw new Error("Invalid username or password");
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid username or password");
    }

    return user;
  }

  async getUserById(id: string): Promise<User | undefined> {
    return this.storage.getUser(id);
  }
}

// Session user type (without password)
export type SessionUser = Omit<User, 'password'>;

export function createSessionUser(user: User): SessionUser {
  const { password, ...sessionUser } = user;
  return sessionUser;
}