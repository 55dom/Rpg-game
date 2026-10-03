using System;
using UnityEngine;
using Unwritten.Core.Timing;

namespace Unwritten.Runtime
{
    /// <summary>
    /// The scene's single 60 Hz combat clock. Every combat system subscribes to
    /// <see cref="Ticked"/> so all characters advance in lockstep, regardless of
    /// render frame rate (60, 30 on mobile, or 144).
    ///
    /// Created automatically the first time anything asks for <see cref="Instance"/>.
    /// </summary>
    [DefaultExecutionOrder(-1000)]
    public sealed class LogicClock : MonoBehaviour
    {
        static LogicClock _instance;

        readonly FrameClock _clock = new FrameClock();

        /// <summary>Raised once per logic frame with that frame's number.</summary>
        public event Action<long> Ticked;

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
                Ticked?.Invoke(Frame);
            }
        }

        void OnDestroy()
        {
            if (_instance == this) _instance = null;
        }
    }
}
