import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const Settings = () => {
    const { userID } = useParams(); // ✅ Uses MongoDB `_id`
    const navigate = useNavigate();
    const [user, setUser] = useState({ privacySettings: 'public', optInTournamentEmails: true, optInNotificationEmails: true });
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notificationSettings, setNotificationSettings] = useState({
        optInTournamentEmails: true,
        optInNotificationEmails: true,
    });
    const [privacySettings, setPrivacySettings] = useState({
        privacySettings: 'public'
    });
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    // Fetch user data
    useEffect(() => {
        setLoading(true);
        axios.get(`https://cuesportspro.glitch.me/member/${userID}`)
            .then(response => {
                setUser(response.data);
                setNotificationSettings({
                    optInTournamentEmails: response.data.optInTournamentEmails || false,
                    optInNotificationEmails: response.data.optInNotificationEmails || false,
                });
                setPrivacySettings({
                    privacySettings: response.data.privacySettings || 'public'
                });
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                setError('Failed to load user settings');
                setLoading(false);
            });
    }, [userID]);

    // Handle settings update
    const handleSaveSettings = () => {
        setSaving(true);
        // Combine all settings for the update
        const updatedSettings = {
            ...user, 
            optInTournamentEmails: notificationSettings.optInTournamentEmails,
            optInNotificationEmails: notificationSettings.optInNotificationEmails,
            privacySettings: privacySettings.privacySettings
        };

        axios.put(`https://cuesportspro.glitch.me/member/${userID}`, updatedSettings)
            .then(() => {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            })
            .catch(error => {
                console.error('Error updating settings:', error);
                setUpdateError('Failed to update settings');
            })
            .finally(() => {
                setSaving(false);
            });
    };

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">⚙️ Edit Settings</h2>

            {message && <p className="text-green-500 text-center">{message}</p>}

            <form onSubmit={handleSaveSettings} className="space-y-4">
                {/* Privacy Settings */}
                {/*<div>*/}
                {/*    <label className="block font-semibold mb-2">Privacy Settings:</label>*/}
                {/*    <div className="flex space-x-4">*/}
                {/*        <label className={`p-2 border-2 rounded-md cursor-pointer ${user.privacySettings === 'public' ? 'border-gold-500' : 'border-gray-600'}`}>*/}
                {/*            <input*/}
                {/*                type="radio"*/}
                {/*                name="privacySettings"*/}
                {/*                value="public"*/}
                {/*                checked={user.privacySettings === 'public'}*/}
                {/*                onChange={() => setUser({ ...user, privacySettings: 'public' })}*/}
                {/*                className="hidden"*/}
                {/*            />*/}
                {/*            Public*/}
                {/*        </label>*/}
                {/*        <label className={`p-2 border-2 rounded-md cursor-pointer ${user.privacySettings === 'private' ? 'border-gold-500' : 'border-gray-600'}`}>*/}
                {/*            <input*/}
                {/*                type="radio"*/}
                {/*                name="privacySettings"*/}
                {/*                value="private"*/}
                {/*                checked={user.privacySettings === 'private'}*/}
                {/*                onChange={() => setUser({ ...user, privacySettings: 'private' })}*/}
                {/*                className="hidden"*/}
                {/*            />*/}
                {/*            Private*/}
                {/*        </label>*/}
                {/*    </div>*/}
                {/*</div>*/}

                <div className="space-y-4">
                    {/* Tournament Emails */}
                    <div className="flex items-center space-x-3">
                        <label className="text-lg font-semibold text-white">Receive Tournament Emails:</label>
                        <input
                            type="checkbox"
                            checked={notificationSettings.optInTournamentEmails}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, optInTournamentEmails: e.target.checked })}
                            className="hidden"  // Hides the actual checkbox
                        />
                        <span
                            onClick={(e) => {
                                e.preventDefault();
                                setNotificationSettings({ ...notificationSettings, optInTournamentEmails: !notificationSettings.optInTournamentEmails });
                            }}
                            className={`cursor-pointer text-sm font-medium py-1 px-3 rounded transition duration-200 
                  ${notificationSettings.optInTournamentEmails ? 'bg-gray-300 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
      {notificationSettings.optInTournamentEmails ? 'Disable' : 'Enable'}
    </span>
                    </div>

                    {/* Notification Emails */}
                    <div className="flex items-center space-x-3">
                        <label className="text-lg font-semibold text-white">Receive Notification Emails:</label>
                        <input
                            type="checkbox"
                            checked={notificationSettings.optInNotificationEmails}
                            onChange={(e) => setNotificationSettings({ ...notificationSettings, optInNotificationEmails: e.target.checked })}
                            className="hidden"  // Hides the actual checkbox
                        />
                        <span
                            onClick={(e) => {
                                e.preventDefault();
                                setNotificationSettings({ ...notificationSettings, optInNotificationEmails: !notificationSettings.optInNotificationEmails });
                            }}
                            className={`cursor-pointer text-sm font-medium py-1 px-3 rounded transition duration-200 
                  ${notificationSettings.optInNotificationEmails ? 'bg-gray-300 text-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
                        >
      {notificationSettings.optInNotificationEmails ? 'Disable' : 'Enable'}
    </span>
                    </div>
                </div>

                {/* Save Button */}
                <button
                    type="submit"
                    className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition"
                >
                    💾 Save Settings
                </button>
            </form>
        </div>
    );
};

export default Settings;
