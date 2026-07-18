import type {
  RequestDeleteAccount,
  RequestModAccount,
  UserInformationResponse,
  UserProps,
} from "../../utils/types";
import { useState, useEffect } from "react";
import type { RequestChangeRole } from "../../utils/types";
import { deleteAccount, changeRole, getUser, modAccount } from "../../api/auth";
import { useNotification } from "../NotificationContext";
import { countries } from "../../utils/countries";

type ErrorState = {
  [K in keyof RequestModAccount["input"]]: string;
};

function AccountAdminManage({ user }: UserProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const { notify } = useNotification();
  const [userInfo, setUserInfo] = useState<UserInformationResponse>();
  const [formData, setFormData] = useState<RequestModAccount>({
    token: { jwt: "" },
    input: {
      username: user.username ?? "",
      email: "",
      bio: "",
      country: "",
      birth: 0,
      category: [],
    },
  });

  const [errors, setErrors] = useState<ErrorState>({
    username: "",
    email: "",
    bio: "",
    country: "",
    birth: "",
    category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
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

  const handleNewRole = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setNewRole(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      const payloadRole: RequestChangeRole = {
        token: {
          jwt: token,
        },
        input: {
          username: user.username,
          newrole: newRole,
        },
      };

      const payloadMod: RequestModAccount = {
        ...formData,
        token: {
          jwt: token,
        },
      };

      console.log(payloadRole);
      const responseRole = await changeRole(payloadRole);
      console.log(responseRole);
      console.log(payloadMod);
      const responseMod = await modAccount(payloadMod);
      console.log(responseMod);
      window.location.reload();
      if (responseRole.status === 200) {
        notify("ACCOUNT_UPDATED");
      }
      if (responseMod.status === 200) {
        notify("ACCOUNT_UPDATED");
      }
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
      if (response.status === 200) {
        notify("ACCOUNT_DELETED");
      }
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const loadUser = async (user: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!user) {
        console.log("Invalid username");
        return;
      }

      const res: UserInformationResponse = await getUser({
        token: { jwt: token },
        input: {
          username: user,
        },
      });
      console.log(res);
      setUserInfo(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    setNewRole(user.role);
    setConfirmDelete(false);
    loadUser(user.username);
  }, [user]);

  useEffect(() => {
    if (!userInfo) return;

    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        username: userInfo.data.username,
        email: userInfo.data.email ?? "",
        bio: userInfo.data.bio ?? "",
        country: userInfo.data.country ?? "",
        birth: userInfo.data.birth ?? 0,
        category: userInfo.data.category ?? [],
      },
    }));
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
              As Admin you can see and manage the users roles.
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
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={user.username ?? "No username"}
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
                name="email"
                value={user.email ?? ""}
                readOnly
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
              </div>

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
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Biography</label>
              <textarea
                name="bio"
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                Country
                {!userInfo?.data.country && (
                  <span
                    title="This field is required."
                    style={{ color: "var(--color-gold)", fontSize: "18px" }}
                  >
                    ⚠️
                  </span>
                )}
              </label>

              {!userInfo?.data.country && (
                <small className="text-warning d-block mb-2">
                  Country to be completed.
                </small>
              )}

              <select
                name="country"
                value={formData.input.country}
                onChange={handleChange}
                className="form-select border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
              >
                <option value="">Select your country...</option>

                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold d-flex align-items-center gap-2">
                Date of Birth
                {!userInfo?.data.birth && (
                  <span
                    title="This field is required."
                    style={{ color: "var(--color-gold)", fontSize: "18px" }}
                  >
                    ⚠️
                  </span>
                )}
              </label>

              {!userInfo?.data.birth && (
                <small className="text-warning d-block mb-2">
                  Date of birth to be completed.
                </small>
              )}

              <input
                type="date"
                name="birth"
                value={
                  formData.input.birth
                    ? new Date(formData.input.birth).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    input: {
                      ...prev.input,
                      birth: new Date(e.target.value).getTime(),
                    },
                  }))
                }
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
                <option value="PARTNER">PARTNER</option>
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
