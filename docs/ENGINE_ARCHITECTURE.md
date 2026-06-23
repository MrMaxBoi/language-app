Kokoro Engine Architecture

Core Models

The adaptive engine maintains multiple learner-state models.

Skill Model

Represents learner understanding of a specific skill.

Examples:

* Particle は
* Particle に
* Present Tense Verbs
* Transportation Vocabulary

Tracks:

* mastery
* attempts
* accuracy
* confidence

⸻

Memory Model

Represents how likely a learner is to remember a skill.

Tracks:

* memory strength
* forgetting curves
* review urgency
* last reviewed date

A learner may have high mastery but low memory strength, indicating that review is required.

⸻

KnowledgeCoverage Model

Tracks how much of the curriculum has been exposed to the learner.

Coverage answers:

“Has this concept actually been taught yet?”

Coverage prevents the engine from assuming a learner is weak at a concept they have never studied.

⸻

QuestionExposure Model

Tracks question-level exposure.

Used to:

* reduce excessive repetition
* improve diversity
* avoid question monopolization
* improve exploration

⸻

Question Selection Pipeline

Question selection considers:

* weak skill mastery
* memory decay
* due reviews
* coverage gaps
* exposure penalties
* recent mistakes
* persona weighting
* softmax sampling

Questions are ranked and sampled rather than selected deterministically.

⸻

Current Adaptive Features

Implemented:

* mastery tracking
* memory tracking
* coverage tracking
* exposure tracking
* adaptive recommendations
* probabilistic selection
* dashboard analytics
* stress testing framework

Current calibration focus:

* overlap optimization
* persona differentiation
* reinforcement quality
* recommendation effectiveness