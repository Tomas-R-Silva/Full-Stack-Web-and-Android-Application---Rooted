import { useState, useEffect } from "react";
import type { RequestAddFriend, AddFriendResponse } from "../../utils/types";
import type { RequestUnfriend, UnfriendResponse } from "../../utils/types";
import type {
  RequestFriendsList,
  FriendsListResponse,
} from "../../utils/types";
import type { Friend } from "../../utils/types";
import { useAuth } from "../AuthContext";
import { getFriendsList } from "../../api/auth";

function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { username } = useAuth();

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
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">Friend List</h1>
            <p className="text-white mb-4">
              View and manage your account friends list.
            </p>
            {friends.length === 0 && (
              <div className="alert alert-light" role="alert">
                No friends.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FriendsList;
