const express = require("express");
const userController = require("../controllers/user_controller");
const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
// router.get("/profile", authMiddleware, userController.profile);

module.exports = router;
