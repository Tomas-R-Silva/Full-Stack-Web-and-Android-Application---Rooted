import { getUser, modAccount } from "../../api/auth";
import type {
  RequestModAccount,
  UserInformationResponse,
} from "../../utils/types";
import { useState, useEffect } from "react";
import { useNotification } from "../NotificationContext";
import { useAuth } from "../AuthContext";
import { getBorderItem } from "../../utils/borders";
import account_circle_w from "../../assets/icons/account_circle_w.svg";

function AccountAvatar() {
  const { notify } = useNotification();
  const { username } = useAuth();
  const [userInfo, setUser] = useState<UserInformationResponse>();
  const [formData, setFormData] = useState<RequestModAccount>({
    token: { jwt: "" },
    input: {
      username: "",
      email: "",
      bio: "",
      country: "",
      birth: 0,
      avatar: "",
      category: [],
    },
  });

  const handleImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      notify("INVALID_FILE");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const imageString = reader.result;

      if (typeof imageString !== "string") {
        return;
      }

      setFormData((prev) => ({
        ...prev,
        input: {
          ...prev.input,
          avatar: imageString,
        },
      }));
    };

    reader.readAsDataURL(file);
  };

  const loadUser = async (username: string) => {
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

      const res: UserInformationResponse = await getUser({
        token: { jwt: token },
        input: {
          username: username,
        },
      });
      console.log(res);
      setUser(res);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      const payload: RequestModAccount = {
        ...formData,
        token: {
          jwt: token,
        },
      };

      console.log(payload.input.avatar);
      const response = await modAccount(payload);
      console.log(response);
      window.location.reload();
      if (response.status === 200) {
        notify("AVATAR_UPDATED");
      }
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  useEffect(() => {
    if (!username) return;
    loadUser(username);
  }, [username]);

  useEffect(() => {
    if (!userInfo) return;

    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        username: userInfo.data.username,
        email: userInfo.data.email ?? "",
        bio: userInfo.data.bio ?? "",
        country: userInfo.data.country ?? "",
        birth: userInfo.data.birth ?? 0,
        avatar: userInfo.data.avatar?.url ?? "",
        category: userInfo.data.category ?? [],
      },
    }));
  }, [userInfo]);

  return (
    <>
      <div className="container">
        <div className="row w-100">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">Avatar</h1>

            <p className="text-white mb-4">Set your account avatar.</p>

            <div className="d-flex flex-column align-items-center justify-content-center">
              <div
                style={{
                  position: "relative",
                  width: "400px",
                  height: "400px",
                  flexShrink: 0,
                }}
              >
                <img
                  src={formData.input.avatar.trim() || account_circle_w}
                  alt="Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />

                {userInfo && userInfo.data.borderID && (
                  <img
                    src={getBorderItem(userInfo.data.borderID)?.image}
                    alt=""
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                )}
              </div>

              <input
                type="file"
                accept="image/*"
                className="form-control mt-3"
                style={{ maxWidth: "400px" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (!file) return;

                  handleImage(file);
                }}
              />

              <button
                type="button"
                className="btn text-white mt-3"
                onClick={handleSubmit}
                style={{ background: "var(--color-green2)" }}
              >
                Save Avatar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountAvatar;
