using System;
using Unwritten.Core.Abilities;
using Unwritten.Core.Input;
using Unwritten.Core.Stats;
using Xunit;

namespace Unwritten.Core.Tests
{
    public class ComboGraphTests
    {
        static readonly IntentMask StringCancel = IntentMask.Light | IntentMask.Heavy | IntentMask.Dodge | IntentMask.AnySpell | IntentMask.Jump;

        static AbilityDefinition Move(string id, int s = 7, int a = 3, int r = 14) => new AbilityDefinition(
            id, s, a, r, null, new[] { new CancelWindow(s + a, s + a + r - 1, StringCancel) });

        sealed class Ctx { public MoveContext Value = MoveContext.Grounded; }

        static ComboGraph Rook(Ctx ctx)
        {
            var g = new ComboGraph(() => ctx.Value);
            g.AddNode("L1", Move("L1"));
            g.AddNode("L2", Move("L2"));
            g.AddNode("L3", Move("L3"));
            g.AddNode("L4", Move("L4", 10, 4, 20));
            g.AddNode("Launcher", Move("Launcher", 9, 3, 18));
            g.AddNode("AirL1", Move("AirL1", 5, 3, 12));
            g.AddNode("Dodge", Move("Dodge", 0, 12, 18));
            g.AddNode("Gale", Move("Gale", 10, 6, 18));

            g.AddEntry(InputIntent.Light, "L1", MoveContext.Grounded);
            g.AddEntry(InputIntent.Light, "AirL1", MoveContext.Airborne);
            g.AddEdge("L1", InputIntent.Light, "L2");
            g.AddEdge("L2", InputIntent.Light, "L3");
            g.AddEdge("L3", InputIntent.Light, "L4");
            g.AddEdge("L2", InputIntent.Heavy, "Launcher");
            g.AddGlobal(InputIntent.Dodge, "Dodge");
            g.AddGlobal(InputIntent.Spell1, "Gale");
            return g;
        }

        static AbilityController Controller(ComboGraph g) =>
            new AbilityController(new AbilityRunner(new RecordingSink()), new InputBuffer(), new ResourcePool(100), g);

        static void Run(AbilityController c, ref long frame, int ticks)
        {
            for (int i = 0; i < ticks; i++, frame++) c.Tick(frame);
        }

        [Fact]
        public void LightFourTimesWalksTheString()
        {
            var c = Controller(Rook(new Ctx()));
            long f = 0;
            var seen = new System.Collections.Generic.List<string>();
            for (int hit = 0; hit < 4; hit++)
            {
                c.Press(InputIntent.Light, f);
                Run(c, ref f, 11);
                seen.Add(c.Runner.Current.Id);
            }
            Assert.Equal(new[] { "L1", "L2", "L3", "L4" }, seen);
        }

        [Fact]
        public void LightLightHeavyIsTheLauncher()
        {
            var c = Controller(Rook(new Ctx()));
            long f = 0;
            c.Press(InputIntent.Light, f); Run(c, ref f, 11);
            c.Press(InputIntent.Light, f); Run(c, ref f, 11);
            c.Press(InputIntent.Heavy, f); Run(c, ref f, 2);
            Assert.Equal("Launcher", c.Runner.Current.Id);
        }

        [Fact]
        public void HeavyFromIdleDoesNothingWithoutAnEntry()
        {
            var c = Controller(Rook(new Ctx()));
            long f = 0;
            c.Press(InputIntent.Heavy, f); Run(c, ref f, 2);
            Assert.False(c.Runner.IsRunning);
        }

        [Fact]
        public void GlobalEdgesWorkFromAnyMoveInItsCancelWindow()
        {
            var c = Controller(Rook(new Ctx()));
            long f = 0;
            c.Press(InputIntent.Light, f); Run(c, ref f, 11);
            c.Press(InputIntent.Spell1, f); Run(c, ref f, 2);
            Assert.Equal("Gale", c.Runner.Current.Id);
        }

        [Fact]
        public void AirborneContextPicksTheAirString()
        {
            var ctx = new Ctx { Value = MoveContext.Airborne };
            var c = Controller(Rook(ctx));
            long f = 0;
            c.Press(InputIntent.Light, f); Run(c, ref f, 1);
            Assert.Equal("AirL1", c.Runner.Current.Id);
        }

        [Fact]
        public void StringRestartsAfterTheMoveEnds()
        {
            var c = Controller(Rook(new Ctx()));
            long f = 0;
            c.Press(InputIntent.Light, f); Run(c, ref f, 40); // L1 finishes, back to idle
            c.Press(InputIntent.Light, f); Run(c, ref f, 1);
            Assert.Equal("L1", c.Runner.Current.Id);
        }

        [Fact]
        public void BadGraphDataFailsLoudly()
        {
            var g = new ComboGraph();
            g.AddNode("A", Move("A"));
            Assert.Throws<ArgumentException>(() => g.AddNode("A", Move("A2")));
            Assert.Throws<ArgumentException>(() => g.AddEdge("A", InputIntent.Light, "Missing"));
            Assert.Throws<ArgumentException>(() => g.AddEntry(InputIntent.None, "A"));
        }

        [Fact]
        public void BindOnAGraphControllerIsRejected()
        {
            var c = Controller(Rook(new Ctx()));
            Assert.Throws<InvalidOperationException>(() => c.Bind(InputIntent.Light, Move("X")));
        }
    }
}
