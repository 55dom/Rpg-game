using System;
using Unwritten.Core.Abilities;
using Unwritten.Core.Input;
using Unwritten.Core.Stats;
using Xunit;

namespace Unwritten.Core.Tests
{
    public class AbilityDefinitionTests
    {
        [Fact]
        public void PhasesFollowFrameData()
        {
            var light = Abilities.Light();
            Assert.Equal(24, light.TotalFrames);
            Assert.Equal(AbilityPhase.Startup, light.PhaseAt(0));
            Assert.Equal(AbilityPhase.Startup, light.PhaseAt(6));
            Assert.Equal(AbilityPhase.Active, light.PhaseAt(7));
            Assert.Equal(AbilityPhase.Active, light.PhaseAt(9));
            Assert.Equal(AbilityPhase.Recovery, light.PhaseAt(10));
            Assert.Equal(AbilityPhase.Recovery, light.PhaseAt(23));
            Assert.Equal(AbilityPhase.Idle, light.PhaseAt(24));
        }

        [Fact]
        public void EventsAreSortedStably()
        {
            var def = new AbilityDefinition("A", 5, 0, 0, new[]
            {
                new AbilityEvent(3, AbilityEventType.PlaySound, "late"),
                new AbilityEvent(1, AbilityEventType.PlaySound, "first"),
                new AbilityEvent(1, AbilityEventType.SpawnVfx, "second"),
            });
            Assert.Equal("first", def.Events[0].Key);
            Assert.Equal("second", def.Events[1].Key);
            Assert.Equal("late", def.Events[2].Key);
        }

        [Fact]
        public void InvalidDataFailsLoudly()
        {
            Assert.Throws<ArgumentException>(() => new AbilityDefinition("", 1, 1, 1));
            Assert.Throws<ArgumentException>(() => new AbilityDefinition("Zero", 0, 0, 0));
            Assert.Throws<ArgumentOutOfRangeException>(() => new AbilityDefinition("Neg", -1, 1, 1));
            Assert.Throws<ArgumentOutOfRangeException>(() =>
                new AbilityDefinition("LateEvent", 2, 2, 2, new[] { new AbilityEvent(6, AbilityEventType.PlaySound) }));
            Assert.Throws<ArgumentOutOfRangeException>(() =>
                new AbilityDefinition("BadWindow", 2, 2, 2, null, new[] { new CancelWindow(4, 9, IntentMask.Dodge) }));
            Assert.Throws<ArgumentException>(() =>
                new AbilityDefinition("EmptyWindow", 2, 2, 2, null, new[] { new CancelWindow(1, 2, IntentMask.None) }));
        }
    }

    public class AbilityRunnerTests
    {
        [Fact]
        public void EventsFireOnTheirFramesAndTheAbilityFinishes()
        {
            var sink = new RecordingSink();
            var runner = new AbilityRunner(sink);
            var light = Abilities.Light();

            Assert.Equal(StartResult.Started, runner.TryStart(light, InputIntent.Light, 0));
            for (int i = 0; i < light.TotalFrames; i++) runner.Tick();

            Assert.Equal(new[]
            {
                "start Light1",
                "event Light1 0 PlayAnimation Slash1",
                "event Light1 7 SpawnHitbox Blade",
                "finish Light1",
            }, sink.Log);
            Assert.False(runner.IsRunning);
        }

        [Fact]
        public void CannotStartAnotherAbilityOutsideACancelWindow()
        {
            var runner = new AbilityRunner(new RecordingSink());
            runner.TryStart(Abilities.Light(), InputIntent.Light, 0);
            for (int i = 0; i < 5; i++) runner.Tick();

            Assert.Equal(StartResult.Busy, runner.TryStart(Abilities.Dodge(), InputIntent.Dodge, 5));
        }

