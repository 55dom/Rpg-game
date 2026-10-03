using System;
using System.Collections.Generic;
using UnityEngine;
using Unwritten.Core.Timing;

namespace Unwritten.Runtime
{
    /// <summary>
    /// Order in which combat systems run inside one logic frame. Lower runs first.
    /// A fixed order makes combat deterministic: the same inputs always give the same result.
    /// </summary>
    public enum TickPhase
    {
        /// <summary>AI decisions (they behave like input).</summary>
        Brains = 0,
        /// <summary>Input buffer → abilities; ability events fire here.</summary>
        Abilities = 1,
        /// <summary>Active hitboxes test for overlaps and resolve hits.</summary>
        Hitboxes = 2,
        /// <summary>Combat timers: invulnerability, parry window, stagger, posture regen.</summary>
        Combatants = 3,
        /// <summary>Character movement and physics.</summary>
        Movement = 4,
        /// <summary>Anything reacting to the finished frame (feedback, UI).</summary>
        Late = 5,
    }

    /// <summary>
    /// The scene's single 60 Hz combat clock. Systems register a handler for a
    /// <see cref="TickPhase"/>; every logic frame the clock calls all phases in order,
    /// regardless of render frame rate (60, 30 on mobile, or 144).
    ///
    /// Created automatically the first time anything asks for <see cref="Instance"/>.
    /// </summary>
    [DefaultExecutionOrder(-1000)]
    public sealed class LogicClock : MonoBehaviour
    {
        const int PhaseCount = 6;

        static LogicClock _instance;

        readonly FrameClock _clock = new FrameClock();
        readonly List<Action<long>>[] _phases = CreatePhases();
        readonly List<Action<long>> _snapshot = new List<Action<long>>(32);

        /// <summary>The logic frame being processed (or most recently processed).</summary>
        public long Frame { get; private set; }

        /// <summary>Interpolation between logic frames, for smooth visuals.</summary>
        public float Alpha => _clock.Alpha;

        /// <summary>Scales combat time (e.g. the Afterimage slow-motion). 1 = normal.</summary>
        public float TimeScale { get; set; } = 1f;

        public static bool HasInstance => _instance != null;

        public static LogicClock Instance
        {
            get
            {
                if (_instance == null)
                {
                    var go = new GameObject("[LogicClock]");
                    _instance = go.AddComponent<LogicClock>();
                    DontDestroyOnLoad(go);
                }
                return _instance;
            }
        }

        // Supports "Enter Play Mode Options" with domain reload disabled.
        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics() => _instance = null;

        static List<Action<long>>[] CreatePhases()
        {
            var phases = new List<Action<long>>[PhaseCount];
            for (int i = 0; i < PhaseCount; i++) phases[i] = new List<Action<long>>(8);
            return phases;
        }

        public void Register(TickPhase phase, Action<long> handler)
        {
            if (handler == null) return;
            var list = _phases[(int)phase];
            if (!list.Contains(handler)) list.Add(handler);
        }

        public void Unregister(TickPhase phase, Action<long> handler)
        {
            _phases[(int)phase].Remove(handler);
        }

        /// <summary>Safe to call during shutdown: does nothing if the clock is already gone.</summary>
        public static void UnregisterIfAlive(TickPhase phase, Action<long> handler)
        {
            if (_instance != null) _instance.Unregister(phase, handler);
        }

        void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
                return;
            }
            _instance = this;
        }

        void Update()
        {
            // Scaled delta time: pausing the game (Time.timeScale = 0) pauses combat too.
            int ticks = _clock.Advance(Time.deltaTime * TimeScale);
            long first = _clock.Frame - ticks + 1;
            for (int i = 0; i < ticks; i++)
            {
                Frame = first + i;
                for (int p = 0; p < PhaseCount; p++) RunPhase(_phases[p]);
            }
        }

        void RunPhase(List<Action<long>> handlers)
        {
            if (handlers.Count == 0) return;
            // Copy first: handlers may register/unregister (spawns, deaths) while running.
            _snapshot.Clear();
            _snapshot.AddRange(handlers);
            for (int i = 0; i < _snapshot.Count; i++) _snapshot[i](Frame);
        }

        void OnDestroy()
        {
            if (_instance == this) _instance = null;
        }
    }
}
