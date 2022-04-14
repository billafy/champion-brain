const { User } = require("../schema/models");
const { imageKit, deleteMedia } = require("../utils/mediaStorage");
const { readFileSync } = require("fs");

const uploadProfilePicture = async (req, res) => {
	const {
		params: { _id },
		file,
	} = req;
	const type = file.mimetype.split("/")[0];
	const fileName = file.filename;
	if (type !== "image")
		return res.json({
			success: false,
			body: { error: "Invalid file type" },
		});
	const user = await User.findById(_id);
	if(!user) 
		return res.json({
			success: false,
			body: { error: "Invalid user ID" },
		});
	const image = readFileSync("public/" + fileName);
	imageKit.upload(
		{ file: image, fileName: fileName.split(".")[0] },
		async (err, result) => {
			if (err)
				return res.json({
					success: false,
					body: { error: "Failed to upload." },
				});
			const profilePicture = result.name;
			user.profilePicture = profilePicture;
			await user.save();
			deleteMedia(fileName);
			res.json({
				success: true,
				body: { message: "Profile picture uploaded", user },
			});
		}
	);
};

const getAllUsers = async (req, res) => {
	let users = await User.find({}, { _id: 1, password: 0 }).sort({score: -1});
	for(let i = 0; i < users.length; ++i) 
		users[i].rank = i + 1;
	return res.json({
		success: true,
		body: { message: `${users.length} user(s) fetched`, users },
	});
};

const makeAdmin = async (req, res) => {
	const {_id} = req.body;
	const user = await User.findById(_id);
	if(!user) 
		return res.json({success: false, body: {message: `User with ID ${_id} does not exists`}});
	user.isAdmin = true;
	user.markModified('isAdmin');
	user.save();
	res.json({success: true, body: {message: `User with ID ${_id} made an admin`}});
};

module.exports = {
	uploadProfilePicture,
	getAllUsers,
	makeAdmin,
};