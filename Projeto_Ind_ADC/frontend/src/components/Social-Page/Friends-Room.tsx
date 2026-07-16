import { useState, useEffect } from "react";

import type {
  RequestFriendsList,
  FriendsListResponse,
} from "../../utils/types";
import type { Friend } from "../../utils/types";
import { useAuth } from "../AuthContext";
import { getFriendsList, unfriend } from "../../api/auth";
import personPin_w from "../../assets/icons/person_pin_w.svg";
import { useNavigate } from "react-router-dom";

function FriendsRoom() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { username } = useAuth();
  const navigate = useNavigate();

  const loadFriends = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!username) {
        console.log("Invalid username");
        return;
      }

      const res: FriendsListResponse = await getFriendsList({
        token: { jwt: token },
        input: { username: username },
      });

      console.log(res.data);
      setFriends(res.data.friends);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  return (
    <>
      <div className="container-fluid py-5 px-5">
        <div className="row g-3">
          <div className="col-md-2">
            <div
              className="rounded-4 h-100 p-3"
              style={{ background: "var(--color-white)" }}
            >
              <div className="flex-column py-3">
                <h3 style={{ color: "var(--color-green)" }}>Friends</h3>
                {friends.length === 0 && (
                  <div
                    className="alert alert-light"
                    style={{ color: "var(--color-green)" }}
                    role="alert"
                  >
                    No friends.
                  </div>
                )}
                {friends.length !== 0 &&
                  friends.map((friend) => (
                    <div
                      className="d-flex justify-content-between align-items-center p-4 rounded mt-1"
                      style={{
                        maxWidth: "500px",
                        width: "100%",
                        backgroundColor: "var(--color-green2)",
                        color: "var(--color-white)",
                      }}
                    >
                      <span className="fw-semibold">{friend.Friend}</span>

                      <div className="d-flex gap-3">
                        <img
                          src={personPin_w}
                          alt="Add friend"
                          onClick={() => navigate("/profile/" + friend.Friend)}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FriendsRoom;
