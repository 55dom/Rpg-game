using System;
using System.Collections.Generic;
using UnityEngine;
using Unwritten.Core.Abilities;
using Unwritten.Core.Combat;
using Unwritten.Core.Input;

namespace Unwritten.Runtime.Abilities
{
    /// <summary>
    /// Designer-editable ability asset (Create > Unwritten > Ability).
    /// Light attacks, spells, dodges, and enemy attacks are all one of these.
    /// At runtime it is converted once into an immutable <see cref="AbilityDefinition"/>.
    ///
    /// Frame numbers are logic frames at 60 per second (frame 0 = the frame the ability starts).
    /// </summary>
    [CreateAssetMenu(menuName = "Unwritten/Ability", fileName = "ABL_NewAbility")]
    public sealed class AbilityData : ScriptableObject
    {
        [Serializable]
        public struct EventEntry
        {
            [Min(0)] public int frame;
            public AbilityEventType type;
            [Tooltip("Animator state, hitbox id, tag id, sound path... depending on the type.\nMove: unused. Custom 'jump': jump.")]
            public string key;
            [Tooltip("SpawnHitbox: active frames. Invulnerable: frames. Move: distance in metres. Custom 'jump': upward speed.")]
            public float value;
        }

        [Serializable]
        public struct CancelEntry
        {
            [Min(0)] public int startFrame;
            [Min(0)] public int endFrame;
            public IntentMask into;
            [Tooltip("Only opens after this ability has hit something.")]
            public bool requiresHit;
        }

        [Serializable]
        public struct HitEntry
        {
            [Min(0)] public float damage;
            [Min(0)] public float postureDamage;
            [Tooltip("Freeze frames on impact. Light 3–4, heavy 6, finisher 10, ultimate 18.")]
            [Min(0)] public int hitstopFrames;
            [Tooltip("Frames the target can't act after being hit.")]
            [Min(0)] public int hitstunFrames;
            [Tooltip("The red-glint attack: can't be blocked or parried.")]
            public bool unblockable;
            [Tooltip("Upward speed (m/s) for launchers. 0 = none.")]
            [Min(0)] public float launch;
            [Tooltip("Push away from the attacker (m/s).")]
            [Min(0)] public float knockback;
        }

        [Tooltip("Leave empty to use the asset name.")]
        [SerializeField] string id;

        [Header("Frame data (60 per second)")]
        [SerializeField, Min(0)] int startupFrames = 7;
        [SerializeField, Min(0)] int activeFrames = 3;
        [SerializeField, Min(0)] int recoveryFrames = 14;

        [Header("Cost")]
        [SerializeField, Min(0)] float manaCost;
        [SerializeField, Min(0)] int cooldownFrames;

        [Header("On hit (leave damage at 0 for non-attacks)")]
        [SerializeField] HitEntry hit = new HitEntry { hitstopFrames = 4, hitstunFrames = 18 };

        [Header("Timeline")]
        [SerializeField] List<EventEntry> events = new List<EventEntry>();
        [SerializeField] List<CancelEntry> cancelWindows = new List<CancelEntry>();

        AbilityDefinition _definition;

        public string Id => string.IsNullOrWhiteSpace(id) ? name : id;
        public int TotalFrames => startupFrames + activeFrames + recoveryFrames;

        /// <summary>The validated runtime definition. Throws if the data is invalid.</summary>
        public AbilityDefinition Definition => _definition ??= Build();

        AbilityDefinition Build()
        {
            var builtEvents = new List<AbilityEvent>(events.Count);
            foreach (var e in events)
                builtEvents.Add(new AbilityEvent(e.frame, e.type, e.key, e.value));

            var builtWindows = new List<CancelWindow>(cancelWindows.Count);
            foreach (var w in cancelWindows)
                builtWindows.Add(new CancelWindow(w.startFrame, w.endFrame, w.into, w.requiresHit));

            var hitSpec = new HitSpec(hit.damage, hit.postureDamage, hit.hitstopFrames, hit.hitstunFrames,
                hit.unblockable, hit.launch, hit.knockback);

            return new AbilityDefinition(Id, startupFrames, activeFrames, recoveryFrames,
                builtEvents, builtWindows, manaCost, cooldownFrames, hitSpec);
        }

        void OnEnable() => _definition = null;

        // Edits in the inspector rebuild the definition and report mistakes immediately.
        void OnValidate()
        {
            _definition = null;
            try
            {
                Build();
            }
            catch (Exception ex)
            {
                Debug.LogError($"[AbilityData] {name}: {ex.Message}", this);
            }
        }
    }
}
