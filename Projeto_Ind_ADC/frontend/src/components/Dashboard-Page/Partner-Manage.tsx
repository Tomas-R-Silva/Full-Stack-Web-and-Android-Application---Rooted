import type {
  RequestDeleteAccount,
  RequestModAccount,
  UserInformationResponse,
  UserProps,
} from "../../utils/types";
import { useState, useEffect } from "react";
import type { RequestChangeRole } from "../../utils/types";
import { deleteAccount, changeRole, getUser } from "../../api/auth";
import { useNotification } from "../NotificationContext";
import { countries } from "../../utils/countries";

type ErrorState = {
  [K in keyof RequestModAccount["input"]]: string;
};

function PartnerManage({ user }: UserProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newRole, setNewRole] = useState(user.role);
  const { notify } = useNotification();

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

      console.log(payloadRole);
      const responseRole = await changeRole(payloadRole);
      console.log(responseRole);
      window.location.reload();
      if (responseRole.status === 200) {
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

  useEffect(() => {
    setNewRole(user.role);
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

export default PartnerManage;
