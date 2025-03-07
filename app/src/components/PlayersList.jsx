import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";


const API_BASE_URL = 'https://cuesportspro.glitch.me';


const PlayersList = () => {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
          axios.get(`${API_BASE_URL}/api/players`)
            .then(response => {
                // Check if response is HTML
                const contentType = response.headers['content-type'];
                if (contentType && contentType.includes('text/html')) {
                    throw new Error('Received HTML instead of JSON');
                }
                
                if (!Array.isArray(response.data)) {
                    throw new Error('Expected array of players');
                }
                
                setPlayers(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching players:", error);
                setError("Failed to load players");
                setLoading(false);
            });
    }, []);

  
    if (loading) {
        return <div className="text-center text-white p-8">Loading players...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 p-8">{error}</div>;
    }

    return (
        <div className="max-w-5xl mx-auto p-8 bg-gray-900 text-white rounded-lg shadow-lg">
            <h2 className="text-3xl font-extrabold mb-6 text-center">Players List</h2>
            <div>
                {players.length === 0 ? (
                    <p className="text-center text-gray-400">No players found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {players.map((player) => (
                            <div key={player._id} className="flex items-center bg-gray-800 p-4 rounded-lg shadow-md space-x-4 hover:bg-gray-700 transition">
                                <img
                                    src={player.profilePicture}
                                    alt={`${player.username}'s profile`}
                                    className="w-16 h-16 rounded-full border-4 border-blue-500 shadow-lg"
                                />
                                <div>
                                    <Link to={`/profile/${player._id}`} className="font-semibold text-xl text-blue-300 hover:text-blue-500 transition">{player.username}</Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PlayersList;