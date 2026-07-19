import { useState } from "react";
import { findUser } from "../../api/auth";
import type { FindUserResponse, User } from "../../utils/types";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import personPin_w from "../../assets/icons/person_pin_w.svg";

function FindPage() {
  const { isAuthenticated } = useAuth();
  const [userToFind, setUserToFind] = useState("");
  const [notFound, setNotFound] = useState<boolean>(false);
  const [found, setFound] = useState<User[]>([]);
  const navigate = useNavigate();

  const handleFindUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      if (!token) return;

      const res: FindUserResponse = await findUser({
        token: { jwt: token },
        input: {
          username: userToFind,
        },
      });

      if (res.status === 9902) {
        setNotFound(true);
      } else {
        setNotFound(false);
        setFound(res.data.found);
        console.log(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div
      className="d-flex flex-column align-items-center"
      style={{ minHeight: "100vh" }}
    >
      <h1 className="text-white mb-4">Find People</h1>

      <form
        className="d-flex justify-content-center"
        style={{ width: "100%", maxWidth: "500px" }}
        onSubmit={handleFindUser}
      >
        <input
          className="form-control"
          placeholder={
            isAuthenticated
              ? "Search for People"
              : "You need to login to find people."
          }
          value={userToFind}
          onChange={(e) => setUserToFind(e.target.value)}
        />

        <button
          type="submit"
          className="btn text-white ms-2"
          style={{ background: "var(--color-green2)" }}
          disabled={!isAuthenticated}
        >
          Search
        </button>
      </form>

      {(!found || found.length === 0) && notFound && (
        <div
          className="alert mt-4 text-center"
          style={{
            color: "var(--color-white)",
            background: "var(--color-green2)",
            maxWidth: "300px",
            width: "100%",
          }}
          role="alert"
        >
          There is no user with that username.
        </div>
      )}

      {found &&
        found.length !== 0 &&
        !notFound &&
        found.map((user) => (
          <div
            key={user.username}
            className="d-flex justify-content-between p-3 rounded mt-4"
            style={{
              maxWidth: "300px",
              width: "100%",
              backgroundColor: "var(--color-green2)",
              color: "var(--color-white)",
            }}
          >
            <span className="fw-semibold">{user.display}</span>

            <img
              src={personPin_w}
              alt="View profile"
              onClick={() => navigate("/profile/" + user.username)}
              style={{ cursor: "pointer", width: "24px", height: "24px" }}
            />
          </div>
        ))}
    </div>
  );
}

export default FindPage;
