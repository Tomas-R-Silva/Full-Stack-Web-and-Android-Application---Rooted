import NavBar from "../NavBar/NavBar";
import { useState } from "react";
import profileBG from "../../assets/images/profile_bg.png";

function FaqPage() {
  type FAQItem = {
    question: string;
    answer: string;
  };

  const faqItems: FAQItem[] = [
    {
      question: "Q: What is ROOTED?",
      answer:
        "A: This service helps users find clear answers to common questions quickly and easily.",
    },
    {
      question: "Q: How do I create an account?",
      answer:
        "A: You can create an account by clicking the sign up button and filling in your details.",
    },
    {
      question: "Q: Can I change my password?",
      answer:
        "A: Yes. Go to your account settings and choose the option to change your password.",
    },
    {
      question: "Q: How can I create an event?",
      answer:
        "A: We take data protection seriously and use standard security practices to help keep your information safe.",
    },
    {
      question: "Q: How much ODS must be associated with an event?",
      answer:
        "A: You can contact support through the contact form or by sending us an email.",
    },
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <div style={{ background: "var(--color-bege)" }}>
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundImage: `url(${profileBG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "filter 0.2s",
            zIndex: -1,
          }}
        />
        <NavBar />
        <div
          className="d-flex justify-content-center pt-5"
          style={{ minHeight: "100vh", background: "transparent" }}
        >
          <div
            className="container"
            style={{
              maxWidth: "1000px",
              width: "100%",
              margin: "0 auto",
            }}
          >
            <h1 className="mb-3">Frequently Asked Questions</h1>

            <p className="faq-intro mb-5">
              Here you can find answers to the most common questions. Click on a
              question to reveal more information.
            </p>

            <div className="faq-list">
              {faqItems.map((item, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    className="row mt-4"
                    style={{
                      padding: "5px",
                      border: "2px solid var(--color-green)",
                      borderRadius: "16px",
                      backgroundColor: "var(--color-white)",
                    }}
                    key={index}
                    onClick={() => toggleFAQ(index)}
                    aria-expanded={isOpen}
                  >
                    {" "}
                    <span className="fw-bold" style={{ fontSize: 18 }}>
                      {item.question}
                    </span>
                    {isOpen && (
                      <div className="faq-answer">
                        <p>{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FaqPage;
