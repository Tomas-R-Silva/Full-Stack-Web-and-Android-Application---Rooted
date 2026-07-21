import {
  borderAll,
  bordersPoints,
  bordersSDG,
  getBorderItem,
} from "../../utils/borders";
import type {
  ChangeBorderResponse,
  UserInformationResponse,
} from "../../utils/types";
import { changeBorder, getUser } from "../../api/auth";
import { useNotification } from "../NotificationContext";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import account_circle_w from "../../assets/icons/account_circle_w.svg";
import verified from "../../assets/icons/verified_w.svg";

function AccountRewards() {
  const { notify } = useNotification();
  const { username } = useAuth();
  const [user, setUser] = useState<UserInformationResponse>();
  const [sdgs, setSdgs] = useState<{ id: number; value: number }[]>([]);

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
    if (!username) return;
    loadUser(username);
  }, [username]);

  const handleChangeBorder = async (borderID: string) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      const res: ChangeBorderResponse = await changeBorder({
        token: { jwt: token },
        input: { borderID: borderID },
      });
      console.log(res.data.message);
      window.location.reload();
      if (res.status === 200) {
        notify("BORDER_CHANGED");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">Claimed Rewards</h1>
            <p className="text-white mb-4">
              View and manage your account claimed rewards.
            </p>

            <h5 className="text-white mt-4">Preview:</h5>

            <div
              className="rounded-3 px-3 py-3 d-flex align-items-center justify-content-between"
              style={{ background: "var(--color-green2)" }}
            >
              <div
                style={{
                  position: "relative",
                  width: "80px",
                  height: "80px",
                  flexShrink: 0,
                }}
              >
                <img
                  src={user?.data.avatar.url ?? account_circle_w}
                  alt="Avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />

                {user && user.data.borderID && (
                  <img
                    src={getBorderItem(user.data.borderID)?.image}
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

              <div className="flex-grow-1 ms-3">
                <div className="d-flex align-items-center gap-2">
                  <h5
                    className="mb-0 fw-bold"
                    style={{ color: "var(--color-white)" }}
                  >
                    {user?.data.username || "Deleted account"}
                    {user?.data.role === "PARTNER" && (
                      <img className="ms-1" src={verified} />
                    )}
                  </h5>
                  <div className="d-flex gap-1 ms-3">
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

                <small
                  style={{
                    color: "var(--color-white)",
                  }}
                >
                  {user?.data.email || "Deleted account"}
                </small>
              </div>
            </div>

            <div className="d-flex align-items-center gap-2 mt-4">
              <h5 className="text-white mb-0">Points:</h5>
              <span className="text-white">{user?.data.points} points</span>
            </div>

            <h5 className="text-white mt-4">SDG Borders:</h5>

            <div className="row g-4">
              {user &&
                bordersSDG.map((border) => {
                  const currentValue = user.data.ods[border.idType - 1] ?? 0;
                  const progress = currentValue / border.value;
                  const canClick = progress >= 1;

                  return (
                    <div key={border.id} className="col-12 col-sm-6 col-md-4">
                      <div
                        className="card h-100 text-center shadow-sm"
                        style={{
                          cursor: canClick ? "pointer" : "not-allowed",
                          transition: "0.2s",
                          backgroundColor: canClick
                            ? "rgba(255, 255, 255, 1)"
                            : "rgba(255, 255, 255, 0.5)",
                        }}
                        onClick={() => {
                          if (!canClick) return;

                          handleChangeBorder(border.id);
                        }}
                      >
                        <div
                          className="card-header"
                          style={{
                            background: "var(--color-green2)",
                          }}
                        >
                          <h6 className="card-title mt-1 text-white">
                            {border.name}
                          </h6>
                        </div>

                        <img
                          src={border.image}
                          alt={border.name}
                          className="card-img-top p-3"
                          style={{
                            height: "120px",
                            width: "100%",
                            objectFit: "contain",
                          }}
                        />

                        <div className="card-body">
                          <div
                            className="progress flex-grow-1"
                            role="progressbar"
                            aria-label={`Border ${border.id}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={Math.min(progress * 100, 100)}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${Math.min(progress * 100, 100)}%`,
                                backgroundColor: "var(--color-green2)",
                              }}
                            />
                          </div>

                          <div
                            className="mt-2"
                            style={{
                              fontSize: "12px",
                              color: "var(--color-green2)",
                            }}
                          >
                            {String(currentValue)} of {border.value}:{" "}
                            {border.valueType}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <h5 className="text-white mt-4">Special All SDG Border:</h5>

            <div className="row g-4">
              {user &&
                borderAll.map((border) => {
                  const differentSDGsParticipated = user.data.ods.filter(
                    (value) => value !== 0,
                  ).length;

                  const progress = differentSDGsParticipated / border.value;
                  const progressPercentage = Math.min(progress * 100, 100);
                  const canClick = differentSDGsParticipated >= border.value;

                  return (
                    <div key={border.id} className="col-12 col-sm-6 col-md-4">
                      <div
                        className="card h-100 text-center shadow-sm"
                        style={{
                          cursor: canClick ? "pointer" : "not-allowed",
                          transition: "0.2s",
                          backgroundColor: canClick
                            ? "rgba(255, 255, 255, 1)"
                            : "rgba(255, 255, 255, 0.5)",
                        }}
                        onClick={() => {
                          if (!canClick) return;

                          handleChangeBorder(border.id);
                        }}
                      >
                        <div
                          className="card-header"
                          style={{
                            background: "var(--color-green2)",
                          }}
                        >
                          <h6 className="card-title mt-1 text-white">
                            {border.name}
                          </h6>
                        </div>

                        <img
                          src={border.image}
                          alt={border.name}
                          className="card-img-top p-3"
                          style={{
                            height: "120px",
                            width: "100%",
                            objectFit: "contain",
                          }}
                        />

                        <div className="card-body">
                          <div
                            className="progress flex-grow-1"
                            role="progressbar"
                            aria-label={`Border ${border.id}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progressPercentage}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${progressPercentage}%`,
                                backgroundColor: "var(--color-green2)",
                              }}
                            />
                          </div>

                          <div
                            className="mt-2"
                            style={{
                              fontSize: "12px",
                              color: "var(--color-green2)",
                            }}
                          >
                            {differentSDGsParticipated} of {border.value}:{" "}
                            {border.valueType}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            <h5 className="text-white mt-4">Points Borders:</h5>

            <div className="row g-4">
              {user &&
                bordersPoints.map((border) => {
                  const currentPoints = user.data.points ?? 0;
                  const progress = currentPoints / border.value;
                  const progressPercentage = Math.min(progress * 100, 100);
                  const canClick = currentPoints >= border.value;

                  return (
                    <div key={border.id} className="col-12 col-sm-6 col-md-4">
                      <div
                        className="card h-100 text-center shadow-sm"
                        style={{
                          cursor: canClick ? "pointer" : "not-allowed",
                          transition: "0.2s",
                          backgroundColor: canClick
                            ? "rgba(255, 255, 255, 1)"
                            : "rgba(255, 255, 255, 0.5)",
                        }}
                        onClick={() => {
                          if (!canClick) return;

                          handleChangeBorder(border.id);
                        }}
                      >
                        <div
                          className="card-header"
                          style={{
                            background: "var(--color-green2)",
                          }}
                        >
                          <h6 className="card-title mt-1 text-white">
                            {border.name}
                          </h6>
                        </div>

                        <img
                          src={border.image}
                          alt={border.name}
                          className="card-img-top p-3"
                          style={{
                            height: "120px",
                            width: "100%",
                            objectFit: "contain",
                          }}
                        />

                        <div className="card-body">
                          <div
                            className="progress flex-grow-1"
                            role="progressbar"
                            aria-label={`Border ${border.id}`}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-valuenow={progressPercentage}
                          >
                            <div
                              className="progress-bar"
                              style={{
                                width: `${progressPercentage}%`,
                                backgroundColor: "var(--color-green2)",
                              }}
                            />
                          </div>

                          <div
                            className="mt-2"
                            style={{
                              fontSize: "12px",
                              color: "var(--color-green2)",
                            }}
                          >
                            {String(currentPoints)} of {border.value}:{" "}
                            {border.valueType}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              <div className="mt-4">
                <button
                  className="btn btn-outline-light"
                  style={{ background: "var(--color-green2" }}
                  onClick={() => handleChangeBorder("")}
                >
                  Remove Current Border
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountRewards;
