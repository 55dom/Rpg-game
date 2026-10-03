using Unwritten.Core.Input;

namespace Unwritten.Core.Abilities
{
    /// <summary>
    /// Receives everything an ability does. The Unity layer implements this to play
    /// animations, enable hitboxes, shake the camera, and so on. Tests implement it
    /// to record what happened.
    /// </summary>
    public interface IAbilityEventSink
    {
        void OnAbilityStarted(AbilityDefinition ability);
        void OnAbilityEvent(AbilityDefinition ability, in AbilityEvent abilityEvent);
        void OnAbilityFinished(AbilityDefinition ability);

        /// <summary>The player cancelled this ability into another input.</summary>
        void OnAbilityCancelled(AbilityDefinition ability, InputIntent into);

        /// <summary>Something external stopped the ability (stagger, death, cutscene).</summary>
        void OnAbilityInterrupted(AbilityDefinition ability);
    }
}
