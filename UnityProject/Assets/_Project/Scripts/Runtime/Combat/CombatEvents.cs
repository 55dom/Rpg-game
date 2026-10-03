using System;
using UnityEngine;
using Unwritten.Core.Combat;

namespace Unwritten.Runtime.Combat
{
    /// <summary>Everything about one resolved hit, for feedback systems (camera, VFX, sound, UI).</summary>
    public readonly struct HitEvent
    {
        public readonly CombatantComponent Attacker;
        public readonly CombatantComponent Defender;
        public readonly HitResult Result;
        public readonly HitSpec Spec;
        public readonly Vector3 Point;

        public HitEvent(CombatantComponent attacker, CombatantComponent defender, HitResult result, HitSpec spec, Vector3 point)
        {
            Attacker = attacker;
            Defender = defender;
            Result = result;
            Spec = spec;
            Point = point;
        }
    }

    /// <summary>Scene-wide combat notifications. Feedback systems subscribe; combat code never calls them directly.</summary>
    public static class CombatEvents
    {
        public static event Action<HitEvent> HitResolved;

        public static void RaiseHit(in HitEvent e) => HitResolved?.Invoke(e);

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics() => HitResolved = null;
    }
}
