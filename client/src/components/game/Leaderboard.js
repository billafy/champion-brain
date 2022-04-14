import { FaTrophy } from "react-icons/fa";
import "../../styles/game/leaderboard.scss";

const getPlayer = (name, pfp, flag) => {
    return (
        <div className="player">
            <img src={pfp} alt="Avatar" className="profile-picture" />
            <p>
                {name}&nbsp;
                <img className="flag" src={flag} alt="Flag" />
            </p>
        </div>
    );
};

const Leaderboard = () => {
    return (
        <div className="leaderboard">
            <div className="heading">
                <h3>
                    Leaderboard <FaTrophy />
                </h3>
            </div>
            <div className="top-rank first">
                <h4>1st Place</h4>
                {getPlayer(
                    "George",
                    "/images/sample-avatar.jpg",
                    "/countries/Bulgaria.png"
                )}
            </div>
            <div className="second-third">
                <div className="top-rank second">
                    <h4>2nd Place</h4>
                    {getPlayer(
                        "John",
                        "/images/sample-avatar.jpg",
                        "/countries/Romania.png"
                    )}
                </div>
                <div className="top-rank third">
                    <h4>3rd Place</h4>
                    {getPlayer(
                        "Mark",
                        "/images/sample-avatar.jpg",
                        "/countries/Azerbaijan.png"
                    )}
                </div>
            </div>
            <div className="rankings">
                <div className="rank">
                    <p>4</p>
                    {getPlayer(
                        "Robert",
                        "/images/sample-avatar.jpg",
                        "/countries/India.png"
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;