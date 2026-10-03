using UnityEngine;
using Unwritten.Core.Abilities;

namespace Unwritten.Runtime.Characters
{
    /// <summary>
    /// Moves a character on the 60 Hz logic clock: running, gravity, jumps (with air jumps),
    /// dashes (ground and air), knockback, launches, and hitstop freezes.
    /// Used by the player and enemies alike; something else decides *where* to go.
    /// </summary>
    [RequireComponent(typeof(CharacterController))]
    public sealed class CharacterMotor : MonoBehaviour
    {
        const float Dt = 1f / 60f;

        [Header("Ground")]
        [SerializeField, Min(0)] float runSpeed = 6f;
        [SerializeField, Min(0)] float turnSpeedDegrees = 900f;

        [Header("Air")]
        [SerializeField, Min(0)] float gravity = 28f;
        [SerializeField, Min(0)] float terminalFallSpeed = 40f;
        [SerializeField, Range(0, 1)] float airControl = 0.6f;
        [SerializeField, Min(0)] int maxAirJumps = 1;

        [Header("Feel")]
        [Tooltip("Frames after a dash during which the AfterDash combo context is active.")]
        [SerializeField, Min(0)] int afterDashWindowFrames = 8;
        [SerializeField, Min(0)] float knockbackDecay = 30f;

        CharacterController _controller;
        Vector3 _moveInput;
        Vector3 _external;
        float _verticalSpeed;
        Vector3 _dashDirection;
        float _dashSpeed;
        int _dashFramesLeft;
        int _framesSinceDash = 999;
        int _airJumpsUsed;
        int _freezeFrames;

        public bool IsGrounded { get; private set; }
        public bool HasMoveInput => _moveInput.sqrMagnitude > 0.01f;
        public bool IsDashing => _dashFramesLeft > 0;
        public bool IsFrozen => _freezeFrames > 0;
        public float VerticalSpeed => _verticalSpeed;

        /// <summary>If true (players), the character turns to face where it runs. Enemies turn this off and face their target.</summary>
        public bool FaceMoveDirection { get; set; } = true;

        /// <summary>When true, run input is ignored (attacking, staggered). Dashes, launches and gravity still apply.</summary>
        public bool MovementLocked { get; set; }

        /// <summary>The current move situation, for combo edges.</summary>
        public MoveContext Context
        {
            get
            {
                var c = IsGrounded ? MoveContext.Grounded : MoveContext.Airborne;
                if (_framesSinceDash <= afterDashWindowFrames) c |= MoveContext.AfterDash;
                return c;
            }
        }

        /// <summary>The last non-zero run input (world space, flat).</summary>
        public Vector3 LastMoveDirection { get; private set; } = Vector3.forward;

        void Awake() => _controller = GetComponent<CharacterController>();

        void OnEnable() => LogicClock.Instance.Register(TickPhase.Movement, Step);
        void OnDisable() => LogicClock.UnregisterIfAlive(TickPhase.Movement, Step);

        /// <summary>Desired run direction in world space; length 0..1 sets speed.</summary>
        public void SetMoveInput(Vector3 worldDirection)
        {
            worldDirection.y = 0f;
            _moveInput = worldDirection.sqrMagnitude > 1f ? worldDirection.normalized : worldDirection;
            if (_moveInput.sqrMagnitude > 0.01f) LastMoveDirection = _moveInput.normalized;
        }

        public void FaceTowards(Vector3 worldPoint, bool instant = true)
        {
            var dir = worldPoint - transform.position;
            dir.y = 0f;
            if (dir.sqrMagnitude < 0.0001f) return;
            var target = Quaternion.LookRotation(dir.normalized, Vector3.up);
            transform.rotation = instant ? target : Quaternion.RotateTowards(transform.rotation, target, turnSpeedDegrees * Dt);
        }

        /// <summary>Dash a distance over a number of frames. In the air, gravity pauses (air dash).</summary>
        public void Dash(Vector3 direction, float distance, int frames)
        {
            direction.y = 0f;
            if (direction.sqrMagnitude < 0.0001f) direction = transform.forward;
            if (frames <= 0 || distance <= 0f) return;
            _dashDirection = direction.normalized;
            _dashSpeed = distance / (frames * Dt);
            _dashFramesLeft = frames;
            FaceTowards(transform.position + _dashDirection);
        }

        /// <summary>Jump from the ground, or use an air jump. Returns false if none are left.</summary>
        public bool TryJump(float upwardSpeed)
        {
            if (!IsGrounded)
            {
                if (_airJumpsUsed >= maxAirJumps) return false;
                _airJumpsUsed++;
            }
            _verticalSpeed = upwardSpeed;
            IsGrounded = false;
            return true;
        }

        /// <summary>Drive straight down (air slam finisher). Cancels any dash.</summary>
        public void Slam(float downwardSpeed)
        {
            if (IsGrounded || downwardSpeed <= 0f) return;
            _dashFramesLeft = 0;
            _verticalSpeed = -downwardSpeed;
        }

        public void Launch(float upwardSpeed)
        {
            if (upwardSpeed <= 0f) return;
            _verticalSpeed = Mathf.Max(_verticalSpeed, upwardSpeed);
            IsGrounded = false;
        }

        public void Knockback(Vector3 direction, float speed)
        {
            direction.y = 0f;
            if (speed <= 0f || direction.sqrMagnitude < 0.0001f) return;
            _external += direction.normalized * speed;
        }

        /// <summary>Freeze in place for hitstop.</summary>
        public void Freeze(int frames)
        {
            if (frames > _freezeFrames) _freezeFrames = frames;
        }

        public void CancelDash() => _dashFramesLeft = 0;

        void Step(long frame)
        {
            if (_freezeFrames > 0)
            {
                _freezeFrames--;
                return;
            }

            Vector3 horizontal;
            bool airDash = false;
            if (_dashFramesLeft > 0)
            {
                horizontal = _dashDirection * _dashSpeed;
                airDash = !IsGrounded;
                if (--_dashFramesLeft == 0) _framesSinceDash = 0;
            }
            else
            {
                if (_framesSinceDash < 9999) _framesSinceDash++;
                float control = IsGrounded ? 1f : airControl;
                horizontal = MovementLocked ? Vector3.zero : _moveInput * (runSpeed * control);
                if (FaceMoveDirection && !MovementLocked && _moveInput.sqrMagnitude > 0.01f)
                    FaceTowards(transform.position + _moveInput, instant: false);
            }

            horizontal += _external;
            _external = Vector3.MoveTowards(_external, Vector3.zero, knockbackDecay * Dt);

            if (airDash) _verticalSpeed = 0f;
            else _verticalSpeed = Mathf.Max(_verticalSpeed - gravity * Dt, -terminalFallSpeed);
            if (IsGrounded && _verticalSpeed < 0f) _verticalSpeed = -2f; // keep contact on slopes

            _controller.Move((horizontal + Vector3.up * _verticalSpeed) * Dt);
            IsGrounded = _controller.isGrounded;
            if (IsGrounded) _airJumpsUsed = 0;
        }
    }
}
