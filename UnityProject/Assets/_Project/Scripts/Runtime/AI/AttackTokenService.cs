using UnityEngine;
using Unwritten.Core.AI;

namespace Unwritten.Runtime.AI
{
    /// <summary>
    /// The scene's attack-token pool: at most <see cref="Capacity"/> enemies attack the player at once.
    /// Mobile uses fewer simultaneous attackers than PC by default.
    /// </summary>
    public static class AttackTokenService
    {
        static AttackTokenPool s_pool;

        public static int Capacity => Pool.Capacity;

        public static AttackTokenPool Pool
        {
            get
            {
                if (s_pool == null)
                {
                    int capacity = Application.isMobilePlatform ? 1 : 2;
                    s_pool = new AttackTokenPool(capacity);
                }
                return s_pool;
            }
        }

        [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)]
        static void ResetStatics() => s_pool = null;
    }
}
