const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator')
const Models = require('./models.js');  
const Movies = Models.Movie;
const Users = Models.User;
const Genres = Models.Genre;
const Directors = Models.Director;
const jwt = require('jsonwebtoken');
const jwtSecret = 'your_jwt_secret';
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(morgan('common'));
app.use(cors());

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com', 'http://localhost:1234'];

app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) { // If a specific origin isn’t found on the list of allowed origins
        let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    }
  }));

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

// mongoose.connect('mongodb://localhost:27017/cfDB', {useNewUrlParser: true, useUnifiedTopology: true});

mongoose.connect( process.env.CONNECTION_URI, {useNewUrlParser: true, useUnifiedTopology: true});

//User Info
//Add User
/* Expect JSON in this Format
{
    ID: Integer
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date
}*/
app.post('/users',
  // Validation logic here for request
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means
  //minimum value of 5 characters are only allowed
  [
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], async (req, res) => {

  // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + 'already exists');
        } else {
            Users
            .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
            })
            .then((user) =>{res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
    });
});

//Read All Users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.find()
    .then((users) => {
        res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Read A User by Username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOne({ Username: req.params.Username })
    .then((user) => {
        res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Update User Info by Username
/* Expect JSON in this format
{
    Username: String,
    (required)
    Password: String,
    (required)
    Email: String,
    (required)
    Birthday: Date
}*/
app.put('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    //CONDITION TO CHECK ADDED HERE
    if(req.user.Username !== req.params.Username){
        return res.status(400).send('Permission denied');
    }
    //CONDITION ENDS
    await Users.findOneAndUpdate({ Username: req.params.Username }, { $set:
    {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
    }
  },
  { new:true }) // This line makes sure that the updated document is returned
  .then((updatedUser) => {
    const token = jwt.sign({ Username: updatedUser.Username }, jwtSecret, {
        subject: updatedUser.Username,
        expiresIn: '7d',
        algorithm: 'HS256'
    });

    // Return the updated user and the new token
    res.json({ user: updatedUser, token: token });
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  })
});

//Add a Movie to User's Favorites
app.post('/users/:Username/:movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $push: { Favorites: req.params.MovieID }
    },
    { new: true}) //This line makes sure that the updated document is returned
    .then((updatedUser) => { 
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Delete a Favorite for User
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username }, {
        $pull: { Favorites: req.params.MovieID } 
    },
    { new: true}) //This line amkes sure that the updated document is returned
    .then((updatedUser) => {
        res.json(updatedUser);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Delete User by Username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
        if (!user) {
            res.status(400).send(req.params.Username + ' was not found');
        } else {
            res.status(200).send(req.params.Username + ' was deleted.');
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.use(express.static('public'));

//Read index page
app.get('/', (req, res) => {
    res.send('Welcome to my Movie API!');
});

//Info on Movies
//Read All Movies
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.find()
    .populate('Director', 'Name Bio')
    .populate('Genre', 'Name Description')
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Read a Movie by ID
app.get('/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findById(req.params.MovieID)
    .populate('Director', 'Name Bio')
    .populate('Genre', 'Name Description')
    .then((movie) => {
        if (!movie) {
            return res.status(404).send('Movie not found');
        }
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Read A Movie by Title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Movies.findOne({ Title: req.params.Title })
    .populate('Director', 'Name Bio')
    .populate('Genre', 'Name Description')
    .then((movie) => {
        res.json(movie);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Read Movies by Genre Name
app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const genre = await Genres.findOne({ Name: req.params.Name });
        if (!genre) {
            return res.status(404).send('Genre not found');
        }
        const movies = await Movies.find({ Genre: genre._id })
            .populate('Director', 'Name Bio')
            .populate('Genre', 'Name Description');
        res.status(200).json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

// Read Movies by Director Name
app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const director = await Directors.findOne({ Name: req.params.Name });
        if (!director) {
            return res.status(404).send('Director not found');
        }
        const movies = await Movies.find({ Director: director._id })
            .populate('Director', 'Name Bio')
            .populate('Genre', 'Name Description');
        res.status(200).json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
    }
});

//Info on Genres
//Read All Genres
app.get('/genres', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Genres.find()
    .then((genres) => {
        res.status(201).json(genres);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Read A Genre by Name
app.get('/genres/:Name', async (req, res) => {
    await Genres.findOne({ Name: req.params.Name })
    .then((genre) => {
        res.json(genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

//Info on Directors
//Read All Directors
app.get('/directors', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Directors.find()
    .then((directors) => {
        res.status(201).json(directors);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

// Read A Director by Name
app.get('/directors/:Name', passport.authenticate('jwt', { session: false }), async (req, res) => {
    await Directors.findOne({ Name: req.params.Name })
    .then((director) => {
        res.json(director);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});

app.get('/secreturl', (req, res) => {
    res.send('This is a secret url with super top-secret content.');
});

//Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

//Listen for Request
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
