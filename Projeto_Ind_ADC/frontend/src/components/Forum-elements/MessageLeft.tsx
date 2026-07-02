import type { MessageProps } from "../../utils/types";

function MessageLeft(texts: MessageProps) {
  const handleTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);

    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${hours}:${minutes}`;
  };

  return (
    <>
      <div className="d-flex justify-content-start text-start mt-2">
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
      <div className="d-flex justify-content-start text-start">
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
        </div>
      </div>
    </>
  );
}

export default MessageLeft;
