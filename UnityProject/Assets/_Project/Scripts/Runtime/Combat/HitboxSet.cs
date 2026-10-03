using System;
using System.Collections.Generic;
using UnityEngine;
using Unwritten.Core.Abilities;
using Unwritten.Core.Combat;
using Unwritten.Runtime.Abilities;

namespace Unwritten.Runtime.Combat
{
    /// <summary>
    /// A character's named attack volumes ("Blade", "Fist", "Cutter"...). A SpawnHitbox ability
    /// event activates one by name for N frames; while active it checks for <see cref="Hurtbox"/>es
    /// each logic frame, resolves hits with <see cref="CombatResolver"/>, and tells both sides.
    ///
    /// One ability use can hit each target only once, even across several hitbox events.
    /// No allocations per frame (pre-sized buffers).
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class HitboxSet : MonoBehaviour
    {
        [Serializable]
        public struct Shape
        {
            public string id;
            [Tooltip("Centre, in this character's local space (forward = +Z).")]
            public Vector3 center;
            [Tooltip("Full size of the box, in metres.")]
            public Vector3 size;
        }

        struct ActiveBox
        {
            public int Shape;
            public int FramesLeft;
            public AbilityDefinition Ability;
        }

        [SerializeField] List<Shape> shapes = new List<Shape>
        {
            new Shape { id = "Blade", center = new Vector3(0f, 1f, 1.1f), size = new Vector3(2.2f, 1.6f, 2.0f) },
        };
        [Tooltip("Layers to search for hurtboxes. Use a dedicated Hurtbox layer for speed.")]
        [SerializeField] LayerMask hurtboxLayers = ~0;
        [SerializeField] bool drawGizmos = true;

        [Header("References (found automatically if empty)")]
        [SerializeField] AbilityRunnerComponent abilities;
        [SerializeField] CombatantComponent owner;

        static long s_lastPhysicsSync = -1;

        readonly List<ActiveBox> _active = new List<ActiveBox>(4);
        readonly Collider[] _overlaps = new Collider[16];
        readonly HashSet<CombatantComponent> _hitThisUse = new HashSet<CombatantComponent>();

        void Awake()
        {
            if (abilities == null) abilities = GetComponent<AbilityRunnerComponent>();
            if (owner == null) owner = GetComponent<CombatantComponent>();
        }

        void OnEnable()
        {
            LogicClock.Instance.Register(TickPhase.Hitboxes, Tick);
            if (abilities != null)
            {
                abilities.AbilityStarted += OnAbilityStarted;
                abilities.AbilityEnded += OnAbilityEnded;
                abilities.AbilityEventFired += OnAbilityEvent;
            }
        }

        void OnDisable()
        {
            LogicClock.UnregisterIfAlive(TickPhase.Hitboxes, Tick);
            if (abilities != null)
            {
                abilities.AbilityStarted -= OnAbilityStarted;
                abilities.AbilityEnded -= OnAbilityEnded;
                abilities.AbilityEventFired -= OnAbilityEvent;
            }
        }

        void OnAbilityStarted(AbilityDefinition ability)
        {
            _active.Clear();
            _hitThisUse.Clear();
        }

        void OnAbilityEnded(AbilityDefinition ability) => _active.Clear();

        void OnAbilityEvent(AbilityDefinition ability, AbilityEvent e)
        {
            if (e.Type != AbilityEventType.SpawnHitbox) return;
            int shape = FindShape(e.Key);
            if (shape < 0)
            {
                Debug.LogWarning($"[HitboxSet] {name}: ability {ability.Id} asks for hitbox '{e.Key}', which isn't defined.", this);
                return;
            }
            _active.Add(new ActiveBox { Shape = shape, FramesLeft = Mathf.Max(1, Mathf.RoundToInt(e.Value)), Ability = ability });
        }

        void Tick(long frame)
        {
            if (_active.Count == 0 || owner == null) return;
            if (abilities != null && abilities.Runner != null && abilities.Runner.InHitstop) return; // frozen with the attack

            // Characters moved since the last physics step; make overlap queries see where they are now.
            // Done once per logic frame for the whole scene.
            if (s_lastPhysicsSync != frame)
            {
                Physics.SyncTransforms();
                s_lastPhysicsSync = frame;
            }

            for (int i = _active.Count - 1; i >= 0; i--)
            {
                var box = _active[i];
                if (box.Ability.Hit.IsSet) Sweep(box);
                box.FramesLeft--;
                if (box.FramesLeft <= 0) _active.RemoveAt(i);
                else _active[i] = box;
            }
        }

        void Sweep(in ActiveBox box)
        {
            var shape = shapes[box.Shape];
            var center = transform.TransformPoint(shape.center);
            int count = Physics.OverlapBoxNonAlloc(center, shape.size * 0.5f, _overlaps, transform.rotation, hurtboxLayers, QueryTriggerInteraction.Collide);

            for (int c = 0; c < count; c++)
            {
                if (!_overlaps[c].TryGetComponent(out Hurtbox hurtbox)) continue;
                var target = hurtbox.Owner;
                if (target == null || target == owner || _hitThisUse.Contains(target)) continue;

                var spec = box.Ability.Hit;
                var result = CombatResolver.Resolve(owner.Core, target.Core, spec);
                if (result.Outcome == HitOutcome.Ignored) continue;

                _hitThisUse.Add(target);
                var hit = new HitEvent(owner, target, result, spec, target.HitPoint);
                target.ApplyIncomingHit(hit);
                owner.ApplyOutgoingHit(hit);
                CombatEvents.RaiseHit(hit);
            }
        }

        int FindShape(string id)
        {
            for (int i = 0; i < shapes.Count; i++)
                if (string.Equals(shapes[i].id, id, StringComparison.OrdinalIgnoreCase)) return i;
            return -1;
        }

        void OnDrawGizmosSelected()
        {
            if (!drawGizmos) return;
            Gizmos.matrix = transform.localToWorldMatrix;
            foreach (var s in shapes)
            {
                bool live = false;
                for (int i = 0; i < _active.Count; i++) if (shapes[_active[i].Shape].id == s.id) live = true;
                Gizmos.color = live ? new Color(1f, 0.3f, 0.2f, 0.9f) : new Color(1f, 0.8f, 0.2f, 0.5f);
                Gizmos.DrawWireCube(s.center, s.size);
            }
            Gizmos.matrix = Matrix4x4.identity;
        }
    }
}
