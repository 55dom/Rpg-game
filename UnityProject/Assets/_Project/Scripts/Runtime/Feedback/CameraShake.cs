using UnityEngine;
using Unwritten.Core.Combat;
using Unwritten.Runtime.Combat;

namespace Unwritten.Runtime.Feedback
{
    /// <summary>
    /// Shakes this transform (put it on the camera, or on an empty parent of the camera) whenever a
    /// hit resolves. Strength scales with hitstop, so heavier hits shake more.
    /// Placeholder until the Cinemachine camera rig (Phase 2) replaces it with impulse shakes.
    /// </summary>
    public sealed class CameraShake : MonoBehaviour
    {
        /// <summary>Accessibility setting: turn all camera shake off.</summary>
        public static bool Enabled = true;

        [SerializeField, Min(0)] float strengthPerHitstopFrame = 0.025f;
        [SerializeField, Min(0)] float maxStrength = 0.4f;
        [SerializeField, Range(0, 1)] float decayPerFrame = 0.85f;

        Vector3 _appliedOffset;
        float _strength;

        void OnEnable() => CombatEvents.HitResolved += OnHit;
        void OnDisable()
        {
            CombatEvents.HitResolved -= OnHit;
            transform.localPosition -= _appliedOffset;
            _appliedOffset = Vector3.zero;
        }

        void OnHit(HitEvent hit)
        {
            if (!Enabled) return;
            if (hit.Result.Outcome == HitOutcome.Dodged || hit.Result.Outcome == HitOutcome.Ignored) return;
            float s = Mathf.Max(hit.Result.AttackerHitstop, hit.Result.DefenderHitstop) * strengthPerHitstopFrame;
            _strength = Mathf.Min(maxStrength, Mathf.Max(_strength, s));
        }

        void LateUpdate()
        {
            // Remove last frame's offset first so other scripts can move this transform freely.
            transform.localPosition -= _appliedOffset;
            _appliedOffset = Vector3.zero;
            if (_strength <= 0.001f) { _strength = 0f; return; }

            _appliedOffset = new Vector3(Random.Range(-1f, 1f), Random.Range(-1f, 1f), 0f) * _strength;
            transform.localPosition += _appliedOffset;
            _strength *= decayPerFrame;
        }
    }
}
