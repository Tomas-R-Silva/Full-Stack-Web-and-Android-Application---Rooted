import type { RequestDeleteAccount, UserProps } from "../../utils/types";
import { useState, useEffect } from "react";
import type {
  RequestChangePassword,
  RequestModAccount,
  RequestChangeRole,
} from "../../utils/types";
import {
  changePassword,
  deleteAccount,
  modAccount,
  changeRole,
} from "../../api/auth";

type ErrorState = {
  [K in keyof RequestModAccount["input"]]: string;
};

function AccountAdminManage({ user }: UserProps) {
  const [changingPassword, setChangingPassword] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const [formData, setFormData] = useState<RequestModAccount>({
    token: { jwt: "" },
    input: {
      username: user.username ?? "",
      email: "",
    },
  });

  const [errors, setErrors] = useState<ErrorState>({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState<RequestChangePassword>({
    token: { jwt: "" },
    input: {
      username: user.username ?? "",
      oldpassword: "",
      newpassword: "",
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        [name]: type === "number" ? (value === "" ? -1 : Number(value)) : value,
      },
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handlePassword = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        [name]: type === "number" ? (value === "" ? -1 : Number(value)) : value,
      },
    }));
  };

  const handleNewRole = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setNewRole(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      username: "",
      email: "",
    };

    if (formData.input.email && !formData.input.email.includes("@")) {
      newErrors.email = "Must be a valid email.";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some((error) => error !== "");
    if (hasErrors) return;

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      const payloadMod: RequestModAccount = {
        ...formData,
        token: {
          jwt: token,
        },
      };

      const payloadPwd: RequestChangePassword = {
        ...passwordData,
        token: {
          jwt: token,
        },
      };

      const payloadRole: RequestChangeRole = {
        token: {
          jwt: token,
        },
        input: {
          username: user.username,
          newrole: newRole,
        },
      };
      console.log(payloadMod);
      const responseMod = await modAccount(payloadMod);
      console.log(responseMod);
      console.log(payloadPwd);
      const responsePwd = await changePassword(payloadPwd);
      console.log(responsePwd);
      console.log(payloadRole);
      const responseRole = await changeRole(payloadRole);
      console.log(responseRole);
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      const payload: RequestDeleteAccount = {
        token: {
          jwt: token,
        },
        input: {
          username: user.username,
        },
      };
      console.log(payload);
      const response = await deleteAccount(payload);
      console.log(response);
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  useEffect(() => {
    setFormData({
      token: { jwt: "" },
      input: {
        username: user.username,
        email: "",
      },
    });

    setPasswordData({
      token: { jwt: "" },
      input: {
        username: user.username,
        oldpassword: "",
        newpassword: "",
      },
    });

    setNewRole(user.role);
    setChangingPassword(false);
    setConfirmDelete(false);
  }, [user]);

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
                name="username"
                value={user.username ?? ""}
                readOnly
                onChange={handleChange}
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={user.username ?? "No username"}
              />
              {errors.username && (
                <small className="text-danger">{errors.username}</small>
              )}
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
                name="email"
                value={formData.input.email}
                onChange={handleChange}
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={
                  "Change your email here. Current: " +
                  (user.email ?? "No email")
                }
              />
              {errors.email && (
                <small className="text-danger">{errors.email}</small>
              )}
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label
                  className="form-label fw-semibold mb-0"
                  style={{
                    color: "var(--color-green)",
                  }}
                >
                  Password
                </label>

                <button
                  type="button"
                  className="btn btn-sm text-white"
                  style={{ backgroundColor: "var(--color-green2)" }}
                  onClick={() => setChangingPassword((prev) => !prev)}
                >
                  {changingPassword ? "Cancel" : "Change"}
                </button>
              </div>

              {!changingPassword ? (
                <input
                  type="password"
                  className="form-control border-0"
                  style={{
                    backgroundColor: "var(--color-green2)",
                    color: "var(--color-white)",
                  }}
                  value="••••••••••••"
                  readOnly
                />
              ) : (
                <>
                  <input
                    type="password"
                    name="oldpassword"
                    value={passwordData.input.oldpassword}
                    onChange={handlePassword}
                    className="form-control border-0 mb-2"
                    style={{
                      backgroundColor: "var(--color-green2)",
                      color: "var(--color-white)",
                    }}
                    placeholder="Current password"
                  />

                  <input
                    type="password"
                    name="newpassword"
                    value={passwordData.input.newpassword}
                    onChange={handlePassword}
                    className="form-control border-0"
                    style={{
                      backgroundColor: "var(--color-green2)",
                      color: "var(--color-white)",
                    }}
                    placeholder="New password"
                  />
                </>
              )}
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

              <select
                className="form-select border-0"
                value={newRole}
                onChange={handleNewRole}
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
              >
                <option value="USER">USER</option>
                <option value="BOFFICER">BACKOFFICER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="d-flex justify-content-between align-items-center">
              <div>
                {!confirmDelete && (
                  <button
                    className="btn btn-danger fw-bold px-4"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete Account
                  </button>
                )}
                {confirmDelete && (
                  <>
                    <button
                      className="btn btn-danger fw-bold"
                      onClick={() => setConfirmDelete(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn fw-bold ms-1"
                      style={{
                        background: "var(--color-green2)",
                        color: "var(--color-white)",
                      }}
                      onClick={handleDelete}
                    >
                      Confirm
                    </button>
                  </>
                )}
              </div>

              <button
                type="submit"
                className="btn text-white fw-bold px-4"
                style={{ background: "var(--color-green2)" }}
                onClick={handleSubmit}
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
