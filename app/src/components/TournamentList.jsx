import React from 'react';
import axios from 'axios'; // Import axios to make requests
import { Link } from 'react-router-dom';

const TournamentList = ({ tournaments = [], user }) => {
    // Ensure tournaments is always an array and safe for mapping
    const tournamentsList = Array.isArray(tournaments) ? tournaments : [];

    // Function to handle registration
    const handleRegister = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to register.');
            return;
        }

        try {
            await axios.post(`https://cuesportspro.glitch.me/tournament/${tournamentId}/register`, { userId: user._id }, { withCredentials: true });
            window.location.reload();
        } catch (error) {
            console.error("Error registering for tournament:", error);
        }
    };

    const handleWithdraw = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to withdraw.');
            return;
        }

        try {
            await axios.post(`https://cuesportspro.glitch.me/tournament/${tournamentId}/withdraw`, { userId: user._id }, { withCredentials: true });
            window.location.reload();
        } catch (error) {
            console.error("Error withdrawing from tournament:", error);
        }
    }

    const handleOfficiate = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to withdraw.');
            return;
        }

        if (user.role !== 'tournament-official') {
            alert('You must be a tournament official to officiate a tournament');
            return;
        }

        try {
            const response = await axios.post(`https://cuesportspro.glitch.me/tournament/${tournamentId}/officiate`, {userId: user._id }, { withCredentials: true });
            console.log(response.data);
            window.location.reload();
        } catch (error) {
            console.error("Error officiating tournament:", error);
        }
    }

    // Function to handle starting the tournament (in-progress)
    const handleStart = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to start the tournament.');
            return;
        }

        if (user.role !== 'tournament-official') {
            alert('You do not have permission to start the tournament.');
            return;
        }

        try {
            const response = await axios.post(`https://cuesportspro.glitch.me/tournament/${tournamentId}/start`, { userId: user._id }, { withCredentials: true });
            console.log(response.data);
            window.location.reload(); // Refresh the page to reflect the status change
        } catch (error) {
            console.error("Error starting tournament:", error);
        }
    };

    // Function to handle completing the tournament
    const handleComplete = async (tournamentId) => {
        if (!user) {
            alert('You must be signed in to complete the tournament.');
            return;
        }

        if (user.role !== 'tournament-official') {
            alert('You do not have permission to complete the tournament.');
            return;
        }

        try {
            const response = await axios.post(`https://cuesportspro.glitch.me/tournament/${tournamentId}/complete`, { userId: user._id }, { withCredentials: true });
            console.log(response.data);
            window.location.reload(); // Refresh the page to reflect the status change
        } catch (error) {
            console.error("Error completing tournament:", error);
        }
    };

    return (
        <div className="fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-white">Upcoming Tournaments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {!tournamentsList || tournamentsList.length === 0 ? (
                    <p className="text-center text-gray-300 col-span-3">No tournaments available at this time.</p>
                ) : (
                    tournamentsList.map((tournament) => (
                        tournament ? (
                            <div key={tournament._id || 'unknown'} className="card tournament-card p-6 slide-in-up">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-semibold text-white">{tournament.name}</h3>
                                    <span className={`badge ${tournament.status === 'open' ? 'badge-success' : 'badge-pending'}`}>
                                        {tournament.status === 'open' ? 'Open' : 'In Progress'}
                                    </span>
                                </div>
                                
                                <div className="space-y-2 mb-4">
                                    <p className="text-sm text-gray-300 flex items-center">
                                        <span className="mr-2">📅</span> {new Date(tournament.date).toLocaleDateString()}
                                    </p>
                                    <p className="text-sm text-gray-300 flex items-center">
                                        <span className="mr-2">🕰️</span> {tournament.time}
                                    </p>
                                    <p className="text-sm text-gray-300 flex items-center">
                                        <span className="mr-2">🎯</span> {tournament.format}
                                    </p>
                                    <p className="text-sm text-gray-300 flex items-center">
                                        <span className="mr-2">🎱</span> {tournament.ruleset}
                                    </p>
                                    <p className="text-sm text-gray-300 flex items-center">
                                        <span className="mr-2">🥇</span> First To: {tournament.scoring} {tournament.scoring > 1 ? "Wins" : "Win"}
                                    </p>
                                    <p className="text-sm text-gray-300 flex items-center justify-between">
                                        <span className="flex items-center">
                                            <span className="mr-2">👥</span> Players
                                        </span>
                                        <span className="bg-gray-700 px-2 py-1 rounded-full text-xs">
                                            {tournament.players.length} / 32
                                        </span>
                                    </p>
                                </div>

                                <div className="mt-6 space-y-3">
                                    {/* View Button for everyone */}
                                    <Link 
                                        to={`/tournament/${tournament._id}/players`}
                                        className="block text-center bg-gray-700 text-white py-2 px-4 rounded-full hover:bg-gray-600 transition-all duration-200"
                                    >
                                        View Players
                                    </Link>
                                    
                                    {/* Buttons for signed-in users */}
                                    {user && user.username && (
                                        <div className="space-y-3">
                                            {(tournament.players.some(player => player._id === user._id) || tournament.officials.some(official => official === user._id)) ? (
                                                <button
                                                    onClick={() => handleWithdraw(tournament._id)}
                                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-full hover:bg-red-500 transition-all duration-200"
                                                >
                                                    {tournament.players.some(player => player._id === user._id) ? "Withdraw" : "Unofficiate"}
                                                </button>
                                            ) : user.role === 'tournament-official' ? (
                                                <div className="space-y-3">
                                                    <button
                                                        onClick={() => handleRegister(tournament._id)}
                                                        className="w-full bg-emerald-600 text-white py-2 px-4 rounded-full hover:bg-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        disabled={tournament.players.length >= 32}
                                                    >
                                                        {tournament.players.length >= 32 ? "Tournament Full" : "Register as Player"}
                                                    </button>
                                                    <button
                                                        onClick={() => handleOfficiate(tournament._id)}
                                                        className="w-full bg-emerald-600 text-white py-2 px-4 rounded-full hover:bg-emerald-500 transition-all duration-200"
                                                    >
                                                        Officiate Tournament
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleRegister(tournament._id)}
                                                    className="w-full bg-emerald-600 text-white py-2 px-4 rounded-full hover:bg-emerald-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={tournament.players.length >= 32}
                                                >
                                                    {tournament.players.length >= 32 ? "Tournament Full" : "Register"}
                                                </button>
                                            )}

                                            {/* Admin controls */}
                                            {user && tournament.officials.includes(user._id) && tournament.status === 'open' && (
                                                <button
                                                    onClick={() => handleStart(tournament._id)}
                                                    className="w-full bg-amber-600 text-white py-2 px-4 rounded-full hover:bg-amber-500 transition-all duration-200"
                                                    disabled={tournament.players.length < 4}
                                                >
                                                    {tournament.players.length < 4 ? "Need at least 4 players" : "Start Tournament"}
                                                </button>
                                            )}

                                            {user && user.role === 'tournament-official' && tournament.status === 'in-progress' && (
                                                <button
                                                    onClick={() => handleComplete(tournament._id)}
                                                    className="w-full bg-amber-600 text-white py-2 px-4 rounded-full hover:bg-amber-500 transition-all duration-200"
                                                >
                                                    Mark as Completed
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null
                    ))
                )}
            </div>
        </div>
    );
};

export default TournamentList;
