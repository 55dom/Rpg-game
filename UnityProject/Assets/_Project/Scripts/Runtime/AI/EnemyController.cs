using System;
using System.Collections.Generic;
using UnityEngine;
using Unwritten.Core.Abilities;
using Unwritten.Core.AI;
using Unwritten.Core.Combat;
using Unwritten.Runtime.Abilities;
using Unwritten.Runtime.Characters;
using Unwritten.Runtime.Combat;

namespace Unwritten.Runtime.AI
{
    /// <summary>
    /// Drives a basic enemy with the shared <see cref="EnemyBrain"/>: approach, wait for an
    /// attack token while circling, attack, recover. Enemies differ only by their attack list
    /// (data) and stats, so a new enemy type needs no new code.
    /// </summary>
    [RequireComponent(typeof(CharacterMotor))]
    [RequireComponent(typeof(CombatantComponent))]
    [RequireComponent(typeof(AbilityRunnerComponent))]
    public sealed class EnemyController : MonoBehaviour
    {
        [Serializable]
        public struct Attack
        {
            public AbilityData ability;
            [Min(0)] public float minRange;
            [Min(0)] public float maxRange;
            [Min(0.01f)] public float weight;
            [Min(0)] public int cooldownFrames;
        }

        [SerializeField] List<Attack> attacks = new List<Attack>();
        [SerializeField, Min(0)] float aggroRange = 14f;
        [Tooltip("Speed multiplier while strafing around the target waiting for a token.")]
        [SerializeField, Range(0, 1)] float circleSpeed = 0.45f;
        [Tooltip("Preferred distance while circling.")]
        [SerializeField, Min(0)] float circleDistance = 3.5f;
        [SerializeField, Min(0)] int recoverFrames = 24;
        [Tooltip("Who to fight. If empty, the nearest combatant on another team.")]
        [SerializeField] CombatantComponent target;

        static int s_nextId;

        CharacterMotor _motor;
        CombatantComponent _self;
        AbilityRunnerComponent _abilities;
        EnemyBrain _brain;
        float _circleSign = 1f;

        public EnemyBrain Brain => _brain;

        void Awake()
        {
            _motor = GetComponent<CharacterMotor>();
            _self = GetComponent<CombatantComponent>();
            _abilities = GetComponent<AbilityRunnerComponent>();

            var options = new List<AttackOption>();
            foreach (var a in attacks)
            {
                if (a.ability == null) continue;
                try
                {
                    options.Add(new AttackOption(a.ability.Definition, a.minRange, Mathf.Max(a.minRange, a.maxRange), Mathf.Max(0.01f, a.weight), a.cooldownFrames));
                }
                catch (Exception ex)
                {
                    Debug.LogError($"[Enemy] {name}: attack {a.ability.name} is invalid: {ex.Message}", this);
                }
            }

            if (options.Count == 0)
            {
                Debug.LogError($"[Enemy] {name} has no valid attacks and will stand still.", this);
                enabled = false;
                return;
            }

            _brain = new EnemyBrain(s_nextId++, AttackTokenService.Pool, options, new System.Random(GetInstanceID()))
            {
                AggroRange = aggroRange,
                RecoverFrames = recoverFrames,
            };
            _circleSign = (GetInstanceID() & 1) == 0 ? 1f : -1f;
            _motor.FaceMoveDirection = false; // enemies keep facing their target while strafing
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics() => s_nextId = 0;

        void OnEnable() => LogicClock.Instance.Register(TickPhase.Brains, Think);
        void OnDisable() => LogicClock.UnregisterIfAlive(TickPhase.Brains, Think);

        void Think(long frame)
        {
            if (target == null || target.Core.IsDead) target = FindTarget();

            var core = _self.Core;
            float distance = target != null ? FlatDistance(target.transform.position) : float.MaxValue;
            var perception = new EnemyPerception
            {
                Frame = frame,
                HasTarget = target != null,
                DistanceToTarget = distance,
                IsStaggered = core.IsStaggered,
                IsDead = core.IsDead,
                AbilityRunning = _abilities.Runner.IsRunning,
            };

            var command = _brain.Think(perception);
            _motor.MovementLocked = _abilities.Runner.IsRunning || !core.CanAct;

            if (target != null && core.CanAct && !_abilities.Runner.IsRunning)
                _motor.FaceTowards(target.transform.position, instant: false);

            _motor.SetMoveInput(core.CanAct ? Steer(command.Move, distance) : Vector3.zero);

            if (command.Attack != null)
            {
                if (target != null) _motor.FaceTowards(target.transform.position);
                if (_abilities.StartDirect(command.Attack.Ability) != StartResult.Started) _brain.AttackFailed();
            }
        }

        Vector3 Steer(EnemyMove move, float distance)
        {
            if (target == null) return Vector3.zero;
            var to = target.transform.position - transform.position;
            to.y = 0f;
            var toward = to.sqrMagnitude > 0.0001f ? to.normalized : transform.forward;
            switch (move)
            {
                case EnemyMove.Approach:
                    return toward;
                case EnemyMove.Retreat:
                    return -toward * 0.6f;
                case EnemyMove.Circle:
                {
                    var side = Vector3.Cross(Vector3.up, toward) * _circleSign;
                    float correction = Mathf.Clamp((distance - circleDistance) * 0.5f, -1f, 1f);
                    return (side + toward * correction).normalized * circleSpeed;
                }
                default:
                    return Vector3.zero;
            }
        }

        CombatantComponent FindTarget()
        {
            CombatantComponent best = null;
            float bestDistance = aggroRange;
            var all = CombatantComponent.All;
            for (int i = 0; i < all.Count; i++)
            {
                var c = all[i];
                if (c == _self || c.Team == _self.Team || c.Team == Team.Neutral || c.Core.IsDead) continue;
                float d = FlatDistance(c.transform.position);
                if (d < bestDistance) { best = c; bestDistance = d; }
            }
            return best;
        }

        float FlatDistance(Vector3 point)
        {
            var d = point - transform.position;
            d.y = 0f;
            return d.magnitude;
        }
    }
}
