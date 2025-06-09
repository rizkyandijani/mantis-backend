import { Router } from "express";
import {
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  getUsersByRole,
  getAllUsers,
} from "../controllers/user";

const router = Router();

router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/email/:email", getUserByEmail);
router.get("/role/:role", getUsersByRole);
router.get("/", getAllUsers);

export default router;