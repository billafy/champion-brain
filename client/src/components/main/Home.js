import { stats } from "../../utils/data";
import "../../styles/main/home.scss";
import { useSelector } from "react-redux";

const Home = () => {
	const { user } = useSelector((state) => state.main);

	console.log(user);

	return (
		<div className="home">
			<div className="total-stats">
				<div className="total-stat">
					<h4>Games Played</h4>
					<p>{user.gamesPlayed}</p>
				</div>
				<div className="total-stat">
					<h4>Score</h4>
					<p>{user.score}</p>
				</div>
				<div className="total-stat">
					<h4>Ranking</h4>
					<p>{user.rank}</p>
				</div>
			</div>
			<div className="stats-container">
				{stats.map((stat) => {
					return (
						<div className="stats" key={stat.title}>
							<h3>{stat.title}</h3>
							<div className="results">
								<div className="result">
									<h4>Wins</h4>
									{!user?.stats[stat.name][3] ? (
										<p>{user.stats[stat.name][0]}</p>
									) : (
										<div className="result-stats">
											<div className="stat">
												<h5>3x</h5>
												<p>
													{
														user.stats[
															stat.name
														][3][0]
													}
												</p>
											</div>
											<div className="stat">
												<h5>4x</h5>
												<p>
													{
														user.stats[
															stat.name
														][4][0]
													}
												</p>
											</div>
											<div className="stat">
												<h5>5x</h5>
												<p>
													{
														user.stats[
															stat.name
														][5][0]
													}
												</p>
											</div>
										</div>
									)}
								</div>
								<div>
									<h4>Losses</h4>
									{!user.stats[stat.name][3] ? (
										<p>{user.stats[stat.name][1]}</p>
									) : (
										<div className="result-stats">
											<div className="stat">
												<h5>3x</h5>
												<p>
													{
														user.stats[
															stat.name
														][3][1]
													}
												</p>
											</div>
											<div className="stat">
												<h5>4x</h5>
												<p>
													{
														user.stats[
															stat.name
														][4][1]
													}
												</p>
											</div>
											<div className="stat">
												<h5>5x</h5>
												<p>
													{
														user.stats[
															stat.name
														][5][1]
													}
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default Home;
