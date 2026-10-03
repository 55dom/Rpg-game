using UnityEngine;
using Unwritten.Core.Abilities;
using Unwritten.Core.Combat;
using Unwritten.Core.Input;
using Unwritten.Runtime.Abilities;
using Unwritten.Runtime.Combat;
using Unwritten.Runtime.Controls;

namespace Unwritten.Runtime.Characters
{
    /// <summary>
    /// The player's body: turns stick input into camera-relative movement, handles block and parry,
    /// lock-on, and soft auto-aim, and tells the combo graph the current situation
    /// (grounded / airborne / after dash / after parry / target staggered).
    /// </summary>
    [RequireComponent(typeof(CharacterMotor))]
    [RequireComponent(typeof(CombatantComponent))]
    [RequireComponent(typeof(AbilityRunnerComponent))]
    public sealed class PlayerController : MonoBehaviour, IMoveContextSource
    {
        [SerializeField] PlayerInputReader input;
        [Tooltip("Movement is relative to this camera. Defaults to the main camera.")]
        [SerializeField] Transform cameraTransform;

        [Header("Targeting")]
        [SerializeField, Min(0)] float lockOnRange = 15f;
        [Tooltip("Without lock-on, attacks turn toward the nearest enemy within this distance in front.")]
        [SerializeField, Min(0)] float softAimRange = 4.5f;
        [SerializeField, Range(0, 180)] float softAimAngle = 100f;

        [Header("Defense")]
        [SerializeField, Min(0)] int parryWindowFrames = CombatResolver.DefaultParryFrames;
        [Tooltip("Frames after a successful parry during which the AfterParry context is active (counter window).")]
        [SerializeField, Min(0)] int counterWindowFrames = 20;

        CharacterMotor _motor;
        CombatantComponent _combatant;
        AbilityRunnerComponent _abilities;
        int _framesSinceParry = 999;

        public CombatantComponent LockTarget { get; private set; }

        public MoveContext CurrentContext
        {
            get
            {
                var c = _motor.Context;
                if (_framesSinceParry <= counterWindowFrames) c |= MoveContext.AfterParry;
                var target = LockTarget != null ? LockTarget : FindSoftTarget();
                if (target != null && target.Core.PostureBroken) c |= MoveContext.TargetStaggered;
                return c;
            }
        }

        void Awake()
        {
            _motor = GetComponent<CharacterMotor>();
            _combatant = GetComponent<CombatantComponent>();
            _abilities = GetComponent<AbilityRunnerComponent>();
            if (input == null) input = _abilities.InputReader;
        }

        void Start()
        {
            if (cameraTransform == null && Camera.main != null) cameraTransform = Camera.main.transform;
        }

        void OnEnable()
        {
            LogicClock.Instance.Register(TickPhase.Brains, Tick);
            _abilities.AbilityStarted += OnAbilityStarted;
            _combatant.Damaged += OnDamaged;
            if (input != null)
            {
                input.IntentPressed += OnIntent;
                input.LockOnPressed += ToggleLockOn;
            }
        }

        void OnDisable()
        {
            LogicClock.UnregisterIfAlive(TickPhase.Brains, Tick);
            _abilities.AbilityStarted -= OnAbilityStarted;
            _combatant.Damaged -= OnDamaged;
            if (input != null)
            {
                input.IntentPressed -= OnIntent;
                input.LockOnPressed -= ToggleLockOn;
            }
        }

        void Tick(long frame)
        {
            if (_framesSinceParry < 9999) _framesSinceParry++;
            if (LockTarget != null && (LockTarget.Core.IsDead || !LockTarget.isActiveAndEnabled)) LockTarget = null;

            var core = _combatant.Core;
            bool acting = _abilities.Runner.IsRunning;
            _motor.MovementLocked = acting || !core.CanAct;

            // Block only while idle and able to act; tapping block also opens a parry window (OnIntent).
            core.Blocking = input != null && input.BlockHeld && !acting && core.CanAct && _motor.IsGrounded;

            _motor.SetMoveInput(core.CanAct ? CameraRelative(input != null ? input.Move : Vector2.zero) : Vector3.zero);
        }

        void OnIntent(InputIntent intent)
        {
            if (intent == InputIntent.Block && _combatant.Core.CanAct) _combatant.Core.StartParry(parryWindowFrames);
        }

        void OnDamaged(HitEvent hit)
        {
            if (hit.Result.Outcome == HitOutcome.Parried) _framesSinceParry = 0;
        }

        void OnAbilityStarted(AbilityDefinition ability)
        {
            if (!ability.Hit.IsSet) return; // dodges and jumps follow the stick, not the target
            var target = LockTarget != null ? LockTarget : FindSoftTarget();
            if (target != null) _motor.FaceTowards(target.transform.position);
        }

        void ToggleLockOn()
        {
            if (LockTarget != null)
            {
                LockTarget = null;
                return;
            }
            LockTarget = FindNearestEnemy(lockOnRange, 360f);
        }

        CombatantComponent FindSoftTarget() => FindNearestEnemy(softAimRange, softAimAngle);

        CombatantComponent FindNearestEnemy(float range, float angle)
        {
            CombatantComponent best = null;
            float bestDistance = range;
            var position = transform.position;
            var forward = transform.forward;
            var all = CombatantComponent.All;
            for (int i = 0; i < all.Count; i++)
            {
                var c = all[i];
                if (c == _combatant || c.Team == _combatant.Team || c.Core.IsDead) continue;
                var to = c.transform.position - position;
                to.y = 0f;
                float d = to.magnitude;
                if (d > bestDistance) continue;
                if (angle < 360f && d > 0.01f && Vector3.Angle(forward, to) > angle * 0.5f) continue;
                best = c;
                bestDistance = d;
            }
            return best;
        }

        Vector3 CameraRelative(Vector2 stick)
        {
            if (cameraTransform == null) return new Vector3(stick.x, 0f, stick.y);
            var forward = cameraTransform.forward; forward.y = 0f; forward.Normalize();
            var right = cameraTransform.right; right.y = 0f; right.Normalize();
            return forward * stick.y + right * stick.x;
        }
    }
}
