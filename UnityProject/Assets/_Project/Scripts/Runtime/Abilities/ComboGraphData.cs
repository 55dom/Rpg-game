using System;
using System.Collections.Generic;
using UnityEngine;
using Unwritten.Core.Abilities;
using Unwritten.Core.Input;

namespace Unwritten.Runtime.Abilities
{
    /// <summary>
    /// A character's moveset as data (Create > Unwritten > Combo Graph).
    /// Each node is a move (an <see cref="AbilityData"/>); edges say which input leads where.
    ///
    /// Example (Rook, Duelist stance):
    ///   Entries:  Light → L1 [Grounded], Light → AirL1 [Airborne], Jump → Jump, Spell1 → GaleCutter
    ///   Edges:    L1 –Light→ L2 –Light→ L3 –Light→ L4;  L2 –Heavy→ Launcher
    ///   Globals:  Dodge → Dodge, Spell1 → GaleCutter, Jump → Jump
    /// </summary>
    [CreateAssetMenu(menuName = "Unwritten/Combo Graph", fileName = "CG_NewMoveset")]
    public sealed class ComboGraphData : ScriptableObject
    {
        [Serializable]
        public struct NodeEntry
        {
            [Tooltip("Unique within this graph, e.g. L1, AirL2, Launcher.")]
            public string id;
            public AbilityData ability;
        }

        [Serializable]
        public struct EdgeEntry
        {
            [Tooltip("Leave empty for entry and global edges.")]
            public string from;
            public InputIntent input;
            public string to;
            [Tooltip("All of these must be true for the edge to apply.")]
            public MoveContext requires;
        }

        [SerializeField] List<NodeEntry> nodes = new List<NodeEntry>();

        [Tooltip("The combo strings: from a move, this input leads to that move.")]
        [SerializeField] List<EdgeEntry> edges = new List<EdgeEntry>();

        [Tooltip("What each input starts from idle. 'From' is ignored.")]
        [SerializeField] List<EdgeEntry> entries = new List<EdgeEntry>();

        [Tooltip("Available from any move whose cancel window allows the input (dodge, spells). 'From' is ignored.")]
        [SerializeField] List<EdgeEntry> globals = new List<EdgeEntry>();

        /// <summary>Build a fresh runtime graph. Each character needs its own instance (it tracks the current move).</summary>
        public ComboGraph Build(Func<MoveContext> contextProvider)
        {
            var graph = new ComboGraph(contextProvider);
            foreach (var n in nodes)
            {
                if (n.ability == null) throw new InvalidOperationException($"{name}: node '{n.id}' has no ability.");
                graph.AddNode(n.id, n.ability.Definition);
            }
            foreach (var e in edges) graph.AddEdge(e.from, e.input, e.to, e.requires);
            foreach (var e in entries) graph.AddEntry(e.input, e.to, e.requires);
            foreach (var e in globals) graph.AddGlobal(e.input, e.to, e.requires);
            return graph;
        }

        void OnValidate()
        {
            try
            {
                Build(null);
            }
            catch (Exception ex)
            {
                Debug.LogWarning($"[ComboGraphData] {name}: {ex.Message}", this);
            }
        }
    }
}
