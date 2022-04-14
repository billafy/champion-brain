import { useState, useEffect } from "react";
import { socket } from "../../store";
import Loading from "../utils/Loading";
import "../../styles/game/twoPlayer.scss";
import { getProfilePicture } from "../../utils/utils";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const TwoPlayer = () => {
	const [newGuess, setNewGuess] = useState("");
	const [newNumber, setNewNumber] = useState("");
	const {
		main: { user },
		game: { room },
	} = useSelector((state) => state);
	const params = useParams();
	const navigate = useNavigate();

	const setNumber = () => {
		if (room)
			socket.emit("set-number", {
				number: newNumber,
				roomType: room.roomType,
				roomId: room.id,
			});
	};

	const makeGuess = (event) => {
		event.preventDefault();
		if (room && room.numberCount === room.playerCount && !room.gameOver) {
			socket.emit("make-guess", {
				guess: newGuess,
				roomType: room.roomType,
				roomId: room.id,
			});
			setNewGuess('');
		}
	};

	const leaveRoom = () => {
		if (room) {
			navigate('/');
			socket.emit("leave-room", {
				roomType: room.roomType,
				roomId: room.id,
			});
		}
	};

	useEffect(() => {
		if (params.roomType && (!room || room.gameOver))
			socket.emit("create-room", params.roomType);
	}, [params.roomType]);

	return (
		<div className="two-player">
			<div className="top-container">
				{room?.gameOver && (
					<div className="game-winner">
						<p>Game Over</p>
						<h2>
							<span>{room?.winner.user.username}</span> won
						</h2>
					</div>
				)}
				<div className="game-input">
					{room?.number ? (
						<div className="my-number">
							<p>Your Number</p>
							<h2>{room?.number}</h2>
						</div>
					) : (
						<>
							<p>Choose a {params.roomType} digit number</p>
							<input
								type="number"
								value={newNumber}
								onChange={({ target: { value } }) =>
									setNewNumber(value)
								}
							/>
							<input
								type="button"
								value="Confirm"
								onClick={setNumber}
							/>
						</>
					)}
				</div>
			</div>
			<p className="game-alert"></p>
			<div className="game-screen">
				{room?.players?.length === room?.playerCount ? (
					<>
						<div className="game-players">
							{room?.players?.map((player, i) => {
								return (
									<div
										className="game-player"
										key={player.socketId}
									>
										<div className="player">
											<img
												src={getProfilePicture(
													player.user.profilePicture
												)}
												alt="Avatar"
												className="profile-picture"
											/>
											<h4
												className={
													user._id === player.user._id
														? "my-username"
														: ""
												}
											>
												{player.user.username}
											</h4>
										</div>
										{room?.numberCount ===
											room?.playerCount && (
											<>
												{user._id === player.user._id &&
													!room?.gameOver && (
														<form className="guess-input">
															<input
																type="number"
																placeholder="Guess"
																value={newGuess}
																onChange={({
																	target: {
																		value,
																	},
																}) =>
																	setNewGuess(
																		value
																	)
																}
															/>
															<input
																type="submit"
																value="Guess"
																onClick={
																	makeGuess
																}
															/>
														</form>
													)}
												<div className="guesses">
													{room?.guesses[i]?.map(
														(guess, j) => {
															return (
																<div
																	className="guess"
																	key={j}
																>
																	<h4>
																		{
																			guess.number
																		}
																	</h4>
																	<p>
																		Y{" "}
																		<span>
																			{
																				guess.y
																			}
																		</span>
																	</p>
																	<p>
																		N{" "}
																		<span>
																			{
																				guess.n
																			}
																		</span>
																	</p>
																</div>
															);
														}
													)}
												</div>
											</>
										)}
									</div>
								);
							})}
						</div>
						{room?.numberCount !== 2 && (
							<div className="game-loading">
								<Loading />
								<p>Waiting for players to choose numbers...</p>
							</div>
						)}
					</>
				) : (
					<div className="game-loading">
						<Loading />
						<p>Waiting for players to join...</p>
					</div>
				)}
			</div>
			<div className="leave-room">
				<input type="button" value="Leave Room" onClick={leaveRoom} />
			</div>
		</div>
	);
};

export default TwoPlayer;