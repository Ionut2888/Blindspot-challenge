const { getNextEvent, processEvent, getQueueSize } = require('./eventService');

const PROCESS_INTERVAL = 3000; // Process queue every 3 seconds
const BATCH_SIZE = 10; // Process up to 10 events per batch

let processorInterval = null;
let isPaused = false;

async function processBatch() {
  // Skip processing if paused
  if (isPaused) {
    return;
  }

  const queueSize = getQueueSize();
  
  if (queueSize === 0) {
    return;
  }

  console.log(`\n[PROCESSOR] Processing queue (${queueSize} events pending)...`);
  
  let processedCount = 0;
  const maxEvents = Math.min(BATCH_SIZE, queueSize);

  for (let i = 0; i < maxEvents; i++) {
    const event = getNextEvent();
    if (event) {
      try {
        await processEvent(event);
        processedCount++;
      } catch (error) {
        console.error('[PROCESSOR] Error processing event:', error);
      }
    }
  }

  if (processedCount > 0) {
    console.log(`[PROCESSOR] Batch complete: ${processedCount} events processed\n`);
  }
}


function startQueueProcessor() {
  if (processorInterval) {
    console.log('[PROCESSOR] Queue processor already running');
    return;
  }

  // Process on start
  processBatch();

  // Then process at regular intervals
  processorInterval = setInterval(processBatch, PROCESS_INTERVAL);
  
  console.log(`[PROCESSOR] Queue processor started (interval: ${PROCESS_INTERVAL}ms, batch size: ${BATCH_SIZE})`);
}


function stopQueueProcessor() {
  if (processorInterval) {
    clearInterval(processorInterval);
    processorInterval = null;
    console.log('[PROCESSOR] Queue processor stopped');
  }
}

/**
 * Pause queue processing (without stopping the interval)
 */
function pauseQueueProcessor() {
  if (!isPaused) {
    isPaused = true;
    console.log('[PROCESSOR] Queue processor paused');
    return true;
  }
  return false;
}

/**
 * Resume queue processing
 */
async function resumeQueueProcessor() {
  if (isPaused) {
    isPaused = false;
    console.log('[PROCESSOR] Queue processor resumed');
    // Process immediately on resume
    await processBatch();
    return true;
  }
  return false;
}

/**
 * Get processor status
 */
function getProcessorStatus() {
  return {
    running: processorInterval !== null,
    paused: isPaused,
    interval: PROCESS_INTERVAL,
    batchSize: BATCH_SIZE
  };
}

module.exports = {
  startQueueProcessor,
  stopQueueProcessor,
  pauseQueueProcessor,
  resumeQueueProcessor,
  getProcessorStatus,
  processBatch
};
