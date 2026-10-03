using Unwritten.Core.Timing;
using Xunit;

namespace Unwritten.Core.Tests
{
    public class FrameClockTests
    {
        [Fact]
        public void SixtyFpsRunsOneTickPerFrame()
        {
            var clock = new FrameClock();
            for (int i = 0; i < 60; i++) Assert.Equal(1, clock.Advance(1.0 / 60));
            Assert.Equal(60, clock.Frame);
        }

        [Fact]
        public void ThirtyFpsRunsTwoTicksPerFrame()
        {
            var clock = new FrameClock();
            for (int i = 0; i < 30; i++) Assert.Equal(2, clock.Advance(1.0 / 30));
            Assert.Equal(60, clock.Frame);
        }

        [Fact]
        public void HighRefreshRateAccumulatesUntilATickIsDue()
        {
            var clock = new FrameClock();
            int ticks = 0;
            for (int i = 0; i < 144; i++) ticks += clock.Advance(1.0 / 144);
            Assert.InRange(ticks, 59, 60);
        }

        [Fact]
        public void LongHitchIsCappedAndBacklogDropped()
        {
            var clock = new FrameClock { MaxTicksPerAdvance = 5 };
            Assert.Equal(5, clock.Advance(2.0));
            Assert.Equal(1, clock.Advance(1.0 / 60));
        }
    }
}
