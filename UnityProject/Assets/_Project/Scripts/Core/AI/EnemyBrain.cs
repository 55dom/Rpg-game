using System;
using System.Collections.Generic;
using Unwritten.Core.Abilities;

namespace Unwritten.Core.AI
{
    public enum EnemyState
    {
        Idle = 0,
        Approach = 1,
        /// <summary>In range but waiting for an attack token: strafe around the target.</summary>
        Circle = 2,
        Attacking = 3,
        Recover = 4,
        Staggered = 5,
        Dead = 6,
    }

    public enum EnemyMove
    {
        Hold = 0,
        Approach = 1,
        Circle = 2,
        Retreat = 3,
    }

    /// <summary>One attack an enemy may choose, with its usable range and how often to pick it.</summary>
    public sealed class AttackOption
    {
        public AbilityDefinition Ability { get; }
        public float MinRange { get; }
        public float MaxRange { get; }
        public float Weight { get; }
        public int CooldownFrames { get; }

        internal long ReadyAt;

        public AttackOption(AbilityDefinition ability, float minRange, float maxRange, float weight = 1f, int cooldownFrames = 0)
        {
            Ability = ability ?? throw new ArgumentNullException(nameof(ability));
            if (minRange < 0f || maxRange < minRange) throw new ArgumentOutOfRangeException(nameof(maxRange), $"{ability.Id}: invalid range {minRange}–{maxRange}.");
            if (weight <= 0f) throw new ArgumentOutOfRangeException(nameof(weight));
            MinRange = minRange;
            MaxRange = maxRange;
            Weight = weight;
            CooldownFrames = Math.Max(0, cooldownFrames);
        }

        public bool InRange(float distance) => distance >= MinRange && distance <= MaxRange;
        public bool Ready(long frame) => frame >= ReadyAt;
    }

    /// <summary>What the brain sees this frame (filled in by the Unity layer).</summary>
    public struct EnemyPerception
    {
        public long Frame;
        public bool HasTarget;
        public float DistanceToTarget;
        public bool IsStaggered;
        public bool IsDead;
        /// <summary>The enemy's ability runner is busy (an attack is playing).</summary>
        public bool AbilityRunning;
    }

    /// <summary>What the brain wants this frame.</summary>
    public readonly struct EnemyCommand
    {
        public readonly EnemyMove Move;
        /// <summary>Non-null on the frame the brain decides to attack.</summary>
        public readonly AttackOption Attack;

        public EnemyCommand(EnemyMove move, AttackOption attack = null)
        {
            Move = move;
            Attack = attack;
        }
    }

    /// <summary>
    /// A small finite-state machine plus weighted attack choice, shared by all basic enemies.
    /// Different enemies differ only in data (their attack options and ranges), not code.
    /// Engine-independent: the Unity side feeds <see cref="EnemyPerception"/> in and carries out
    /// the returned <see cref="EnemyCommand"/>.
    /// </summary>
    public sealed class EnemyBrain
    {
        readonly int _id;
        readonly AttackTokenPool _tokens;
        readonly List<AttackOption> _options;
        readonly Random _random;

        int _recoverFramesLeft;

        public EnemyState State { get; private set; } = EnemyState.Idle;

        /// <summary>Beyond this distance the enemy ignores the target.</summary>
        public float AggroRange { get; set; } = 14f;

        /// <summary>Frames spent recovering (and keeping the token) after an attack ends.</summary>
        public int RecoverFrames { get; set; } = 24;

        /// <summary>Last chosen attack (for debug display).</summary>
        public AttackOption LastAttack { get; private set; }

        public bool HoldsToken => _tokens.Holds(_id);

