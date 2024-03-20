const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
const app = express();
 
app.use(morgan('common'));

app.use(bodyParser.json());

let users = [
    {
        id: 1,
        name: 'Scooby',
        topMovies: []
    },
    {
        id: 2,
        name: 'Shaggy',
        topMovies: ['The Dark Knight']
    }
]

let topTenMovies = [
    {
        title: 'Saving Private Ryan',
        year: '1998',
        genre: {
            genreType: 'War',
            genreDescription: 'War is a film genre concerned with warfare, typically about naval, air, or land battles, with combat scenes central to the drama.'
        },
        director: {
            directorName:'Steven Spielberg',
            directorBirth: 'December 18, 1946'
        }
    },
    {
        title: 'Star Wars: Revenge of the Sith',
        year: '2005',
        genre: {
            genreType: 'Sci-fi',
            genreDescription: 'Science fiction is a genre of speculative fiction, which typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life.'
        },
        director: {
            directorName: 'George Lucas',
            directorBirth: 'May 14, 1944'
        }
    },
    {
        title: 'Ex Machina',
        year: '2015',
        genre: {
            genreType: 'Thriller',
            genreDescription: 'Thrillers are characterized and defined by the moods they elicit, giving their audiences heightened feelings of suspense, excitement, surprise, anticipation and anxiety.'
        },
        director: {
            directorName: 'Alex Garland',
            directorBirth: 'May 26, 1970'
        }
    },
    {
        title: 'The Dark Knight',
        year: '2008',
        genre: {
            genreType: 'Action',
            genreDescription: 'Action is a genre that focuses on stories that involve high-stakes, high-energy, and fast-paced events.'
        },
        director: {
            directorName: 'Christopher Nolan',
            directorBirth: 'July 30, 1970'
        }
    },
    {
        title: 'Lord of the Rings: The Two Towers',
        year: '2002',
        genre: {
            genreType: 'Adventure',
            genreDescription: 'Adventure is a genre of fiction in which an adventure, an exciting undertaking involving risk and physical danger, forms the main storyline.'
        },
        director: {
            directorName: 'Peter Jackson',
            directorBirth: 'October 31, 1961'
        }
    },
    {
        title: 'The Usual Suspects',
        year: '1995',
        genre: {
            genreType: 'Crime',
            genreDescription: 'Crime is a genre that centre on criminal acts and especially on the investigation, either by an amateur or a professional detective, of a crime, often a murder.'
        },
        director: {
            directorName: 'Bryan Singer',
            directorBirth: 'September 17, 1965'
        }
    },
    {
        title: 'Prisoners',
        year: '2013',
        genre: {
            genreType: 'Thriller',
            genreDescription: 'Thrillers are characterized and defined by the moods they elicit, giving their audiences heightened feelings of suspense, excitement, surprise, anticipation and anxiety.'
        },
        director: {
            directorName: 'Denis Villeneuve',
            directorBirth: 'October 3, 1967'
        }
    },
    {
        title: 'Memories of Murder',
        year: '2003',
        genre: {
            genreType: 'Crime',
            genreDescription: 'Crime is a genre that centre on criminal acts and especially on the investigation, either by an amateur or a professional detective, of a crime, often a murder.'
        },
        director: {
            directorName: 'Bong Joon-ho',
            directorBirth: 'September 14, 1969'
        }
    },
    {
        title: 'Se7en',
        year: '1995',
        genre: {
            genreType: 'Mystery',
            genreDescription: 'Mystery is a fiction genre where the nature of an event, usually a murder or other crime, remains mysterious until the end of the story.'
        },
        director: {
            directorName: 'David Fincher',
            directorBirth: 'August 28, 1962'
        }
    },
    {
        title: 'Pirates of the Caribbean: The Curse of the Black Pearl',
        year: '2003',
        genre: {
            genreType: 'Adventure',
            genreDescription: 'Adventure is a genre of fiction in which an adventure, an exciting undertaking involving risk and physical danger, forms the main storyline.'
        },
        director: {
            directorName: 'Gore Verbinski',
            directorBirth: 'March 16, 1964'
        }
    },
];

//Create User
app.post('/users', (req, res) => {
    const newUser = req.body;

    if (newUser.name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('Users need names.')
    }
})

//Update User
app.put('/users/:id', (req, res) => {
    const id = req.params.id;
    const updatedUser = req.body;
    let user = users.find( user => user.id == id);

    if (user) {
        user.name = updatedUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send('No User Found.')
    }
})

//Create Top Movies for User
app.post('/users/:id/:movieTitle', (req, res) => {
    const id = req.params.id;
    const movieTitle = req.params.movieTitle;
    let user = users.find( user => user.id == id);

    if (user) {
        user.topMovies.push(movieTitle);
        res.status(200).send(`${movieTitle} has been added to user ${id}'s array`);
    } else {
        res.status(400).send('No User Found')
    }
})

//Delete Top Movie for User
app.delete('/users/:id/:movieTitle', (req, res) => {
    const id = req.params.id;
    const movieTitle = req.params.movieTitle;
    let user = users.find( user => user.id == id);

    if (user) {
        user.topMovies = user.topMovies.filter( title => title !== movieTitle);
        res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`); 
    } else {
        res.status(400).send('No User Found')
    }
})

//Delete User 
app.delete('/users/:id', (req, res) => {
    const id = req.params.id;
    let user = users.find( user => user.id == id);


    if (user) {
        users = users.filter( user => user.id != id);
        res.status(200).send(` User ${id} has been deleted`); 
    } else {
        res.status(400).send('No User Found')
    }
})

app.use(express.static('public'));

//Read index page
app.get('/', (req, res) => {
    res.send('Welcome to my Movie API!');
});

//Read movie list 
app.get('/movies', (req, res) => {
    res.status(200).json(topTenMovies);
});

//Read movie by title
app.get('/movies/:title', (req, res) => {
    const title = req.params.title;
    const movie = topTenMovies.find( movie => movie.title === title);

    if (movie) { 
        res.status(200).json(movie);
    } else {
        res.staus(400).send('No Movie Found')
    }
})

//Read Movie by Genre 
app.get('/movies/genre/:genreType', (req, res) => {
    const genreType = req.params.genreType;
    const genre = topTenMovies.find( movie => movie.genre.genreType === genreType).genre;

    if (genre) {
        res.status(200).json(genre);
    } else {
        res.status(400).send('No Genre Found')
    }
})

//Read Movie by Director
app.get('/movies/directors/:directorName', (req, res) => {
    const directorName = req.params.directorName;
    const director = topTenMovies.find( movie => movie.director.directorName === directorName).director;

    if (director) {
        res.status(200).json(director);
    } else {
        res.status(400).send('No Director Found')
    }
})

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

//Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//Listen for Request
app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
