const cookie = require("cookie");
const { verifySocket } = require("../utils/auth");
const { Message } = require("../schema/models");
const { v4 } = require("uuid");
const { User } = require("../schema/models");
const { getUser, updateStats, getGuessScore } = require("../utils/utils");

const socketUsers = {};
const roomTypes = [3, 4, 5];
const rooms = {
	3: {},
	4: {},
	5: {},
};

const socketConnection = (io) => {
	io.on("connection", async (socket) => {
		const accessToken = cookie.parse(
			socket.handshake.headers.cookie || ""
		).accessToken;
		if (accessToken) {
			let user = verifySocket(accessToken);
			user = await User.findById(user._id).exec();
			socketUsers[socket.id] = {
				socketId: socket.id,
				user,
				inARoom: false,
			};
		}

		socket.on("global-message", async (text) => {
			if (socketUsers[socket.id]) {
				let message = new Message({
					from: socketUsers[socket.id].user._id,
					private: false,
					dateTime: new Date(),
					text,
				});
				message = await message.save();
				const _message = await Message.findById(message._id).populate(
					"from"
				);
				io.emit("global-message", _message);
			}
		});

		socket.on("create-room", async (roomType) => {
			if (socketUsers[socket.id]) {
				roomType = Number(roomType);
				if (!roomTypes.includes(roomType)) {
					socket.emit("room-error", "Invalid room type");
				} else if (socketUsers[socket.id].inARoom) {
					return;
				} else {
					const roomId = v4();
					const room = {
						id: roomId,
						owner: socketUsers[socket.id],
						players: [socketUsers[socket.id]],
						gameStarted: false,
						gameOver: false,
						winner: null,
						playerCount: 2,
						gameMode: 'two_player',
						roomType: roomType,
						numbers: [null],
						guesses: [[]],
						numberCount: 0,
					};
					socketUsers[socket.id].inARoom = true;
					rooms[roomType][roomId] = room;
					socket.emit("room-data", room);
					io.emit("room-list", rooms);
				}
			}
		});

		socket.on("join-room", async ({ roomId, roomType }) => {
			if (
				socketUsers[socket.id] &&
				!socketUsers[socket.id].inARoom &&
				roomId &&
				roomType
			) {
				const room = rooms[roomType][roomId];
				if (!room || room.gameOver || room.gameStarted)
					socket.emit(
						"room-error",
						"Invalid room ID or the room is already full"
					);
				else if(room.owner.user._id === socketUsers[socket.id].user._id) 
					socket.emit('room-error', 'Cannot join your own room')
				else {
					rooms[roomType][roomId] = {
						...room,
						players: [...room.players, socketUsers[socket.id]],
						numbers: [...room.numbers, null],
						gameStarted:
							room.players.length + 1 === room.playerCount
								? true
								: false,
						guesses: [...room.guesses, []],
					};
					socketUsers[socket.id].inARoom = true;
					socket.emit("room-joined", roomType);
					for (
						let i = 0;
						i < rooms[roomType][roomId].players.length;
						++i
					)
						io.to(rooms[roomType][roomId].players[i].socketId).emit(
							"room-data",
							rooms[roomType][roomId]
						);
					io.emit('room-list', rooms);
				}
			}
		});

		socket.on("get-rooms", async () => {
			if (socketUsers[socket.id]) socket.emit("room-list", rooms);
		});

		socket.on("set-number", ({ number, roomType, roomId }) => {
			if (!roomType || !roomId) return;
			const room = rooms[roomType][roomId];
			if (isNaN(number) || String(number).length !== room.roomType)
				socket.emit('room-error', `Enter a ${room.roomType} digit number`);
			else if(new Set(String(number)).size < String(number).length) 
				socket.emit('room-error', 'A digit should not be repeated');
			else if(String(number)[0] === '0') 
				socket.emit('room-error', 'Number cannot begin with a zero');
			else if (room && room.players.length === room.playerCount) {
				for (let i = 0; i < room.playerCount; ++i) {
					if (
						socket.id === room.players[i].socketId &&
						room.numbers[i] === null
					) {
						++rooms[roomType][roomId].numberCount;
						rooms[roomType][roomId].numbers[i] = Number(number);
						break;
					}
				}
				for (let i = 0; i < room.playerCount; ++i)
					io.to(room.players[i].socketId).emit("room-data", {
						...rooms[roomType][roomId],
						numbers: null,
						number: rooms[roomType][roomId].numbers[i],
					});
			}
		});

		socket.on("make-guess", async ({ guess, roomType, roomId }) => {
			const room = rooms[roomType][roomId];
			if (isNaN(guess) || String(guess).length !== room.roomType) 
				socket.emit('room-error', `Enter a ${room.roomType} digit number`);
			else if(String(guess)[0] === '0') 
				socket.emit('room-error', 'Number cannot begin with a zero');
			else if (room && !room.gameOver) {
				let playerIndex;
				for (let i = 0; i < room.playerCount; ++i) {
					if (socket.id === room.players[i].socketId) {
						playerIndex = i;
						break;
					}
				}
				for (let i = 0; i < room.playerCount; ++i) {
					if (socket.id !== room.players[i].socketId) {
						const guessScore = getGuessScore(
							room.numbers[i],
							guess,
							roomType
						);
						if (guessScore.y === room.roomType) {
							rooms[roomType][roomId].gameOver = true;
							rooms[roomType][roomId].winner = 
								socketUsers[socket.id];
							io.emit('room-list', rooms);
							for (let player of rooms[roomType][roomId].players) {
								if(socketUsers[player.socketId]) 
									socketUsers[player.socketId].inARoom = false;
							}
							await updateStats(room, socketUsers[socket.id]?.user._id);
						}
						rooms[roomType][roomId].guesses[playerIndex].push({
							number: guess,
							...guessScore,
						});
					}
				}
				for (let i = 0; i < room.playerCount; ++i) {
					let user;
					if(rooms[roomType][roomId].gameOver) 
						user = await getUser(room.players[i].user._id);
					io.to(room.players[i].socketId).emit("room-data", {
						...rooms[roomType][roomId],
						numbers: null,
						number: room.numbers[i],
						user
					});
				}
			}
		});

		socket.on("leave-room", async ({ roomType, roomId }) => {
			if (!roomType || !roomId) return;
			const room = rooms[roomType][roomId];
			if (room) {
				for (let player of room.players) {
					socketUsers[player.socketId].inARoom = false;
					if (socketUsers[socket.id].user._id !== player.user._id) {
						rooms[roomType][roomId].winner = player;
						await updateStats(room, player.user._id);
					}
				}
				rooms[roomType][roomId].gameOver = true;
				for (let i = 0; i < room.players.length; ++i) {
					let user = await getUser(room.players[i].user._id);
					io.to(room.players[i].socketId).emit("room-data", {
						...rooms[roomType][roomId],
						number: room.numbers[i],
						user,
					});
				}
				io.emit('room-list', rooms);
			}
		});

		socket.on("disconnect", () => {
			for (let roomType of roomTypes) {
				for (let room of Object.values(rooms[roomType])) {
					if (
						room.owner?.user._id ===
						socketUsers[socket.id]?.user._id ||
						room.gameOver
					)
						delete rooms[room];
				}
			}
			socketUsers[socket.id] = null;
		});
	});
};

module.exports = socketConnection;