**[Link to CueSportsPro](https://cuesportspro.glitch.me/)**   
**[Link to Video](https://youtu.be/M91rP8Emqtc)**

Made by the Dijkstra's Disciples - Chris Smith, Daniel Zhang, Devin Mihaichuk, and Emre Sunar

---
**Description**
-

   CueSportsPro is a sophisticated tournament management system with role-based access control for players and 
tournament officials. The platform enables tournament officials to create customizable tournaments 
with different rule sets (8-Ball, 9-Ball, or 10-Ball), scoring configurations, and skill-level brackets. Players 
can register for upcoming tournaments, view past tournaments, view ongoing bracket, and track their performance history. When 
tournaments are in session, the system provides real-time bracket visualization with automatic progression 
as officials record match results, creating an engaging and transparent tournament experience for all participants
and spectators.

   Beyond tournament management, CueSportsPro delivers comprehensive player profiles with detailed match histories, 
win/loss statistics, and performance analytics across different rule sets. The platform maintains an archive of past 
tournaments with complete results and winner information for historical reference. Users can customize notification 
preferences to stay informed about tournament registrations, and upcoming matches. The elegant user interface, 
featuring subtle animations, textured backgrounds, and carefully crafted typography, ensures an intuitive and visually 
appealing experience across all devices.

**Additional instructions for CueSportsPro**
-
1. To login, click the sign-in button in the upper right corner and then click on Sign In With Google when redirected
2. Make sure you have a Google account when testing player and tournament official functionality or you cannot login
3. Only tournament-officials have access to functions like creating tournaments which is not given by default. We can elevate your account to tournament official status for your testing if you ask prior.
4. Only tournament-officials that are officiating a given tournament are able to enter results for that given tournament so make sure that you are set to officiate a tournament if you want to set scores.

**Technology Stack**
-
- Glitch - We deployed to Glitch to make it readily accessible to anyone with the url
- Tailwind CSS - We used Tailwind CSS to streamline the appearance of our application making it look more professional
- MongoDB (Mongoose) - We used MongoDB to store complex datastructures like the user and tournament information allowing for access control based on the user's role
- Google OAuth - We used Google authentication as we deemed most people would have a Google account and it allowed for access control on our application
- Jira - We used Jira to manage our sprint and organize our team throughout the development of this application
- GitHub - We used GitHub to manage version control throughout development and manage merge conflicts
- Nodemailer - We used Nodemailer to send notifications to users when tournaments are created and started
- Concurrently - We used concurrently to run the frontend and backend simultaneously
- React-dom-router - we used routes to easy navigate between tabs with minimal load times

**Challenges**
-
- Deployment: Deploying on Glitch was a long and painful process
- Email Notifications: Email notification system to message people when tournaments are created or started
- Bracket Creation: Dynamic Bracket Generation for any amount of players between 4 and 32.
- Authentication: Setting up Google OAuth to allow for verification through Google
- Access Control: Allowing viewers, players, tournament officials, and tournament officials officiating a given tournament to have different levels of access
- Charts & Player Statistics: Displaying compehensive charts and graphs that model players success over all the tournaments they participate in

**Contributions**
-
**Christopher Smith:**
- Notification feature using Nodemailer and SMTP
  - Emailing for when a tournament is created
  - Emailing for when a tournament is started
- Tournament Creation
  - Updating Schema
  - Adding additional fields
- Implement Reject Player Feature
  - Removing a player from a Tournament as a TO
- Bug Fixes

**Devin Mihaichuk:**
- Jira Management
  - Scrum Master
  - Sprint Management
- Updated ongoing tournament management
  - Added a bye system
  - Added a scoring system
- Registration for upcoming tournaments
  - Tournament Officials being able to register or officiate (but not both)
  - Players able to Register
  - Viewers only able to view participants
- Managing player and tournament official access
  - Registration and officiation (including barring tournament officials from participating in tournaments they are officiating)
- Updated meta data
- QA Testing
- Bug Fixes

**Emre Sunar:**
- Drafted First Iteration of Website 
  - Created Logo, as well as header, footer, and nav bar
  - Added a parallax image to the front home page under the tournaments for visual effect
  - Created styling for entire website with texture overlay and color palette, with custom animations
- Tournament Bracket
  - Created dynamically generating schema with series of arrays which define rounds in a tournament
  - Created styling
  - Bracket generation
  - Limiting access to bracket management
  - Implemented a select winner function to update match scores in real time
- Tournament Creation
  - Updating the database
  - Schema
- Created MongoDB Server
  - Implemented code for communications
- Past Tournaments Feature
  - Track history of Completed Tournaments
- Registered Players Feature
  - Track players who have participating in past and ongoing tournaments
- 404 Page Minigame (Cue Ball Chase)
- Bracket Access Control for Different Types of Users
- Created draft of README
- Deployed onto Glitch
  - Handled bugs with node.js and vite build
  - Fixed nodemailer bug with emails for tournament creation and starting
- Bug Fixes

**Daniel Zhang:**
- Authentication through Google
  - Automatically registering new people into the database as players
  - Creating method to retrieve user information
- Profile
  - Customization of username, bio, country, and profile picture
  - Player statistics
    - Diagrams and tables
    - Including a filter feature
  - Updating and Displaying player match history
- Settings
  - Allowing users to enable/disable emails
- Limiting access to routes like tournament creation for non-tournament officials
- **Bug Fixes**
  - Created Dev Tool for debugging and testing (now deleted)
