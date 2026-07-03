import type { MessageProps } from "../../utils/types";
import replyAll from "../../assets/icons/reply_all.svg";

function MessageRight(texts: MessageProps) {
  const handleTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  const handleSetParent = (parentText: string | undefined) => {
    if (parentText) texts.setParentText(parentText);
    if (texts.postId) texts.setParentId(texts.postId);
  };

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
            background: "var(--color-white)",
            color: "var(--color-green2)",
          }}
        >
          <p className="mb-1">{texts.text}</p>

          <small>
            {texts.authorUsername} • {handleTime(texts.createdAt)}
          </small>

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
