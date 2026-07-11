import { bordersItems } from "../../utils/borders";
import { useState } from "react";

function AccountRewards() {
  const [selectedBorder, setSelectedBorder] = useState<string>("");
  return (
    <>
      <div className="container">
        <div className="row w-100 justify-content-center">
          <div className="col-12 col-lg-8">
            <h1 className="fw-bold text-white mb-3">Claimed Rewards</h1>
            <p className="text-white mb-4">
              View and manage your account claimed rewards.
            </p>

            <h5 className="text-white">Borders:</h5>

            <div className="row g-4">
              {bordersItems.map((border) => (
                <div key={border.id} className="col-12 col-sm-6 col-md-4">
                  <div
                    className="card h-100 text-center shadow-sm"
                    style={{
                      cursor: "pointer",
                      transition: "0.2s",

                      backgroundColor:
                        10 / border.value === 1
                          ? "rgba(255, 255, 255, 1)"
                          : "rgba(255, 255, 255, 0.5)",
                    }}
                    onClick={() => setSelectedBorder(border.id)}
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
                      >
                        <div
                          className="progress-bar"
                          style={{
                            width: `${(10 / border.value) * 100}%`,
                            backgroundColor: `var(--color-green2)`,
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
                        10 of {border.value} {border.valueType}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccountRewards;
