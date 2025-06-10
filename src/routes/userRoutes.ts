import { Router } from "express";
import {
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUsersByRole,
  getAllUsers,
  loginUser,
} from "../controllers/user";


export const loginRoute = loginUser

const protectedUserRouter = Router();

protectedUserRouter.post("/login", loginUser);
protectedUserRouter.post("/", createUser);
protectedUserRouter.put("/:id", updateUser);
protectedUserRouter.delete("/:id", deleteUser);
protectedUserRouter.get("/email/:email", getUserByEmail);
protectedUserRouter.get("/role/:role", getUsersByRole);
protectedUserRouter.get("/", getAllUsers);

export {protectedUserRouter};