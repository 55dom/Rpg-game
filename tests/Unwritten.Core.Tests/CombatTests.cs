using Unwritten.Core.Combat;
using Xunit;

namespace Unwritten.Core.Tests
{
    public class CombatResolverTests
    {
        static Combatant Player() => new Combatant(Team.Player, 100, 100);
        static Combatant Enemy() => new Combatant(Team.Enemy, 100, 60);
        static readonly HitSpec Slash = new HitSpec(damage: 20, postureDamage: 25, hitstopFrames: 4, hitstunFrames: 18);

        [Fact]
        public void CleanHitDealsDamageAndHitstun()
        {
            var a = Player(); var d = Enemy();
            var r = CombatResolver.Resolve(a, d, Slash);
            Assert.Equal(HitOutcome.Hit, r.Outcome);
            Assert.Equal(80f, d.Health.Current);
            Assert.Equal(35f, d.Posture.Current);
            Assert.True(d.IsStaggered);
            Assert.Equal(4, r.AttackerHitstop);
            Assert.True(r.Connected);
        }

        [Fact]
        public void SameTeamIsIgnored()
        {
            var r = CombatResolver.Resolve(Player(), Player(), Slash);
            Assert.Equal(HitOutcome.Ignored, r.Outcome);
        }

        [Fact]
        public void DodgeAvoidsTheHitAndEarlyDodgeIsPerfect()
        {
            var d = Player();
            d.StartInvulnerability(12);
            Assert.Equal(HitOutcome.PerfectDodge, CombatResolver.Resolve(Enemy(), d, Slash).Outcome);
            for (int i = 0; i < 8; i++) d.Tick();
            Assert.Equal(HitOutcome.Dodged, CombatResolver.Resolve(Enemy(), d, Slash).Outcome);
            for (int i = 0; i < 4; i++) d.Tick();
            Assert.Equal(HitOutcome.Hit, CombatResolver.Resolve(Enemy(), d, Slash).Outcome);
        }

        [Fact]
        public void BlockTakesChipDamageOnly()
        {
            var d = Player(); d.Blocking = true;
            var r = CombatResolver.Resolve(Enemy(), d, Slash);
            Assert.Equal(HitOutcome.Blocked, r.Outcome);
            Assert.Equal(96f, d.Health.Current);
            Assert.False(d.IsStaggered);
            Assert.Equal(2, r.AttackerHitstop);
        }

        [Fact]
        public void UnblockableIgnoresBlockAndParry()
        {
            var d = Player(); d.Blocking = true; d.StartParry();
            var red = new HitSpec(30, 10, unblockable: true);
            Assert.Equal(HitOutcome.Hit, CombatResolver.Resolve(Enemy(), d, red).Outcome);
            Assert.Equal(70f, d.Health.Current);
        }

        [Fact]
        public void ParryHurtsTheAttackersPosture()
        {
            var a = Enemy(); var d = Player(); d.StartParry();
            var r = CombatResolver.Resolve(a, d, Slash);
            Assert.Equal(HitOutcome.Parried, r.Outcome);
            Assert.Equal(100f, d.Health.Current);
            Assert.Equal(60f - (25f * 1.5f + 20f), a.Posture.Current, 3);
            Assert.Equal(8, r.DefenderHitstop);
        }

        [Fact]
        public void ParryWindowCloses()
        {
            var d = Player(); d.StartParry(8);
            for (int i = 0; i < 8; i++) d.Tick();
            Assert.Equal(HitOutcome.Hit, CombatResolver.Resolve(Enemy(), d, Slash).Outcome);
        }

        [Fact]
        public void EmptyPostureBreaksAndRefillsAfterTheStagger()
        {
            var d = Enemy();
            CombatResolver.Resolve(Player(), d, Slash);
            CombatResolver.Resolve(Player(), d, Slash);
            var r = CombatResolver.Resolve(Player(), d, Slash);
            Assert.True(r.DefenderPostureBroken);
            Assert.True(d.PostureBroken);
            Assert.Equal(CombatResolver.PostureBreakStaggerFrames, d.StaggerFrames);

            for (int i = 0; i < CombatResolver.PostureBreakStaggerFrames; i++) d.Tick();
            Assert.False(d.PostureBroken);
            Assert.True(d.Posture.IsFull);
        }

        [Fact]
        public void SuperArmorTakesDamageButIsNotStaggered()
        {
            var d = new Combatant(Team.Enemy, 200, 500) { SuperArmor = true };
            CombatResolver.Resolve(Player(), d, Slash);
            Assert.Equal(180f, d.Health.Current);
            Assert.False(d.IsStaggered);
        }

        [Fact]
        public void LethalHitReportsTheKillAndFurtherHitsAreIgnored()
        {
            var d = new Combatant(Team.Enemy, 15, 50);
            Assert.True(CombatResolver.Resolve(Player(), d, Slash).Killed);
            Assert.Equal(HitOutcome.Ignored, CombatResolver.Resolve(Player(), d, Slash).Outcome);
        }

        [Fact]
        public void PostureRegeneratesAfterTheDelay()
        {
            var d = Enemy();
            d.PostureRegenDelayFrames = 10; d.PostureRegenPerFrame = 1f;
            CombatResolver.Resolve(Player(), d, new HitSpec(0, 20, hitstunFrames: 0));
            for (int i = 0; i < 10; i++) d.Tick();
            Assert.Equal(40f, d.Posture.Current);
            for (int i = 0; i < 5; i++) d.Tick();
            Assert.Equal(45f, d.Posture.Current);
        }
    }
}
