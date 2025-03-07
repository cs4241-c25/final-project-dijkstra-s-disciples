import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import passportLocal from 'passport-local';
import bcrypt from 'bcryptjs';
import session from 'express-session';
import cors from 'cors';
import nodemailer from 'nodemailer';
import User from './src/models/Users.js'; //
dotenv.config();
const app = express();


import path from 'path';

import { fileURLToPath } from 'url'; // Add this import

// Convert import.meta.url to __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('__dirname:', __dirname);

// Serve static files from the 'dist' directory (Vite's build output)
app.use(express.static(path.join(__dirname, 'build')));

// Fallback route to serve the index.html for client-side routing
// Enable CORS
app.use(cors({
    origin: ['https://cuesportspro.glitch.me', 'http://localhost:5173'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false} // Set secure: true if using HTTPS in production
}));
app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('✅ MongoDB connected'))
    .catch((err) => console.log('❌ MongoDB connection error:', err));

//SMTP email setup using nodemailer
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "cuesportsevents@gmail.com",
        pass: process.env.EMAIL_PW,
    }
});

const tournament_created = (name, recipients) => {
    return {
        from: '"Cue Sports Club" <cuesportsevents@gmail.com>', // Sender address
        //to: "cuesportsevents@gmail.com", // Placeholder
        bcc: recipients.join(","), // Recipient's email
        subject: `A new tournament, ${name}, has been created`, // Subject line
        text: `Hello!

A new tournament, ${name}, has been created.

You can look at the participants and other information here, (website url here)!

Best regards,  
Cue Sports Club
`,
    };
};

const tournament_starting_now = (name, recipients) => {
    return {
        from: '"Cue Sports Club" <cuesportsevents@gmail.com>', // Sender address
        bcc: recipients.join(","), // Recipient's email
        subject: `Tournament "${name}" has just started`, // Subject line
        text: `Hello!

A tournament you signed up for has been started by tournament organizers. Don't miss it!

You can view the matchups by visiting our website, https://cuesportspro.glitch.me/.

Best regards,  
Cue Sports Club
`,
    };
};

const sendEmail = (message, name, recipients) => {
    transporter.sendMail(message(name, recipients), (error, info) => {
        if (error) {
            console.log("Error:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
};

// Tournament Schema
const tournamentSchema = new mongoose.Schema({
    name: {type: String, required: true},
    date: {type: Date, required: true},
    time: {type: String, required: true},
    ruleset: {type: String, required: true},
    format: {type: String, required: true},
    scoring: {type: Number, required: true},
    status: {type: String, enum: ['open', 'in-progress', 'completed'], default: 'open'},
    players: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    officials: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    bracket: {type: Array, default: []} // New field to persist the bracket
});


const Tournament = mongoose.model('Tournament', tournamentSchema);

// ✅ Match Schema
const matchSchema = new mongoose.Schema({
    tournament: {type: mongoose.Schema.Types.ObjectId, ref: 'Tournament'},
    player1: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    player2: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    score1: Number,
    score2: Number,
    winner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    date: Date
});
const Match = mongoose.model('Match', matchSchema);

// ✅ Local Authentication (Username & Password)
passport.use(new passportLocal.Strategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({username});
            if (!user) return done(null, false, {message: 'Incorrect username'});

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return done(null, false, {message: 'Incorrect password'});

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }
));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || "188339855927-2gb5fa052k3upkvvq91gqms0ii8lph59.apps.googleusercontent.com",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "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",
    callbackURL: process.env.OAUTH_CALLBACK_URL || 'https://cuesportspro.glitch.me/auth/google/callback',
    scope: ['profile', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({googleId: profile.id});

        if (!user) {
            user = new User({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                role: 'player'
            });
            await user.save();
        }

        return done(null, user);
    } catch (error) {
        return done(error, null);
    }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// ✅ Log Authentication Requests
app.use((req, res, next) => {
    if (req.path.startsWith('/login/federated/google') || req.path.startsWith('/auth/google/callback')) {
        console.log(`🛠️ Request received at: ${req.path}`);
        console.log(`🔍 Method: ${req.method}`);
        console.log(`📡 Headers:`, req.headers);
        console.log(`📊 Query Params:`, req.query);
        console.log(`📦 Body:`, req.body);
    }
    next();
});

// ✅ Google Authentication Routes
app.get('/login/federated/google', (req, res, next) => {
    console.log("🚀 Initiating Google authentication...");
    next();
}, passport.authenticate('google', {scope: ['profile', 'email']}));

app.get('/auth/google/callback', (req, res, next) => {
    console.log("🔄 Google authentication callback triggered.");
    console.log(`🔑 Query Params:`, req.query);
    next();
}, passport.authenticate('google', {
    successRedirect: process.env.SUCCESS_REDIRECT_URL || 'https://cuesportspro.glitch.me',
    failureRedirect: '/login'
}), (req, res) => {
    if (req.isAuthenticated()) {
        console.log(`✅ Authentication successful for user: ${req.user?.email || 'Unknown'}`);
    } else {
        console.log("❌ Authentication failed.");
    }
});


app.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({message: 'Logout error'});
        req.session.destroy();
        res.status(200).json({message: 'Logged out successfully'});
    });
});

