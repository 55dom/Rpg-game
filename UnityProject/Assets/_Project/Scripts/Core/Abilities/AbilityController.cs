using System;
using Unwritten.Core.Input;
using Unwritten.Core.Stats;

namespace Unwritten.Core.Abilities
{
    /// <summary>
    /// Connects buffered input to abilities for one character: each logic frame it takes
    /// the oldest buffered press that the runner can accept, starts the ability bound to
    /// it, then advances the runner.
    ///
    /// Phase 1 uses a direct intent → ability table. The ComboGraph (Step 2) replaces
    /// <see cref="Bind"/> with "which ability follows this one", without changing the runner.
    /// </summary>
    public sealed class AbilityController
    {
        readonly AbilityRunner _runner;
        readonly InputBuffer _buffer;
        readonly ResourcePool _mana;
        readonly AbilityDefinition[] _bindings = new AbilityDefinition[16];

        public AbilityRunner Runner => _runner;
        public InputBuffer Buffer => _buffer;
        public ResourcePool Mana => _mana;

        /// <summary>The result of the last attempt to start an ability (for the debug HUD).</summary>
        public StartResult LastResult { get; private set; }

        /// <summary>The ability that last failed to start, or null.</summary>
        public AbilityDefinition LastRejected { get; private set; }

        public AbilityController(AbilityRunner runner, InputBuffer buffer, ResourcePool mana)
        {
            _runner = runner ?? throw new ArgumentNullException(nameof(runner));
            _buffer = buffer ?? throw new ArgumentNullException(nameof(buffer));
            _mana = mana;
        }

        public void Bind(InputIntent intent, AbilityDefinition ability)
        {
            if (intent == InputIntent.None) throw new ArgumentException("Can't bind None.", nameof(intent));
            _bindings[(int)intent] = ability;
        }

        public AbilityDefinition GetBinding(InputIntent intent) => _bindings[(int)intent];

        /// <summary>Record a button press at the given clock frame.</summary>
        public void Press(InputIntent intent, long clockFrame) => _buffer.Push(intent, clockFrame);

        /// <summary>
        /// Run one logic frame. Input is resolved before the runner advances, so an
        /// ability started this frame fires its frame-0 events this same frame.
        /// </summary>
        public void Tick(long clockFrame)
        {
            if (_runner.InHitstop)
            {
                // Freeze the buffer along with the action so presses made during
                // a long hitstop are still valid when it ends.
                _buffer.Delay(1);
                _runner.Tick();
                return;
            }

            TryStartFromBuffer(clockFrame);
            _runner.Tick();
        }

        void TryStartFromBuffer(long clockFrame)
        {
            IntentMask accepted = _runner.AcceptedIntents() & BoundIntents();
            if (accepted == IntentMask.None) return;

            if (!_buffer.TryConsume(accepted, clockFrame, out InputIntent intent)) return;

            var ability = _bindings[(int)intent];
            LastResult = _runner.TryStart(ability, intent, clockFrame, _mana);
            LastRejected = LastResult == StartResult.Started ? null : ability;
        }

        IntentMask BoundIntents()
        {
            IntentMask mask = IntentMask.None;
            for (int i = 1; i < _bindings.Length; i++)
                if (_bindings[i] != null) mask |= ((InputIntent)i).ToMask();
            return mask;
        }
    }
}
