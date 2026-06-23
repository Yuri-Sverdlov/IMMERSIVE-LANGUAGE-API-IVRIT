/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Audio Playback Worklet Processor for playing PCM audio
 */

class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.audioQueue = [];
    this.playbackRate = 1.0;
    this.readIndex = 0.0;  // Fractional read position in current buffer

    this.port.onmessage = (event) => {
      if (event.data === "interrupt") {
        // Clear the queue and reset read index on interrupt
        this.audioQueue = [];
        this.readIndex = 0.0;
      } else if (event.data instanceof Float32Array) {
        // Add audio data to the queue
        this.audioQueue.push(event.data);
      } else if (event.data && event.data.type === "setPlaybackRate") {
        // Set playback rate
        this.playbackRate = event.data.rate;
      }
    };
  }

  process(inputs, outputs, parameters) {
    const output = outputs[0];
    if (output.length === 0) return true;

    const channel = output[0];
    let outputIndex = 0;

    // Fill the output buffer from the queue with variable playback rate
    while (outputIndex < channel.length && this.audioQueue.length > 0) {
      const currentBuffer = this.audioQueue[0];

      if (!currentBuffer || currentBuffer.length === 0) {
        this.audioQueue.shift();
        this.readIndex = 0.0;
        continue;
      }

      // Read sample at fractional position with linear interpolation
      const floorIndex = Math.floor(this.readIndex);
      const fraction = this.readIndex - floorIndex;

      if (floorIndex >= currentBuffer.length - 1) {
        // End of current buffer, move to next
        this.audioQueue.shift();
        this.readIndex = 0.0;
        continue;
      }

      // Linear interpolation between samples
      const sample0 = currentBuffer[floorIndex];
      const sample1 = currentBuffer[floorIndex + 1];
      const interpolatedSample = sample0 + (sample1 - sample0) * fraction;

      channel[outputIndex++] = interpolatedSample;

      // Advance read index by playback rate
      this.readIndex += this.playbackRate;
    }

    // Fill remaining output with silence
    while (outputIndex < channel.length) {
      channel[outputIndex++] = 0;
    }

    return true;
  }
}

registerProcessor("pcm-processor", PCMProcessor);
