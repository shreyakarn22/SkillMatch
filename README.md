SkillMatch
SkillMatch is a simple full-stack web application built using HTML, CSS, JavaScript, Node.js, and Express.js.
Users input their skills, and the app matches them with suitable job roles. It also provides the option to download results as a PDF.

Features
Skill-to-job-role matching logic

Dynamic content rendering using vanilla JavaScript

PDF generation using jsPDF

Minimalistic and responsive UI

Fake database using db.json

Backend API using Express.js

Tech Stack
Frontend:
HTML5

CSS3 (Flexbox + Variables)

JavaScript (ES6+)

Font Awesome 6.4.0

jsPDF 2.5.1

Backend:
Node.js

Express.js

CORS

File System (fs)

Project Structure

<pre lang="no-highlight"><code> 📁 skillmatch/ ├── public/ │ ├── index.html │ ├── style.css │ └── script.js ├── db.json ├── package.json ├── server.js </code></pre>
Setup Instructions
<pre><code>```bash git clone https://github.com/your-username/skillmatch.git cd skillmatch npm install npm start ```</code></pre>

The server will start at: http://localhost:3000