app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
        res.json(req.user); // Sends the authenticated user's data
    } else {
        res.status(401).json({message: 'Not authenticated'});
    }
});

// Backend - Set tournament official
app.post('/tournament/:id/officiate', async (req, res) => {
    const tournamentId = req.params.id;
    const {userId} = req.body;
    // Check if the user is authenticated and has the 'tournament-official' role
    if (!req.isAuthenticated()) {
        return res.status(401).json({message: 'You must be signed in to officiate.'});
    }

    if (req.user.role !== 'tournament-official') {
        return res.status(403).json({message: 'You do not have permission to officiate a tournament.'});
    }

    try {
        // Find the tournament
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }

        if (tournament.officials.includes(userId)) {
            return res.status(400).json({message: 'You are already officiating this tournament.'});
        }

        if (tournament.players.includes(userId)) {
            return res.status(400).json({message: 'You cannot officiate a tournament you are participating in.'});
        }

        // Add the player to the tournament's players array
        tournament.officials.push(userId);
        await tournament.save();

        res.status(200).json({message: 'Tournament official assigned successfully!'});
    } catch (error) {
        console.error('Error officiating the tournament:', error);
        res.status(500).json({message: 'Error officiating the tournament', error});
    }
});

// ✅ Player List Endpoint



app.get('/players', async (req, res) => {
    try {
        const players = await User.find({role: 'player'}).select('username wins losses');
        res.json(players);
    } catch (error) {
        res.status(500).json({message: 'Error fetching players', error});
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({}); // Fetch all users with all fields
        res.json(users);
    } catch (error) {
        res.status(500).json({message: 'Error fetching users', error});
    }
});


// ✅ Register a User
app.post('/register', async (req, res) => {
    const {username, password, role} = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({username, password: hashedPassword, role});
        await newUser.save();
        res.status(201).json({message: 'User registered successfully'});
    } catch (error) {
        res.status(500).json({message: 'Error registering user', error});
    }
});

// ✅ User Login (Local)
app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
    res.status(200).json({message: 'Logged in successfully'});
});

// ✅ Create a Tournament
app.post('/tournaments', async (req, res) => {
    console.log("Received POST request:", req.body);
    const {name, date, time, ruleset, format, scoring, levels} = req.body;

    if (!name || !date || !time || !ruleset || !format || !scoring) {
        return res.status(400).json({message: "Missing required fields"});
    }

    try {
        let newTournaments = []

        if (levels.length === 0) {
            newTournaments.push(new Tournament(
                {
                    name: name,
                    date: date,
                    time: time,
                    ruleset: ruleset,
                    format: format,
                    scoring: scoring
                }));
            await newTournaments[newTournaments.length - 1].save();
        } else {
            for (let i = 0; i < levels.length; i++) {
                newTournaments.push(new Tournament(
                    {
                        name: `${name} for ${levels[i]}`,
                        date: date,
                        time: time,
                        ruleset: ruleset,
                        format: format,
                        scoring: scoring
                    }))
                await newTournaments[newTournaments.length - 1].save();
            }
        }

        const users = await User.find({optInTournamentEmails: true}).select('email');
        // Send email to all players after tournament creation
        await sendEmail(tournament_created, name, users); // Pass the tournament name

        res.status(201).json({message: 'Tournament created successfully', tournaments: newTournaments});

    } catch (error) {
        console.error("Error creating tournament:", error);
        res.status(500).json({message: "Server error", error});
    }
});

