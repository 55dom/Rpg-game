namespace Unwritten.Core.Combat
{
    /// <summary>
    /// What one hit does: authored on an ability, applied by <see cref="CombatResolver"/>
    /// when that ability's hitbox touches a hurtbox.
    /// </summary>
    public readonly struct HitSpec
    {
        public readonly float Damage;
        /// <summary>Damage to the defender's Posture gauge. Empty posture = stagger window for finishers.</summary>
        public readonly float PostureDamage;
        /// <summary>Freeze frames on impact (both sides). Light 3–4, heavy 6, finisher 10, ultimate 18.</summary>
        public readonly int HitstopFrames;
        /// <summary>How long the defender can't act after being hit (ignored by super armor).</summary>
        public readonly int HitstunFrames;
        /// <summary>Unblockable attacks (the red glint) can't be blocked or parried; dodge them.</summary>
        public readonly bool Unblockable;
        /// <summary>Upward velocity in m/s applied to the defender (launchers). 0 = none.</summary>
        public readonly float Launch;
        /// <summary>Horizontal push in m/s away from the attacker.</summary>
        public readonly float Knockback;

        public HitSpec(float damage, float postureDamage = 0f, int hitstopFrames = 4, int hitstunFrames = 18,
            bool unblockable = false, float launch = 0f, float knockback = 0f)
        {
            Damage = damage;
            PostureDamage = postureDamage;
            HitstopFrames = hitstopFrames;
            HitstunFrames = hitstunFrames;
            Unblockable = unblockable;
            Launch = launch;
            Knockback = knockback;
        }

        /// <summary>True if this ability actually deals a hit (non-zero damage or posture damage).</summary>
        public bool IsSet => Damage > 0f || PostureDamage > 0f || Launch > 0f;

        public static readonly HitSpec None = default;
    }
}
