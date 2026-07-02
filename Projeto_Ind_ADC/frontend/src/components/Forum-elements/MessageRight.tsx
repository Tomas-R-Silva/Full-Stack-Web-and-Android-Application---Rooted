import type { MessageProps } from "../../utils/types";

function MessageRight(texts: MessageProps) {
  return (
    <>
      <div className="d-flex justify-content-end text-end mt-2">
        {texts.parentPostId && (
          <div
            className="rounded-3 p-3"
            style={{
              maxWidth: "15%",
              width: "fit-content",
              background: "var(--color-green2)",
              color: "var(--color-white)",
              opacity: "50%",
            }}
          >
            <p className="mb-1">{texts.parentText}</p>
            <small>João • 14:25</small>
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
          <small>João • 14:25</small>
        </div>
      </div>
    </>
  );
}

export default MessageRight;
