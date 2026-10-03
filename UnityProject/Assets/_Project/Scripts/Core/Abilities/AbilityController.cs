using System;
using Unwritten.Core.Input;
using Unwritten.Core.Stats;

namespace Unwritten.Core.Abilities
{
    /// <summary>
    /// Connects buffered input to abilities for one character: each logic frame it takes
    /// the oldest buffered press that the runner can accept and the resolver can map,
    /// starts that ability, then advances the runner.
    ///
    /// Which ability an input starts is decided by an <see cref="IAbilityResolver"/>:
    /// a <see cref="ComboGraph"/> for player characters, or a <see cref="BindingResolver"/>
    /// (one ability per button) for simple cases and tests.
    /// </summary>
    public sealed class AbilityController
    {
        readonly AbilityRunner _runner;
        readonly InputBuffer _buffer;
        readonly ResourcePool _mana;
        readonly IAbilityResolver _resolver;
        readonly BindingResolver _bindings;

        public AbilityRunner Runner => _runner;
        public InputBuffer Buffer => _buffer;
        public ResourcePool Mana => _mana;
        public IAbilityResolver Resolver => _resolver;

        /// <summary>The result of the last attempt to start an ability (for the debug HUD).</summary>
        public StartResult LastResult { get; private set; }

        /// <summary>The ability that last failed to start, or null.</summary>
        public AbilityDefinition LastRejected { get; private set; }

        /// <summary>If true, nothing new can start (stagger, cutscene). Presses stay buffered.</summary>
        public bool Locked { get; set; }

        /// <param name="resolver">Null = a <see cref="BindingResolver"/> configured through <see cref="Bind"/>.</param>
        public AbilityController(AbilityRunner runner, InputBuffer buffer, ResourcePool mana, IAbilityResolver resolver = null)
        {
            _runner = runner ?? throw new ArgumentNullException(nameof(runner));
            _buffer = buffer ?? throw new ArgumentNullException(nameof(buffer));
            _mana = mana;
            if (resolver == null)
            {
                _bindings = new BindingResolver();
                _resolver = _bindings;
            }
            else
            {
                _resolver = resolver;
            }
        }

        /// <summary>Bind one ability to one input. Only valid with the default binding resolver.</summary>
        public void Bind(InputIntent intent, AbilityDefinition ability)
        {
            if (_bindings == null) throw new InvalidOperationException("This controller uses a custom resolver (e.g. a ComboGraph); edit that instead.");
            _bindings.Bind(intent, ability);
        }

        public AbilityDefinition GetBinding(InputIntent intent) => _bindings?.Get(intent);

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

            if (!Locked) TryStartFromBuffer(clockFrame);
            _runner.Tick();
        }

        /// <summary>Start a specific ability directly (AI, scripted moves, hit reactions), bypassing input.</summary>
        public StartResult StartDirect(AbilityDefinition ability, InputIntent asIntent, long clockFrame)
        {
            var result = _runner.TryStart(ability, asIntent, clockFrame, _mana);
            if (result == StartResult.Started) _resolver.Commit(new ResolvedMove(ability));
            return result;
        }

        void TryStartFromBuffer(long clockFrame)
        {
            IntentMask accepted = _runner.AcceptedIntents() & _resolver.ResolvableIntents(_runner.Current);
            if (accepted == IntentMask.None) return;

            if (!_buffer.TryConsume(accepted, clockFrame, out InputIntent intent)) return;
            if (!_resolver.TryResolve(intent, _runner.Current, out ResolvedMove move)) return;

            LastResult = _runner.TryStart(move.Ability, intent, clockFrame, _mana);
            if (LastResult == StartResult.Started)
            {
                _resolver.Commit(move);
                LastRejected = null;
            }
            else
            {
                LastRejected = move.Ability;
            }
        }
    }
}