// ✅ Fetch All Tournaments
app.get('/tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find({status: "open"}).populate('players');
        res.json(tournaments);
    } catch (error) {
        console.error("Error fetching tournaments:", error);
        res.status(500).json({message: 'Error fetching tournaments', error});
    }
});

app.get('/past-tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find({status: "completed"})
            .populate('players')
            .populate('officials');

        // For each tournament, we need to populate the bracket data
        const populatedTournaments = await Promise.all(tournaments.map(async (tournament) => {
            const tournamentObj = tournament.toObject();

            if (tournamentObj.bracket && tournamentObj.bracket.length > 0) {
                // Get all user IDs from the bracket to fetch them in one query
                const userIds = new Set();
                tournamentObj.bracket.forEach(round => {
                    round.forEach(match => {
                        if (match.player1) userIds.add(match.player1.toString());
                        if (match.player2) userIds.add(match.player2.toString());
                        if (match.winner) userIds.add(match.winner.toString());
                    });
                });

                // Fetch all users in one query
                const users = await User.find({_id: {$in: Array.from(userIds)}});
                const usersMap = {};
                users.forEach(user => {
                    usersMap[user._id.toString()] = user;
                });

                // Populate the bracket with user data
                const populatedBracket = [];
                tournamentObj.bracket.forEach(round => {
                    const populatedRound = round.map(match => {
                        const populatedMatch = {...match};

                        if (match.player1 && usersMap[match.player1.toString()]) {
                            populatedMatch.player1 = usersMap[match.player1.toString()];
                        }

                        if (match.player2 && usersMap[match.player2.toString()]) {
                            populatedMatch.player2 = usersMap[match.player2.toString()];
                        }

                        return populatedMatch;
                    });

                    populatedBracket.push(populatedRound);
                });

                tournamentObj.bracket = populatedBracket;
            }

            return tournamentObj;
        }));

        res.json(populatedTournaments);
    } catch (error) {
        console.error('Error fetching past tournaments:', error);
        res.status(500).json({message: 'Error fetching tournaments', error});
    }
});

// Helper function to generate a bracket given an array of players
const generateBracket = (players) => {
    const n = players.length;
    // Determine the next power of 2 greater than or equal to n
    let totalSlots = 1;
    while (totalSlots < n) {
        totalSlots *= 2;
    }
    // Fill the first round with players followed by nulls (byes)
    let roundPlayers = [...players];
    while (roundPlayers.length < totalSlots) {
        roundPlayers.push(null);
    }
    const rounds = [];
    // Generate rounds until one match remains
    while (roundPlayers.length > 1) {
        const round = [];
        for (let i = 0; i < roundPlayers.length / 2; i ++) {
            round.push({
                player1: roundPlayers[i],
                player2: roundPlayers[roundPlayers.length - 1 - i],
                winner: null
            });
        }
        rounds.push(round);
        // For the next round, we create placeholders (winners will be set later)
        roundPlayers = new Array(round.length).fill(null);
    }
    let byes = []
    rounds[0].some(match => {
        if (match.player2 === null) {
            match.winner = match.player1;
            byes.push(match.winner);
        }
    });
    rounds[1].some(match => {
        if (byes.length > 0) {match.player1 = byes.shift()}
        if (byes.length > 0) {match.player2 = byes.shift()}
    });
    return rounds;
};

// Set Tournament Status to "In-Progress"
app.post('/tournament/:id/start', async (req, res) => {
    const tournamentId = req.params.id;

    // Ensure the user is authenticated and is a tournament official
    if (!req.isAuthenticated()) {
        return res.status(401).json({message: 'You must be signed in to start the tournament.'});
    }
    if (req.user.role !== 'tournament-official') {
        return res.status(403).json({message: 'You do not have permission to start the tournament.'});
    }

    try {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }

        // Check if the tournament is already in progress
        if (tournament.status === 'in-progress') {
            return res.status(400).json({message: 'Tournament is already in progress.'});
        }

        // Generate the bracket if the tournament status is "open"
        const bracket = generateBracket(tournament.players); // You may need to use the existing generateBracket function
        tournament.bracket = bracket;
        tournament.status = 'in-progress'; // Set the status to in-progress

        await tournament.save();

        //create an array of users
        const users = await Promise.all(
            tournament.players.map(async (id) => {
                const user = await User.findById(id);
                return user && user.optInNotificationEmails ? user.email : null;
            })
        );

        // Remove null values
        const filteredUsers = users.filter(user => user !== null);

        // const users = await User.find({optInTournamentEmails: true, }).select('email');
        sendEmail(tournament_starting_now, tournament.name, filteredUsers);
        res.status(200).json({message: 'Tournament has started and bracket has been generated!'});
    } catch (error) {
        console.error('Error starting tournament:', error);
        res.status(500).json({message: 'Error starting tournament', error});
    }
});

