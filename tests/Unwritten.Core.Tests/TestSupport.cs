using System.Collections.Generic;
using Unwritten.Core.Abilities;
using Unwritten.Core.Input;

namespace Unwritten.Core.Tests
{
    /// <summary>Records everything an ability runner reports, as readable strings.</summary>
    sealed class RecordingSink : IAbilityEventSink
    {
        public readonly List<string> Log = new List<string>();

        public void OnAbilityStarted(AbilityDefinition ability) => Log.Add($"start {ability.Id}");
        public void OnAbilityEvent(AbilityDefinition ability, in AbilityEvent e) => Log.Add($"event {ability.Id} {e.Frame} {e.Type} {e.Key}");
        public void OnAbilityFinished(AbilityDefinition ability) => Log.Add($"finish {ability.Id}");
        public void OnAbilityCancelled(AbilityDefinition ability, InputIntent into) => Log.Add($"cancel {ability.Id} into {into}");
        public void OnAbilityInterrupted(AbilityDefinition ability) => Log.Add($"interrupt {ability.Id}");
    }

    static class Abilities
    {
        /// <summary>A light attack: 7/3/14, cancellable into Light, Dodge or a spell on frames 12–23.</summary>
        public static AbilityDefinition Light(string id = "Light1") => new AbilityDefinition(
            id, 7, 3, 14,
            new[]
            {
                new AbilityEvent(0, AbilityEventType.PlayAnimation, "Slash1"),
                new AbilityEvent(7, AbilityEventType.SpawnHitbox, "Blade", 3),
            },
            new[] { new CancelWindow(12, 23, IntentMask.Light | IntentMask.Dodge | IntentMask.AnySpell) });

        public static AbilityDefinition Dodge() => new AbilityDefinition(
            "Dodge", 0, 12, 18,
            new[] { new AbilityEvent(0, AbilityEventType.Invulnerable, null, 12) });

        public static AbilityDefinition GaleCutter() => new AbilityDefinition(
            "GaleCutter", 10, 6, 18,
            new[] { new AbilityEvent(10, AbilityEventType.SpawnHitbox, "Cutter", 6) },
            new[] { new CancelWindow(16, 33, IntentMask.Jump, requiresHit: true) },
            manaCost: 15f);
    }
}
