using System;

namespace Unwritten.Core.Stats
{
    /// <summary>
    /// A bounded resource such as HP, Mana, Posture, or the Surge gauge.
    /// </summary>
    public sealed class ResourcePool
    {
        float _current;

        public float Max { get; private set; }

        public float Current
        {
            get => _current;
            private set => _current = Clamp(value, 0f, Max);
        }

        public bool IsEmpty => _current <= 0f;
        public bool IsFull => _current >= Max;
        public float Normalized => Max <= 0f ? 0f : _current / Max;

        /// <summary>Raised with (oldValue, newValue) whenever Current changes.</summary>
        public event Action<float, float> Changed;

        public ResourcePool(float max, float? start = null)
        {
            if (max < 0f) throw new ArgumentOutOfRangeException(nameof(max));
            Max = max;
            _current = Clamp(start ?? max, 0f, max);
        }

        /// <summary>Spend the amount only if there is enough. Returns false and changes nothing otherwise.</summary>
        public bool TrySpend(float amount)
        {
            if (amount < 0f) throw new ArgumentOutOfRangeException(nameof(amount));
            if (amount > _current) return false;
            Set(_current - amount);
            return true;
        }

        public bool CanAfford(float amount) => amount <= _current;

        /// <summary>Add (or, with a negative value, remove) an amount, clamped to [0, Max].</summary>
        public void Add(float amount) => Set(_current + amount);

        public void Fill() => Set(Max);

        public void SetMax(float max, bool keepRatio = false)
        {
            if (max < 0f) throw new ArgumentOutOfRangeException(nameof(max));
            float ratio = Normalized;
            Max = max;
            Set(keepRatio ? ratio * max : _current);
        }

        void Set(float value)
        {
            float old = _current;
            Current = value;
            if (old != _current) Changed?.Invoke(old, _current);
        }

        static float Clamp(float v, float min, float max) => v < min ? min : (v > max ? max : v);
    }
}
