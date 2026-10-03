using System;
using Unwritten.Core.Stats;

namespace Unwritten.Core.Combat
{
    public enum Team
    {
        Player = 0,
        Enemy = 1,
        Neutral = 2,
    }

    /// <summary>
    /// The fighting state of one character: health, posture, and defensive timers
    /// (dodge invulnerability, parry window, block, stagger). Advanced once per logic frame.
    /// </summary>
    public sealed class Combatant
    {
        public Team Team { get; }
        public ResourcePool Health { get; }
        public ResourcePool Posture { get; }

        /// <summary>Remaining invulnerable frames from a dodge.</summary>
        public int InvulnerableFrames { get; private set; }

        /// <summary>Frames since the current dodge's invulnerability began (for perfect dodges).</summary>
        public int InvulnerableElapsed { get; private set; }

        /// <summary>Remaining parry-window frames.</summary>
        public int ParryFrames { get; private set; }

        /// <summary>Holding block.</summary>
        public bool Blocking { get; set; }

        /// <summary>Super armor: takes damage but isn't interrupted (heavy enemies, some boss phases).</summary>
        public bool SuperArmor { get; set; }

        /// <summary>Remaining frames unable to act (hitstun, or a posture break).</summary>
        public int StaggerFrames { get; private set; }

        /// <summary>True during the long stagger after Posture is emptied: the window for finishers.</summary>
        public bool PostureBroken { get; private set; }

        /// <summary>Frames without taking posture damage before posture starts recovering.</summary>
        public int PostureRegenDelayFrames { get; set; } = 90;

        /// <summary>Posture recovered per frame once regeneration starts.</summary>
        public float PostureRegenPerFrame { get; set; } = 0.5f;

        public bool IsDead => Health.IsEmpty;
        public bool IsStaggered => StaggerFrames > 0;
        public bool CanAct => !IsDead && !IsStaggered;

        int _framesSincePostureDamage;

        public Combatant(Team team, float maxHealth, float maxPosture)
        {
            if (maxHealth <= 0f) throw new ArgumentOutOfRangeException(nameof(maxHealth));
            if (maxPosture <= 0f) throw new ArgumentOutOfRangeException(nameof(maxPosture));
            Team = team;
            Health = new ResourcePool(maxHealth);
            Posture = new ResourcePool(maxPosture);
        }

        /// <summary>Start a dodge's invulnerability.</summary>
        public void StartInvulnerability(int frames)
        {
            if (frames <= 0) return;
            InvulnerableFrames = frames;
            InvulnerableElapsed = 0;
        }

        /// <summary>Open a parry window (tap block at the moment of impact).</summary>
        public void StartParry(int frames = CombatResolver.DefaultParryFrames)
        {
            if (frames > ParryFrames) ParryFrames = frames;
        }

        public void Stagger(int frames)
        {
            if (frames > StaggerFrames) StaggerFrames = frames;
        }

        public void Tick()
        {
            if (InvulnerableFrames > 0)
            {
                InvulnerableFrames--;
                InvulnerableElapsed++;
            }

            if (ParryFrames > 0) ParryFrames--;

            if (StaggerFrames > 0)
            {
                StaggerFrames--;
                if (StaggerFrames == 0 && PostureBroken)
                {
                    PostureBroken = false;
                    Posture.Fill();
                }
            }

            _framesSincePostureDamage++;
            if (_framesSincePostureDamage > PostureRegenDelayFrames && !PostureBroken && !IsDead)
                Posture.Add(PostureRegenPerFrame);
        }

        internal void TakeDamage(float amount) => Health.Add(-amount);

        /// <summary>Returns true if this damage broke posture.</summary>
        internal bool TakePostureDamage(float amount)
        {
            if (amount <= 0f) return false;
            _framesSincePostureDamage = 0;
            if (PostureBroken) return false;
            Posture.Add(-amount);
            if (!Posture.IsEmpty) return false;
            PostureBroken = true;
            Stagger(CombatResolver.PostureBreakStaggerFrames);
            return true;
        }

        /// <summary>Restore everything (respawn, rest point, test reset).</summary>
        public void Reset()
        {
            Health.Fill();
            Posture.Fill();
            InvulnerableFrames = 0;
            InvulnerableElapsed = 0;
            ParryFrames = 0;
            StaggerFrames = 0;
            PostureBroken = false;
            Blocking = false;
            _framesSincePostureDamage = 0;
        }
    }
}
