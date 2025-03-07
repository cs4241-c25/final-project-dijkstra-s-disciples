import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const profilePictures = [
    "https://cdn.glitch.global/534316ed-3a5d-42a8-a535-c85f120f8a02/src%2Fassets%2FProfilePictures%2FCueSportsProfile1.jpg?v=1741288294113",
    "https://cdn.glitch.global/534316ed-3a5d-42a8-a535-c85f120f8a02/src%2Fassets%2FProfilePictures%2FCueSportsProfile2.jpg?v=1741288298218",
    "https://cdn.glitch.global/534316ed-3a5d-42a8-a535-c85f120f8a02/src%2Fassets%2FProfilePictures%2FCueSportsProfile3.jpg?v=1741288295574",
    "https://cdn.glitch.global/534316ed-3a5d-42a8-a535-c85f120f8a02/src%2Fassets%2FProfilePictures%2FCueSportsProfile4.jpg?v=1741288293346",
    "https://cdn.glitch.global/534316ed-3a5d-42a8-a535-c85f120f8a02/src%2Fassets%2FProfilePictures%2FCueSportsProfile5.jpg?v=1741288290672"
];

const countries = [
    { name: "United States", code: "US", flag: "https://flagcdn.com/w40/us.png" },
    { name: "Canada", code: "CA", flag: "https://flagcdn.com/w40/ca.png" },
    { name: "United Kingdom", code: "GB", flag: "https://flagcdn.com/w40/gb.png" },
    { name: "Germany", code: "DE", flag: "https://flagcdn.com/w40/de.png" },
    { name: "France", code: "FR", flag: "https://flagcdn.com/w40/fr.png" }
];

const EditProfile = () => {
    const { userID } = useParams();
    const navigate = useNavigate();
    const [updatedUser, setUpdatedUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        axios.get(`https://cuesportspro.glitch.me/user`, { withCredentials: true })
            .then(response => {
                setUpdatedUser(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
                setError('Failed to load user data');
                setLoading(false);
            });
    }, []);

    const handleChange = (field, value) => {
        setUpdatedUser(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitting(true);

        axios.put(`https://cuesportspro.glitch.me/member/${updatedUser._id}`, updatedUser)
            .then(() => {
                setTimeout(() => {
                    navigate(`/profile/${updatedUser._id}`);
                }, 1500);
            })
            .catch(error => {
                console.error('Error updating profile:', error);
                setSubmitting(false);
            });
    };

    if (loading) return <div className="text-center text-gray-500">Loading...</div>;
    if (error) return <div className="text-center text-red-500">{error}</div>;

    return (
        <div className="max-w-lg mx-auto p-6 bg-gray-800 text-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">✏️ Edit Profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold">Username:</label>
                    <input type="text" name="username" value={updatedUser.username} 
                           onChange={(e) => handleChange('username', e.target.value)}
                           className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md" />
                </div>

                <div>
                    <label className="block font-semibold">Bio:</label>
                    <textarea name="bio" value={updatedUser.bio}
                              onChange={(e) => handleChange('bio', e.target.value)}
                              className="w-full p-2 border border-gray-600 bg-gray-900 text-white rounded-md" />
                </div>
              

                <div>
                    <label className="block font-semibold mb-2">Select Country:</label>
                    <div className="grid grid-cols-2 gap-3">
                        {countries.map((country) => (
                            <label key={country.code} className={`flex items-center p-2 rounded-md cursor-pointer border-2 ${updatedUser.country === country.name ? "border-gold-500" : "border-gray-600"}`}
                                   onClick={() => handleChange('country', country.name)}>
                                <input type="radio" name="country" value={country.name} checked={updatedUser.country === country.name} onChange={() => {}} className="hidden" />
                                <img src={country.flag} alt={country.name} className="w-6 h-4 rounded-sm mr-2" />
                                <span>{country.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block font-semibold mb-2">Choose Profile Picture:</label>
                    <div className="flex space-x-3">
                        {profilePictures.map((pic, index) => (
                            <img key={index} src={pic} alt={`Profile ${index + 1}`}
                                 className={`w-16 h-16 rounded-full cursor-pointer border-2 ${updatedUser.profilePicture === pic ? "border-blue-500" : "border-gray-600"}`}
                                 onClick={() => handleChange('profilePicture', pic)} />
                        ))}
                    </div>
                </div>

                <button type="submit" className="w-full bg-gold-500 text-black py-2 px-4 rounded-lg hover:bg-gold-400 transition">
                    {submitting ? "Saving..." : "💾 Save Changes"}
                </button>
            </form>
        </div>
    );
};

export default EditProfile;