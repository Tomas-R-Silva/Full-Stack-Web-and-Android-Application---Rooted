function SignInModal({
  onClose,
  response,
}: {
  onClose: () => void;
  response: any;
}) {
  const isSuccess = response?.status === 200;

  const messageMap: Record<number, string> = {
    9901: "This email is already registered.",
    // add more codes here as needed
  };

  const message = isSuccess
    ? "Account created successfully!"
    : (messageMap[response?.status] ??
      `Unexpected error (code: ${response?.status})`);

  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content"
          style={{
            background: "var(--color-bege)",
            border: "4px solid var(--color-green)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            className="modal-body"
            style={{ background: "var(--color-bege)" }}
          >
            <div className="d-flex align-items-center justify-content-center flex-grow-1">
              <span style={{ color: isSuccess ? "var(--color-green)" : "red" }}>
                {message}
              </span>
              {isSuccess ? (
                <a
                  className="btn fw-bold ms-auto"
                  style={{
                    border: "none",
                    background: "var(--color-white)",
                    color: "var(--color-green)",
                    width: "130px",
                    height: "42px",
                    borderRadius: "50px",
                  }}
                  href="/login"
                >
                  Login
                </a>
              ) : (
                <button
                  className="btn fw-bold ms-auto"
                  style={{
                    borderRadius: "50px",
                    width: "130px",
                    height: "42px",
                  }}
                  onClick={onClose}
                >
                  Try again
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-dialog-centered">
        <div
          className="modal-content"
          style={{
            background: "var(--color-bege)",
            border: "4px solid var(--color-green)",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <div
            className="modal-body"
            style={{
              background: "var(--color-bege)",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center flex-grow-1"
              style={{ background: "var(--color-bege)" }}
            >
              <a>Account created with sucess!</a>
              <a
                className="btn fw-bold ms-auto"
                style={{
                  border: "none",
                  background: "var(--color-white)",
                  color: "var(--color-green)",
                  width: "130px",
                  height: "42px",
                  borderRadius: "50px",
                }}
                href="/login"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignInModal;
