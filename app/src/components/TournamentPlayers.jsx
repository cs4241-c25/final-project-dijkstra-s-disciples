import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useParams, useNavigate } from 'react-router-dom';

// API base URL configuration
const API_BASE_URL = 'https://cuesportspro.glitch.me';

const TournamentPlayers = ({user}) => {
    const { id } = useParams(); // Get the tournament ID from the URL
    const [tournamentData, setTournamentData] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            setError('Tournament ID is missing');
            return;
        }

        // Fetch the tournament data (either players or bracket)
        axios.get(`${API_BASE_URL}/tournament/${id}/bracket`)
            .then((response) => {
                setTournamentData(response.data);
            })
            .catch((error) => {
                setError('Error fetching tournament data');
                console.error(error);
            });
    }, [id]);

    const removePlayer = (playerID) => {
        axios.post(`${API_BASE_URL}/tournament/${id}/withdraw`, { userId: playerID}, { withCredentials: true })
            .then(() => {
                console.log('Player has been removed.');
                window.location.reload();
            })
            .catch((error) => {
                setError('Error removing player.');
                console.log(error);
            })
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!tournamentData) {
        return <div className="text-center text-white">Loading...</div>;
    }

    return (
        <div className="bg-gray-900 p-8 rounded-lg shadow-xl">
            {/* Add debugging information */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mb-4 p-2 bg-gray-800 text-xs">
                    <p>Debug - User Info:</p>
                    <pre>{JSON.stringify({ 
                        isUserDefined: !!user,
                        userRole: user?.role,
                        isOfficial: user?.role === 'tournament-official'
                    }, null, 2)}</pre>
                </div>
            )}
            <h2 className="text-center text-2xl text-white font-bold mb-8">Players in Tournament: {tournamentData.name}</h2>
            {tournamentData.status === 'open' ? (
                <ul className="text-white text-lg">
                    {tournamentData.players.length === 0 ? (
                        <p className="text-center">No players have registered yet.</p>
                    ) : (
                        tournamentData.players.map((player) => (
                            <div className="flex justify-between items-center" key={player._id}>
                            {console.log(tournamentData.officials, user)}
                            {console.log(tournamentData.officials[0]._id, user._id)}
                                <li className="py-2">
                                    <Link to={`/profile/${player._id}`} className="hover:text-gold-400 transition">
                                        {player.username}
                                    </Link>
                                </li>
                                    {user && tournamentData.officials.length !== 0 && tournamentData.officials.some(official => official._id.toString() === user._id.toString()) && (
                                    <button
                                        className="ml-auto sm:ml-4 w-full sm:w-auto bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition"
                                        onClick={() => removePlayer(player._id)}
                                    >
                                        Reject {player.username}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </ul>
            ) : (
                <div className="text-white">
                    <h3 className="text-xl font-semibold mb-4">Bracket</h3>
                    <p>The tournament has started. The bracket is now available.</p>
                </div>
            )}
        </div>
    );
};

export default TournamentPlayers;
