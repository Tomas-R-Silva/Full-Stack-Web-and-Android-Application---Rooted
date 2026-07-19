import { useState, useEffect } from "react";

import type { FriendsListResponse } from "../../utils/types";
import type { Friend } from "../../utils/types";
import { useAuth } from "../AuthContext";
import { getFriendsList } from "../../api/auth";
import personPin_w from "../../assets/icons/person_pin_w.svg";
import { useNavigate } from "react-router-dom";
import FriendsChat from "./Friends-Chat";

function FriendsRoom() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [managedFriend, setManagedFriend] = useState<Friend>();
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

      if (res.data.friends.length > 0) {
        setManagedFriend(res.data.friends[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  return (
    <div className="container-fluid py-5 px-5">
      <div
        className="rounded-4 p-3"
        style={{
          background: "var(--color-white)",
          minHeight: "75vh",
        }}
      >
        <div className="row g-3 h-100">
          <div className="col-md-3">
            <div className="h-100">
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
                      key={friend.Friend}
                      className="d-flex justify-content-between align-items-center p-4 rounded mt-1"
                      style={{
                        width: "100%",
                        backgroundColor:
                          managedFriend?.Friend === friend.Friend
                            ? "var(--color-green)"
                            : "var(--color-green2)",
                        color: "var(--color-white)",
                        cursor: "pointer",
                      }}
                      onClick={() => setManagedFriend(friend)}
                    >
                      <span className="fw-semibold">{friend.Friend}</span>

                      <div className="d-flex gap-3">
                        <img
                          src={personPin_w}
                          alt="View profile"
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate("/profile/" + friend.Friend);
                          }}
                          style={{ cursor: "pointer" }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="col-md-9">
            <div className="h-100">
              {managedFriend ? (
                <FriendsChat friend={managedFriend} />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center h-100"
                  style={{ color: "var(--color-green)" }}
                >
                  Select a friend to start chatting.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FriendsRoom;