// Set Tournament Status to "Completed"
app.post('/tournament/:id/complete', async (req, res) => {
    const tournamentId = req.params.id;

    // Ensure the user is authenticated and is a tournament official
    if (!req.isAuthenticated()) {
        return res.status(401).json({message: 'You must be signed in to complete the tournament.'});
    }
    if (req.user.role !== 'tournament-official') {
        return res.status(403).json({message: 'You do not have permission to complete the tournament.'});
    }

    try {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }

        // If the tournament is not in progress, it cannot be marked as completed
        if (tournament.status !== 'in-progress') {
            return res.status(400).json({message: 'Tournament is not in progress.'});
        }

        tournament.status = 'completed'; // Set the status to completed
        await tournament.save();

        res.status(200).json({message: 'Tournament is now completed!'});
    } catch (error) {
        console.error('Error completing tournament:', error);
        res.status(500).json({message: 'Error completing tournament', error});
    }
});

app.get('/tournament/:id/details', async (req, res) => {
    const tournamentId = req.params.id;
    try {
        if (!tournamentId) {
            return res.status(400).json({message: 'Tournament ID is missing'});
        }
        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return res.status(400).json({message: 'Invalid tournament ID'});
        }

        // Fetch tournament details including name, ruleset, and format
        const tournament = await Tournament.findById(tournamentId).select('name ruleset format');

        if (!tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }

        // Log output for debugging
        console.log("Tournament Data:", tournament);

        res.json({
            name: tournament.name,
            ruleset: tournament.ruleset,
            format: tournament.format
        });
    } catch (error) {
        console.error('Error fetching tournament details:', error);
        res.status(500).json({ message: 'Error fetching tournament details', error });
    }
});



// Fetch bracket data for a specific tournament
// Backend - Get the bracket for a specific tournament
app.get('/tournament/:id/bracket', async (req, res) => {
    const tournamentId = req.params.id;
    try {
        if (!tournamentId) {
            return res.status(400).json({message: 'Tournament ID is missing'});
        }
        if (!mongoose.Types.ObjectId.isValid(tournamentId)) {
            return res.status(400).json({message: 'Invalid tournament ID'});
        }

        // Fetch tournament with populated player data
        const tournament = await Tournament.findById(tournamentId)
            .populate('players')
            .populate('officials');

        if (!tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }

        // Debug: Log the raw bracket data
        console.log('Raw bracket data from DB:', JSON.stringify(tournament.bracket, null, 2));

        // If the tournament hasn't begun, send the players list
        if (tournament.status === 'open') {
            res.json({
                name: tournament.name,
                status: tournament.status,
                players: tournament.players,
                officials: tournament.officials
            });
        } else {
            // For in-progress or completed tournaments, we need to populate player data in the bracket
            // Deep populate player1 and player2 in each match of each round
            const populatedBracket = [];

            // Get all user IDs from the bracket to fetch them in one query
            const userIds = new Set();
            tournament.bracket.forEach(round => {
                round.forEach(match => {
                    if (match.player1) userIds.add(match.player1.toString());
                    if (match.player2) userIds.add(match.player2.toString());
                    if (match.winner) userIds.add(match.winner.toString());
                });
            });

            console.log('User IDs collected from bracket:', Array.from(userIds));

            // Fetch all users in one query
            const users = await User.find({_id: {$in: Array.from(userIds)}});
            const usersMap = {};
            users.forEach(user => {
                usersMap[user._id.toString()] = user;
            });

            // Populate the bracket with user data
            tournament.bracket.forEach((round, roundIdx) => {
                const populatedRound = round.map((match, matchIdx) => {
                    const populatedMatch = {...match.toObject ? match.toObject() : match};

                    // Ensure player1 is properly populated
                    if (match.player1) {
                        const player1Id = match.player1.toString();
                        if (usersMap[player1Id]) {
                            populatedMatch.player1 = usersMap[player1Id];
                        }
                    }

                    // Ensure player2 is properly populated
                    if (match.player2) {
                        const player2Id = match.player2.toString();
                        if (usersMap[player2Id]) {
                            populatedMatch.player2 = usersMap[player2Id];
                        }
                    }

                    // Ensure winner ID is preserved
                    if (match.winner) {
                        populatedMatch.winner = match.winner.toString();
                    }

                    return populatedMatch;
                });

                populatedBracket.push(populatedRound);
            });

            // Debug: Log the populated bracket
            console.log('Populated bracket (first round):', JSON.stringify(populatedBracket[0], null, 2));

            res.json({
                name: tournament.name,
                status: tournament.status,
                bracket: populatedBracket,
                officials: tournament.officials,
                scoring: tournament.scoring
            });
        }
    } catch (error) {
        console.error('Error fetching bracket:', error);
        res.status(500).json({message: 'Error fetching bracket', error});
    }
});

