using System;
using Unwritten.Core.Abilities;
using Unwritten.Core.AI;
using Xunit;

namespace Unwritten.Core.Tests
{
    public class AttackTokenTests
    {
        [Fact]
        public void OnlyCapacityEnemiesHoldTokens()
        {
            var pool = new AttackTokenPool(2);
            Assert.True(pool.TryAcquire(1, 0));
            Assert.True(pool.TryAcquire(2, 0));
            Assert.False(pool.TryAcquire(3, 0));
            Assert.True(pool.TryAcquire(1, 0)); // already holding
            pool.Release(1);
            Assert.True(pool.TryAcquire(3, 0));
        }

        [Fact]
        public void TokensExpire()
        {
            var pool = new AttackTokenPool(1) { MaxHoldFrames = 60 };
            pool.TryAcquire(1, 0);
            Assert.False(pool.TryAcquire(2, 30));
            Assert.True(pool.TryAcquire(2, 61));
            Assert.False(pool.Holds(1));
        }
    }

    public class EnemyBrainTests
    {
        static readonly AbilityDefinition Swing = new AbilityDefinition("Swing", 12, 4, 20);
        static readonly AbilityDefinition Lunge = new AbilityDefinition("Lunge", 16, 6, 24);

        static EnemyBrain Acolyte(int id, AttackTokenPool pool) => new EnemyBrain(id, pool, new[]
        {
            new AttackOption(Swing, 0f, 2.5f, weight: 3f, cooldownFrames: 30),
            new AttackOption(Lunge, 3f, 6f, weight: 1f, cooldownFrames: 90),
        }, new Random(7));

        static EnemyPerception See(float distance, long frame = 0, bool running = false) =>
            new EnemyPerception { Frame = frame, HasTarget = true, DistanceToTarget = distance, AbilityRunning = running };

        [Fact]
        public void IgnoresTargetsOutsideAggroRange()
        {
            var brain = Acolyte(1, new AttackTokenPool());
            var cmd = brain.Think(See(30f));
            Assert.Equal(EnemyMove.Hold, cmd.Move);
            Assert.Equal(EnemyState.Idle, brain.State);
        }

        [Fact]
        public void ApproachesWhenNothingIsInRange()
        {
            var brain = Acolyte(1, new AttackTokenPool());
            var cmd = brain.Think(See(9f));
            Assert.Equal(EnemyMove.Approach, cmd.Move);
            Assert.Null(cmd.Attack);
        }

        [Fact]
        public void AttacksWhenInRangeWithAToken()
        {
            var pool = new AttackTokenPool();
            var brain = Acolyte(1, pool);
            var cmd = brain.Think(See(2f));
            Assert.Same(Swing, cmd.Attack.Ability);
            Assert.True(pool.Holds(1));
            Assert.Equal(EnemyState.Attacking, brain.State);
        }

        [Fact]
        public void CirclesWithoutAToken()
        {
            var pool = new AttackTokenPool(1);
            pool.TryAcquire(99, 0);
            var brain = Acolyte(1, pool);
            var cmd = brain.Think(See(2f));
            Assert.Equal(EnemyMove.Circle, cmd.Move);
            Assert.Null(cmd.Attack);
        }

        [Fact]
        public void RecoversThenReleasesTheToken()
        {
            var pool = new AttackTokenPool(1);
            var brain = Acolyte(1, pool);
            brain.RecoverFrames = 5;
            brain.Think(See(2f, 0));
            brain.Think(See(2f, 1, running: true));
            for (long f = 2; f < 6; f++) brain.Think(See(2f, f));
            Assert.Equal(EnemyState.Recover, brain.State);
            Assert.True(pool.Holds(1));
            var cmd = brain.Think(See(2f, 6));
            // Recovery over: token released; Swing is still cooling down, so it strafes.
            Assert.False(pool.Holds(1));
            Assert.Equal(EnemyState.Circle, brain.State);
            Assert.Equal(EnemyMove.Circle, cmd.Move);
        }

        [Fact]
        public void CooldownMakesItCircleInsteadOfRepeating()
        {
            var pool = new AttackTokenPool(1);
            var brain = new EnemyBrain(1, pool, new[] { new AttackOption(Swing, 0f, 2.5f, cooldownFrames: 100) }, new Random(1));
            brain.RecoverFrames = 1;
            Assert.NotNull(brain.Think(See(2f, 0)).Attack);
            brain.Think(See(2f, 1, running: true));
            brain.Think(See(2f, 2));
            var cmd = brain.Think(See(2f, 3));
            Assert.Null(cmd.Attack);
            Assert.Equal(EnemyMove.Circle, cmd.Move);
        }

        [Fact]
        public void StaggerAndDeathReleaseTheToken()
        {
            var pool = new AttackTokenPool(1);
            var brain = Acolyte(1, pool);
            brain.Think(See(2f));
            Assert.True(pool.Holds(1));
            var stagger = See(2f); stagger.IsStaggered = true;
            brain.Think(stagger);
            Assert.False(pool.Holds(1));
            Assert.Equal(EnemyState.Staggered, brain.State);

            var dead = See(2f); dead.IsDead = true;
            brain.Think(dead);
            Assert.Equal(EnemyState.Dead, brain.State);
        }

        [Fact]
        public void ThreeEnemiesOnlyTwoAttackAtOnce()
        {
            var pool = new AttackTokenPool(2);
            var a = Acolyte(1, pool); var b = Acolyte(2, pool); var c = Acolyte(3, pool);
            int attacking = 0;
            foreach (var brain in new[] { a, b, c })
                if (brain.Think(See(2f)).Attack != null) attacking++;
            Assert.Equal(2, attacking);
        }
    }
}
