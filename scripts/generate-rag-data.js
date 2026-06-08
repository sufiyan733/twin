const fs = require('fs');
const path = require('path');

const workoutData = {
  exercises: {
    "bench press": {
      name: "Bench Press", category: "strength", muscle_groups: { primary: ["chest"], secondary: ["triceps", "shoulders"] },
      equipment: "barbell", difficulty: "intermediate",
      instructions: "Lie on bench. Grip bar slightly wider than shoulder width. Lower bar to mid-chest. Press bar up until arms are fully extended.",
      common_mistakes: ["Bouncing bar off chest", "Flaring elbows", "Not retracting scapula"],
      tips: ["Keep feet planted", "Squeeze glutes", "Create a slight arch in lower back"],
      variations: ["Dumbbell bench press", "Close grip bench press", "Floor press"],
      lingo: ["bench", "chest press"], calories_per_minute_approx: 5
    },
    "squat": {
      name: "Squat", category: "strength", muscle_groups: { primary: ["quads", "glutes"], secondary: ["hamstrings", "core"] },
      equipment: "barbell", difficulty: "advanced",
      instructions: "Rest bar on upper back. Stand with feet shoulder-width apart. Bend knees and push hips back until thighs are parallel to ground. Drive through heels to stand up.",
      common_mistakes: ["Knees caving in", "Heels lifting off ground", "Rounding lower back"],
      tips: ["Keep chest up", "Brace core", "Look straight ahead"],
      variations: ["Front squat", "Goblet squat", "Box squat"],
      lingo: ["squats", "back squat", "baithak"], calories_per_minute_approx: 7
    },
    "deadlift": {
      name: "Deadlift", category: "strength", muscle_groups: { primary: ["hamstrings", "glutes", "lower back"], secondary: ["lats", "traps", "forearms"] },
      equipment: "barbell", difficulty: "advanced",
      instructions: "Stand with feet hip-width apart. Hinge at hips and grip bar just outside knees. Keep back straight and pull bar up along your legs until standing tall.",
      common_mistakes: ["Rounding lower back", "Hips rising too fast", "Bar drifting away from body"],
      tips: ["Engage lats", "Push floor away", "Keep neutral spine"],
      variations: ["Sumo deadlift", "Romanian deadlift", "Trap bar deadlift"],
      lingo: ["DL", "deads"], calories_per_minute_approx: 7
    },
    "overhead press": {
      name: "Overhead Press", category: "strength", muscle_groups: { primary: ["shoulders"], secondary: ["triceps", "core"] },
      equipment: "barbell", difficulty: "intermediate",
      instructions: "Stand with bar at upper chest. Press bar overhead until arms are fully locked. Lower back to chest under control.",
      common_mistakes: ["Excessive lower back arch", "Pressing bar forward", "Not using full range of motion"],
      tips: ["Squeeze glutes", "Brace core", "Tuck chin slightly during press"],
      variations: ["Seated dumbbell press", "Push press", "Arnold press"],
      lingo: ["OHP", "military press", "shoulder press"], calories_per_minute_approx: 5
    },
    "barbell row": {
      name: "Barbell Row", category: "strength", muscle_groups: { primary: ["back", "lats"], secondary: ["biceps", "rear delts"] },
      equipment: "barbell", difficulty: "intermediate",
      instructions: "Hinge at hips until torso is nearly parallel to floor. Grip bar slightly wider than shoulder width. Pull bar to lower chest/upper abdomen. Lower under control.",
      common_mistakes: ["Using momentum to jerk weight", "Standing up too upright", "Rounding lower back"],
      tips: ["Pull with elbows", "Squeeze shoulder blades together", "Keep core tight"],
      variations: ["Pendlay row", "T-bar row", "Dumbbell row"],
      lingo: ["bent over row", "rows"], calories_per_minute_approx: 5
    },
    "pull up": {
      name: "Pull Up", category: "strength", muscle_groups: { primary: ["lats", "back"], secondary: ["biceps", "forearms"] },
      equipment: "bodyweight", difficulty: "intermediate",
      instructions: "Grip pull-up bar with palms facing away, slightly wider than shoulder width. Pull body up until chin clears the bar. Lower under control.",
      common_mistakes: ["Using momentum (kipping)", "Not going all the way down", "Rounding shoulders forward"],
      tips: ["Lead with chest", "Drive elbows down", "Engage core"],
      variations: ["Weighted pull up", "Assisted pull up", "Neutral grip pull up"],
      lingo: ["pullups", "wide grip pullup"], calories_per_minute_approx: 6
    },
    "chin up": {
      name: "Chin Up", category: "strength", muscle_groups: { primary: ["lats", "biceps"], secondary: ["back", "forearms"] },
      equipment: "bodyweight", difficulty: "intermediate",
      instructions: "Grip bar with palms facing you, shoulder-width apart. Pull body up until chin clears the bar. Lower under control.",
      common_mistakes: ["Not fully extending arms at bottom", "Swinging"],
      tips: ["Squeeze biceps at top", "Keep chest up"],
      variations: ["Weighted chin up", "Assisted chin up"],
      lingo: ["chins", "underhand pullup"], calories_per_minute_approx: 6
    },
    "dip": {
      name: "Dip", category: "strength", muscle_groups: { primary: ["triceps", "chest"], secondary: ["shoulders"] },
      equipment: "bodyweight", difficulty: "intermediate",
      instructions: "Support body on parallel bars. Lower body by bending elbows until upper arms are parallel to floor. Press back up.",
      common_mistakes: ["Going too low and stressing shoulders", "Flaring elbows too much"],
      tips: ["Lean forward to target chest", "Stay upright to target triceps"],
      variations: ["Weighted dip", "Bench dip"],
      lingo: ["dips", "parallel bar dips"], calories_per_minute_approx: 5
    },
    "incline bench": {
      name: "Incline Bench Press", category: "strength", muscle_groups: { primary: ["upper chest"], secondary: ["shoulders", "triceps"] },
      equipment: "barbell", difficulty: "intermediate",
      instructions: "Lie on incline bench (30-45 degrees). Lower bar to upper chest. Press back up.",
      common_mistakes: ["Bouncing bar", "Arching back off bench"],
      tips: ["Keep elbows tucked slightly", "Plant feet firmly"],
      variations: ["Incline dumbbell press", "Smith machine incline press"],
      lingo: ["upper chest press", "incline press"], calories_per_minute_approx: 5
    },
    "romanian deadlift": {
      name: "Romanian Deadlift", category: "strength", muscle_groups: { primary: ["hamstrings", "glutes"], secondary: ["lower back"] },
      equipment: "barbell", difficulty: "intermediate",
      instructions: "Stand holding bar at hip level. Hinge hips back with slight knee bend until you feel stretch in hamstrings. Drive hips forward to return.",
      common_mistakes: ["Bending knees too much (turns into squat)", "Rounding lower back"],
      tips: ["Keep bar close to legs", "Focus on pushing hips back"],
      variations: ["Dumbbell RDL", "Single leg RDL"],
      lingo: ["RDL", "stiff leg deadlift"], calories_per_minute_approx: 6
    },
    "leg press": {
      name: "Leg Press", category: "strength", muscle_groups: { primary: ["quads", "glutes"], secondary: ["hamstrings", "calves"] },
      equipment: "machine", difficulty: "beginner",
      instructions: "Sit in machine. Place feet shoulder-width on platform. Lower weight until knees are at 90 degrees. Press back up without locking knees.",
      common_mistakes: ["Locking knees at top", "Lowering weight too far causing lower back to round"],
      tips: ["Drive through heels", "Keep lower back pressed into pad"],
      variations: ["Single leg press", "High stance leg press"],
      lingo: ["machine press"], calories_per_minute_approx: 5
    },
    "leg curl": {
      name: "Leg Curl", category: "strength", muscle_groups: { primary: ["hamstrings"], secondary: ["calves"] },
      equipment: "machine", difficulty: "beginner",
      instructions: "Lie face down on machine. Curl pad towards glutes by flexing knees. Lower under control.",
      common_mistakes: ["Hips lifting off pad", "Jerking the weight"],
      tips: ["Squeeze hamstrings at top", "Control the eccentric phase"],
      variations: ["Seated leg curl", "Lying leg curl"],
      lingo: ["hamstring curl"], calories_per_minute_approx: 3
    },
    "leg extension": {
      name: "Leg Extension", category: "strength", muscle_groups: { primary: ["quads"], secondary: [] },
      equipment: "machine", difficulty: "beginner",
      instructions: "Sit on machine. Extend legs fully to lift weight pad. Lower under control.",
      common_mistakes: ["Using momentum", "Not getting full extension"],
      tips: ["Hold for a second at top", "Keep toes pointed up"],
      variations: ["Single leg extension"],
      lingo: ["quad extension"], calories_per_minute_approx: 3
    },
    "calf raise": {
      name: "Calf Raise", category: "strength", muscle_groups: { primary: ["calves"], secondary: [] },
      equipment: "machine", difficulty: "beginner",
      instructions: "Stand with balls of feet on edge of step. Lower heels to stretch calves, then press up onto toes.",
      common_mistakes: ["Bouncing at the bottom", "Not going through full range of motion"],
      tips: ["Pause at top and bottom", "Control the descent"],
      variations: ["Seated calf raise", "Donkey calf raise"],
      lingo: ["calves"], calories_per_minute_approx: 2
    },
    "lateral raise": {
      name: "Lateral Raise", category: "strength", muscle_groups: { primary: ["shoulders", "lateral delts"], secondary: ["traps"] },
      equipment: "dumbbell", difficulty: "beginner",
      instructions: "Hold dumbbells at sides. Raise arms out to sides until parallel with floor. Lower under control.",
      common_mistakes: ["Using momentum", "Raising arms too high"],
      tips: ["Lead with elbows", "Keep a slight bend in elbows"],
      variations: ["Cable lateral raise", "Machine lateral raise"],
      lingo: ["side raises", "lat raises"], calories_per_minute_approx: 3
    },
    "bicep curl": {
      name: "Bicep Curl", category: "strength", muscle_groups: { primary: ["biceps"], secondary: ["forearms"] },
      equipment: "dumbbell", difficulty: "beginner",
      instructions: "Hold dumbbells with palms facing forward. Curl weights towards shoulders while keeping elbows stationary. Lower under control.",
      common_mistakes: ["Swinging body", "Letting elbows move forward"],
      tips: ["Squeeze biceps at top", "Pin elbows to sides"],
      variations: ["Barbell curl", "Cable curl", "Preacher curl"],
      lingo: ["curls", "dole"], calories_per_minute_approx: 3
    },
    "tricep pushdown": {
      name: "Tricep Pushdown", category: "strength", muscle_groups: { primary: ["triceps"], secondary: [] },
      equipment: "cable", difficulty: "beginner",
      instructions: "Grip cable attachment. Keep elbows pinned to sides. Push weight down until arms are fully extended.",
      common_mistakes: ["Letting elbows drift up", "Using bodyweight to push"],
      tips: ["Focus on squeezing triceps", "Control the return"],
      variations: ["Rope pushdown", "Straight bar pushdown"],
      lingo: ["pushdowns", "tri extension"], calories_per_minute_approx: 3
    },
    "face pull": {
      name: "Face Pull", category: "strength", muscle_groups: { primary: ["rear delts", "upper back"], secondary: ["traps", "rotator cuff"] },
      equipment: "cable", difficulty: "intermediate",
      instructions: "Set cable to upper chest height with rope attachment. Pull rope towards face, splitting the rope and flaring elbows out.",
      common_mistakes: ["Going too heavy", "Using lower back to pull"],
      tips: ["Focus on external rotation", "Squeeze shoulder blades together"],
      variations: ["Band face pull", "Seated face pull"],
      lingo: ["facepulls"], calories_per_minute_approx: 3
    },
    "plank": {
      name: "Plank", category: "strength", muscle_groups: { primary: ["core", "abs"], secondary: ["shoulders"] },
      equipment: "bodyweight", difficulty: "beginner",
      instructions: "Support body on forearms and toes. Keep body in a straight line from head to heels. Hold position.",
      common_mistakes: ["Hips sagging", "Hips raised too high"],
      tips: ["Squeeze glutes", "Brace core as if about to be punched"],
      variations: ["Side plank", "Weighted plank"],
      lingo: ["planks", "core hold"], calories_per_minute_approx: 4
    },
    "crunch": {
      name: "Crunch", category: "strength", muscle_groups: { primary: ["abs"], secondary: [] },
      equipment: "bodyweight", difficulty: "beginner",
      instructions: "Lie on back with knees bent. Curl shoulders off floor towards knees. Lower back down.",
      common_mistakes: ["Pulling on neck with hands", "Not contracting abs"],
      tips: ["Exhale on the way up", "Focus on squeezing abs"],
      variations: ["Bicycle crunch", "Decline crunch"],
      lingo: ["crunches", "sit ups"], calories_per_minute_approx: 3
    },
    "leg raise": {
      name: "Leg Raise", category: "strength", muscle_groups: { primary: ["lower abs"], secondary: ["hip flexors"] },
      equipment: "bodyweight", difficulty: "intermediate",
      instructions: "Lie on back or hang from bar. Raise straight legs until they form a 90-degree angle with torso. Lower slowly.",
      common_mistakes: ["Swinging legs", "Lower back lifting off floor"],
      tips: ["Keep lower back pressed into ground", "Perform slowly"],
      variations: ["Hanging leg raise", "Captain's chair leg raise"],
      lingo: ["leg raises", "lower abs"], calories_per_minute_approx: 4
    },
    "push up": {
      name: "Push Up", category: "strength", muscle_groups: { primary: ["chest", "triceps", "shoulders"], secondary: ["core"] },
      equipment: "bodyweight", difficulty: "beginner",
      instructions: "Start in plank position with hands slightly wider than shoulder-width. Lower body until chest nearly touches floor. Push back up.",
      common_mistakes: ["Flaring elbows too wide", "Hips sagging"],
      tips: ["Keep core tight", "Tuck elbows slightly"],
      variations: ["Incline push up", "Diamond push up", "Weighted push up"],
      lingo: ["pushups", "dand", "press ups"], calories_per_minute_approx: 5
    },
    "burpee": {
      name: "Burpee", category: "cardio", muscle_groups: { primary: ["full body"], secondary: ["cardiovascular system"] },
      equipment: "bodyweight", difficulty: "intermediate",
      instructions: "Drop into a squat, kick feet back to plank, do a push-up, jump feet back to squat, jump up explosively.",
      common_mistakes: ["Skipping the push-up", "Landing heavily"],
      tips: ["Pace yourself", "Maintain a rhythm"],
      variations: ["Half burpee", "Burpee over bar"],
      lingo: ["burpees"], calories_per_minute_approx: 10
    },
    "jumping jack": {
      name: "Jumping Jack", category: "cardio", muscle_groups: { primary: ["full body", "calves"], secondary: ["shoulders"] },
      equipment: "bodyweight", difficulty: "beginner",
      instructions: "Jump up while spreading legs wide and bringing arms overhead. Jump back to starting position.",
      common_mistakes: ["Not bringing arms all the way up"],
      tips: ["Stay light on toes"],
      variations: ["Seal jacks", "Star jumps"],
      lingo: ["jacks"], calories_per_minute_approx: 8
    },
    "mountain climber": {
      name: "Mountain Climber", category: "cardio", muscle_groups: { primary: ["core", "shoulders"], secondary: ["hip flexors", "cardiovascular system"] },
      equipment: "bodyweight", difficulty: "beginner",
      instructions: "Start in plank position. Drive one knee toward chest, then quickly switch legs in a running motion.",
      common_mistakes: ["Bouncing hips up and down", "Not driving knees far enough"],
      tips: ["Keep weight over shoulders", "Keep core engaged"],
      variations: ["Cross-body mountain climber", "Slow mountain climber"],
      lingo: ["climbers"], calories_per_minute_approx: 8
    },
    "running": {
      name: "Running", category: "cardio", muscle_groups: { primary: ["quads", "hamstrings", "calves"], secondary: ["glutes", "cardiovascular system"] },
      equipment: "none", difficulty: "beginner",
      instructions: "Run at a steady pace.",
      common_mistakes: ["Overstriding", "Heel striking aggressively"],
      tips: ["Maintain upright posture", "Land mid-foot"],
      variations: ["Sprint intervals", "Trail running", "Treadmill running"],
      lingo: ["jogging", "cardio", "sprinting"], calories_per_minute_approx: 11
    },
    "cycling": {
      name: "Cycling", category: "cardio", muscle_groups: { primary: ["quads", "hamstrings"], secondary: ["calves", "cardiovascular system"] },
      equipment: "machine", difficulty: "beginner",
      instructions: "Pedal on a stationary bike or bicycle.",
      common_mistakes: ["Seat too low or high"],
      tips: ["Maintain a cadence of 80-90 RPM", "Adjust resistance as needed"],
      variations: ["Spin class", "Outdoor cycling"],
      lingo: ["bike", "spinning"], calories_per_minute_approx: 8
    },
    "jump rope": {
      name: "Jump Rope", category: "cardio", muscle_groups: { primary: ["calves", "shoulders"], secondary: ["cardiovascular system"] },
      equipment: "none", difficulty: "intermediate",
      instructions: "Swing rope over head and jump over it as it passes under feet.",
      common_mistakes: ["Jumping too high", "Using whole arm to swing rope"],
      tips: ["Stay on balls of feet", "Use wrists to turn rope"],
      variations: ["Double unders", "Alternating foot jump"],
      lingo: ["skipping", "skipping rope"], calories_per_minute_approx: 12
    },
    "hip thrust": {
      name: "Hip Thrust", category: "strength", muscle_groups: { primary: ["glutes"], secondary: ["hamstrings", "core"] },
      equipment: "barbell", difficulty: "intermediate",
      instructions: "Rest upper back on bench. Place barbell across hips. Drive through heels to push hips up until thighs and torso are parallel to floor.",
      common_mistakes: ["Overarching lower back at top", "Not reaching full extension"],
      tips: ["Tuck chin slightly", "Squeeze glutes hard at top"],
      variations: ["Dumbbell hip thrust", "Single leg hip thrust", "Glute bridge"],
      lingo: ["glute thrusts", "barbell hip thrust"], calories_per_minute_approx: 5
    },
    "cable fly": {
      name: "Cable Fly", category: "strength", muscle_groups: { primary: ["chest"], secondary: ["front delts"] },
      equipment: "cable", difficulty: "intermediate",
      instructions: "Stand between cable pulleys. Hold handles with slight bend in elbows. Bring handles together in front of chest in an arc motion.",
      common_mistakes: ["Bending elbows too much into a press", "Using momentum"],
      tips: ["Squeeze chest at peak contraction", "Keep shoulders down and back"],
      variations: ["High to low cable fly", "Low to high cable fly", "Pec deck machine"],
      lingo: ["chest flys", "crossovers", "cable crossovers"], calories_per_minute_approx: 4
    },
    "lat pulldown": {
      name: "Lat Pulldown", category: "strength", muscle_groups: { primary: ["lats", "back"], secondary: ["biceps"] },
      equipment: "machine", difficulty: "beginner",
      instructions: "Sit at machine. Grip wide bar. Pull bar down to upper chest while keeping torso slightly leaned back.",
      common_mistakes: ["Pulling bar behind neck", "Using momentum by swinging back too far"],
      tips: ["Drive elbows down and back", "Squeeze shoulder blades together"],
      variations: ["Close grip pulldown", "Reverse grip pulldown"],
      lingo: ["pulldowns", "lat pull"], calories_per_minute_approx: 4
    },
    "seated row": {
      name: "Seated Row", category: "strength", muscle_groups: { primary: ["back", "lats", "rhomboids"], secondary: ["biceps", "rear delts"] },
      equipment: "machine", difficulty: "beginner",
      instructions: "Sit at cable machine with V-bar or straight bar. Keep back straight. Pull handle to lower abdomen. Return under control.",
      common_mistakes: ["Rounding upper back", "Swinging torso to pull weight"],
      tips: ["Keep chest up", "Pull with elbows"],
      variations: ["Wide grip seated row", "Machine row"],
      lingo: ["cable row", "back row"], calories_per_minute_approx: 4
    },
    "arnold press": {
      name: "Arnold Press", category: "strength", muscle_groups: { primary: ["shoulders", "front delts"], secondary: ["triceps"] },
      equipment: "dumbbell", difficulty: "intermediate",
      instructions: "Sit on bench. Hold dumbbells in front of face with palms facing you. Press up while rotating wrists so palms face forward at the top. Reverse on the way down.",
      common_mistakes: ["Not fully rotating wrists", "Using momentum"],
      tips: ["Control the eccentric", "Full range of motion"],
      variations: ["Standing Arnold press"],
      lingo: ["arnolds"], calories_per_minute_approx: 4
    },
    "hammer curl": {
      name: "Hammer Curl", category: "strength", muscle_groups: { primary: ["biceps", "brachialis"], secondary: ["forearms"] },
      equipment: "dumbbell", difficulty: "beginner",
      instructions: "Hold dumbbells at sides with palms facing your torso (neutral grip). Curl weights up to shoulders. Lower under control.",
      common_mistakes: ["Swinging body", "Moving elbows forward"],
      tips: ["Squeeze at the top", "Keep elbows tucked"],
      variations: ["Cross-body hammer curl", "Cable hammer curl"],
      lingo: ["hammers"], calories_per_minute_approx: 3
    },
    "skull crusher": {
      name: "Skull Crusher", category: "strength", muscle_groups: { primary: ["triceps"], secondary: [] },
      equipment: "barbell", difficulty: "intermediate",
      instructions: "Lie on bench. Hold EZ bar above chest. Bend elbows to lower bar towards forehead. Extend arms to push bar back up.",
      common_mistakes: ["Moving upper arms (shoulders) during the movement", "Flaring elbows"],
      tips: ["Keep elbows pointing towards ceiling", "Control the descent"],
      variations: ["Dumbbell skull crusher", "Cable skull crusher"],
      lingo: ["lying tricep extension", "french press"], calories_per_minute_approx: 3
    },
    "front squat": {
      name: "Front Squat", category: "strength", muscle_groups: { primary: ["quads", "core"], secondary: ["glutes", "upper back"] },
      equipment: "barbell", difficulty: "advanced",
      instructions: "Rest barbell across front delts and collarbone. Keep elbows up high. Squat down until thighs are parallel. Drive up.",
      common_mistakes: ["Letting elbows drop", "Rounding upper back"],
      tips: ["Keep chest proud", "Stay upright"],
      variations: ["Goblet squat", "Zombie squat"],
      lingo: ["front squats"], calories_per_minute_approx: 7
    },
    "sumo deadlift": {
      name: "Sumo Deadlift", category: "strength", muscle_groups: { primary: ["glutes", "quads", "hamstrings"], secondary: ["lower back"] },
      equipment: "barbell", difficulty: "advanced",
      instructions: "Take a wide stance with toes pointed out. Grip bar inside knees. Keep chest up and back straight. Drive through floor to stand up.",
      common_mistakes: ["Hips rising before shoulders", "Rounding back"],
      tips: ["Push knees out", "Keep bar close to body"],
      variations: ["Deficit sumo deadlift", "Dumbbell sumo deadlift"],
      lingo: ["sumo"], calories_per_minute_approx: 7
    },
    "good morning": {
      name: "Good Morning", category: "strength", muscle_groups: { primary: ["hamstrings", "lower back"], secondary: ["glutes"] },
      equipment: "barbell", difficulty: "advanced",
      instructions: "Rest barbell on upper back. Keep a slight bend in knees. Hinge hips backward until torso is nearly parallel to floor. Stand back up.",
      common_mistakes: ["Rounding lower back", "Bending knees too much"],
      tips: ["Keep core tight", "Feel the stretch in hamstrings"],
      variations: ["Seated good morning", "Band good morning"],
      lingo: ["good mornings"], calories_per_minute_approx: 5
    },
    "hyperextension": {
      name: "Hyperextension", category: "strength", muscle_groups: { primary: ["lower back", "glutes"], secondary: ["hamstrings"] },
      equipment: "machine", difficulty: "beginner",
      instructions: "Position yourself in a back extension station. Lower upper body towards floor. Raise body until straight. Do not overextend.",
      common_mistakes: ["Overarching at the top", "Using momentum"],
      tips: ["Squeeze glutes to initiate movement", "Control the tempo"],
      variations: ["Weighted hyperextension", "Reverse hyperextension"],
      lingo: ["back extensions"], calories_per_minute_approx: 4
    },
    "box jump": {
      name: "Box Jump", category: "cardio", muscle_groups: { primary: ["quads", "glutes", "calves"], secondary: ["cardiovascular system", "core"] },
      equipment: "none", difficulty: "intermediate",
      instructions: "Stand in front of a plyo box. Dip into a quarter squat, swing arms, and jump explosively onto the box. Step down safely.",
      common_mistakes: ["Landing with stiff legs", "Jumping down instead of stepping down"],
      tips: ["Land softly", "Use arms for momentum"],
      variations: ["Seated box jump", "Single leg box jump"],
      lingo: ["jumps"], calories_per_minute_approx: 9
    },
    "battle ropes": {
      name: "Battle Ropes", category: "cardio", muscle_groups: { primary: ["shoulders", "arms", "core"], secondary: ["cardiovascular system"] },
      equipment: "none", difficulty: "beginner",
      instructions: "Hold rope handles. Drop into an athletic stance. Rapidly whip ropes up and down to create waves.",
      common_mistakes: ["Using only arms and not engaging core", "Standing too upright"],
      tips: ["Keep core braced", "Maintain high intensity"],
      variations: ["Alternating waves", "Double rope slams", "Rope circles"],
      lingo: ["ropes"], calories_per_minute_approx: 11
    }
  },
  workout_programs: {
    "ppl": {
      name: "PPL (Push Pull Legs)", goal: "muscle gain", difficulty: "intermediate", days_per_week: 6, duration_weeks: 12,
      description: "A popular and effective split that groups muscles by movement pattern. Push days hit chest/shoulders/triceps, Pull days hit back/biceps, and Leg days hit lower body.",
      schedule: [
        { day: 1, focus: "Push (Chest, Shoulders, Triceps)", exercises: ["Bench Press: 3x8-10", "Overhead Press: 3x8-10", "Incline Dumbbell Press: 3x10-12", "Lateral Raise: 4x15", "Tricep Pushdown: 3x12"] },
        { day: 2, focus: "Pull (Back, Biceps)", exercises: ["Barbell Row: 3x8-10", "Pull Up: 3x8-10", "Lat Pulldown: 3x10-12", "Face Pull: 3x15", "Bicep Curl: 3x12"] },
        { day: 3, focus: "Legs (Quads, Hams, Glutes)", exercises: ["Squat: 3x5-8", "Romanian Deadlift: 3x8-10", "Leg Press: 3x10-12", "Leg Curl: 3x12", "Calf Raise: 4x15"] },
        { day: 4, focus: "Push", exercises: ["Overhead Press: 3x8", "Bench Press: 3x10", "Cable Fly: 3x12", "Lateral Raise: 4x15", "Skull Crusher: 3x12"] },
        { day: 5, focus: "Pull", exercises: ["Deadlift: 1x5", "Seated Row: 3x10", "Lat Pulldown: 3x10", "Face Pull: 3x15", "Hammer Curl: 3x12"] },
        { day: 6, focus: "Legs", exercises: ["Front Squat: 3x8", "Leg Press: 3x10", "Leg Extension: 3x15", "Leg Curl: 3x12", "Calf Raise: 4x15"] },
        { day: 7, focus: "Rest", exercises: ["Active Recovery or Complete Rest"] }
      ],
      lingo: ["PPL", "push pull legs", "bro split advanced"]
    },
    "upper lower": {
      name: "Upper Lower Split", goal: "muscle gain", difficulty: "intermediate", days_per_week: 4, duration_weeks: 10,
      description: "Splits workouts between upper body and lower body days. Great for intermediate lifters wanting to hit each muscle group 2x a week with adequate recovery.",
      schedule: [
        { day: 1, focus: "Upper Body Strength", exercises: ["Bench Press: 4x4-6", "Barbell Row: 4x4-6", "Overhead Press: 3x8-10", "Lat Pulldown: 3x8-10", "Bicep Curl: 3x10-12"] },
        { day: 2, focus: "Lower Body Strength", exercises: ["Squat: 4x4-6", "Romanian Deadlift: 3x8-10", "Leg Press: 3x10-12", "Calf Raise: 4x12"] },
        { day: 3, focus: "Rest", exercises: [] },
        { day: 4, focus: "Upper Body Hypertrophy", exercises: ["Incline Bench Press: 3x8-10", "Seated Row: 3x8-10", "Lateral Raise: 3x12-15", "Tricep Pushdown: 3x10-12", "Hammer Curl: 3x10-12"] },
        { day: 5, focus: "Lower Body Hypertrophy", exercises: ["Front Squat: 3x8-10", "Leg Curl: 3x10-12", "Leg Extension: 3x12-15", "Calf Raise: 4x15"] },
        { day: 6, focus: "Rest", exercises: [] },
        { day: 7, focus: "Rest", exercises: [] }
      ],
      lingo: ["PHUL", "upper lower"]
    },
    "5/3/1": {
      name: "5/3/1", goal: "strength", difficulty: "advanced", days_per_week: 4, duration_weeks: 16,
      description: "A strength program created by Jim Wendler based on percentage-based progressive overload for the four main lifts (Squat, Bench, Deadlift, OHP).",
      schedule: [
        { day: 1, focus: "Squat Day", exercises: ["Squat: 5/3/1 protocol", "Leg Press: 5x10", "Leg Curl: 5x10", "Ab Wheel: 5x10"] },
        { day: 2, focus: "Bench Day", exercises: ["Bench Press: 5/3/1 protocol", "Dumbbell Bench Press: 5x10", "Dumbbell Row: 5x10", "Tricep Pushdown: 3x15"] },
        { day: 3, focus: "Rest", exercises: [] },
        { day: 4, focus: "Deadlift Day", exercises: ["Deadlift: 5/3/1 protocol", "Good Morning: 5x10", "Hanging Leg Raise: 5x10"] },
        { day: 5, focus: "OHP Day", exercises: ["Overhead Press: 5/3/1 protocol", "Dip: 5x10", "Chin Up: 5x10"] },
        { day: 6, focus: "Rest", exercises: [] },
        { day: 7, focus: "Rest", exercises: [] }
      ],
      lingo: ["wendler", "531"]
    },
    "full body 3x": {
      name: "Full Body 3x", goal: "general fitness", difficulty: "beginner", days_per_week: 3, duration_weeks: 8,
      description: "Hits the entire body in every session. Best for beginners to practice movement patterns frequently, or busy individuals who can only train 3 days a week.",
      schedule: [
        { day: 1, focus: "Full Body A", exercises: ["Squat: 3x5-8", "Bench Press: 3x5-8", "Barbell Row: 3x8-10", "Plank: 3x60s"] },
        { day: 2, focus: "Rest", exercises: [] },
        { day: 3, focus: "Full Body B", exercises: ["Deadlift: 1x5", "Overhead Press: 3x5-8", "Lat Pulldown: 3x8-10", "Crunch: 3x15"] },
        { day: 4, focus: "Rest", exercises: [] },
        { day: 5, focus: "Full Body C", exercises: ["Front Squat: 3x8-10", "Incline Bench Press: 3x8-10", "Seated Row: 3x8-10", "Lateral Raise: 3x12"] },
        { day: 6, focus: "Rest", exercises: [] },
        { day: 7, focus: "Rest", exercises: [] }
      ],
      lingo: ["full body", "starting strength", "stronglifts"]
    },
    "bro split": {
      name: "Bro Split", goal: "muscle gain", difficulty: "intermediate", days_per_week: 5, duration_weeks: 12,
      description: "Classic bodybuilding split targeting one major muscle group per day. Allows for high volume per session but low frequency per muscle group.",
      schedule: [
        { day: 1, focus: "Chest", exercises: ["Bench Press: 4x8-10", "Incline Dumbbell Press: 3x10-12", "Cable Fly: 4x12-15", "Push Up: 3xMax"] },
        { day: 2, focus: "Back", exercises: ["Barbell Row: 4x8-10", "Pull Up: 3x8-12", "Lat Pulldown: 3x10-12", "Seated Row: 3x12", "Deadlift: 3x5-8"] },
        { day: 3, focus: "Shoulders", exercises: ["Overhead Press: 4x8-10", "Arnold Press: 3x10", "Lateral Raise: 4x15", "Face Pull: 3x15"] },
        { day: 4, focus: "Legs", exercises: ["Squat: 4x8-10", "Leg Press: 3x10-12", "Leg Extension: 3x15", "Leg Curl: 3x15", "Calf Raise: 4x15"] },
        { day: 5, focus: "Arms", exercises: ["Bicep Curl: 4x10-12", "Skull Crusher: 4x10-12", "Hammer Curl: 3x12", "Tricep Pushdown: 3x15"] },
        { day: 6, focus: "Rest", exercises: [] },
        { day: 7, focus: "Rest", exercises: [] }
      ],
      lingo: ["bodypart split", "classic bodybuilding", "gym bro split"]
    },
    "gzclp": {
      name: "GZCLP", goal: "strength", difficulty: "beginner", days_per_week: 3, duration_weeks: 12,
      description: "Linear progression program. Mixes heavy low reps (Tier 1), moderate reps (Tier 2), and high rep isolation (Tier 3).",
      schedule: [
        { day: 1, focus: "T1 Squat / T2 Bench", exercises: ["Squat: 5x3", "Bench Press: 3x10", "Lat Pulldown: 3x15"] },
        { day: 2, focus: "Rest", exercises: [] },
        { day: 3, focus: "T1 OHP / T2 Deadlift", exercises: ["Overhead Press: 5x3", "Deadlift: 3x10", "Dumbbell Row: 3x15"] },
        { day: 4, focus: "Rest", exercises: [] },
        { day: 5, focus: "T1 Bench / T2 Squat", exercises: ["Bench Press: 5x3", "Squat: 3x10", "Lat Pulldown: 3x15"] },
        { day: 6, focus: "Rest", exercises: [] },
        { day: 7, focus: "Rest", exercises: [] }
      ],
      lingo: ["GZCL", "tier progression"]
    },
    "arnold split": {
      name: "Arnold Split", goal: "muscle gain", difficulty: "advanced", days_per_week: 6, duration_weeks: 12,
      description: "High volume, high frequency split favored by Arnold Schwarzenegger. Pairs Chest/Back, Shoulders/Arms, and Legs.",
      schedule: [
        { day: 1, focus: "Chest & Back", exercises: ["Bench Press: 4x8-10", "Pull Up: 4x8-12", "Incline Bench Press: 4x10", "Barbell Row: 4x10", "Cable Fly: 3x15"] },
        { day: 2, focus: "Shoulders & Arms", exercises: ["Overhead Press: 4x8-10", "Lateral Raise: 4x15", "Bicep Curl: 4x10-12", "Skull Crusher: 4x10-12", "Face Pull: 3x15"] },
        { day: 3, focus: "Legs", exercises: ["Squat: 4x8-10", "Leg Press: 4x10", "Romanian Deadlift: 4x10", "Leg Extension: 3x15", "Calf Raise: 4x15"] },
        { day: 4, focus: "Chest & Back", exercises: ["Dumbbell Bench Press: 4x10", "Lat Pulldown: 4x10", "Incline Fly: 3x12", "Seated Row: 4x10", "Pullover: 3x12"] },
        { day: 5, focus: "Shoulders & Arms", exercises: ["Arnold Press: 4x10", "Hammer Curl: 4x12", "Tricep Pushdown: 4x12", "Lateral Raise: 4x15"] },
        { day: 6, focus: "Legs", exercises: ["Front Squat: 4x10", "Lunges: 3x12 per leg", "Leg Curl: 4x12", "Calf Raise: 4x15"] },
        { day: 7, focus: "Rest", exercises: [] }
      ],
      lingo: ["arnold program", "golden era split"]
    },
    "beginner full body": {
      name: "Beginner Full Body", goal: "general fitness", difficulty: "beginner", days_per_week: 3, duration_weeks: 8,
      description: "Simple introduction to resistance training focusing on machines and basic dumbbell movements.",
      schedule: [
        { day: 1, focus: "Full Body Basics", exercises: ["Leg Press: 3x12-15", "Lat Pulldown: 3x12-15", "Machine Chest Press: 3x12-15", "Dumbbell Bicep Curl: 2x15", "Plank: 3x30s"] },
        { day: 2, focus: "Rest", exercises: [] },
        { day: 3, focus: "Full Body Basics", exercises: ["Goblet Squat: 3x12", "Seated Row: 3x12-15", "Dumbbell Shoulder Press: 3x12", "Tricep Pushdown: 2x15", "Crunch: 3x15"] },
        { day: 4, focus: "Rest", exercises: [] },
        { day: 5, focus: "Full Body Basics", exercises: ["Leg Curl: 3x12", "Lat Pulldown: 3x12-15", "Machine Chest Press: 3x12-15", "Lateral Raise: 2x15", "Plank: 3x45s"] },
        { day: 6, focus: "Rest", exercises: [] },
        { day: 7, focus: "Rest", exercises: [] }
      ],
      lingo: ["newbie routine", "gym beginner"]
    }
  },
  cardio_protocols: {
    "liss": {
      name: "LISS (Low Intensity Steady State)", description: "Cardio performed at a low, consistent intensity (60-70% max heart rate) for a longer duration.",
      duration_minutes: 45, intensity: "low", calories_burned_approx: 300,
      best_for: "Active recovery, improving base aerobic engine, burning fat without fatiguing muscles.",
      how_to: "Pick an activity (walking, cycling, swimming) and maintain a pace where you can easily hold a conversation.",
      lingo: ["steady state", "walking", "zone 2 (often used interchangeably)"]
    },
    "hiit": {
      name: "HIIT (High Intensity Interval Training)", description: "Short bursts of maximum effort followed by brief periods of rest or active recovery.",
      duration_minutes: 20, intensity: "very high", calories_burned_approx: 250,
      best_for: "Maximizing calorie burn in minimal time, improving VO2 max, metabolic conditioning.",
      how_to: "Sprint all-out for 20-30 seconds, walk/jog for 60-90 seconds. Repeat 6-10 times.",
      lingo: ["intervals", "sprint intervals", "HIIT"]
    },
    "zone 2": {
      name: "Zone 2 Cardio", description: "Aerobic exercise performed precisely in Zone 2 heart rate (60-70% max HR), optimizing mitochondrial function.",
      duration_minutes: 60, intensity: "low to moderate", calories_burned_approx: 400,
      best_for: "Longevity, endurance athletes, improving metabolic health without CNS fatigue.",
      how_to: "Maintain a steady output where you can breathe through your nose or speak in full sentences, but it feels slightly uncomfortable to do so.",
      lingo: ["zone 2", "base building"]
    },
    "tabata": {
      name: "Tabata", description: "A highly intense specific form of HIIT: 20 seconds of all-out effort followed by 10 seconds of rest, repeated 8 times.",
      duration_minutes: 4, intensity: "maximum", calories_burned_approx: 60,
      best_for: "Quick finisher after a workout, rapid cardiovascular conditioning.",
      how_to: "Perform an exercise (e.g., burpees, stationary bike) as hard as possible for 20s, rest completely for 10s. Repeat 8 times for a total of 4 mins.",
      lingo: ["tabata protocol"]
    },
    "fasted cardio": {
      name: "Fasted Cardio", description: "Performing cardio first thing in the morning before eating any calories.",
      duration_minutes: 30, intensity: "low", calories_burned_approx: 200,
      best_for: "Personal preference, some believe it burns more stubborn fat (though literature shows equal 24hr fat loss to fed cardio).",
      how_to: "Wake up, drink water/black coffee, perform LISS cardio for 30-45 mins before eating breakfast.",
      lingo: ["empty stomach cardio"]
    },
    "steady state": {
      name: "Steady State Cardio", description: "Maintaining a moderate intensity for a set duration.",
      duration_minutes: 30, intensity: "moderate", calories_burned_approx: 250,
      best_for: "General cardiovascular health, burning calories.",
      how_to: "Run, cycle, or row at a consistent, moderate pace.",
      lingo: ["regular cardio", "jogging"]
    },
    "sprint intervals": {
      name: "Sprint Intervals", description: "Repeated bouts of short duration, maximal exertion sprints.",
      duration_minutes: 15, intensity: "maximum", calories_burned_approx: 200,
      best_for: "Speed, power, athletic performance.",
      how_to: "Sprint 100m all-out. Walk back to start. Repeat 5-8 times.",
      lingo: ["sprints", "track repeats"]
    }
  },
  muscle_groups: {
    "chest": { name: "Pectorals (Chest)", function: "Shoulder flexion, adduction, internal rotation. Brings arms across body.", primary_exercises: ["Bench Press", "Incline Bench", "Cable Fly", "Push Up"], secondary_exercises: ["Dip"], lingo: ["chest", "pecs", "seena"] },
    "back": { name: "Back (General)", function: "Pulls arms toward body, stabilizes spine.", primary_exercises: ["Barbell Row", "Pull Up", "Seated Row"], secondary_exercises: ["Deadlift"], lingo: ["back", "peeth"] },
    "shoulders": { name: "Deltoids (Shoulders)", function: "Shoulder abduction, flexion, extension.", primary_exercises: ["Overhead Press", "Lateral Raise", "Arnold Press"], secondary_exercises: ["Bench Press", "Face Pull"], lingo: ["shoulders", "delts", "kandhe"] },
    "biceps": { name: "Biceps Brachii", function: "Elbow flexion, forearm supination.", primary_exercises: ["Bicep Curl", "Hammer Curl", "Chin Up"], secondary_exercises: ["Barbell Row", "Lat Pulldown"], lingo: ["bis", "biceps", "dole"] },
    "triceps": { name: "Triceps Brachii", function: "Elbow extension.", primary_exercises: ["Tricep Pushdown", "Skull Crusher", "Dip"], secondary_exercises: ["Bench Press", "Overhead Press", "Push Up"], lingo: ["tris", "triceps"] },
    "forearms": { name: "Forearms", function: "Wrist flexion, extension, grip.", primary_exercises: ["Reverse Curl", "Wrist Curl"], secondary_exercises: ["Deadlift", "Pull Up", "Farmers Walk"], lingo: ["grip", "forearms"] },
    "quads": { name: "Quadriceps", function: "Knee extension.", primary_exercises: ["Squat", "Leg Press", "Leg Extension", "Front Squat"], secondary_exercises: [], lingo: ["quads", "front thighs", "taang"] },
    "hamstrings": { name: "Hamstrings", function: "Knee flexion, hip extension.", primary_exercises: ["Romanian Deadlift", "Leg Curl", "Good Morning"], secondary_exercises: ["Squat", "Leg Press"], lingo: ["hams", "hammies", "back thighs"] },
    "glutes": { name: "Gluteus Maximus", function: "Hip extension, external rotation.", primary_exercises: ["Hip Thrust", "Squat", "Deadlift"], secondary_exercises: ["Lunges", "Leg Press"], lingo: ["glutes", "butt", "hips"] },
    "calves": { name: "Calves (Gastrocnemius & Soleus)", function: "Ankle plantarflexion.", primary_exercises: ["Calf Raise"], secondary_exercises: ["Running", "Jump Rope"], lingo: ["calves", "pindli"] },
    "abs": { name: "Rectus Abdominis", function: "Spine flexion.", primary_exercises: ["Crunch", "Leg Raise", "Plank"], secondary_exercises: ["Squat", "Overhead Press"], lingo: ["abs", "six pack", "core", "pet"] },
    "obliques": { name: "Obliques", function: "Spine rotation, lateral flexion.", primary_exercises: ["Russian Twist", "Side Plank"], secondary_exercises: [], lingo: ["obliques", "side abs"] },
    "traps": { name: "Trapezius", function: "Scapula elevation, retraction, depression.", primary_exercises: ["Shrugs", "Face Pull"], secondary_exercises: ["Deadlift", "Barbell Row"], lingo: ["traps"] },
    "lats": { name: "Latissimus Dorsi", function: "Shoulder extension, adduction, internal rotation.", primary_exercises: ["Pull Up", "Lat Pulldown"], secondary_exercises: ["Deadlift", "Barbell Row"], lingo: ["lats", "wings"] }
  },
  recovery: {
    "sleep": { name: "Sleep", description: "7-9 hours of high-quality sleep per night.", when_to_use: "Every night.", duration: "7-9 hours", benefits: "Optimal hormone release (GH, testosterone), muscle tissue repair, CNS recovery, cognitive function." },
    "active recovery": { name: "Active Recovery", description: "Very low intensity exercise to promote blood flow without adding fatigue.", when_to_use: "Rest days.", duration: "15-30 mins", benefits: "Flushes metabolic waste, delivers nutrients to muscles, reduces soreness." },
    "foam rolling": { name: "Foam Rolling (SMR)", description: "Self-myofascial release using a foam roller on tight muscles.", when_to_use: "Pre-workout for mobility, post-workout or rest days for relief.", duration: "5-10 mins", benefits: "Improves range of motion, temporarily reduces muscle stiffness." },
    "stretching": { name: "Stretching", description: "Static or dynamic lengthening of muscles.", when_to_use: "Dynamic before workout, static after workout.", duration: "10 mins", benefits: "Maintains flexibility, joint health, and reduces injury risk." },
    "deload week": { name: "Deload Week", description: "A planned week of training at reduced volume and intensity.", when_to_use: "Every 4-8 weeks, or when systemic fatigue is high.", duration: "1 week", benefits: "Allows joints, connective tissue, and CNS to fully recover while dissipating accumulated fatigue." },
    "ice bath": { name: "Ice Bath / Cold Exposure", description: "Immersing body in cold water (10-15C).", when_to_use: "After intense endurance training (avoid immediately after hypertrophy training).", duration: "5-10 mins", benefits: "Reduces acute inflammation and perceived soreness." },
    "massage": { name: "Massage Therapy", description: "Deep tissue or sports massage by a professional.", when_to_use: "As needed for tight spots or general recovery.", duration: "30-60 mins", benefits: "Relaxes tight muscles, improves circulation, psychological relaxation." }
  },
  lingo_map: {
    "chest day": "bench press",
    "pull day": "pull up",
    "legs": "squat",
    "bis": "bicep curl",
    "tris": "tricep pushdown",
    "ohp": "overhead press",
    "dl": "deadlift",
    "rdl": "romanian deadlift",
    "pushups": "push up",
    "dand": "push up",
    "baithak": "squat",
    "dole": "biceps",
    "peeth": "back",
    "seena": "chest",
    "kandhe": "shoulders",
    "pet": "abs",
    "pindli": "calves",
    "taang": "legs",
    "wings": "lats",
    "six pack": "abs",
    "core": "plank",
    "cardio": "running",
    "hiit": "sprint intervals",
    "liss": "steady state",
    "wendler": "5/3/1",
    "ppl": "push pull legs",
    "bro split": "bodypart split",
    "deads": "deadlift",
    "squats": "squat",
    "bench": "bench press",
    "chins": "chin up",
    "pullups": "pull up",
    "dips": "dip",
    "curls": "bicep curl",
    "pushdowns": "tricep pushdown",
    "facepulls": "face pull",
    "crunches": "crunch",
    "sit ups": "crunch",
    "burpees": "burpee",
    "jacks": "jumping jack",
    "climbers": "mountain climber",
    "jogging": "running",
    "bike": "cycling",
    "spinning": "cycling",
    "skipping": "jump rope",
    "ropes": "battle ropes",
    "jumps": "box jump",
    "back extensions": "hyperextension",
    "good mornings": "good morning",
    "sumo": "sumo deadlift",
    "arnolds": "arnold press",
    "rows": "barbell row",
    "cable row": "seated row",
    "pulldowns": "lat pulldown",
    "crossovers": "cable fly",
    "glute thrusts": "hip thrust",
    "hamstring curl": "leg curl",
    "quad extension": "leg extension",
    "machine press": "leg press",
    "incline": "incline bench",
    "side raises": "lateral raise",
    "lat raises": "lateral raise",
    "hammers": "hammer curl",
    "french press": "skull crusher",
    "front squats": "front squat",
    "gym beginner": "beginner full body",
    "newbie routine": "beginner full body",
    "golden era split": "arnold split",
    "tier progression": "gzclp",
    "stronglifts": "full body 3x",
    "starting strength": "full body 3x",
    "upper lower": "upper lower",
    "phul": "upper lower",
    "zone 2": "liss",
    "empty stomach cardio": "fasted cardio",
    "track repeats": "sprint intervals",
    "sprints": "sprint intervals",
    "rest day": "active recovery"
  }
};

