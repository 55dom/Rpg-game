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
    /// <summary>Anything that can tell the combo graph the character's situation (grounded, after a dash...).</summary>
    public interface IMoveContextSource
    {
        MoveContext CurrentContext { get; }
    }

    /// <summary>
    /// Gives a character abilities: buffers input from <see cref="PlayerInputReader"/> (or AI),
    /// picks moves through a <see cref="ComboGraphData"/> moveset (or simple bindings),
    /// and runs them on the 60 Hz <see cref="LogicClock"/>.
    ///
    /// Handles PlayAnimation directly. Every other event is published through
    /// <see cref="AbilityEventFired"/> so hitboxes, movement, VFX, sound, and camera
    /// systems subscribe without changing this class.
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
        [Tooltip("Optional. Players have one; enemies are driven by their AI instead.")]
        [SerializeField] PlayerInputReader input;
        [Tooltip("Optional. Receives PlayAnimation events as CrossFade calls.")]
        [SerializeField] Animator animator;

        [Header("Moves")]
        [Tooltip("The character's combo graph. If set, the Bindings list below is ignored.")]
        [SerializeField] ComboGraphData moveset;
        [Tooltip("Simple one-button-one-move setup, used when no moveset is assigned.")]
        [SerializeField] List<Binding> bindings = new List<Binding>();

        [Header("Tuning")]
        [SerializeField, Min(0)] float maxMana = 100f;
        [SerializeField, Min(0)] float manaRegenPerSecond = 5f;
        [Tooltip("Mana gained each time one of this character's hits connects (melee feeds magic).")]
        [SerializeField, Min(0)] float manaPerHit = 4f;
        [SerializeField, Range(0, 30)] int inputBufferFrames = InputBuffer.DefaultWindowFrames;
        [SerializeField, Min(0)] float animationCrossFadeSeconds = 0.05f;

        [Header("Debug")]
        [SerializeField] bool logEvents;

        /// <summary>Everything the abilities do, for other systems to react to.</summary>
        public event Action<AbilityDefinition, AbilityEvent> AbilityEventFired;
        public event Action<AbilityDefinition> AbilityStarted;
        /// <summary>Raised when an ability finishes, is cancelled, or is interrupted.</summary>
        public event Action<AbilityDefinition> AbilityEnded;

        public AbilityController Controller { get; private set; }
        public AbilityRunner Runner => Controller?.Runner;
        public ResourcePool Mana => Controller?.Mana;
        public PlayerInputReader InputReader => input;
        public ComboGraph Graph { get; private set; }

        IMoveContextSource _contextSource;

        void Awake()
        {
            _contextSource = GetComponent<IMoveContextSource>();

            IAbilityResolver resolver = null;
            if (moveset != null)
            {
                try
                {
                    Graph = moveset.Build(ReadContext);
                    resolver = Graph;
                }
                catch (Exception ex)
                {
                    Debug.LogError($"[Abilities] {name}: moveset {moveset.name} is invalid: {ex.Message}", this);
                }
            }

            Controller = new AbilityController(
                new AbilityRunner(this),
                new InputBuffer(8, inputBufferFrames),
                new ResourcePool(maxMana),
                resolver);

            if (resolver == null)
            {
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
        }

        MoveContext ReadContext() => _contextSource != null ? _contextSource.CurrentContext : MoveContext.Grounded;

        void OnEnable()
        {
            if (input != null) input.IntentPressed += Press;
            LogicClock.Instance.Register(TickPhase.Abilities, OnLogicTick);
        }

        void OnDisable()
        {
            if (input != null) input.IntentPressed -= Press;
            LogicClock.UnregisterIfAlive(TickPhase.Abilities, OnLogicTick);
        }

        /// <summary>Buffer a press (from input, AI, or tests).</summary>
        public void Press(InputIntent intent) => Controller.Press(intent, LogicClock.Instance.Frame);

        /// <summary>Start an ability directly, bypassing input (AI, scripted moves).</summary>
        public StartResult StartDirect(AbilityDefinition ability) =>
            Controller.StartDirect(ability, InputIntent.Light, LogicClock.Instance.Frame);

        /// <summary>The current ability connected: open on-hit cancels, freeze for hitstop, refill a little mana.</summary>
        public void NotifyHit(int hitstopFrames)
        {
            Controller.Runner.NotifyHit(hitstopFrames);
            Controller.Mana.Add(manaPerHit);
        }

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
