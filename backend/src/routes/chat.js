import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { searchUsers } from "../controllers/chatUsersController.js";
import {
  addConversationMembers,
  createConversation,
  createDirectConversation,
  getConversationDetails,
  listConversations,
  removeConversationMember,
  updateConversation,
} from "../controllers/chatConversationsController.js";
import {
  createMessage,
  listConversationMessages,
  markConversationAsRead,
} from "../controllers/chatMessagesController.js";
import { listRelevantPresence } from "../controllers/chatPresenceController.js";

const router = express.Router();

router.get("/users/search", authMiddleware, searchUsers);
router.get("/presence", authMiddleware, listRelevantPresence);

router.get("/conversations", authMiddleware, listConversations);
router.post("/conversations/direct", authMiddleware, createDirectConversation);
router.post("/conversations", authMiddleware, createConversation);
router.get("/conversations/:id", authMiddleware, getConversationDetails);
router.patch("/conversations/:id", authMiddleware, updateConversation);
router.post("/conversations/:id/members", authMiddleware, addConversationMembers);
router.delete(
  "/conversations/:id/members/:userId",
  authMiddleware,
  removeConversationMember
);
router.get("/conversations/:id/messages", authMiddleware, listConversationMessages);
router.post("/conversations/:id/messages", authMiddleware, createMessage);
router.post("/conversations/:id/read", authMiddleware, markConversationAsRead);

export default router;
