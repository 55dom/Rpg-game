using System;
using System.Collections.Generic;
using UnityEngine;
using Unwritten.Core.Abilities;
using Unwritten.Core.Combat;
using Unwritten.Runtime.Abilities;
using Unwritten.Runtime.Characters;

namespace Unwritten.Runtime.Combat
{
    /// <summary>
    /// Makes a character a fighter: owns its <see cref="Combatant"/> (health, posture, defense
    /// timers) and connects its abilities to its body:
    /// <list type="bullet">
    /// <item>Invulnerable events → dodge invulnerability</item>
    /// <item>Move events → dashes (distance over the ability's active frames)</item>
    /// <item>Custom "jump" / "slam" events → jumps and air slams (Value = speed)</item>
    /// <item>Incoming hits → interrupt, hitstop freeze, knockback, launch</item>
    /// </list>
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class CombatantComponent : MonoBehaviour
    {
        static readonly List<CombatantComponent> s_all = new List<CombatantComponent>();

        /// <summary>Every active combatant (for targeting and lock-on).</summary>
        public static IReadOnlyList<CombatantComponent> All => s_all;

        [Header("Stats")]
        [SerializeField] Team team = Team.Enemy;
        [SerializeField, Min(1)] float maxHealth = 100f;
        [SerializeField, Min(1)] float maxPosture = 100f;
        [SerializeField, Min(0)] float postureRegenPerSecond = 30f;
        [SerializeField, Min(0)] int postureRegenDelayFrames = 90;
        [Tooltip("Takes damage but isn't interrupted by normal hits.")]
        [SerializeField] bool superArmor;

        [Header("References (found automatically if empty)")]
        [SerializeField] AbilityRunnerComponent abilities;
        [SerializeField] CharacterMotor motor;
        [Tooltip("Where hits are reported to land (chest height). Defaults to this transform + 1 m.")]
        [SerializeField] Transform hitPoint;

        public Combatant Core { get; private set; }
        public Team Team => team;
        public AbilityRunnerComponent Abilities => abilities;
        public CharacterMotor Motor => motor;
        public Vector3 HitPoint => hitPoint != null ? hitPoint.position : transform.position + Vector3.up;

        /// <summary>Raised on the defender for every resolved hit against it.</summary>
        public event Action<HitEvent> Damaged;
        /// <summary>Raised on the attacker when one of its hits resolves.</summary>
        public event Action<HitEvent> LandedHit;
        public event Action Died;

        bool _deathReported;

        void Awake()
        {
            if (abilities == null) abilities = GetComponent<AbilityRunnerComponent>();
            if (motor == null) motor = GetComponent<CharacterMotor>();
            Core = new Combatant(team, maxHealth, maxPosture)
            {
                SuperArmor = superArmor,
                PostureRegenDelayFrames = postureRegenDelayFrames,
                PostureRegenPerFrame = postureRegenPerSecond / 60f,
            };
        }

        void OnEnable()
        {
            s_all.Add(this);
            LogicClock.Instance.Register(TickPhase.Combatants, Tick);
            if (abilities != null) abilities.AbilityEventFired += OnAbilityEvent;
        }

        void OnDisable()
        {
            s_all.Remove(this);
            LogicClock.UnregisterIfAlive(TickPhase.Combatants, Tick);
            if (abilities != null) abilities.AbilityEventFired -= OnAbilityEvent;
        }

        void Tick(long frame)
        {
            Core.Tick();
            if (abilities != null && abilities.Controller != null) abilities.Controller.Locked = !Core.CanAct;
            if (Core.IsDead && !_deathReported)
            {
                _deathReported = true;
                if (abilities != null) abilities.Runner?.Interrupt();
                Died?.Invoke();
            }
        }

        void OnAbilityEvent(AbilityDefinition ability, AbilityEvent e)
        {
            switch (e.Type)
            {
                case AbilityEventType.Invulnerable:
                    Core.StartInvulnerability(Mathf.RoundToInt(e.Value));
                    break;
                case AbilityEventType.Move:
                    if (motor != null)
                    {
                        var dir = motor.HasMoveInput ? motor.LastMoveDirection : transform.forward;
                        motor.Dash(dir, e.Value, Mathf.Max(1, ability.ActiveFrames));
                    }
                    break;
                case AbilityEventType.Custom:
                    if (motor == null) break;
                    if (e.Key == "jump") motor.TryJump(e.Value);
                    else if (e.Key == "slam") motor.Slam(e.Value);
                    break;
            }
        }

        /// <summary>Called by the attacker's hitbox after resolving a hit against this combatant.</summary>
        internal void ApplyIncomingHit(in HitEvent hit)
        {
            var r = hit.Result;
            if (r.DefenderHitstop > 0 && motor != null) motor.Freeze(r.DefenderHitstop);

            if (r.Outcome == HitOutcome.Hit && (!Core.SuperArmor || r.DefenderPostureBroken))
            {
                if (abilities != null) abilities.Runner?.Interrupt();
                if (motor != null)
                {
                    motor.CancelDash();
                    var away = transform.position - hit.Attacker.transform.position;
                    motor.Knockback(away, hit.Spec.Knockback);
                    motor.Launch(hit.Spec.Launch);
                }
            }
            Damaged?.Invoke(hit);
        }

        /// <summary>Called on the attacker after one of its hits resolved.</summary>
        internal void ApplyOutgoingHit(in HitEvent hit)
        {
            var r = hit.Result;
            if (abilities != null)
            {
                if (r.Connected) abilities.NotifyHit(r.AttackerHitstop);
                if (r.AttackerPostureBroken) abilities.Runner?.Interrupt();
            }
            if (r.AttackerHitstop > 0 && motor != null) motor.Freeze(r.AttackerHitstop);
            LandedHit?.Invoke(hit);
        }

        /// <summary>Full heal and clear state (respawn, sandbox reset).</summary>
        public void ResetCombatant()
        {
            Core.Reset();
            _deathReported = false;
        }

        void OnValidate()
        {
            if (maxPosture < 1f) maxPosture = 1f;
        }
    }
}
