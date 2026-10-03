using System;
using System.Collections.Generic;
using Unwritten.Core.Combat;
using Unwritten.Core.Input;

namespace Unwritten.Core.Abilities
{
    public enum AbilityPhase
    {
        Idle = 0,
        /// <summary>Wind-up before anything can hit.</summary>
        Startup = 1,
        /// <summary>Frames where the move can hit.</summary>
        Active = 2,
        /// <summary>Wind-down; most moves can be cancelled during part of it.</summary>
        Recovery = 3,
    }

    /// <summary>
    /// Everything about one move or spell: its frame data, cost, and the timed events it fires.
    /// Light attacks, spells, dodges, enemy attacks, and ultimates are all abilities.
    ///
    /// Immutable after construction and validated, so bad data fails loudly at load time
    /// instead of misbehaving in combat. In Unity this is built from an AbilityData asset.
    /// </summary>
    public sealed class AbilityDefinition
    {
        public string Id { get; }
        public int StartupFrames { get; }
        public int ActiveFrames { get; }
        public int RecoveryFrames { get; }
        public int TotalFrames => StartupFrames + ActiveFrames + RecoveryFrames;

        public float ManaCost { get; }
        public int CooldownFrames { get; }

        /// <summary>What this ability's hitboxes do on contact. <see cref="HitSpec.None"/> for non-attacks.</summary>
        public HitSpec Hit { get; }

        /// <summary>Sorted by frame.</summary>
        public IReadOnlyList<AbilityEvent> Events => _events;

        public IReadOnlyList<CancelWindow> CancelWindows => _cancelWindows;

        readonly AbilityEvent[] _events;
        readonly CancelWindow[] _cancelWindows;

        public AbilityDefinition(
            string id,
            int startupFrames,
            int activeFrames,
            int recoveryFrames,
            IEnumerable<AbilityEvent> events = null,
            IEnumerable<CancelWindow> cancelWindows = null,
            float manaCost = 0f,
            int cooldownFrames = 0,
            HitSpec hit = default)
        {
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Ability id is required.", nameof(id));
            if (startupFrames < 0) throw new ArgumentOutOfRangeException(nameof(startupFrames), $"{id}: startup frames can't be negative.");
            if (activeFrames < 0) throw new ArgumentOutOfRangeException(nameof(activeFrames), $"{id}: active frames can't be negative.");
            if (recoveryFrames < 0) throw new ArgumentOutOfRangeException(nameof(recoveryFrames), $"{id}: recovery frames can't be negative.");
            if (startupFrames + activeFrames + recoveryFrames <= 0) throw new ArgumentException($"{id}: an ability must last at least one frame.");
            if (manaCost < 0f) throw new ArgumentOutOfRangeException(nameof(manaCost), $"{id}: mana cost can't be negative.");
            if (cooldownFrames < 0) throw new ArgumentOutOfRangeException(nameof(cooldownFrames), $"{id}: cooldown can't be negative.");

            Id = id;
            StartupFrames = startupFrames;
            ActiveFrames = activeFrames;
            RecoveryFrames = recoveryFrames;
            ManaCost = manaCost;
            CooldownFrames = cooldownFrames;
            if (hit.Damage < 0f || hit.PostureDamage < 0f || hit.HitstopFrames < 0 || hit.HitstunFrames < 0)
                throw new ArgumentOutOfRangeException(nameof(hit), $"{id}: hit values can't be negative.");
            Hit = hit;

            var eventList = events != null ? new List<AbilityEvent>(events) : new List<AbilityEvent>();
            foreach (var e in eventList)
            {
                if (e.Frame < 0 || e.Frame >= TotalFrames)
                    throw new ArgumentOutOfRangeException(nameof(events), $"{id}: event {e} is outside frames 0..{TotalFrames - 1}.");
            }
            // Stable sort by frame: events on the same frame keep their authored order.
            _events = StableSortByFrame(eventList);

            var windowList = cancelWindows != null ? new List<CancelWindow>(cancelWindows) : new List<CancelWindow>();
            foreach (var w in windowList)
            {
                if (w.StartFrame < 0 || w.EndFrame < w.StartFrame || w.EndFrame >= TotalFrames)
                    throw new ArgumentOutOfRangeException(nameof(cancelWindows),
                        $"{id}: cancel window {w.StartFrame}-{w.EndFrame} must lie within frames 0..{TotalFrames - 1}.");
                if (w.Into == IntentMask.None)
                    throw new ArgumentException($"{id}: cancel window {w.StartFrame}-{w.EndFrame} allows nothing.", nameof(cancelWindows));
            }
            _cancelWindows = windowList.ToArray();
        }

        /// <summary>Which phase a given frame (0-based, relative to the start) belongs to.</summary>
        public AbilityPhase PhaseAt(int frame)
        {
            if (frame < 0 || frame >= TotalFrames) return AbilityPhase.Idle;
            if (frame < StartupFrames) return AbilityPhase.Startup;
            if (frame < StartupFrames + ActiveFrames) return AbilityPhase.Active;
            return AbilityPhase.Recovery;
        }

        /// <summary>True if, on this frame, the ability can be interrupted by this input.</summary>
        public bool CanCancel(int frame, InputIntent intent, bool hasHit)
        {
            for (int i = 0; i < _cancelWindows.Length; i++)
                if (_cancelWindows[i].Allows(frame, intent, hasHit)) return true;
            return false;
        }

        /// <summary>Every intent that could cancel this ability on this frame (for the input buffer).</summary>
        public IntentMask CancellableInto(int frame, bool hasHit)
        {
            IntentMask mask = IntentMask.None;
            for (int i = 0; i < _cancelWindows.Length; i++)
            {
                var w = _cancelWindows[i];
                if (frame >= w.StartFrame && frame <= w.EndFrame && (!w.RequiresHit || hasHit))
                    mask |= w.Into;
            }
            return mask;
        }

        public override string ToString() => $"{Id} ({StartupFrames}/{ActiveFrames}/{RecoveryFrames})";

        static AbilityEvent[] StableSortByFrame(List<AbilityEvent> list)
        {
            var result = list.ToArray();
            // Insertion sort: stable, and event lists are short.
            for (int i = 1; i < result.Length; i++)
            {
                var item = result[i];
                int j = i - 1;
                while (j >= 0 && result[j].Frame > item.Frame)
                {
                    result[j + 1] = result[j];
                    j--;
                }
                result[j + 1] = item;
            }
            return result;
        }
    }
}