// Register a player for a specific match in the tournament
// Player registration route
app.post('/tournament/:id/register', async (req, res) => {
    const tournamentId = req.params.id;
    const {userId} = req.body;

    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
        return res.status(401).json({message: 'You must be signed in to register.'});
    }

    try {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }

        if (tournament.players.length >= 32) {
            return res.status(400).json({message: 'Tournament is already full.'});
        }

        if (tournament.players.includes(userId)) {
            return res.status(400).json({message: 'You are already registered for this tournament.'});
        }

        if (tournament.officials.includes(userId)) {
            return res.status(400).json({message: 'You cannot register for a tournament you are already officiating.'});
        }

        // Add the player to the tournament's players array
        tournament.players.push(userId);
        await tournament.save();

        res.status(200).json({message: 'Successfully registered for the tournament!'});
    } catch (error) {
        console.error('Error registering for tournament:', error);
        res.status(500).json({message: 'Error registering for the tournament', error});
    }
});

app.post('/tournament/:id/withdraw', async (req, res) => {
    const tournamentId = req.params.id;
    const {userId} = req.body; // The userId of the logged-in player attempting to register

    // Check if the user is authenticated
    if (!req.isAuthenticated()) {
        return res.status(401).json({message: 'You must be signed in to withdraw.'});
    }

    try {
        const tournament = await Tournament.findById(tournamentId).populate('players');

        if (!tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }

        if (tournament.players.find(player => player._id.toString() === userId.toString()) === undefined &&
            tournament.officials.find(official => official._id.toString() === userId.toString()) === undefined) {
            return res.status(400).json({message: 'You are not already registered or officiating for this tournament.'});
        }
        if (tournament.players.find(player => player._id.toString() === userId.toString()) !== undefined) {
            tournament.players = tournament.players.filter(player => player._id.toString() !== userId.toString());
        }
        if (tournament.officials.find(official => official._id.toString() === userId.toString()) !== undefined) {
            tournament.officials = tournament.officials.filter(official => official._id.toString() !== userId.toString());
        }

        await tournament.save();
        res.status(200).json({message: 'Successfully withdrawn from the tournament!'});
    } catch (error) {
        console.error('Error withdrawing from tournament:', error);
        res.status(500).json({message: 'Error withdrawing from the tournament', error});
    }
});

// ✅ Send email function
const sendEmailToPlayers = async (tournamentName) => {
    try {
        const players = await User.find({role: 'player'});

        for (const player of players) {
            const mailOptions = {
                from: process.env.EMAIL, // Sender address
                to: player.email, // List of recipients (player's email)
                subject: `New Tournament Available: ${tournamentName}`, // Subject line
                text: `Hello ${player.username},\n\nA new tournament has been created: ${tournamentName}.\n\nYou can now sign up to participate. Don't miss out!\n\nBest regards,\nCue Sports Club Tournament Management`, // Body of the email
            };

            // Send email
            await transporter.sendMail(mailOptions);
        }
        console.log('Emails sent successfully to all players!');
    } catch (error) {
        console.error('Error sending emails:', error);
    }
};