        public EnemyBrain(int id, AttackTokenPool tokens, IEnumerable<AttackOption> options, Random random = null)
        {
            if (id < 0) throw new ArgumentOutOfRangeException(nameof(id));
            _id = id;
            _tokens = tokens ?? throw new ArgumentNullException(nameof(tokens));
            _options = new List<AttackOption>(options ?? throw new ArgumentNullException(nameof(options)));
            if (_options.Count == 0) throw new ArgumentException("An enemy needs at least one attack.", nameof(options));
            _random = random ?? new Random();
        }

        public EnemyCommand Think(in EnemyPerception p)
        {
            if (p.IsDead)
            {
                Enter(EnemyState.Dead);
                _tokens.Release(_id);
                return new EnemyCommand(EnemyMove.Hold);
            }

            if (p.IsStaggered)
            {
                Enter(EnemyState.Staggered);
                _tokens.Release(_id);
                return new EnemyCommand(EnemyMove.Hold);
            }

            if (p.AbilityRunning)
            {
                // Still swinging (or got here from a scripted move).
                Enter(EnemyState.Attacking);
                return new EnemyCommand(EnemyMove.Hold);
            }

            if (State == EnemyState.Attacking)
            {
                // The attack just finished.
                Enter(EnemyState.Recover);
                _recoverFramesLeft = RecoverFrames;
            }

            if (State == EnemyState.Recover)
            {
                if (--_recoverFramesLeft > 0) return new EnemyCommand(EnemyMove.Hold);
                _tokens.Release(_id);
                Enter(EnemyState.Idle);
            }

            if (State == EnemyState.Staggered) Enter(EnemyState.Idle);

            if (!p.HasTarget || p.DistanceToTarget > AggroRange)
            {
                _tokens.Release(_id);
                Enter(EnemyState.Idle);
                return new EnemyCommand(EnemyMove.Hold);
            }

            var choice = PickAttack(p.DistanceToTarget, p.Frame);
            if (choice == null)
            {
                if (AnyInRange(p.DistanceToTarget))
                {
                    // In range, but every usable attack is cooling down: strafe and wait.
                    Enter(EnemyState.Circle);
                    return new EnemyCommand(EnemyMove.Circle);
                }
                bool tooClose = IsTooCloseForEverything(p.DistanceToTarget);
                Enter(tooClose ? EnemyState.Circle : EnemyState.Approach);
                return new EnemyCommand(tooClose ? EnemyMove.Retreat : EnemyMove.Approach);
            }

            if (!_tokens.TryAcquire(_id, p.Frame))
            {
                Enter(EnemyState.Circle);
                return new EnemyCommand(EnemyMove.Circle);
            }

            choice.ReadyAt = p.Frame + choice.CooldownFrames;
            LastAttack = choice;
            Enter(EnemyState.Attacking);
            return new EnemyCommand(EnemyMove.Hold, choice);
        }

        /// <summary>The Unity side couldn't start the chosen attack (e.g. interrupted): give the token back.</summary>
        public void AttackFailed()
        {
            _tokens.Release(_id);
            Enter(EnemyState.Idle);
        }

        AttackOption PickAttack(float distance, long frame)
        {
            float total = 0f;
            for (int i = 0; i < _options.Count; i++)
                if (_options[i].InRange(distance) && _options[i].Ready(frame)) total += _options[i].Weight;
            if (total <= 0f) return null;

            double roll = _random.NextDouble() * total;
            for (int i = 0; i < _options.Count; i++)
            {
                var o = _options[i];
                if (!o.InRange(distance) || !o.Ready(frame)) continue;
                roll -= o.Weight;
                if (roll <= 0) return o;
            }
            return null; // floating-point edge; try again next frame
        }

        bool AnyInRange(float distance)
        {
            for (int i = 0; i < _options.Count; i++)
                if (_options[i].InRange(distance)) return true;
            return false;
        }

        bool IsTooCloseForEverything(float distance)
        {
            for (int i = 0; i < _options.Count; i++)
                if (distance >= _options[i].MinRange) return false;
            return true;
        }

        void Enter(EnemyState state) => State = state;
    }
}
