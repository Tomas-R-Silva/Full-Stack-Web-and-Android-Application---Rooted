import type { MessageDeleteResponse, MessageProps } from "../../utils/types";
import replyAll from "../../assets/icons/reply_all.svg";
import close_w from "../../assets/icons/close_white.svg";
import { DeleteMessage, getUser } from "../../api/auth";
import type { UserInformationResponse } from "../../utils/types";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useNotification } from "../NotificationContext";
import verified from "../../assets/icons/verified_w.svg";

function MessageRight(texts: MessageProps) {
  const { username, role } = useAuth();
  const [user, setUser] = useState<UserInformationResponse>();
  const [sdgs, setSdgs] = useState<{ id: number; value: number }[]>([]);
  const { notify } = useNotification();

  const handleTime = (timestamp: number): string => {
    const date = new Date(timestamp);

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${day}/${month} ${hours}:${minutes}`;
  };

  const handleSetParent = (parentText: string | undefined) => {
    if (parentText) texts.setParentText(parentText);
    if (texts.postId) texts.setParentId(texts.postId);
  };

  const handleDeleteMsg = async (postId: string | undefined) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token || !postId) return;

      const res: MessageDeleteResponse = await DeleteMessage({
        token: { jwt: token },
        input: postId,
      });
      console.log(res.data.message);
      window.location.reload();
      if (res.status === 200) {
        notify("MESSAGE_DELETED");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadUser = async (organizer: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      if (!organizer) {
        console.log("Invalid username");
        return;
      }

      const res: UserInformationResponse = await getUser({
        token: { jwt: token },
        input: {
          username: organizer,
        },
      });
      console.log(res);
      setUser(res);
      setSdgs(loadSDGAnalitics(res.data.ods));
    } catch (err) {
      console.error(err);
    }
  };

  const loadSDGAnalitics = (sdgs: number[]) => {
    return sdgs
      .map((value, index) => ({
        id: index + 1,
        value,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  };

  useEffect(() => {
    loadUser(texts.authorUsername);
  }, [texts.authorUsername]);

  return (
    <>
      <div className="d-flex justify-content-end text-end mt-2">
        {texts.parentText && (
          <div
            className="rounded-3 p-3"
            style={{
              maxWidth: "25%",
              width: "fit-content",
              background: "var(--color-green2)",
              color: "var(--color-white)",
              opacity: "50%",
            }}
          >
            <p className="mb-1">{texts.parentText}</p>
          </div>
        )}
      </div>
      <div className="d-flex justify-content-end text-end">
        <div
          className="rounded-3 p-3"
          style={{
            maxWidth: "75%",
            width: "fit-content",
            background:
              texts.eventOrganizer === texts.authorUsername
                ? "var(--color-gold)"
                : "var(--color-white)",
            color:
              texts.eventOrganizer === texts.authorUsername
                ? "var(--color-white)"
                : "var(--color-green2)",
          }}
        >
          <div className="d-flex align-items-center justify-content-end mb-2">
            <small
              className="fw-bold mb-0"
              style={{
                color:
                  texts.eventOrganizer === texts.authorUsername
                    ? "var(--color-white)"
                    : "var(--color-green2)",
              }}
            >
              {user?.data.username}
              {user?.data.role === "PARTNER" && (
                <img className="ms-1" src={verified} />
              )}
            </small>

            <div className="d-flex gap-1 ms-2">
              {sdgs.map(({ id, value }) => (
                <div
                  key={id}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor:
                      value !== 0
                        ? `var(--color-ods${id})`
                        : "var(--color-white)",
                    border: `1px solid ${
                      value !== 0
                        ? `var(--color-ods${id})`
                        : "var(--color-green)"
                    }`,
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>
          <p className="mb-1">{texts.text}</p>

          <small>{handleTime(texts.createdAt)}</small>

          <img
            className=""
            src={replyAll}
            onClick={() => handleSetParent(texts.text)}
            style={{ cursor: "pointer" }}
          />
          {(role === "ADMIN" ||
            username === texts.authorUsername ||
            username === texts.eventOrganizer) && (
            <img
              className=""
              src={close_w}
              onClick={() => handleDeleteMsg(texts.postId)}
              style={{ cursor: "pointer" }}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default MessageRight;