        [Fact]
        public void CancelWindowAllowsListedIntentsOnly()
        {
            var sink = new RecordingSink();
            var runner = new AbilityRunner(sink);
            runner.TryStart(Abilities.Light(), InputIntent.Light, 0);
            for (int i = 0; i < 12; i++) runner.Tick(); // now on frame 12, window open

            Assert.False(runner.CanAccept(InputIntent.Heavy));
            Assert.Equal(StartResult.Started, runner.TryStart(Abilities.Dodge(), InputIntent.Dodge, 12));
            Assert.Contains("cancel Light1 into Dodge", sink.Log);
            Assert.Equal("Dodge", runner.Current.Id);
        }

        [Fact]
        public void OnHitCancelOpensOnlyAfterAHit()
        {
            var runner = new AbilityRunner(new RecordingSink());
            var mana = new ResourcePool(100);
            var gale = Abilities.GaleCutter();
            runner.TryStart(gale, InputIntent.Spell1, 0, mana);
            for (int i = 0; i < 16; i++) runner.Tick();

            Assert.False(runner.CanAccept(InputIntent.Jump));
            runner.NotifyHit(0);
            Assert.True(runner.CanAccept(InputIntent.Jump));
        }

        [Fact]
        public void HitstopFreezesTheAbility()
        {
            var runner = new AbilityRunner(new RecordingSink());
            runner.TryStart(Abilities.Light(), InputIntent.Light, 0);
            for (int i = 0; i < 8; i++) runner.Tick();
            Assert.Equal(8, runner.Frame);

            runner.NotifyHit(6);
            for (int i = 0; i < 6; i++)
            {
                Assert.True(runner.InHitstop);
                Assert.False(runner.CanAccept(InputIntent.Dodge));
                runner.Tick();
            }
            Assert.Equal(8, runner.Frame);
            runner.Tick();
            Assert.Equal(9, runner.Frame);
        }

        [Fact]
        public void ManaIsCheckedAndSpentOnlyOnStart()
        {
            var runner = new AbilityRunner(new RecordingSink());
            var mana = new ResourcePool(20);
            var gale = Abilities.GaleCutter();

            Assert.Equal(StartResult.Started, runner.TryStart(gale, InputIntent.Spell1, 0, mana));
            Assert.Equal(5f, mana.Current);

            runner.Interrupt();
            Assert.Equal(StartResult.NotEnoughMana, runner.TryStart(gale, InputIntent.Spell1, 1, mana));
            Assert.Equal(5f, mana.Current);
        }

        [Fact]
        public void CooldownBlocksUntilReady()
        {
            var runner = new AbilityRunner(new RecordingSink());
            var dash = new AbilityDefinition("Dash", 0, 4, 0, cooldownFrames: 30);

            Assert.Equal(StartResult.Started, runner.TryStart(dash, InputIntent.Dodge, 0));
            for (int i = 0; i < 4; i++) runner.Tick();
            Assert.Equal(StartResult.OnCooldown, runner.TryStart(dash, InputIntent.Dodge, 10));
            Assert.Equal(StartResult.Started, runner.TryStart(dash, InputIntent.Dodge, 30));
        }

        [Fact]
        public void InterruptStopsEverything()
        {
            var sink = new RecordingSink();
            var runner = new AbilityRunner(sink);
            runner.TryStart(Abilities.Light(), InputIntent.Light, 0);
            runner.Tick();
            runner.NotifyHit(10);
            runner.Interrupt();

            Assert.False(runner.IsRunning);
            Assert.False(runner.InHitstop);
            Assert.Contains("interrupt Light1", sink.Log);
        }
    }

    public class AbilityControllerTests
    {
        static AbilityController Make(out RecordingSink sink, float mana = 100f)
        {
            sink = new RecordingSink();
            var controller = new AbilityController(new AbilityRunner(sink), new InputBuffer(), new ResourcePool(mana));
            controller.Bind(InputIntent.Light, Abilities.Light());
            controller.Bind(InputIntent.Dodge, Abilities.Dodge());
            controller.Bind(InputIntent.Spell1, Abilities.GaleCutter());
            return controller;
        }

        [Fact]
        public void PressStartsTheBoundAbilityAndFiresFrameZeroImmediately()
        {
            var controller = Make(out var sink);
            controller.Press(InputIntent.Light, 0);
            controller.Tick(0);

            Assert.Equal("Light1", controller.Runner.Current.Id);
            Assert.Contains("event Light1 0 PlayAnimation Slash1", sink.Log);
        }

