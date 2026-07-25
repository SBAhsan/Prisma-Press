import { Role } from "../../../generated/prisma/enums";

export interface ICreateUser {
    name: string,
    email: string,
    password: string,
    profilePhoto?: string,
    role: Role
}