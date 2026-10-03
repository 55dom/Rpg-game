using System.Text;
using UnityEngine;
using Unwritten.Core.Input;
using Unwritten.Runtime.Abilities;
using Unwritten.Runtime.Characters;
using Unwritten.Runtime.Combat;

namespace Unwritten.Runtime.Debugging
{
    /// <summary>
    /// On-screen frame data for tuning combat: current ability, frame, phase, hitstop,
    /// buffered inputs, mana, health, posture, combo node, and the locked target.
    /// Editor and development builds only. Scales with screen height so it stays readable on phones.
    /// </summary>
    public sealed class CombatDebugHud : MonoBehaviour
    {
        [SerializeField] AbilityRunnerComponent target;
        [SerializeField] bool visible = true;
        [SerializeField] int fontSize = 22;

#if UNITY_EDITOR || DEVELOPMENT_BUILD
        readonly StringBuilder _text = new StringBuilder(768);
        readonly InputIntent[] _buffered = new InputIntent[8];
        GUIStyle _style;
        float _fpsSmoothed;
        CombatantComponent _combatant;
        PlayerController _player;

        void Start()
        {
            if (target != null)
            {
                _combatant = target.GetComponent<CombatantComponent>();
                _player = target.GetComponent<PlayerController>();
            }
        }

        void Update()
        {
            float fps = Time.unscaledDeltaTime > 0f ? 1f / Time.unscaledDeltaTime : 0f;
            _fpsSmoothed = Mathf.Lerp(_fpsSmoothed, fps, 0.1f);
        }

        void OnGUI()
        {
            if (!visible || target == null || target.Controller == null) return;

            _style ??= new GUIStyle(GUI.skin.box)
            {
                alignment = TextAnchor.UpperLeft,
                richText = true,
                fontSize = fontSize,
                wordWrap = false,
            };

            float scale = Screen.height / 1080f;
            GUI.matrix = Matrix4x4.Scale(new Vector3(scale, scale, 1f));

            var runner = target.Runner;
            long frame = LogicClock.HasInstance ? LogicClock.Instance.Frame : 0;

            _text.Clear();
            _text.Append("<b>COMBAT DEBUG</b>   ").Append(Mathf.RoundToInt(_fpsSmoothed)).Append(" fps   logic frame ").Append(frame).Append('\n');

            if (runner.IsRunning)
            {
                _text.Append("Ability  <b>").Append(runner.Current.Id).Append("</b>  frame ")
                     .Append(runner.Frame).Append('/').Append(runner.Current.TotalFrames)
                     .Append("  ").Append(runner.Phase);
                if (runner.HasHit) _text.Append("  HIT");
                _text.Append('\n');
                _text.Append("Cancel into: ").Append(runner.AcceptedIntents()).Append('\n');
            }
            else
            {
                _text.Append("Ability  idle\n\n");
            }

            if (target.Graph != null) _text.Append("Combo node: ").Append(target.Graph.CurrentNodeId ?? "—").Append('\n');
            if (runner.InHitstop) _text.Append("<color=yellow>HITSTOP ").Append(runner.Hitstop).Append("</color>\n");

            if (_combatant != null)
            {
                var c = _combatant.Core;
                _text.Append("HP ").Append(Mathf.RoundToInt(c.Health.Current)).Append('/').Append(Mathf.RoundToInt(c.Health.Max))
                     .Append("   Posture ").Append(Mathf.RoundToInt(c.Posture.Current)).Append('/').Append(Mathf.RoundToInt(c.Posture.Max));
                if (c.InvulnerableFrames > 0) _text.Append("   <color=cyan>INVULN ").Append(c.InvulnerableFrames).Append("</color>");
                if (c.ParryFrames > 0) _text.Append("   <color=cyan>PARRY ").Append(c.ParryFrames).Append("</color>");
                if (c.Blocking) _text.Append("   BLOCK");
                if (c.IsStaggered) _text.Append("   <color=orange>STAGGER ").Append(c.StaggerFrames).Append("</color>");
                _text.Append('\n');
            }

            _text.Append("Mana ").Append(Mathf.RoundToInt(target.Mana.Current)).Append('/').Append(Mathf.RoundToInt(target.Mana.Max)).Append('\n');

            int count = target.Controller.Buffer.CopyLive(frame, _buffered);
            _text.Append("Buffer: ");
            for (int i = 0; i < count; i++) _text.Append(_buffered[i]).Append(' ');
            _text.Append('\n');

            if (target.Controller.LastRejected != null)
                _text.Append("<color=orange>Rejected ").Append(target.Controller.LastRejected.Id)
                     .Append(": ").Append(target.Controller.LastResult).Append("</color>\n");

            if (target.InputReader != null) _text.Append("Last input: ").Append(target.InputReader.LastIntent).Append('\n');

            if (_player != null && _player.LockTarget != null)
            {
                var t = _player.LockTarget.Core;
                _text.Append("Target ").Append(_player.LockTarget.name).Append("  HP ").Append(Mathf.RoundToInt(t.Health.Current))
                     .Append("  Posture ").Append(Mathf.RoundToInt(t.Posture.Current));
                if (t.PostureBroken) _text.Append("  <color=yellow>BROKEN</color>");
                _text.Append('\n');
            }

            GUI.Box(new Rect(16, 16, 760, 380), _text.ToString(), _style);
            GUI.matrix = Matrix4x4.identity;
        }
#endif
    }
}
