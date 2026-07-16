import { useState, useEffect } from "react";
import type { RequestAddFriend, AddFriendResponse } from "../../utils/types";
import type { RequestUnfriend, UnfriendResponse } from "../../utils/types";
import type {
  RequestFriendsList,
  FriendsListResponse,
} from "../../utils/types";
import type { Friend } from "../../utils/types";
import { useAuth } from "../AuthContext";
import { getFriendsList, unfriend } from "../../api/auth";
import personPin_w from "../../assets/icons/person_pin_w.svg";
import personRemove_w from "../../assets/icons/person_remove_w.svg";
import { useNavigate } from "react-router-dom";

function FriendsList() {
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

  const handleUnfriend = async (friendToDelete: string) => {
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

      const res: UnfriendResponse = await unfriend({
        token: { jwt: token },
        input: { username: friendToDelete },
      });
      console.log(res.data.message);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadFriends();
  }, []);

  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">Friend List</h1>
            <p className="text-white mb-4">
              View and manage your account friends list.
            </p>
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

                    <img
                      src={personRemove_w}
                      alt="Remove friend"
                      onClick={() => handleUnfriend(friend.Friend)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default FriendsList;
