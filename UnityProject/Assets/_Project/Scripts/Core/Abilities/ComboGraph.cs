using System;
using System.Collections.Generic;
using Unwritten.Core.Input;

namespace Unwritten.Core.Abilities
{
    /// <summary>The situation a move is chosen in. Combo edges can require any combination.</summary>
    [Flags]
    public enum MoveContext
    {
        None = 0,
        Grounded = 1 << 0,
        Airborne = 1 << 1,
        /// <summary>Within a few frames after a dash/dodge ended.</summary>
        AfterDash = 1 << 2,
        /// <summary>Within a few frames after a successful parry.</summary>
        AfterParry = 1 << 3,
        /// <summary>The locked-on target is posture-broken (finisher window).</summary>
        TargetStaggered = 1 << 4,
    }

    /// <summary>The ability chosen for an input, plus resolver bookkeeping.</summary>
    public readonly struct ResolvedMove
    {
        public readonly AbilityDefinition Ability;
        /// <summary>Combo-graph node index, or -1 when not from a graph.</summary>
        public readonly int Node;

        public ResolvedMove(AbilityDefinition ability, int node = -1)
        {
            Ability = ability;
            Node = node;
        }
    }

    /// <summary>Decides which ability an input starts, given what's currently playing.</summary>
    public interface IAbilityResolver
    {
        /// <summary>Inputs that would resolve to something right now (used to filter the input buffer).</summary>
        IntentMask ResolvableIntents(AbilityDefinition current);

        bool TryResolve(InputIntent intent, AbilityDefinition current, out ResolvedMove move);

        /// <summary>Called when the resolved move actually started.</summary>
        void Commit(in ResolvedMove move);
    }

    /// <summary>The simplest resolver: one ability per button, no combos (Phase 1 Step 1 and AI).</summary>
    public sealed class BindingResolver : IAbilityResolver
    {
        readonly AbilityDefinition[] _bindings = new AbilityDefinition[16];

        public void Bind(InputIntent intent, AbilityDefinition ability)
        {
            if (intent == InputIntent.None) throw new ArgumentException("Can't bind None.", nameof(intent));
            _bindings[(int)intent] = ability;
        }

        public AbilityDefinition Get(InputIntent intent) => _bindings[(int)intent];

        public IntentMask ResolvableIntents(AbilityDefinition current)
        {
            IntentMask mask = IntentMask.None;
            for (int i = 1; i < _bindings.Length; i++)
                if (_bindings[i] != null) mask |= ((InputIntent)i).ToMask();
            return mask;
        }

        public bool TryResolve(InputIntent intent, AbilityDefinition current, out ResolvedMove move)
        {
            var ability = _bindings[(int)intent];
            move = new ResolvedMove(ability);
            return ability != null;
        }

        public void Commit(in ResolvedMove move) { }
    }

    /// <summary>
    /// A character's moveset as a graph. Nodes are moves; edges say "from this move, this input
    /// (in this context) leads to that move". Three kinds of edge:
    /// <list type="bullet">
    /// <item><b>Node edges</b>: the combo string (Light1 --Light--> Light2).</item>
    /// <item><b>Global edges</b>: available from any move whose cancel window allows it (Dodge, spells).</item>
    /// <item><b>Entry edges</b>: what each input starts from idle (Light → Light1 on the ground, AirLight1 in the air).</item>
    /// </list>
    /// New characters are new graphs built from data; no new combat code.
    /// Edge priority: node edges, then global edges, then entry edges (entry edges only when idle
    /// or when the current move isn't part of this graph).
    /// </summary>
    public sealed class ComboGraph : IAbilityResolver
    {
        readonly struct Edge
        {
            public readonly InputIntent Intent;
            public readonly MoveContext Requires;
            public readonly int Target;

            public Edge(InputIntent intent, MoveContext requires, int target)
            {
                Intent = intent;
                Requires = requires;
                Target = target;
            }

            public bool Matches(InputIntent intent, MoveContext context) =>
                Intent == intent && (context & Requires) == Requires;
        }

