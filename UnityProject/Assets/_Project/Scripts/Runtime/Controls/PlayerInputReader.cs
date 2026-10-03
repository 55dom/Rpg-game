using System;
using UnityEngine;
using UnityEngine.InputSystem;
using Unwritten.Core.Input;

namespace Unwritten.Runtime.Controls
{
    /// <summary>
    /// Turns raw device input into <see cref="InputIntent"/>s and a move vector.
    /// Gameplay code listens to this component and never touches devices directly.
    ///
    /// Bindings (built in code, so they're versioned with the project):
    ///   Gamepad   Light = X/Square, Heavy = Y/Triangle, Jump = A/Cross, Dodge = B/Circle,
    ///             Block = LB/L1, hold RB/R1 + face button = Spell 1–4, LB + RB together = Ultimate
    ///   Keyboard  Move = WASD, Light = J or left mouse, Heavy = K or right mouse, Jump = Space,
    ///             Dodge = Left Shift, Block = Q, Spells = 1–4, Ultimate = R
    ///   Touch     On-Screen Controls drive a virtual gamepad, so they use the gamepad bindings
    ///             above with no extra code (see docs/SETUP.md).
    /// </summary>
    [DefaultExecutionOrder(-500)]
    public sealed class PlayerInputReader : MonoBehaviour
    {
        /// <summary>Raised once per button press, already mapped to an intent.</summary>
        public event Action<InputIntent> IntentPressed;

        /// <summary>Movement input, -1..1 on each axis.</summary>
        public Vector2 Move => _move != null ? _move.ReadValue<Vector2>() : Vector2.zero;

        /// <summary>The last intent raised (for the debug HUD).</summary>
        public InputIntent LastIntent { get; private set; }

        InputAction _move;
        InputAction _light, _heavy, _jump, _dodge, _block;
        InputAction _spellModifier, _spell1, _spell2, _spell3, _spell4, _ultimate;
        InputAction[] _all;

        void Awake()
        {
            _move = new InputAction("Move", InputActionType.Value, expectedControlType: "Vector2");
            _move.AddCompositeBinding("2DVector")
                .With("Up", "<Keyboard>/w")
                .With("Down", "<Keyboard>/s")
                .With("Left", "<Keyboard>/a")
                .With("Right", "<Keyboard>/d");
            _move.AddBinding("<Gamepad>/leftStick");

            _light = Button("Light", "<Gamepad>/buttonWest", "<Keyboard>/j", "<Mouse>/leftButton");
            _heavy = Button("Heavy", "<Gamepad>/buttonNorth", "<Keyboard>/k", "<Mouse>/rightButton");
            _jump = Button("Jump", "<Gamepad>/buttonSouth", "<Keyboard>/space");
            _dodge = Button("Dodge", "<Gamepad>/buttonEast", "<Keyboard>/leftShift");
            _block = Button("Block", "<Gamepad>/leftShoulder", "<Keyboard>/q");
            _spellModifier = Button("SpellModifier", "<Gamepad>/rightShoulder");
            _spell1 = Button("Spell1", "<Keyboard>/1");
            _spell2 = Button("Spell2", "<Keyboard>/2");
            _spell3 = Button("Spell3", "<Keyboard>/3");
            _spell4 = Button("Spell4", "<Keyboard>/4");
            _ultimate = Button("Ultimate", "<Keyboard>/r");

            _all = new[] { _move, _light, _heavy, _jump, _dodge, _block, _spellModifier, _spell1, _spell2, _spell3, _spell4, _ultimate };
        }

        void OnEnable()
        {
            _light.performed += OnLight;
            _heavy.performed += OnHeavy;
            _jump.performed += OnJump;
            _dodge.performed += OnDodge;
            _block.performed += OnBlock;
            _spellModifier.performed += OnSpellModifier;
            _spell1.performed += OnSpell1;
            _spell2.performed += OnSpell2;
            _spell3.performed += OnSpell3;
            _spell4.performed += OnSpell4;
            _ultimate.performed += OnUltimate;
            foreach (var action in _all) action.Enable();
        }

        void OnDisable()
        {
            foreach (var action in _all) action.Disable();
            _light.performed -= OnLight;
            _heavy.performed -= OnHeavy;
            _jump.performed -= OnJump;
            _dodge.performed -= OnDodge;
            _block.performed -= OnBlock;
            _spellModifier.performed -= OnSpellModifier;
            _spell1.performed -= OnSpell1;
            _spell2.performed -= OnSpell2;
            _spell3.performed -= OnSpell3;
            _spell4.performed -= OnSpell4;
            _ultimate.performed -= OnUltimate;
        }

        void OnDestroy()
        {
            if (_all == null) return;
            foreach (var action in _all) action.Dispose();
        }

        // Face buttons become spells while the gamepad spell modifier (RB/R1) is held.
        void OnLight(InputAction.CallbackContext ctx) => Raise(IsGamepadSpellHeld(ctx) ? InputIntent.Spell1 : InputIntent.Light);
        void OnHeavy(InputAction.CallbackContext ctx) => Raise(IsGamepadSpellHeld(ctx) ? InputIntent.Spell2 : InputIntent.Heavy);
        void OnJump(InputAction.CallbackContext ctx) => Raise(IsGamepadSpellHeld(ctx) ? InputIntent.Spell3 : InputIntent.Jump);
        void OnDodge(InputAction.CallbackContext ctx) => Raise(IsGamepadSpellHeld(ctx) ? InputIntent.Spell4 : InputIntent.Dodge);

        // LB + RB together = Ultimate, whichever is pressed second.
        void OnBlock(InputAction.CallbackContext ctx) => Raise(_spellModifier.IsPressed() ? InputIntent.Ultimate : InputIntent.Block);
        void OnSpellModifier(InputAction.CallbackContext ctx)
        {
            if (_block.IsPressed()) Raise(InputIntent.Ultimate);
        }

        void OnSpell1(InputAction.CallbackContext ctx) => Raise(InputIntent.Spell1);
        void OnSpell2(InputAction.CallbackContext ctx) => Raise(InputIntent.Spell2);
        void OnSpell3(InputAction.CallbackContext ctx) => Raise(InputIntent.Spell3);
        void OnSpell4(InputAction.CallbackContext ctx) => Raise(InputIntent.Spell4);
        void OnUltimate(InputAction.CallbackContext ctx) => Raise(InputIntent.Ultimate);

        bool IsGamepadSpellHeld(InputAction.CallbackContext ctx)
        {
            return ctx.control.device is Gamepad && _spellModifier.IsPressed();
        }

        void Raise(InputIntent intent)
        {
            LastIntent = intent;
            IntentPressed?.Invoke(intent);
        }

        static InputAction Button(string name, params string[] bindingPaths)
        {
            var action = new InputAction(name, InputActionType.Button);
            foreach (var path in bindingPaths) action.AddBinding(path);
            return action;
        }
    }
}
