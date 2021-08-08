const router = require("express").Router();

const Workout = require("../models/workout");

router.post("/api/workouts", async ({ body }, res) => {
  try {
    const workout = await Workout.create(body);
    res.json(workout);
  } catch (error) {
    res.json(error);
  }
});

router.put("/api/workouts/:id", async ({ body, params }, res) => {
  try {
    const workoutData = await Workout.updateOne(
      {
        _id: params.id,
      },
      {
        $push: { exercises: body },
      },
      { new: true }
    );
    res.json(workoutData);
  } catch (error) {
    res.json(error);
  }
});

router.get("/api/workouts", async (req, res) => {
  try {
    const workoutData = await Workout.aggregate([
      {
        $addFields: {
          totalDuration: { $sum: "$exercises.duration" },
        },
      },
    ]);
    res.json(workoutData);
  } catch (error) {
    res.json(error);
  }
});

router.get("/api/workouts/range", async (req, res) => {
  try {
    const workouts = await Workout.aggregate([
      {
        $addFields: {
          totalDuration: { $sum: "$exercises.duration" },
        },
      },
    ])
      .sort({ day: -1 })
      .limit(7)
      .sort({ day: 1 });
    res.json(workouts);
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