        readonly List<string> _ids = new List<string>();
        readonly List<AbilityDefinition> _abilities = new List<AbilityDefinition>();
        readonly List<List<Edge>> _edges = new List<List<Edge>>();
        readonly Dictionary<string, int> _index = new Dictionary<string, int>();
        readonly List<Edge> _entry = new List<Edge>();
        readonly List<Edge> _global = new List<Edge>();
        readonly Func<MoveContext> _context;

        int _current = -1;

        /// <param name="contextProvider">Called during resolution to read the character's situation. Null = always Grounded.</param>
        public ComboGraph(Func<MoveContext> contextProvider = null)
        {
            _context = contextProvider ?? (() => MoveContext.Grounded);
        }

        public int NodeCount => _ids.Count;

        /// <summary>The node playing now, or null.</summary>
        public string CurrentNodeId => _current >= 0 ? _ids[_current] : null;

        public void AddNode(string id, AbilityDefinition ability)
        {
            if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Node id is required.", nameof(id));
            if (ability == null) throw new ArgumentNullException(nameof(ability), $"Node '{id}' has no ability.");
            if (_index.ContainsKey(id)) throw new ArgumentException($"Duplicate combo node '{id}'.", nameof(id));
            _index[id] = _ids.Count;
            _ids.Add(id);
            _abilities.Add(ability);
            _edges.Add(new List<Edge>());
        }

        public void AddEdge(string fromId, InputIntent intent, string toId, MoveContext requires = MoveContext.None)
        {
            _edges[IndexOf(fromId)].Add(new Edge(Check(intent), requires, IndexOf(toId)));
        }

        public void AddEntry(InputIntent intent, string toId, MoveContext requires = MoveContext.None)
        {
            _entry.Add(new Edge(Check(intent), requires, IndexOf(toId)));
        }

        public void AddGlobal(InputIntent intent, string toId, MoveContext requires = MoveContext.None)
        {
            _global.Add(new Edge(Check(intent), requires, IndexOf(toId)));
        }

        public IntentMask ResolvableIntents(AbilityDefinition current)
        {
            var context = _context();
            int node = CurrentNodeFor(current);
            IntentMask mask = IntentMask.None;
            if (node >= 0) mask |= MaskOf(_edges[node], context);
            mask |= MaskOf(_global, context);
            if (node < 0) mask |= MaskOf(_entry, context);
            return mask;
        }

        public bool TryResolve(InputIntent intent, AbilityDefinition current, out ResolvedMove move)
        {
            var context = _context();
            int node = CurrentNodeFor(current);
            int target = -1;

            if (node >= 0) target = Find(_edges[node], intent, context);
            if (target < 0) target = Find(_global, intent, context);
            if (target < 0 && node < 0) target = Find(_entry, intent, context);

            move = target >= 0 ? new ResolvedMove(_abilities[target], target) : default;
            return target >= 0;
        }

        public void Commit(in ResolvedMove move) => _current = move.Node;

        int CurrentNodeFor(AbilityDefinition current)
        {
            // Idle, or a move from outside this graph (e.g. a hit reaction): treat as idle.
            if (current == null || _current < 0 || !ReferenceEquals(_abilities[_current], current))
            {
                _current = -1;
                return -1;
            }
            return _current;
        }

        static int Find(List<Edge> edges, InputIntent intent, MoveContext context)
        {
            for (int i = 0; i < edges.Count; i++)
                if (edges[i].Matches(intent, context)) return edges[i].Target;
            return -1;
        }

        static IntentMask MaskOf(List<Edge> edges, MoveContext context)
        {
            IntentMask mask = IntentMask.None;
            for (int i = 0; i < edges.Count; i++)
                if ((context & edges[i].Requires) == edges[i].Requires) mask |= edges[i].Intent.ToMask();
            return mask;
        }

        int IndexOf(string id)
        {
            if (id == null || !_index.TryGetValue(id, out int i))
                throw new ArgumentException($"Unknown combo node '{id}'. Add nodes before edges.", nameof(id));
            return i;
        }

        static InputIntent Check(InputIntent intent)
        {
            if (intent == InputIntent.None) throw new ArgumentException("An edge needs an input.", nameof(intent));
            return intent;
        }
    }
}
