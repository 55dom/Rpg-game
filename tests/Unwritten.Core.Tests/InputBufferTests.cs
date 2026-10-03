using Unwritten.Core.Input;
using Xunit;

namespace Unwritten.Core.Tests
{
    public class InputBufferTests
    {
        [Fact]
        public void PressIsConsumedWithinTheWindow()
        {
            var buffer = new InputBuffer(windowFrames: 10);
            buffer.Push(InputIntent.Light, 100);

            Assert.True(buffer.TryConsume(IntentMask.All, 110, out var intent));
            Assert.Equal(InputIntent.Light, intent);
            Assert.False(buffer.TryConsume(IntentMask.All, 110, out _)); // consumed only once
        }

        [Fact]
        public void PressExpiresAfterTheWindow()
        {
            var buffer = new InputBuffer(windowFrames: 10);
            buffer.Push(InputIntent.Light, 100);
            Assert.False(buffer.TryConsume(IntentMask.All, 111, out _));
        }

        [Fact]
        public void OldestAllowedPressWins()
        {
            var buffer = new InputBuffer();
            buffer.Push(InputIntent.Heavy, 1);
            buffer.Push(InputIntent.Light, 2);
            buffer.Push(InputIntent.Dodge, 3);

            Assert.True(buffer.TryConsume(IntentMask.Light | IntentMask.Dodge, 4, out var first));
            Assert.Equal(InputIntent.Light, first);
            Assert.True(buffer.TryConsume(IntentMask.All, 4, out var second));
            Assert.Equal(InputIntent.Heavy, second);
        }

        [Fact]
        public void DisallowedPressesStayBuffered()
        {
            var buffer = new InputBuffer();
            buffer.Push(InputIntent.Spell1, 5);
            Assert.False(buffer.TryConsume(IntentMask.Dodge, 6, out _));
            Assert.True(buffer.TryConsume(IntentMask.AnySpell, 6, out var intent));
            Assert.Equal(InputIntent.Spell1, intent);
        }

        [Fact]
        public void FullBufferOverwritesTheOldestPress()
        {
            var buffer = new InputBuffer(capacity: 2);
            buffer.Push(InputIntent.Light, 1);
            buffer.Push(InputIntent.Heavy, 2);
            buffer.Push(InputIntent.Jump, 3);

            Assert.True(buffer.TryConsume(IntentMask.All, 3, out var a));
            Assert.True(buffer.TryConsume(IntentMask.All, 3, out var b));
            Assert.Equal(InputIntent.Heavy, a);
            Assert.Equal(InputIntent.Jump, b);
            Assert.False(buffer.TryConsume(IntentMask.All, 3, out _));
        }

        [Fact]
        public void DelayKeepsPressesAliveThroughHitstop()
        {
            var buffer = new InputBuffer(windowFrames: 10);
            buffer.Push(InputIntent.Light, 100);
            buffer.Delay(18);
            Assert.True(buffer.TryConsume(IntentMask.All, 125, out _));
        }

        [Fact]
        public void NoneIsIgnored()
        {
            var buffer = new InputBuffer();
            buffer.Push(InputIntent.None, 1);
            Assert.False(buffer.HasLive(1));
        }
    }
}
