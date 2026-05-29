import Memory from "../models/memory.model.js";

export const applyMemoryDecay = async () => {
  try {
    // STEP 1: Load all memory documents
    const memories = await Memory.find();

    console.log(`📚 Processing ${memories.length} memories for decay...`);

    const millisecondsPerDay = 24 * 60 * 60 * 1000;
    let totalDecay = 0;
    let weakMemoriesCount = 0;

    // STEP 2-6: For each memory, apply decay
    for (const memory of memories) {
      // STEP 2: Calculate daysSinceReview
      const daysSinceReview =
        (new Date().getTime() - memory.lastReviewed.getTime()) / millisecondsPerDay;

      // STEP 3: Apply decay formula
      const decayFactor = Math.pow(0.98, daysSinceReview);
      const newStrength = memory.strength * decayFactor;

      // STEP 4: Clamp strength between 0 and 1
      memory.strength = Math.max(0, Math.min(1, newStrength));

      // Track total decay for averaging
      totalDecay += memory.strength - newStrength;

      // STEP 5: If strength falls below 0.4, reduce reviewInterval
      if (memory.strength < 0.4) {
        weakMemoriesCount += 1;
        memory.reviewInterval = Math.max(1, memory.reviewInterval * 0.7);
      }

      // STEP 6: Save updated memory
      await memory.save();
    }

    // STEP 7: Console logs
    const averageDecay =
      memories.length > 0 ? (totalDecay / memories.length).toFixed(3) : 0;

    console.log(`✅ Memories processed: ${memories.length}`);
    console.log(`📉 Average decay: ${averageDecay}`);
    console.log(`⚠️ Weak memories generated: ${weakMemoriesCount}`);

    return {
      processed: memories.length,
      averageDecay,
      weakMemories: weakMemoriesCount,
    };
  } catch (error) {
    console.error("❌ Error in applyMemoryDecay:", error.message);
    throw error;
  }
};
