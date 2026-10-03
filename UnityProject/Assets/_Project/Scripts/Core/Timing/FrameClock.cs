using System;

namespace Unwritten.Core.Timing
{
    /// <summary>
    /// Fixed-rate logic clock. Combat runs at exactly 60 logic frames per second,
    /// independent of the render frame rate, so a 30 fps phone and a 144 Hz PC
    /// play identical frame data.
    ///
    /// Call <see cref="Advance"/> once per rendered frame with the real elapsed time;
    /// it returns how many logic ticks to run this frame.
    /// </summary>
    public sealed class FrameClock
    {
        public const int TicksPerSecond = 60;
        public const double SecondsPerTick = 1.0 / TicksPerSecond;

        /// <summary>
        /// Safety cap: after a long hitch (loading, app resume) we run at most this many
        /// ticks in one rendered frame and drop the rest, instead of spiralling.
        /// </summary>
        public int MaxTicksPerAdvance { get; set; } = 5;

        /// <summary>Total logic frames elapsed since the clock was created.</summary>
        public long Frame { get; private set; }

        double _accumulator;

        public int Advance(double deltaSeconds)
        {
            if (deltaSeconds < 0) throw new ArgumentOutOfRangeException(nameof(deltaSeconds));

            _accumulator += deltaSeconds;
            int ticks = 0;

            // Small epsilon so 1/60 + 1/60 doesn't miss a tick to floating-point error.
            const double epsilon = 1e-9;
            while (_accumulator + epsilon >= SecondsPerTick && ticks < MaxTicksPerAdvance)
            {
                _accumulator -= SecondsPerTick;
                Frame++;
                ticks++;
            }

            if (ticks == MaxTicksPerAdvance && _accumulator > SecondsPerTick)
                _accumulator = 0; // drop the backlog after a hitch

            if (_accumulator < 0) _accumulator = 0;
            return ticks;
        }

        /// <summary>Interpolation factor between the last two logic frames (0..1), for smooth rendering.</summary>
        public float Alpha => (float)(_accumulator / SecondsPerTick);
    }
}
