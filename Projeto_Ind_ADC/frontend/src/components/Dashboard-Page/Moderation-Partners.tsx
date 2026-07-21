import { useState, useEffect } from "react";
import { changeRole, getUsers } from "../../api/auth";
import type {
  RequestChangeRole,
  ShowUsersResponse,
  User,
} from "../../utils/types";
import personPin_w from "../../assets/icons/person_pin_w.svg";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../NotificationContext";

function ModerationPartners() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [managedUser, setManagedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("");

  const loadUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      const res: ShowUsersResponse = await getUsers({
        token: { jwt: token },
      });

      const fetchedUsers = res.data.users;

      setUsers(fetchedUsers);

      if (fetchedUsers && fetchedUsers.length > 0) {
        setManagedUser(fetchedUsers[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManagedUser = (user: User) => {
    setManagedUser(user);
    if (!managedUser) return;
    setNewRole(managedUser.role);
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
      if (!token || !managedUser) {
        console.log("User is not authenticated or invalid user");
        return;
      }

      const payloadRole: RequestChangeRole = {
        token: {
          jwt: token,
        },
        input: {
          username: managedUser.username,
          newrole: newRole,
        },
      };

      console.log(payloadRole);
      const responseRole = await changeRole(payloadRole);
      console.log(responseRole);

      window.location.reload();
      if (responseRole.status === 200) {
        notify("PARTNER_ROLE_SETTED");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const totalUsers = users.length;
  const totalUserRole = users.filter((u) => u.role === "USER").length;
  const totalBackOfficerRole = users.filter(
    (u) => u.role === "BOFFICER",
  ).length;
  const totalAdminRole = users.filter((u) => u.role === "ADMIN").length;

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <>
      <div className="container py-3">
        <div className="row g-3">
          <div className="col-lg-4 col-12">
            <h4>All Users:</h4>
            <div
              className="container border rounded p-3"
              style={{
                maxHeight: "500px",
                overflowY: "auto",
              }}
            >
              {users.length === 0 && (
                <div
                  className="alert alert-light"
                  style={{ color: "var(--color-green)" }}
                  role="alert"
                >
                  No users.
                </div>
              )}
              {users.length !== 0 &&
                users.map((user) => (
                  <div
                    className="d-flex justify-content-between align-items-start p-4 rounded mt-2"
                    style={{
                      maxWidth: "500px",
                      width: "100%",
                      backgroundColor:
                        managedUser?.username === user.username
                          ? "var(--color-green)"
                          : "var(--color-green2)",
                      color: "var(--color-white)",
                      cursor: "pointer",
                    }}
                    onClick={() => handleManagedUser(user)}
                  >
                    <div>
                      <span className="fw-semibold">Username: </span>
                      <span>{user.username}</span>

                      <div>
                        <span className="fw-semibold">Email: </span>
                        <span>{user.email}</span>
                      </div>

                      <div>
                        <span className="fw-semibold">Role: </span>
                        <span>{user.role}</span>
                      </div>
                    </div>

                    <div
                      className="d-flex flex-column justify-content-between align-items-end"
                      style={{ height: "100%" }}
                    >
                      <img
                        src={personPin_w}
                        alt="View Profile"
                        onClick={() => navigate("/profile/" + user.username)}
                        style={{ cursor: "pointer" }}
                      />
                    </div>
                  </div>
                ))}
            </div>
            <div
              className="container border rounded p-3 mt-3"
              style={{
                backgroundColor: "var(--color-green2)",
                color: "var(--color-white)",
              }}
            >
              <div className="d-flex justify-content-between">
                <span>Total Users</span>
                <strong>{totalUsers}</strong>
              </div>

              <hr className="my-2" />

              <div className="d-flex justify-content-between">
                <span>Users</span>
                <strong>{totalUserRole}</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span>Back Officers</span>
                <strong>{totalBackOfficerRole}</strong>
              </div>

              <div className="d-flex justify-content-between">
                <span>Admins</span>
                <strong>{totalAdminRole}</strong>
              </div>
            </div>
          </div>

          <div className="col-lg-8 col-12">
            <div className="container">
              <div className="row w-100 justify-content-center">
                {managedUser && (
                  <div className="col-12 col-lg-8">
                    <h1
                      className="fw-bold mb-3"
                      style={{
                        color: "var(--color-green)",
                      }}
                    >
                      Partner Accounts Manage
                    </h1>

                    <p
                      className="mb-4"
                      style={{
                        color: "var(--color-green)",
                      }}
                    >
                      Set and manage which accounts are partners.
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
                        value={managedUser.username ?? ""}
                        readOnly
                        className="form-control border-0"
                        style={{
                          backgroundColor: "var(--color-green)",
                          color: "var(--color-white)",
                        }}
                        placeholder={managedUser.username ?? "No username"}
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "var(--color-green)",
                        }}
                      >
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={managedUser.display ?? ""}
                        readOnly
                        className="form-control border-0"
                        style={{
                          backgroundColor: "var(--color-green)",
                          color: "var(--color-white)",
                        }}
                        placeholder={managedUser.display ?? "No display"}
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "var(--color-green)",
                        }}
                      >
                        Email
                      </label>
                      <input
                        type="text"
                        name="email"
                        value={managedUser.email ?? ""}
                        readOnly
                        className="form-control border-0"
                        style={{
                          backgroundColor: "var(--color-green)",
                          color: "var(--color-white)",
                        }}
                        placeholder={managedUser.email ?? "No email"}
                      />
                    </div>
                    <div className="mb-4">
                      <label
                        className="form-label fw-semibold"
                        style={{
                          color: "var(--color-green)",
                        }}
                      >
                        New Role
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
                      </select>
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModerationPartners;
