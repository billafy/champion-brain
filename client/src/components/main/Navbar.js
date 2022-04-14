import { Fragment, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { useLocation, Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { links, playNowLinks, settingLinks } from "../../utils/data";
import {
	showDropDown,
	hideDropDown,
	showPlayLinks,
	hidePlayLinks,
	showSettings,
	hideSettings,
	resetNavbar,
} from "../../reducers/navbarSlice";
import { logout } from "../../reducers/mainSlice";
import "../../styles/main/navbar.scss";
import urls from "../../utils/urls";
import { getProfilePicture } from "../../utils/utils";

const Navbar = () => {
	const dispatch = useDispatch();
	const { pathname } = useLocation();
	const {
		navbar: { dropDown, playLinks, settings },
		main: { user, isLoggedIn },
		game: { room },
	} = useSelector((state) => state);

	const handleLogout = async () => {
		try {
			const response = await axios.post(
				urls.logout,
				{},
				{ withCredentials: true }
			);
			if (response.data.success) dispatch(logout());
		} catch (err) {}
	};

	useEffect(() => {
		dispatch(resetNavbar());
	}, [pathname, dispatch]);

	return (
		<nav className="navbar">
			<div className="left-navbar">
				<div className="logo">
					<Link to="/">
						<img src="/images/newlogo.png" alt="Logo" />
					</Link>
				</div>
				<div className="play-btn">
					{room && !room.gameOver ? (
						<Link to={`/twoPlayer/${room.roomType}`}>
							Go To Room
						</Link>
					) : (
						<>
							<button
								onClick={() =>
									dispatch(
										playLinks
											? hidePlayLinks()
											: showPlayLinks()
									)
								}
							>
								Play Now
							</button>
							{playLinks && (
								<ul
									className="play-links"
									onMouseLeave={() =>
										dispatch(hidePlayLinks())
									}
								>
									{playNowLinks.map((playLink) => (
										<li key={playLink.title}>
											<Link to={playLink.to}>
												{playLink.title}
											</Link>
										</li>
									))}
								</ul>
							)}
						</>
					)}
				</div>
			</div>
			<div className="hamburger">
				<GiHamburgerMenu
					onClick={() =>
						dispatch(dropDown ? hideDropDown() : showDropDown())
					}
				/>
			</div>
			<div className={`right-navbar ${dropDown ? "show" : "hide"}`}>
				{isLoggedIn ? (
					<ul className="links">
						{links.map((link) => {
							if (link.admin && !user?.isAdmin) return <Fragment key={link.title}/>;
							return (
								<li
									key={link.title}
									className={
										pathname === link.to
											? "selected-link"
											: ""
									}
								>
									<Link to={link.to}>{link.title}</Link>
								</li>
							);
						})}
					</ul>
				) : (
					<div className="auth-btns">
						<Link to="/login">Login</Link>
						<Link to="/signup">Sign Up</Link>
					</div>
				)}
				{isLoggedIn && (
					<div className="avatar">
						<img
							src={getProfilePicture(user?.profilePicture)}
							alt="Avatar"
							className="profile-picture"
						/>
						<div className="info">
							<Link to="/myProfile" className="username">
								{user?.username}
							</Link>
							<p className="ticket">Ticket - xxx</p>
						</div>
					</div>
				)}
				<ul className="link-icons">
					<li className="notification-link">
						<FaBell />
					</li>
					<li>
						<MdSettings
							onClick={() =>
								dispatch(
									settings ? hideSettings() : showSettings()
								)
							}
						/>
						{settings && (
							<ul
								className="settings"
								onMouseLeave={() => dispatch(hideSettings())}
							>
								{settingLinks.map((setting) => (
									<li
										key={setting.title}
										onClick={
											setting.title === "Log out"
												? handleLogout
												: () => {}
										}
									>
										<Link to={setting.to}>
											{setting.title}
										</Link>
									</li>
								))}
							</ul>
						)}
					</li>
				</ul>
			</div>
		</nav>
	);
};

export default Navbar;