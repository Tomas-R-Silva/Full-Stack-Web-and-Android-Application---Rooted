import { useState, useEffect } from "react";
import { getUsers } from "../../api/auth";
import type { ShowUsersResponse, User } from "../../utils/types";
import personPin_w from "../../assets/icons/person_pin_w.svg";
import { useNavigate } from "react-router-dom";
import AccountAdminManage from "./Account-Admin-Manage";

function ModerationUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();
  const [managedUser, setManagedUser] = useState<User | null>(null);

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
        <div className="row">
          <div className="col-4">
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

          <div className="col-8">
            {managedUser && <AccountAdminManage user={managedUser} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default ModerationUsers;
