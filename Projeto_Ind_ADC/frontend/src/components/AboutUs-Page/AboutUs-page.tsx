import NavBar from "../NavBar/NavBar";
import header from "../../assets/images/about-us-header.png";
import rooted from "../../assets/images/placeholder.png";
import team from "../../assets/images/team.png";
import Footer from "../NavBar/Footer";

function AboutUsPage() {
  return (
    <>
      <NavBar />

      <div className="container py-5">
        <div className="text-center">
          <img
            src={header}
            className=""
            style={{
              maxHeight: "500px",
              width: "50%",
              objectFit: "cover",
            }}
          />
        </div>

        <hr
          className="mx-auto my-5 border-white opacity-100"
          style={{ width: "100%" }}
        />

        <div className="row align-items-center my-5">
          <div className="col-lg-6">
            <h2 className="fw-bold text-white">What is ROOTED?</h2>
            <p className="text-white" style={{ textAlign: "justify" }}>
              ROOTED is a platform that brings people together through community
              activities inspired by the Sustainable Development Goals (SDGs).
              Create and share your own events, tag them with the SDGs they
              support, invite friends, meet new people, and participate in
              meaningful initiatives. As you complete sustainable activities,
              you'll earn points that can be redeemed for profile
              customizations. Together, every event and every action helps
              create a more connected community and a better planet.
            </p>
          </div>

          <div className="col-lg-6 text-center">
            <div className="container">
              <img src={rooted} alt="Section" className="img-fluid rounded" />
            </div>
          </div>
        </div>

        <hr
          className="mx-auto my-5 border-white opacity-100"
          style={{ width: "100%" }}
        />

        <div className="row align-items-center my-5">
          <div className="col-lg-6 text-center order-lg-1 order-2">
            <div className="container">
              <img src={team} alt="Section" className="img-fluid rounded" />
            </div>
          </div>

          <div className="col-lg-6 order-lg-2 order-1 text-lg-end">
            <h2 className="fw-bold text-white">Who we are?</h2>
            <p className="text-white" style={{ textAlign: "justify" }}>
              We are 2Gather, a team of five students from the Faculty of
              Sciences and Technology of NOVA University Lisbon (FCT NOVA). Our
              team consists of Artur Santos, Artur Supelnic, Eduardo Azeitona,
              Gonçalo Guerreiro, and Tomás Silva. Together, we developed ROOTED
              with the goal of encouraging sustainable community engagement and
              promoting the United Nations Sustainable Development Goals (SDGs)
              through technology.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default AboutUsPage;
