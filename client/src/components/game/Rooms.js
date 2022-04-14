import { Fragment, useEffect } from "react";
import "../../styles/game/rooms.scss";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { socket } from "../../store";
import { getProfilePicture } from "../../utils/utils";

const Rooms = () => {
	const { main: {user, isLoggedIn}, game: {rooms} } = useSelector((state) => state);
	const navigate = useNavigate();

	const joinRoom = ({roomId, roomType}) => {
		if(!isLoggedIn) 
			navigate('/login');
		socket.emit('join-room', {roomId, roomType});
	};

	const getRoom = (room) => {
		if(!room || room.gameOver || room.gameStarted || room.owner.user._id === user._id) 
			return <Fragment key={room.id}/>
		return (
			<li className="room" key={room.id}>
				<div className="room-info">
					<img
						src={getProfilePicture(room.owner.user.profilePicture)}
						alt="Avatar"
						className="profile-picture"
					/>
					<p>{room.owner.user.username}</p>
					<span>1000</span>
				</div>
				<div className="room-actions">
					<input type="button" value='View'/>
					<input
						type="button"
						onClick={() =>
							joinRoom({
								roomId: room.id,
								roomType: room.roomType,
							})
						}
						value='Join'
					/>
				</div>
			</li>
		);
	};

	useEffect(() => {
		socket.emit("get-rooms");
		socket.on('room-joined', (roomType) => navigate(`/twoPlayer/${roomType}`));
	}, []);

	return (
		<div className="rooms-container">
			<div className="rooms-container">
				<div className="rooms two-rooms">
					<h2>3x Room</h2>
					<ul className="room-list">
						{rooms[3]?.map(room => getRoom(room))}
					</ul>
				</div>
				<div className="rooms three-rooms">
					<h2>4x Room</h2>
					<ul className="room-list">
						{rooms[4]?.map(room => getRoom(room))}
					</ul>
				</div>
				<div className="rooms five-rooms">
					<h2>5x Room</h2>
					<ul className="room-list">
						{rooms[5]?.map(room => getRoom(room))}
					</ul>
				</div>
				<div className="rooms five-players-rooms">
					<h2>5 players room</h2>
					<ul className="room-list">
					</ul>
				</div>
			</div>
		</div>
	);
};

export default Rooms;