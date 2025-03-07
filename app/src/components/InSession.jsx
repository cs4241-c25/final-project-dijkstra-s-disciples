import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const InSession = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        // Fetch tournaments that are in progress
        axios.get('https://cuesportspro.glitch.me/tournaments/in-progress')
            .then((response) => {
                if (Array.isArray(response.data)) {
                    setTournaments(response.data);
                } else {
                    console.error("Expected array but got:", response.data);
                    setTournaments([]);
                }
            })
            .catch((error) => {
                setError('Error fetching in-progress tournaments');
                console.error(error);
                setTournaments([]);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="text-center text-white py-8">Loading in-session tournaments...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="in-session-container bg-gray-900 p-8 rounded-lg shadow-xl">
            <h2 className="text-center text-3xl text-white font-bold mb-8">Now In Session</h2>
            {!tournaments || tournaments.length === 0 ? (
                <p className="text-center text-white">No tournaments are currently in session.</p>
            ) : (
                <div className="tournament-list">
                    {tournaments.map((tournament) => (
                        <div key={tournament._id} className="bg-gray-800 p-4 rounded-lg mb-6">
                            <h3 className="text-xl font-semibold text-gold-400">{tournament.name}</h3>
                            <p className="text-sm text-gray-300">📅 {new Date(tournament.date).toLocaleDateString()}</p>
                            {/*<p className="text-sm text-gray-300">🕰️ Time: {tournament.time}</p>*/}
                            <p className="text-sm text-gray-300">🎯 Format: {tournament.format}</p>
                            <p className="text-sm text-gray-300">🎱 Ruleset: {tournament.ruleset}</p>
                            <p className="text-sm text-gray-300">🥇 First To: {tournament.scoring} {tournament.scoring > 1 ? "Wins" : "Win"}</p>
                            <p className="text-sm text-gray-300">👥 Players: {tournament.players.length} / 32</p>

                            <Link to={`/tournament/${tournament._id}/bracketDisplay`} className="text-blue-400 hover:underline">
                                View Bracket
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default InSession;
