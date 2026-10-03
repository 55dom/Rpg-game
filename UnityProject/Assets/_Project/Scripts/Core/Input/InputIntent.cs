using System;

namespace Unwritten.Core.Input
{
    /// <summary>
    /// A single button press, after device mapping. Gamepad, keyboard, and touch all
    /// produce the same intents, so gameplay code never knows which device was used.
    /// </summary>
    public enum InputIntent
    {
        None = 0,
        Light = 1,
        Heavy = 2,
        Jump = 3,
        Dodge = 4,
        Block = 5,
        Spell1 = 6,
        Spell2 = 7,
        Spell3 = 8,
        Spell4 = 9,
        Ultimate = 10,
    }

    /// <summary>A set of intents, used by cancel windows ("this move can be cancelled into Dodge or any Spell").</summary>
    [Flags]
    public enum IntentMask
    {
        None = 0,
        Light = 1 << InputIntent.Light,
        Heavy = 1 << InputIntent.Heavy,
        Jump = 1 << InputIntent.Jump,
        Dodge = 1 << InputIntent.Dodge,
        Block = 1 << InputIntent.Block,
        Spell1 = 1 << InputIntent.Spell1,
        Spell2 = 1 << InputIntent.Spell2,
        Spell3 = 1 << InputIntent.Spell3,
        Spell4 = 1 << InputIntent.Spell4,
        Ultimate = 1 << InputIntent.Ultimate,

        AnySpell = Spell1 | Spell2 | Spell3 | Spell4,
        AnyAttack = Light | Heavy,
        All = Light | Heavy | Jump | Dodge | Block | AnySpell | Ultimate,
    }

    public static class InputIntentExtensions
    {
        public static IntentMask ToMask(this InputIntent intent)
        {
            return intent == InputIntent.None ? IntentMask.None : (IntentMask)(1 << (int)intent);
        }

        public static bool Contains(this IntentMask mask, InputIntent intent)
        {
            return intent != InputIntent.None && (mask & intent.ToMask()) != 0;
        }
    }
}