// Endpoint to begin a tournament (generate and persist the bracket)
app.post('/tournament/:id/begin', async (req, res) => {
    const tournamentId = req.params.id;

    // Verify user is authenticated and is a tournament official
    if (!req.isAuthenticated()) {
        return res.status(401).json({message: 'You must be signed in to begin the tournament.'});
    }
    if (req.user.role !== 'tournament-official') {
        return res.status(403).json({message: 'You do not have permission to begin the tournament.'});
    }
    try {
        // Populate players for proper bracket generation
        const tournament = await Tournament.findById(tournamentId).populate('players');
        if (!tournament) {
            return res.status(404).json({message: 'Tournament not found'});
        }
        if (tournament.status !== 'open') {
            return res.status(400).json({message: 'Tournament has already begun.'});
        }
        // Generate and persist the bracket
        const bracket = generateBracket(tournament.players);
        tournament.bracket = bracket;
        tournament.status = 'in-progress';
        await tournament.save();
        res.status(200).json({message: 'Tournament has begun and bracket generated.', bracket});
    } catch (error) {
        console.error('Error beginning tournament:', error);
        res.status(500).json({message: 'Error beginning tournament', error});
    }
});

// ✅ Root Route
app.get('/', (req, res) => {
    res.send('Welcome to the Cue Sports Club Tournament Management System. Wong asks you to please refresh to go to the main page.');
});

app.get('/test-user', async (req, res) => {
    const test = await User.findOne({username: "Devin Mihaichuk"})
    res.json(test);
});

// Fetch In-Progress Tournaments
app.get('/tournaments/in-progress', async (req, res) => {
    try {
        const tournaments = await Tournament.find({status: 'in-progress'}).populate('players');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({message: 'Error fetching in-progress tournaments', error});
    }
});


app.get('/member/:id', async (req, res) => {
    const memberId = req.params.id;

    try {
        const user = await User.findById(memberId);

        if (!user) {
            return res.status(404).json({message: 'User not found'});
        }
        res.json(user);
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({message: 'Error finding user', error});
    }
});
app.put('/member/:id', async (req, res) => {
    const memberId = req.params.id; // ✅ Extract user ID from URL
    const updateData = req.body; // ✅ Get updated fields dynamically

    console.log("🔹 Received update request for user ID:", memberId);
    console.log("🔹 Update Data:", updateData); // Debugging

    try {
        // ✅ Find user by `_id` instead of `googleId`
        console.log(memberId);
        const updatedUser = await User.findByIdAndUpdate(
            memberId,
            updateData, // ✅ Update only the provided fields
            {new: true, runValidators: true}
        );

        if (!updatedUser) {
            console.log("❌ User not found in database.");
            return res.status(404).json({message: 'User not found'});
        }

        console.log("✅ Profile/settings updated successfully:", updatedUser);
        res.status(200).json({message: 'Update successful', user: updatedUser});
    } catch (error) {
        console.error('❌ Error updating user:', error);
        res.status(500).json({message: 'Error updating user', error});
    }
});

app.put('/users/update-all', async (req, res) => {
    try {
        const {users} = req.body;

        if (!Array.isArray(users)) {
            return res.status(400).json({message: "Invalid data format. Expected an array of users."});
        }

        const updatePromises = users.map(user => {
            return User.findByIdAndUpdate(
                user._id,
                {$set: user}, // Ensures missing fields are added
                {new: true, upsert: false, runValidators: true} // Keeps existing users and validates data
            );
        });

        const updatedUsers = await Promise.all(updatePromises);

        res.json({message: "All users updated successfully", updatedUsers});
    } catch (error) {
        console.error("Error updating users:", error);
        res.status(500).json({message: "Error updating users", error});
    }
});

