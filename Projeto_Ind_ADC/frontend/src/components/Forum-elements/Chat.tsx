import type {
  EventProps,
  RequestListMessages,
  ListMessagesResponse,
  Post,
} from "../../utils/types";
import type {
  RequestPostMessage,
  PostMessageResponse,
} from "../../utils/types";
import MessageRight from "./MessageRight";
import MessageLeft from "./MessageLeft";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { ListMessages } from "../../api/auth";
import close from "../../assets/icons/close_white.svg";
import { PostMessage } from "../../api/auth";
import { useNotification } from "../NotificationContext";

function Chat({ event }: EventProps) {
  const { isAuthenticated, username } = useAuth();
  const [messages, setMessages] = useState<Post[]>([]); //Events got from the request
  const [nextCursor, setNextCursor] = useState<string | undefined>(); //string means there is cursos to next page, undifined means there is no cursor
  const [loading, setLoading] = useState(false); //if the main page is being loaded
  const [loadingMore, setLoadingMore] = useState(false); //if all the events are being loaded
  const [error, setError] = useState<string | null>(null);
  const { notify } = useNotification();
  const [parentId, setParentId] = useState("");
  const [parentText, setParentText] = useState("");
  const [post, setPost] = useState("");

  const loadEventChat = async (eventId?: string, cursor?: string) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null); //reset errors

      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      if (!eventId) {
        console.log("Wrong eventId");
        return;
      }

      const res: ListMessagesResponse = await ListMessages({
        token: {
          jwt: token,
        },
        input: {
          id: eventId,
          type: "EVENT",
          pageSize: 50,
          cursor: "",
        },
      });

      console.log(res);

      if (cursor) {
        setMessages((prev) => [...prev, ...res.data.posts]); //carregar mais => anteriores mais todos os restantes
      } else {
        setMessages(res.data.posts);
      }

      setNextCursor(res.data.nextCursor);
    } catch (err) {
      console.error(err);
      setError("Could not load the events.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleParentText = (parentPostId: string): string | undefined => {
    const parent = messages.find((msg) => msg.postId === parentPostId);
    return parent?.text;
  };

  const handleCleanParentText = () => {
    setParentText("");
  };

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }
      const payload: RequestPostMessage = {
        token: {
          jwt: token,
        },
        input: {
          id: event.eventId,
          type: "EVENT",
          text: post,
          parentPostId: parentId,
        },
      };
      console.log(payload);
      const response = await PostMessage(payload);
      console.log(response);
      window.location.reload();
      if (response.status === 200) {
        notify("MESSAGE_POSTED");
      }
    } catch (err) {
      console.log("Something went wrong!");
    }
  };

  useEffect(() => {
    loadEventChat(event.eventId);
  }, [event.eventId]);

  return (
    <>
      <div className="container">
        <div
          className="container border rounded p-3"
          style={{
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          {messages.length === 0 && (
            <span className="text-white">Be the first one chatting...</span>
          )}
          {messages.map((msg) => {
            if (isAuthenticated && username === msg.authorUsername) {
              return (
                <MessageRight
                  key={msg.postId}
                  text={msg.text}
                  parentText={
                    msg.parentPostId
                      ? handleParentText(msg.parentPostId)
                      : undefined
                  }
                  postId={msg.postId}
                  authorUsername={msg.authorUsername}
                  eventOrganizer={event.organizerUsername}
                  createdAt={msg.createdAt}
                  setParentId={setParentId}
                  setParentText={setParentText}
                />
              );
            }

            return (
              <MessageLeft
                key={msg.postId}
                text={msg.text}
                parentText={
                  msg.parentPostId
                    ? handleParentText(msg.parentPostId)
                    : undefined
                }
                postId={msg.postId}
                authorUsername={msg.authorUsername}
                eventOrganizer={event.organizerUsername}
                createdAt={msg.createdAt}
                setParentId={setParentId}
                setParentText={setParentText}
              />
            );
          })}
        </div>
        {parentText !== "" && (
          <div className="d-flex justify-content-end text-end mt-2">
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
              <p className="mb-1">{parentText}</p>
              <img
                className=""
                src={close}
                onClick={() => handleCleanParentText()}
                style={{ cursor: "pointer" }}
              />
            </div>
          </div>
        )}
        <textarea
          className="w-100 mt-3"
          rows={3}
          placeholder="Write your message here..."
          style={{
            resize: "none",
            textAlign: "right",
            padding: "12px 20px",
          }}
          onChange={(e) => setPost(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handlePostMessage(e);
            }
          }}
        ></textarea>
      </div>
    </>
  );
}

export default Chat;
