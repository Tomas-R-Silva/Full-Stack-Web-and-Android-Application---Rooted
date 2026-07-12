import { useAuth } from "../AuthContext";
import type {
  RequestChangePassword,
  RequestModAccount,
} from "../../utils/types";
import { useState, useEffect } from "react";
import { changePassword, modAccount } from "../../api/auth";
import { getUser } from "../../api/auth";
import type { UserInformationResponse } from "../../utils/types";

type ErrorState = {
  [K in keyof RequestModAccount["input"]]: string;
};

function AccountInformation() {
  const { username, role } = useAuth();
  const [user, setUser] = useState<UserInformationResponse>();
  const [changingPassword, setChangingPassword] = useState(false);
  const [formData, setFormData] = useState<RequestModAccount>({
    token: { jwt: "" },
    input: {
      username: username ?? "",
      email: "",
      bio: "",
    },
  });

  const [errors, setErrors] = useState<ErrorState>({
    username: "",
    email: "",
    bio: "",
  });

  const [passwordData, setPassowrdData] = useState<RequestChangePassword>({
    token: { jwt: "" },
    input: {
      username: username ?? "",
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

    setPassowrdData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        [name]: type === "number" ? (value === "" ? -1 : Number(value)) : value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = {
      username: "",
      email: "",
      bio: "",
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
      console.log(payloadMod);
      const responseMod = await modAccount(payloadMod);
      console.log(responseMod);
      console.log(payloadPwd);
      const responsePwd = await changePassword(payloadPwd);
      console.log(responsePwd);
      window.location.reload();
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  const loadUser = async (organizer: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!organizer) {
        console.log("Invalid username");
        return;
      }

      const res: UserInformationResponse = await getUser({
        token: { jwt: token },
        input: {
          username: organizer,
        },
      });
      console.log(res);
      setUser(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!username) return;
    loadUser(username);
  }, [username]);

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
                name="username"
                readOnly
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={user?.data.username + " (Not editable)"}
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-white fw-semibold">
                Display Name
              </label>
              <input
                type="text"
                name="username"
                value={username ?? ""}
                onChange={handleChange}
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={user?.data.display ?? "No username"}
              />
              {errors.username && (
                <small className="text-danger">{errors.username}</small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label text-white fw-semibold">
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
                  (user?.data.email ?? "No email")
                }
              />
              {errors.email && (
                <small className="text-danger">{errors.email}</small>
              )}
            </div>

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-white fw-semibold mb-0">
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
              <label className="form-label text-white fw-semibold">
                Biography
              </label>
              <textarea
                name="bio"
                value={formData.input.bio}
                onChange={handleChange}
                className="form-control border-0"
                style={{
                  backgroundColor: "var(--color-green2)",
                  color: "var(--color-white)",
                }}
                placeholder={
                  "Change your description here. Current: " + user?.data.bio
                }
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
                value={role ?? ""}
                readOnly
              />
            </div>

            <div className="d-flex justify-content-end">
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

export default AccountInformation;
