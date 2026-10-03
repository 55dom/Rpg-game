using Unwritten.Core.Input;

namespace Unwritten.Core.Abilities
{
    /// <summary>
    /// A range of frames (inclusive at both ends, relative to the ability's start)
    /// during which the ability may be interrupted by one of the listed inputs.
    /// Example: "frames 12–30, into Dodge or any Spell".
    /// </summary>
    public readonly struct CancelWindow
    {
        public readonly int StartFrame;
        public readonly int EndFrame;
        public readonly IntentMask Into;

        /// <summary>If true, the window only opens after this ability has hit something.</summary>
        public readonly bool RequiresHit;

        public CancelWindow(int startFrame, int endFrame, IntentMask into, bool requiresHit = false)
        {
            StartFrame = startFrame;
            EndFrame = endFrame;
            Into = into;
            RequiresHit = requiresHit;
        }

        public bool Allows(int frame, InputIntent intent, bool hasHit)
        {
            return frame >= StartFrame && frame <= EndFrame
                && Into.Contains(intent)
                && (!RequiresHit || hasHit);
        }
    }
}
