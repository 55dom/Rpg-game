namespace Unwritten.Core.Abilities
{
    /// <summary>What an ability event asks the game to do. The Unity layer decides how.</summary>
    public enum AbilityEventType
    {
        /// <summary>Play an animation. Key = Animator state name.</summary>
        PlayAnimation = 0,
        /// <summary>Activate a hitbox. Key = hitbox id on the character; Value = active frames.</summary>
        SpawnHitbox = 1,
        /// <summary>Apply a reaction tag (WET, CHARGED...). Key = tag id.</summary>
        ApplyTag = 2,
        /// <summary>Camera feedback (shake, FOV punch, impact frame). Key = camera cue id.</summary>
        CameraCue = 3,
        /// <summary>Key = sound event path.</summary>
        PlaySound = 4,
        /// <summary>Key = pooled VFX id.</summary>
        SpawnVfx = 5,
        /// <summary>Move the character. Key = curve id; Value = distance in metres.</summary>
        Move = 6,
        /// <summary>Become invulnerable. Value = frames.</summary>
        Invulnerable = 7,
        /// <summary>Anything else; interpreted by a custom handler. Key = handler id.</summary>
        Custom = 255,
    }

    /// <summary>
    /// One timed instruction inside an ability, fired on a specific frame
    /// (frame 0 = the frame the ability starts).
    /// </summary>
    public readonly struct AbilityEvent
    {
        public readonly int Frame;
        public readonly AbilityEventType Type;
        public readonly string Key;
        public readonly float Value;

        public AbilityEvent(int frame, AbilityEventType type, string key = null, float value = 0f)
        {
            Frame = frame;
            Type = type;
            Key = key;
            Value = value;
        }

        public override string ToString() => $"@{Frame} {Type} {Key} {Value}";
    }
}
