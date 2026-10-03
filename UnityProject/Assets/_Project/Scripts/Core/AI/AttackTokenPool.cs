using System;

namespace Unwritten.Core.AI
{
    /// <summary>
    /// Limits how many enemies may attack one target at the same time. Everyone else
    /// circles and waits. This keeps 1-vs-many fights readable (the anime "one at a
    /// time" rhythm) and saves CPU.
    ///
    /// An enemy must hold a token to start an attack and releases it when the attack
    /// (and its recovery) ends. Tokens expire automatically so a stuck enemy can't hog one.
    /// </summary>
    public sealed class AttackTokenPool
    {
        readonly int[] _holders;
        readonly long[] _acquiredAt;

        /// <summary>A held token is reclaimed after this many frames.</summary>
        public int MaxHoldFrames { get; set; } = 180;

        public int Capacity => _holders.Length;

        public AttackTokenPool(int capacity = 2)
        {
            if (capacity <= 0) throw new ArgumentOutOfRangeException(nameof(capacity));
            _holders = new int[capacity];
            _acquiredAt = new long[capacity];
            for (int i = 0; i < capacity; i++) _holders[i] = -1;
        }

        /// <summary>Number of tokens currently held.</summary>
        public int InUse
        {
            get
            {
                int n = 0;
                for (int i = 0; i < _holders.Length; i++) if (_holders[i] >= 0) n++;
                return n;
            }
        }

        public bool Holds(int enemyId)
        {
            for (int i = 0; i < _holders.Length; i++) if (_holders[i] == enemyId) return true;
            return false;
        }

        /// <summary>Take a token if one is free (or already held). Returns true if the enemy now holds one.</summary>
        public bool TryAcquire(int enemyId, long frame)
        {
            if (enemyId < 0) throw new ArgumentOutOfRangeException(nameof(enemyId));
            Expire(frame);
            if (Holds(enemyId)) return true;
            for (int i = 0; i < _holders.Length; i++)
            {
                if (_holders[i] >= 0) continue;
                _holders[i] = enemyId;
                _acquiredAt[i] = frame;
                return true;
            }
            return false;
        }

        public void Release(int enemyId)
        {
            for (int i = 0; i < _holders.Length; i++)
                if (_holders[i] == enemyId) _holders[i] = -1;
        }

        public void Expire(long frame)
        {
            for (int i = 0; i < _holders.Length; i++)
                if (_holders[i] >= 0 && frame - _acquiredAt[i] > MaxHoldFrames) _holders[i] = -1;
        }

        public void Clear()
        {
            for (int i = 0; i < _holders.Length; i++) _holders[i] = -1;
        }
    }
}
