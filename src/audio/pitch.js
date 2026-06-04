// Real-time monophonic pitch detection (pitchy + Web Audio).
// Works in Safari on iPhone/iPad: AudioContext must be created/resumed inside a
// user gesture (the caller wires start() to a button tap), HTTPS is required
// (GitHub Pages is HTTPS), and we disable processing that muddies a guitar note.
import { PitchDetector } from 'pitchy';

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function describe(freq, clarity, rms) {
  const midiFloat = 12 * Math.log2(freq / 440) + 69;
  const midi = Math.round(midiFloat);
  const cents = Math.round((midiFloat - midi) * 100);
  const pc = ((midi % 12) + 12) % 12;
  return {
    freq,
    clarity,
    rms,
    midi,
    cents,
    pc,
    note: NOTE_NAMES[pc],
    octave: Math.floor(midi / 12) - 1,
  };
}

/**
 * createPitchListener({ onUpdate, onError })
 *   onUpdate(info | null) — info as in describe(), or null when silent/unclear.
 * Returns { start(): Promise<boolean>, stop(), get running() }.
 */
export function createPitchListener({
  onUpdate,
  onError,
  minClarity = 0.9,
  minRms = 0.01,
} = {}) {
  let audioCtx = null;
  let analyser = null;
  let stream = null;
  let detector = null;
  let buf = null;
  let raf = null;
  let running = false;

  function loop() {
    if (!running) return;
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    const [freq, clarity] = detector.findPitch(buf, audioCtx.sampleRate);
    if (freq > 0 && clarity >= minClarity && rms >= minRms) {
      onUpdate && onUpdate(describe(freq, clarity, rms));
    } else {
      onUpdate && onUpdate(null);
    }
    raf = requestAnimationFrame(loop);
  }

  async function start() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
      await audioCtx.resume(); // required on iOS Safari
      const source = audioCtx.createMediaStreamSource(stream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096; // better resolution for low guitar strings (~82 Hz)
      source.connect(analyser);
      detector = PitchDetector.forFloat32Array(analyser.fftSize);
      buf = new Float32Array(analyser.fftSize);
      running = true;
      loop();
      return true;
    } catch (err) {
      onError && onError(err);
      return false;
    }
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (audioCtx) audioCtx.close();
    audioCtx = analyser = stream = detector = buf = null;
  }

  return { start, stop, get running() { return running; } };
}
