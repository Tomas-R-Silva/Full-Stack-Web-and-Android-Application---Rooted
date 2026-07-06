import type { User, UserProps } from "../../utils/types";

function AccountAdminManage({ user }: UserProps) {
  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1
              className="fw-bold mb-3"
              style={{
                color: "var(--color-green)",
              }}
            >
              Account Admin Manage
            </h1>

            <p
              className="mb-4"
              style={{
                color: "var(--color-green)",
              }}
            >
              As Admin you can see and manage some users account information.
            </p>

            <div className="mb-3">
              <label
                className="form-label fw-semibold"
                style={{
                  color: "var(--color-green)",
                }}
              >
                Username
              </label>
              <input
                type="text"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={user.username ? user.username : "No username"}
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label fw-semibold"
                style={{
                  color: "var(--color-green)",
                }}
              >
                E-mail
              </label>
              <input
                type="email"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={user.email ? user.email : "No email"}
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label fw-semibold"
                style={{
                  color: "var(--color-green)",
                }}
              >
                Password
              </label>
              <input
                type="password"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder="••••••••••••"
              />
            </div>

            <div className="mb-3">
              <label
                className="form-label fw-semibold"
                style={{
                  color: "var(--color-green)",
                }}
              >
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
              <label
                className="form-label fw-semibold"
                style={{
                  color: "var(--color-green)",
                }}
              >
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
              <label
                className="form-label fw-semibold"
                style={{
                  color: "var(--color-green)",
                }}
              >
                Role
              </label>
              <input
                type="text"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={user.role ? user.role : "No role"}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <button
                className="btn btn-danger fw-bold px-4"
                onClick={() => {
                  // Handle delete account
                }}
              >
                Delete Account
              </button>

              <button
                className="btn text-white fw-bold px-4"
                style={{ background: "var(--color-green2)" }}
                onClick={() => {
                  // Handle save changes
                }}
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

export default AccountAdminManage;
