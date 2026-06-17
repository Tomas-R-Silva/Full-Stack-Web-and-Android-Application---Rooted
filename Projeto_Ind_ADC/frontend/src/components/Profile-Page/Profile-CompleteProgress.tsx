function ProfileCompleteProgress({ step }: { step: number }) {
  const steps = ["Avatar", "Biography", "Friends"];

  return (
    <div className="d-flex align-items-center px-4 py-4">
      {steps.map((label, i) => {
        const stepNumber = i + 1;
        const isDone = step > stepNumber;
        const isActive = step === stepNumber;

        return (
          <>
            <div
              key={label}
              className="d-flex flex-column align-items-center gap-1"
            >
              <div
                className="d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  background:
                    isDone || isActive
                      ? "var(--color-green)"
                      : "var(--color-white)",
                  color:
                    isDone || isActive
                      ? "var(--color-white)"
                      : "var(--color-green)",
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                {isDone ? "✓" : stepNumber}
              </div>
              <span
                style={{
                  color: "var(--color-green)",
                  fontSize: 12,
                }}
              >
                {label}
              </span>
            </div>

            {i < steps.length - 1 && (
              <div
                className="flex-grow-1 mx-2"
                style={{
                  background: isDone
                    ? "var(--color-green)"
                    : "var(--color-white)",
                  height: 4,
                  marginBottom: 20,
                }}
              />
            )}
          </>
        );
      })}
    </div>
  );
}

export default ProfileCompleteProgress;
