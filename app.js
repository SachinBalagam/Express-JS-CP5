const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Started at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

// API 1 Get List of Movies

app.get("/movies/", async (request, response) => {
  const getMoviesListQuery = `
    SELECT movie_name FROM movie ORDER BY movie_id;`;
  const movieList = await db.all(getMoviesListQuery);
  response.send(
    movieList.map((eachPlayer) =>
      convertMovieDbObjectToResponseObject(eachPlayer)
    )
  );
});

// API 2 POST a movie in movie table

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO
        movie (director_id, movie_name, lead_actor)
    VALUES ( ${directorId}, '${movieName}', '${leadActor}' )`;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3 Get movie based on movieId

app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT
        *
    FROM
        movie
    WHERE
        movie_id = '${movieId}';`;
  const movie = await db.get(getMovieQuery);
  response.send(convertMovieDbObjectToResponseObject(movie));
});

// API 4 update the movie Details

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
    UPDATE
        movie 
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}', 
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//API 5 Delete movie details based on movie ID

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteBookQuery = `
    DELETE FROM 
        movie 
    WHERE 
        movie_id = ${movie_id};`;
  await db.run(deleteBookQuery);
  response.send("Movie Removed");
});

// API 6 Get all directors

app.get("/directors/", async (request, response) => {
  const getAllDirectors = `
    SELECT * FROM director;`;
  const directorsList = await db.all(getAllDirectors);
  response.send(
    directorsList.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

// API 7 Get a movie of specific Director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT movie_name FROM movie WHERE director_id = '${directorId}';`;
  const moviesArray = await db.get(getDirectorMoviesQuery);
  moviesArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }));
});

module.exports = app;
