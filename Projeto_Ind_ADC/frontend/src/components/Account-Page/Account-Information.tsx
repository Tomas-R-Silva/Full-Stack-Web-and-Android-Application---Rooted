import { useAuth } from "../AuthContext";

function AccountInformation() {
  const { username, role, email } = useAuth();

  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">Account Information</h1>

            <p className="text-white mb-4">
              Update your account information: Manage important personal
              information here.
            </p>

            <div className="mb-3">
              <label className="form-label text-white fw-semibold">
                Username
              </label>
              <input
                type="text"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={username ? username : "No username"}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white fw-semibold">
                E-mail
              </label>
              <input
                type="email"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={email ? email : "No email"}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white fw-semibold">
                Password
              </label>
              <input
                type="password"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white fw-semibold">
                Country
              </label>
              <input
                type="text"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white fw-semibold">
                Date of Birth
              </label>
              <input
                type="date"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-white fw-semibold">Role</label>
              <input
                type="text"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={role ? role : "No role"}
              />
            </div>

            <div className="d-flex justify-content-end">
              <button
                className="btn text-white fw-bold px-4"
                style={{ background: "var(--color-green2)" }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountInformation;
