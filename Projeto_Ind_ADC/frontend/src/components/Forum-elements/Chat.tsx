import type {
  EventProps,
  RequestListMessages,
  ListMessagesResponse,
  Post,
} from "../../utils/types";
import MessageRight from "./MessageRight";
import MessageLeft from "./MessageLeft";
import { useAuth } from "../AuthContext";
import { useEffect, useState } from "react";
import { ListMessages } from "../../api/auth";

function Chat({ event }: EventProps) {
  const { isAuthenticated, username } = useAuth();
  const [messages, setMessages] = useState<Post[]>([]); //Events got from the request
  const [nextCursor, setNextCursor] = useState<string | undefined>(); //string means there is cursos to next page, undifined means there is no cursor
  const [loading, setLoading] = useState(false); //if the main page is being loaded
  const [loadingMore, setLoadingMore] = useState(false); //if all the events are being loaded
  const [error, setError] = useState<string | null>(null);

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
        eventId: eventId,
        pageSize: 50,
        cursor: "",
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

  useEffect(() => {
    loadEventChat(event.eventId);
  }, [event.eventId]);

  return (
    <>
      <div className="container">
        {messages.map((msg, i) => {
          if (isAuthenticated && username === msg.authorUsername) {
            return (
              <MessageRight
                key={i}
                text={msg.text}
                parentText=""
                parentPostId={
                  msg.parentPostId
                    ? "Sabes que autocarro tenho de apanhar?"
                    : undefined
                }
              />
            );
          }

          return (
            <MessageLeft
              key={i}
              text={msg.text}
              parentText=""
              parentPostId={
                msg.parentPostId
                  ? "Sabes que autocarro tenho de apanhar?"
                  : undefined
              }
            />
          );
        })}
      </div>
    </>
  );
}

export default Chat;
