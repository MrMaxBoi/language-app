import Memory from "../models/memory.model.js";

export const updateMemoryAfterAttempt = async ({
  userId,
  topic,
  subtopic,
  isCorrect,
}) => {
  try {
    // STEP 1: Find existing memory document
    let memory = await Memory.findOne({
      userId,
      topic,
      subtopic,
    });

    // STEP 2: If not found, create new memory
    if (!memory) {
      memory = new Memory({
        userId,
        topic,
        subtopic,
        strength: isCorrect ? 0.7 : 0.2,
        reviewInterval: isCorrect ? 3 : 1,
        lastReviewed: new Date(),
        totalReviews: 1,
        successfulReviews: isCorrect ? 1 : 0,
      });
    } else {
      // STEP 3: If found, update based on correctness

      if (isCorrect) {
        // Increase strength by 0.1
        memory.strength += 0.1;
        // Increase interval by 1.8x
        memory.reviewInterval = memory.reviewInterval * 1.8;
      } else {
        // Reduce strength by 0.2
        memory.strength -= 0.2;
        // Reset interval to 1
        memory.reviewInterval = 1;
      }

      // STEP 4: Clamp strength between 0 and 1
      memory.strength = Math.max(0, Math.min(1, memory.strength));

      // Update tracking fields
      memory.lastReviewed = new Date();
      memory.totalReviews += 1;
      if (isCorrect) {
        memory.successfulReviews += 1;
      }
    }

    // STEP 5: Calculate nextReviewDate
    const reviewDateMs = new Date().getTime() + memory.reviewInterval * 24 * 60 * 60 * 1000;
    memory.nextReviewDate = new Date(reviewDateMs);

    // STEP 6: Save memory document
    await memory.save();

    return memory;
  } catch (error) {
    console.error("❌ Error updating memory:", error.message);
    throw error;
  }
};
