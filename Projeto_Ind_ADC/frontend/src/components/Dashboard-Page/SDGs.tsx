import { useEffect, useMemo, useState } from "react";
import type {
  ShowUsersResponse,
  User,
  UserInformationResponse,
} from "../../utils/types";
import { getUser, getUsers } from "../../api/auth";
import { sdgInfos } from "../../utils/sdgInfo";

function SDGs() {
  const [users, setUsers] = useState<User[]>([]);
  const [sdgs, setSdgs] = useState(
    Array.from({ length: 17 }, (_, index) => ({
      id: index + 1,
      value: 0,
    })),
  );

  const loadUsers = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      const res: ShowUsersResponse = await getUsers({
        token: { jwt: token },
      });

      setUsers(res.data.users);
    } catch (err) {
      console.error(err);
    }
  };

  const loadUserOds = async (username: string): Promise<number[]> => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.log("User is not authenticated");
        return Array(17).fill(0);
      }

      if (!username) {
        console.log("Invalid username");
        return Array(17).fill(0);
      }

      const res: UserInformationResponse = await getUser({
        token: { jwt: token },
        input: {
          username,
        },
      });

      return res.data.ods ?? Array(17).fill(0);
    } catch (err) {
      console.error(err);
      return Array(17).fill(0);
    }
  };

  const loadAllUserOds = async () => {
    try {
      const totals = Array(17).fill(0);

      const allOds = await Promise.all(
        users.map((user) => loadUserOds(user.username)),
      );

      allOds.forEach((ods) => {
        ods.forEach((value, index) => {
          if (index < 17) {
            totals[index] += value ?? 0;
          }
        });
      });

      const finalSdgs = totals.map((value, index) => ({
        id: index + 1,
        value,
      }));

      setSdgs(finalSdgs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (users.length === 0) return;

    loadAllUserOds();
  }, [users]);

  const maxValue = useMemo(() => {
    return Math.max(...sdgs.map((sdg) => sdg.value), 1);
  }, [sdgs]);

  return (
    <div className="container py-3">
      <h1 className="fw-bold mb-4">SDGs Participations</h1>

      {sdgs.map(({ id, value }) => (
        <div key={id} className="d-flex align-items-center mb-3">
          <img
            src={sdgInfos[id - 1].image}
            alt={`SDG ${id}`}
            style={{
              width: "35px",
              height: "35px",
              objectFit: "cover",
            }}
          />

          <div
            className="progress flex-grow-1 ms-3"
            role="progressbar"
            aria-label={`SDG ${id}`}
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={maxValue}
            style={{
              height: "22px",
              backgroundColor: "rgba(255,255,255,0.15)",
            }}
          >
            <div
              className="progress-bar"
              style={{
                width: `${(value / maxValue) * 100}%`,
                backgroundColor: `var(--color-ods${id})`,
              }}
            />
          </div>

          <span
            className="ms-3"
            style={{
              minWidth: "40px",
              textAlign: "right",
            }}
          >
            {value} Attends
          </span>
        </div>
      ))}
    </div>
  );
}

export default SDGs;
