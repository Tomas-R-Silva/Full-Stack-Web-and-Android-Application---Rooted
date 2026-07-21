import type {
  RequestModAccount,
  UserInformationResponse,
} from "../../utils/types";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { getUser, modAccount } from "../../api/auth";
import { useNotification } from "../NotificationContext";

function PreferedThemes() {
  const { username } = useAuth();
  const { notify } = useNotification();
  const [user, setUser] = useState<UserInformationResponse>();
  const categories = [
    { value: "MUSIC", label: "🎺 Music" },
    { value: "SPORTS", label: "⚾ Sports" },
    { value: "TECH", label: "💻 Tech" },
    { value: "ART", label: "🎨 Art" },
    { value: "FOOD", label: "🥗 Food" },
    { value: "BUSINESS", label: "💼 Business" },
    { value: "COMMUNITY", label: "🤝 Community" },
    { value: "OTHER", label: "Other" },
  ];
  const [formData, setFormData] = useState<RequestModAccount>({
    token: { jwt: "" },
    input: {
      avatar: "",
      username: username ?? "",
      email: "",
      bio: "",
      country: "",
      birth: 0,
      category: [],
    },
  });

  const handleCategoryChange = (category: string) => {
    setFormData((prev) => {
      const categories = prev.input.category.includes(category)
        ? prev.input.category.filter((c) => c !== category)
        : [...prev.input.category, category];

      return {
        ...prev,
        input: {
          ...prev.input,
          category: categories,
        },
      };
    });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        console.log("User is not authenticated");
        return;
      }

      const payloadMod: RequestModAccount = {
        ...formData,
        token: {
          jwt: token,
        },
      };

      console.log(payloadMod);

      const responseMod = await modAccount(payloadMod);

      console.log(responseMod);
      window.location.reload();
      if (responseMod.status === 200) {
        notify("ACCOUNT_UPDATED");
      }
    } catch (err) {
      console.log("Something went wrong!");
      console.error(err);
    }
  };

  useEffect(() => {
    if (!username) return;
    loadUser(username);
  }, [username]);

  useEffect(() => {
    if (!user) return;

    setFormData((prev) => ({
      ...prev,
      input: {
        ...prev.input,
        avatar: user.data.avatar.url,
        username: user.data.username,
        email: user.data.email ?? "",
        bio: user.data.bio ?? "",
        country: user.data.country ?? "",
        birth: user.data.birth ?? 0,
        category: user.data.category ?? [],
      },
    }));
  }, [user]);

  console.log(formData.input.category);

  return (
    <div className="container">
      <div className="row w-100 justify-content-center">
        <div className="col-12 col-lg-8">
          <h1 className="fw-bold text-white mb-3">Prefered Themes</h1>

          <p className="text-white mb-4">
            View and manage your prefered themes.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row g-2">
              {categories.map(({ value, label }) => (
                <div className="col-6" key={value}>
                  <input
                    type="checkbox"
                    className="btn-check"
                    id={`btn-${value}`}
                    checked={formData.input.category.includes(value)}
                    onChange={() => handleCategoryChange(value)}
                    autoComplete="off"
                  />

                  <label
                    className="btn w-100"
                    htmlFor={`btn-${value}`}
                    style={{
                      background: formData.input.category.includes(value)
                        ? "var(--color-green2)"
                        : "var(--color-white)",
                      color: formData.input.category.includes(value)
                        ? "var(--color-white)"
                        : "var(--color-green2)",
                    }}
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <button
                type="submit"
                className="btn text-white w-100"
                style={{ background: "var(--color-green2)" }}
              >
                Save preferred themes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PreferedThemes;
