const fs = require('fs');
const path = require('path');

function replaceInFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf8');
  let newContent = content
    .replace(/'http:\/\/localhost:5000/g, "(import.meta.env.VITE_API_URL || 'http://localhost:5000') + '")
    .replace(/`http:\/\/localhost:5000/g, "`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}");
    
  if (content !== newContent) {
    fs.writeFileSync(filepath, newContent);
    console.log('Updated ' + filepath);
  }
}

const files = [
  'frontend/src/services/movieService.js',
  'frontend/src/pages/Ticket.jsx',
  'frontend/src/pages/Summary.jsx',
  'frontend/src/pages/SeatBooking.jsx',
  'frontend/src/pages/MovieDetails.jsx',
  'frontend/src/pages/Home.jsx',
  'frontend/src/context/SocketContext.jsx'
];

files.forEach(f => replaceInFile(path.join(__dirname, f)));