const dietData = {
  diet_protocols: {
    "iifym": {
      name: "IIFYM (If It Fits Your Macros)", description: "Flexible dieting focusing on hitting daily macronutrient targets (Protein, Carbs, Fat) rather than restricting specific foods.",
      best_for: "People wanting food freedom, sustainable long-term dieting.",
      how_it_works: "Calculate TDEE, set a calorie goal, assign protein (e.g. 2g/kg), fat (e.g. 0.8g/kg), and fill the rest with carbs. Eat whatever you want as long as you hit those numbers.",
      sample_schedule: "No fixed schedule. Eat when convenient.",
      pros: "Highly sustainable, prevents binge eating, allows social eating.",
      cons: "Can lead to micronutrient deficiencies if abused with junk food. Requires meticulous tracking.",
      macro_split: "Varies, typically 30% P / 45% C / 25% F", lingo: ["flexible dieting", "macro tracking"]
    },
    "clean eating": {
      name: "Clean Eating", description: "Focuses on consuming whole, unprocessed, nutrient-dense foods. Avoids refined sugars and artificial additives.",
      best_for: "Overall health, improving digestion, micronutrient density.",
      how_it_works: "Base diet around vegetables, lean meats, whole grains, fruits, nuts, and seeds.",
      sample_schedule: "Standard 3 meals + 2 snacks.",
      pros: "Excellent for health, highly satiating.",
      cons: "Can be restrictive, difficult for social events, 'clean' foods still have calories causing unexpected weight gain if portions aren't managed.",
      macro_split: "Balanced, typically 25% P / 50% C / 25% F", lingo: ["eating clean", "whole foods diet"]
    },
    "intermittent fasting": {
      name: "Intermittent Fasting (16:8)", description: "Eating pattern cycling between periods of fasting and eating.",
      best_for: "People who prefer larger meals, controlling late-night snacking.",
      how_it_works: "Fast for 16 hours, eat all calories within an 8-hour window.",
      sample_schedule: "Fast from 8 PM to 12 PM next day. Eat lunch at 12 PM, snack at 4 PM, dinner at 7:30 PM.",
      pros: "Simplifies eating, can improve insulin sensitivity, helps maintain calorie deficit easily.",
      cons: "Can cause low energy in mornings, difficult to hit high protein goals for muscle gain.",
      macro_split: "Any", lingo: ["IF", "time restricted feeding", "16:8", "OMAD"]
    },
    "carb cycling": {
      name: "Carb Cycling", description: "Alternating high carb and low carb days, usually aligned with training intensity.",
      best_for: "Advanced athletes, breaking fat loss plateaus while maintaining performance.",
      how_it_works: "High carb days on heavy training days (legs/back) to fuel performance. Low carb days on rest or light cardio days to enhance fat burning.",
      sample_schedule: "Mon (Legs): High Carb, Tue (Upper): Moderate Carb, Wed (Rest): Low Carb.",
      pros: "Maximizes gym performance while losing fat, improves insulin sensitivity.",
      cons: "Complex to plan and track, requires strict adherence.",
      macro_split: "Varies daily", lingo: ["carb manipulation"]
    },
    "ketogenic": {
      name: "Ketogenic Diet", description: "Very low carb, high fat diet designed to put the body into a state of ketosis.",
      best_for: "People with insulin resistance, sedentary individuals, those who prefer high-fat foods.",
      how_it_works: "Restrict carbs to <30g per day. Body switches to burning ketones (fat) for fuel instead of glucose.",
      sample_schedule: "Eggs/Bacon for breakfast, Salad with olive oil/chicken for lunch, Salmon with buttery asparagus for dinner.",
      pros: "Strong appetite suppression, rapid initial water weight loss.",
      cons: "Poor for high-intensity anaerobic performance (lifting), 'keto flu' during adaptation, highly restrictive.",
      macro_split: "20% P / 5% C / 75% F", lingo: ["keto", "LCHF"]
    },
    "high protein low carb": {
      name: "High Protein Low Carb", description: "Similar to keto but with more protein and slightly more carbs, avoiding full ketosis.",
      best_for: "Fat loss while preserving muscle, managing hunger.",
      how_it_works: "Protein is kept very high (>2.2g/kg). Carbs kept low (50-100g) mainly from vegetables.",
      sample_schedule: "Omelette for breakfast, Chicken salad for lunch, Paneer tikka and veggies for dinner.",
      pros: "Great for muscle retention during cuts, highly satiating.",
      cons: "Can leave you feeling flat in the gym due to low glycogen.",
      macro_split: "40% P / 20% C / 40% F", lingo: ["HPLC", "low carb"]
    },
    "calorie cycling": {
      name: "Calorie Cycling", description: "Fluctuating daily calorie intake while maintaining a weekly average target.",
      best_for: "Social flexibility, enjoying weekends without ruining diet.",
      how_it_works: "Eat lower calories Mon-Thu, eat higher calories Fri-Sun, but weekly average remains in a deficit.",
      sample_schedule: "Mon-Thu: 1800 cal. Fri-Sun: 2500 cal. (Average ~2100 cal).",
      pros: "Psychologically easier, accommodates social life.",
      cons: "Easy to overeat on high days and ruin the weekly deficit.",
      macro_split: "Any", lingo: ["zig zag dieting"]
    },
    "reverse dieting": {
      name: "Reverse Dieting", description: "Slowly increasing calories after a prolonged diet to restore metabolism while minimizing fat gain.",
      best_for: "Post-diet transition to maintenance, recovering from metabolic adaptation.",
      how_it_works: "Add 50-100 calories (mostly carbs/fat) each week until maintenance is reached.",
      sample_schedule: "Week 1: 1600c. Week 2: 1700c. Week 3: 1800c.",
      pros: "Restores hormonal balance and metabolic rate without rebound weight gain.",
      cons: "Requires immense patience and strict tracking.",
      macro_split: "Gradually increasing C/F", lingo: ["metabolic repair", "reversing"]
    },
    "maintenance": {
      name: "Maintenance Phase", description: "Eating at TDEE to maintain current body weight.",
      best_for: "Consolidating gains or fat loss, taking a break from dieting, performance phases.",
      how_it_works: "Eat exactly what you burn. Focus shifts to performance and recovery.",
      sample_schedule: "Balanced meals fitting TDEE.",
      pros: "Sustainable, good energy levels, mental break.",
      cons: "No rapid changes in body weight.",
      macro_split: "30% P / 40% C / 30% F", lingo: ["maintaining", "isocaloric"]
    },
    "lean bulk": {
      name: "Lean Bulk", description: "A slight caloric surplus aimed at maximizing muscle gain while minimizing fat accumulation.",
      best_for: "Muscle gain, aesthetic goals.",
      how_it_works: "Eat 200-300 calories above maintenance. Ensure adequate protein.",
      sample_schedule: "3 solid meals + 1 pre-workout snack + 1 protein shake.",
      pros: "Builds muscle with minimal fat gain, easy to transition out of.",
      cons: "Muscle gain is slower than a dirty bulk.",
      macro_split: "25% P / 50% C / 25% F", lingo: ["clean bulk", "maingaining"]
    },
    "dirty bulk": {
      name: "Dirty Bulk", description: "A large caloric surplus with no food restrictions to maximize weight gain.",
      best_for: "Hardgainers, powerlifters not in a weight class, absolute mass building.",
      how_it_works: "Eat 500-1000+ calories above maintenance. Eat whatever is necessary to hit calorie goals.",
      sample_schedule: "Large meals, liquid calories, high-calorie snacks.",
      pros: "Rapid weight and strength gain.",
      cons: "Significant fat gain, potential negative impacts on health markers (lipids, insulin).",
      macro_split: "High Carbs and Fats", lingo: ["dreamer bulk", "see food diet"]
    },
    "mini cut": {
      name: "Mini Cut", description: "A short, aggressive fat loss phase used during a bulking cycle.",
      best_for: "Stripping off fat mid-bulk to extend the bulking runway.",
      how_it_works: "Aggressive deficit (500-800 cal) for 2-6 weeks to drop fat fast without losing muscle.",
      sample_schedule: "High protein, very low carb/fat for 4 weeks.",
      pros: "Quick results, clears up insulin sensitivity, lets you get back to bulking sooner.",
      cons: "Hunger, temporarily low energy.",
      macro_split: "40% P / 30% C / 30% F", lingo: ["aggressive cut"]
    }
  },
  meal_plans: {
    "muscle gain 2500 veg": {
      goal: "muscle gain", calories_approx: 2500, protein_approx: 130,
      description: "Vegetarian muscle building plan prioritizing paneer, whey, and lentils for protein.",
      meals: [
        { name: "Breakfast", time: "08:30", foods: ["2 scoop Whey Protein", "50g Oats", "1 medium Apple", "15g Almonds"], macros: "500 kcal, 55g P, 45g C, 12g F" },
        { name: "Lunch", time: "13:30", foods: ["2 Katori Toor Dal", "150g Rice", "100g Paneer cubes (cooked with minimal oil)", "Side Salad"], macros: "750 kcal, 35g P, 85g C, 30g F" },
        { name: "Pre-Workout Snack", time: "17:00", foods: ["2 slices Whole Wheat Bread", "1.5 tbsp Peanut Butter", "1 Banana"], macros: "400 kcal, 12g P, 55g C, 15g F" },
        { name: "Dinner", time: "21:00", foods: ["150g Low Fat Paneer (Bhurji)", "3 Roti", "1 Katori Mixed Veg Subzi"], macros: "650 kcal, 35g P, 65g C, 25g F" },
        { name: "Before Bed", time: "23:00", foods: ["200ml Skimmed Milk"], macros: "80 kcal, 7g P, 10g C, 1g F" }
      ],
      notes: "Drink 3-4 liters of water. Adjust rice/roti quantities to hit exact calories."
    },
    "muscle gain 2800 non-veg": {
      goal: "muscle gain", calories_approx: 2800, protein_approx: 160,
      description: "High protein non-veg plan utilizing eggs, chicken breast, and whey.",
      meals: [
        { name: "Breakfast", time: "08:00", foods: ["4 Whole Eggs", "2 Egg Whites", "3 slices Whole Wheat Bread", "1 Banana"], macros: "600 kcal, 40g P, 50g C, 22g F" },
        { name: "Lunch", time: "13:30", foods: ["200g Chicken Breast (Grilled)", "200g Rice", "1 Katori Dal", "Salad"], macros: "750 kcal, 65g P, 90g C, 10g F" },
        { name: "Pre-Workout", time: "17:00", foods: ["1 scoop Whey Protein", "50g Oats"], macros: "300 kcal, 28g P, 35g C, 4g F" },
        { name: "Dinner", time: "21:00", foods: ["150g Chicken Curry (Low Oil)", "3 Roti", "Mixed Veg"], macros: "650 kcal, 45g P, 60g C, 20g F" },
        { name: "Before Bed", time: "23:00", foods: ["30g Peanut Butter", "1 slice Bread"], macros: "250 kcal, 9g P, 18g C, 16g F" }
      ],
      notes: "Cook chicken with minimal oil. Use spices freely for taste."
    },
    "fat loss 1600 veg": {
      goal: "fat loss", calories_approx: 1600, protein_approx: 110,
      description: "Aggressive fat loss for vegetarians, high volume foods to maintain satiety.",
      meals: [
        { name: "Breakfast", time: "09:00", foods: ["1.5 scoop Whey Protein", "30g Oats in water", "Handful of berries"], macros: "250 kcal, 40g P, 20g C, 3g F" },
        { name: "Lunch", time: "14:00", foods: ["100g Paneer (Low Fat)", "1 Roti", "Large Bowl Green Salad", "1 Katori Dal"], macros: "450 kcal, 30g P, 40g C, 15g F" },
        { name: "Evening Snack", time: "17:30", foods: ["100g Greek Yogurt", "10g Almonds"], macros: "150 kcal, 12g P, 5g C, 8g F" },
        { name: "Dinner", time: "20:30", foods: ["150g Tofu Stir Fry with Broccoli and Bell Peppers", "1 Roti"], macros: "350 kcal, 25g P, 30g C, 15g F" }
      ],
      notes: "Drink black coffee or green tea to manage hunger."
    },
    "fat loss 1800 non-veg": {
      goal: "fat loss", calories_approx: 1800, protein_approx: 150,
      description: "Sustainable fat loss plan utilizing lean meats for high satiety.",
      meals: [
        { name: "Breakfast", time: "08:30", foods: ["5 Egg Whites", "1 Whole Egg", "2 slices Brown Bread"], macros: "300 kcal, 25g P, 30g C, 8g F" },
        { name: "Lunch", time: "13:30", foods: ["150g Chicken Breast", "100g Rice", "Large Salad with Lemon Dressing"], macros: "400 kcal, 45g P, 35g C, 5g F" },
        { name: "Snack", time: "17:00", foods: ["1 scoop Whey Protein", "1 Apple"], macros: "200 kcal, 25g P, 22g C, 2g F" },
        { name: "Dinner", time: "20:30", foods: ["150g Fish (Tilapia/Rohu) grilled", "2 Roti", "1 Katori Spinach/Palak"], macros: "450 kcal, 35g P, 45g C, 12g F" }
      ],
      notes: "Protein is kept very high to prevent muscle loss during the calorie deficit."
    },
    "maintenance 2000": {
      goal: "maintenance", calories_approx: 2000, protein_approx: 120,
      description: "Balanced baseline diet.",
      meals: [
        { name: "Breakfast", time: "08:00", foods: ["2 Whole Eggs", "2 Egg Whites", "2 Roti"], macros: "400 kcal, 22g P, 40g C, 14g F" },
        { name: "Lunch", time: "13:00", foods: ["100g Chicken/Paneer", "150g Rice", "1 Katori Dal", "Salad"], macros: "550 kcal, 40g P, 65g C, 12g F" },
        { name: "Snack", time: "16:30", foods: ["1 scoop Whey", "1 Banana"], macros: "220 kcal, 26g P, 27g C, 2g F" },
        { name: "Dinner", time: "20:30", foods: ["100g Chicken/Paneer", "2 Roti", "Mixed Veg Subzi"], macros: "500 kcal, 30g P, 50g C, 15g F" }
      ],
      notes: "A good baseline to adjust upwards for bulking or downwards for cutting."
    },
    "athletic performance 3000": {
      goal: "performance", calories_approx: 3000, protein_approx: 150,
      description: "High carb diet to fuel intense training sessions.",
      meals: [
        { name: "Breakfast", time: "07:30", foods: ["100g Oats", "1 scoop Whey", "1 tbsp Peanut Butter", "1 Banana"], macros: "650 kcal, 45g P, 85g C, 15g F" },
        { name: "Lunch", time: "12:30", foods: ["200g Chicken Breast", "250g Rice", "Vegetables"], macros: "750 kcal, 65g P, 100g C, 8g F" },
        { name: "Pre-Workout", time: "16:00", foods: ["4 slices Bread", "Jam", "Black Coffee"], macros: "350 kcal, 10g P, 75g C, 2g F" },
        { name: "Post-Workout", time: "18:30", foods: ["1 scoop Whey", "50g Dextrose/Glucon-D"], macros: "320 kcal, 25g P, 50g C, 2g F" },
        { name: "Dinner", time: "21:00", foods: ["4 Whole Eggs", "3 Roti", "Dal"], macros: "700 kcal, 35g P, 65g C, 30g F" }
      ],
      notes: "Carbs are placed strategically around the workout for maximum energy and recovery."
    },
    "budget muscle gain": {
      goal: "muscle gain", calories_approx: 2600, protein_approx: 120,
      description: "Cheap, high-calorie, adequate protein plan relying on eggs, dal, and peanuts.",
      meals: [
        { name: "Breakfast", time: "08:00", foods: ["4 Whole Eggs (boiled or bhurji)", "4 slices Bread"], macros: "550 kcal, 32g P, 55g C, 22g F" },
        { name: "Lunch", time: "13:30", foods: ["2 Katori thick Dal", "200g Rice", "Aloo Subzi"], macros: "650 kcal, 20g P, 110g C, 12g F" },
        { name: "Snack", time: "17:00", foods: ["50g Roasted Peanuts", "1 Banana"], macros: "400 kcal, 14g P, 35g C, 25g F" },
        { name: "Dinner", time: "21:00", foods: ["4 Egg Whites", "1 Whole Egg", "4 Roti", "Dal"], macros: "600 kcal, 30g P, 80g C, 15g F" },
        { name: "Before Bed", time: "23:00", foods: ["250ml Milk"], macros: "150 kcal, 8g P, 12g C, 8g F" }
      ],
      notes: "Extremely cost-effective. Peanuts provide dense calories and healthy fats."
    }
  },
  supplements: {
    "creatine": { name: "Creatine Monohydrate", benefit: "Increases strength, power output, and muscle volume by replenishing ATP stores.", dose: "3-5g daily.", timing: "Anytime, taken consistently daily.", evidence_level: "strong", best_for: "All lifters and athletes.", caution: "Drink adequate water to prevent cramping.", lingo: ["creatine"] },
    "whey protein": { name: "Whey Protein", benefit: "Convenient, high-quality, fast-absorbing protein source to hit daily macro goals.", dose: "20-40g (1-2 scoops) per serving.", timing: "Post-workout or anytime you need protein.", evidence_level: "strong", best_for: "Hitting protein targets easily.", caution: "May cause bloating in lactose intolerant individuals (use Isolate instead).", lingo: ["whey", "protein powder", "shake"] },
    "caffeine": { name: "Caffeine", benefit: "Central nervous system stimulant, decreases perceived exertion, increases focus.", dose: "100-300mg (1-2 cups coffee).", timing: "30-45 mins pre-workout.", evidence_level: "strong", best_for: "Energy boosts before hard sessions.", caution: "Avoid within 6-8 hours of sleep. Can cause jitters.", lingo: ["pre", "coffee"] },
    "beta-alanine": { name: "Beta-Alanine", benefit: "Buffers lactic acid, improving endurance in the 1-4 minute rep range (e.g., high rep sets).", dose: "3-5g daily.", timing: "Anytime, taken consistently.", evidence_level: "strong", best_for: "High rep training, CrossFit.", caution: "Causes harmless skin tingling (paresthesia).", lingo: ["beta alanine"] },
    "omega-3": { name: "Omega-3 Fish Oil", benefit: "Reduces inflammation, supports cardiovascular and joint health.", dose: "1-3g combined EPA/DHA.", timing: "With meals.", evidence_level: "strong", best_for: "General health, joint support.", caution: "If vegetarian, use algae oil.", lingo: ["fish oil", "omega 3"] },
    "vitamin d": { name: "Vitamin D3", benefit: "Supports bone health, immune function, and optimal testosterone levels.", dose: "2000-5000 IU daily (if deficient).", timing: "With a meal containing fat.", evidence_level: "strong", best_for: "People with low sun exposure.", caution: "Toxicity is rare but possible at massive doses.", lingo: ["vit d", "sunshine vitamin"] },
    "magnesium": { name: "Magnesium", benefit: "Supports nerve function, muscle relaxation, and sleep quality.", dose: "200-400mg.", timing: "Before bed.", evidence_level: "strong", best_for: "Cramp prevention, sleep aid.", caution: "Avoid Magnesium Oxide (poor absorption), use Citrate, Glycinate, or Threonate.", lingo: ["magnesium"] },
    "zinc": { name: "Zinc", benefit: "Supports immune system and testosterone production (if deficient).", dose: "15-30mg.", timing: "With meals.", evidence_level: "strong", best_for: "General health, male hormone support.", caution: "Taking on an empty stomach causes severe nausea.", lingo: ["zinc"] },
    "bcaas": { name: "BCAAs (Branched-Chain Amino Acids)", benefit: "May prevent muscle breakdown during fasted training. Largely redundant if eating enough total protein.", dose: "5-10g.", timing: "Intra-workout.", evidence_level: "weak", best_for: "Fasted cardio/training.", caution: "Often a waste of money if eating adequate whey/meat.", lingo: ["bcaa", "aminos"] },
    "pre-workout": { name: "Pre-Workout Blends", benefit: "Combines caffeine, pump ingredients (citrulline), and focus agents.", dose: "1 scoop.", timing: "30 mins before training.", evidence_level: "moderate", best_for: "Energy and pump.", caution: "Watch total caffeine intake. Do not dry scoop.", lingo: ["pre"] },
    "casein": { name: "Casein Protein", benefit: "Slow-digesting protein providing a steady stream of amino acids.", dose: "25-40g.", timing: "Before bed.", evidence_level: "strong", best_for: "Overnight recovery.", caution: "Thicker texture than whey.", lingo: ["casein"] },
    "collagen": { name: "Collagen Peptides", benefit: "May support joint, tendon, skin, and hair health.", dose: "10-20g.", timing: "Daily, preferably with Vitamin C 60 mins before exercise.", evidence_level: "moderate", best_for: "Joint pain, tendon recovery.", caution: "Not a complete protein, doesn't count towards muscle building protein.", lingo: ["collagen"] },
    "ashwagandha": { name: "Ashwagandha", benefit: "Adaptogen that reduces cortisol (stress hormone) and may modestly boost testosterone.", dose: "300-600mg (KSM-66 extract).", timing: "Daily.", evidence_level: "moderate", best_for: "Highly stressed individuals.", caution: "May cause lethargy in some people. Cycle it (e.g., 2 months on, 1 month off).", lingo: ["ashwa"] },
    "melatonin": { name: "Melatonin", benefit: "Aids in falling asleep faster.", dose: "0.5-3mg.", timing: "30 mins before bed.", evidence_level: "strong", best_for: "Shift workers, jet lag, occasional insomnia.", caution: "High doses (>5mg) can cause grogginess the next day.", lingo: ["sleep aid"] },
    "multivitamin": { name: "Multivitamin", benefit: "Fills potential micronutrient gaps in the diet.", dose: "1 pill.", timing: "With a meal.", evidence_level: "moderate", best_for: "People on restrictive diets (heavy cuts).", caution: "Does not replace a diet rich in fruits and vegetables.", lingo: ["multi", "vitamins"] }
  },
  cutting_strategies: {
    "calorie deficit": { name: "Calorie Deficit", description: "Consuming fewer calories than you burn. The absolute requirement for fat loss.", how_to: "Calculate TDEE, subtract 300-500 calories.", best_for: "Everyone trying to lose fat.", common_mistakes: ["Cutting calories too drastically, leading to muscle loss."] },
    "protein sparing": { name: "Protein Sparing", description: "Keeping protein exceptionally high during a cut to preserve lean mass.", how_to: "Eat 2.2-2.7g of protein per kg of bodyweight.", best_for: "Aggressive cuts, lean individuals trying to get shredded.", common_mistakes: ["Neglecting fat intake entirely."] },
    "diet breaks": { name: "Diet Breaks", description: "Taking 1-2 weeks at maintenance calories during a long cut.", how_to: "After 6-8 weeks of cutting, eat at TDEE for 1 week.", best_for: "Reversing metabolic adaptation, mental relief.", common_mistakes: ["Turning a diet break into a binge week."] },
    "refeed days": { name: "Refeed Days", description: "A single day of eating at maintenance, entirely via increased carbohydrates.", how_to: "Keep fats low, protein moderate, and increase carbs heavily for one day.", best_for: "Replenishing muscle glycogen, boosting leptin levels.", common_mistakes: ["Eating junk food (high fat/sugar) instead of complex carbs."] },
    "water cutting": { name: "Water Cutting", description: "Temporarily manipulating water and sodium to drop scale weight.", how_to: "Water load for 3 days, then cut water 12 hours before weigh-in.", best_for: "Fighters, powerlifters making weight classes.", common_mistakes: ["Doing this for aesthetic reasons—it's dangerous and temporary."] },
    "sodium manipulation": { name: "Sodium Manipulation", description: "Keeping sodium constant to prevent water weight fluctuations.", how_to: "Eat roughly the same amount of salt daily.", best_for: "Tracking scale weight accurately.", common_mistakes: ["Cutting sodium entirely, leading to flat muscles and cramps."] },
    "cardio stacking": { name: "Cardio Stacking", description: "Gradually adding cardio as weight loss stalls, rather than cutting more food.", how_to: "Start with 0 cardio. When weight stalls, add 2x20 mins. Stall again, add 3x20 mins.", best_for: "Maintaining metabolic rate.", common_mistakes: ["Doing 1 hour of cardio daily from Day 1."] }
  },
  bulking_strategies: {
    "lean bulk": { name: "Lean Bulk", description: "A small calorie surplus.", how_to: "Eat +200-300 calories over TDEE.", best_for: "Minimizing fat gain while building muscle.", common_mistakes: ["Impatience with slow scale movement."] },
    "dirty bulk": { name: "Dirty Bulk", description: "A massive calorie surplus.", how_to: "Eat +800-1000 calories over TDEE.", best_for: "Underweight beginners who struggle to eat.", common_mistakes: ["Gaining too much fat, making the inevitable cut miserable."] },
    "calorie surplus sizing": { name: "Calorie Surplus Sizing", description: "Adjusting surplus size based on experience level.", how_to: "Beginners: +500. Intermediates: +250. Advanced: +100.", best_for: "Aligning food intake with actual muscle growth potential.", common_mistakes: ["Advanced lifters trying to bulk like beginners."] },
    "progressive overload nutrition": { name: "Progressive Overload Nutrition", description: "Increasing food intake as body weight goes up.", how_to: "When scale stalls for 2 weeks on a bulk, add 150 calories.", best_for: "Sustaining a bulk for months.", common_mistakes: ["Eating the same calories even after gaining 5kg."] },
    "peri-workout nutrition": { name: "Peri-Workout Nutrition", description: "Concentrating carbs around the training window.", how_to: "Eat 40% of daily carbs pre-workout and 40% post-workout.", best_for: "Maximizing gym energy and recovery.", common_mistakes: ["Over-complicating it—total daily intake matters most."] },
    "muscle memory": { name: "Muscle Memory", description: "Regaining lost muscle is much faster than building new muscle.", how_to: "Eat at a slight surplus and train hard; muscle returns rapidly.", best_for: "People returning to the gym after a long break.", common_mistakes: ["Dirty bulking thinking the rapid weight gain is entirely new muscle."] }
  },
  nutrient_timing: {
    "pre-workout meal": { name: "Pre-Workout Meal", description: "Fueling the body for an intense session.", what_to_eat: "Complex carbs + moderate protein + low fat.", when: "1.5 to 2 hours before training.", why: "To top off glycogen stores without causing gastrointestinal distress.", foods: ["Oats and whey", "Chicken and rice", "Banana and peanut butter"] },
    "post-workout meal": { name: "Post-Workout Meal", description: "Kickstarting the recovery and muscle protein synthesis process.", what_to_eat: "Fast absorbing protein + simple carbs.", when: "Within 1-2 hours after training.", why: "To replenish glycogen and provide amino acids for repair.", foods: ["Whey protein and dextrose", "Eggs and toast", "Chicken and white rice"] },
    "pre-sleep nutrition": { name: "Pre-Sleep Nutrition", description: "Preventing overnight muscle breakdown.", what_to_eat: "Slow-digesting protein + healthy fats.", when: "30-60 mins before bed.", why: "To provide a trickle of amino acids while fasting overnight.", foods: ["Cottage cheese/Paneer", "Casein protein", "Greek yogurt"] },
    "morning nutrition": { name: "Morning Nutrition", description: "Breaking the overnight fast.", what_to_eat: "Protein + hydration.", when: "Upon waking.", why: "To halt catabolism and rehydrate.", foods: ["Water with salt/lemon", "Eggs", "Protein shake"] },
    "intra-workout": { name: "Intra-Workout", description: "Fueling during a session.", what_to_eat: "Fast digesting carbs + electrolytes.", when: "During workouts lasting longer than 90 minutes.", why: "To prevent glycogen depletion in marathon sessions.", foods: ["Gatorade", "Tang", "Electrolyte powder"] },
    "carb backloading": { name: "Carb Backloading", description: "Eating majority of daily carbs in the evening.", what_to_eat: "Carbs.", when: "Dinner / post-workout evening.", why: "Based on the theory that insulin sensitivity is higher post-workout, avoiding fat storage.", foods: ["Rice", "Potatoes", "Pasta"] }
  },
  lingo_map: {
    "bulk": "lean bulk",
    "cut": "calorie deficit",
    "if": "intermittent fasting",
    "keto": "ketogenic",
    "cheat meal": "refeed days",
    "gains": "muscle gain",
    "shred": "calorie deficit",
    "patla hona": "calorie deficit",
    "mota hona": "lean bulk",
    "shredded": "calorie deficit",
    "ripped": "calorie deficit",
    "maintenance": "maintenance phase",
    "iifym": "flexible dieting",
    "clean eating": "whole foods diet",
    "macros": "macronutrients",
    "protein powder": "whey protein",
    "pre": "pre-workout",
    "bcaa": "bcaas",
    "fish oil": "omega-3",
    "diet break": "diet breaks",
    "water cut": "water cutting",
    "dirty bulk": "dirty bulk",
    "lean bulk": "lean bulk",
    "recomp": "maintenance phase",
    "omad": "intermittent fasting",
    "fasting": "intermittent fasting",
    "lchf": "ketogenic",
    "low carb": "high protein low carb",
    "zig zag": "calorie cycling",
    "reverse diet": "reverse dieting",
    "starvation mode": "metabolic adaptation",
    "metabolism": "tdee",
    "tdee": "total daily energy expenditure",
    "bmr": "basal metabolic rate",
    "post workout": "post-workout meal",
    "pre workout food": "pre-workout meal",
    "anabolic window": "nutrient timing",
    "supps": "supplements",
    "vitamin d": "vitamin d3",
    "zma": "zinc and magnesium",
    "creatine": "creatine monohydrate",
    "whey": "whey protein",
    "casein": "casein protein",
    "mass gainer": "dirty bulk",
    "weight loss": "calorie deficit",
    "weight gain": "lean bulk"
  }
};

fs.writeFileSync(path.join(__dirname, '../lib/workout-data.json'), JSON.stringify(workoutData, null, 2));
fs.writeFileSync(path.join(__dirname, '../lib/diet-data.json'), JSON.stringify(dietData, null, 2));

console.log('Successfully generated workout-data.json and diet-data.json');