        [Fact]
        public void EarlyPressIsBufferedUntilTheCancelWindowOpens()
        {
            var controller = Make(out var sink);
            controller.Press(InputIntent.Light, 0);
            long frame = 0;
            for (; frame < 5; frame++) controller.Tick(frame);

            // Press Dodge at frame 5; the cancel window opens at ability frame 12.
            controller.Press(InputIntent.Dodge, 5);
            for (; frame < 12; frame++) controller.Tick(frame);
            Assert.Equal("Light1", controller.Runner.Current.Id);

            controller.Tick(frame); // ability frame 12, buffered press is 7 frames old
            Assert.Equal("Dodge", controller.Runner.Current.Id);
            Assert.Contains("cancel Light1 into Dodge", sink.Log);
        }

        [Fact]
        public void PressTooEarlyExpires()
        {
            var controller = Make(out _);
            controller.Press(InputIntent.Light, 0);
            controller.Tick(0);

            controller.Press(InputIntent.Dodge, 1); // 11 frames before the window opens
            for (long frame = 1; frame <= 13; frame++) controller.Tick(frame);
            Assert.Equal("Light1", controller.Runner.Current.Id);
        }

        [Fact]
        public void LightChainsIntoLightThroughTheCancelWindow()
        {
            var controller = Make(out var sink);
            long frame = 0;
            controller.Press(InputIntent.Light, frame);
            for (; frame < 10; frame++) controller.Tick(frame);
            controller.Press(InputIntent.Light, frame);
            for (; frame < 13; frame++) controller.Tick(frame);

            Assert.Equal(2, sink.Log.FindAll(l => l == "start Light1").Count);
        }

        [Fact]
        public void PressesSurviveHitstop()
        {
            var controller = Make(out _);
            long frame = 0;
            controller.Press(InputIntent.Light, frame);
            for (; frame < 9; frame++) controller.Tick(frame);

            controller.Runner.NotifyHit(18);
            controller.Press(InputIntent.Dodge, frame); // pressed during the freeze
            for (int i = 0; i < 18; i++, frame++) controller.Tick(frame);

            // Unfrozen at ability frame 9; the window opens at 12.
            for (int i = 0; i < 4; i++, frame++) controller.Tick(frame);
            Assert.Equal("Dodge", controller.Runner.Current.Id);
        }

        [Fact]
        public void UnaffordableSpellIsRejectedAndReported()
        {
            var controller = Make(out _, mana: 5f);
            controller.Press(InputIntent.Spell1, 0);
            controller.Tick(0);

            Assert.False(controller.Runner.IsRunning);
            Assert.Equal(StartResult.NotEnoughMana, controller.LastResult);
            Assert.Equal("GaleCutter", controller.LastRejected.Id);
        }

        [Fact]
        public void UnboundIntentsAreIgnored()
        {
            var controller = Make(out _);
            controller.Press(InputIntent.Heavy, 0);
            controller.Tick(0);
            Assert.False(controller.Runner.IsRunning);
        }
    }

    public class ResourcePoolTests
    {
        [Fact]
        public void ClampsAndReportsChanges()
        {
            var pool = new ResourcePool(100, 50);
            float lastOld = -1, lastNew = -1;
            pool.Changed += (o, n) => { lastOld = o; lastNew = n; };

            pool.Add(80);
            Assert.Equal(100f, pool.Current);
            Assert.Equal(50f, lastOld);
            Assert.Equal(100f, lastNew);

            Assert.False(pool.TrySpend(150));
            Assert.True(pool.TrySpend(30));
            Assert.Equal(70f, pool.Current);

            pool.Add(-500);
            Assert.True(pool.IsEmpty);
        }

        [Fact]
        public void SetMaxCanKeepRatio()
        {
            var pool = new ResourcePool(100, 50);
            pool.SetMax(200, keepRatio: true);
            Assert.Equal(100f, pool.Current);
        }
    }
}