// Update match winner and advance player in bracket
app.post('/tournament/:id/update-match', async (req, res) => {
    const tournamentId = req.params.id;
    const {roundIndex, matchIndex, winnerId, score1, score2} = req.body;

    console.log('Update match request received:', {
        tournamentId,
        roundIndex,
        matchIndex,
        winnerId,
        score1,
        score2
    });

    // Ensure the user is authenticated and is a tournament official
    if (!req.isAuthenticated()) {
        console.log('Authentication failed for update-match');
        return res.status(401).json({message: 'You must be signed in to update match results.'});
    }

    if (req.user.role !== 'tournament-official') {
        console.log('Permission denied: User role is', req.user.role);
        return res.status(403).json({message: 'You do not have permission to update match results.'});
    }

    try {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            console.log('Tournament not found:', tournamentId);
            return res.status(404).json({message: 'Tournament not found'});
        }

        console.log('Tournament status:', tournament.status);
        if (tournament.status !== 'in-progress') {
            return res.status(400).json({message: 'Tournament is not in progress.'});
        }

        // Update the winner for the specified match
        if (!tournament.bracket[roundIndex] || !tournament.bracket[roundIndex][matchIndex]) {
            console.log('Invalid round or match index:', {
                roundIndex,
                matchIndex,
                bracketLength: tournament.bracket.length
            });
            return res.status(400).json({message: 'Invalid round or match index.'});
        }

        // Get the current match
        const currentMatch = tournament.bracket[roundIndex][matchIndex];
        console.log('Current match data:', JSON.stringify(currentMatch, null, 2));

        // Helper function to safely convert any ID to string
        const safeToString = (id) => {
            if (!id) return null;
            try {
                // Handle different possible formats of the ID
                if (typeof id === 'string') return id;
                if (id._id) return id._id.toString();
                if (id.toString) return id.toString();
                return String(id);
            } catch (err) {
                console.error('Error converting ID to string:', err);
                return null;
            }
        };

        // Verify the winner is one of the players in the match
        const player1Id = safeToString(currentMatch.player1);
        const player2Id = safeToString(currentMatch.player2);
        const winnerIdStr = safeToString(winnerId);

        console.log('Player IDs for comparison:', {player1Id, player2Id, winnerId: winnerIdStr});

        if (winnerIdStr !== player1Id && winnerIdStr !== player2Id) {
            console.log('Winner ID mismatch:', {winnerId: winnerIdStr, player1Id, player2Id});
            return res.status(400).json({
                message: 'Selected winner is not a player in this match.',
                winnerId: winnerIdStr,
                player1Id,
                player2Id
            });
        }
        // Determine the loser 🆕
        const loserId = winnerIdStr === player1Id ? player2Id : player1Id;

        // 🆕 Update match history for both players
        const winner = await User.findById(winnerIdStr);
        if (winner) {
            winner.wins += 1;
            winner.matchHistory.push({   // 🆕 Added match logging
                opponent: loserId,
                tournament: tournamentId,
                result: 'win',
                score: `${score1} - ${score2}`,
                date: new Date()
            });
            await winner.save();
            console.log(`✅ Updated match history for winner: ${winner.username}`);
        }

        const loser = await User.findById(loserId);
        if (loser) {
            loser.losses += 1;
            loser.matchHistory.push({   // 🆕 Added match logging
                opponent: winnerIdStr,
                tournament: tournamentId,
                result: 'loss',
                score: `${score1} - ${score2}`,
                date: new Date()
            });
            await loser.save();
            console.log(`✅ Updated match history for loser: ${loser.username}`);
        }

        // Always set the winner for the current match
        tournament.bracket[roundIndex][matchIndex].winner = new mongoose.Types.ObjectId(winnerId);
        console.log(`Setting winner for match [${roundIndex}][${matchIndex}] to:`, winnerId);

        // Check if this is the final match
        const isFinalMatch = roundIndex === tournament.bracket.length - 1 && matchIndex === 0;
        console.log(`Is this the final match? ${isFinalMatch}`);

        // Advance the winner to the next round if not the final round
        if (!isFinalMatch && roundIndex < tournament.bracket.length - 1) {
            const nextRoundIndex = roundIndex + 1;
            const nextMatchIndex = Math.floor(matchIndex / 2);

            // Determine if this player should be placed as player1 or player2 in the next match
            const isPlayer1 = matchIndex % 2 === 0;

            // Place the winner in the appropriate position in the next round
            if (isPlayer1) {
                // Make sure we're setting the ID, not the object
                tournament.bracket[nextRoundIndex][nextMatchIndex].player1 = new mongoose.Types.ObjectId(winnerId);
                console.log(`Advancing winner to next round as player1 [${nextRoundIndex}][${nextMatchIndex}]`);
            } else {
                // Make sure we're setting the ID, not the object
                tournament.bracket[nextRoundIndex][nextMatchIndex].player2 = new mongoose.Types.ObjectId(winnerId);
                console.log(`Advancing winner to next round as player2 [${nextRoundIndex}][${nextMatchIndex}]`);
            }
        }

        // Check if all matches in the final round have winners
        let tournamentCompleted = false;
        if (roundIndex === tournament.bracket.length - 1) {
            // This is the final round - check if all matches have winners
            tournamentCompleted = true;
            console.log('Final round match updated, checking if tournament is completed');
        } else {
            // Check if this was the last match needed to complete the tournament
            const finalRound = tournament.bracket[tournament.bracket.length - 1];
            tournamentCompleted = finalRound.every(match => match.winner);
            console.log(`Checking final round matches. Tournament completed: ${tournamentCompleted}`);
        }

        // If tournament is completed, update status and player stats
        if (tournamentCompleted) {
            tournament.status = 'completed';
            console.log('Tournament is now completed');

            // Get the final match winner
            const finalRound = tournament.bracket[tournament.bracket.length - 1];
            const finalMatch = finalRound[0];
            const finalWinnerId = finalMatch.winner ? finalMatch.winner.toString() : null;

            if (finalWinnerId) {
                // Update the winner's stats
                const winner = await User.findById(finalWinnerId);
                if (winner) {
                    winner.wins = (winner.wins || 0) + 1;
                    await winner.save();
                    console.log(`Updated winner stats for ${winner.username}, wins: ${winner.wins}`);
                }

                // Find the loser of the final match
                const finalPlayer1Id = safeToString(finalMatch.player1);
                const finalPlayer2Id = safeToString(finalMatch.player2);
                const finalLoserId = finalWinnerId === finalPlayer1Id ? finalPlayer2Id : finalPlayer1Id;

                if (finalLoserId) {
                    const loser = await User.findById(finalLoserId);
                    if (loser) {
                        loser.losses = (loser.losses || 0) + 1;
                        await loser.save();
                        console.log(`Updated loser stats for ${loser.username}, losses: ${loser.losses}`);
                    }
                }
            }
        }

        // Use markModified to ensure Mongoose knows the bracket has been updated
        tournament.markModified('bracket');

        // Save the tournament with updated bracket
        await tournament.save();
        console.log('Tournament saved with updated bracket');

        // Verify the save was successful by re-fetching the tournament
        const verifyTournament = await Tournament.findById(tournamentId);
        console.log(`Verification - Winner for match [${roundIndex}][${matchIndex}]:`,
            verifyTournament.bracket[roundIndex][matchIndex].winner);

        // Fetch all user IDs from the bracket to populate the response
        const userIds = new Set();
        tournament.bracket.forEach(round => {
            round.forEach(match => {
                if (match.player1) userIds.add(match.player1.toString());
                if (match.player2) userIds.add(match.player2.toString());
                if (match.winner) userIds.add(match.winner.toString());
            });
        });

        // Fetch all users in one query
        const users = await User.find({_id: {$in: Array.from(userIds)}});
        const usersMap = {};
        users.forEach(user => {
            usersMap[user._id.toString()] = user;
        });

        // Populate the bracket with user data for the response
        const populatedBracket = [];
        tournament.bracket.forEach((round, roundIdx) => {
            const populatedRound = round.map((match, matchIdx) => {
                const populatedMatch = {...match.toObject ? match.toObject() : match};

                // Ensure player1 is properly populated
                if (match.player1) {
                    const player1Id = match.player1.toString();
                    if (usersMap[player1Id]) {
                        populatedMatch.player1 = usersMap[player1Id];
                    }
                }

                // Ensure player2 is properly populated
                if (match.player2) {
                    const player2Id = match.player2.toString();
                    if (usersMap[player2Id]) {
                        populatedMatch.player2 = usersMap[player2Id];
                    }
                }

                // Ensure winner ID is preserved
                if (match.winner) {
                    populatedMatch.winner = match.winner.toString();
                }

                return populatedMatch;
            });

            populatedBracket.push(populatedRound);
        });

        res.status(200).json({
            message: 'Match updated successfully!',
            bracket: populatedBracket,
            status: tournament.status
        });
    } catch (error) {
        console.error('Error updating match:', error);
        // Provide more detailed error information
        const errorDetails = {
            message: 'Error updating match',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        };
        res.status(500).json(errorDetails);
    }
});
// Create a separate router for API endpoints
const apiRouter = express.Router();

// API Routes
apiRouter.get('/players', async (req, res) => {
    try {
        const players = await User.find({}, 'username wins losses profilePicture');
        res.json(players);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching players' });
    }
});

apiRouter.get('/past-tournaments', async (req, res) => {
    try {
        const tournaments = await Tournament.find({ status: 'completed' })
            .populate('players')
            .populate('officials');
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching past tournaments' });
    }
});

// Mount the API router
app.use('/api', apiRouter);


app.get('*', (req, res) => {
    // Don't handle /api routes here
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ message: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

sendEmail(tournament_created, "Fuck You", ["emresunar1201@gmail.com"]);

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});