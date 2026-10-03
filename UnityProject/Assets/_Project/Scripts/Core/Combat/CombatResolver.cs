namespace Unwritten.Core.Combat
{
    public enum HitOutcome
    {
        /// <summary>Nothing happened (same team, already dead).</summary>
        Ignored = 0,
        Hit = 1,
        Blocked = 2,
        Parried = 3,
        Dodged = 4,
        /// <summary>Dodged inside the first few invulnerable frames: rewards precise timing.</summary>
        PerfectDodge = 5,
    }

    /// <summary>The result of one hit, for feedback (hitstop, VFX, camera, sound) and AI.</summary>
    public readonly struct HitResult
    {
        public readonly HitOutcome Outcome;
        public readonly float HealthDamage;
        /// <summary>The defender's posture broke on this hit.</summary>
        public readonly bool DefenderPostureBroken;
        /// <summary>The attacker's posture broke (a parry can do this).</summary>
        public readonly bool AttackerPostureBroken;
        public readonly bool Killed;
        public readonly int AttackerHitstop;
        public readonly int DefenderHitstop;

        public HitResult(HitOutcome outcome, float healthDamage = 0f, bool defenderPostureBroken = false,
            bool attackerPostureBroken = false, bool killed = false, int attackerHitstop = 0, int defenderHitstop = 0)
        {
            Outcome = outcome;
            HealthDamage = healthDamage;
            DefenderPostureBroken = defenderPostureBroken;
            AttackerPostureBroken = attackerPostureBroken;
            Killed = killed;
            AttackerHitstop = attackerHitstop;
            DefenderHitstop = defenderHitstop;
        }

        /// <summary>True if the attacker's ability connected (opens on-hit cancels).</summary>
        public bool Connected => Outcome == HitOutcome.Hit || Outcome == HitOutcome.Blocked;
    }

    /// <summary>
    /// The rules of a single hit. Pure function of the two combatants' states and the hit:
    /// no physics, no Unity, so every rule is unit-tested.
    ///
    /// Order of checks: dead/same team → dodge (invulnerability) → parry → block → hit.
    /// </summary>
    public static class CombatResolver
    {
        public const int DefaultParryFrames = 8;
        /// <summary>A dodge counts as "perfect" if the hit lands within this many frames of starting it.</summary>
        public const int PerfectDodgeFrames = 6;
        public const int PostureBreakStaggerFrames = 90;
        public const int ParryHitstopFrames = 8;

        /// <summary>Fraction of damage that gets through a block ("chip").</summary>
        public const float BlockChipFraction = 0.2f;
        /// <summary>Fraction of posture damage a blocking defender still takes.</summary>
        public const float BlockPostureFraction = 0.75f;
        /// <summary>Posture damage dealt back to the attacker by a parry, as a multiple of the hit's posture damage.</summary>
        public const float ParryPostureMultiplier = 1.5f;
        public const float ParryPostureFlat = 20f;

        public static HitResult Resolve(Combatant attacker, Combatant defender, in HitSpec hit)
        {
            if (defender == null || defender.IsDead) return new HitResult(HitOutcome.Ignored);
            if (attacker != null && attacker.Team == defender.Team && attacker.Team != Team.Neutral)
                return new HitResult(HitOutcome.Ignored);

            if (defender.InvulnerableFrames > 0)
            {
                bool perfect = defender.InvulnerableElapsed < PerfectDodgeFrames;
                return new HitResult(perfect ? HitOutcome.PerfectDodge : HitOutcome.Dodged);
            }

            if (!hit.Unblockable && defender.ParryFrames > 0)
            {
                bool broke = attacker != null &&
                    attacker.TakePostureDamage(hit.PostureDamage * ParryPostureMultiplier + ParryPostureFlat);
                return new HitResult(HitOutcome.Parried, attackerPostureBroken: broke,
                    attackerHitstop: ParryHitstopFrames, defenderHitstop: ParryHitstopFrames);
            }

            if (!hit.Unblockable && defender.Blocking)
            {
                float chip = hit.Damage * BlockChipFraction;
                defender.TakeDamage(chip);
                bool guardBroken = defender.TakePostureDamage(hit.PostureDamage * BlockPostureFraction);
                if (guardBroken) defender.Blocking = false;
                int stop = hit.HitstopFrames / 2;
                return new HitResult(HitOutcome.Blocked, chip, guardBroken, killed: defender.IsDead,
                    attackerHitstop: stop, defenderHitstop: stop);
            }

            defender.TakeDamage(hit.Damage);
            bool postureBroken = defender.TakePostureDamage(hit.PostureDamage);
            if (!defender.SuperArmor || postureBroken) defender.Stagger(hit.HitstunFrames);
            return new HitResult(HitOutcome.Hit, hit.Damage, postureBroken, killed: defender.IsDead,
                attackerHitstop: hit.HitstopFrames, defenderHitstop: hit.HitstopFrames);
        }
    }
}
