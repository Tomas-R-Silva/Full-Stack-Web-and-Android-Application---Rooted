import type { MessageProps } from "../../utils/types";
import replyAll from "../../assets/icons/reply_all.svg";
import { getUser } from "../../api/auth";
import type { UserInformationResponse } from "../../utils/types";
import { useState, useEffect } from "react";

function MessageRight(texts: MessageProps) {
  const [user, setUser] = useState<UserInformationResponse>();
  const sdgs = [1, 10, 17];

  const handleTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);

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
    } catch (err) {
      console.error(err);
    }
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
            </small>

            <div className="d-flex gap-1 ms-2">
              {sdgs.map((id) => (
                <div
                  key={id}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: `var(--color-ods${id})`,
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
        </div>
      </div>
    </>
  );
}

export default MessageRight;
