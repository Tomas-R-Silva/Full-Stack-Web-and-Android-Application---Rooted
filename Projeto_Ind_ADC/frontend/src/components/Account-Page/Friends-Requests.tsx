import { useState, useEffect } from "react";
import type { RequestAddFriend, AddFriendResponse } from "../../utils/types";
import type { RequestUnfriend, UnfriendResponse } from "../../utils/types";
import type {
  RequestFriendsRequests,
  FriendsRequestsResponse,
} from "../../utils/types";
import type { Friend } from "../../utils/types";
import { useAuth } from "../AuthContext";
import { getFriendsRequests } from "../../api/auth";
import personAdd_w from "../../assets/icons/person_add_w.svg";
import personRemove_w from "../../assets/icons/person_remove_w.svg";

function FriendsRequests() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { username } = useAuth();

  const loadRequests = async () => {
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

      const res: FriendsRequestsResponse = await getFriendsRequests({
        token: { jwt: token },
      });

      console.log(res.data);
      setFriends(res.data.friends);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddfriend = () => {};

  const handleUnfriend = () => {};

  useEffect(() => {
    loadRequests();
  }, []);

  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">Friend Requests</h1>
            <p className="text-white mb-4">
              View and manage your account friends requests.
            </p>
            {friends.length === 0 && (
              <div
                className="alert alert-light"
                style={{ color: "var(--color-green)" }}
                role="alert"
              >
                No friends requests.
              </div>
            )}
            {friends.length !== 0 && (
              <div className="d-flex justify-content-center">
                <div
                  className="d-flex justify-content-between align-items-center p-4 rounded"
                  style={{
                    maxWidth: "500px",
                    width: "100%",
                    backgroundColor: "var(--color-green2)",
                    color: "var(--color-white)",
                  }}
                >
                  <span className="fw-semibold">Ti zé Taxista</span>

                  <div className="d-flex gap-3">
                    <img
                      src={personAdd_w}
                      alt="Add friend"
                      onClick={handleAddfriend}
                      style={{ cursor: "pointer" }}
                    />

                    <img
                      src={personRemove_w}
                      alt="Remove friend"
                      onClick={handleUnfriend}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FriendsRequests;
