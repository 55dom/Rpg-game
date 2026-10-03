using System;
using System.Collections.Generic;
using UnityEngine;
using Unwritten.Core.Abilities;
using Unwritten.Core.Input;
using Unwritten.Core.Stats;
using Unwritten.Core.Timing;
using Unwritten.Runtime.Controls;

namespace Unwritten.Runtime.Abilities
{
    /// <summary>
    /// Gives a character abilities: buffers input from <see cref="PlayerInputReader"/>,
    /// starts the bound <see cref="AbilityData"/> assets, and runs them on the 60 Hz
    /// <see cref="LogicClock"/>.
    ///
    /// Phase 1 handles PlayAnimation directly. Every other event is published through
    /// <see cref="AbilityEventFired"/>, so hitboxes, VFX, sound, and camera systems
    /// (Phase 1, Step 2+) can subscribe without changing this class.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class AbilityRunnerComponent : MonoBehaviour, IAbilityEventSink
    {
        [Serializable]
        public struct Binding
        {
            public InputIntent intent;
            public AbilityData ability;
        }

        [Header("References")]
        [Tooltip("Optional. Without it, abilities can still be triggered from code via Press().")]
        [SerializeField] PlayerInputReader input;
        [Tooltip("Optional. Receives PlayAnimation events as CrossFade calls.")]
        [SerializeField] Animator animator;

        [Header("Abilities")]
        [SerializeField] List<Binding> bindings = new List<Binding>();

        [Header("Tuning")]
        [SerializeField, Min(0)] float maxMana = 100f;
        [SerializeField, Min(0)] float manaRegenPerSecond = 5f;
        [SerializeField, Range(0, 30)] int inputBufferFrames = InputBuffer.DefaultWindowFrames;
        [SerializeField, Min(0)] float animationCrossFadeSeconds = 0.05f;

        [Header("Debug")]
        [SerializeField] bool logEvents = true;

        /// <summary>Everything the abilities do, for other systems to react to.</summary>
        public event Action<AbilityDefinition, AbilityEvent> AbilityEventFired;
        public event Action<AbilityDefinition> AbilityStarted;
        public event Action<AbilityDefinition> AbilityEnded;

        public AbilityController Controller { get; private set; }
        public AbilityRunner Runner => Controller?.Runner;
        public ResourcePool Mana => Controller?.Mana;
        public PlayerInputReader InputReader => input;

        void Awake()
        {
            Controller = new AbilityController(
                new AbilityRunner(this),
                new InputBuffer(8, inputBufferFrames),
                new ResourcePool(maxMana));

            foreach (var binding in bindings)
            {
                if (binding.ability == null || binding.intent == InputIntent.None) continue;
                try
                {
                    Controller.Bind(binding.intent, binding.ability.Definition);
                }
                catch (Exception ex)
                {
                    Debug.LogError($"[Abilities] {name}: couldn't bind {binding.intent} to {binding.ability.name}: {ex.Message}", this);
                }
            }
        }

        void OnEnable()
        {
            if (input != null) input.IntentPressed += Press;
            LogicClock.Instance.Ticked += OnLogicTick;
        }

        void OnDisable()
        {
            if (input != null) input.IntentPressed -= Press;
            // During shutdown the clock may already be gone; don't recreate it.
            if (LogicClock.HasInstance) LogicClock.Instance.Ticked -= OnLogicTick;
        }

        /// <summary>Buffer a press (from input, AI, or tests).</summary>
        public void Press(InputIntent intent) => Controller.Press(intent, LogicClock.Instance.Frame);

        /// <summary>Report that the current ability connected (Step 2: called by the hit system).</summary>
        public void NotifyHit(int hitstopFrames) => Controller.Runner.NotifyHit(hitstopFrames);

        void OnLogicTick(long frame)
        {
            Controller.Mana.Add(manaRegenPerSecond / FrameClock.TicksPerSecond);
            Controller.Tick(frame);
        }

        // ---- IAbilityEventSink ----

        public void OnAbilityStarted(AbilityDefinition ability)
        {
            if (logEvents) Debug.Log($"[Abilities] {name} start {ability.Id} @{LogicClock.Instance.Frame}", this);
            AbilityStarted?.Invoke(ability);
        }

        public void OnAbilityEvent(AbilityDefinition ability, in AbilityEvent abilityEvent)
        {
            if (abilityEvent.Type == AbilityEventType.PlayAnimation && animator != null && !string.IsNullOrEmpty(abilityEvent.Key))
                animator.CrossFadeInFixedTime(abilityEvent.Key, animationCrossFadeSeconds);

            if (logEvents) Debug.Log($"[Abilities] {name} {ability.Id} {abilityEvent}", this);
            AbilityEventFired?.Invoke(ability, abilityEvent);
        }

        public void OnAbilityFinished(AbilityDefinition ability)
        {
            if (logEvents) Debug.Log($"[Abilities] {name} finish {ability.Id}", this);
            AbilityEnded?.Invoke(ability);
        }

        public void OnAbilityCancelled(AbilityDefinition ability, InputIntent into)
        {
            if (logEvents) Debug.Log($"[Abilities] {name} cancel {ability.Id} into {into}", this);
            AbilityEnded?.Invoke(ability);
        }

        public void OnAbilityInterrupted(AbilityDefinition ability)
        {
            if (logEvents) Debug.Log($"[Abilities] {name} interrupt {ability.Id}", this);
            AbilityEnded?.Invoke(ability);
        }
    }
}
