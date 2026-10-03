using System;
using System.Collections.Generic;
using UnityEngine;
using Unwritten.Core.Abilities;
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
            [Tooltip("Animator state, hitbox id, tag id, sound path... depending on the type.")]
            public string key;
            [Tooltip("Optional number: hitbox active frames, invulnerable frames, move distance...")]
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

        [Tooltip("Leave empty to use the asset name.")]
        [SerializeField] string id;

        [Header("Frame data (60 per second)")]
        [SerializeField, Min(0)] int startupFrames = 7;
        [SerializeField, Min(0)] int activeFrames = 3;
        [SerializeField, Min(0)] int recoveryFrames = 14;

        [Header("Cost")]
        [SerializeField, Min(0)] float manaCost;
        [SerializeField, Min(0)] int cooldownFrames;

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

            return new AbilityDefinition(Id, startupFrames, activeFrames, recoveryFrames,
                builtEvents, builtWindows, manaCost, cooldownFrames);
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
