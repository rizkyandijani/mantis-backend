import { Router } from "express";
import {
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUsersByRole,
  getAllUsers,
  loginUser,
  getUserByUserId
} from "../controllers/user";


export const loginRoute = loginUser
export const usersByRole = getUsersByRole;

const protectedUserRouter = Router();

protectedUserRouter.post("/", createUser);
protectedUserRouter.put("/:id", updateUser);
protectedUserRouter.delete("/:id", deleteUser);
protectedUserRouter.get("/byId/:userId", getUserByUserId);
protectedUserRouter.get("/email/:email", getUserByEmail);
protectedUserRouter.get("/", getAllUsers);

export {protectedUserRouter};