const { Router } = require("express");
const { uploadProfilePicture, getAllUsers, makeAdmin } = require("../controllers/userController");
const { verifyAccessToken, verifyAdmin } = require("../utils/auth");
const { storageUpload } = require("../utils/mediaStorage");

const router = Router();

router.get("/getAllUsers", verifyAccessToken, verifyAdmin, getAllUsers);
router.put('/uploadProfilePicture/:_id', verifyAccessToken, storageUpload.single("profilePicture"), uploadProfilePicture);
router.put('/makeAdmin', verifyAccessToken, makeAdmin);

module.exports = router;