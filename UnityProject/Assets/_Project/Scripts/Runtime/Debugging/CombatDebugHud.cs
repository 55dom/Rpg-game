using System.Text;
using UnityEngine;
using Unwritten.Core.Input;
using Unwritten.Runtime.Abilities;

namespace Unwritten.Runtime.Debugging
{
    /// <summary>
    /// On-screen frame data for tuning combat: current ability, frame, phase, hitstop,
    /// buffered inputs, mana, and FPS. Editor and development builds only.
    /// Scales with screen height so it stays readable on phones.
    /// </summary>
    public sealed class CombatDebugHud : MonoBehaviour
    {
        [SerializeField] AbilityRunnerComponent target;
        [SerializeField] bool visible = true;
        [SerializeField] int fontSize = 22;

#if UNITY_EDITOR || DEVELOPMENT_BUILD
        readonly StringBuilder _text = new StringBuilder(512);
        readonly InputIntent[] _buffered = new InputIntent[8];
        GUIStyle _style;
        float _fpsSmoothed;

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

            if (runner.InHitstop) _text.Append("<color=yellow>HITSTOP ").Append(runner.Hitstop).Append("</color>\n");

            _text.Append("Mana ").Append(Mathf.RoundToInt(target.Mana.Current)).Append('/').Append(Mathf.RoundToInt(target.Mana.Max)).Append('\n');

            int count = target.Controller.Buffer.CopyLive(frame, _buffered);
            _text.Append("Buffer: ");
            for (int i = 0; i < count; i++) _text.Append(_buffered[i]).Append(' ');
            _text.Append('\n');

            if (target.Controller.LastRejected != null)
                _text.Append("<color=orange>Rejected ").Append(target.Controller.LastRejected.Id)
                     .Append(": ").Append(target.Controller.LastResult).Append("</color>\n");

            if (target.InputReader != null) _text.Append("Last input: ").Append(target.InputReader.LastIntent).Append('\n');

            GUI.Box(new Rect(16, 16, 720, 300), _text.ToString(), _style);
            GUI.matrix = Matrix4x4.identity;
        }
#endif
    }
}
