const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const PORT = process.env.PORT || 3001;

const db = require("./models");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/workout", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.get("/exercise", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/exercise.html"));
});

app.get("/stats", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/stats.html"));
});

app.get('/api/workouts', async (req, res) => {
  try{
      
      const workoutData = await db.Workout.aggregate([
          {$addFields: {
              totalDuration: {$sum: '$exercises.duration'}
          }}
      ]);
      res.json(workoutData);

  }
  catch (error) {
      res.json(error)
  }
});

app.post('/api/workouts', async ({ body }, res) => {
  try {
      const workout = await db.Workout.create(body);
      res.json(workout);
  } catch (error) {
      res.json(error)
  }
});

app.put('/api/workouts/:id', async ({ body, params }, res) => {
  try {
      const workoutData = await db.Workout.updateOne({
          _id: params.id,
      },
      {
          $inc: { totalDuration: body.duration },
          $push: { exercises: body }
      },
      { new: true });
      res.json(workoutData);
  }
  catch (error) {
      res.json(error)
  }
});

app.get('/api/workouts/range', async (req, res) => {
  try {
    const workouts = await db.Workout.aggregate([
      {
        $addFields: {
          totalDuration: { $sum: '$exercises.duration' }
        }
      }
    ]).sort({day: -1}).limit(7).sort({day: 1});
     res.json(workouts) 
  } catch (error) {
      res.json(error)
  }
});

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});
