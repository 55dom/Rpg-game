using System;

namespace Unwritten.Core.Input
{
    /// <summary>
    /// Remembers recent button presses for a short window so the player can press
    /// "next attack" slightly early and still have it come out. This is what makes
    /// combos feel responsive instead of requiring frame-perfect timing.
    ///
    /// Fixed-size ring buffer: no allocations after construction.
    /// </summary>
    public sealed class InputBuffer
    {
        public const int DefaultWindowFrames = 10;

        struct Entry
        {
            public InputIntent Intent;
            public long Frame;
            public bool Live;
        }

        readonly Entry[] _entries;
        int _next;

        /// <summary>How many logic frames a press stays valid.</summary>
        public int WindowFrames { get; set; }

        public InputBuffer(int capacity = 8, int windowFrames = DefaultWindowFrames)
        {
            if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
            if (windowFrames < 0) throw new ArgumentOutOfRangeException(nameof(windowFrames));
            _entries = new Entry[capacity];
            WindowFrames = windowFrames;
        }

        public int Capacity => _entries.Length;

        /// <summary>Record a press. When full, the oldest press is overwritten.</summary>
        public void Push(InputIntent intent, long frame)
        {
            if (intent == InputIntent.None) return;
            _entries[_next] = new Entry { Intent = intent, Frame = frame, Live = true };
            _next = (_next + 1) % _entries.Length;
        }

        /// <summary>
        /// Remove and return the oldest still-valid press whose intent is in <paramref name="allowed"/>.
        /// Expired presses are discarded as a side effect.
        /// </summary>
        public bool TryConsume(IntentMask allowed, long currentFrame, out InputIntent intent)
        {
            int best = -1;
            long bestFrame = long.MaxValue;

            for (int i = 0; i < _entries.Length; i++)
            {
                if (!_entries[i].Live) continue;

                if (IsExpired(_entries[i], currentFrame))
                {
                    _entries[i].Live = false;
                    continue;
                }

                if (allowed.Contains(_entries[i].Intent) && _entries[i].Frame < bestFrame)
                {
                    best = i;
                    bestFrame = _entries[i].Frame;
                }
            }

            if (best < 0)
            {
                intent = InputIntent.None;
                return false;
            }

            intent = _entries[best].Intent;
            _entries[best].Live = false;
            return true;
        }

        /// <summary>True if any still-valid press exists (for debugging displays).</summary>
        public bool HasLive(long currentFrame)
        {
            for (int i = 0; i < _entries.Length; i++)
                if (_entries[i].Live && !IsExpired(_entries[i], currentFrame)) return true;
            return false;
        }

        /// <summary>
        /// Copies still-valid presses (oldest first is not guaranteed) into <paramref name="destination"/>
        /// and returns how many were written. Used by the debug HUD; no allocations.
        /// </summary>
        public int CopyLive(long currentFrame, InputIntent[] destination)
        {
            int count = 0;
            for (int i = 0; i < _entries.Length && count < destination.Length; i++)
                if (_entries[i].Live && !IsExpired(_entries[i], currentFrame))
                    destination[count++] = _entries[i].Intent;
            return count;
        }

        /// <summary>
        /// Push every stored press forward in time. Called once per frame of hitstop so
        /// presses made during a freeze aren't lost when the freeze outlasts the window.
        /// </summary>
        public void Delay(int frames)
        {
            for (int i = 0; i < _entries.Length; i++)
                if (_entries[i].Live) _entries[i].Frame += frames;
        }

        public void Clear()
        {
            for (int i = 0; i < _entries.Length; i++) _entries[i].Live = false;
        }

        bool IsExpired(in Entry entry, long currentFrame)
        {
            return currentFrame - entry.Frame > WindowFrames;
        }
    }
}
