using System;
using System.Collections.Generic;
using Unwritten.Core.Input;
using Unwritten.Core.Stats;

namespace Unwritten.Core.Abilities
{
    public enum StartResult
    {
        Started = 0,
        /// <summary>Another ability is running and can't be cancelled into this input right now.</summary>
        Busy = 1,
        NotEnoughMana = 2,
        OnCooldown = 3,
    }

    /// <summary>
    /// Plays one ability at a time, frame by frame, firing its events on the right
    /// frames and enforcing frame data, cancel windows, costs, cooldowns, and hitstop.
    ///
    /// Owned by one character. Driven by <see cref="Tick"/> once per logic frame.
    /// Contains no Unity code, so it is unit-tested outside the engine.
    /// </summary>
    public sealed class AbilityRunner
    {
        readonly IAbilityEventSink _sink;
        readonly Dictionary<string, long> _cooldownReadyAt = new Dictionary<string, long>();

        int _eventCursor;

        /// <summary>The ability currently playing, or null when idle.</summary>
        public AbilityDefinition Current { get; private set; }

        /// <summary>Frame within the current ability (0 = first frame). Meaningless when idle.</summary>
        public int Frame { get; private set; }

        /// <summary>Remaining hitstop (freeze) frames.</summary>
        public int Hitstop { get; private set; }

        /// <summary>True once the current ability has hit something (opens on-hit cancels).</summary>
        public bool HasHit { get; private set; }

        public bool IsRunning => Current != null;
        public bool InHitstop => Hitstop > 0;
        public AbilityPhase Phase => Current == null ? AbilityPhase.Idle : Current.PhaseAt(Frame);

        public AbilityRunner(IAbilityEventSink sink)
        {
            _sink = sink ?? throw new ArgumentNullException(nameof(sink));
        }

        /// <summary>Could this input start a new ability right now (idle, or inside a matching cancel window)?</summary>
        public bool CanAccept(InputIntent intent)
        {
            if (Current == null) return true;
            if (InHitstop) return false;
            return Current.CanCancel(Frame, intent, HasHit);
        }

        /// <summary>Every input that could start something right now. Idle means everything.</summary>
        public IntentMask AcceptedIntents()
        {
            if (Current == null) return IntentMask.All;
            if (InHitstop) return IntentMask.None;
            return Current.CancellableInto(Frame, HasHit);
        }

        public bool IsOnCooldown(AbilityDefinition ability, long clockFrame)
        {
            return _cooldownReadyAt.TryGetValue(ability.Id, out long readyAt) && clockFrame < readyAt;
        }

        /// <summary>
        /// Try to start an ability triggered by <paramref name="intent"/>. If another ability
        /// is running, it is cancelled only if its current cancel window allows this intent.
        /// Mana is spent only when the ability actually starts. The new ability's frame-0
        /// events fire on the next <see cref="Tick"/>.
        /// </summary>
        public StartResult TryStart(AbilityDefinition ability, InputIntent intent, long clockFrame, ResourcePool mana = null)
        {
            if (ability == null) throw new ArgumentNullException(nameof(ability));

            if (!CanAccept(intent)) return StartResult.Busy;
            if (IsOnCooldown(ability, clockFrame)) return StartResult.OnCooldown;
            if (ability.ManaCost > 0f && (mana == null || !mana.CanAfford(ability.ManaCost))) return StartResult.NotEnoughMana;

            if (Current != null)
            {
                var cancelled = Current;
                ResetState();
                _sink.OnAbilityCancelled(cancelled, intent);
            }

            if (ability.ManaCost > 0f) mana.TrySpend(ability.ManaCost);
            if (ability.CooldownFrames > 0) _cooldownReadyAt[ability.Id] = clockFrame + ability.CooldownFrames;

            Current = ability;
            Frame = 0;
            _eventCursor = 0;
            HasHit = false;
            _sink.OnAbilityStarted(ability);
            return StartResult.Started;
        }

        /// <summary>
        /// Advance one logic frame: fire this frame's events, then move to the next frame.
        /// During hitstop the ability is frozen and nothing happens.
        /// </summary>
        public void Tick()
        {
            if (Hitstop > 0)
            {
                Hitstop--;
                return;
            }

            if (Current == null) return;

            var playing = Current;
            var events = playing.Events;
            while (_eventCursor < events.Count && events[_eventCursor].Frame == Frame)
            {
                var e = events[_eventCursor];
                _eventCursor++;
                _sink.OnAbilityEvent(playing, in e);

                // An event handler may have interrupted or replaced the ability.
                // Stop here; a replacement starts properly on the next tick.
                if (Current != playing) return;
            }

            Frame++;
            if (Frame >= Current.TotalFrames)
            {
                var finished = Current;
                ResetState();
                _sink.OnAbilityFinished(finished);
            }
        }

        /// <summary>
        /// Report that the current ability connected. Opens on-hit cancel windows and
        /// freezes the ability for <paramref name="hitstopFrames"/> (the "impact" pause).
        /// </summary>
        public void NotifyHit(int hitstopFrames)
        {
            if (Current == null) return;
            HasHit = true;
            if (hitstopFrames > Hitstop) Hitstop = hitstopFrames;
        }

        /// <summary>Stop the current ability immediately (stagger, death, cutscene).</summary>
        public void Interrupt()
        {
            if (Current == null) return;
            var interrupted = Current;
            ResetState();
            Hitstop = 0;
            _sink.OnAbilityInterrupted(interrupted);
        }

        public void ClearCooldowns() => _cooldownReadyAt.Clear();

        void ResetState()
        {
            Current = null;
            Frame = 0;
            _eventCursor = 0;
            HasHit = false;
        }
    }
}
