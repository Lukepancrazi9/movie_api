const express = require('express'),
morgan = require('morgan');
const app = express();
 
app.use(morgan('common'));

let topTenMovies = [
    {
        title: 'Saving Private Ryan',
        director: 'Steven Spielberg'
    },
    {
        title: 'Star Wars: Revenge of the Sith',
        director: 'George Lucas'
    },
    {
        title: 'Ex Machina',
        director: 'Alex Garland'
    },
    {
        title: 'The Dark Knight',
        director: 'Christopher Nolan'
    },
    {
        title: 'Lord of the Rings: The Two Towers',
        director: 'Peter Jackson'
    },
    {
        title: 'The Usual Suspects',
        director: 'Bryan Singer'
    },
    {
        title: 'Prisoners',
        director: 'Denis Villeneuve'
    },
    {
        title: 'Memories of Murder',
        director: 'Bong Joon-ho'
    },
    {
        title: 'Se7en',
        director: 'David Fincher'
    },
    {
        title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
        director: 'Gore Verbinski'
    },
];

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to my Movie API!');
});

app.get('/movies', (req, res) => {
    res.json(topTenMovies);
});
  
app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
  
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
