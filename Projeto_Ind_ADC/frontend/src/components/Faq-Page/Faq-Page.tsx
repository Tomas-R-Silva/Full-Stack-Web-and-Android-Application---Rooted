import NavBar from "../NavBar/NavBar";
import { useState } from "react";

function FaqPage() {
  type FAQItem = {
    question: string;
    answer: string;
  };

  const faqItems: FAQItem[] = [
    {
      question: "Q: What is ROOTED?",
      answer:
        "A: It is an app where you can find community activities related to the Sustainable Development Goals (SDGs).",
    },
    {
      question: "Q: How do I create an account?",
      answer:
        "A: Click the Sign Up button and fill in your details to create an account.",
    },
    {
      question: "Q: Can I change my password?",
      answer:
        "A: Yes. Go to your Profile page → Personal Information → Change Password.",
    },
    {
      question: "Q: How can I create an event?",
      answer:
        "A: Log in, go to the Events page, and click the Create Event button in the top-right corner.",
    },
    {
      question: "Q: How many SDGs must be associated with an event?",
      answer: "A: At least one.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <div
        style={{
          background: "var(--color-green)",
          minHeight: "100vh",
        }}
      >
        <NavBar />
        <h1
          className="fw-bold text-center mt-5 mb-3"
          style={{ color: "var(--color-white)" }}
        >
          Frequently Asked Questions
        </h1>

        <p className="text-center mb-5" style={{ color: "var(--color-white)" }}>
          Find quick answers to the most common questions about ROOTED.
        </p>

        <div className="container " style={{ maxWidth: "900px" }}>
          <div
            className="rounded-4 shadow-lg p-5"
            style={{
              background: "var(--color-green2)",
            }}
          >
            {faqItems.map((item, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className="mb-3 rounded-4"
                  style={{
                    border: "2px solid var(--color-white)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    className="w-100 d-flex justify-content-between align-items-center border-0 px-4 py-3"
                    style={{
                      background: "var(--color-green2)",
                      color: "var(--color-white)",
                    }}
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="fw-bold fs-5">{item.question}</span>

                    <span
                      style={{
                        fontSize: "24px",
                        transition: "transform 0.3s",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    >
                      ▼
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      className="px-4 py-3"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        borderTop: "1px solid rgba(255,255,255,0.2)",
                        color: "var(--color-white)",
                      }}
                    >
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default FaqPage;
