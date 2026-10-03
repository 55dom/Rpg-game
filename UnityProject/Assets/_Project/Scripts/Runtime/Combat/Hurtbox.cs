using UnityEngine;

namespace Unwritten.Runtime.Combat
{
    /// <summary>
    /// Marks a collider as "can be hit". Put it on the collider(s) of a character's body;
    /// it points to the character's <see cref="CombatantComponent"/>.
    /// Hitboxes only react to colliders that have a Hurtbox.
    /// </summary>
    [RequireComponent(typeof(Collider))]
    public sealed class Hurtbox : MonoBehaviour
    {
        [Tooltip("Found in parents automatically if empty.")]
        [SerializeField] CombatantComponent owner;

        public CombatantComponent Owner => owner;

        void Awake()
        {
            if (owner == null) owner = GetComponentInParent<CombatantComponent>();
            if (owner == null) Debug.LogError($"[Hurtbox] {name} has no CombatantComponent in its parents.", this);
        }
    }
}
