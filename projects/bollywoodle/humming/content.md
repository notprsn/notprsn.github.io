# The Humming Algorithm

> Black Box 1: how Musicle turns vocals into that humming hint without giving the song away.

---

## The Problem

We needed something that:

1. sounds like the melody without giving the melody away
2. isn't just the raw vocals, because that would be cheating
3. still sounds good, which turned out to be the hardest part

---

## How It Works

```text
┌─────────────────────────────────────────────────────────────┐
│                       INPUT: vocals.mp3                     │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   BASIC PITCH (MIDI Extraction)             │
│     Converts audio → MIDI notes with pitch + timing         │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    1. SCALE DETECTION                       │
│   • Count pitch-class durations                             │
│   • Pick notes that appear more than 2% of the time         │
│   • Keeps the note set anchored to the song                 │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    2. SNAP TO SCALE                         │
│   • Each note → nearest note in the detected scale          │
│   • Preserves octave, fixes off-key artifacts               │
│   • Result: cleaner, more musical output                    │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│               3. FLETCHER-MUNSON LOUDNESS                   │
│   • Human ears hear high frequencies as louder              │
│   • We compensate by reducing velocity for high notes       │
│   • E4 is the reference, with a 6x drop per octave above    │
│   • Result: steadier perceived loudness across pitches      │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    4. GAP FILLING                           │
│   • Gaps ≤ 0.5s → smooth pitch glide (portamento)           │
│   • Uses micro-steps of 30ms for smooth transition          │
│   • Larger gaps stay silent to preserve phrasing            │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   5. VELOCITY FADE-IN                       │
│   • Notes after silence get a gentle attack                 │
│   • 4 steps over 80ms: 10% → 40% → 70% → 100%               │
│   • Removes the harsh synthetic on-off feel                 │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    6. SYNTHESIS                             │
│   • MIDI → sine wave at each note's frequency               │
│   • Envelope ramps smooth the attack and release            │
│   • Everything is mixed into one audio file                 │
└──────────────────────────────┬──────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   OUTPUT: humming.mp3                       │
│          (Later mixed with drums, bass, and others)         │
└─────────────────────────────────────────────────────────────┘
```

---

## The Math-y Bits

### Scale Detection

```python
# For each pitch class (C, C#, D, etc.):
duration_ratio = time_at_this_pitch / total_duration
if duration_ratio >= 0.02:  # 2% threshold
    add_to_scale(pitch_class)
```

### Fletcher-Munson Correction

```python
if note <= E4 (64):
    # Boost low notes: 1.5x → 1.0x
    correction = 1.5 - 0.5 * (note - E2) / (E4 - E2)
else:
    # Reduce high notes exponentially
    # 6x reduction per octave above E4
    correction = 6 ** (-(note - E4) / 12)
```

### Smooth Glide

```python
# 30ms micro-steps with 15ms overlap
for step in range(num_steps):
    pitch = lerp(start_pitch, end_pitch, step / num_steps)
    add_note(pitch, duration=30ms + 15ms)  # overlap
```

---

## The Result

Before: choppy, off-key, harsh synthetic sound

After: smooth, musical humming that hints at the melody without spoiling it

---

*Last updated: December 23, 2024*
